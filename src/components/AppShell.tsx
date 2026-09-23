import type { ReactNode } from "react";
import { useTaxiStore } from "../lib/store";
import type { ViewId } from "../lib/types";

const NAV: { id: ViewId; label: string; emoji: string }[] = [
  { id: "home", label: "Inicio", emoji: "🏠" },
  { id: "jornada", label: "Jornada", emoji: "🕒" },
  { id: "servicios", label: "Servicios", emoji: "🚕" },
  { id: "gastos", label: "Gastos", emoji: "⛽" },
  { id: "dashboard", label: "Panel", emoji: "📊" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { view, setView } = useTaxiStore();

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <main className="flex-1 pb-20 overflow-y-auto">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-neutral-950/95 backdrop-blur border-t border-neutral-800 grid grid-cols-5">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`flex flex-col items-center justify-center py-2 text-[11px] gap-0.5 ${view === n.id ? "text-brand-500" : "text-neutral-500"}`}
          >
            <span className="text-lg">{n.emoji}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
