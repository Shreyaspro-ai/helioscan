import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Reveal from "../components/Reveal";
import Parallax from "../components/Parallax";
import Words, { DrawUnderline } from "../components/Words";
import { LightRaysFX } from "../components/LazyFX";
import Magnet from "../components/Magnet";
import ShinyText from "../components/ShinyText";

export default function Landing() {
  return (
    <Reveal.Page className="w-full pt-16">
      <div className="flex flex-col w-full">
        {/* Top Subtle Coordinate Scrim Bar */}
        <div className="w-full bg-surface-container-low/70 py-space-xs px-margin">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" data-reveal=""></span>
                <span>
                  {"ORBITAL CONSTELLATION: ONLINE"}
                </span>
              </span>
              <span className="hidden sm:inline font-mono">
                {"LAT 0°00'N · LON 0°00'E TO 82°30'N"}
              </span>
              <span className="hidden md:inline text-outline-variant">
                {"/"}
              </span>
              <span className="hidden md:inline">
                {"NASA POWER API v2.4.1 CONNECTED"}
              </span>
            </div>
            <div className="flex items-center gap-space-md font-mono text-on-surface">
              <span>
                {"SOLAR CONSTANT: 1,361 W/m²"}
              </span>
              <span className="text-tertiary-fixed-dim font-bold">
                {"● PEAK FLUX READY"}
              </span>
            </div>
          </div>
        </div>
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-transparent py-space-xl lg:py-28" data-reveal-group="">
          {/* Volumetric sun rays — react-bits LightRays */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.30]" aria-hidden>
            <LightRaysFX raysOrigin="top-center" raysColor="#f59e0b" raysSpeed={0.55} lightSpread={1.5} rayLength={1.5} pulsating followMouse={false} fadeDistance={1.1} />
          </div>
          {/* Atmospheric subtle ambient background lights */}
          <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none drift-slow"></div>
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-tertiary-fixed-dim/10 blur-3xl pointer-events-none drift-slow" style={{animationDelay:"-7s"}}></div>
          <div className="max-w-7xl mx-auto px-margin">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
              {/* Left Hero Content Column */}
              <Parallax speed={0.05} className="lg:col-span-7 flex flex-col items-start">
                {/* Partnership / Precision Badge */}
                <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-low shadow-sm text-on-surface mb-space-lg" data-reveal="">
                  <span className="material-symbols-outlined text-[15px] text-secondary">
                    {"verified"}
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                    {"UN SDG 7 Affordable & Clean Energy Partner"}
                  </span>
                  <span className="text-outline-variant">
                    {"·"}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {"NASA & NREL Integrated"}
                  </span>
                </div>
                {/* Main Hero Headline */}
                <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight leading-[1.08] mb-space-md">
                  <Words text="Unlock the solar potential of any rooftop or land in" delay={0.15} />{" "}
                  <span className="relative inline-block text-secondary">
                    <Words text="seconds" delay={0.6} stagger={0} />
                    <DrawUnderline className="absolute bottom-1 left-0 w-full h-[3px] bg-tertiary-fixed-dim/60" delay={0.95} />
                  </span>
                  {"."}
                </h1>
                {/* Body Subtitle */}
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-space-xl leading-relaxed">
                  {" HelioScan couples satellite irradiance telemetry, open geospatial data, and AI-driven rooftop modeling to pinpoint the highest-yield solar locations worldwide — completely automated. "}
                </p>
                {/* Action CTA Button Group */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full sm:w-auto mb-space-xl">
                  <Magnet padding={90} magnetStrength={4}>
                    <Link viewTransition to="/find" className="group flex items-center justify-center gap-space-sm px-space-lg py-3.5 rounded-full bg-tertiary-fixed-dim text-tertiary-container font-label-lg text-label-lg shadow-md hover:bg-tertiary-fixed hover:shadow-lg transition-all active:scale-[0.98]" >
                    <span>
                      {"Get Started — Free Solar Analysis"}
                    </span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      {"arrow_forward"}
                    </span>
                  </Link>
                  </Magnet>
                  <a className="flex items-center justify-center gap-space-xs px-space-lg py-3.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-all" href="#how-it-works" data-reveal="">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      {"tune"}
                    </span>
                    <span>
                      {"Explore How It Works"}
                    </span>
                  </a>
                </div>
                {/* Trust Validation Micro-Pillars */}
                <div className="flex flex-wrap items-center gap-y-space-xs gap-x-space-lg text-on-surface-variant font-label-md text-label-md">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {"no_accounts"}
                    </span>
                    <span>
                      {"Zero hardware required"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {"bolt"}
                    </span>
                    <span>
                      {"Instant 3-second simulation"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {"lock_open_right"}
                    </span>
                    <span>
                      {"100% Free & Open Data"}
                    </span>
                  </div>
                </div>
              </Parallax>
              {/* Right Visual Showcase / Dynamic Telemetry Preview Card */}
              <Parallax speed={0.14} className="lg:col-span-5 relative mt-space-lg lg:mt-0">
                {/* Decorative watermark from the source design. It sat at
                    -top-6 -right-4, directly behind the card's "V4.2 SATELLITE"
                    badge, where the two overlapped into something that read as
                    a rendering fault rather than decoration. Moved clear of the
                    card's top-right corner and softened so it behaves like a
                    watermark. */}
                <div
                  aria-hidden
                  className="absolute -top-11 right-16 font-mono font-bold text-[56px] leading-none tracking-tight text-surface-container-high/25 select-none pointer-events-none -z-10 hidden lg:block"
                >
                  NREL:PV
                </div>
                {/* The Floating Simulation Canvas Card */}
                <div className="w-full glass glass-edge glass-lens glass-hover glass-sheen rounded-xl shadow-xl p-space-md sm:p-space-lg relative" data-reveal="">
                  {/* Card Header HUD */}
                  <div className="flex items-center justify-between pb-space-sm mb-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface">
                        {"GIS LIVE SCAN ENGINE"}
                      </span>
                    </div>
                    <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-secondary font-label-sm text-label-sm font-semibold">
                      {"V4.2 SATELLITE"}
                    </span>
                  </div>
                  {/* Photovoltaic Aerial Vector Preview */}
                  <div className="relative w-full h-56 rounded-lg overflow-hidden mb-space-md bg-primary-container" data-reveal="">
                    <img className="w-full h-full object-cover opacity-85" data-alt="High-resolution aerial satellite orthophoto view of modern urban residential rooftops with overlaid vivid cyan solar panel vectors, solar irradiance heatmap contour rings, and crisp azimuth vector geometry markers under bright clear daylight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8HMDZRVFmsECNdteD4iGgUQi3HE-_26Wax732UVkvTT_s_tDRAK0v79FiRGDOFjJdnVQEkk7hBBSQp44Q6C6EFMy36MksdkRFpWSQQZp0CwPrxuwpSsfIZfb5Sp-ekbHV9i3s58Hl1BPA62VVIp5pQfa-T-rT3iSNqWVGkZ5fnfdTitqKLazjW5pBNM87Kujn3h1JbBq_5mNsQg_mG6AjOvrrq9c1geTIBkwclA8xOV2X5k57xqUw" />
                    {/* Geospatial HUD Heatmap Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent"></div>
                    {/* Top Left Ray Vector Stamp */}
                    <div className="absolute top-space-sm left-space-sm bg-primary-container/85 backdrop-blur-md rounded px-space-xs py-1 text-on-primary font-mono text-[10px] tracking-wider">
                      {" GHI: 5.64 kWh/m²/day "}
                    </div>
                    {/* Top Right Tilt Indicator */}
                    <div className="absolute top-space-sm right-space-sm bg-primary-container/85 backdrop-blur-md rounded px-space-xs py-1 text-tertiary-fixed-dim font-mono text-[10px] tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">
                        {"explore"}
                      </span>
                      <span>
                        {"AZI: 182° · TILT: 28°"}
                      </span>
                    </div>
                    {/* Central Reticle / Target Over Target Structure */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-secondary/40 animate-ping opacity-25"></div>
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-xl">
                            {"wb_sunny"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Bottom Bar Overlay Metric */}
                    <div className="absolute bottom-space-xs left-space-xs right-space-xs flex items-center justify-between px-space-sm py-1.5 rounded bg-surface-container-lowest/90 backdrop-blur-md shadow-sm">
                      <span className="font-label-sm text-label-sm text-on-surface">
                        {"Target Polygon: Roof Tier 1A"}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                        {"98.4% Yield"}
                      </span>
                    </div>
                  </div>
                  {/* Telemetry Mini Grid breakdown */}
                  <div className="grid grid-cols-3 gap-space-xs text-center bg-surface-container-low rounded-lg p-space-sm mb-space-md" data-reveal="">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                        {"Usable Area"}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {"142 m²"}
                      </span>
                    </div>
                    <div className="flex flex-col bg-surface-container-lowest rounded py-0.5 shadow-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                        {"Potential"}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                        {"24.8 kWp"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                        {"Est. Carbon Δ"}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {"-18.4 t/yr"}
                      </span>
                    </div>
                  </div>
                  {/* Quick Interactive Input Simulation Trigger */}
                  <div className="flex items-center gap-space-xs">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute left-space-sm top-1/2 -translate-y-1/2">
                        {"pin_drop"}
                      </span>
                      <input className="w-full bg-surface-container-low rounded py-2 pl-8 pr-space-xs font-mono text-body-sm text-on-surface cursor-default focus:outline-none" placeholder="e.g., 90210, Beverly Hills CA" readOnly type="text" value="94107, San Francisco" />
                    </div>
                    <Link viewTransition to="/results" className="px-space-md py-2 rounded-full bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-container transition-colors shrink-0">
                      {" Run Telemetry "}
                    </Link>
                  </div>
                </div>
              </Parallax>
            </div>
          </div>
        </section>
        {/* Showcase Workflow Banner: 3-Step Solar Intelligence Engine */}
        <section className="w-full bg-surface-container-low py-space-xl" id="how-it-works" data-reveal-group="">
          <div className="max-w-7xl mx-auto px-margin">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold tracking-widest block mb-1">
                  {"Algorithmic Workflow"}
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight" data-reveal="">
                  {"From Coordinates to Complete ROI in 3 Phases"}
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                {" Zero surveyor visits, no drone deployment required. Our multi-spectral neural pipeline models shade, tilt, and tariff data instantly. "}
              </p>
            </div>
            {/* 3 Step Cards Mosaic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Step 1 Card */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow" data-reveal="">
                <div>
                  <div className="flex items-center justify-between mb-space-md">
                    <span className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-mono font-bold text-on-surface text-body-md" data-reveal="">
                      {"01"}
                    </span>
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      {"location_searching"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Location & Boundary Input"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    {" Input any postal code, global street address, or drop a pin directly onto high-resolution vector satellite tiles. "}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-space-sm font-mono text-body-sm text-on-surface-variant" data-reveal="">
                  <div className="flex items-center justify-between py-1">
                    <span>
                      {"GeoJSON Boundary"}
                    </span>
                    <span className="text-secondary">
                      {"Auto-Snapped"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>
                      {"Coordinate Precision"}
                    </span>
                    <span className="text-on-surface font-semibold">
                      {"±0.0001°"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Step 2 Card */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow" data-reveal="">
                <div>
                  <div className="flex items-center justify-between mb-space-md">
                    <span className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center font-mono font-bold text-secondary text-body-md" data-reveal="">
                      {"02"}
                    </span>
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      {"solar_power"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Satellite Irradiance & Occlusion"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    {" Algorithms synthesize 20-year NASA solar flux patterns while LiDAR height maps isolate tree canopy and chimney shadows. "}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-space-sm font-mono text-body-sm text-on-surface-variant" data-reveal="">
                  <div className="flex items-center justify-between py-1">
                    <span>
                      {"Shading Simulation"}
                    </span>
                    <span className="text-secondary">
                      {"8,760 hrs/yr"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>
                      {"LiDAR Elevation"}
                    </span>
                    <span className="text-on-surface font-semibold">
                      {"0.5m Gridded"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Step 3 Card */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow" data-reveal="">
                <div>
                  <div className="flex items-center justify-between mb-space-md">
                    <span className="w-9 h-9 rounded-lg bg-tertiary-fixed flex items-center justify-center font-mono font-bold text-tertiary-container text-body-md" data-reveal="">
                      {"03"}
                    </span>
                    <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl">
                      {"monitoring"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Ranked Sites & 25-Year ROI"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    {" Receive your Top 3 optimized sub-arrays with complete localized grid export values, module sizing, and bankable cashflow graphs. "}
                  </p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-space-sm font-mono text-body-sm text-on-surface-variant" data-reveal="">
                  <div className="flex items-center justify-between py-1">
                    <span>
                      {"Financial Yield"}
                    </span>
                    <span className="text-on-surface font-semibold">
                      {"NPV & LCOE"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>
                      {"Export Readiness"}
                    </span>
                    <span className="text-secondary">
                      {"PDF & CAD DXF"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Value Pillars Section */}
        <section className="w-full bg-transparent py-space-xl" data-reveal-group="">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="text-center max-w-3xl mx-auto mb-space-xl">
              <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold tracking-widest block mb-1">
                {"Scientific Integrity"}
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs" data-reveal="">
                {"Engineered for Solar Developers & Discerning Homeowners"}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                {" Moving beyond rough estimate calculators. HelioScan delivers investment-grade physical modeling with verifiable open satellite methodologies. "}
              </p>
            </div>
            {/* Bento-style Pillars Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              {/* Pillar 1 */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between" data-reveal="">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-space-md text-secondary" data-reveal="">
                    <span className="material-symbols-outlined text-2xl">
                      {"satellite_alt"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Hyper-Local Satellite Telemetry"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    {" Direct ingestion of NASA POWER multi-spectral datasets and NREL PVWatts v8 calculation matrices. Every photon vector account for diffuse, direct normal, and ground-reflected radiation based on your roof’s slope. "}
                  </p>
                </div>
                <div className="h-44 rounded-lg overflow-hidden relative mt-space-sm">
                  <img className="w-full h-full object-cover" data-alt="Futuristic digital twin visualization of planet earth orbital view with satellite microwave radiance scan lines sweeping over continent with glowing solar energy density contours and deep blue color spectrum" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkBius6gBpq_n-66XhuMHgqShZTQ1Bu1RIGClZbJlEbjGU4isnR1PBPiwe79c-Njo-tktOBj5OqsdgzCxYaoV6514HoPwJ7YRHFiM94tgfGNjbGWjzy_mkqIayD_I8WN8zjPx1UlpRwxppDWHhd-mc-uxgGZJ2zSZmZGb4vXtmmbAylLmsdy1MFbE4OzU4ADK4CIvDcesqm0F0PX9Ajjkul5GWpfj_DqsqfKnZX4Wzw8r8kqBcVjTT" />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-space-xs left-space-sm font-mono text-[11px] text-surface-bright">
                    {" SPECTRAL FLUX: Direct + Diffuse + Albedo "}
                  </div>
                </div>
              </div>
              {/* Pillar 2 */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between" data-reveal="">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-space-md text-secondary" data-reveal="">
                    <span className="material-symbols-outlined text-2xl">
                      {"psychology"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"AI Obstacle & Shading Detection"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    {" Sub-meter computer vision segments roof facets, parapet walls, HVAC vents, and vegetative cover. Our 3D sun-path trace calculates exact shadow casting across 365 days with hourly granularity. "}
                  </p>
                </div>
                <div className="h-44 rounded-lg overflow-hidden relative mt-space-sm">
                  <img className="w-full h-full object-cover" data-alt="High angle isometric 3D wireframe mesh of an architectural roof structure showing sun angle ray casting and high contrast shadow occlusions from nearby trees rendered in electric cyan and deep charcoal tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2GsKRw4ktOxkVKSv05nMYsdsnw9VdIIGh2wsJMqXAj8M6Xwde_pSdw2Ixq9Iv_cFHp-QTVQGUXWxUh7y8LHYpWYhBqFNpRZybvlUGtsYJEiqLGoSskERl4KEGej_OLiftGSSbRRTDsB5ww3-Fzw8X0Rq9ekFLDJy0Li4dR5tCBPfwrLVxW_EWOxaNvJoyHZf2Uh3OiXeWR-K2noTACkadLaPumlU3V7x56Oah8r_ghd3QiXXoxdVc" />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-space-xs left-space-sm font-mono text-[11px] text-surface-bright">
                    {" OCN: LiDAR Tree Mesh 0.2m Resolution "}
                  </div>
                </div>
              </div>
              {/* Pillar 3 */}
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col justify-between" data-reveal="">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-space-md text-secondary" data-reveal="">
                    <span className="material-symbols-outlined text-2xl">
                      {"account_balance"}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs" data-reveal="">
                    {"Bankable Financials & SDG 7"}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                    {" Generate detailed cashflow schedules, Net Present Value (NPV), Levelized Cost of Energy (LCOE), and audit-ready greenhouse gas offsets aligned with United Nations SDG 7 clean energy disclosure targets. "}
                  </p>
                </div>
                {/* Clean Financial Preview Box */}
                <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs mt-space-sm" data-reveal="">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                      {"Typical Payback"}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {"5.8 Years"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden" data-reveal="">
                    <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: "76%" }} data-reveal=""></div>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface-variant font-mono mt-1">
                    <span>
                      {"NPV: +$21,480"}
                    </span>
                    <span className="text-secondary font-semibold">
                      {"IRR: 18.2%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Quick Stats Ribbon */}
        <section className="w-full bg-surface-container-low py-space-xl" data-reveal-group="">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col items-start" data-reveal="">
                <span className="font-display-xl text-display-xl font-bold text-on-surface tracking-tight mb-1">
                  {"4.8%"}
                </span>
                <span className="font-label-lg text-label-lg text-secondary font-semibold mb-1">
                  {"Accuracy Variance"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {"Validated against pyranometer ground telemetry worldwide."}
                </span>
              </div>
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col items-start" data-reveal="">
                <span className="font-display-xl text-display-xl font-bold text-on-surface tracking-tight mb-1">
                  {"190+"}
                </span>
                <span className="font-label-lg text-label-lg text-secondary font-semibold mb-1">
                  {"Countries Supported"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {"Global coverage through multi-satellite meteorological models."}
                </span>
              </div>
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col items-start" data-reveal="">
                <span className="font-display-xl text-display-xl font-bold text-on-surface tracking-tight mb-1">
                  {"3 Sec"}
                </span>
                <span className="font-label-lg text-label-lg text-secondary font-semibold mb-1">
                  {"Simulation Run-Time"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {"Distributed GPU workers crunch 8,760 sun positions in milliseconds."}
                </span>
              </div>
              <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-lg shadow-sm flex flex-col items-start" data-reveal="">
                <span className="font-display-xl text-display-xl font-bold text-on-surface tracking-tight mb-1">
                  {"Zero-Fee"}
                </span>
                <span className="font-label-lg text-label-lg text-secondary font-semibold mb-1">
                  {"Open Science Mission"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {"Built to accelerate clean energy transition for community & commercial scale."}
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* Bottom Conversion Banner Section */}
        <section className="w-full bg-transparent py-space-xl lg:py-24" data-reveal-group="">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="relative bg-primary-container text-on-primary rounded-xl overflow-hidden p-space-lg sm:p-space-xl shadow-2xl" data-reveal="">
              {/* Subtle schematic ambient lines in background */}
              <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" data-reveal=""></div>
              <div className="absolute -left-10 top-0 w-64 h-64 rounded-full bg-tertiary-fixed-dim/10 blur-2xl pointer-events-none" data-reveal=""></div>
              <div className="relative z-10 max-w-3xl flex flex-col items-start">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-secondary/30 text-surface-bright font-mono text-[11px] mb-space-md">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" data-reveal=""></span>
                  <span>
                    {"NO REGISTRATION REQUIRED TO EXPLORE"}
                  </span>
                </div>
                <h2 className="font-display-xl text-display-xl font-bold text-on-primary tracking-tight leading-tight mb-space-md" data-reveal="">
                  {" Ready to find your optimal solar installation spot? "}
                </h2>
                <p className="font-body-lg text-body-lg text-surface-variant max-w-xl mb-space-xl">
                  {" Enter an address or postal code to instantly reveal irradiance density, roof facet suitability, and 25-year financial savings forecasts. "}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full sm:w-auto">
                  <Link viewTransition to="/find" className="group flex items-center justify-center gap-space-sm px-space-xl py-4 rounded-full bg-tertiary-fixed-dim text-tertiary-container font-label-lg text-label-lg font-bold shadow-lg hover:bg-tertiary-fixed transition-all active:scale-[0.98]" data-reveal="">
                    <span>
                      {"Get Started Now — It's Free"}
                    </span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1.5 transition-transform">
                      {"east"}
                    </span>
                  </Link>
                  <Link viewTransition to="/report" className="flex items-center justify-center gap-space-xs px-space-lg py-4 rounded-full bg-surface-container-high/15 text-on-primary hover:bg-surface-container-high/25 font-label-lg text-label-lg transition-colors" data-reveal="">
                    <span className="material-symbols-outlined text-[18px]">
                      {"description"}
                    </span>
                    <span>
                      {"View Sample Intelligence Report"}
                    </span>
                  </Link>
                </div>
                {/* Bottom Micro Assurance */}
                <div className="mt-space-lg flex items-center gap-space-md text-surface-variant font-label-sm text-label-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      {"security"}
                    </span>
                    <span>
                      {"Strictly private — No contact spam"}
                    </span>
                  </span>
                  <span>
                    {"·"}
                  </span>
                  <span>
                    {"Direct GIS data download enabled"}
                  </span>
                </div>
              </div>
              {/* Decorative Right Corner Floating Visual Graphic */}
              <div className="hidden lg:flex absolute right-space-xl top-1/2 -translate-y-1/2 flex-col items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-secondary/30 flex items-center justify-center relative" data-reveal="">
                  <div className="w-36 h-36 rounded-full border border-tertiary-fixed-dim/30 flex items-center justify-center" data-reveal="">
                    <div className="w-24 h-24 rounded-full bg-secondary/30 backdrop-blur-md flex flex-col items-center justify-center text-center p-2" data-reveal="">
                      <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl">
                        {"wb_sunny"}
                      </span>
                      <span className="font-mono text-[9px] text-on-primary font-bold tracking-widest mt-1">
                        {"100% CLEAN"}
                      </span>
                    </div>
                  </div>
                  {/* Orbiting indicator */}
                  <div className="absolute top-2 right-8 w-3 h-3 rounded-full bg-tertiary-fixed-dim shadow-[0_0_8px_#ffb95f]" data-reveal=""></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Reveal.Page>
  );
}
