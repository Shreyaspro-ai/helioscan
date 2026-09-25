# Agent guide

Read this before writing code. It exists so you don't rebuild something the
project already has.

Most of what a brief would ask for — **map site selection, postal-code
validation, country data, geocoding, the solar model, PDF and CSV export,
i18n** — is already implemented and working. Use it. If you think you need a
new version of one of these, you almost certainly want to extend the existing
module instead.

---

## Already built — do not reimplement

| Capability | Where | Use it like |
|---|---|---|
| **Interactive map + draggable pin** | `helioscan/src/components/MapPicker.jsx` | `<MapPicker lat={n} lng={n} zoom={11} height={300} onPick={(lat,lng)=>…} />` |
| **Ranked results map** | `helioscan/src/components/ResultsMap.jsx` | `<ResultsMap sites={sites} selectedId={id} onSelect={fn} />` |
| **Postal-code validation** | `helioscan/src/lib/postal.js` | `validatePostal(countryCode, value)` → `{state:'valid'\|'invalid'\|'none'\|'idle', message}` |
| **199 countries + postal formats** | `helioscan/src/data/countries.js` | `COUNTRIES`, `getCountry(code)`, `flagOf(code)` |
| **380 cities / capitals** | `helioscan/src/data/cities.js` | `citiesIn(cc)`, `cityByPostal(cc, code)`, `nearestCity(lat,lng)`, `distanceKm(...)` |
| **Country combobox (searchable)** | `helioscan/src/components/CountryPicker.jsx` | `<CountryPicker value={cc} onChange={setCc} />` |
| **Country flags** | `helioscan/src/components/Flag.jsx` | `<Flag code="US" size={20} />` |
| **Postal → area + parcel placement** | `helioscan/src/lib/geocode.js` | `lookupPostal(cc, code)`, `resolveParcels(centre, radiusKm, expectedPostal)`, `reversePoint(lat,lng)` |
| **Elevation / slope / aspect** | `helioscan/src/lib/elevation.js` | `fetchTerrain([{lat,lng}])` — one batched call |
| **NASA climatology** | `helioscan/src/lib/nasaPower.js` | `fetchClimate(lat, lng)` |
| **Solar yield + scoring model** | `helioscan/src/lib/solar.js` | `modelSite(climate, {capacityKwp, tariff, terrain})` |
| **Scan orchestration / app state** | `helioscan/src/state/SiteContext.jsx` | `useSite()` → `{scan, sites, selected, origin, config, …}` |
| **PDF dossier** | `helioscan/src/lib/reportPdf.js` | `downloadReportPdf(site, origin, config)` |
| **CSV / JSON export** | `helioscan/src/lib/exportData.js` | `downloadCsv(rows, name)`, `buildMatrixRows(...)`, `slug(...)` |
| **Translations (EN/ES/FR/DE/HI)** | `helioscan/src/i18n/` | `useT()` → `t('nav.find')`; add keys in `strings.js` |
| **Liquid-glass UI** | `helioscan/src/styles/glass.css` | classes `.glass`, `.glass-strong`, `.glass-lens`, `.glass-hover`, `.glass-edge` |
| **Page morph transitions** | `helioscan/src/styles/transitions.css` | `<Link viewTransition to="…">` |

A full scan already chains all of it:
`lookupPostal → resolveParcels → fetchClimate → fetchTerrain → modelSite → rank`
in `SiteContext.scan()`. Start there before adding anything.

---

## Stack constraints

- **JavaScript with JSX, not TypeScript.** No `.ts`/`.tsx`. Don't convert files.
- **React 19 + Vite + Tailwind 3.** Tailwind uses a custom token set generated
  from the original design (`surface-container-lowest`, `on-surface-variant`,
  `space-md`, `font-headline-lg`…). Use those tokens, not arbitrary hex.
- **react-router-dom 7 with a *data router*** (`createBrowserRouter` in
  `main.jsx`). `<Link viewTransition>` and `useViewTransitionState()` throw
  outside one — do not swap back to `<BrowserRouter>`.
- **No backend, no API keys, no `.env`.** Every data source is keyless and
  CORS-enabled and is called straight from the browser. Keep it that way; a key
  would have to be committed to be useful, and this repo is public.
- **Leaflet for maps, not Google Maps.** Google's tile and Maps JS APIs need a
  billable key. Tiles come from OpenStreetMap and Esri. To switch providers,
  replace the `<TileLayer>` in `MapPicker.jsx` / `ResultsMap.jsx` — nothing else
  touches Leaflet.

---

## Landmines

These are bugs that were hit and fixed. Reintroducing them is easy.

- **NASA POWER is a 0.5° grid (~55 km).** Parcels closer than that resolve to
  the *same cell* and return byte-identical climate. `resolveParcels` places
  candidates inside the postcode and differentiates them on terrain, which is
  what actually varies at that scale. An earlier version fetched climate per
  parcel and scored all three identically.
- **Nominatim allows ~1 request/second.** `geocode.js` serialises calls through
  a queue with a 1.1 s gap and caches results. Don't call it in a `Promise.all`.
- **jsPDF's built-in fonts are WinAnsi.** A character outside that set corrupts
  the *whole text run*, not just itself (`CO₂e` once rendered as
  ` C O  e `). All PDF text goes through `safe()` in `reportPdf.js`.
- **CSV must be RFC 4180 + UTF-8 BOM.** Without the BOM Excel on Windows shows
  `kWh/mÂ²`. Use `downloadCsv`, don't hand-roll.
- **`@import` must be the first rule in a stylesheet.** `glass.css` and
  `transitions.css` are imported above the `@tailwind` directives in
  `index.css`. Move them below and the browser silently discards the file —
  every glass panel loses its blur with no error.
- **`backdrop-filter` makes an element a stacking context.** Decorative
  pseudo-elements on `.glass` need `z-index: -1` or they paint over the card's
  content.
- **`view-transition-name` must be unique per snapshot.** Three cards claiming
  the same name silently kills the morph; see the conditional naming in
  `Results.jsx`.
- **Flags are images, not emoji.** Windows ships no flag-emoji font, so 🇺🇸
  degrades to the letters "US". Use `<Flag />`.

---

## Conventions

- Comments explain *why*, not *what*. Don't narrate the code.
- Animation must never decide whether content is readable — a failed
  `whileInView` once left every result card at `opacity: 0`.
- Model constants are declared at the top of `solar.js` and published on the
  methodology page. If you change one, change the page too.
- Check work in a browser that renders. The values are live, so a change can
  compile and still be wrong.

## Running it

```bash
cd helioscan
npm install
npm run dev     # http://localhost:5173
npm run build
```
