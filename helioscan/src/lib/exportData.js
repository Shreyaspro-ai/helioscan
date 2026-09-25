/**
 * File exports that actually conform to their formats.
 *
 * CSV follows RFC 4180: CRLF record separators, every field quoted, embedded
 * quotes doubled. It is emitted with a UTF-8 BOM because the data carries
 * degree signs and superscripts (kWh/m²) and Excel on Windows assumes the
 * legacy ANSI codepage without one — producing "kWh/mÂ²" in the cell.
 */

/** RFC 4180 field: wrap in quotes, double any embedded quote. */
function csvField(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** @param rows array of arrays */
export function toCsv(rows) {
  return rows.map((r) => r.map(csvField).join(",")).join("\r\n") + "\r\n";
}

/**
 * Trigger a download.
 *
 * The anchor is attached to the document before clicking — Firefox ignores a
 * click on a detached node — and the object URL is revoked on the next tick
 * rather than immediately, because revoking synchronously can cancel the
 * download before the browser has read the blob.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
  return filename;
}

const UTF8_BOM = "﻿";

export function downloadCsv(rows, filename) {
  const blob = new Blob([UTF8_BOM + toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  return downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], {
    type: "application/json;charset=utf-8",
  });
  return downloadBlob(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

/** Filesystem-safe slug for filenames. */
export function slug(value, fallback = "site") {
  const out = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return out || fallback;
}

/**
 * The comparison matrix as CSV rows, with a provenance preamble so the file
 * still explains itself once it is detached from the app.
 */
export function buildMatrixRows(sites, metrics, origin) {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  return [
    ["HelioScan site comparison"],
    ["Generated (UTC)", stamp],
    ["Query", origin?.postal ? `${origin.postal} ${origin.area || ""}`.trim() : origin?.label || ""],
    ["Locality", origin?.locality || ""],
    ["Source", "NASA POWER climatology, Copernicus 90 m DEM, NREL PVWatts v8 derate chain"],
    ["Note", "Modelled pre-feasibility estimates. Not a substitute for an on-site survey."],
    [],
    ["Metric", ...sites.map((s) => `#${s.rank} ${s.parcelName}`)],
    ...metrics.map((m) => [m.label, ...sites.map((s) => m.get(s))]),
  ];
}
