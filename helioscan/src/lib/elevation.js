/**
 * Terrain from Open-Meteo's elevation API (Copernicus DEM, ~90 m, keyless).
 *
 * Why this exists: candidate parcels inside one postal code sit in the *same*
 * NASA POWER grid cell (0.5°, ~55 km), so their irradiance and temperature are
 * genuinely identical. Ranking them on climate would be inventing differences.
 * What actually differs at that scale is the ground: elevation, how steep it is,
 * and which way it faces. That is real, measurable, and it is what decides
 * whether one parcel out-performs its neighbour.
 *
 * Slope and aspect use the standard Horn 3x3 method over four DEM samples
 * around each point, so they come from measured terrain rather than assumption.
 */

const ENDPOINT = "https://api.open-meteo.com/v1/elevation";
const CACHE_KEY = "helioscan.dem.v1";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 180; // terrain does not move

/** Neighbour offset for the slope stencil, in metres. */
const STEP_M = 140;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeCache(s) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* non-fatal */
  }
}

/** Fetch elevations for many points in a single request. */
async function fetchElevations(points) {
  const lats = points.map((p) => p.lat.toFixed(5)).join(",");
  const lngs = points.map((p) => p.lng.toFixed(5)).join(",");
  const res = await fetch(`${ENDPOINT}?latitude=${lats}&longitude=${lngs}`);
  if (!res.ok) throw new Error(`Elevation API responded ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json?.elevation)) throw new Error("Elevation API returned no data");
  return json.elevation;
}

/**
 * Elevation, slope and aspect for each parcel.
 *
 * One batched call covers every parcel and its four neighbours (5 samples each).
 * Returns nulls rather than throwing when the DEM is unreachable — terrain is an
 * enrichment, and losing it must not lose the whole scan.
 *
 * @param parcels [{lat,lng}]
 * @returns [{elevation, slopeDeg, aspectDeg, aspectLabel} | null]
 */
export async function fetchTerrain(parcels) {
  if (!parcels.length) return [];

  const cacheKeyFor = (p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
  const store = readCache();
  const cached = parcels.map((p) => {
    const hit = store[cacheKeyFor(p)];
    return hit && Date.now() - hit.at < CACHE_TTL ? hit.data : null;
  });
  if (cached.every(Boolean)) return cached;

  // Build the stencil: centre, N, S, E, W for every parcel that needs one.
  const need = [];
  const samples = [];
  parcels.forEach((p, i) => {
    if (cached[i]) return;
    const dLat = STEP_M / 111_320;
    const dLng = STEP_M / (111_320 * Math.max(0.15, Math.cos((p.lat * Math.PI) / 180)));
    need.push(i);
    samples.push(
      { lat: p.lat, lng: p.lng },
      { lat: p.lat + dLat, lng: p.lng },
      { lat: p.lat - dLat, lng: p.lng },
      { lat: p.lat, lng: p.lng + dLng },
      { lat: p.lat, lng: p.lng - dLng }
    );
  });

  let elev;
  try {
    elev = await fetchElevations(samples);
  } catch {
    return cached; // nulls where unknown
  }

  const next = readCache();
  need.forEach((parcelIdx, k) => {
    const [c, n, s, e, w] = elev.slice(k * 5, k * 5 + 5);
    if ([c, n, s, e, w].some((v) => typeof v !== "number")) return;

    // Horn: gradients in metres per metre.
    const dzdy = (n - s) / (2 * STEP_M);
    const dzdx = (e - w) / (2 * STEP_M);

    const slopeDeg = (Math.atan(Math.hypot(dzdx, dzdy)) * 180) / Math.PI;

    // Aspect = compass bearing the slope faces (downhill), 0 = north.
    let aspectDeg = null;
    if (Math.hypot(dzdx, dzdy) > 1e-6) {
      aspectDeg = (Math.atan2(dzdx, dzdy) * 180) / Math.PI;
      aspectDeg = (aspectDeg + 180) % 360; // downslope
      if (aspectDeg < 0) aspectDeg += 360;
    }

    const data = {
      elevation: Math.round(c),
      slopeDeg: +slopeDeg.toFixed(2),
      aspectDeg: aspectDeg === null ? null : Math.round(aspectDeg),
      aspectLabel: aspectDeg === null ? "Flat" : compass(aspectDeg),
    };
    cached[parcelIdx] = data;
    next[cacheKeyFor(parcels[parcelIdx])] = { at: Date.now(), data };
  });
  writeCache(next);

  return cached;
}

const POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export function compass(deg) {
  return POINTS[Math.round(deg / 22.5) % 16];
}
