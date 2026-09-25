import { createContext, useContext, useCallback, useMemo, useState } from "react";
import { fetchClimate } from "../lib/nasaPower";
import { modelSite } from "../lib/solar";
import { lookupPostal, resolveParcels } from "../lib/geocode";
import { fetchTerrain } from "../lib/elevation";
import { nearestCity } from "../data/cities";
import { getCountry } from "../data/countries";

/**
 * The scan result that Results and the Detailed Report both read from.
 *
 * One scan resolves the chosen point plus three nearby candidate parcels,
 * each fetched from NASA POWER and run through the model, then ranked.
 */

const SiteContext = createContext(null);

const DEFAULT_CONFIG = {
  capacityKwp: 10,
  tariff: 0.15,
  profile: "residential",
  areaSqm: 1500,
  monthlyBill: 240,
};

/* A scan is expensive (three NASA round-trips), so it outlives a refresh or a
   deep link straight to /report. sessionStorage, not localStorage: a new tab
   should start clean rather than resurrect someone else's site. */
const STORE_KEY = "helioscan.scan.v1";

function restore() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.sites?.length || !parsed?.origin) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function SiteProvider({ children }) {
  const saved = restore();

  const [status, setStatus] = useState(saved ? "ready" : "idle"); // idle | scanning | ready | error
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState(saved?.origin ?? null); // {lat,lng,label,country}
  const [sites, setSites] = useState(saved?.sites ?? []); // ranked model results
  const [selectedId, setSelectedId] = useState(saved?.selectedId ?? 0);
  const [config, setConfig] = useState(saved?.config ?? DEFAULT_CONFIG);

  const scan = useCallback(async (point, overrides = {}) => {
    const cfg = { ...DEFAULT_CONFIG, ...config, ...overrides };
    setStatus("scanning");
    setError(null);
    setOrigin(point);

    try {
      /* 1. Resolve the postal code to a real area and radius, so the parcels
            land inside it rather than somewhere in the metro. Falls back to the
            raw pin when there is no postcode or the geocoder is unreachable. */
      let area = null;
      if (point.postal && point.country) {
        try {
          area = await lookupPostal(point.country, point.postal);
        } catch {
          area = null;
        }
      }

      const centre = area ? { lat: area.lat, lng: area.lng } : { lat: point.lat, lng: point.lng };
      const radiusKm = area?.radiusKm ?? 1.5;

      /* Placement is verified, not assumed: each parcel is reverse-geocoded and
         pulled toward the centre until the postcode that comes back is the one
         the user typed. This also yields each parcel's own area name. */
      const parcels = await resolveParcels(centre, radiusKm, area ? point.postal : null);

      /* 2. One climate read. Every parcel is inside the same 0.5° NASA cell, so
            fetching per-parcel would return identical numbers and imply a
            precision the data does not have. */
      const climate = await fetchClimate(centre.lat, centre.lng);

      /* 3. Terrain is what actually separates parcels at this scale — one
            batched DEM call covers all of them. */
      const terrain = await fetchTerrain(parcels);

      const results = parcels.map((p, i) => {
        const model = modelSite({ ...climate, lat: p.lat, lng: p.lng }, { ...cfg, terrain: terrain[i] });
        const near = nearestCity(p.lat, p.lng);
        return {
          ...model,
          parcelName: p.name,
          parcel: p.suffix,
          nearest: near,
          area: p.area || area?.area || near?.city || null,
          road: p.road || null,
          postcode: p.postcode || point.postal || null,
          locality: p.locality || area?.locality || near?.city || null,
          inPostcode: p.inPostcode,
          offsetKm: p.offsetKm,
          terrain: terrain[i] || null,
        };
      });

      // Rank by score; a tie breaks on annual yield.
      results.sort((a, b) => b.score - a.score || b.annualKwh - a.annualKwh);
      const ranked = results.map((r, i) => ({ ...r, rank: i + 1, id: i }));

      const resolvedOrigin = area
        ? { ...point, lat: area.lat, lng: area.lng, area: area.area, locality: area.locality, state: area.state, radiusKm: area.radiusKm }
        : point;
      setOrigin(resolvedOrigin);

      setSites(ranked);
      setSelectedId(0);
      setStatus("ready");
      try {
        sessionStorage.setItem(
          STORE_KEY,
          JSON.stringify({ origin: resolvedOrigin, sites: ranked, selectedId: 0, config: cfg })
        );
      } catch {
        /* quota or private mode — the scan still works for this page view */
      }
      return ranked;
    } catch (e) {
      setError(e.message || "Scan failed");
      setStatus("error");
      throw e;
    }
  }, [config]);

  const value = useMemo(
    () => ({
      status,
      error,
      origin,
      sites,
      config,
      setConfig,
      scan,
      selected: sites[selectedId] || null,
      selectedId,
      selectSite: (id) => {
        setSelectedId(id);
        try {
          const raw = sessionStorage.getItem(STORE_KEY);
          if (raw) sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...JSON.parse(raw), selectedId: id }));
        } catch { /* non-fatal */ }
      },
      hasScan: status === "ready" && sites.length > 0,
      countryOf: (code) => getCountry(code),
    }),
    [status, error, origin, sites, config, scan, selectedId]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}
