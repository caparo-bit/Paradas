import { List, LocateFixed, Map as MapIcon, Search, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDistance, haversineMeters } from "@/lib/taxi/geo";
import { DISTRITOS_MADRID, MUNICIPIOS, PARADAS, getParada } from "@/lib/taxi/paradas";
import { useTaxiStore } from "@/lib/taxi/store";
import type { Parada } from "@/lib/taxi/types";
import { useMaya } from "./maya-mesh";
import { TaxiMap } from "./taxi-map";

interface Props {
  user: { lat: number; lng: number } | null;
  locError: string | null;
  onLocate: () => void;
}

export function ParadasView({ user, locError, onLocate }: Props) {
  const selectedId = useTaxiStore((s) => s.selectedParadaId);
  const setSelected = useTaxiStore((s) => s.setSelectedParada);
  const checkInAt = useTaxiStore((s) => s.checkInAt);
  const checkIn = useTaxiStore((s) => s.checkIn);
  const checkOut = useTaxiStore((s) => s.checkOut);
  const maya = useMaya();
  const [q, setQ] = useState("");
  const [muni, setMuni] = useState("Todos");
  const [mode, setMode] = useState<"map" | "list">("map");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = PARADAS;
    if (muni !== "Todos") {
      if (muni.startsWith("d:")) {
        const d = muni.slice(2);
        list = list.filter((p) => p.municipio === "Madrid" && p.distrito === d);
      } else {
        list = list.filter((p) => p.municipio === muni);
      }
    }
    if (query) {
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.barrio.toLowerCase().includes(query) ||
          p.distrito.toLowerCase().includes(query) ||
          p.municipio.toLowerCase().includes(query),
      );
    }
    if (user) {
      list = [...list].sort(
        (a, b) =>
          haversineMeters(user.lat, user.lng, a.lat, a.lng) - haversineMeters(user.lat, user.lng, b.lat, b.lng),
      );
    }
    return list;
  }, [q, muni, user]);

  const selected = getParada(selectedId) ?? null;
  const listSlice = filtered.slice(0, 60);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar calle, barrio, municipio"
            className="pl-9"
            aria-label="Buscar paradas"
          />
        </div>
        <Button
          variant={mode === "map" ? "default" : "secondary"}
          size="icon"
          aria-label="Mapa"
          onClick={() => setMode("map")}
        >
          <MapIcon />
        </Button>
        <Button
          variant={mode === "list" ? "default" : "secondary"}
          size="icon"
          aria-label="Lista"
          onClick={() => setMode("list")}
        >
          <List />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={muni === "Todos"} onClick={() => setMuni("Todos")}>
          Toda la CAM
        </FilterChip>
        {["Madrid", "Alcalá de Henares", "Móstoles", "Fuenlabrada", "Leganés", "Getafe", "Alcorcón"].map((m) => (
          <FilterChip key={m} active={muni === m} onClick={() => setMuni(m)}>
            {m}
          </FilterChip>
        ))}
        {DISTRITOS_MADRID.slice(0, 8).map((d) => (
          <FilterChip key={d} active={muni === `d:${d}`} onClick={() => setMuni(`d:${d}`)}>
            {d}
          </FilterChip>
        ))}
        {MUNICIPIOS.filter((m) => m !== "Madrid")
          .slice(7, 20)
          .map((m) => (
            <FilterChip key={m} active={muni === m} onClick={() => setMuni(m)}>
              {m}
            </FilterChip>
          ))}
      </div>

      {mode === "map" ? (
        <div className="relative min-h-[22rem] flex-1 overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--color-line)]">
          <TaxiMap
            paradas={PARADAS}
            selectedId={selectedId}
            user={user}
            occupancy={maya.occupancy}
            onSelect={setSelected}
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 left-3 z-[400]"
            onClick={onLocate}
            aria-label="Mi ubicación"
          >
            <LocateFixed />
          </Button>
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4">
          {listSlice.map((p) => (
            <ParadaRow
              key={p.id}
              parada={p}
              user={user}
              occ={maya.occupancy.get(p.id)?.length ?? 0}
              active={p.id === selectedId}
              onClick={() => setSelected(p.id)}
            />
          ))}
          {filtered.length > listSlice.length ? (
            <li className="py-2 text-center text-xs text-subtle">
              {filtered.length - listSlice.length} paradas más. Ajusta la búsqueda.
            </li>
          ) : null}
          {filtered.length === 0 ? (
            <li className="py-10 text-center text-sm text-muted">Ninguna parada coincide.</li>
          ) : null}
        </ul>
      )}

      {locError ? <p className="text-xs text-off">{locError}</p> : null}

      {selected ? (
        <StandSheet
          parada={selected}
          user={user}
          occupying={maya.occupancy.get(selected.id) ?? []}
          checkedHere={checkIn?.paradaId === selected.id}
          onClose={() => setSelected(null)}
          onCheckIn={() => checkInAt(selected.id)}
          onCheckOut={checkOut}
        />
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-9 shrink-0 rounded-full bg-brand px-3 text-xs font-medium text-brand-fg"
          : "h-9 shrink-0 rounded-full bg-elevated px-3 text-xs text-muted shadow-[0_0_0_1px_var(--color-line)]"
      }
    >
      {children}
    </button>
  );
}

