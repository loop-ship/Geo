# HANDOFF — Pole-Shift Simulator (as of 2026-07-31b)

Read `geo.html`'s header comment FIRST — it is the source of truth for build state, locked
decisions, physics constants with provenance, and landmines. This file covers only what that
header can't: **live status, what's verified vs. assumed, the regression oracles that matter, and
the active thread.**

**Starting cold? Read §1, then §7 — the theory/attribution audit is the live piece of work, and it
is a PLANNING task. §2 lists what is owed but unverified.**

---

## 1. Where things stand

**Live:** https://loop-ship.github.io/Geo/ — public repo `loop-ship/Geo`, GitHub Pages from `main`,
root. Every push auto-deploys in ~1 min. `build/` and `archive/` are git-ignored (they're ~1GB).

**Shipped and working:** the Stage 1–6 engine + E1–E21, plus this session's work — scientific
accuracy audit, file/doc reorg, Pages deploy, responsive settings drawer, PWA (installable +
offline), the approachability pass (neutral terminology, plain-English panels, Simple-mode
defaults, calmer marker density), iOS/Safari hardening, shareable view links, a drag-to-set-pole
fix, first-impression defaults + hint chip, a responsive opening camera frame, and **E22 monument
alignments** (§3) — which closes the last known capability gap — plus an off-centre opening frame,
proximity-scaled orbit/zoom sensitivity, and the monument-needle visibility fix (§6).

**Next up: a THEORY / ATTRIBUTION AUDIT — see §7. It is a PLANNING task, not an execution task.**

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
- **The 2026-07-31b visual changes were never seen by anyone**: the off-centre opening frame, the
  ~8% smaller globe (margin 0.80→0.74), the thicker monument needles, and the close-in orbit/zoom
  slowdown. Screenshot capture failed on every attempt that session (12+, both tool paths, with
  auto-rotate already off), so the framing was verified numerically from live DOM rects and the
  needle fix is arithmetic. **All four want an eyeball on a real focused tab.**
- **OPEN QUESTION for the user:** keep the globe ~8% smaller, or revert `openingDistance()`'s margin
  to 0.80? The shrink exists only to leave room for the downward nudge on laptop-sized windows
  (1536×864: 45px of nudge vs 18px; 1280×720: 24px vs 2px). On 1080p it buys nothing.

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

**Reachability (2026-07-31b, user review):** the toggle sits at the **Consequences folder root**, not in the
"Debated" subfolder — Simple mode hides those subfolders wholesale, which left "Show everything" as the only
route to it. The `~ DEBATED` chip rides on the control itself, so the grading is unchanged. The panel is
mode-split: **the residual numbers and the ⚠ flag render in both modes** (they are the honest signal — never
make them a mode-gated extra); only the prose paragraphs are `.adv-note`.

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
1. **The theory / attribution audit — §7. This is the active thread.** PLAN it first.
2. The owed **iOS/real-device checks** in §2 — the largest unverified surface.
3. The **Grok Build** experiment — repo is clean, standard static web code, ready to import; nothing
   here needs undoing for it. Untried.
4. Whatever the user's ongoing review turns up — that loop has caught the most real problems.

No feature is left mid-flight; E22 was the last one.

---

## 6. Shipped 2026-07-31b (three user-review fixes)

- **Monument needles were invisible** ("monuments do not seem to be showing up"). Not a logic fault —
  every number, toggle, label and colour was already correct. Marker sizes are **world units on a
  globe of radius 1, which renders ~260 px across at the opening frame**, so the 0.0035 cross-section
  drew **0.9 px**: sub-pixel geometry renders as *nothing*, not as something faint. Now 0.013
  (~3.4 px), lengths 0.11/0.17 → 0.17/0.25. **Multiply world units by ~260 before assuming any new
  marker reads.**
- **Off-centre opening frame** via `camera.setViewOffset` (off-axis projection — *not* a moved camera
  or orbit target, so the pivot stays at the globe's centre and raycasting/projected labels follow
  the projection matrix for free). Horizontal shift = half the drawer dock width, keyed to the 900px
  **dock** breakpoint and deliberately not to `drawer-open`, so the globe never jumps when the gear is
  tapped. Vertical nudge clamped by a circle-vs-rectangle clearance test against the readout.
- **Proximity-scaled sensitivity**: rotate 0.18→0.6 and zoom 0.34→1.0, lerped by altitude above the
  surface, full speed by distance 2.25 (inside the ~3.7 opening frame, so normal use is unchanged).

---

## 7. NEXT: THEORY / ATTRIBUTION AUDIT — **plan this, don't execute it**

The user's ask: *"revise all the theories — make sure ECDO aligns with what Roger Cunningham
published etc. for everything. Is Zacharias really the good name for that? Ben Davidson's model
overlap?"* Follow the working agreement: **research outward, produce a plan, get it revised, then
ship.** Do not start rewriting captions or presets before the plan is agreed.

### What the project already establishes (read before researching — don't redo this)
`RESEARCH_2_zacharias_ecdo_landscape.md` is the deepest source; `RESEARCH_1` §7 has the landscape;
`RESEARCH_6_premise_audit.md` is the last accuracy pass (2026-07-28).

- **ECDO** = *Exothermic Core-Mantle Decoupling – Dzhanibekov Oscillation*, attributed throughout our
  docs to **"The Ethical Skeptic" (@EthicalSkeptic), a pseudonym**. ~104° along the 31°E meridian to
  ~14°S/31°E (Zambia). `ECDOview` (ecdoview.com) is the competing tool — 69 reference sites.
- **Zacharias** = **@zachariaspro / geosyncmonitor.com** ("GEOSYNC // Earth Orientation Monitor").
  Observational/geodetic, IERS-data-driven, Chandler-Wobble-collapse → TPW. Distinct from ECDO in
  *method and destination* (~0.8°S, ~2°E, Gulf of Guinea, ~90–91°) while agreeing on the end state.
  RESEARCH_2 explicitly corrected an earlier **Zacharias ↔ Zecharia Sitchin name-conflation** — there
  is no Sitchin lineage. A stale "attribution unverified" caption was also fixed on 2026-07-28.
- **Ben Davidson** (@SunWeatherMan, Suspicious0bservers) is in `RESEARCH_1` §5 only for the **solar
  micronova**, which is refuted as stated (a micronova is a white-dwarf binary phenomenon; the Sun is
  main-sequence with no companion). The legitimate adjacent science is superflares on Sun-like stars
  and Miyake events (774/775 CE).

### The four questions to answer, in priority order
1. **Is "The Ethical Skeptic" actually Roger Cunningham?** *Nothing in our research says so* — every
   ECDO reference we hold is to the pseudonym. The user asserts the name; it may well be right, but
   **it must be sourced before it goes anywhere near a user-visible caption**, because misattributing
   a real, named person is a materially worse error than any of the physics labels. If it can't be
   sourced to something solid, keep citing the pseudonym and say why.
2. **Is "Zacharias" the right label?** It is a *handle*, not a person's name (real identity is
   undisclosed per RESEARCH_2). Consider relabelling the preset to the framework — **"GEOSYNC"** or
   "Zacharias · GEOSYNC" — which is more accurate, more searchable, and doesn't imply we know who
   they are. Cheap change: it's a `SCENARIOS` entry + caption.
