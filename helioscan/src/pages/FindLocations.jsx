import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Reveal from "../components/Reveal";
import ScanWorkstation from "../components/ScanWorkstation";

export default function FindLocations() {
  const [tab, setTab] = useState("pincode");
  const [bill, setBill] = useState(240);

  return (
    <Reveal.Page className="w-full pt-16 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col w-full">
        {/* Subtle Ambient Glow Canvas Decor */}
        <div className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute -top-40 right-1/4 w-[600px] h-[600px] rounded-full bg-secondary-fixed opacity-30 blur-3xl drift-slow"></div>
          <div className="pointer-events-none absolute top-48 -left-20 w-[450px] h-[450px] rounded-full bg-tertiary-fixed opacity-40 blur-3xl drift-slow" style={{animationDelay:"-9s"}}></div>
          {/* Main Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-lg md:pt-space-xl pb-space-xl">
            {/* Top SDG Tag & Meta Line */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-full" data-reveal="">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {"eco"}
                </span>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  {"UN SDG 7"}
                </span>
                <span className="text-outline-variant font-label-sm">
                  {"•"}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {"Affordable & Clean Energy"}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-secondary" data-reveal=""></span>
                <span className="">
                  {"Global Solar & Irradiance Intelligence"}
                </span>
              </div>
            </div>
            {/* Hero Header Section */}
            <div className="max-w-3xl mb-space-xl pt-space-xs">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold flex items-center gap-space-xs mb-space-xs">
                <span className="material-symbols-outlined text-sm">
                  {"solar_power"}
                </span>
                {"HelioScan Solar Explorer"}
              </span>
              <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl text-on-surface tracking-tight font-bold leading-tight" data-reveal="">
                {"Find the best spots near you to set up solar, "}
                <span className="text-secondary">
                  {"and why."}
                </span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm leading-relaxed max-w-2xl">
                {"Instant satellite irradiance mapping, high-precision LiDAR surface tilt extraction, and photovoltaic forecasting in seconds."}
              </p>
            </div>
            {/* Core Interactive Workstation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left: Input & Configuration Deck (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <ScanWorkstation />
              </div>
              {/* Right: Realtime Geospatial Inspector & Visual Previews (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-lg">
                <div className="glass glass-edge glass-lens glass-hover rounded-xl shadow-sm overflow-hidden flex flex-col" data-reveal="">
                  <div className="p-space-md flex items-center justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                        {"Preview Overlay"}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold" data-reveal="">
                        {"Global Irradiance Overlay"}
                      </h3>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {"satellite_alt"}
                    </span>
                  </div>
                  <div className="relative w-full h-64 bg-surface-container overflow-hidden">
                    <img className="w-full h-full object-cover" data-alt="High-resolution aerial satellite topography overlay of suburban and commercial rooftops with vibrant gradient solar irradiance heatmap" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8iG4seanmQau-IiqdEObk3VYVHeiFAxiMgrNkWnBvtPVjeU7GsSXlN2K9zT0fBJ8WVWSY-PX5AIOoDE_4t5Xpdj5OTV-fYKH7hU_w6Jp8sKTeQBToJ9o22dm8gaRHw97KBBYR99hi-kXaqoPU79PnAwAYgdiRIle42TIS7_Vk0r9ar2VZfdkFDv-PBdFNx33kzPWTN2NIkVNtRzZt1qBcBvt3o65mlomICPqRDm1m98Fttt65xG7V" />
                    <div className="absolute bottom-3 left-3 glass glass-edge glass-lens glass-hover/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-space-xs" data-reveal="">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                        {"DNI: 6.18 kWh/m²/day"}
                      </span>
                    </div>
                  </div>
                  <div className="p-space-md grid grid-cols-2 gap-space-md border-t border-surface-container-low">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {"Annual Sun Hours"}
                      </span>
                      <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
                        {"2,958"}
                        <span className="text-body-sm font-normal text-on-surface-variant ml-1">
                          {"hrs"}
                        </span>
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary font-medium mt-0.5">
                        {"Top 8% in USA"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {"Avg Grid Tariff"}
                      </span>
                      <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
                        {"$0.34"}
                        <span className="text-body-sm font-normal text-on-surface-variant ml-1">
                          {"/kWh"}
                        </span>
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary font-medium mt-0.5">
                        {"Fast ROI (~4.2 yrs)"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="glass glass-edge glass-lens glass-hover rounded-xl shadow-sm overflow-hidden flex flex-col" data-reveal="">
                  <div className="relative h-44 w-full bg-surface-container">
                    <img className="w-full h-full object-cover" data-alt="Modern sustainable architecture residential home with sleek high-efficiency monocrystalline solar panels mounted cleanly on roof tiles" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD77Q2wbJniw0QIehuUMhuqLuozCiUBT62Mc8WhPM0Hx4b5obYu1ER08Ky7MP_E5Vesx55pr4vXoppNgB6xQZA07grM-xIyx_d1XB-WKK5t7Ln3KKxZlXwvKSwDRK2kBxXTq8fw39KTii9F4UuOxWU3MI7WCdbXmp9j1C_3MD5K_DNhDjOoJO-tObjUHZ0otOA9uYDW-XsJX1z2PxpXRmJ6v9aEz1Gqe3rn3UieNrRjXeWF28vAxFKc" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 via-transparent to-transparent flex items-end p-space-md">
                      <div className="text-on-primary">
                        <span className="font-label-sm text-label-sm text-tertiary-fixed-dim uppercase tracking-wider font-semibold">
                          {"Zero Carbon Impact"}
                        </span>
                        <p className="font-headline-sm text-headline-sm font-semibold leading-tight mt-0.5">
                          {"Displace 8.4 Tons CO₂ / Year"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Trust & Open Science Social Proof Bar */}
          </div>
        </div>
      </div>
    </Reveal.Page>
  );
}
