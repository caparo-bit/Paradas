import { useState } from "react";
import { useTaxiStore } from "../lib/store";
import type { GastoTipo } from "../lib/types";
import { formatEuro, formatTime, GASTO_LABEL } from "../lib/format";

const TIPOS: GastoTipo[] = ["combustible", "peaje", "comida", "parking", "lavado", "otros"];

export default function GastosView() {
  const { gastos, addGasto, removeGasto } = useTaxiStore();
  const [tipo, setTipo] = useState<GastoTipo>("combustible");
  const [importe, setImporte] = useState("");

  function submit() {
    if (!importe) return;
    addGasto({ tipo, importe: Number(importe) || 0, notas: "" });
    setImporte("");
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Gastos</h2>

      <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map((t) => (
            <button key={t} onClick={() => setTipo(t)}
              className={`rounded-lg py-2 text-xs font-medium border ${tipo === t ? "bg-brand-500 text-brand-900 border-brand-500" : "bg-neutral-800 border-neutral-700 text-neutral-300"}`}>
              {GASTO_LABEL[t]}
            </button>
          ))}
        </div>
        <input value={importe} onChange={(e) => setImporte(e.target.value)} placeholder="Importe €" inputMode="decimal"
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <button onClick={submit} className="w-full rounded-lg bg-brand-500 hover:bg-brand-400 text-brand-900 py-2 font-semibold">
          Guardar gasto
        </button>
      </div>

      <div className="space-y-2">
        {gastos.map((g) => (
          <div key={g.id} className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-sm flex justify-between items-center">
            <div>
              <div className="font-medium">{GASTO_LABEL[g.tipo]}</div>
              <div className="text-neutral-500 text-xs">{formatTime(g.at)}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatEuro(g.importe)}</div>
              <button onClick={() => removeGasto(g.id)} className="text-xs text-red-400 mt-1">Eliminar</button>
            </div>
          </div>
        ))}
        {gastos.length === 0 && <p className="text-sm text-neutral-500">Aún no hay gastos registrados.</p>}
      </div>
    </div>
  );
}
