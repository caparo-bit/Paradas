import { useTaxiStore } from "./lib/store";
import AppShell from "./components/AppShell";
import HomeView from "./components/HomeView";
import JornadaView from "./components/JornadaView";
import ServiciosView from "./components/ServiciosView";
import GastosView from "./components/GastosView";
import ParadasView from "./components/ParadasView";
import DashboardView from "./components/DashboardView";

export default function App() {
  const view = useTaxiStore((s) => s.view);

  return (
    <AppShell>
      {view === "home" && <HomeView />}
      {view === "jornada" && <JornadaView />}
      {view === "servicios" && <ServiciosView />}
      {view === "gastos" && <GastosView />}
      {view === "paradas" && <ParadasView />}
      {view === "dashboard" && <DashboardView />}
    </AppShell>
  );
}
