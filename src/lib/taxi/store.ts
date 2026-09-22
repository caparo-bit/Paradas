import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uid } from "@/lib/utils";
import type {
  CheckIn,
  Espera,
  FloatPos,
  Gasto,
  GastoTipo,
  Jornada,
  Pago,
  Servicio,
  TaxiStatus,
  ViewId,
} from "./types";

export interface TaxiState {
  hydrated: boolean;
  view: ViewId;
  callsign: string;
  plate: string;
  status: TaxiStatus;
  services: Servicio[];
  gastos: Gasto[];
  jornadas: Jornada[];
  jornadaActivaId: string | null;
  checkIn: CheckIn | null;
  esperas: Espera[];
  floatPos: FloatPos;
  floatOpen: boolean;
  selectedParadaId: string | null;
  setHydrated: () => void;
  setView: (view: ViewId) => void;
  setProfile: (callsign: string, plate: string) => void;
  setStatus: (status: TaxiStatus) => void;
  setSelectedParada: (id: string | null) => void;
  checkInAt: (paradaId: string) => void;
  updateCheckIn: (patch: Partial<Pick<CheckIn, "offsetSec" | "notas">>) => void;
  checkOut: () => void;
  setFloatPos: (pos: FloatPos) => void;
  setFloatOpen: (open: boolean) => void;
  addServicio: (s: Omit<Servicio, "id" | "at"> & { at?: number }) => void;
  removeServicio: (id: string) => void;
  startJornada: (opts?: { kmInicio?: number; notas?: string }) => void;
  endJornada: (opts?: { kmFin?: number; notas?: string }) => void;
  addGasto: (g: Omit<Gasto, "id" | "at" | "jornadaId"> & { at?: number }) => void;
  removeGasto: (id: string) => void;
}

function closeEspera(checkIn: CheckIn): Espera {
  const endedAt = Date.now();
  const seconds = Math.max(0, Math.round((endedAt - checkIn.startedAt) / 1000 + checkIn.offsetSec));
  return {
    id: uid("esp"),
    paradaId: checkIn.paradaId,
    startedAt: checkIn.startedAt,
    endedAt,
    seconds,
  };
}

export const useTaxiStore = create<TaxiState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      view: "home",
      callsign: "TX-0000",
      plate: "",
      status: "libre",
      services: [],
      gastos: [],
      jornadas: [],
      jornadaActivaId: null,
      checkIn: null,
      esperas: [],
      floatPos: { x: 16, y: 72 },
      floatOpen: true,
      selectedParadaId: null,
      setHydrated: () => set({ hydrated: true }),
      setView: (view) => set({ view }),
      setProfile: (callsign, plate) => set({ callsign: callsign.trim() || get().callsign, plate: plate.trim() }),
      setStatus: (status) => set({ status }),
      setSelectedParada: (id) => set({ selectedParadaId: id }),
      checkInAt: (paradaId) => {
        const prev = get().checkIn;
        const esperas = prev ? [...get().esperas, closeEspera(prev)] : get().esperas;
        set({
          checkIn: { paradaId, startedAt: Date.now(), offsetSec: 0, notas: "" },
          selectedParadaId: paradaId,
          status: "en_parada",
          floatOpen: true,
          esperas,
        });
      },
      updateCheckIn: (patch) => {
        const cur = get().checkIn;
        if (!cur) return;
        set({ checkIn: { ...cur, ...patch } });
      },
      checkOut: () => {
        const prev = get().checkIn;
        if (!prev) return;
        set({
          checkIn: null,
          status: "libre",
          esperas: [...get().esperas, closeEspera(prev)],
        });
      },
      setFloatPos: (floatPos) => set({ floatPos }),
      setFloatOpen: (floatOpen) => set({ floatOpen }),
      addServicio: (s) => {
        const servicio: Servicio = {
          id: uid("srv"),
          at: s.at ?? Date.now(),
          origen: s.origen,
          destino: s.destino,
          importe: s.importe,
          propina: s.propina,
          pago: s.pago,
          minutos: s.minutos,
          pasajeros: s.pasajeros,
          notas: s.notas,
          paradaId: s.paradaId,
          jornadaId: get().jornadaActivaId ?? undefined,
        };
        const prev = get().checkIn;
        const esperas = prev ? [...get().esperas, closeEspera(prev)] : get().esperas;
        set({
          services: [servicio, ...get().services],
          checkIn: null,
          status: "ocupado",
          esperas,
        });
      },
      removeServicio: (id) => set({ services: get().services.filter((s) => s.id !== id) }),
      startJornada: (opts) => {
        const id = uid("jor");
        const jornada: Jornada = {
          id,
          startedAt: Date.now(),
          notas: opts?.notas ?? "",
          kmInicio: opts?.kmInicio,
        };
        set({ jornadas: [jornada, ...get().jornadas], jornadaActivaId: id, status: "libre" });
      },
      endJornada: (opts) => {
        const id = get().jornadaActivaId;
        if (!id) return;
        const prev = get().checkIn;
        const esperas = prev ? [...get().esperas, closeEspera(prev)] : get().esperas;
        set({
          jornadas: get().jornadas.map((j) =>
            j.id === id
              ? { ...j, endedAt: Date.now(), kmFin: opts?.kmFin ?? j.kmFin, notas: opts?.notas ?? j.notas }
              : j,
          ),
          jornadaActivaId: null,
          checkIn: null,
          status: "libre",
          esperas,
        });
      },
      addGasto: (g) => {
        const gasto: Gasto = {
          id: uid("gst"),
          at: g.at ?? Date.now(),
          tipo: g.tipo as GastoTipo,
          importe: g.importe,
          litros: g.litros,
          precioLitro: g.precioLitro,
          notas: g.notas,
          jornadaId: get().jornadaActivaId ?? undefined,
        };
        set({ gastos: [gasto, ...get().gastos] });
      },
      removeGasto: (id) => set({ gastos: get().gastos.filter((g) => g.id !== id) }),
    }),
    {
      name: "paradamaya-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        callsign: s.callsign,
        plate: s.plate,
        status: s.status,
        services: s.services,
        gastos: s.gastos,
        jornadas: s.jornadas,
        jornadaActivaId: s.jornadaActivaId,
        checkIn: s.checkIn,
        esperas: s.esperas,
        floatPos: s.floatPos,
        floatOpen: s.floatOpen,
        selectedParadaId: s.selectedParadaId,
      }),
    },
  ),
);

export function waitSeconds(checkIn: CheckIn, now = Date.now()): number {
  return Math.max(0, Math.round((now - checkIn.startedAt) / 1000 + checkIn.offsetSec));
}

export type { Pago };
