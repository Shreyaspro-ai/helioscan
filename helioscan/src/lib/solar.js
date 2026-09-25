/**
 * Solar yield + suitability model.
 *
 * Takes the real NASA POWER climatology for a point and runs a PVWatts-style
 * derate chain over it, then scores the site on the same four weighted
 * dimensions the Methodology page publishes:
 *
 *   Solar Irradiance 40% · Thermal & Weather 25% · Terrain & Aspect 20% · Payback 15%
 *
 * Every constant below is stated rather than tuned, so a reader can check the
 * arithmetic — which is the whole claim the product makes about itself.
 */

/** NREL PVWatts v8 default DC→AC derate, excluding temperature. */
export const SYSTEM_DERATE = 0.86;
/** Crystalline-silicon power temperature coefficient, %/°C above 25 °C cell. */
const TEMP_COEFF = -0.0035;
/** NOCT rise over ambient at 800 W/m², before wind correction. */
const NOCT_RISE = 22;
/** Installed cost, USD per Wp — mid-range for a small commercial rooftop. */
export const COST_PER_WP = 1.6;
/** Annual module degradation. */
const DEGRADATION = 0.005;
/** Grid carbon intensity, kg CO2e per kWh (global average-ish). */
export const GRID_CO2 = 0.42;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round = (v, d = 0) => {
  const f = 10 ** d;
  return Math.round(v * f) / f;
};

/**
 * Latitude-based optimal fixed tilt. Standard field heuristic: tilt tracks
 * latitude but flattens at high latitude where winter gain stops paying.
 */
export function optimalTilt(lat) {
  const a = Math.abs(lat);
  if (a <= 25) return round(a * 0.87, 1);
  if (a <= 50) return round(a * 0.76 + 3.1, 1);
  return round(a * 0.5 + 16.3, 1);
}

/** Equator-facing azimuth: due south above the equator, due north below. */
export function optimalAzimuth(lat) {
  return lat >= 0 ? 180 : 0;
}

/**
 * Tilting a plane toward the sun gains over a horizontal one. A full transposition
 * model needs hourly DNI/DHI; POWER climatology gives daily GHI, so this uses the
 * standard closed-form approximation, capped at the ~1.25x a fixed tilt can realise.
 */
function tiltGain(lat) {
  const a = Math.abs(lat);
  return clamp(1 + 0.0045 * a + 0.000045 * a * a, 1, 1.25);
}

/** Cell temperature from ambient + irradiance heating, less wind cooling. */
function cellTemp(ambientC, windMs) {
  const cooling = clamp(1 - 0.045 * (windMs ?? 2), 0.6, 1);
  return ambientC + NOCT_RISE * cooling;
}

/**
 * Run the model.
 *
 * @param climate  result of fetchClimate()
 * @param opts     { capacityKwp, tariff, profile }
 */
