import { Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime, formatEuro, PAGO_LABEL } from "@/lib/taxi/format";
import { getParada } from "@/lib/taxi/paradas";
import { useTaxiStore } from "@/lib/taxi/store";
import type { Pago } from "@/lib/taxi/types";

export function ServiciosView() {
  const services = useTaxiStore((s) => s.services);
  const addServicio = useTaxiStore((s) => s.addServicio);
  const removeServicio = useTaxiStore((s) => s.removeServicio);
  const checkIn = useTaxiStore((s) => s.checkIn);
  const [open, setOpen] = useState(false);

  const total = services.reduce((a, s) => a + s.importe + s.propina, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Actividad</p>
          <h2 className="font-display text-2xl font-semibold">Servicios</h2>
          <p className="text-sm text-muted">
            {services.length} {services.length === 1 ? "carrera" : "carreras"} · {formatEuro(total)}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus />
          Registrar
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="rounded-2xl p-6 text-center">
          <p className="font-medium">Todavía no hay carreras</p>
          <p className="mt-1 text-sm text-muted">
            Cuando cierres un servicio, anótalo aquí. Si estás en parada, se corta la espera.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {services.map((s) => (
            <li key={s.id}>
              <Card className="flex items-start gap-3 rounded-xl p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {s.origen} → {s.destino}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateTime(s.at)} · {s.minutos} min · {s.pasajeros} pax · {PAGO_LABEL[s.pago]}
                  </p>
                  {s.notas ? <p className="mt-1 text-xs text-subtle">{s.notas}</p> : null}
                </div>
                <div className="text-right">
                  <p className="tabular font-medium">{formatEuro(s.importe + s.propina)}</p>
                  {s.propina > 0 ? <p className="text-[11px] text-ok">+{formatEuro(s.propina)}</p> : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-1 size-8"
                    aria-label="Borrar servicio"
                    onClick={() => removeServicio(s.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Nuevo servicio">
          <ServicioForm
            defaultOrigen={checkIn ? (getParada(checkIn.paradaId)?.nombre ?? "") : ""}
            paradaId={checkIn?.paradaId}
            onCancel={() => setOpen(false)}
            onSave={(data) => {
              addServicio(data);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServicioForm({
  defaultOrigen,
  paradaId,
  onSave,
  onCancel,
}: {
  defaultOrigen: string;
  paradaId?: string;
  onSave: (s: {
    origen: string;
    destino: string;
    importe: number;
    propina: number;
    pago: Pago;
    minutos: number;
    pasajeros: number;
    notas: string;
    paradaId?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [origen, setOrigen] = useState(defaultOrigen);
  const [destino, setDestino] = useState("");
  const [importe, setImporte] = useState("");
  const [propina, setPropina] = useState("0");
  const [pago, setPago] = useState<Pago>("efectivo");
  const [minutos, setMinutos] = useState("15");
  const [pasajeros, setPasajeros] = useState("1");
  const [notas, setNotas] = useState("");

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const imp = Number(importe.replace(",", "."));
        if (!origen.trim() || !destino.trim() || Number.isNaN(imp)) return;
        onSave({
          origen: origen.trim(),
          destino: destino.trim(),
          importe: imp,
          propina: Number(propina.replace(",", ".")) || 0,
          pago,
          minutos: Number(minutos) || 0,
          pasajeros: Number(pasajeros) || 1,
          notas: notas.trim(),
          paradaId,
        });
      }}
    >
      <Field label="Origen">
        <Input value={origen} onChange={(e) => setOrigen(e.target.value)} required />
      </Field>
      <Field label="Destino">
        <Input value={destino} onChange={(e) => setDestino(e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Importe €">
          <Input inputMode="decimal" value={importe} onChange={(e) => setImporte(e.target.value)} required />
        </Field>
        <Field label="Propina €">
          <Input inputMode="decimal" value={propina} onChange={(e) => setPropina(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["efectivo", "tarjeta", "app"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPago(p)}
            className={
              pago === p
                ? "h-11 rounded-md bg-brand text-sm font-medium text-brand-fg"
                : "h-11 rounded-md bg-elevated text-sm text-muted shadow-[0_0_0_1px_var(--color-line)]"
            }
          >
            {PAGO_LABEL[p]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Minutos">
          <Input inputMode="numeric" value={minutos} onChange={(e) => setMinutos(e.target.value)} />
        </Field>
        <Field label="Pasajeros">
          <Input inputMode="numeric" value={pasajeros} onChange={(e) => setPasajeros(e.target.value)} />
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="min-h-16" />
      </Field>
      {paradaId ? <Badge variant="wait">Cierra la espera en parada</Badge> : null}
      <div className="mt-1 flex gap-2">
        <Button type="submit" className="flex-1">
          Guardar carrera
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
