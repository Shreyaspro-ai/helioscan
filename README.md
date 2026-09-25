# HelioScan — Solar Intelligence

Find the highest-yield solar sites anywhere on Earth, using real satellite data.

Pick a location and HelioScan pulls live climatology from **NASA POWER** for that
exact point — a 20+ year satellite record — runs it through an NREL PVWatts-style
derate chain, and ranks candidate parcels on a transparent 0–100 score.

It is not a mock. Every irradiance, temperature and terrain figure is fetched at
run time, and every constant in the model is declared in source rather than
tuned, so the arithmetic can be checked.

```bash
cd helioscan
npm install
npm run dev      # http://localhost:5173
```

No API keys, no `.env`, no backend. Every data source it uses is keyless and
CORS-enabled, so the browser calls them directly.

> **Building on this with an AI tool?** Read [AGENTS.md](AGENTS.md) first — it's
> an inventory of what already exists (map picker, postal validation, 199-country
> dataset, solar model, PDF/CSV export, i18n) so none of it gets rebuilt from
> scratch, plus the stack constraints and the bugs not to reintroduce.

## What's here

| Path | |
|---|---|
| [`helioscan/`](helioscan) | The React + Vite app. **[Full documentation](helioscan/README.md)** |
| [`src_html/`](src_html) | The original design screens, plus `convert.cjs` — the HTML-to-JSX converter used to port them |

## The app

Five screens: a landing page, location finder, ranked results, a detailed site
report, and the scoring methodology.

- **Real data** — NASA POWER climatology, Copernicus 90 m elevation, Nominatim
  geocoding, OpenStreetMap and Esri satellite tiles. All keyless.
- **199 countries** with postal-code formats and validation, and 380 locations.
- **An interactive map** — click anywhere or drag the pin to set a site.
- **A transparent model** — irradiance 40%, thermal 25%, terrain 20%, payback
  15%, with every weight and constant published on the methodology page.

Sanity-checked against published specific yields: Atacama 2,103 kWh/kWp,
Ouarzazate 2,137, Phoenix 2,070, London 1,137, Tromsø 778.

## Built with

React 19, Vite, Tailwind, [Motion](https://motion.dev),
[react-bits](https://reactbits.dev), Leaflet, and the View Transitions API for
page morphs.

The detailed README in [`helioscan/`](helioscan/README.md) covers the solar
model, the liquid-glass system, the page morph transitions, and how the original
HTML screens were ported.

## Credits

Data by [NASA POWER](https://power.larc.nasa.gov/),
[Open-Meteo](https://open-meteo.com/),
[OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, and Esri.
Built toward **UN SDG 7 — Affordable & Clean Energy**.
