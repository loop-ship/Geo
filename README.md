# Pole-Shift Simulator

An interactive 3D globe that lets you pick where Earth's North Pole moves to and shows the
consequences of that crustal-displacement / pole-shift scenario — ocean redistribution and new
coastlines, earthquakes, volcanism, tsunamis, glacial rebound, climate-belt shifts, and more.

Its distinguishing feature is **honesty**: every effect layer is graded by scientific standing —
**established**, **contested**, or **speculative** — shown right on the control and in a "Model
Caveats" panel, with named sources. It runs the fringe pole-shift scenarios (Hapgood, ECDO,
Zacharias/GEOSYNC) faithfully *and* labels exactly where each one departs from mainstream
geophysics. **It is a "what-if" explorer, not a forecast.**

## Run it

It's a single self-contained page plus a few data files — no build step. Serve the folder over
HTTP and open it:

```bash
python -m http.server 8000
# then open http://localhost:8000/  (or /geo.html)
```

(Opening `geo.html` directly via `file://` won't work — the browser blocks it from loading the
sibling terrain/texture files. Any static host, including the served folder above or GitHub
Pages, is fine.)

## What's here

- **`geo.html`** — the application. It is *self-describing*: a long header comment records the
  full build status, locked design decisions, physics constants with provenance, and known
  landmines. Read that header before editing.
- **`index.html`** — a thin redirect so the site root opens the app.
- **`earth_terrainrgb.png`, `plate_boundaries.json`, `earth_day.jpg`, `earth_night.jpg`,
  `earth_specular_clouds.jpg`** — the runtime data (real ETOPO-derived terrain, plate boundaries,
  and photoreal Earth textures).
- **`research/`** — the five research reports and premise audit behind the model, plus the full
  dated `CHANGELOG.md`.
- **`build/`** — data-generator scripts and their raw sources (not needed to run the app; not
  deployed).

## Stack

Three.js + WebGL2, one custom `ShaderMaterial`, `lil-gui` — vanilla, no framework, no bundler.
Three.js loads from a pinned CDN via an importmap.

## Caveat

The rapid, large pole shifts this tool explores are **not** accepted mainstream science; the
underlying real-time math is a deliberate simplification of the rigorous (non-real-time) tools it
approximates (e.g. LIOUSHELL for true polar wander, SELEN4/giapy for glacial-isostatic sea level).
Outputs are scenario exploration for understanding, not prediction.