function ParadaRow({
  parada,
  user,
  occ,
  active,
  onClick,
}: {
  parada: Parada;
  user: { lat: number; lng: number } | null;
  occ: number;
  active: boolean;
  onClick: () => void;
}) {
  const meters = user ? haversineMeters(user.lat, user.lng, parada.lat, parada.lng) : null;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={
          "flex w-full items-start gap-3 rounded-xl p-3 text-left shadow-[0_0_0_1px_var(--color-line)] " +
          (active ? "bg-elevated" : "bg-surface")
        }
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium">{parada.nombre}</p>
          <p className="text-xs text-muted">
            {parada.municipio} · {parada.distrito} · {parada.plazas} plazas
          </p>
        </div>
        <div className="text-right">
          {meters != null ? <p className="tabular text-xs text-muted">{formatDistance(meters)}</p> : null}
          {occ > 0 ? <Badge variant="wait">{occ} Maya</Badge> : null}
        </div>
      </button>
    </li>
  );
}

function StandSheet({
  parada,
  user,
  occupying,
  checkedHere,
  onClose,
  onCheckIn,
  onCheckOut,
}: {
  parada: Parada;
  user: { lat: number; lng: number } | null;
  occupying: { name: string; waitSec: number | null }[];
  checkedHere: boolean;
  onClose: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
}) {
  const meters = user ? haversineMeters(user.lat, user.lng, parada.lat, parada.lng) : null;
  return (
    <Card className="rounded-2xl p-4">
      <div className="mb-3 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-medium">{parada.nombre}</h2>
          <p className="text-sm text-muted">
            {parada.municipio} · {parada.barrio}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="size-9" aria-label="Cerrar ficha" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <dl className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-subtle">Plazas</dt>
          <dd className="tabular">{parada.plazas}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Horario</dt>
          <dd>{parada.horario}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Tipo</dt>
          <dd>{parada.tipo}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle">Distancia</dt>
          <dd>{meters != null ? formatDistance(meters) : "Activa ubicación"}</dd>
        </div>
      </dl>
      {occupying.length > 0 ? (
        <p className="mb-3 text-xs text-wait">
          {occupying.length} compañero{occupying.length === 1 ? "" : "s"} en Maya:{" "}
          {occupying.map((o) => o.name).join(", ")}
        </p>
      ) : (
        <p className="mb-3 text-xs text-subtle">Nadie de la malla en esta parada ahora.</p>
      )}
      {checkedHere ? (
        <Button variant="secondary" className="w-full" onClick={onCheckOut}>
          Dejar parada
        </Button>
      ) : (
        <Button className="w-full" onClick={onCheckIn}>
          Ubicar aquí y contar espera
        </Button>
      )}
    </Card>
  );
}
