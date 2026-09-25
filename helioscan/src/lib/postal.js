import { getCountry } from "../data/countries";

/**
 * Postal-code validation driven by the per-country format table.
 *
 * Countries that run no postal-code system are treated as valid-by-default —
 * the field becomes an optional locality hint rather than a blocking input,
 * which is how addressing actually works in e.g. the UAE or Ireland pre-Eircode.
 */

const cache = new Map();

function compiled(country) {
  if (!country?.postalRegex) return null;
  if (!cache.has(country.code)) {
    cache.set(country.code, new RegExp(`^(?:${country.postalRegex})$`, "i"));
  }
  return cache.get(country.code);
}

/** Uppercase and collapse separators, so "k1a0b1" and "K1A 0B1" both pass. */
export function normalizePostal(value) {
  return (value || "").trim().toUpperCase().replace(/\s+/g, " ");
}

export function validatePostal(countryCode, value) {
  const country = getCountry(countryCode);
  const raw = normalizePostal(value);

  if (!country) {
    return { state: "idle", message: "Select a country first." };
  }

  if (!country.hasPostal) {
    return {
      state: "none",
      message: `${country.name} has no national postal-code system — pick the site on the map instead.`,
    };
  }

  if (!raw) {
    return { state: "idle", message: `Example: ${country.postalExample}` };
  }

  const re = compiled(country);
  // Try the raw value, then a space-stripped variant, so "SW1A1AA" is accepted.
  const ok = re.test(raw) || re.test(raw.replace(/\s/g, ""));

  return ok
    ? { state: "valid", message: `Valid ${country.postalLabel}` }
    : {
        state: "invalid",
        message: `Doesn't match the ${country.name} format — e.g. ${country.postalExample}`,
      };
}

/** Human-readable mask, derived from the regex, for the field hint. */
export function formatHint(countryCode) {
  const c = getCountry(countryCode);
  if (!c) return "";
  if (!c.hasPostal) return "No postal codes";
  return c.postalExample;
}
