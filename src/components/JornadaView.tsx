import { useState } from "react";
import { useTaxiStore } from "../lib/store";
import { formatDateTime, formatDuration } from "../lib/format";

export default function JornadaView() {
  const { jornadas, jornadaActivaId, startJornada, endJornada } = useTaxiStore();
  const [kmInicio, setKmInicio] = useState("");
  const [kmFin, setKmFin] = useState("");
  const activa = jornadas.find((j) => j.id === jornadaActivaId);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Jornada</h2>

      {activa ? (
        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
          <div className="text-sm text-neutral-400">Iniciada {formatDateTime(activa.startedAt)}</div>
          <div className="text-2xl font-bold">{formatDuration((Date.now() - activa.startedAt) / 1000)}</div>
          <input
            value={kmFin}
            onChange={(e) => setKmFin(e.target.value)}
            placeholder="Km final (opcional)"
            inputMode="numeric"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              endJornada({ kmFin: kmFin ? Number(kmFin) : undefined });
              setKmFin("");
            }}
            className="w-full rounded-lg bg-red-600 hover:bg-red-500 py-2 font-semibold"
          >
            Finalizar jornada
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
          <p className="text-sm text-neutral-400">No tienes ninguna jornada activa.</p>
          <input
            value={kmInicio}
            onChange={(e) => setKmInicio(e.target.value)}
            placeholder="Km inicial (opcional)"
            inputMode="numeric"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              startJornada({ kmInicio: kmInicio ? Number(kmInicio) : undefined });
              setKmInicio("");
            }}
            className="w-full rounded-lg bg-brand-500 hover:bg-brand-400 text-brand-900 py-2 font-semibold"
          >
            Iniciar jornada
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-neutral-400 mb-2">Historial</h3>
        <div className="space-y-2">
          {jornadas.filter((j) => j.endedAt).map((j) => (
            <div key={j.id} className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-sm flex justify-between">
              <div>
                <div className="font-medium">{formatDateTime(j.startedAt)}</div>
                <div className="text-neutral-500 text-xs">
                  {j.kmInicio != null && j.kmFin != null ? `${j.kmFin - j.kmInicio} km` : ""}
                </div>
              </div>
              <div className="text-neutral-400">
                {formatDuration(((j.endedAt ?? 0) - j.startedAt) / 1000)}
              </div>
            </div>
          ))}
          {jornadas.filter((j) => j.endedAt).length === 0 && (
            <p className="text-sm text-neutral-500">Aún no hay jornadas finalizadas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
