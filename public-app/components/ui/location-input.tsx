"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin } from "lucide-react";

type Suggestion = { id: string; label: string };

// Photon (OpenStreetMap data) — free geocoder built for type-ahead, no API key.
// Results are restricted to Kenya's bounding box.
const PHOTON = "https://photon.komoot.io";
const KENYA_BBOX = "33.9,-4.8,41.95,5.6";

function labelFrom(p: Record<string, string | undefined>) {
  const parts = [p.name, p.street, p.district || p.locality, p.city || p.county, p.state]
    .filter(Boolean) as string[];
  return Array.from(new Set(parts)).join(", ");
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function LocationInput({ value, onChange, className, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${PHOTON}/api/?q=${encodeURIComponent(q)}&limit=6&lang=en&bbox=${KENYA_BBOX}`,
          { signal: ctrl.signal }
        );
        const json = await res.json();
        const items: Suggestion[] = (json.features ?? [])
          .map((f: any, i: number) => ({ id: `${f.properties.osm_id ?? i}-${i}`, label: labelFrom(f.properties) }))
          .filter((s: Suggestion) => s.label);
        setSuggestions(items);
        setOpen(items.length > 0);
      } catch {
        /* aborted or offline — leave the field usable as plain text */
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(label: string) {
    skipNext.current = true;
    onChange(label);
    setOpen(false);
  }

  function useMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Location is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`${PHOTON}/reverse?lat=${latitude}&lon=${longitude}&lang=en`);
          const json = await res.json();
          const label = json.features?.[0] ? labelFrom(json.features[0].properties) : "";
          pick(label || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } catch {
          setError("Couldn't look up your address. Type it instead.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("Location permission denied. Type your location instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="text"
          autoComplete="off"
          value={value}
          placeholder={placeholder ?? "Search town, estate or street"}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className={`${className ?? ""} pl-10 pr-10`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(s.label)}
                className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-60"
      >
        {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" aria-hidden />}
        Use my current location
      </button>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
