import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTime, STATUS_LABEL } from "@/lib/taxi/format";
import { getParada } from "@/lib/taxi/paradas";
import { useTaxiStore } from "@/lib/taxi/store";
import type { TaxiStatus } from "@/lib/taxi/types";
import { useMaya } from "./maya-mesh";

export function MayaRadio() {
  const maya = useMaya();
  const callsign = useTaxiStore((s) => s.callsign);
  const plate = useTaxiStore((s) => s.plate);
  const status = useTaxiStore((s) => s.status);
  const setProfile = useTaxiStore((s) => s.setProfile);
  const setStatus = useTaxiStore((s) => s.setStatus);
  const [name, setName] = useState(callsign);
  const [mat, setMat] = useState(plate);
  const [text, setText] = useState("");
  const connected = maya.peers.filter((p) => p.connectionState === "connected");
  const failed = maya.peers.filter((p) => p.connectionState === "failed");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold">Red Maya</h2>
        <p className="text-sm text-muted">Malla directa entre taxis. Presencia y radio se intercambian P2P.</p>
      </div>

      <Card className="rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <Label>Indicativo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label>Matrícula</Label>
            <Input value={mat} onChange={(e) => setMat(e.target.value)} maxLength={12} />
          </label>
        </div>
        <Button size="sm" className="mt-3" variant="secondary" onClick={() => setProfile(name, mat)}>
          Guardar identificativo
        </Button>
        <div className="mt-4 flex gap-2">
          {(["libre", "ocupado", "en_parada"] as TaxiStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatus(st)}
              className={
                status === st
                  ? "h-9 flex-1 rounded-full bg-brand text-xs font-medium text-brand-fg"
                  : "h-9 flex-1 rounded-full bg-elevated text-xs text-muted shadow-[0_0_0_1px_var(--color-line)]"
              }
            >
              {STATUS_LABEL[st]}
            </button>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Compañeros en malla</h3>
          <Badge variant={maya.joined ? "ok" : "default"}>
            {maya.joined ? `${connected.length} conectados` : "Conectando"}
          </Badge>
        </div>
        {connected.length === 0 && maya.presence.length === 0 ? (
          <p className="text-sm text-muted">
            Estás solo en la malla. Cuando otro taxi abra ParadaMaya en este mismo sitio, aparece aquí: parada, estado y
            radio.
          </p>
        ) : (
          <ul className="space-y-2">
            {maya.presence.map((p) => {
              const stand = getParada(p.paradaId);
              const peer = maya.peers.find((x) => x.id === p.id);
              return (
                <li key={p.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {p.name}
                      {p.plate ? ` · ${p.plate}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {STATUS_LABEL[p.status]}
                      {stand ? ` · ${stand.nombre}` : ""}
                    </p>
                  </div>
                  <span className="text-[11px] text-subtle">
                    {peer?.connectionState === "connected"
                      ? peer.rttMs != null
                        ? `${peer.rttMs} ms`
                        : "P2P"
                      : peer?.connectionState ?? "…"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {failed.length > 0 ? (
          <p className="mt-2 text-xs text-off">
            {failed.length} enlace{failed.length === 1 ? "" : "s"} no pudo atravesar el NAT.
          </p>
        ) : null}
      </Card>

      <Card className="flex min-h-[16rem] flex-1 flex-col rounded-2xl p-4">
        <h3 className="mb-2 text-sm font-medium">Radio</h3>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {maya.radio.length === 0 ? (
            <li className="text-sm text-muted">Canal libre. Escribe un parte corto.</li>
          ) : (
            maya.radio.map((line) => (
              <li key={line.id} className={line.self ? "text-right" : ""}>
                <p className="text-[11px] text-subtle">
                  {line.name} · {formatTime(line.at)}
                </p>
                <p className="text-sm">{line.text}</p>
              </li>
            ))
          )}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            maya.sendRadio(text);
            setText("");
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Parte a la malla"
            maxLength={200}
          />
          <Button type="submit">Enviar</Button>
        </form>
      </Card>
    </div>
  );
}
