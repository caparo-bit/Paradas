const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const dayFmt = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
const dateTimeFmt = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function formatEuro(n: number): string {
  return euro.format(n || 0);
}

export function formatDay(ts: number): string {
  return dayFmt.format(ts);
}

export function formatTime(ts: number): string {
  return timeFmt.format(ts);
}

export function formatDateTime(ts: number): string {
  return dateTimeFmt.format(ts);
}

export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m`;
}

export const PAGO_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  app: "App",
};

export const GASTO_LABEL: Record<string, string> = {
  combustible: "Combustible",
  peaje: "Peaje",
  comida: "Comida",
  parking: "Parking",
  lavado: "Lavado",
  otros: "Otros",
};

export function startOfDay(ts = Date.now()): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfWeek(ts = Date.now()): number {
  const d = new Date(startOfDay(ts));
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.getTime();
}