export function modelSite(climate, opts = {}) {
  const {
    capacityKwp = 10,
    tariff = 0.15, // USD per kWh
    profile = "residential",
  } = opts;

  const lat = climate.lat;
  const ghiDay = climate.ghi; // kWh/m²/day, all-sky
  const clearDay = climate.clear || ghiDay;
  const ambientRaw = climate.temp ?? 20;
  const wind = climate.wind ?? 2;

  // --- terrain --------------------------------------------------------------
  // Parcels inside one postal code share a NASA grid cell, so the ground is what
  // separates them: a slope facing the equator gains, one facing away loses, and
  // elevation cools the modules.
  const terrain = opts.terrain || null;
  const idealAz = optimalAzimuth(lat);
  const slopeDeg = terrain?.slopeDeg ?? 0;
  const aspectDeg = terrain?.aspectDeg ?? null;

  // How far the natural slope faces away from the equator, 0-180°.
  const aspectError =
    aspectDeg === null ? 0 : Math.abs(((aspectDeg - idealAz + 540) % 360) - 180);

  // A steep slope only matters as much as it is misaimed; on flat ground the
  // array is mounted at will, so aspect is irrelevant.
  const slopeWeight = Math.min(1, slopeDeg / 20);
  const terrainFactor = 1 - slopeWeight * (aspectError / 180) * 0.16;

  // Standard environmental lapse rate, 6.5 °C per km of elevation.
  const elevation = terrain?.elevation ?? climate.elevation ?? null;
  const lapseAdj =
    elevation !== null && climate.elevation !== null && climate.elevation !== undefined
      ? ((climate.elevation - elevation) / 1000) * 6.5
      : 0;

  // --- irradiance -----------------------------------------------------------
  const tilt = optimalTilt(lat);
  const azimuth = idealAz;
  const poaDay = ghiDay * tiltGain(lat) * terrainFactor; // plane-of-array
  const ghiAnnual = ghiDay * 365; // kWh/m²/yr
  const poaAnnual = poaDay * 365;

  // --- losses ---------------------------------------------------------------
  const cloudLoss = clamp(1 - ghiDay / clearDay, 0, 1); // fraction of clear-sky lost
  const ambient = ambientRaw + lapseAdj;
  const tCell = cellTemp(ambient, wind);
  const tempDerate = clamp(1 + TEMP_COEFF * (tCell - 25), 0.6, 1.05);
  const totalDerate = SYSTEM_DERATE * tempDerate;

  // --- yield ----------------------------------------------------------------
  const specificYield = poaAnnual * totalDerate; // kWh per kWp per year
  const annualKwh = specificYield * capacityKwp;
  const capacityFactor = annualKwh / (capacityKwp * 8760);

  const monthlyKwh = (climate.ghiMonthly || []).map((g, i) => {
    if (g === null) return 0;
    const days = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i];
    const mAmbient = climate.tempMonthly?.[i] ?? ambient;
    const mDerate = SYSTEM_DERATE * clamp(1 + TEMP_COEFF * (cellTemp(mAmbient, wind) - 25), 0.6, 1.05);
    return round(g * tiltGain(lat) * days * mDerate * capacityKwp);
  });

  // --- economics ------------------------------------------------------------
  const capex = capacityKwp * 1000 * COST_PER_WP;
  const yearOneSavings = annualKwh * tariff;

  let cumulative = 0;
  let payback = null;
  const cashflow = [];
  for (let y = 1; y <= 25; y++) {
    const yearKwh = annualKwh * (1 - DEGRADATION) ** (y - 1);
    cumulative += yearKwh * tariff;
    cashflow.push({ year: y, cumulative: round(cumulative - capex) });
    if (payback === null && cumulative >= capex) {
      const prev = cumulative - yearKwh * tariff;
      payback = round(y - 1 + (capex - prev) / (yearKwh * tariff), 1);
    }
  }
  const lifetimeSavings = round(cumulative - capex);
  const lifetimeKwh = annualKwh * ((1 - (1 - DEGRADATION) ** 25) / DEGRADATION);

  // --- environment ----------------------------------------------------------
  const co2PerYear = (annualKwh * GRID_CO2) / 1000; // tonnes
  const co2Lifetime = (lifetimeKwh * GRID_CO2) / 1000;
  const treesEquivalent = Math.round((co2Lifetime * 1000) / 21); // ~21 kg CO2/tree/yr

  // --- scoring --------------------------------------------------------------
  // Irradiance: 3.0 kWh/m²/day scores 0, 7.0 scores 100 — the real global spread.
  const sIrradiance = clamp(((ghiDay - 3.0) / 4.0) * 100, 0, 100);
  // Thermal: penalise both cloud loss and heat derate.
  const sThermal = clamp(100 - cloudLoss * 160 - (1 - tempDerate) * 420, 0, 100);
  // Terrain: measured slope and aspect from the DEM. A gentle equator-facing
  // slope is ideal; steep ground aimed away from the sun is the penalty.
  const sTerrain = terrain
    ? clamp(100 - (aspectError / 180) * slopeWeight * 90 - Math.max(0, slopeDeg - 12) * 3.2, 0, 100)
    : clamp(100 - Math.max(0, Math.abs(lat) - 15) * 1.15, 0, 100);
  // Payback: 4 years scores 100, 20 years scores 0.
  const sPayback = payback === null ? 0 : clamp(((20 - payback) / 16) * 100, 0, 100);

  const score = Math.round(
    sIrradiance * 0.4 + sThermal * 0.25 + sTerrain * 0.2 + sPayback * 0.15
  );

  return {
    lat,
    lng: climate.lng,
    cellElevation: climate.elevation, // NASA grid-cell mean, for reference

    ghiDay: round(ghiDay, 2),
    ghiAnnual: round(ghiAnnual),
    poaAnnual: round(poaAnnual),
    clearDay: round(clearDay, 2),
    cloudLossPct: round(cloudLoss * 100, 1),
    ambientC: round(ambient, 1),
    cellC: round(tCell, 1),
    windMs: round(wind, 1),

    tilt,
    azimuth,
    elevation: elevation,
    slopeDeg: terrain ? terrain.slopeDeg : null,
    aspectDeg: terrain ? terrain.aspectDeg : null,
    aspectLabel: terrain ? terrain.aspectLabel : null,
    terrainFactorPct: +((1 - terrainFactor) * 100).toFixed(1),
    tempDeratePct: round((1 - tempDerate) * 100, 1),
    systemDerate: round(totalDerate, 3),
    specificYield: round(specificYield),
    capacityFactorPct: round(capacityFactor * 100, 1),

    capacityKwp: round(capacityKwp, 1),
    annualKwh: round(annualKwh),
    monthlyKwh,
    monthlyGhi: climate.ghiMonthly,

    capex: round(capex),
    tariff,
    yearOneSavings: round(yearOneSavings),
    payback,
    lifetimeSavings,
    cashflow,

    co2PerYear: round(co2PerYear, 1),
    co2Lifetime: round(co2Lifetime),
    treesEquivalent,

    profile,
    breakdown: [
      { key: "Solar Irradiance", weight: 40, score: Math.round(sIrradiance) },
      { key: "Thermal & Weather", weight: 25, score: Math.round(sThermal) },
      { key: "Terrain & Aspect", weight: 20, score: Math.round(sTerrain) },
      { key: "Payback Velocity", weight: 15, score: Math.round(sPayback) },
    ],
    score,
  };
}

