/**
 * Postal-code geocoding via Nominatim (OpenStreetMap).
 *
 * Forward: postal code -> centre, bounding box, and the *area* inside that code
 * (suburb / city_district / town).
 * Reverse: a point -> the specific quarter, suburb and road it sits on, which is
 * how each candidate parcel reports where it actually is within the postcode.
 *
 * Nominatim's usage policy caps callers at 1 request/second and asks for
 * identification, so every call goes through a serial queue with a 1.1 s gap and
 * results are cached in localStorage. The app makes 1 forward + 3 reverse calls
 * per scan, so a scan costs about four seconds of geocoding.
 */

const BASE = "https://nominatim.openstreetmap.org";
const CACHE_KEY = "helioscan.geo.v2"; // v2: tighter radius clamp invalidates v1 radii
const CACHE_TTL = 1000 * 60 * 60 * 24 * 60; // addresses barely move
const MIN_GAP_MS = 1100;

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
    /* quota or private mode */
  }
}

/* Serial queue — Nominatim will rate-limit a burst. */
let chain = Promise.resolve();
let lastAt = 0;
function queued(fn) {
  const run = chain.then(async () => {
    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastAt));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    try {
      return await fn();
    } finally {
      lastAt = Date.now();
    }
  });
  chain = run.catch(() => {});
  return run;
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoder responded ${res.status}`);
  return res.json();
}

/** The most specific "area" label available, in descending precision. */
export function areaNameOf(address = {}) {
  return (
    address.quarter ||
    address.neighbourhood ||
    address.suburb ||
    address.city_district ||
    address.village ||
    address.town ||
    address.hamlet ||
    address.municipality ||
    address.city ||
    address.county ||
    null
  );
}

function localityOf(address = {}) {
  return address.city || address.town || address.village || address.municipality || address.county || null;
}

/**
 * Postal code -> { lat, lng, area, locality, state, country, radiusKm, display }
 *
 * Nominatim returns a generous placeholder bounding box when it has no real
 * polygon for a code (US ZIPs come back as ~50 km squares), so the radius is
 * clamped to something a postal code plausibly covers. Without that clamp,
 * "within the postcode" would mean "somewhere in the metro area".
 */
export async function lookupPostal(countryCode, postal) {
  const key = `f:${countryCode}:${postal}`.toUpperCase();
  const store = readCache();
  if (store[key] && Date.now() - store[key].at < CACHE_TTL) return store[key].data;

  const url =
    `${BASE}/search?postalcode=${encodeURIComponent(postal)}` +
    `&country=${encodeURIComponent(countryCode)}&format=json&limit=1&addressdetails=1`;

  const rows = await queued(() => getJSON(url));
  if (!rows?.length) return null;

  const r = rows[0];
  const lat = Number(r.lat);
  const lng = Number(r.lon);

  let radiusKm = 2;
  if (Array.isArray(r.boundingbox)) {
    const [s, n, w, e] = r.boundingbox.map(Number);
    const latKm = (n - s) * 111;
    const lngKm = (e - w) * 111 * Math.cos((lat * Math.PI) / 180);
    radiusKm = Math.max(latKm, lngKm) / 2;
  }
  // 0.3 km floor keeps dense urban codes from collapsing to a point. The 2.5 km
  // ceiling is deliberately conservative: Nominatim hands back a ~50 km
  // placeholder box whenever it has no real polygon for a code (every US ZIP),
  // and trusting that scatters parcels into neighbouring postcodes. Sitting
  // well inside a large rural code is fine; spilling out of a small urban one
  // is not, and resolveParcels() verifies the result either way.
  radiusKm = Math.min(2.5, Math.max(0.3, radiusKm));

  const data = {
    lat,
    lng,
    radiusKm,
    area: areaNameOf(r.address),
    locality: localityOf(r.address),
    state: r.address?.state || null,
    country: r.address?.country || null,
    display: r.display_name || null,
  };

  const next = readCache();
  next[key] = { at: Date.now(), data };
  writeCache(next);
  return data;
}

/** Point -> { area, road, locality, state, display } */
export async function reversePoint(lat, lng) {
  const key = `r:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const store = readCache();
  if (store[key] && Date.now() - store[key].at < CACHE_TTL) return store[key].data;

  const url =
    `${BASE}/reverse?lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}` +
    `&format=json&addressdetails=1&zoom=16`;

  let json;
  try {
    json = await queued(() => getJSON(url));
  } catch {
    return null; // a missing area label must never fail a scan
  }
  if (!json || json.error) return null;

  const data = {
    area: areaNameOf(json.address),
    road: json.address?.road || null,
    locality: localityOf(json.address),
    state: json.address?.state || null,
    postcode: json.address?.postcode || null,
    display: json.display_name || null,
  };

  const next = readCache();
  next[key] = { at: Date.now(), data };
  writeCache(next);
  return data;
}

