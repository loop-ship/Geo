# HANDOFF — Pole-Shift Simulator (as of 2026-07-31)

Read `geo.html`'s header comment FIRST — it is the source of truth for build state, locked
decisions, physics constants with provenance, and landmines. This file covers only what that
header can't: **live status, what's verified vs. assumed, and the regression oracles that matter.**

---

## 1. Where things stand

**Live:** https://loop-ship.github.io/Geo/ — public repo `loop-ship/Geo`, GitHub Pages from `main`,
root. Every push auto-deploys in ~1 min. `build/` and `archive/` are git-ignored (they're ~1GB).

**Shipped and working:** the Stage 1–6 engine + E1–E21, plus this session's work — scientific
accuracy audit, file/doc reorg, Pages deploy, responsive settings drawer, PWA (installable +
offline), the approachability pass (neutral terminology, plain-English panels, Simple-mode
defaults, calmer marker density), iOS/Safari hardening, shareable view links, a drag-to-set-pole
fix, first-impression defaults + hint chip, a responsive opening camera frame, and **E22 monument
alignments** (§3) — which closes the last known capability gap.

**Working agreement with the user:** the loop is **review → research → plan → revise → ship**.
"Research" means look *outward* (comparable tools, current literature, best practice), not re-read
our own code. Don't turn a stated long-term goal into an immediate execution plan — scope to the
near-term ask. Browser testing must use the **spaceXAI** Chrome window; **never touch the
Stormcrow-weather app on localhost:8000.**

---

## 2. Verified vs. NOT verified (don't over-claim)

**Verified in-browser:** E22's three oracles, its share-link round-trip both directions, bundle wiring
and clean off-state, with the needles visibly rendering at the correct geography (§3);
SW registers and serves offline with the server killed; a pushed update
still propagates (network-first HTML); share links round-trip to an exact match; drag-to-pole is
stable and tap-safe; Simple = 5 panels / 28 controls vs Advanced 10 / 67; Detail=High reproduces
the old marker baseline exactly (2,207 quakes / 62 volcanoes).

**NOT verified — owed, and only the user can do it:**
- iOS in **landscape** (notch/Dynamic Island clearance) — portrait install + open are confirmed.
- Transport bar vs. the home indicator; pinch/orbit *feel* on real glass.
- Offline on iPhone after a first load (airplane mode).
- Visual confirmation of the newest defaults (no wireframe, photoreal, auto-rotate) and the new
  portrait camera framing.

**Testing-environment gotchas that will waste your time if you don't know them:**
- The automation tab is usually **backgrounded** → `document.hidden` is true, so `requestAnimationFrame`
  and `setTimeout` are throttled. The app's own `scheduleEffects` debounce stalls; test harnesses must
  avoid `await setTimeout` and instead use a control whose `onChange` calls `computeEffects()` directly.
- With auto-rotate now on, **screenshots frequently time out** (render loop keeps the tab busy).
  Prefer DOM/state assertions over screenshots.
- Module scope is not reachable from the console — drive the app through its lil-gui DOM controls.
- Synthetic `left_click_drag` does not reach the canvas; dispatch `PointerEvent`s directly instead.

---

## 3. SHIPPED 2026-07-31: E22 monument alignment layer

**Built, wired and verified in-browser.** Nothing here is left to do — this section is kept because the
oracles and the three honesty points are what any future edit to the layer must not break.

**Regression oracles (cross-checked in Python and in-browser, identical to the digit):**

| Check | Expected |
|---|---|
| Bearing to today's pole, from any site | `0.000°` |
| Giza residual vs today's pole | `0.067°` (reproduces Dash 2017 — the proof the chain is right) |
| Giza residual vs the ECDO pole (−14, 31) | `0.255°`, same-meridian flag fires at Δlon `0.13°` |
| Giza vs a control pole (45N, 100W) | `32.16°`, no flag |

Fastest way to re-run them: load `#lat=-14&lon=31&fx=%2BmonumentAlign` (note `%2B` — a literal `+` in a
query string decodes to a space) and read `#monu-panel`. Changing only the hash on an already-loaded page
is a same-document navigation and will NOT re-run the restore; force a reload.

### Verified — reuse, don't redo
`initialBearing(lat1,lon1,lat2,lon2)` = standard great-circle forward azimuth
`atan2(sinΔλ·cosφ2, cosφ1·sinφ2 − sinφ1·cosφ2·cosΔλ)`, normalised 0–360. Checked:
- bearing to today's pole (90°N) = **0.000° from every site**, as it must be;
- Giza residual vs today's pole = **0.067°**, which reproduces Dash 2017 exactly. That match is the
  proof the whole chain is right — re-run it as the regression oracle.

Monument axes are **lines, not rays**, so the residual folds to 0–90°:
`d = |((az − bearing + 180) mod 360) − 180|; residual = min(d, 180 − d)`.

### Cited site data (do NOT invent azimuths; a short honest list beats ECDOview's 69)
| Site | lat, lon | azimuth | aim | source |
|---|---|---|---|---|
| Giza, Great Pyramid | 29.9792, 31.1342 | 359.933 (0.067° CCW of cardinal) | `cardinal` | Dash 2017 |
| Göbekli Tepe (Enclosure D) | 37.2233, 38.9224 | ~172° (C ≈165°, B ≈159°) | `stellar` | Magli |
| Teotihuacán, Ave. of the Dead | 19.6925, −98.8438 | 15.5° E of N | `solar` (deliberate) | Šprajc |

### The two honesty points that are the REASON to build this
1. **Giza matches *today's* pole to 0.067°.** Any large pole shift after ~2500 BC would have left a
   residual of degrees, not arcminutes — so the monument data *constrains* a recent shift to be
   near-zero. Show today's residual and the hypothesised-pole residual **side by side** (user's
   explicit choice) and let the reader draw the conclusion.
