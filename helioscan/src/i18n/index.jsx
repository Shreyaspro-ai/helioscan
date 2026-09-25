import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { STRINGS, LANGUAGES } from "./strings";

/**
 * Translation context.
 *
 * `t(key, vars)` looks the key up in the active language, falls back to English
 * when a key is missing, and returns the key itself only if English lacks it too
 * — so a typo surfaces loudly in development instead of rendering blank.
 *
 * The chosen language persists to localStorage and is reflected on <html lang>,
 * which is what screen readers and the browser's own translation prompt read.
 */

const I18nContext = createContext(null);
const STORE_KEY = "helioscan.lang";

function initialLang() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && STRINGS[saved]) return saved;
  } catch {
    /* private mode */
  }
  // Fall back to the browser's preference when we actually speak it.
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return STRINGS[nav] ? nav : "en";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch {
      /* non-fatal */
    }
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const table = STRINGS[lang] || STRINGS.en;
      let out = table[key];
      if (out === undefined) out = STRINGS.en[key];
      if (out === undefined) return key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.split(`{${k}}`).join(String(v));
        }
      }
      return out;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang: setLangState, t, languages: LANGUAGES }),
    [lang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Convenience for components that only need the translate function. */
export function useT() {
  return useI18n().t;
}

export { LANGUAGES };
