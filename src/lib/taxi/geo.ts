import type { Parada } from "./types";

const R = 6371e3;

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

export function nearestParadas(
  paradas: Parada[],
  lat: number,
  lng: number,
  n = 8,
): Array<Parada & { meters: number }> {
  return paradas
    .map((p) => ({ ...p, meters: haversineMeters(lat, lng, p.lat, p.lng) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, n);
}

export const MADRID_CENTER = { lat: 40.4168, lng: -3.7038 };
export const CAM_BOUNDS: [[number, number], [number, number]] = [
  [39.86, -4.58],
  [41.17, -3.03],
];
