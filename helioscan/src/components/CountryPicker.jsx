import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COUNTRIES } from "../data/countries";
import Flag from "./Flag";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Searchable country combobox over all 199 entries — a plain <select> that long
 * is unusable. Matches on name, ISO code and capital, groups by region, and is
 * driveable from the keyboard.
 */
export default function CountryPicker({ value, onChange, label = "Country" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = COUNTRIES.find((c) => c.code === value) || null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const starts = [];
    const contains = [];
    for (const c of COUNTRIES) {
      const name = c.name.toLowerCase();
      const cap = c.capital.toLowerCase();
      const code = c.code.toLowerCase();
      if (name.startsWith(q) || code === q) starts.push(c);
      else if (name.includes(q) || cap.includes(q) || code.startsWith(q)) contains.push(c);
    }
    return [...starts, ...contains];
  }, [query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else setQuery("");
  }, [open]);

  // keep the highlighted row in view while arrowing
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const commit = (c) => {
    onChange(c.code);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) commit(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5" ref={boxRef}>
      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
        {label}
      </label>

      <div className="relative">
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.995 }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full flex items-center gap-space-sm bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm text-headline-sm px-space-md py-2.5 rounded-full focus:outline-none focus:shadow-[0_0_0_2px_#0050cc] transition-all text-left"
        >
          {selected ? (
            <>
              <Flag code={selected.code} size={22} />
              <span className="truncate">{selected.name}</span>
              <span className="ml-auto shrink-0 font-label-sm text-label-sm text-on-surface-variant">
                {selected.code}
              </span>
            </>
          ) : (
            <span className="text-on-surface-variant">Select a country…</span>
          )}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="material-symbols-outlined text-on-surface-variant shrink-0"
          >
            expand_more
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="absolute z-[1100] mt-space-xs w-full rounded-xl glass-strong glass-edge overflow-hidden"
            >
              <div className="p-space-sm border-b border-surface-container">
                <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-low">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    search
                  </span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Search 199 countries…"
                    className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-on-surface"
                    >
                      close
                    </button>
                  )}
                </div>
              </div>

              <div ref={listRef} className="max-h-72 overflow-y-auto" role="listbox">
                {results.length === 0 && (
                  <p className="px-space-md py-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                    No country matches “{query}”.
                  </p>
                )}
                {results.map((c, i) => {
                  const prev = results[i - 1];
                  const showRegion = !query && (!prev || prev.region !== c.region);
                  return (
                    <div key={c.code}>
                      {showRegion && (
                        <div className="sticky top-0 px-space-md py-1 bg-surface-container-low/95 backdrop-blur font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                          {c.region}
                        </div>
                      )}
                      <button
                        type="button"
                        role="option"
                        aria-selected={c.code === value}
                        data-idx={i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => commit(c)}
                        className={`w-full flex items-center gap-space-sm px-space-md py-2 text-left transition-colors ${
                          i === active ? "bg-surface-container" : "hover:bg-surface-container-low"
                        }`}
                      >
                        <Flag code={c.code} size={20} />
                        <span
                          className={`font-body-md text-body-md truncate ${
                            c.code === value ? "text-secondary font-semibold" : "text-on-surface"
                          }`}
                        >
                          {c.name}
                        </span>
                        <span className="ml-auto shrink-0 font-label-sm text-label-sm text-on-surface-variant">
                          {c.hasPostal ? c.postalExample : "no postcodes"}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
