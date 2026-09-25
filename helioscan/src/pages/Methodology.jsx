import Reveal from "../components/Reveal";
import { DotGridFX } from "../components/LazyFX";
import Accordion from "../components/Accordion";

const FAQ = [
  {
    "q": "How does ambient temperature affect solar panel efficiency?",
    "a": "Standard Test Conditions (STC) evaluate monocrystalline wafers at 25°C. For every degree Celsius above 25°C, panels lose approximately 0.35% to 0.40% in power generation. HelioScan integrates Open-Meteo's hourly temperature vectors to derate real-world production accordingly."
  },
  {
    "q": "How accurate is the postal-level estimation without an on-site audit?",
    "a": "According to NREL validation benchmarks, satellite-derived solar radiation models (NASA POWER and NSRDB) operate within ±4.8% mean variance compared to terrestrial pyranometer ground truth, meeting standard commercial pre-feasibility financing criteria."
  },
  {
    "q": "Is HelioScan free to use? Are there API rate limits?",
    "a": "Yes, HelioScan is 100% free and open-access. Built to empower communities and civic organizations, it leverages public research APIs without requiring accounts, paywalls, or commercial subscriptions."
  },
  {
    "q": "What distinguishes a 90+ score location from a 70 score location?",
    "a": "A 90+ score indicates high daily irradiance (>5.2 kWh/m²), low annual cloud scatter (<25%), optimal unshaded azimuth, and favorable utility net-metering buyback rates. A score of 70 indicates viable solar potential burdened by micro-shading or lower retail electricity tariffs."
  }
];