2. **Giza also "aligns" with the ECDO pole at 0.255° — and that is a trap, not evidence.** ECDO puts
   its pole at 31°E; Giza sits at 31.13°E, essentially the same meridian, so its N–S axis trivially
   points at anything placed on that line. **Flag same-meridian coincidence in the UI**; it is the
   most valuable thing this layer can demonstrate, and it's a check ECDOview does not appear to make.
3. Only `cardinal`-aimed sites can test pole position at all. Göbekli Tepe is stellar and
   Teotihuacán's offset is deliberate — score neither as pole evidence; plot them as context,
   explicitly labelled "not a pole indicator."

### How it was built (all of this is now in the code)
One `InstancedMesh` via `finalizeMarkerMesh(mesh, 11)`, `MAX_MONU = 32`, count cleared when off — the
E9–E16 pattern. `renderMonumentAlignments()` is a **standalone function called at the end of
`computeEffects()`**, not another block inside it: it needs nothing from the Fibonacci site loop, and
`computeEffects` is the one function the header says not to grow.

Two details worth knowing before editing:
- **The pole tested against is read back as `R⁻¹·NORTH`, not from `shiftParams`** — so the residual tracks
  the shift scrubber, shared links and the story clock, all of which move `R` without touching `shiftParams`.
- **`initialBearing()` takes TRUE east-longitude.** `latLonToDir()` negates longitude for the texture-UV
  flip; that negation is a *rendering* convention and must never reach the bearing math, or every azimuth
  silently mirrors. Only marker *placement* goes through `latLonToDir`.

Wired into: `fxContested` (default OFF), `STANDING_INFO` (contested), `PLAIN_NAMES`, the "Show everything"
bundle, share links (`+monumentAlign`), a Model Caveats `<li>`, three legend rows, and screen-projected
site labels. `#monu-panel` is deliberately a **sibling** of `.readout-adv`, not a child, so the side-by-side
comparison survives Simple mode.

**Two adjacent bugs fixed in the same pass:** `LEGEND_PLAIN` was keyed without the `(E9)…(E16)` codes the
legend markup actually carries, so every coded legend row silently failed to swap to plain language (the
matcher now tolerates a trailing code); and `#hint-chip` had a hard-coded `bottom:64px` tuned to the short
Simple-mode readout, so any taller readout slid underneath it (now `positionHintChip()`).

---

## 4. Deliberately NOT doing (decided, with reasons — don't silently retry)

- **`computeEffects()` function-split: attempted and reverted.** ~8 delicate extractions on an
  untested 4k-line file, 45s+ browser verification cycles, zero user-visible payoff. Full reasoning
  and the numeric regression baseline are in `geo.html`'s header. Revisit only with a real test
  harness.
- **E18–E21 internal cleanup** — that code is genuinely complex, not duplicated; no mechanical win.
- **KTX2/Basis compression, shader branchless rewrite** — need external tooling; FPS is already good
  (user-confirmed).
- **App stores** — don't, until real people are using the web version and asking.

## 5. Obvious next moves
1. The owed **iOS/real-device checks** in §2 — now the largest unverified surface.
2. The **Grok Build** experiment — repo is clean, standard static web code, ready to import; nothing
   here needs undoing for it. Untried.
3. Whatever the user's ongoing review turns up — that loop has caught the most real problems.

There is no longer a feature left mid-flight; E22 was the last one.
