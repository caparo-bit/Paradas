import raw from "@/data/paradas.json";
import type { Parada } from "./types";

export const PARADAS = raw as Parada[];

export const PARADA_BY_ID = new Map(PARADAS.map((p) => [p.id, p]));

export function getParada(id: string | null | undefined): Parada | undefined {
  if (!id) return undefined;
  return PARADA_BY_ID.get(id);
}

export const MUNICIPIOS = Array.from(new Set(PARADAS.map((p) => p.municipio))).sort((a, b) =>
  a.localeCompare(b, "es"),
);

export const DISTRITOS_MADRID = Array.from(
  new Set(PARADAS.filter((p) => p.municipio === "Madrid").map((p) => p.distrito)),
).sort((a, b) => a.localeCompare(b, "es"));
