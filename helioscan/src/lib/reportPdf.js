import { jsPDF } from "jspdf";

/**
 * Generates the site dossier as a real PDF (application/pdf, %PDF header).
 *
 * Built from the scan data with jsPDF primitives rather than rasterising the
 * page: html2canvas cannot render `backdrop-filter`, so screenshotting this UI
 * would produce a dossier of grey rectangles where every glass panel should be.
 * Laying it out directly also keeps the text selectable and the file ~35 KB
 * instead of several megabytes of PNG.
 */

const NAVY = [13, 28, 50];
const AZURE = [0, 80, 204];
const AMBER = [245, 158, 11];
const INK = [13, 28, 47];
const MUTED = [104, 116, 132];
const RULE = [214, 225, 243];
const BAND = [244, 247, 253];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * jsPDF's built-in fonts are WinAnsi-encoded. A character outside that set does
 * not merely drop — it corrupts the entire text run, spacing every glyph apart.
 * An earlier build shipped "CO₂e avoided per year" as " C O  e  a v o i d e d ".
 * So every string is folded to WinAnsi-safe equivalents before it is drawn.
 * Embedding a Unicode TTF would also work but costs ~200 KB per font file for
 * a handful of glyphs.
 */
const SAFE = {
  "−": "-", // minus
  "–": "-", // en dash
  "—": "-", // em dash
  "≤": "<=",
  "≥": ">=",
  "≈": "~",
  "→": "->",
  "₂": "2", // subscript two (CO2)
  "³": "3",
  "’": "'",
  "‘": "'",
  "“": '"',
  "”": '"',
  "…": "...",
  " ": " ",
  "′": "'",
  "″": '"',
};
const safe = (v) =>
  String(v ?? "").replace(/[ –—‘’“”…′″→−≈≤≥₂³]/g, (c) => SAFE[c] ?? "");

const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const num = (n) => Math.round(n).toLocaleString("en-US");
const kcompact = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(Math.round(n)));

