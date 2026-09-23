import { useMemo, useState } from "react";
import { useTaxiStore } from "../lib/store";
import { formatEuro, startOfDay, startOfWeek } from "../lib/format";

type Range = "hoy" | "semana" | "total";

export default function DashboardView() {
  const { services, gastos } = useTaxiStore();
  const [range, setRange] = useState<Range>("hoy");

  const stats = useMemo(() => {
    const since = range === "hoy" ? startOfDay() : range === "semana" ? startOfWeek() : 0;
    const svc = services.filter((s) => s.at >= since);
    const gst = gastos.filter((g) => g.at >= since);
    const ingresos = svc.reduce((sum, s) => sum + s.importe + s.propina, 0);
    const gastosTotal = gst.reduce((sum, g) => sum + g.importe, 0);
    return {
      ingresos,
      gastosTotal,
      neto: ingresos - gastosTotal,
      numServicios: svc.length,
      mediaServicio: svc.length ? ingresos / svc.length : 0,
    };
  }, [services, gastos, range]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Panel</h2>

      <div className="flex gap-2">
        {(["hoy", "semana", "total"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium border capitalize ${range === r ? "bg-brand-500 text-brand-900 border-brand-500" : "bg-neutral-800 border-neutral-700 text-neutral-300"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ingresos" value={formatEuro(stats.ingresos)} accent />
        <Stat label="Gastos" value={formatEuro(stats.gastosTotal)} />
        <Stat label="Neto" value={formatEuro(stats.neto)} accent />
        <Stat label="Servicios" value={String(stats.numServicios)} />
        <Stat label="Media/servicio" value={formatEuro(stats.mediaServicio)} full />
      </div>
    </div>
  );
}

function Stat({ label, value, accent, full }: { label: string; value: string; accent?: boolean; full?: boolean }) {
  return (
    <div className={`rounded-xl bg-neutral-900 border border-neutral-800 p-4 ${full ? "col-span-2" : ""}`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`text-xl font-bold mt-1 ${accent ? "text-brand-500" : ""}`}>{value}</div>
    </div>
  );
}
