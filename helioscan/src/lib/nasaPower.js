/**
 * NASA POWER climatology client.
 *
 * POWER serves a 20+ year satellite-derived climatology for any point on Earth,
 * needs no API key, and sends `access-control-allow-origin: *`, so the browser
 * can call it directly — no proxy, no server. This is the real measurement
 * layer the rest of the app models on top of.
 *
 * Docs: https://power.larc.nasa.gov/docs/services/api/temporal/climatology/
 */

const ENDPOINT = "https://power.larc.nasa.gov/api/temporal/climatology/point";

const PARAMS = [
  "ALLSKY_SFC_SW_DWN", // all-sky GHI, kWh/m²/day
  "CLRSKY_SFC_SW_DWN", // clear-sky GHI — the pair gives cloud attenuation
  "T2M", // 2 m air temperature, °C (thermal derate)
  "WS2M", // 2 m wind speed, m/s (module cooling)
].join(",");

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const CACHE_KEY = "helioscan.power.v1";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // climatology is static; a month is plenty

/* Grid cells are 0.5°, so rounding the key to 2dp collapses duplicate calls
   for nearby pins without changing which cell we hit. */
const keyOf = (lat, lng) => `${lat.toFixed(2)},${lng.toFixed(2)}`;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(store) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    /* private mode / quota — the network path still works */
  }
}

const inflight = new Map();

/**
 * @returns {Promise<{ghiMonthly:number[], ghi:number, clearMonthly:number[], clear:number,
 *                    tempMonthly:number[], temp:number, wind:number, elevation:number|null,
 *                    lat:number, lng:number, source:'nasa-power'|'cache'}>}
 */
export async function fetchClimate(lat, lng, { signal } = {}) {
  const key = keyOf(lat, lng);

  const store = readCache();
  const hit = store[key];
  if (hit && Date.now() - hit.at < CACHE_TTL) {
    return { ...hit.data, source: "cache" };
  }

  if (inflight.has(key)) return inflight.get(key);

  const url =
    `${ENDPOINT}?parameters=${PARAMS}&community=RE` +
    `&longitude=${lng.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;

  const task = (async () => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`NASA POWER responded ${res.status}`);
    const json = await res.json();

    const p = json?.properties?.parameter;
    if (!p?.ALLSKY_SFC_SW_DWN) throw new Error("NASA POWER returned no irradiance for this point");

    const series = (name) => MONTHS.map((m) => p[name]?.[m]).map((v) => (typeof v === "number" && v > -100 ? v : null));
    const annual = (name, fallbackSeries) => {
      const a = p[name]?.ANN;
      if (typeof a === "number" && a > -100) return a;
      const vals = fallbackSeries.filter((v) => v !== null);
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    };

    const ghiMonthly = series("ALLSKY_SFC_SW_DWN");
    const clearMonthly = series("CLRSKY_SFC_SW_DWN");
    const tempMonthly = series("T2M");

    const data = {
      lat,
      lng,
      ghiMonthly,
      ghi: annual("ALLSKY_SFC_SW_DWN", ghiMonthly),
      clearMonthly,
      clear: annual("CLRSKY_SFC_SW_DWN", clearMonthly),
      tempMonthly,
      temp: annual("T2M", tempMonthly),
      wind: annual("WS2M", series("WS2M")),
      elevation: json?.geometry?.coordinates?.[2] ?? null,
    };

    const next = readCache();
    next[key] = { at: Date.now(), data };
    writeCache(next);

    return { ...data, source: "nasa-power" };
  })().finally(() => inflight.delete(key));

  inflight.set(key, task);
  return task;
}

export { MONTHS };
