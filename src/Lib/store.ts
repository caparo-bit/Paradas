import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uid, type Gasto, type Jornada, type Servicio, type ViewId } from "./types";

interface TaxiState {
  view: ViewId;
  conductor: string;
  matricula: string;
  services: Servicio[];
  gastos: Gasto[];
  jornadas: Jornada[];
  jornadaActivaId: string | null;

  setView: (view: ViewId) => void;
  setProfile: (conductor: string, matricula: string) => void;

  startJornada: (opts?: { kmInicio?: number; notas?: string }) => void;
  endJornada: (opts?: { kmFin?: number; notas?: string }) => void;

  addServicio: (s: Omit<Servicio, "id" | "at" | "jornadaId"> & { at?: number }) => void;
  removeServicio: (id: string) => void;

  addGasto: (g: Omit<Gasto, "id" | "at" | "jornadaId"> & { at?: number }) => void;
  removeGasto: (id: string) => void;
}

export const useTaxiStore = create<TaxiState>()(
  persist(
    (set, get) => ({
      view: "home",
      conductor: "",
      matricula: "",
      services: [],
      gastos: [],
      jornadas: [],
      jornadaActivaId: null,

      setView: (view) => set({ view }),
      setProfile: (conductor, matricula) => set({ conductor: conductor.trim(), matricula: matricula.trim() }),

      startJornada: (opts) => {
        const id = uid("jor");
        const jornada: Jornada = {
          id,
          startedAt: Date.now(),
          notas: opts?.notas ?? "",
          kmInicio: opts?.kmInicio,
        };
        set({ jornadas: [jornada, ...get().jornadas], jornadaActivaId: id });
      },

      endJornada: (opts) => {
        const id = get().jornadaActivaId;
        if (!id) return;
        set({
          jornadas: get().jornadas.map((j) =>
            j.id === id
              ? { ...j, endedAt: Date.now(), kmFin: opts?.kmFin ?? j.kmFin, notas: opts?.notas ?? j.notas }
              : j,
          ),
          jornadaActivaId: null,
        });
      },

      addServicio: (s) => {
        const servicio: Servicio = {
          id: uid("srv"),
          at: s.at ?? Date.now(),
          origen: s.origen,
          destino: s.destino,
          importe: s.importe,
          propina: s.propina,
          pago: s.pago,
          minutos: s.minutos,
          pasajeros: s.pasajeros,
          notas: s.notas,
          jornadaId: get().jornadaActivaId ?? undefined,
        };
        set({ services: [servicio, ...get().services] });
      },
      removeServicio: (id) => set({ services: get().services.filter((s) => s.id !== id) }),

      addGasto: (g) => {
        const gasto: Gasto = {
          id: uid("gst"),
          at: g.at ?? Date.now(),
          tipo: g.tipo,
          importe: g.importe,
          litros: g.litros,
          notas: g.notas,
          jornadaId: get().jornadaActivaId ?? undefined,
        };
        set({ gastos: [gasto, ...get().gastos] });
      },
      removeGasto: (id) => set({ gastos: get().gastos.filter((g) => g.id !== id) }),
    }),
    {
      name: "taxidiario-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