3. **Ben Davidson overlap — and a real GAP.** RESEARCH_2 cites a "three different pole locations"
   post (@EthicalSkeptic / @SunWeatherMan / @Zachariaspro) putting **Davidson's pole in the Bay of
   Bengal**. The app ships Hapgood, ECDO and Zacharias presets — **there is no Davidson preset**, so
   the "three locations" framing is incomplete. Adding it is a natural, cause-agnostic fit (it's
   coordinates + a graded caption). His solar-forcing claims also overlap E13/E19, which are already
   graded contested/speculative — check the caveats don't need a named cross-reference.
4. **Sweep every other user-visible claim** for the same drift the 2026-07-28 audit found: each
   `SCENARIOS` caption, every `STANDING_INFO` entry, and each Model Caveats `<li>`. The pattern to
   look for is a citation that has quietly stopped matching what the layer actually does.

### Constraints that must survive the audit
- The engine is **cause-agnostic** — it must not endorse any of these. Presets are coordinates plus a
  graded caption, nothing more.
- **Terminology is locked** (2026-07-30): displayed tiers are *established / DEBATED / UNVERIFIED*;
  "fringe"/"pseudoscience" appear in **no** user-visible string — state the specific reason instead.
  `STANDING` object keys are unchanged internal ids.
- Any grading change must update **both** `STANDING_INFO` and the matching Model Caveats `<li>` —
  single grading, two surfaces.

---

## 8. Parked question: install / usage metrics

User asked whether they can tell when people add the app to their Home Screen. Answered but **not
implemented — it's a privacy and architecture decision, so plan it rather than slipping it in.**

- **Client-side signals exist**: `appinstalled` fires on install and `beforeinstallprompt` indicates
  installability (both **Chrome/Android only — iOS fires neither**); the only iOS signal is that the
  *current session* is running installed, via `navigator.standalone` or
  `matchMedia('(display-mode: standalone)')`.
- **But there is nowhere to send them.** GitHub Pages is static: no backend, and it exposes no access
  logs. Repo Insights → Traffic covers the *repository*, not the deployed site.
- **So it needs a third-party endpoint.** Cloudflare Web Analytics (free, cookieless, one script) or
  GoatCounter (open-source, free at this scale) are the least-invasive fits; either can take a custom
  event fired from `appinstalled` plus a once-per-session standalone-mode ping.
- **Weigh against**: it adds the project's first external runtime dependency, must not break the
  offline/service-worker story (don't precache it; let it fail silently), and is the first time the
  app would send *anything* about a visitor anywhere. Worth being deliberate about.
