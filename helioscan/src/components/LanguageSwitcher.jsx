import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "../i18n";
import Flag from "./Flag";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Language picker.
 *
 * The header shipped a static "EN (US)" chip that did nothing; this makes it
 * real. Switching writes through to <html lang> and localStorage, so the choice
 * survives a reload and assistive tech reads the page in the right language.
 */
export default function LanguageSwitcher() {
  const { lang, setLang, languages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const active = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={boxRef}>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("header.language")}
        className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-label-sm text-label-sm uppercase tracking-wider"
      >
        <span className="material-symbols-outlined text-[16px]">language</span>
        <span>{active.label}</span>
        <motion.span
          className="material-symbols-outlined text-[16px]"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          expand_more
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 z-[1200] mt-space-xs w-52 rounded-xl glass-strong glass-edge overflow-hidden py-1"
          >
            {languages.map((l) => {
              const selected = l.code === lang;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setLang(l.code);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-space-sm px-space-md py-2 text-left transition-colors ${
                      selected ? "bg-surface-container" : "hover:bg-surface-container-low"
                    }`}
                  >
                    <Flag code={l.flag} size={18} />
                    <span
                      className={`font-body-md text-body-md ${
                        selected ? "text-secondary font-semibold" : "text-on-surface"
                      }`}
                    >
                      {l.name}
                    </span>
                    {selected && (
                      <span className="ml-auto material-symbols-outlined text-[16px] text-secondary">
                        check
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
