import { useEffect, useRef } from "react";
import type { Map as LeafletMap, CircleMarker, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAM_BOUNDS, MADRID_CENTER } from "@/lib/taxi/geo";
import type { Parada, PeerPresence } from "@/lib/taxi/types";

interface Props {
  paradas: Parada[];
  selectedId: string | null;
  user: { lat: number; lng: number } | null;
  occupancy: Map<string, PeerPresence[]>;
  onSelect: (id: string) => void;
}

export function TaxiMap({ paradas, selectedId, user, occupancy, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, CircleMarker>>(new Map());
  const userRef = useRef<CircleMarker | null>(null);
  const peersLayerRef = useRef<LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const occupancyRef = useRef(occupancy);
  occupancyRef.current = occupancy;
  const paradasRef = useRef(paradas);
  paradasRef.current = paradas;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !hostRef.current) return;

      const map = L.map(hostRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([MADRID_CENTER.lat, MADRID_CENTER.lng], 12);
      map.setMaxBounds(CAM_BOUNDS);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const group = L.layerGroup().addTo(map);
      peersLayerRef.current = L.layerGroup().addTo(map);

      for (const p of paradasRef.current) {
        const occ = occupancyRef.current.get(p.id)?.length ?? 0;
        const marker = L.circleMarker([p.lat, p.lng], styleFor(p.id, selectedRef.current, occ)).addTo(group);
        marker.on("click", () => onSelectRef.current(p.id));
        markersRef.current.set(p.id, marker);
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      const occ = occupancy.get(id)?.length ?? 0;
      marker.setStyle(styleFor(id, selectedId, occ));
      if (id === selectedId) marker.bringToFront();
    }
    if (selectedId) {
      const p = paradas.find((x) => x.id === selectedId);
      if (p && mapRef.current) {
        mapRef.current.panTo([p.lat, p.lng], { animate: true });
      }
    }
  }, [selectedId, occupancy, paradas]);

  useEffect(() => {
    void (async () => {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map) return;
      if (!user) {
        userRef.current?.remove();
        userRef.current = null;
        return;
      }
      if (!userRef.current) {
        userRef.current = L.circleMarker([user.lat, user.lng], {
          radius: 7,
          color: "#ecece8",
          weight: 2,
          fillColor: "#d4d7de",
          fillOpacity: 1,
        }).addTo(map);
      } else {
        userRef.current.setLatLng([user.lat, user.lng]);
      }
    })();
  }, [user]);

  useEffect(() => {
    void (async () => {
      const L = await import("leaflet");
      const layer = peersLayerRef.current;
      if (!layer) return;
      layer.clearLayers();
      for (const groups of occupancy.values()) {
        for (const peer of groups) {
          if (peer.lat == null || peer.lng == null) continue;
          L.circleMarker([peer.lat, peer.lng], {
            radius: 4,
            color: "#c4a574",
            weight: 1,
            fillColor: "#c4a574",
            fillOpacity: 0.9,
          }).addTo(layer);
        }
      }
    })();
  }, [occupancy]);

  return <div ref={hostRef} className="h-full min-h-[22rem] w-full" />;
}

function styleFor(id: string, selectedId: string | null, occ: number) {
  if (id === selectedId) {
    return { radius: 8, color: "#ecece8", weight: 2, fillColor: "#d4d7de", fillOpacity: 1 };
  }
  if (occ > 0) {
    return { radius: 6, color: "#c4a574", weight: 1, fillColor: "#c4a574", fillOpacity: 0.9 };
  }
  return { radius: 4, color: "#6a6d75", weight: 1, fillColor: "#8b8e96", fillOpacity: 0.75 };
}
