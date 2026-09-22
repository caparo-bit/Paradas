export type ViewId = "home" | "paradas" | "servicios" | "dashboard" | "jornada" | "maya";

export type Pago = "efectivo" | "tarjeta" | "app";

export type GastoTipo = "combustible" | "peaje" | "comida" | "parking" | "lavado" | "otros";

export type TaxiStatus = "libre" | "ocupado" | "en_parada";

export interface Parada {
  id: string;
  nombre: string;
  municipio: string;
  distrito: string;
  barrio: string;
  plazas: number;
  horario: string;
  tipo: string;
  lat: number;
  lng: number;
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
  paradaId?: string;
  jornadaId?: string;
}

export interface Gasto {
  id: string;
  at: number;
  tipo: GastoTipo;
  importe: number;
  litros?: number;
  precioLitro?: number;
  notas: string;
  jornadaId?: string;
}

export interface Jornada {
  id: string;
  startedAt: number;
  endedAt?: number;
  notas: string;
  kmInicio?: number;
  kmFin?: number;
}

export interface CheckIn {
  paradaId: string;
  startedAt: number;
  offsetSec: number;
  notas: string;
}

export interface Espera {
  id: string;
  paradaId: string;
  startedAt: number;
  endedAt: number;
  seconds: number;
}

export interface FloatPos {
  x: number;
  y: number;
}

export interface PeerPresence {
  id: string;
  name: string;
  plate: string;
  status: TaxiStatus;
  paradaId: string | null;
  lat: number | null;
  lng: number | null;
  waitSec: number | null;
  updatedAt: number;
}
