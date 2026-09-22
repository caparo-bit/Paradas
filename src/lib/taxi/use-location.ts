import { useCallback, useEffect, useRef, useState } from "react";

export interface GeoPos {
  lat: number;
  lng: number;
  accuracy: number;
}

export function useLocation() {
  const [pos, setPos] = useState<GeoPos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const watchRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setWatching(false);
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Este dispositivo no ofrece ubicación.");
      return;
    }
    if (watchRef.current != null) return;
    setError(null);
    setWatching(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
        });
        setError(null);
      },
      (err) => {
        setError(err.code === 1 ? "Ubicación denegada." : "No se pudo obtener la ubicación.");
        setWatching(false);
      },
      { enableHighAccuracy: true, maximumAge: 8_000, timeout: 12_000 },
    );
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { pos, error, watching, start, stop };
}
