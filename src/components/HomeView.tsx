import { useTaxiStore } from "../lib/store";
import type { ViewId } from "../lib/types";

const CARDS: { id: ViewId; label: string; emoji: string; desc: string }[] = [
  { id: "jornada", label: "Jornada", emoji: "🕒", desc: "Inicia o cierra tu turno" },
  { id: "servicios", label: "Servicios", emoji: "🚕", desc: "Registra cada carrera" },
  { id: "gastos", label: "Gastos", emoji: "⛽", desc: "Combustible, peajes y más" },
  { id: "paradas", label: "Paradas", emoji: "📍", desc: "Consulta paradas de taxi" },
  { id: "dashboard", label: "Panel", emoji: "📊", desc: "Resumen de tu actividad" },
];

export default function HomeView() {
  const { setView, conductor, matricula, jornadaActivaId } = useTaxiStore();

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 text-brand-900">
        <p className="text-sm font-medium opacity-80">TaxiDiario</p>
        <h1 className="text-2xl font-bold mt-1">
          {conductor ? `Hola, ${conductor}` : "Bienvenido"}
        </h1>
        {matricula && <p className="text-sm opacity-80 mt-0.5">Matrícula {matricula}</p>}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">
          <span className={`h-2 w-2 rounded-full ${jornadaActivaId ? "bg-green-600" : "bg-black/40"}`} />
          {jornadaActivaId ? "Jornada activa" : "Sin jornada activa"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <button
            key={c.id}
            onClick={() => setView(c.id)}
            className="text-left rounded-xl bg-neutral-900 border border-neutral-800 p-4 hover:border-brand-500 transition-colors"
          >
            <div className="text-2xl">{c.emoji}</div>
            <div className="mt-2 font-semibold">{c.label}</div>
            <div className="text-xs text-neutral-400 mt-0.5">{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
