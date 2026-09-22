import { GripHorizontal, Minus, SquarePen, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatClock, parseClock } from "@/lib/taxi/format";
import { getParada } from "@/lib/taxi/paradas";
import { useTaxiStore, waitSeconds } from "@/lib/taxi/store";

export function FloatingTimer() {
  const checkIn = useTaxiStore((s) => s.checkIn);
  const floatPos = useTaxiStore((s) => s.floatPos);
  const floatOpen = useTaxiStore((s) => s.floatOpen);
  const setFloatPos = useTaxiStore((s) => s.setFloatPos);
  const setFloatOpen = useTaxiStore((s) => s.setFloatOpen);
  const updateCheckIn = useTaxiStore((s) => s.updateCheckIn);
  const checkOut = useTaxiStore((s) => s.checkOut);
  const setView = useTaxiStore((s) => s.setView);
  const [now, setNow] = useState(() => Date.now());
  const [editing, setEditing] = useState(false);
  const [clock, setClock] = useState("00:00:00");
  const [notes, setNotes] = useState("");
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (checkIn) {
      setNotes(checkIn.notas);
      setClock(formatClock(waitSeconds(checkIn)));
    } else {
      setEditing(false);
    }
  }, [checkIn]);

  if (!checkIn) return null;
  const parada = getParada(checkIn.paradaId);
  const elapsed = waitSeconds(checkIn, now);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - floatPos.x, dy: e.clientY - floatPos.y };
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const maxX = window.innerWidth - 260;
    const maxY = window.innerHeight - 80;
    setFloatPos({
      x: Math.min(Math.max(8, e.clientX - drag.current.dx), maxX),
      y: Math.min(Math.max(8, e.clientY - drag.current.dy), maxY),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const saveEdit = () => {
    const parsed = parseClock(clock);
    if (parsed != null) {
      const natural = Math.round((Date.now() - checkIn.startedAt) / 1000);
      updateCheckIn({ offsetSec: parsed - natural, notas: notes });
    } else {
      updateCheckIn({ notas: notes });
    }
    setEditing(false);
  };

  if (!floatOpen) {
    return (
      <button
        type="button"
        onClick={() => setFloatOpen(true)}
        className="fixed z-40 flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-xs shadow-[0_0_0_1px_var(--color-line)]"
        style={{ left: floatPos.x, top: floatPos.y }}
      >
        <span className="size-1.5 rounded-full bg-wait" />
        <span className="tabular font-medium">{formatClock(elapsed)}</span>
      </button>
    );
  }

  return (
    <aside
      className="fixed z-40 w-[min(18.5rem,calc(100vw-1.5rem))] rounded-xl bg-surface p-3 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_var(--color-line)]"
      style={{ left: floatPos.x, top: floatPos.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label="Tiempo en parada"
    >
      <div className="mb-2 flex items-center gap-2 text-subtle">
        <GripHorizontal className="size-4" />
        <span className="text-[11px] font-medium tracking-wide uppercase">En parada</span>
        <div className="ml-auto flex gap-1" data-no-drag>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Minimizar"
            onClick={() => setFloatOpen(false)}
          >
            <Minus className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Cerrar espera" onClick={checkOut}>
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <button
        type="button"
        className="mb-1 text-left font-display text-base font-medium leading-snug text-fg"
        onClick={() => setView("paradas")}
        data-no-drag
      >
        {parada?.nombre ?? "Parada"}
      </button>
      <p className="mb-3 text-xs text-muted">
        {parada ? `${parada.municipio} · ${parada.distrito}` : checkIn.paradaId}
      </p>

      {editing ? (
        <div className="space-y-2" data-no-drag>
          <Input
            value={clock}
            onChange={(e) => setClock(e.target.value)}
            aria-label="Tiempo de espera"
            className="tabular font-display text-lg"
          />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nota de la espera"
            className="min-h-16"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit} className="flex-1">
              Guardar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-end justify-between gap-2">
            <p className="tabular font-display text-3xl font-semibold tracking-tight">{formatClock(elapsed)}</p>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Editar tiempo"
              onClick={() => setEditing(true)}
              data-no-drag
            >
              <SquarePen className="size-4" />
            </Button>
          </div>
          {checkIn.notas ? <p className="text-xs text-muted">{checkIn.notas}</p> : null}
        </>
      )}
    </aside>
  );
}
