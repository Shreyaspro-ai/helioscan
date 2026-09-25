# HelioScan — Solar Intelligence

A React port of the five HelioScan design screens, wired into a single routed
site with motion throughout.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
```

## Routes

| Route           | Screen                                        | Source |
|-----------------|-----------------------------------------------|--------|
| `/`             | Welcome / landing                             | link 5 |
| `/find`         | Find locations (pincode + satellite picker)   | link 2 |
| `/results`      | Results overview — top 3 locations            | link 3 |
| `/report`       | Detailed location report                      | **reconstructed** — see below |
| `/methodology`  | How it works & methodology                    | link 1 |

### About 

Link 4 originally 404'd, so this page was reconstructed. The real design was
supplied later and **has now replaced the reconstruction** — the page is ported
from source like the other four, then bound to live scan data.


## Real data

The app is not a mock. Picking a location fetches live climatology from
**NASA POWER** for that exact point — a 20+ year satellite record, no API key,
and it sends `access-control-allow-origin: *`, so the browser calls it directly
with no proxy and no server.

`src/lib/solar.js` runs a PVWatts-style derate chain over that data: tilt gain,
cloud attenuation from the all-sky/clear-sky pair, cell-temperature derate from
T2M and wind, then yield, payback and CO₂. Every constant is declared at the top
of the file rather than tuned, so the arithmetic is checkable — which is the
claim the product makes about itself.

Sanity-checked against published specific yields:

| Site | GHI kWh/m²/day | Modeled kWh/kWp | Published range |
|------|---------------|-----------------|-----------------|
| Atacama, Chile | 6.18 | 2,103 | ~2,100–2,300 |
| Ouarzazate, Morocco | 5.98 | 2,137 | ~2,000–2,200 |
| Phoenix, US | 5.85 | 2,070 | ~1,900–2,100 |
| Bengaluru, India | 5.48 | 1,719 | ~1,600–1,800 |
| London, UK | 2.94 | 1,137 | ~950–1,100 |
| Tromsø, Norway | 1.96 | 778 | Arctic, very low |

POWER serves a 0.5° grid (~55 km), so the three candidate parcels are spaced
~0.5–0.75° apart. Closer together they resolve to the **same** grid cell and
come back byte-identical, which makes the ranking meaningless — an early version
did exactly that and scored all three parcels 62.

Responses are cached in `localStorage` for a month (climatology is static), and
a completed scan is kept in `sessionStorage` so a refresh, or a deep link
straight to `/report`, doesn't throw the work away.

## Countries and locations

- **199 countries** in `src/data/countries.js` — capital, coordinates, region,
  and a postal-code regex with a real example. 144 have postal systems; the
  other 55 genuinely don't, and are handled as an optional locality field rather
  than failed validation.
- **380 locations** in `src/data/cities.js` — every capital derived from the
  country table, plus 181 extra cities weighted toward high-irradiance regions.
  These drive the presets, postal lookup and the map pin's reverse geocode.
- Flags render as **images from flagcdn**, not emoji. Windows ships no
  flag-emoji font, so 🇺🇸 degrades to bare "US" letters there; the emoji is kept
  as the fallback for platforms that do draw it.

## The map

`MapPicker` is a real slippy map — click anywhere or drag the teardrop pin, with
a satellite/street toggle and browser geolocation. Tiles come from OpenStreetMap
and Esri World Imagery, both keyless.

**Google Maps is not used.** Its tile and Maps JS APIs require a billable API key
tied to a Google Cloud account, which this app has no way to provision. Swapping
Google in later means replacing the two `<TileLayer>`s in `MapPicker.jsx` and
`ResultsMap.jsx` — nothing else in the app touches Leaflet.

Wheel-zoom is off on both maps: a full-width map that swallows the scroll wheel
traps the page.

## Liquid glass & wallpaper

`src/styles/glass.css` plus `Wallpaper.jsx`, `GlassPointer.jsx` and `Parallax.jsx`.

Glass needs something behind it or it is just a grey box, so `Wallpaper` sits
fixed behind the whole app: three brand-coloured blooms that drift and parallax
at different rates, a masked grid that gives the blur structure to smear, and an
SVG grain layer so the wide gradients don't band. It is all CSS gradients and one
inline SVG — no image request, nothing hotlinked.

Each pane stacks four things rather than one blur: a translucent tint, a real
`backdrop-filter` with a saturation lift, a lit inner rim, and an outer shadow
that separates it from the wallpaper.

| Class | Use |
|---|---|
| `.glass` | Standard card |
| `.glass-strong` | Header and dropdowns — heavier, because content scrolls under them |
| `.glass-thin` | Chips and inline controls |
| `.glass-dark` | Panes on the navy sections |
| `.glass-sheen` | Slow specular sweep (hero plates only) |
| `.glass-lens` | Cursor-tracked refraction |
| `.glass-hover` | Lift on hover |
| `.glass-edge` | Bright rim caustic |

The lens highlight is driven by a single passive `pointermove` listener in
`GlassPointer` that writes `--gx`/`--gy`/`--glow` on whichever pane is under the
cursor, throttled to one rAF. Per-card React state would re-render a whole grid
on every mouse move; this way the browser just repaints a gradient and React
never hears about it.

Two things worth knowing if you edit this:

- **`@import` must be the first rule in a stylesheet.** The glass import was
  originally placed after `@tailwind utilities` and the browser silently
  discarded the entire file — every pane rendered with no blur at all. It now
  sits above the `@tailwind` directives.
- **The rules are deliberately not in `@layer components`.** They set properties
  no Tailwind utility touches, so they never need to win a specificity fight, and
  relying on Tailwind to hoist a layer out of an imported file adds a failure
  mode for nothing.

`prefers-reduced-motion` stops the sheen, the hover lift, the icon scaling and
the parallax; `@supports not (backdrop-filter)` thickens every tint so the panes
stay readable without the blur.

## Page morph transitions

`src/styles/transitions.css`, driven by React Router's view-transition support.

Navigating runs a real morph rather than a cross-fade: the page scales and
un-blurs into place, and the card you clicked on `/results` **flies into** the
report header on `/report`, interpolating position, size and corner radius.

### Why the View Transitions API and not Motion

A shared-element morph needs the old and new DOM alive at the same time so an
element can be interpolated between two boxes. `AnimatePresence mode="wait"`
unmounts the old page *before* mounting the new one, so `layoutId` has nothing
to morph between; dropping `mode="wait"` instead leaves two full pages stacked
in flow. The View Transitions API sidesteps both by snapshotting the old state,
applying the DOM update, then animating between snapshots.

Motion still owns everything *inside* a page — scroll reveals, counters, the
glass hover. It just no longer owns the page swap: `Reveal.Page` renders a plain
`<main>` when `document.startViewTransition` exists, and `AnimatePresence` is
mounted only as the fallback for browsers without it. Running both would animate
the same pixels twice.

### How the shared element works

`view-transition-name` must be **unique within a snapshot**. Three result cards
claiming `site-plate` at once silently kills the entire morph, so the name is
claimed conditionally: `useViewTransitionState()` tells the page a morph to or
from `/report` is in flight, and only the selected card takes the name. The
report header carries it unconditionally, since only one report is ever on
screen. That gives the morph in both directions.

Verified by instrumenting `startViewTransition`: on a card click exactly one
element held `site-plate` at snapshot time.

### Things that will bite you

- **This needs a data router.** `<Link viewTransition>` and
  `useViewTransitionState()` both throw outside one — the app was on
  `<BrowserRouter>` and crashed to a blank page until it moved to
  `createBrowserRouter` + `RouterProvider`.
- **The header and wallpaper are named** (`app-header`, `app-wallpaper`) with
  their animations disabled. Without that they get swept into the root snapshot
  and cross-fade with the page instead of holding still.
- **A skipped transition rejects its promises.** Navigating again mid-morph, or
  a hidden document, aborts the transition with an `InvalidStateError`. The
  navigation still completes, so `main.jsx` swallows that one rejection narrowly
  and lets every other one through.

Reduced motion drops the whole thing to a 140 ms cross-fade rather than removing
it — an instant swap is its own kind of disorienting.

## How the port was done

The four reachable screens were converted mechanically rather than retyped, so
the markup stays faithful to the originals:

- `../src_html/convert.cjs` parses each source file, strips the shared
  header/footer, and emits JSX (`class`→`className`, void elements self-closed,
  inline `style` strings→objects, comments preserved).
- It also tags elements for the animation engine: `data-reveal-group` on every
  `<section>`, `data-reveal` on cards and headings.
- The Tailwind theme (47 colour tokens, the type ramp, spacing scale) was
  extracted from the source `<script id="tailwind-config">` into
  `tailwind.config.js`. The configs across screens were verified identical.

Re-running the converter needs `npm install` inside `../src_html` first
(`node-html-parser`); it will overwrite hand-made edits to the page files.

## Animation

**[Motion](https://motion.dev)** (`motion` v12) and
**[react-bits](https://reactbits.dev)** components (installed into
`src/components/` via the shadcn registry, so they are local and editable).

`src/components/Reveal.jsx` is the site-wide engine. Because the pages are
ported markup, it drives them from the `data-reveal` tags rather than requiring
several hundred hand-wrapped `<motion.div>`s:

1. sections stagger their contents in on scroll (Motion's `inView` + `stagger`)
2. score/progress bars fill from zero
3. large numeric stats count up
4. elements are armed *from JS*, so if scripting fails the page renders fully
   visible rather than blank — and elements with no layout box (a
   `hidden md:flex` ancestor) are skipped so they can never strand invisible

Per-screen work beyond that:

- **Header** — sliding `layoutId` nav pill, condense-on-scroll, animated SVG sun
  mark (the source's hotlinked logo URL is dead; rebuilt from the spec in its
  `alt` text), scroll progress bar
- **Landing** — word-by-word blur-resolve headline, self-drawing underline,
  `LightRays` volumetric background, magnetic CTA
- **Find** — `layoutId` tab switcher with crossfading panels, live bill slider
- **Results** — map pins spring-drop in sequence and lift on hover
- **Report** — sweeping score dial, hoverable irradiance chart, payback timeline
- **Methodology** — height-animated FAQ accordion, interactive `DotGrid` field

Reduced motion is honoured two ways: `MotionConfig reducedMotion="user"` for
component animations, and an early return in the reveal engine plus a CSS
`@media (prefers-reduced-motion: reduce)` block.

### Code splitting

The two decorative WebGL/GSAP backgrounds are the only heavy third-party
dependencies in the tree, so `src/components/LazyFX.jsx` loads them on demand
via `React.lazy` — deferred past first paint to an idle callback, and skipped
entirely (chunk never fetched) when the viewer prefers reduced motion.

| Chunk            | Carries              | Size    | gzip     |
|------------------|----------------------|---------|----------|
| `index`          | app + React + Motion | 533 kB  | 156 kB   |
| `LightRays`      | `ogl`                | 52 kB   | 16 kB    |
| `DotGrid`        | `gsap` + Inertia     | 80 kB   | 31 kB    |

That took the main chunk from 665 kB / 204 kB gzip down to the above. The other
react-bits components are installed but unused, so they are already tree-shaken
out — they cost nothing until imported.

The main chunk still trips Vite's 500 kB advisory. The next lever is route-level
splitting (`lazy()` around the five page components in `App.jsx`), which would
move four of the five pages off the initial load.

## Restored interactivity

The source screens carried their behaviour in inline `<script>` tags, which the
converter strips. Two were reimplemented in React: the location tab switcher
(`/find`) and the FAQ accordion (`/methodology`). The monthly bill slider was
additionally wired to its own readout, which was static in the original.

## Notes

- Images are hotlinked to the original Google usercontent URLs, as requested.
  All still resolve except the brand logo, replaced by the inline SVG above.
- `px- space-sm` / `py- space-sm` appear as invalid classes in the source HTML
  itself; removed during the port with no visual change (`px-3` already won).