/** Score → the badge language the Results page uses. */
export function rankLabel(score) {
  if (score >= 85) return { label: "Excellent", tone: "best" };
  if (score >= 70) return { label: "Suitable", tone: "good" };
  if (score >= 55) return { label: "Viable", tone: "ok" };
  return { label: "Marginal", tone: "low" };
}

/**
 * Candidate parcels for a chosen point.
 *
 * The first candidate IS the selected point — that is the site the user asked
 * about. The other two are regional alternatives.
 *
 * Their spacing is not cosmetic: NASA POWER serves a 0.5° x 0.5° grid, roughly
 * 55 km, so candidates only a few km apart resolve to the *same* cell and come
 * back with byte-identical climate, making the comparison meaningless. The
 * offsets below are ~0.45-0.75° so each parcel lands in a distinct cell and the
 * ranking reflects real differences in the data.
 *
 * Offsets are fixed rather than random, so a given site always yields the same
 * three candidates — a report that changed on reload would be worthless.
 */
export function candidateOffsets(lat, lng) {
  // Converge the longitude spread near the poles so offsets stay sane.
  const lngScale = 1 / Math.max(0.35, Math.cos((lat * Math.PI) / 180));
  const clampLat = (v) => clamp(v, -89.5, 89.5);
  const wrapLng = (v) => ((((v + 180) % 360) + 360) % 360) - 180;

  return [
    { name: "Selected Site", suffix: "SITE-0", dLat: 0, dLng: 0 },
    { name: "Northern Ridge", suffix: "402-A", dLat: 0.52, dLng: 0.48 * lngScale },
    { name: "Southern Basin", suffix: "118-C", dLat: -0.58, dLng: 0.62 * lngScale },
  ].map((o) => ({
    ...o,
    lat: round(clampLat(lat + o.dLat), 4),
    lng: round(wrapLng(lng + o.dLng), 4),
  }));
}
