export type ViewId = "home" | "jornada" | "servicios" | "gastos" | "paradas" | "dashboard";

export type Pago = "efectivo" | "tarjeta" | "app";

export type GastoTipo = "combustible" | "peaje" | "comida" | "parking" | "lavado" | "otros";

export interface Parada {
  id: string;
  nombre: string;
  municipio: string;
  barrio: string;
  plazas: number;
  horario: string;
}

export interface Servicio {
  id: string;
  at: number;
  origen: string;
  destino: string;
  importe: number;
  propina: number;
  pago: Pago;
  minutos: number;
  pasajeros: number;
  notas: string;
  jornadaId?: string;
}

export interface Gasto {
  id: string;
  at: number;
  tipo: GastoTipo;
  importe: number;
  litros?: number;
  notas: string;
  jornadaId?: string;
}

export interface Jornada {
  id: string;
  startedAt: number;
  endedAt?: number;
  kmInicio?: number;
  kmFin?: number;
  notas: string;
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
