import { ArrowLeft, BarChart3, Fuel, MapPinned, Radio, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useTaxiStore } from "@/lib/taxi/store";
import type { ViewId } from "@/lib/taxi/types";
import { useLocation } from "@/lib/taxi/use-location";
import { FloatingTimer } from "./floating-timer";
import { HomeMenu } from "./home-menu";
import { DashboardView } from "./dashboard-view";
import { JornadaView } from "./jornada-view";
import { MayaMesh } from "./maya-mesh";
import { MayaRadio } from "./maya-radio";
import { ParadasView } from "./paradas-view";
import { ServiciosView } from "./servicios-view";
import { Button } from "./ui/button";

const TITLES: Record<Exclude<ViewId, "home">, string> = {
  paradas: "Paradas",
  servicios: "Servicios",
  dashboard: "Panel",
  jornada: "Jornada",
  maya: "Red Maya",
};

export function AppShell() {
  const setHydrated = useTaxiStore((s) => s.setHydrated);
  const view = useTaxiStore((s) => s.view);
  const setView = useTaxiStore((s) => s.setView);
  const callsign = useTaxiStore((s) => s.callsign);
  const geo = useLocation();
  const startGeo = geo.start;
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(true);
    void Promise.resolve(useTaxiStore.persist.rehydrate()).finally(() => {
      const s = useTaxiStore.getState();
      if (s.callsign === "TX-0000") {
        const n = Math.floor(1000 + Math.random() * 9000);
        s.setProfile(`TX-${n}`, s.plate);
      }
      setHydrated();
    });
  }, [setHydrated]);

  useEffect(() => {
    if (view === "paradas" || view === "maya") startGeo();
  }, [view, startGeo]);

  const inner = (
    <ShellBody
      view={view}
      setView={setView}
      user={geo.pos}
      locError={geo.error}
      onLocate={startGeo}
    />
  );

  if (!live) return inner;
  return (
    <MayaMesh key={callsign} lat={geo.pos?.lat ?? null} lng={geo.pos?.lng ?? null}>
      {inner}
    </MayaMesh>
  );
}

function ShellBody({
  view,
  setView,
  user,
  locError,
  onLocate,
}: {
  view: ViewId;
  setView: (id: ViewId) => void;
  user: { lat: number; lng: number } | null;
  locError: string | null;
  onLocate: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      {view !== "home" ? (
        <div className="mb-3 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-11" aria-label="Inicio" onClick={() => setView("home")}>
            <ArrowLeft />
          </Button>
          <h1 className="font-display text-lg font-medium">{TITLES[view]}</h1>
        </div>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col">
        {view === "home" ? <HomeMenu /> : null}
        {view === "paradas" ? <ParadasView user={user} locError={locError} onLocate={onLocate} /> : null}
        {view === "servicios" ? <ServiciosView /> : null}
        {view === "dashboard" ? <DashboardView /> : null}
        {view === "jornada" ? <JornadaView /> : null}
        {view === "maya" ? <MayaRadio /> : null}
      </main>

      {view !== "home" ? (
        <nav className="sticky bottom-3 z-30 mt-3 grid grid-cols-5 gap-1 rounded-2xl bg-surface/95 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.28),0_0_0_1px_var(--color-line)] backdrop-blur-md">
          <NavBtn id="paradas" label="Paradas" icon={MapPinned} current={view} onClick={setView} />
          <NavBtn id="servicios" label="Servicios" icon={Receipt} current={view} onClick={setView} />
          <NavBtn id="dashboard" label="Panel" icon={BarChart3} current={view} onClick={setView} />
          <NavBtn id="jornada" label="Turno" icon={Fuel} current={view} onClick={setView} />
          <NavBtn id="maya" label="Maya" icon={Radio} current={view} onClick={setView} />
        </nav>
      ) : null}

      <FloatingTimer />
    </div>
  );
}

function NavBtn({
  id,
  label,
  icon: Icon,
  current,
  onClick,
}: {
  id: ViewId;
  label: string;
  icon: typeof MapPinned;
  current: ViewId;
  onClick: (id: ViewId) => void;
}) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={
        "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] " +
        (active ? "bg-elevated text-fg" : "text-muted")
      }
    >
      <Icon className="size-4" strokeWidth={1.6} />
      {label}
    </button>
  );
}