export function buildReportPdf(site, origin, config) {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CONTENT = W - M * 2;
  let y = 0;

  const place = [site.road, site.area, site.locality].filter(Boolean).join(", ");

  /* Document properties — what a reader sees in their PDF viewer's info panel. */
  doc.setProperties({
    title: `HelioScan site dossier - ${site.parcelName}`,
    subject: `Solar feasibility assessment for ${place || "selected parcel"}`,
    author: "HelioScan",
    creator: "HelioScan",
    keywords: ["solar", "PVWatts", "NASA POWER", site.postcode, site.area]
      .filter(Boolean)
      .join(", "),
  });

  const setColor = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);
  const text = (t, x, yy, opts) => doc.text(safe(t), x, yy, opts);

  const footer = () => {
    const p = doc.internal.getCurrentPageInfo().pageNumber;
    setDraw(RULE);
    doc.setLineWidth(0.5);
    doc.line(M, H - 44, W - M, H - 44);
    setColor(MUTED);
    doc.setFont("helvetica", "normal").setFontSize(7.5);
    text(
      "HelioScan - modelled from NASA POWER climatology and Copernicus elevation. Not a substitute for an on-site survey.",
      M,
      H - 30
    );
    text(String(p), W - M, H - 30, { align: "right" });
  };

  /** Break to a new page when the next block would run into the footer. */
  const need = (h) => {
    if (y + h > H - 72) {
      footer();
      doc.addPage();
      y = M + 8;
      return true;
    }
    return false;
  };

  const heading = (label) => {
    need(46);
    y += 12;
    setColor(AZURE);
    doc.setFont("helvetica", "bold").setFontSize(8.5);
    text(label.toUpperCase(), M, y);
    y += 7;
    setDraw(AZURE);
    doc.setLineWidth(1.1);
    doc.line(M, y, M + 30, y);
    setDraw(RULE);
    doc.setLineWidth(0.7);
    doc.line(M + 30, y, W - M, y);
    y += 17;
  };

  /**
   * Key/value rows in two columns, with alternating bands so the eye can track
   * across a wide page without a ruler.
   */
  const rows = (pairs) => {
    const colW = CONTENT / 2;
    const rowH = 18;
    doc.setFontSize(9.5);
    for (let i = 0; i < pairs.length; i += 2) {
      need(rowH);
      const band = (i / 2) % 2 === 1;
      if (band) {
        setFill(BAND);
        doc.rect(M - 6, y - 11, CONTENT + 12, rowH, "F");
      }
      for (let c = 0; c < 2; c++) {
        const pair = pairs[i + c];
        if (!pair) continue;
        const x = M + c * colW;
        setColor(MUTED);
        doc.setFont("helvetica", "normal");
        text(pair[0], x, y);
        setColor(INK);
        doc.setFont("helvetica", "bold");
        text(pair[1], x + colW - 14, y, { align: "right" });
      }
      y += rowH;
    }
    y += 6;
  };

  const para = (t) => {
    doc.setFont("helvetica", "normal").setFontSize(9);
    setColor(MUTED);
    const lines = doc.splitTextToSize(safe(t), CONTENT);
    need(lines.length * 11.5 + 8);
    doc.text(lines, M, y);
    y += lines.length * 11.5 + 8;
  };

  /* ----------------------------------------------------------- cover band */
  setFill(NAVY);
  doc.rect(0, 0, W, 140, "F");

  // sun mark
  setFill(AMBER);
  doc.circle(M + 12, 44, 10, "F");
  setDraw(AMBER);
  doc.setLineWidth(2);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    doc.line(M + 12 + Math.cos(a) * 14, 44 + Math.sin(a) * 14, M + 12 + Math.cos(a) * 18.5, 44 + Math.sin(a) * 18.5);
  }

  doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(16);
  text("HELIOSCAN", M + 32, 49);
  doc.setFont("helvetica", "normal").setFontSize(7.5);
  doc.setTextColor(150, 178, 245);
  text("SOLAR SITE DOSSIER", M + 134, 49);

  doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(22);
  text(site.parcelName || "Site Report", M, 92);

  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.setTextColor(198, 213, 245);
  text(place || origin?.label || "Selected parcel", M, 111);

  doc.setFontSize(8.5);
  doc.setTextColor(150, 178, 245);
  text(
    `${Math.abs(site.lat).toFixed(4)}° ${site.lat >= 0 ? "N" : "S"}  ${Math.abs(site.lng).toFixed(4)}° ${site.lng >= 0 ? "E" : "W"}`,
    M,
    126
  );

  // score badge
  setFill(AMBER);
  doc.roundedRect(W - M - 104, 40, 104, 68, 9, 9, "F");
  doc.setTextColor(13, 28, 50).setFont("helvetica", "bold").setFontSize(34);
  text(String(site.score), W - M - 52, 80, { align: "center" });
  doc.setFont("helvetica", "bold").setFontSize(7.5);
  text("HELIOSCORE / 100", W - M - 52, 97, { align: "center" });

  y = 168;

  /* --------------------------------------------------------- key figures */
  const kpis = [
    [num(site.annualKwh), "kWh per year"],
    [`${site.ghiDay}`, "kWh/m²/day GHI"],
    [site.payback ? `${site.payback} yr` : "-", "payback period"],
    [money(site.lifetimeSavings), "25-year savings"],
  ];
  const kw = CONTENT / 4;
  kpis.forEach(([big, small], i) => {
    const x = M + i * kw;
    if (i > 0) {
      setDraw(RULE);
      doc.setLineWidth(0.7);
      doc.line(x - 6, y - 14, x - 6, y + 16);
    }
    setColor(INK);
    doc.setFont("helvetica", "bold").setFontSize(15);
    text(big, x, y);
    setColor(MUTED);
    doc.setFont("helvetica", "normal").setFontSize(8);
    text(small, x, y + 14);
  });
  y += 34;

  /* -------------------------------------------------------------- identity */
  heading("Site identity");
  rows([
    ["Parcel", site.parcel || "-"],
    ["Rank", `#${site.rank} of ${config?.candidates ?? 3}`],
    ["Postal code", site.postcode || origin?.postal || "-"],
    ["Area", site.area || "-"],
    ["Locality", site.locality || "-"],
    ["Nearest road", site.road || "-"],
    ["Latitude", `${Math.abs(site.lat).toFixed(5)}° ${site.lat >= 0 ? "N" : "S"}`],
    ["Longitude", `${Math.abs(site.lng).toFixed(5)}° ${site.lng >= 0 ? "E" : "W"}`],
    ["Offset from centre", site.offsetKm === 0 ? "postcode centre" : `${site.offsetKm} km`],
    ["Inside postcode", site.inPostcode === false ? "approximate" : "confirmed"],
  ]);

  /* ---------------------------------------------------------------- score */
  heading("HelioScore breakdown");
  para(
    "A deterministic 0-100 index across four weighted dimensions. The weights are fixed and published; each sub-score derives from the measured values listed below."
  );
  (site.breakdown || []).forEach((b) => {
    need(21);
    doc.setFontSize(9.5);
    setColor(INK);
    doc.setFont("helvetica", "bold");
    text(b.key, M, y);
    setColor(MUTED);
    doc.setFont("helvetica", "normal").setFontSize(8.5);
    text(`weight ${b.weight}%`, M + 132, y);

    const bx = M + 196;
    const bw = CONTENT - (bx - M) - 34;
    setFill(RULE);
    doc.roundedRect(bx, y - 6.5, bw, 6.5, 3, 3, "F");
    setFill(b.score >= 70 ? AZURE : AMBER);
    doc.roundedRect(bx, y - 6.5, Math.max(3, (bw * b.score) / 100), 6.5, 3, 3, "F");

    setColor(INK);
    doc.setFont("helvetica", "bold").setFontSize(9.5);
    text(String(b.score), W - M, y, { align: "right" });
    y += 20;
  });
  y += 6;

  /* --------------------------------------------------------------- physics */
  heading("Measured solar resource");
  rows([
    ["Daily GHI", `${site.ghiDay} kWh/m²/day`],
    ["Annual GHI", `${num(site.ghiAnnual)} kWh/m²`],
    ["Clear-sky ceiling", `${site.clearDay} kWh/m²/day`],
    ["Cloud attenuation", `${site.cloudLossPct}%`],
    ["Mean air temperature", `${site.ambientC} °C`],
    ["Modelled cell temperature", `${site.cellC} °C`],
    ["Mean wind speed", `${site.windMs} m/s`],
    ["Thermal derate", `-${site.tempDeratePct}%`],
  ]);

  heading("Terrain (Copernicus 90 m DEM)");
  rows([
    ["Elevation", site.terrain ? `${site.terrain.elevation} m` : "-"],
    ["Slope", site.terrain ? `${site.terrain.slopeDeg}°` : "-"],
    [
      "Aspect",
      site.terrain?.aspectDeg == null
        ? "Flat"
        : `${site.terrain.aspectLabel} (${site.terrain.aspectDeg}°)`,
    ],
    ["Plane-of-array irradiance", `${num(site.poaAnnual)} kWh/m²/yr`],
    ["Optimal array tilt", `${site.tilt}°`],
    ["Optimal azimuth", `${site.azimuth}°`],
  ]);

  /* ---------------------------------------------------------------- system */
  const panelW = 450;
  heading("Recommended system");
  rows([
    ["Array capacity", `${site.capacityKwp} kWp`],
    ["Module count", `${Math.max(1, Math.round((site.capacityKwp * 1000) / panelW))} x ${panelW} W`],
    ["System derate", String(site.systemDerate)],
    ["Capacity factor", `${site.capacityFactorPct}%`],
    ["Specific yield", `${num(site.specificYield)} kWh/kWp`],
    ["Annual output", `${num(site.annualKwh)} kWh`],
  ]);

  /* ------------------------------------------------------------- economics */
  heading("Economics");
  rows([
    ["Electricity tariff", `${(site.tariff * 100).toFixed(1)} c/kWh`],
    ["Installed capital", money(site.capex)],
    ["Year-one savings", money(site.yearOneSavings)],
    ["Payback period", site.payback ? `${site.payback} years` : "-"],
    ["25-year net savings", money(site.lifetimeSavings)],
    ["CO2e avoided per year", `${site.co2PerYear} t`],
    ["CO2e avoided over 25 years", `${num(site.co2Lifetime)} t`],
    ["Equivalent mature trees", num(site.treesEquivalent)],
  ]);

  /* ------------------------------------------------------- monthly profile */
  const monthly = site.monthlyKwh || [];
  if (monthly.length === 12) {
    heading("Monthly yield profile");
    const peak = Math.max(...monthly, 1);
    const chartH = 96;
    need(chartH + 46);
    const colW = CONTENT / 12;
    const baseY = y + chartH;

    // baseline
    setDraw(RULE);
    doc.setLineWidth(0.7);
    doc.line(M, baseY, W - M, baseY);

    monthly.forEach((v, i) => {
      const h = Math.max(2, (v / peak) * (chartH - 14));
      const bw = colW * 0.56;
      const x = M + i * colW + (colW - bw) / 2;
      setFill(v >= peak * 0.92 ? AMBER : AZURE);
      doc.roundedRect(x, baseY - h, bw, h, 1.8, 1.8, "F");

      setColor(MUTED);
      doc.setFont("helvetica", "normal").setFontSize(6.4);
      text(MONTHS[i], x + bw / 2, baseY + 11, { align: "center" });
      doc.setFont("helvetica", "bold").setFontSize(6.4);
      setColor(INK);
      text(kcompact(v), x + bw / 2, baseY - h - 4, { align: "center" });
    });
    y = baseY + 26;
    setColor(MUTED);
    doc.setFont("helvetica", "normal").setFontSize(8);
    text(`kWh per month at ${site.capacityKwp} kWp. Amber marks the peak-harvest months.`, M, y);
    y += 12;
  }

  /* ------------------------------------------------------------ provenance */
  heading("Data provenance and limitations");
  para(
    "Irradiance, temperature and wind: NASA POWER climatology, a 20+ year satellite record sampled at this parcel's coordinates. Elevation, slope and aspect: Copernicus 90 m DEM via Open-Meteo. Place names and postal geometry: Nominatim / OpenStreetMap. The yield model follows the NREL PVWatts v8 derate chain; every constant it uses is published on the application's methodology page."
  );
  para(
    "Parcels inside a single postal code share one NASA POWER grid cell (0.5 degrees, roughly 55 km), so their irradiance and temperature are identical by measurement - differences between candidates come from terrain. Tariff is treated as a flat retail rate; in net-metering markets where export credits sit below retail, real payback is longer. These figures are modelled estimates for pre-feasibility screening and are not a substitute for an on-site survey."
  );

  need(24);
  setColor(MUTED);
  doc.setFont("helvetica", "normal").setFontSize(8);
  text(`Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`, M, y);

  footer();
  return doc;
}

/** Build and download as a .pdf file. Returns the filename used. */
export function downloadReportPdf(site, origin, config) {
  const doc = buildReportPdf(site, origin, config);
  const slug = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const parts = ["helioscan", slug(site.parcelName), slug(site.postcode)].filter(Boolean);
  const name = `${parts.join("-")}.pdf`;
  doc.save(name);
  return name;
}
