import { useState } from "react";
import { useTaxiStore } from "../lib/store";
import type { Pago } from "../lib/types";
import { formatEuro, formatTime, PAGO_LABEL } from "../lib/format";

const PAGOS: Pago[] = ["efectivo", "tarjeta", "app"];

export default function ServiciosView() {
  const { services, addServicio, removeServicio } = useTaxiStore();
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [importe, setImporte] = useState("");
  const [propina, setPropina] = useState("");
  const [pago, setPago] = useState<Pago>("efectivo");
  const [pasajeros, setPasajeros] = useState("1");

  function submit() {
    if (!importe) return;
    addServicio({
      origen: origen.trim() || "—",
      destino: destino.trim() || "—",
      importe: Number(importe) || 0,
      propina: Number(propina) || 0,
      pago,
      minutos: 0,
      pasajeros: Number(pasajeros) || 1,
      notas: "",
    });
    setOrigen("");
    setDestino("");
    setImporte("");
    setPropina("");
    setPasajeros("1");
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Servicios</h2>

      <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input value={origen} onChange={(e) => setOrigen(e.target.value)} placeholder="Origen"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Destino"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input value={importe} onChange={(e) => setImporte(e.target.value)} placeholder="Importe €" inputMode="decimal"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input value={propina} onChange={(e) => setPropina(e.target.value)} placeholder="Propina €" inputMode="decimal"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input value={pasajeros} onChange={(e) => setPasajeros(e.target.value)} placeholder="Pax" inputMode="numeric"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          {PAGOS.map((p) => (
            <button key={p} onClick={() => setPago(p)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium border ${pago === p ? "bg-brand-500 text-brand-900 border-brand-500" : "bg-neutral-800 border-neutral-700 text-neutral-300"}`}>
              {PAGO_LABEL[p]}
            </button>
          ))}
        </div>
        <button onClick={submit} className="w-full rounded-lg bg-brand-500 hover:bg-brand-400 text-brand-900 py-2 font-semibold">
          Guardar servicio
        </button>
      </div>

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-sm flex justify-between items-start">
            <div>
              <div className="font-medium">{s.origen} → {s.destino}</div>
              <div className="text-neutral-500 text-xs mt-0.5">{formatTime(s.at)} · {PAGO_LABEL[s.pago]} · {s.pasajeros} pax</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatEuro(s.importe + s.propina)}</div>
              <button onClick={() => removeServicio(s.id)} className="text-xs text-red-400 mt-1">Eliminar</button>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-sm text-neutral-500">Aún no hay servicios registrados.</p>}
      </div>
    </div>
  );
}