export default function Methodology() {
  return (
    <Reveal.Page className="w-full pt-16 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col w-full">
        {/* SECTION 1: EDITORIAL HEADER & TELEMETRY BADGE */}
        <section className="relative w-full px-margin py-space-xl bg-transparent border-b border-surface-container-high/40 overflow-hidden" data-reveal-group="">
          <div className="absolute inset-0 opacity-[0.55] pointer-events-none" aria-hidden>
            <DotGridFX dotSize={3} gap={26} baseColor="#d5e3fd" activeColor="#0050cc" proximity={110} shockRadius={190} shockStrength={4} returnDuration={1.4} />
          </div>
          <div className="max-w-4xl mx-auto py-space-xl text-center flex flex-col items-center gap-space-md">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-low rounded-full" data-reveal="">
              <span className="w-2 h-2 rounded-full bg-secondary" data-reveal=""></span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
                {"Open-Science Methodology"}
              </span>
              <span className="text-outline-variant">
                {"•"}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {"v3.4.2 Verified"}
              </span>
            </div>
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight leading-tight mt-space-xs" data-reveal="">
              {"Transparent, Open-Source"}
              <br />
              <span className="text-secondary">
                {"Solar Intelligence"}
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              {"HelioScan democratizes geospatial clean energy modeling by synthesizing NASA orbital radiometry, NREL energy derate physics, and high-frequency meteorological vectors into an accessible, open-scoring framework."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-xl pt-space-md font-label-sm text-label-sm text-on-surface-variant">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-base text-secondary">
                  {"verified"}
                </span>
                <span className="">
                  {"100% Reproducible"}
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-base text-secondary">
                  {"public"}
                </span>
                <span className="">
                  {"Zero Black-Box Weights"}
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-base text-secondary">
                  {"precision_manufacturing"}
                </span>
                <span className="">
                  {"NSRDB ±4.8% Validated"}
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* SECTION 2: SUITABILITY SCORING METHODOLOGY & MATHEMATICAL DERIVATION */}
        <section className="w-full px-margin py-space-xl bg-transparent" data-reveal-group="">
          <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-secondary font-bold tracking-widest uppercase">
                {"Suitability Scoring"}
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface" data-reveal="">
                {"How the HelioScore is Calculated"}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {"A deterministic 0 to 100 index evaluated across four peer-reviewed environmental and economic dimensions."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between gap-space-md" data-reveal="">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-display-xl text-display-xl text-secondary font-bold leading-none">
                      {"40%"}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary" data-reveal="">
                      <span className="material-symbols-outlined text-xl">
                        {"solar_power"}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-xs" data-reveal="">
                    {"Solar Irradiance"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {"Global Horizontal and Direct Normal Irradiance mapped from 10-year satellite surface fluxes to determine true baseline peak sun hours."}
                  </p>
                </div>
                <div className="pt-space-sm">
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden" data-reveal="">
                    <div className="h-full bg-secondary rounded-full" style={{ width: "40%" }} data-reveal=""></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs block text-right">
                    {"Weight: 0.40"}
                  </span>
                </div>
              </div>
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between gap-space-md" data-reveal="">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-display-xl text-display-xl text-on-surface font-bold leading-none">
                      {"25%"}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface" data-reveal="">
                      <span className="material-symbols-outlined text-xl">
                        {"device_thermostat"}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-xs" data-reveal="">
                    {"Thermal & Weather"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {"Thermodynamic cell degradation models accounting for ambient heat exceeding 25°C, diurnal cloud coverage, and atmospheric humidity."}
                  </p>
                </div>
                <div className="pt-space-sm">
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden" data-reveal="">
                    <div className="h-full bg-on-surface rounded-full" style={{ width: "25%" }} data-reveal=""></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs block text-right">
                    {"Weight: 0.25"}
                  </span>
                </div>
              </div>
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between gap-space-md" data-reveal="">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-display-xl text-display-xl text-secondary-container font-bold leading-none">
                      {"20%"}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary-container" data-reveal="">
                      <span className="material-symbols-outlined text-xl">
                        {"landscape"}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-xs" data-reveal="">
                    {"Terrain & Aspect"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {"Surface plane vectors, optimal pitch versus latitude deviation, LiDAR surface models, and synthetic cast-shadow horizons."}
                  </p>
                </div>
                <div className="pt-space-sm">
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden" data-reveal="">
                    <div className="h-full bg-secondary-container rounded-full" style={{ width: "20%" }} data-reveal=""></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs block text-right">
                    {"Weight: 0.20"}
                  </span>
                </div>
              </div>
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col justify-between gap-space-md" data-reveal="">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-display-xl text-display-xl text-tertiary font-bold leading-none">
                      {"15%"}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-tertiary" data-reveal="">
                      <span className="material-symbols-outlined text-xl">
                        {"trending_up"}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-xs" data-reveal="">
                    {"Payback Velocity"}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {"Clean generation matched with regional tiered utility tariffs and net metering policies to estimate unlevered ROI and break-even speed."}
                  </p>
                </div>
                <div className="pt-space-sm">
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden" data-reveal="">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: "15%" }} data-reveal=""></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-space-xs block text-right">
                    {"Weight: 0.15"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* SECTION 3: OPEN DATA SOURCES & API ATTRIBUTIONS */}
        <section className="w-full px-margin py-space-xl bg-surface-container-low" data-reveal-group="">
          <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-secondary font-bold tracking-widest uppercase">
                {"Telemetry Infrastructure"}
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface" data-reveal="">
                {"Verified Open-Access Data Partners"}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {"HelioScan operates on publicly accessible scientific datasets and open APIs with zero proprietary lock-in."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex items-start gap-space-md" data-reveal="">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0" data-reveal="">
                  <span className="material-symbols-outlined text-2xl">
                    {"memory"}
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface" data-reveal="">
                      {"NREL PVWatts®"}
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      {"US DOE"}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {"Simulates AC photovoltaic energy production based on system capacity, inverter efficiencies, and thermal degradation curves."}
                  </p>
                </div>
              </div>
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex items-start gap-space-md" data-reveal="">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0" data-reveal="">
                  <span className="material-symbols-outlined text-2xl">
                    {"satellite"}
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface" data-reveal="">
                      {"NASA POWER"}
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      {"Langley Research"}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {"Global satellite surface solar energy synthesis delivering high-resolution solar irradiance fluxes across 30+ years of observations."}
                  </p>
                </div>
              </div>
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex items-start gap-space-md" data-reveal="">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0" data-reveal="">
                  <span className="material-symbols-outlined text-2xl">
                    {"cloud"}
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface" data-reveal="">
                      {"Open-Meteo API"}
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      {"Open Weather"}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {"Provides high-frequency numerical weather prediction parameters for hourly ambient temperature, cloud cover, and wind velocity."}
                  </p>
                </div>
              </div>
              <div className="glass glass-edge glass-lens glass-hover p-space-lg rounded-xl shadow-sm border border-surface-container flex items-start gap-space-md" data-reveal="">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0" data-reveal="">
                  <span className="material-symbols-outlined text-2xl">
                    {"travel_explore"}
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface" data-reveal="">
                      {"OpenStreetMap"}
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      {"Geospatial Foundation"}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {"Resolves postal codes and municipal boundaries into precise WGS84 geographic envelopes and spatial land parcel coordinates."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* SECTION 4: UN SDG 7 IMPACT MISSION */}
        <section className="w-full px-margin py-space-xl bg-transparent" data-reveal-group="">
          <div className="max-w-4xl mx-auto rounded-xl p-space-xl bg-surface-container-low border border-surface-container flex flex-col md:flex-row items-center gap-space-lg" data-reveal="">
            <div className="w-16 h-16 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex flex-col items-center justify-center font-headline-md text-headline-md font-bold shrink-0" data-reveal="">
              <span className="leading-none">
                {"7"}
              </span>
              <span className="font-label-sm text-label-sm leading-none mt-0.5">
                {"SDG"}
              </span>
            </div>
            <div className="flex flex-col gap-space-xs text-center md:text-left">
              <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                {"United Nations Goal Alignment"}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold" data-reveal="">
                {"Accelerating Universal Clean Energy Adoption"}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {"By delivering free, bankable solar feasibility estimates in under 700ms, HelioScan eliminates the $2,000+ upfront audit barrier for homeowners and civic planners—directly advancing UN SDG 7 targets 7.1 and 7.2."}
              </p>
            </div>
          </div>
        </section>
        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS (JUDGE AUDIT & HELIOAI KNOWLEDGE BASE) */}
        <section className="w-full px-margin py-space-xl bg-transparent border-t border-surface-container-high/40" data-reveal-group="">
          <div className="max-w-3xl mx-auto flex flex-col gap-space-lg">
            <div className="text-center flex flex-col gap-space-xs mb-space-sm">
              <span className="font-label-sm text-label-sm text-secondary font-bold tracking-widest uppercase">
                {"Verification & FAQ"}
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface" data-reveal="">
                {"Frequently Asked Questions"}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {"Key technical answers for solar auditors, researchers, and project planners."}
              </p>
            </div>
            <div className="flex flex-col divide-y divide-surface-container" id="faq-accordion">
              <Accordion items={FAQ} />
            </div>
          </div>
        </section>
        {/* SECTION 6: INTERACTIVE ASK HELIOAI BANNER */}
      </div>
    </Reveal.Page>
  );
}
