import { BarChart3, Fuel, MapPinned, Radio, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatClock, formatEuro, startOfDay } from "@/lib/taxi/format";
import { PARADAS } from "@/lib/taxi/paradas";
import { useTaxiStore, waitSeconds } from "@/lib/taxi/store";
import type { ViewId } from "@/lib/taxi/types";
import { useMaya } from "./maya-mesh";
import { useEffect, useState } from "react";

const tiles: { id: ViewId; label: string; hint: string; icon: typeof MapPinned }[] = [
  { id: "paradas", label: "Paradas", hint: `${PARADAS.length} en la CAM`, icon: MapPinned },
  { id: "servicios", label: "Servicios", hint: "Registrar carreras", icon: Receipt },
  { id: "dashboard", label: "Panel", hint: "Gráficas del turno", icon: BarChart3 },
  { id: "jornada", label: "Jornada", hint: "Horas y gastos", icon: Fuel },
];

export function HomeMenu() {
  const setView = useTaxiStore((s) => s.setView);
  const services = useTaxiStore((s) => s.services);
  const jornadaActivaId = useTaxiStore((s) => s.jornadaActivaId);
  const jornadas = useTaxiStore((s) => s.jornadas);
  const checkIn = useTaxiStore((s) => s.checkIn);
  const callsign = useTaxiStore((s) => s.callsign);
  const plate = useTaxiStore((s) => s.plate);
  const maya = useMaya();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const today = startOfDay(now);
  const todayServices = services.filter((s) => s.at >= today);
  const todayTake = todayServices.reduce((a, s) => a + s.importe + s.propina, 0);
  const todayTips = todayServices.reduce((a, s) => a + s.propina, 0);
  const todayExpenses = useTaxiStore((s) => s.gastos)
    .filter((g) => g.at >= today)
    .reduce((a, g) => a + g.importe, 0);
  const todayNet = todayTake - todayExpenses;
  const jornada = jornadas.find((j) => j.id === jornadaActivaId);
  const connected = maya.peers.filter((p) => p.connectionState === "connected").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="pt-1">
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">Comunidad de Madrid · Taxi</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">ParadaMaya</h1>
            <p className="mt-2 text-sm text-muted">
              {callsign}{plate ? ` · ${plate}` : ""} · Maya {maya.joined ? "conectada" : "conectando"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView("maya")}
            className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-surface text-muted shadow-[0_0_0_1px_var(--color-line)] transition-colors hover:bg-elevated sm:flex"
            aria-label="Abrir Red Maya"
          >
            <Radio className="size-5" />
          </button>
        </div>
      </header>

      <Card className="rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Resumen de hoy</p>
            <p className="tabular mt-1 font-display text-3xl font-semibold">{formatEuro(todayNet)}</p>
            <p className="mt-1 text-xs text-subtle">{todayServices.length} servicios · {formatEuro(todayTips)} propinas</p>
          </div>
          <div className="text-right">
            {jornada ? (
              <>
                <Badge variant="ok">Jornada activa</Badge>
                <p className="tabular mt-2 text-sm text-muted">{formatClock(Math.round((now - jornada.startedAt) / 1000))}</p>
              </>
            ) : <Badge>Fuera de turno</Badge>}
            {checkIn ? <p className="tabular mt-1 text-xs text-wait">Espera {formatClock(waitSeconds(checkIn, now))}</p> : null}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <QuickStat label="Facturado" value={formatEuro(todayTake)} />
          <QuickStat label="Gastos" value={formatEuro(todayExpenses)} />
          <QuickStat label="Carreras" value={String(todayServices.length)} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => setView(tile.id)}
            className="flex min-h-[7.5rem] flex-col items-start rounded-2xl bg-surface p-4 text-left shadow-[0_0_0_1px_var(--color-line)] transition-[transform,background-color] duration-150 hover:bg-elevated active:scale-[0.99]"
          >
            <tile.icon className="size-5 text-brand" strokeWidth={1.6} />
            <span className="mt-auto font-display text-xl font-medium">{tile.label}</span>
            <span className="text-xs text-muted">{tile.hint}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setView("maya")}
          className="col-span-2 flex min-h-[5.5rem] items-center gap-4 rounded-2xl bg-surface p-4 text-left shadow-[0_0_0_1px_var(--color-line)] transition-[transform,background-color] duration-150 hover:bg-elevated active:scale-[0.99]"
        >
          <Radio className="size-6 text-brand" strokeWidth={1.6} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-medium">Red Maya</p>
            <p className="text-xs text-muted">Malla P2P entre taxis · {connected} en línea</p>
          </div>
          <span className="size-2 rounded-full bg-ok" aria-hidden />
        </button>
      </div>
    </div>
  );
}


function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-elevated/70 px-3 py-2.5">
      <p className="text-[10px] tracking-wide text-muted uppercase">{label}</p>
      <p className="tabular mt-0.5 font-medium">{value}</p>
    </div>
  );
}
