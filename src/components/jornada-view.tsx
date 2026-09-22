import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatClock, formatDateTime, formatEuro, GASTO_LABEL } from "@/lib/taxi/format";
import { useTaxiStore } from "@/lib/taxi/store";
import type { GastoTipo } from "@/lib/taxi/types";
import { Trash2 } from "lucide-react";

const TIPOS: GastoTipo[] = ["combustible", "peaje", "comida", "parking", "lavado", "otros"];

export function JornadaView() {
  const jornadaActivaId = useTaxiStore((s) => s.jornadaActivaId);
  const jornadas = useTaxiStore((s) => s.jornadas);
  const gastos = useTaxiStore((s) => s.gastos);
  const services = useTaxiStore((s) => s.services);
  const startJornada = useTaxiStore((s) => s.startJornada);
  const endJornada = useTaxiStore((s) => s.endJornada);
  const addGasto = useTaxiStore((s) => s.addGasto);
  const removeGasto = useTaxiStore((s) => s.removeGasto);
  const [now, setNow] = useState(Date.now());
  const [gastoOpen, setGastoOpen] = useState(false);
  const [kmInicio, setKmInicio] = useState("");
  const [kmFin, setKmFin] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const activa = jornadas.find((j) => j.id === jornadaActivaId);
  const jornadaGastos = activa ? gastos.filter((g) => g.jornadaId === activa.id) : [];
  const jornadaSvcs = activa
    ? services.filter((s) => s.jornadaId === activa.id || (!s.jornadaId && s.at >= activa.startedAt))
    : [];
  const bruto = jornadaSvcs.reduce((a, s) => a + s.importe + s.propina, 0);
  const gastoSum = jornadaGastos.reduce((a, g) => a + g.importe, 0);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">Jornada</h2>
        <p className="text-sm text-muted">Turno, combustible y resto de gastos.</p>
      </div>

      <Card className="rounded-2xl p-4">
        {activa ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="ok">En servicio</Badge>
              <p className="tabular font-display text-2xl font-semibold">
                {formatClock(Math.round((now - activa.startedAt) / 1000))}
              </p>
            </div>
            <p className="text-sm text-muted">Inicio {formatDateTime(activa.startedAt)}</p>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <dt className="text-[11px] text-subtle">Bruto</dt>
                <dd className="tabular font-medium">{formatEuro(bruto)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-subtle">Gastos</dt>
                <dd className="tabular font-medium">{formatEuro(gastoSum)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-subtle">Neto</dt>
                <dd className="tabular font-medium">{formatEuro(bruto - gastoSum)}</dd>
              </div>
            </dl>
            <label className="mt-4 flex flex-col gap-1.5">
              <Label>Km al cerrar</Label>
              <Input inputMode="numeric" value={kmFin} onChange={(e) => setKmFin(e.target.value)} />
            </label>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => endJornada({ kmFin: Number(kmFin) || undefined })}>
              Cerrar jornada
            </Button>
          </>
        ) : (
          <>
            <p className="font-medium">Fuera de turno</p>
            <p className="mt-1 text-sm text-muted">Arranca la jornada para acumular horas y gastos del día.</p>
            <label className="mt-4 flex flex-col gap-1.5">
              <Label>Km al inicio (opcional)</Label>
              <Input inputMode="numeric" value={kmInicio} onChange={(e) => setKmInicio(e.target.value)} />
            </label>
            <Button className="mt-3 w-full" onClick={() => startJornada({ kmInicio: Number(kmInicio) || undefined })}>
              Iniciar jornada
            </Button>
          </>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium">Gastos</h3>
        <Button size="sm" onClick={() => setGastoOpen(true)}>
          Añadir gasto
        </Button>
      </div>

      {jornadaGastos.length === 0 ? (
        <Card className="rounded-2xl p-6 text-center text-sm text-muted">
          {activa
            ? "Todavía no hay gastos en esta jornada."
            : "Inicia una jornada para asociar combustible, peajes, comida o parking a un turno."}
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {jornadaGastos.map((g) => (
            <li key={g.id}>
              <Card className="flex items-center gap-3 rounded-xl p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{GASTO_LABEL[g.tipo]}</p>
                  <p className="text-xs text-muted">
                    {formatDateTime(g.at)}
                    {g.litros ? ` · ${g.litros} L` : ""}
                    {g.precioLitro ? ` · ${formatEuro(g.precioLitro)}/L` : ""}
                    {g.notas ? ` · ${g.notas}` : ""}
                  </p>
                </div>
                <p className="tabular font-medium">{formatEuro(g.importe)}</p>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Borrar gasto" onClick={() => removeGasto(g.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <section>
        <h3 className="mb-2 font-display text-lg font-medium">Historial</h3>
        {jornadas.filter((j) => j.endedAt).length === 0 ? (
          <p className="text-sm text-muted">Las jornadas cerradas aparecen aquí.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {jornadas
              .filter((j) => j.endedAt)
              .slice(0, 8)
              .map((j) => (
                <li key={j.id} className="flex justify-between gap-3 text-muted">
                  <span>{formatDateTime(j.startedAt)}</span>
                  <span className="tabular">
                    {formatClock(Math.round(((j.endedAt ?? j.startedAt) - j.startedAt) / 1000))}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      <Dialog open={gastoOpen} onOpenChange={setGastoOpen}>
        <DialogContent title="Nuevo gasto">
          <GastoForm
            onCancel={() => setGastoOpen(false)}
            onSave={(g) => {
              addGasto(g);
              setGastoOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GastoForm({
  onSave,
  onCancel,
}: {
  onSave: (g: { tipo: GastoTipo; importe: number; litros?: number; precioLitro?: number; notas: string }) => void;
  onCancel: () => void;
}) {
  const [tipo, setTipo] = useState<GastoTipo>("combustible");
  const [importe, setImporte] = useState("");
  const [litros, setLitros] = useState("");
  const [precio, setPrecio] = useState("");
  const [notas, setNotas] = useState("");

  const recalc = (l: string, p: string) => {
    const lv = Number(l.replace(",", "."));
    const pv = Number(p.replace(",", "."));
    if (lv > 0 && pv > 0) setImporte((lv * pv).toFixed(2));
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const imp = Number(importe.replace(",", "."));
        if (Number.isNaN(imp) || imp <= 0) return;
        onSave({
          tipo,
          importe: imp,
          litros: litros ? Number(litros.replace(",", ".")) : undefined,
          precioLitro: precio ? Number(precio.replace(",", ".")) : undefined,
          notas: notas.trim(),
        });
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        {TIPOS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={
              tipo === t
                ? "h-11 rounded-md bg-brand px-2 text-xs font-medium text-brand-fg"
                : "h-11 rounded-md bg-elevated px-2 text-xs text-muted shadow-[0_0_0_1px_var(--color-line)]"
            }
          >
            {GASTO_LABEL[t]}
          </button>
        ))}
      </div>
      {tipo === "combustible" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <Label>Litros</Label>
            <Input
              inputMode="decimal"
              value={litros}
              onChange={(e) => {
                setLitros(e.target.value);
                recalc(e.target.value, precio);
              }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>€ / litro</Label>
            <Input
              inputMode="decimal"
              value={precio}
              onChange={(e) => {
                setPrecio(e.target.value);
                recalc(litros, e.target.value);
              }}
            />
          </label>
        </div>
      ) : null}
      <label className="flex flex-col gap-1.5">
        <Label>Importe €</Label>
        <Input inputMode="decimal" value={importe} onChange={(e) => setImporte(e.target.value)} required />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Nota (estación, peaje…)</Label>
        <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="min-h-16" />
      </label>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Guardar
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
