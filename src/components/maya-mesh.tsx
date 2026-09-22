import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useP2PRoom, type PeerInfo } from "@/lib/multiplayer";
import { useTaxiStore, waitSeconds } from "@/lib/taxi/store";
import type { PeerPresence, TaxiStatus } from "@/lib/taxi/types";

export interface RadioLine {
  id: string;
  from: string;
  name: string;
  text: string;
  at: number;
  self?: boolean;
}

interface MayaValue {
  selfId: string;
  joined: boolean;
  peers: PeerInfo[];
  presence: PeerPresence[];
  occupancy: Map<string, PeerPresence[]>;
  radio: RadioLine[];
  sendRadio: (text: string) => void;
}

const emptyMaya: MayaValue = {
  selfId: "",
  joined: false,
  peers: [],
  presence: [],
  occupancy: new Map(),
  radio: [],
  sendRadio: () => {},
};

const MayaContext = createContext<MayaValue>(emptyMaya);

export function useMaya(): MayaValue {
  return useContext(MayaContext);
}

interface PresenceWire {
  t: "pres";
  name: string;
  plate: string;
  status: TaxiStatus;
  paradaId: string | null;
  lat: number | null;
  lng: number | null;
  waitSec: number | null;
}

interface RadioWire {
  t: "radio";
  text: string;
  at: number;
  name: string;
}

export function MayaMesh({
  children,
  lat,
  lng,
}: {
  children: ReactNode;
  lat: number | null;
  lng: number | null;
}) {
  const callsign = useTaxiStore((s) => s.callsign);
  const plate = useTaxiStore((s) => s.plate);
  const status = useTaxiStore((s) => s.status);
  const checkIn = useTaxiStore((s) => s.checkIn);
  const p2p = useP2PRoom({ room: "maya-cam", name: callsign });
  const [presenceMap, setPresenceMap] = useState<Record<string, PeerPresence>>({});
  const [radio, setRadio] = useState<RadioLine[]>([]);
  const locRef = useRef({ lat, lng, status, checkIn, callsign, plate });
  locRef.current = { lat, lng, status, checkIn, callsign, plate };

  useEffect(
    () =>
      p2p.onMessage((from, data) => {
        if (!data || typeof data !== "object") return;
        const msg = data as PresenceWire | RadioWire;
        if (msg.t === "pres") {
          setPresenceMap((prev) => ({
            ...prev,
            [from]: {
              id: from,
              name: msg.name,
              plate: msg.plate,
              status: msg.status,
              paradaId: msg.paradaId,
              lat: msg.lat,
              lng: msg.lng,
              waitSec: msg.waitSec,
              updatedAt: Date.now(),
            },
          }));
        } else if (msg.t === "radio" && msg.text) {
          setRadio((prev) =>
            [
              ...prev,
              { id: `${from}-${msg.at}`, from, name: msg.name, text: msg.text, at: msg.at },
            ].slice(-80),
          );
        }
      }),
    [p2p.onMessage],
  );

  useEffect(() => {
    const alive = new Set(p2p.peers.map((p) => p.id));
    setPresenceMap((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        if (!alive.has(id)) delete next[id];
      }
      return next;
    });
  }, [p2p.peers]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const cur = locRef.current;
      const payload: PresenceWire = {
        t: "pres",
        name: cur.callsign,
        plate: cur.plate,
        status: cur.status,
        paradaId: cur.checkIn?.paradaId ?? null,
        lat: cur.lat,
        lng: cur.lng,
        waitSec: cur.checkIn ? waitSeconds(cur.checkIn) : null,
      };
      p2p.broadcast(payload);
    }, 1200);
    return () => window.clearInterval(id);
  }, [p2p.broadcast]);

  const presence = useMemo(() => Object.values(presenceMap), [presenceMap]);

  const occupancy = useMemo(() => {
    const map = new Map<string, PeerPresence[]>();
    for (const p of presence) {
      if (!p.paradaId) continue;
      const list = map.get(p.paradaId) ?? [];
      list.push(p);
      map.set(p.paradaId, list);
    }
    return map;
  }, [presence]);

  const sendRadio = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const at = Date.now();
    const wire: RadioWire = { t: "radio", text: trimmed, at, name: callsign };
    p2p.send(wire);
    setRadio((prev) =>
      [...prev, { id: `self-${at}`, from: p2p.selfId, name: callsign, text: trimmed, at, self: true }].slice(
        -80,
      ),
    );
  };

  const value: MayaValue = {
    selfId: p2p.selfId,
    joined: p2p.joined,
    peers: p2p.peers,
    presence,
    occupancy,
    radio,
    sendRadio,
  };

  return <MayaContext.Provider value={value}>{children}</MayaContext.Provider>;
}
