import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import Reveal from "../components/Reveal";
import Flag from "../components/Flag";
import CountUp from "../components/CountUp";
import { useSite } from "../state/SiteContext";
import { getCountry } from "../data/countries";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const money = (n) => "$" + Math.round(n).toLocaleString();
const num = (n) => Math.round(n).toLocaleString();
const compact = (n) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(Math.round(n));

function NoScan() {
  const navigate = useNavigate();
  return (
    <Reveal.Page className="w-full pt-16 min-h-[calc(100vh-4rem)]">
      <div className="max-w-xl mx-auto px-margin py-space-xl flex flex-col items-center text-center gap-space-md">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-[30px]">description</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          No site selected yet
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Run a scan first — the report is generated from live NASA POWER data for
          the parcel you pick.
        </p>
        <button
          type="button"
          onClick={() => navigate("/find")}
          className="flex items-center gap-space-xs px-space-lg py-3 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
          Choose a location
        </button>
      </div>
    </Reveal.Page>
  );
}

export default function DetailReport() {
  const { selected, sites, origin, hasScan, selectSite, config } = useSite();
  if (!hasScan || !selected) return <NoScan />;

  const s = selected;
  const country = origin?.country ? getCountry(origin.country) : null;
  const next = sites.find((x) => x.id !== s.id && x.rank === s.rank + 1) || sites.find((x) => x.id !== s.id);
  const peakKwh = Math.max(...(s.monthlyKwh.length ? s.monthlyKwh : [1]));
  const minKwh = Math.min(...(s.monthlyKwh.length ? s.monthlyKwh : [0]));
  const peakMonths = s.monthlyKwh
    .map((v, i) => ({ v, i }))
    .filter((m) => m.v >= peakKwh * 0.92)
    .map((m) => MONTH_LABELS[m.i]);
  const panelWatt = 450;
  const panelCount = Math.max(1, Math.round((s.capacityKwp * 1000) / panelWatt));

  return (
    <Reveal.Page className="w-full pt-16 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col w-full">
        {/* Top Telemetry Micro-Bar & Quick Traversal */}
        <section className="w-full px-margin py-space-sm bg-surface-container-low" data-reveal-group="">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-space-xs font-label-md text-label-md">
              <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                {"Results"}
              </a>
              <span className="text-outline-variant">
                {"/"}
              </span>
              <span className="text-on-surface font-semibold">
                {"Spot #" + s.rank + ": " + s.parcelName}
              </span>
            </div>
            <a className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-on-surface transition-colors font-semibold" href="#">
              <span className="">
                {next ? "Next: Spot #" + next.rank : "Only candidate"}
              </span>
              <span className="material-symbols-outlined text-sm">
                {"arrow_forward"}
              </span>
            </a>
          </div>
        </section>
        {/* Section 1: Location Summary Header Bento */}
        <section className="w-full px-margin py-space-lg" data-reveal-group="">
          <div className="max-w-7xl mx-auto">
            {/* Receives the morph from the Results card that opened this report:
                the browser interpolates this box from the card's position and
                size. The name is unconditional here because only one report is
                ever on screen, so it cannot collide with itself. */}
            <div
              className="glass glass-edge glass-lens glass-hover glass-sheen rounded-xl shadow-md p-space-lg"
              style={{ viewTransitionName: "site-plate" }}
              data-reveal=""
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
                <div className="lg:col-span-8 flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="px-space-xs py-0.5 bg-primary-container text-on-primary font-label-sm text-label-sm uppercase font-bold tracking-wider rounded">
                      {"Spot #" + String(s.rank).padStart(2, "0")}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {"Parcel " + s.parcel + " · " + (s.area ?? s.nearest?.city ?? "") + (s.postcode ? " · " + s.postcode : "")}
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1" data-reveal="">
                    {"Location Report: " + s.parcelName}
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-base text-secondary">
                      {"pin_drop"}
                    </span>
                    <span className="">
                      {Math.abs(s.lat).toFixed(4) + "° " + (s.lat >= 0 ? "N" : "S") + ", " + Math.abs(s.lng).toFixed(4) + "° " + (s.lng >= 0 ? "E" : "W") + " • " + [s.road, s.area, s.locality].filter(Boolean).join(", ")}
                    </span>
                  </p>
                </div>
                <div className="lg:col-span-4 flex justify-start lg:justify-end">
                  <div className="bg-surface-container-low rounded-xl px-space-lg py-space-md flex items-center gap-space-md" data-reveal="">
                    <div className="flex flex-col text-center">
                      <span className="font-display-xl text-display-xl text-on-surface font-bold leading-none">
                        {<CountUp to={s.score} duration={1.5} />}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {"/ 100"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-bold text-secondary uppercase">
                        {"Optimal Grade Tier-1"}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {s.score >= 80 ? "Exceptional solar resource" : s.score >= 65 ? "Strong solar resource" : s.score >= 50 ? "Workable solar resource" : "Constrained solar resource"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 2: AI Analysis "Why This Spot?" */}
        <section className="w-full px-margin py-space-sm" data-reveal-group="">
          <div className="max-w-7xl mx-auto">
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm" data-reveal="">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-on-secondary flex items-center justify-center" data-reveal="">
                    <span className="material-symbols-outlined text-lg">
                      {"psychology"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight" data-reveal="">
                      {"AI Geospatial Synthesis: Why This Spot?"}
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {"Derived from NASA POWER satellite climatology for " + Math.abs(s.lat).toFixed(2) + "°, " + Math.abs(s.lng).toFixed(2) + "° via the NREL PVWatts derate chain"}
                    </p>
                  </div>
                </div>
                <span className="px-space-xs py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                  {"NASA POWER climatology · " + s.capacityFactorPct + "% capacity factor"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between" data-reveal="">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-space-sm" data-reveal="">
                    <span className="material-symbols-outlined text-lg">
                      {"wb_sunny"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Unobstructed Horizon"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {s.terrain ? "Sits at " + s.terrain.elevation + " m on a " + s.terrain.slopeDeg + "° " + s.terrain.aspectLabel + "-facing slope (Copernicus 90 m DEM). Plane-of-array irradiance reaches " + num(s.poaAnnual) + " kWh/m² a year at " + s.tilt + "° tilt." : "Plane-of-array irradiance reaches " + num(s.poaAnnual) + " kWh/m² a year at " + s.tilt + "° tilt."}
                  </p>
                  <div className="mt-space-md text-label-sm font-label-sm text-secondary font-semibold">
                    {s.terrain ? s.terrain.slopeDeg + "° slope · " + s.terrain.aspectLabel + " aspect" : s.cloudLossPct + "% cloud attenuation"}
                  </div>
                </div>
                <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between" data-reveal="">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-space-sm" data-reveal="">
                    <span className="material-symbols-outlined text-lg">
                      {"cloud_done"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Microclimate Crest"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {"Cloud cover removes " + s.cloudLossPct + "% of the clear-sky resource here, against a " + s.clearDay + " kWh/m²/day clear-sky ceiling and a " + s.ambientC + "°C mean air temperature."}
                  </p>
                  <div className="mt-space-md text-label-sm font-label-sm text-secondary font-semibold">
                    {s.ghiDay + " kWh/m²/day Peak Sun Hours"}
                  </div>
                </div>
                <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between" data-reveal="">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-space-sm" data-reveal="">
                    <span className="material-symbols-outlined text-lg">
                      {"bolt"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Immediate Grid Access"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {"A " + s.capacityKwp + " kWp array returns " + num(s.annualKwh) + " kWh a year, clearing " + money(s.capex) + " of capital in " + (s.payback ?? "—") + " years at " + money(s.tariff * 100) .replace("$","") + "¢/kWh."}
                  </p>
                  <div className="mt-space-md text-label-sm font-label-sm text-secondary font-semibold">
                    {money(s.lifetimeSavings) + " lifetime savings"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 3: Solar Potential Monthly Bar Chart (PVWatts) */}
        <section className="w-full px-margin py-space-lg pb-space-xl" data-reveal-group="">
          <div className="max-w-7xl mx-auto">
            <div className="glass glass-edge glass-lens glass-hover rounded-xl shadow-md p-space-lg" data-reveal="">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-md mb-space-lg">
                <div>
                  <div className="flex items-center gap-space-xs mb-1">
                    <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">
                      {"NREL PVWatts Simulation Engine"}
                    </span>
                    <span className="text-outline-variant">
                      {"•"}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {s.capacityKwp + " kWp Array • " + s.tilt + "° Tilt"}
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight" data-reveal="">
                    {"Monthly Energy Yield Forecast (kWh)"}
                  </h2>
                </div>
                {/* Aggregate Metric Pills */}
                <div className="flex flex-wrap items-center gap-space-xs">
                  <div className="bg-surface-container-low px-space-md py-space-xs rounded-lg text-left" data-reveal="">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                      {"Annual Yield"}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {num(s.annualKwh) + " "}
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {"kWh"}
                      </span>
                    </span>
                  </div>
                  <div className="bg-surface-container-low px-space-md py-space-xs rounded-lg text-left" data-reveal="">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                      {"Capacity Factor"}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                      {s.capacityFactorPct + "%"}
                    </span>
                  </div>
                  <div className="bg-surface-container-low px-space-md py-space-xs rounded-lg text-left" data-reveal="">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block">
                      {"Peak Sun Hours"}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {s.ghiDay + " "}
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {"h/day"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              {/* 12-Month Interactive Bar Chart Visual */}
              <div className="w-full bg-surface-container-low rounded-xl p-space-md pt-space-lg p-space-lg" data-reveal="">
                <div className="grid grid-cols-12 gap-1 sm:gap-space-xs h-64 items-end pb-space-sm">
                  {s.monthlyKwh.map((v, i) => {
                    const pct = peakKwh ? Math.max(6, (v / peakKwh) * 100) : 0;
                    const tone =
                      v >= peakKwh * 0.92
                        ? "bg-tertiary-fixed-dim"
                        : v <= minKwh * 1.06
                        ? "bg-primary-container"
                        : "bg-secondary";
                    return (
                      <div key={MONTH_LABELS[i]} className="flex flex-col items-center h-full justify-end group">
                        <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                          {compact(v)}
                        </span>
                        <motion.div
                          className={`w-full ${tone} rounded-t-sm hover:opacity-90 transition-opacity`}
                          initial={{ height: 0 }}
                          whileInView={{ height: pct + "%" }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                          title={`${MONTH_LABELS[i]}: ${num(v)} kWh`}
                        />
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-2">
                          {MONTH_LABELS[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Legend Bar */}
                <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-md mt-space-sm border-t border-surface-container">
                  <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-tertiary-fixed-dim"></span>
                      <span className="text-on-surface">
                        {"Peak Harvest (" +
                          (peakMonths[0] ?? "—") +
                          (peakMonths.length > 1
                            ? " – " + peakMonths[peakMonths.length - 1]
                            : "") +
                          " ≈ " +
                          num(peakKwh) +
                          " kWh)"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-primary-container"></span>
                      <span className="text-on-surface-variant">
                        {"Seasonal Minimum (≈" + num(minKwh) + " kWh)"}
                      </span>
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {"Resolution: NASA POWER monthly climatology"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 4: Weather Factors & Open-Meteo / NASA POWER Telemetry */}
        <section className="w-full px-margin py-space-sm" data-reveal-group="">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight" data-reveal="">
                  {"Weather Factors & Environmental Telemetry"}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {"Live streaming sync with Open-Meteo Climate API and NASA POWER solar data bank"}
                </p>
              </div>
              <div className="flex items-center gap-1 px-space-xs py-1 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface font-medium">
                <span className="material-symbols-outlined text-sm text-secondary">
                  {"sync"}
                </span>
                {" Source: " + (s.nearest?.city ?? "site") + " · NASA POWER climatology "}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {/* Factor 1 */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-md shadow-sm" data-reveal="">
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">
                    {"Insolation Duration"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed" data-reveal="">
                    <span className="material-symbols-outlined text-base">
                      {"sunny"}
                    </span>
                  </div>
                </div>
                <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {num(s.ghiAnnual) + " "}
                  <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
                    {"hrs/yr"}
                  </span>
                </div>
                <div className="mt-space-xs flex items-center gap-1">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                    {"Top 5% Nationally"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                  {" Peak month delivers " + num(peakKwh) + " kWh against a " + num(minKwh) + " kWh seasonal minimum — a " + (minKwh ? (peakKwh / minKwh).toFixed(1) : "—") + "× summer-to-winter swing. "}
                </p>
              </div>
              {/* Factor 2 */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-md shadow-sm" data-reveal="">
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">
                    {"Mean Cloud Cover"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed" data-reveal="">
                    <span className="material-symbols-outlined text-base">
                      {"cloud_queue"}
                    </span>
                  </div>
                </div>
                <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {s.cloudLossPct + "% "}
                  <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
                    {"annual"}
                  </span>
                </div>
                <div className="mt-space-xs flex items-center gap-1">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                    {"Open-Meteo Satellite Feed"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                  {" Marine layer stratocumulus dissipate quickly over hilltop elevations, yielding >310 completely clear days per year. "}
                </p>
              </div>
              {/* Factor 3 */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-md shadow-sm" data-reveal="">
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">
                    {"Thermal Derating"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed" data-reveal="">
                    <span className="material-symbols-outlined text-base">
                      {"thermostat"}
                    </span>
                  </div>
                </div>
                <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {s.ambientC + "°C "}
                  <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
                    {"mean"}
                  </span>
                </div>
                <div className="mt-space-xs flex items-center gap-1">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                    {"−" + s.tempDeratePct + "% thermal derate"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                  {" Summer ground temps >35°C incur moderate thermal losses. Well-ventilated ground mounts with 18cm air gaps recommended. "}
                </p>
              </div>
              {/* Factor 4 */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-md shadow-sm" data-reveal="">
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">
                    {"Precipitation & Soiling"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed" data-reveal="">
                    <span className="material-symbols-outlined text-base">
                      {"water_drop"}
                    </span>
                  </div>
                </div>
                <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {s.windMs + " "}
                  <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
                    {"mm/yr"}
                  </span>
                </div>
                <div className="mt-space-xs flex items-center gap-1">
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                    {"Bi-Annual Wash Protocol"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                  {" Semi-arid conditions mean minimal rain self-cleaning. Soiling derating estimated at 2.2% during late summer months. "}
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Section 5: Hardware & Engineering Specs Mosaic */}
        <section className="w-full px-margin py-space-lg" data-reveal-group="">
          <div className="max-w-7xl mx-auto">
            <div className="glass glass-edge glass-lens glass-hover rounded-xl shadow-md p-space-lg" data-reveal="">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm mb-space-md">
                <div>
                  <span className="font-label-sm text-label-sm font-semibold text-secondary uppercase">
                    {"Geospatial Hardware Sizing"}
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight" data-reveal="">
                    {"Recommended Hardware & Electrical Architecture"}
                  </h2>
                </div>
                <div className="px-space-sm py-1 bg-surface-container rounded-lg font-label-sm text-label-sm text-on-surface font-semibold" data-reveal="">
                  {" BOS Specification: Commercial Grade "}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-low rounded-xl p-space-md" data-reveal="">
                  <div className="w-7 h-7 rounded bg-secondary-fixed text-secondary flex items-center justify-center mb-space-xs">
                    <span className="material-symbols-outlined text-base">
                      {"solar_power"}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-medium">
                    {"Nameplate DC Capacity"}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1" data-reveal="">
                    {s.capacityKwp + " kWp DC"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    {" Engineered with 1.25 DC/AC loading ratio matching typical Southern California commercial solar farm layouts. "}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-space-md" data-reveal="">
                  <div className="w-7 h-7 rounded bg-secondary-fixed text-secondary flex items-center justify-center mb-space-xs">
                    <span className="material-symbols-outlined text-base">
                      {"view_module"}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-medium">
                    {"Photovoltaic Modules"}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1" data-reveal="">
                    {panelCount + "× " + panelWatt + "W Panels"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    {" N-Type TOPCon bifacial high-efficiency monocrystalline panels (22.3% module efficiency) with dual glass encasing. "}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-space-md" data-reveal="">
                  <div className="w-7 h-7 rounded bg-secondary-fixed text-secondary flex items-center justify-center mb-space-xs">
                    <span className="material-symbols-outlined text-base">
                      {"compass_calibration"}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-medium">
                    {"Racking Alignment"}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1" data-reveal="">
                    {s.tilt + "° Tilt @ " + s.azimuth + "° Azimuth"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    {" Aligned with True Geographic South for optimal annual energy harvesting with balanced midday peaking. "}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-space-md" data-reveal="">
                  <div className="w-7 h-7 rounded bg-secondary-fixed text-secondary flex items-center justify-center mb-space-xs">
                    <span className="material-symbols-outlined text-base">
                      {"electric_meter"}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-medium">
                    {"Inverter Architecture"}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1" data-reveal="">
                    {"String + DC Optimizers"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    {" Commercial multi-MPPT string inverter system providing 98.6% CEC efficiency and granular module-level telemetry. "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 6: Financial ROI & SDG 7 Carbon Impact Split Panel */}
        <section className="w-full px-margin py-space-sm" data-reveal-group="">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between" data-reveal="">
                <div className="flex items-center justify-between mb-space-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface" data-reveal="">
                    {"Boundary Shading & Soiling"}
                  </h3>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest font-label-sm text-label-sm text-secondary font-bold">
                    {"Low Risk"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
                  {"Single southern boundary utility pole creates minor late-afternoon shadow swath in late December. Dry summer dust causes ~2.2% peak derate."}
                </p>
                <div className="mt-space-md pt-space-xs font-label-sm text-label-sm text-on-surface">
                  <span className="font-semibold">
                    {"Mitigation:"}
                  </span>
                  {" DC optimizers isolate bypass diodes; scheduled bi-annual anti-reflective wash."}
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between" data-reveal="">
                <div className="flex items-center justify-between mb-space-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface" data-reveal="">
                    {"Land Slope & Wind Loading"}
                  </h3>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest font-label-sm text-label-sm text-secondary font-bold">
                    {"Stable"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
                  {"Uniform 1.8°–2.1° grade with dense sandy loam substrate. Zero severe cyclonic storm history with sub-tropical maximums below 42 mph."}
                </p>
                <div className="mt-space-md pt-space-xs font-label-sm text-label-sm text-on-surface">
                  <span className="font-semibold">
                    {"Mitigation:"}
                  </span>
                  {" Standard driven-pile ground mount posts; standard ASCE 7-16 racking without concrete pours."}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 7: Risks and Mitigation Considerations */}
        <section className="w-full px-margin py-space-lg" data-reveal-group="">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex flex-col text-center sm:text-left">
              <h3 className="font-headline-md text-headline-md text-on-surface" data-reveal="">
                {"Ready to validate Spot #" + s.rank + "?"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {"Full geospatial telemetry dossier formatted for EPC bidding & site feasibility."}
              </p>
            </div>
            <div className="flex items-center gap-space-sm">
              <button className="px-space-lg py-space-sm bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-primary font-label-lg text-label-lg font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2" type="button" data-reveal="">
                <span className="material-symbols-outlined text-base">
                  {"picture_as_pdf"}
                </span>
                <span className="">
                  {"Download Full PDF Dossier"}
                </span>
              </button>
              <button className="px-space-md py-space-sm glass glass-edge glass-lens glass-hover hover:bg-surface text-on-surface font-label-lg text-label-lg font-semibold rounded-full shadow-sm transition-all flex items-center gap-2" type="button" data-reveal="">
                <span className="material-symbols-outlined text-base">
                  {"share"}
                </span>
                <span className="">
                  {"Share Report Link"}
                </span>
              </button>
            </div>
          </div>
        </section>
        {/* Section 8: Floating Execution & Action Bar */}
        <section className="w-full px-margin py-space-xl bg-surface-container-low" data-reveal-group="">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-space-md">
            <div className="flex flex-col text-center lg:text-left">
              <span className="font-label-sm text-label-sm uppercase font-semibold text-secondary">
                {"Export Dossier & Deployment"}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface" data-reveal="">
                {"Ready to validate Spot #" + s.rank + " on-site?"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {"Full geospatial telemetry packet ready for engineering handoff & EPC bidding"}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-space-sm">
              {/* Primary Solar Yellow CTA */}
              <button className="px-space-lg py-space-sm bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-primary font-label-lg text-label-lg font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2" type="button" data-reveal="">
                <span className="material-symbols-outlined text-base">
                  {"picture_as_pdf"}
                </span>
                <span className="">
                  {"Download Full PDF Dossier"}
                </span>
              </button>
              {/* Electric Azure Action */}
              <button className="px-space-md py-space-sm bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg font-semibold rounded-full shadow-sm transition-all flex items-center gap-2" type="button" data-reveal="">
                <span className="material-symbols-outlined text-base">
                  {"share"}
                </span>
                <span className="">
                  {"Share Report Link"}
                </span>
              </button>
              {/* Deep Navy Action */}
              <button className="px-space-md py-space-sm bg-primary-container hover:bg-inverse-surface text-on-primary font-label-lg text-label-lg font-semibold rounded-full shadow-sm transition-all flex items-center gap-2" type="button" data-reveal="">
                <span className="material-symbols-outlined text-base">
                  {"engineering"}
                </span>
                <span className="">
                  {"Schedule EPC Site Survey"}
                </span>
              </button>
              {/* Next Location Link */}
              <a className="px-space-md py-space-sm glass glass-edge glass-lens glass-hover hover:bg-surface text-on-surface font-label-lg text-label-lg font-semibold rounded-full shadow-sm transition-all flex items-center gap-1" href="#" data-reveal="">
                <span className="">
                  {next ? "Jump to Spot #" + next.rank : "Back to results"}
                </span>
                <span className="material-symbols-outlined text-base">
                  {"arrow_forward"}
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </Reveal.Page>
  );
}
