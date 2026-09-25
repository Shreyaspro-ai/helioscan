import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

import CountryPicker from "./CountryPicker";
import Flag from "./Flag";
import MapPicker from "./MapPicker";
import { getCountry } from "../data/countries";
import { citiesIn, cityByPostal, nearestCity } from "../data/cities";
import { validatePostal } from "../lib/postal";
import { useSite } from "../state/SiteContext";

const EASE = [0.22, 1, 0.36, 1];

const PROFILES = [
  { id: "residential", label: "Residential", icon: "home", kwpPerSqm: 0.12 },
  { id: "commercial", label: "Commercial", icon: "domain", kwpPerSqm: 0.14 },
  { id: "agricultural", label: "Agricultural", icon: "agriculture", kwpPerSqm: 0.11 },
  { id: "ground", label: "Ground-Mount", icon: "solar_power", kwpPerSqm: 0.09 },
];

const TABS = [
  { id: "postal", icon: "public", label: "Country + Postal Code" },
  { id: "map", icon: "pin_drop", label: "Pick on Satellite Map" },
];

export default function ScanWorkstation() {
  const navigate = useNavigate();
  const { scan, status, error, config, setConfig } = useSite();

  const [tab, setTab] = useState("postal");
  const [countryCode, setCountryCode] = useState("US");
  const [postal, setPostal] = useState("92101");
  const [point, setPoint] = useState({ lat: 32.7157, lng: -117.1611 });
  const [profile, setProfile] = useState("residential");
  const [area, setArea] = useState(1500);
  const [bill, setBill] = useState(240);
  const [tariff, setTariff] = useState(0.15);
  const [touched, setTouched] = useState(false);

  const country = getCountry(countryCode);
  const validation = useMemo(
    () => validatePostal(countryCode, postal),
    [countryCode, postal]
  );

  const presets = useMemo(
    () => citiesIn(countryCode).filter((c) => c.postal).slice(0, 6),
    [countryCode]
  );

  // Switching country moves the pin to that country and clears a stale code.
  useEffect(() => {
    if (!country) return;
    setPostal("");
    setTouched(false);
    setPoint({ lat: country.lat, lng: country.lng });
  }, [countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // A recognised postal code moves the pin to that city.
  useEffect(() => {
    if (!touched) return;
    const hit = cityByPostal(countryCode, postal);
    if (hit) setPoint({ lat: hit.lat, lng: hit.lng });
  }, [postal, countryCode, touched]);

  const SQFT_TO_SQM = 0.092903;
  const areaSqft = Number(area) || 0;
  const areaSqm = areaSqft * SQFT_TO_SQM; // the field is in sq ft; the model is metric
  const profileDef = PROFILES.find((p) => p.id === profile) || PROFILES[0];
  const capacityKwp = Math.max(1, Math.round(areaSqm * profileDef.kwpPerSqm * 10) / 10);
  const panels = Math.max(1, Math.round((capacityKwp * 1000) / 400));
  // Bill and tariff together imply consumption; deriving tariff from the bill
  // would just hand back whatever constant it was divided by.
  const monthlyKwh = Math.max(1, Math.round(bill / Math.max(0.01, tariff)));
  const offsetPct = Math.min(999, Math.round(((capacityKwp * 1400) / 12 / monthlyKwh) * 100));

  const near = useMemo(() => nearestCity(point.lat, point.lng), [point]);
  // A postal code refines the pin, it isn't required to have one: an empty field
  // just scans wherever the pin already sits. Only a *wrong* code blocks, since
  // that means the user meant somewhere we haven't actually resolved.
  const canScan = validation.state !== "invalid";
  const scanning = status === "scanning";

  const applyPreset = (city) => {
    setPostal(city.postal || "");
    setTouched(true);
    setPoint({ lat: city.lat, lng: city.lng });
  };

  const run = async () => {
    const cfg = { capacityKwp, tariff, profile, areaSqm: Math.round(areaSqm), monthlyBill: bill };
    setConfig(cfg);
    try {
      await scan(
        {
          lat: point.lat,
          lng: point.lng,
          label: near ? `${near.city}${near.admin && near.admin !== "Capital" ? ", " + near.admin : ""}` : "Selected site",
          country: countryCode,
          postal: postal || null,
        },
        cfg
      );
      navigate("/results");
    } catch {
      /* surfaced inline below */
    }
  };

  return (
    <div className="flex flex-col gap-space-md">
      {/* ---------------------------------------------- location selection */}
      <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-md md:p-space-lg">
        <div className="relative flex items-center p-1 bg-surface-container rounded-full mb-space-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative flex-1 flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-full font-label-md text-label-md transition-colors"
            >
              {tab === t.id && (
                <motion.span
                  layoutId="loc-tab"
                  className="absolute inset-0 rounded-full bg-surface-container-lowest shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 material-symbols-outlined text-sm ${
                  tab === t.id ? "text-secondary" : ""
                }`}
              >
                {t.icon}
              </span>
              <span
                className={`relative z-10 ${
                  tab === t.id ? "text-on-surface font-semibold" : "text-on-surface-variant"
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {tab === "postal" ? (
            <motion.div
              key="postal"
              className="flex flex-col gap-space-md"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                <div className="md:col-span-5">
                  <CountryPicker value={countryCode} onChange={setCountryCode} />
                </div>

                <div className="md:col-span-7 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
                      {country?.postalLabel || "Locality"}
                    </label>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={validation.state + validation.message}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18 }}
                        className={`font-label-sm text-label-sm flex items-center gap-1 ${
                          validation.state === "valid"
                            ? "text-secondary"
                            : validation.state === "invalid"
                            ? "text-error"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {validation.state === "valid" && (
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        )}
                        {validation.state === "invalid" && (
                          <span className="material-symbols-outlined text-[14px]">error</span>
                        )}
                        {validation.state === "valid"
                          ? near?.city || validation.message
                          : validation.message}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <input
                    type="text"
                    value={postal}
                    disabled={!country?.hasPostal}
                    onChange={(e) => {
                      setPostal(e.target.value);
                      setTouched(true);
                    }}
                    placeholder={
                      country?.hasPostal
                        ? `e.g. ${country.postalExample}`
                        : "No postal system — use the map tab"
                    }
                    className={`w-full bg-surface-container-low hover:bg-surface-container focus:bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm px-space-md py-2.5 rounded-full focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      validation.state === "invalid"
                        ? "shadow-[0_0_0_2px_#ba1a1a]"
                        : validation.state === "valid"
                        ? "shadow-[0_0_0_2px_#0050cc]"
                        : "focus:shadow-[0_0_0_2px_#0050cc]"
                    }`}
                  />
                </div>
              </div>

              {presets.length > 0 && (
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {country && <Flag code={country.code} size={15} className="mr-1 align-[-2px]" />}Presets:
                  </span>
                  {presets.map((c) => (
                    <motion.button
                      key={`${c.city}-${c.postal}`}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => applyPreset(c)}
                      className="px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors"
                    >
                      {c.city} ({c.postal})
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              className="flex flex-col gap-space-sm"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <MapPicker
                lat={point.lat}
                lng={point.lng}
                zoom={11}
                height={300}
                onPick={(lat, lng) => setPoint({ lat, lng })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------ refine forecast */}
      <div className="glass glass-edge glass-lens glass-hover rounded-xl p-space-md md:p-space-lg flex flex-col gap-space-md">
        <div className="flex items-start gap-space-sm">
          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[19px]">tune</span>
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Refine Your Solar Forecast
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Sizing and tariff drive the yield and payback model.
            </p>
          </div>
          <span className="ml-auto shrink-0 px-space-sm py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
            {capacityKwp} kWp
          </span>
        </div>

        <div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
            Installation Profile
          </span>
          <div className="grid grid-cols-2 gap-space-sm mt-space-xs">
            {PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProfile(p.id)}
                className={`relative flex items-center justify-center gap-space-xs py-2 rounded-full font-label-md text-label-md transition-colors ${
                  profile === p.id
                    ? "text-on-secondary"
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {profile === p.id && (
                  <motion.span
                    layoutId="profile-pill"
                    className="absolute inset-0 rounded-full bg-secondary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 material-symbols-outlined text-[16px]">{p.icon}</span>
                <span className="relative z-10">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 bg-surface-container-low p-space-md rounded-xl">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
              Surface Area
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {Math.round(areaSqm).toLocaleString()} m² · est. {panels} panels
            </span>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <input
              type="number"
              min="10"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-transparent font-headline-sm text-headline-sm text-on-surface focus:outline-none font-bold"
            />
            <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
              sq ft
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 bg-surface-container-low p-space-md rounded-xl">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
              Monthly Electric Bill
            </span>
            <motion.span
              key={bill}
              initial={{ scale: 1.12, color: "#0050cc" }}
              animate={{ scale: 1, color: "#0d1c2f" }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="font-headline-sm text-headline-sm font-bold inline-block"
            >
              ${bill}
              <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                /mo
              </span>
            </motion.span>
          </div>
          <input
            type="range"
            min="50"
            max="1200"
            step="10"
            value={bill}
            onChange={(e) => setBill(Number(e.target.value))}
            className="w-full accent-secondary cursor-pointer mt-2.5"
          />

          <div className="flex items-center justify-between gap-space-sm mt-space-sm pt-space-sm border-t border-surface-container">
            <label
              htmlFor="tariff"
              className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium"
            >
              Electricity Tariff
            </label>
            <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-lowest">
              <span className="font-label-md text-label-md text-on-surface-variant">$</span>
              <input
                id="tariff"
                type="number"
                min="0.01"
                max="2"
                step="0.01"
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
                className="w-14 bg-transparent font-label-lg text-label-lg text-on-surface font-semibold focus:outline-none text-right"
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant">/kWh</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-1">
            <span>≈{monthlyKwh.toLocaleString()} kWh/mo implied</span>
            <span>~{offsetPct}% of usage offset</span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- run CTA */}
      <div className="flex flex-col gap-space-sm">
        <motion.button
          type="button"
          onClick={run}
          disabled={!canScan || scanning}
          whileHover={canScan && !scanning ? { y: -2 } : undefined}
          whileTap={canScan && !scanning ? { scale: 0.985 } : undefined}
          className="w-full flex items-center justify-center gap-space-sm px-space-lg py-4 rounded-full bg-tertiary-fixed-dim text-tertiary-container font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all disabled:opacity-45 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <>
              <span className="material-symbols-outlined text-[19px] animate-spin">
                progress_activity
              </span>
              <span>Querying NASA POWER…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[19px]">bolt</span>
              <span>Run Solar Scan</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-space-xs font-body-sm text-body-sm text-error overflow-hidden"
            >
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error} — check your connection and retry.
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
          Scanning{" "}
          <span className="text-on-surface font-semibold">
            {Math.abs(point.lat).toFixed(3)}°{point.lat >= 0 ? "N" : "S"}{" "}
            {Math.abs(point.lng).toFixed(3)}°{point.lng >= 0 ? "E" : "W"}
          </span>
          {near && ` · nearest ${near.city}`} · live NASA POWER climatology
        </p>
      </div>
    </div>
  );
}
