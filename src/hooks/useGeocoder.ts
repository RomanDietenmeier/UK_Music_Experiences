import { useState, useCallback, useRef } from "react";

export interface GeocoderResult {
  lat: number;
  lng: number;
  displayName: string;
}

export function useGeocoder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeocoderResult | null>(null);
  const lastCall = useRef(0);

  const geocode = useCallback(async (address: string) => {
    if (!address.trim()) {
      setResult(null);
      setError(null);
      return null;
    }

    // Enforce 1 req/sec Nominatim policy
    const now = Date.now();
    const wait = Math.max(0, 1000 - (now - lastCall.current));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall.current = Date.now();

    setLoading(true);
    setError(null);

    try {
      const q = encodeURIComponent(address);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&countrycodes=gb`,
        { headers: { "User-Agent": "UKMusicExperiences/1.0" } }
      );
      const data = await res.json();

      if (!data.length) {
        setError("Address not found");
        setResult(null);
        setLoading(false);
        return null;
      }

      const geo: GeocoderResult = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
      setResult(geo);
      setLoading(false);
      return geo;
    } catch {
      setError("Geocoding failed");
      setResult(null);
      setLoading(false);
      return null;
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { geocode, clear, result, loading, error };
}
