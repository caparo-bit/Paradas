import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  formatEuro,
  formatDuration,
  GASTO_LABEL,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "@/lib/taxi/format";
import { getParada } from "@/lib/taxi/paradas";
import { useTaxiStore } from "@/lib/taxi/store";

type Range = "hoy" | "semana" | "mes" | "todo";

const CHART_GRID = "color-mix(in oklab, var(--color-fg) 10%, transparent)";
const CHART_TICK = "#8b8e96";
const CHART_BAR = "#d4d7de";
const PIE = ["#d4d7de", "#8b8e96", "#c4a574", "#8aa58a", "#6a6d75", "#b07070"];

export function DashboardView() {
  const services = useTaxiStore((s) => s.services);
  const gastos = useTaxiStore((s) => s.gastos);
  const jornadas = useTaxiStore((s) => s.jornadas);
  const esperas = useTaxiStore((s) => s.esperas);
  const [range, setRange] = useState<Range>("semana");

  const from = useMemo(() => {
    if (range === "hoy") return startOfDay();
    if (range === "semana") return startOfWeek();
    if (range === "mes") return startOfMonth();
    return 0;
  }, [range]);

  const svcs = services.filter((s) => s.at >= from);
  const gsts = gastos.filter((g) => g.at >= from);
  const jors = jornadas.filter((j) => j.startedAt >= from || (j.endedAt ?? Date.now()) >= from);
  const esps = esperas.filter((e) => e.startedAt >= from);

  const bruto = svcs.reduce((a, s) => a + s.importe + s.propina, 0);
  const gasto = gsts.reduce((a, g) => a + g.importe, 0);
  const neto = bruto - gasto;
  const horas = jors.reduce((a, j) => a + ((j.endedAt ?? Date.now()) - j.startedAt), 0) / 3600_000;
  const esperaMedia = esps.length ? esps.reduce((a, e) => a + e.seconds, 0) / esps.length : 0;

  const byDay = useMemo(() => {
    const map = new Map<string, { dia: string; ingresos: number; servicios: number }>();
    for (const s of svcs) {
      const d = new Date(s.at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const label = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
      const cur = map.get(key) ?? { dia: label, ingresos: 0, servicios: 0 };
      cur.ingresos += s.importe + s.propina;
      cur.servicios += 1;
      map.set(key, cur);
    }
    return Array.from(map.values()).slice(-14);
  }, [svcs]);

  const byGasto = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of gsts) map.set(g.tipo, (map.get(g.tipo) ?? 0) + g.importe);
    return Array.from(map.entries()).map(([tipo, value]) => ({
      name: GASTO_LABEL[tipo] ?? tipo,
      value: Math.round(value * 100) / 100,
    }));
  }, [gsts]);

  const topParadas = useMemo(() => {
    const map = new Map<string, { sec: number; n: number }>();
    for (const e of esps) {
      const cur = map.get(e.paradaId) ?? { sec: 0, n: 0 };
      cur.sec += e.seconds;
      cur.n += 1;
      map.set(e.paradaId, cur);
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({
        id,
        nombre: getParada(id)?.nombre ?? id,
        media: v.sec / v.n,
        n: v.n,
      }))
      .sort((a, b) => b.media - a.media)
      .slice(0, 5);
  }, [esps]);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">Panel</h2>
        <p className="text-sm text-muted">Ingresos, espera y gastos del turno.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(
          [
            ["hoy", "Hoy"],
            ["semana", "Semana"],
            ["mes", "Mes"],
            ["todo", "Todo"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setRange(id)}
            className={
              range === id
                ? "h-9 rounded-full bg-brand px-3 text-xs font-medium text-brand-fg"
                : "h-9 rounded-full bg-elevated px-3 text-xs text-muted shadow-[0_0_0_1px_var(--color-line)]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Bruto" value={formatEuro(bruto)} />
        <Stat label="Neto" value={formatEuro(neto)} />
        <Stat label="Servicios" value={String(svcs.length)} />
        <Stat label="Horas" value={horas ? horas.toFixed(1) : "0"} />
        <Stat label="Gastos" value={formatEuro(gasto)} />
        <Stat label="Espera media" value={esperaMedia ? formatDuration(esperaMedia) : "—"} />
      </div>

      <Card className="rounded-2xl p-4">
        <h3 className="mb-3 text-sm font-medium">Ingresos por día</h3>
        {byDay.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay} barSize={18}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklab, var(--color-fg) 6%, transparent)" }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => formatEuro(v)}
                />
                <Bar dataKey="ingresos" fill={CHART_BAR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="rounded-2xl p-4">
        <h3 className="mb-3 text-sm font-medium">Carreras</h3>
        {byDay.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="servicios" stroke={CHART_BAR} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="rounded-2xl p-4">
        <h3 className="mb-3 text-sm font-medium">Gastos por tipo</h3>
        {byGasto.length === 0 ? (
          <EmptyChart text="Sin gastos en este periodo." />
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byGasto} dataKey="value" nameKey="name" innerRadius={38} outerRadius={64} paddingAngle={2}>
                    {byGasto.map((_, i) => (
                      <Cell key={i} fill={PIE[i % PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1 text-sm">
              {byGasto.map((g, i) => (
                <li key={g.name} className="flex justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted">
                    <span className="size-2 rounded-full" style={{ background: PIE[i % PIE.length] }} />
                    {g.name}
                  </span>
                  <span className="tabular">{formatEuro(g.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="rounded-2xl p-4">
        <h3 className="mb-3 text-sm font-medium">Paradas con más espera</h3>
        {topParadas.length === 0 ? (
          <EmptyChart text="Ubícate en una parada para medir tiempos." />
        ) : (
          <ul className="space-y-2">
            {topParadas.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{p.nombre}</span>
                <span className="tabular text-muted">
                  {formatDuration(p.media)} · {p.n}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-xl p-3">
      <p className="text-[11px] tracking-wide text-muted uppercase">{label}</p>
      <p className="tabular mt-1 font-display text-xl font-semibold">{value}</p>
    </Card>
  );
}

function EmptyChart({ text = "Registra servicios para ver la gráfica." }: { text?: string }) {
  return <p className="py-8 text-center text-sm text-muted">{text}</p>;
}

const tooltipStyle = {
  background: "#141518",
  border: "1px solid color-mix(in oklab, #ecece8 12%, transparent)",
  borderRadius: 8,
  fontSize: 12,
};
