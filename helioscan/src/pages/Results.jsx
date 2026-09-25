import { Link, useNavigate, useViewTransitionState } from "react-router-dom";
import { motion } from "motion/react";

import Reveal from "../components/Reveal";
import ResultsMap from "../components/ResultsMap";
import Flag from "../components/Flag";
import CountUp from "../components/CountUp";
import { useSite } from "../state/SiteContext";
import { rankLabel } from "../lib/solar";
import { getCountry } from "../data/countries";
import { downloadCsv, buildMatrixRows, slug } from "../lib/exportData";

const EASE = [0.22, 1, 0.36, 1];

const money = (n) => "$" + Math.round(n).toLocaleString();
const num = (n) => Math.round(n).toLocaleString();

function EmptyState() {
  const navigate = useNavigate();
  return (
    <Reveal.Page className="w-full pt-16 min-h-[calc(100vh-4rem)]">
      <div className="max-w-xl mx-auto px-margin py-space-xl flex flex-col items-center text-center gap-space-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary"
        >
          <span className="material-symbols-outlined text-[30px]">travel_explore</span>
        </motion.div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          No scan run yet
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Pick a location and HelioScan will pull live NASA POWER climatology for that
          exact point, model three candidate parcels and rank them.
        </p>
        <motion.button
          type="button"
          onClick={() => navigate("/find")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-space-xs px-space-lg py-3 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
          Choose a location
        </motion.button>
      </div>
    </Reveal.Page>
  );
}

export default function Results() {
  const { sites, origin, hasScan, selectedId, selectSite, config } = useSite();
  /* True while the browser is morphing between this page and the report, in
     either direction, so the selected card can hand its box to the report
     header and take it back on the way home. */
  const toReport = useViewTransitionState("/report");
  const toResults = useViewTransitionState("/results");
  const morphing = toReport || toResults;

  if (!hasScan) return <EmptyState />;

  const country = origin?.country ? getCountry(origin.country) : null;
  const best = sites[0];

  const METRICS = [
    { label: "Area", get: (s) => s.area || s.nearest?.city || "—" },
    { label: "Postal Code", get: (s) => s.postcode || "—" },
    { label: "Distance from Centre", get: (s) => (s.offsetKm === 0 ? "centre" : s.offsetKm + " km") },
    { label: "Elevation", get: (s) => (s.terrain ? s.terrain.elevation + " m" : "—") },
    { label: "Terrain Slope", get: (s) => (s.terrain ? s.terrain.slopeDeg + "°" : "—") },
    {
      label: "Slope Aspect",
      get: (s) =>
        s.terrain?.aspectDeg === null || !s.terrain
          ? "Flat"
          : `${s.terrain.aspectLabel} (${s.terrain.aspectDeg}°)`,
    },
    { label: "Annual Solar Irradiance (GHI)", get: (s) => num(s.ghiAnnual) + " kWh/m²" },
    { label: "Daily Sunlight", get: (s) => s.ghiDay + " kWh/m²/d" },
    { label: "PVWatts Est. Annual Output", get: (s) => num(s.annualKwh) + " kWh/yr" },
    { label: "Specific Yield", get: (s) => num(s.specificYield) + " kWh/kWp" },
    { label: "Annual Cloud Attenuation", get: (s) => s.cloudLossPct + "%" },
    { label: "Mean Air Temperature", get: (s) => s.ambientC + " °C" },
    { label: "Thermal Derate", get: (s) => "−" + s.tempDeratePct + "%" },
    { label: "Optimal Tilt & Azimuth", get: (s) => `${s.tilt}° @ ${s.azimuth}°` },
    { label: "Est. 25-Year Savings", get: (s) => money(s.lifetimeSavings) },
    { label: "Projected Payback", get: (s) => (s.payback ? s.payback + " years" : "—") },
  ];

  return (
    <Reveal.Page className="w-full pt-16 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col w-full">
        {/* ------------------------------------------------- query banner */}
        <div className="w-full bg-surface-container-low/70 py-space-sm px-margin border-b border-surface-container-high/40">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm font-body-md text-body-md">
              <span className="material-symbols-outlined text-[19px] text-secondary">
                location_on
              </span>
              {country && <Flag code={country.code} size={18} />}
              <span className="font-semibold text-on-surface">
                {origin.postal ? `${origin.postal} · ` : ""}
                {origin.area || origin.label}
              </span>
              {origin.locality && origin.locality !== origin.area && (
                <span className="text-on-surface-variant">{origin.locality}</span>
              )}
              <span className="text-outline-variant">—</span>
              <span className="text-on-surface-variant">
                {sites.length} parcels within
                {origin.radiusKm ? ` ${origin.radiusKm.toFixed(1)} km` : ""} of the
                postcode centre
              </span>
            </div>
            <div className="flex items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
              <span className="font-mono text-on-surface">
                {Math.abs(origin.lat).toFixed(3)}°{origin.lat >= 0 ? "N" : "S"}{" "}
                {Math.abs(origin.lng).toFixed(3)}°{origin.lng >= 0 ? "E" : "W"}
              </span>
              <span className="text-tertiary-fixed-dim font-bold">● NASA POWER LIVE</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- the map */}
        <section className="w-full px-margin py-space-lg bg-transparent" data-reveal-group="">
          <div className="max-w-7xl mx-auto">
            <ResultsMap
              sites={sites}
              selectedId={selectedId}
              onSelect={selectSite}
              height={380}
            />
          </div>
        </section>

        {/* ---------------------------------------------------- site cards */}
        <section className="w-full px-margin py-space-lg bg-transparent" data-reveal-group="">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-wrap items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <h2
                  className="font-headline-lg text-headline-lg text-on-surface tracking-tight"
                  data-reveal=""
                >
                  Evaluated Site Profiles
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Modeled at {config.capacityKwp} kWp on ${config.tariff.toFixed(2)}/kWh ·
                  NREL PVWatts derate over NASA POWER climatology.
                </p>
              </div>
              <span className="px-space-sm py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                Sorted by HelioScore
              </span>
            </div>

            {/* Parcels inside one postcode share a NASA grid cell, so when the
                terrain is also alike the scores are genuinely equal. Saying so
                is more useful than implying a winner the data cannot support. */}
            {sites.length > 1 && sites[0].score - sites[sites.length - 1].score <= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex items-start gap-space-sm px-space-lg py-space-md rounded-xl bg-surface-container-low border border-surface-container"
              >
                <span className="material-symbols-outlined text-[19px] text-secondary shrink-0">
                  balance
                </span>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  <span className="text-on-surface font-semibold">
                    These parcels are equivalent within the model's resolution.
                  </span>{" "}
                  They sit inside one NASA POWER grid cell (0.5°, ~55 km), so their
                  irradiance and temperature are identical by measurement, and the
                  terrain between them varies too little to separate them. Choose on
                  roof access, shading and grid connection rather than on score.
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {sites.map((s, i) => {
                const rl = rankLabel(s.score);
                const isTop = s.rank === 1;
                return (
                  <div
                    key={s.id}
                    /* Only the site being opened may claim the name — a
                       view-transition-name must be unique within a snapshot, and
                       three cards claiming it silently kills the whole morph. */
                    style={
                      morphing && s.id === selectedId
                        ? { viewTransitionName: "site-plate" }
                        : undefined
                    }
                    className="h-full rounded-xl"
                  >
                  {/* Plain div, not SpotlightCard: that component ships its own
                      bg-neutral-900 and border, which beat .glass in the cascade
                      and rendered every card as a dark slab — and its cursor
                      spotlight is exactly what .glass-lens already provides. */}
                  <div
                    className={`h-full glass glass-edge glass-lens glass-hover rounded-xl p-space-lg flex flex-col gap-space-md ${
                      s.id === selectedId ? "ring-2 ring-secondary" : ""
                    }`}
                  >
                    <div
                      onMouseEnter={() => selectSite(s.id)}
                      className="flex flex-col gap-space-md"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm font-bold uppercase tracking-wider ${
                            isTop
                              ? "bg-tertiary-fixed-dim text-tertiary-container"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          #{s.rank} {isTop ? "Best Choice" : rl.label}
                        </span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-display-xl text-display-xl text-on-surface font-bold leading-none">
                            <CountUp to={s.score} duration={1.4} />
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            /100
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                          {s.parcelName}
                        </h3>
                        {/* the area this parcel actually sits in, inside the postcode */}
                        <p className="font-body-md text-body-md text-on-surface flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[15px] text-secondary">
                            location_on
                          </span>
                          <span className="font-semibold truncate">
                            {s.area || s.nearest?.city || "Unnamed area"}
                          </span>
                          {s.road && (
                            <span className="text-on-surface-variant truncate">· {s.road}</span>
                          )}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant flex flex-wrap items-center gap-x-space-xs">
                          <span>{s.postcode || "—"}</span>
                          <span className="text-outline-variant">·</span>
                          <span>Parcel {s.parcel}</span>
                          <span className="text-outline-variant">·</span>
                          <span>
                            {s.offsetKm === 0
                              ? "postcode centre"
                              : `${s.offsetKm} km from centre`}
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-space-sm">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                            Est. Yearly Energy
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            {num(s.annualKwh)}
                            <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                              {" "}
                              kWh
                            </span>
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                            Daily Sunlight
                          </span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            {s.ghiDay}
                            <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                              {" "}
                              kWh/m²
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* score bar */}
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-secondary rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.1 }}
                        />
                      </div>

                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        <span className="text-on-surface font-semibold">Why this spot: </span>
                        {s.terrain
                          ? `${s.terrain.elevation} m elevation on a ${s.terrain.slopeDeg}° ${s.terrain.aspectLabel}-facing slope`
                          : "Terrain data unavailable"}
                        , {s.tilt}° optimal array tilt, {s.cloudLossPct}% cloud
                        attenuation.
                      </p>

                      <Link viewTransition
                        to="/report"
                        onClick={() => selectSite(s.id)}
                        className={`group mt-auto flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-full font-label-lg text-label-lg transition-all ${
                          isTop
                            ? "bg-tertiary-fixed-dim text-tertiary-container shadow-md hover:shadow-lg"
                            : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        View Full Report
                        <span className="material-symbols-outlined text-[17px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------ verification matrix */}
        <section
          className="w-full px-margin py-space-xl bg-surface-container-low/40"
          data-reveal-group=""
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-wrap items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <h2
                  className="font-headline-lg text-headline-lg text-on-surface tracking-tight"
                  data-reveal=""
                >
                  Cross-Site Verification Matrix
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Side-by-side physical and economic telemetry for every candidate.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    buildMatrixRows(sites, METRICS, origin),
                    `helioscan-${slug(origin.postal || origin.area || origin.label)}-comparison`
                  )
                }
                className="flex items-center gap-space-xs px-space-md py-2 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-secondary">
                  download
                </span>
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto glass glass-edge glass-lens glass-hover rounded-xl border border-surface-container shadow-sm">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-surface-container">
                    <th className="text-left px-space-lg py-space-md font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Metric
                    </th>
                    {sites.map((s) => (
                      <th
                        key={s.id}
                        className={`text-left px-space-lg py-space-md font-label-md text-label-md ${
                          s.rank === 1 ? "text-secondary" : "text-on-surface"
                        }`}
                      >
                        #{s.rank} {s.parcelName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS.map((m, i) => (
                    <motion.tr
                      key={m.label}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                      className="border-b border-surface-container last:border-0 hover:bg-surface-container-low/60 transition-colors"
                    >
                      <td className="px-space-lg py-space-sm font-body-md text-body-md text-on-surface-variant">
                        {m.label}
                      </td>
                      {sites.map((s) => (
                        <td
                          key={s.id}
                          className={`px-space-lg py-space-sm font-label-lg text-label-lg ${
                            s.rank === 1 ? "text-on-surface font-semibold" : "text-on-surface"
                          }`}
                        >
                          {m.get(s)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-sm">
              <Link viewTransition
                to="/find"
                className="flex items-center gap-space-xs px-space-lg py-3 rounded-full bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  travel_explore
                </span>
                Scan another location
              </Link>
              <Link viewTransition
                to="/report"
                onClick={() => selectSite(best.id)}
                className="flex items-center gap-space-xs px-space-lg py-3 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                Open the winning report
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Reveal.Page>
  );
}