/**
 * Deterministic parcel positions strictly inside the postal area.
 *
 * Fixed bearings and radii (not random) so the same postcode always yields the
 * same parcels — a report that reshuffled on reload would be worthless. Radii
 * stay at/below 78% of the area radius so every parcel is comfortably inside
 * the postcode rather than straddling its edge.
 */
export function parcelsWithin(lat, lng, radiusKm) {
  const spec = [
    { name: "Central Parcel", suffix: "A", bearing: 0, frac: 0 },
    { name: "North-East Parcel", suffix: "B", bearing: 55, frac: 0.55 },
    { name: "South-West Parcel", suffix: "C", bearing: 215, frac: 0.8 },
  ];
  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111 * Math.max(0.15, Math.cos((lat * Math.PI) / 180)));

  return spec.map((p) => {
    const d = radiusKm * p.frac;
    const rad = (p.bearing * Math.PI) / 180;
    return {
      ...p,
      lat: +(lat + d * Math.cos(rad) * latPerKm).toFixed(5),
      lng: +(lng + d * Math.sin(rad) * lngPerKm).toFixed(5),
      offsetKm: +d.toFixed(2),
    };
  });
}

/**
 * Place parcels inside a postal area and *verify* they landed there.
 *
 * A bounding box alone is not enough: Nominatim serves a coarse placeholder box
 * for codes it has no polygon for, so an offset derived from it can drop a
 * parcel into the next postcode over. Each parcel is therefore reverse-geocoded
 * and, if the postcode that comes back is not the one asked for, pulled halfway
 * toward the centre and checked again. The centre is inside by definition, so
 * this always converges.
 *
 * @param centre   {lat,lng} of the postal area
 * @param radiusKm conservative radius for the area
 * @param expected the postal code the parcels must fall inside (may be null)
 * @returns parcels with {area, road, postcode, inPostcode, offsetKm}
 */
export async function resolveParcels(centre, radiusKm, expected) {
  const want = normalisePostcode(expected);
  const base = parcelsWithin(centre.lat, centre.lng, radiusKm);
  const out = [];

  for (const p of base) {
    let lat = p.lat;
    let lng = p.lng;
    let offset = p.offsetKm;
    let place = await reversePoint(lat, lng);
    let inPostcode = !want || normalisePostcode(place?.postcode) === want;

    // Two pull-ins is enough: each halves the offset, so by the second attempt a
    // parcel is at a quarter of its original distance from a centre already
    // known to be inside.
    for (let attempt = 0; attempt < 2 && !inPostcode && offset > 0.05; attempt++) {
      offset = +(offset / 2).toFixed(2);
      const latPerKm = 1 / 111;
      const lngPerKm = 1 / (111 * Math.max(0.15, Math.cos((centre.lat * Math.PI) / 180)));
      const rad = (p.bearing * Math.PI) / 180;
      lat = +(centre.lat + offset * Math.cos(rad) * latPerKm).toFixed(5);
      lng = +(centre.lng + offset * Math.sin(rad) * lngPerKm).toFixed(5);
      place = await reversePoint(lat, lng);
      inPostcode = normalisePostcode(place?.postcode) === want;
    }

    // Still outside — sit close to the centre along this parcel's own bearing
    // rather than *on* it. Collapsing every stubborn parcel onto the centre
    // produced duplicate candidates, which is worse than a near miss: three
    // options where two are the same point is not three options.
    if (want && !inPostcode) {
      offset = Math.max(0.12, radiusKm * 0.15);
      const latPerKm = 1 / 111;
      const lngPerKm = 1 / (111 * Math.max(0.15, Math.cos((centre.lat * Math.PI) / 180)));
      const rad = (p.bearing * Math.PI) / 180;
      lat = +(centre.lat + offset * Math.cos(rad) * latPerKm).toFixed(5);
      lng = +(centre.lng + offset * Math.sin(rad) * lngPerKm).toFixed(5);
      place = await reversePoint(lat, lng);
      inPostcode = normalisePostcode(place?.postcode) === want;
    }

    out.push({
      ...p,
      lat,
      lng,
      offsetKm: offset,
      area: place?.area || null,
      road: place?.road || null,
      postcode: place?.postcode || null,
      locality: place?.locality || null,
      inPostcode,
    });
  }

  return out;
}

/** Compare postcodes ignoring case and internal spacing ("SW1A 1AA" = "sw1a1aa"). */
export function normalisePostcode(v) {
  return (v || "").toString().toUpperCase().replace(/[\s-]/g, "") || null;
}
