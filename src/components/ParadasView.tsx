import { useState } from "react";
import { PARADAS } from "../data/paradas";

export default function ParadasView() {
  const [q, setQ] = useState("");
  const filtered = PARADAS.filter((p) =>
    `${p.nombre} ${p.barrio} ${p.municipio}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Paradas</h2>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar parada, barrio..."
        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm"
      />
      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
            <div className="font-medium">{p.nombre}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{p.barrio}, {p.municipio}</div>
            <div className="text-xs text-neutral-500 mt-1">{p.plazas} plazas · {p.horario}</div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-neutral-500">Sin resultados.</p>}
      </div>
      <p className="text-xs text-neutral-600">
        Lista de ejemplo — sustitúyela por tus propias paradas en src/data/paradas.ts
      </p>
    </div>
  );
}
