# HANDOFF — Pole-Shift Simulator (as of 2026-08-01)

Read `geo.html`'s header comment FIRST — it is the source of truth for build state, locked
decisions, physics constants with provenance, and landmines. This file covers only what that
header can't: **live status, what's verified vs. assumed, the regression oracles that matter, and
the active thread.**

**Starting cold? Read §1, then §2 — §2 is the only list of things actually outstanding, plus §9's backlog
for what's next by choice rather than by omission. Everything in §3, §6, §7 and §9's "shipped this pass"
has shipped and is live; those sections exist so you don't break them.**

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
proximity-scaled orbit/zoom sensitivity, the monument-needle visibility fix (§6), the theory
and attribution audit (§7), and a rework of the old/new pole markers into labelled pins with a
great-circle travel arc.

**2026-08-01: loop-back review pass shipped** — analytics enabled (GoatCounter code `loopship`) and three
Tier-1 UI-surfacing changes (share-view CTA, Bulge Rigidity Simple-mode hero card, a never-mode-gated
plain-language stress disclaimer). All three reuse existing mechanisms, no engine change. Full detail in
§9 below, including the Tier 2/3 backlog that's written down but deliberately NOT started this pass.

**No feature work is in flight.** The theory/attribution audit (§7), the pole-marker rework, and the
2026-08-01 loop-back pass (§9) all shipped. What remains is verification the user must do on real
hardware (§2) plus the §9 backlog, at the user's pace.

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
- **Every visual change from 2026-07-31b–d was verified numerically, never seen**: the off-centre
  opening frame, the ~8% smaller globe (margin 0.80→0.74), the thicker monument needles, the close-in
  orbit/zoom slowdown, and the new pole pins + travel arc. Screenshot capture failed on every attempt
  across the whole session (~20, both tool paths, with auto-rotate off), so geometry was checked from
  live DOM rects and projected label coordinates instead. **All of it wants an eyeball on a real
  focused tab**; each is a single-constant tweak if the proportions are wrong.
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
- **ECDO's abyssal-ocean-heat exhibit (Exhibit 10B) as a layer or rebuttal panel — RESEARCHED AND
  DECLINED 2026-08-01.** The claim: deep-ocean heat has a "kinetic origin from below" because its
  depth-μ (4413 m) is deeper than mean ocean depth (3688 m). The research is solid and the numbers are
  *against* it, so it would have been easy to build:
    - The exhibit's own conservative 25 ZJ below 2000 m converts to **exactly the 33 ± 20 TW** measured
      by Desbruyères et al. 2016 — the study it cites — so the data is transcribed correctly.
    - **That study attributes the warming to Antarctic Bottom Water spreading from the Southern Ocean**
      (~67% of deep-sea heat absorption) and never mentions a seafloor source. AABW forms at the
      surface, sinks, and spreads *laterally along the seafloor* — which is exactly why the depth-μ is
      deep. The geometric argument fails on its own citation.
    - Budget: 33 TW is ~70% of Earth's **entire** surface heat flow (47 ± 2 TW, Davies & Davies 2010),
      which is steady background already in equilibrium. The full-column 209 ZJ is ~5.9× it.
  **Declined anyway, and these are the reasons that matter more than the numbers:** it breaks the
  locked cause-agnostic decision (a thermal claim has no kinematic consequence and the engine models no
  heat); it would be the only layer that ignores the pole you set, i.e. a static text block wearing a
  layer's clothes; the exhibit's headline is climate attribution ("not solar or manmade"), which drags
  a geophysics app into a different and much worse fight; and building one rebuttal commits us to an
  apparatus — Davidson's micronova, GEOSYNC's wobble and Hapgood's mechanism would each be owed one,
  when the app's honesty architecture is deliberately **uniform grading** (one STANDING_INFO entry plus
  one Model Caveats <li>) rather than per-exhibit litigation. Nothing in our ECDO caption currently
  claims anything about abyssal heat, so there is also nothing to correct.
  **The genuinely additive idea found next to it, still unbuilt: OCEAN DEPTH.** Water renders as binary
  flooded/not-flooded against the reoriented sea level and never shows *how deep*; a shift reorganises
  the depth distribution completely. Uses bathymetry we already ship, responds live to the pole like
  every other layer, needs no new data. Judge it on its own merits — it is not this exhibit.

## 5. Obvious next moves
1. The owed **iOS / real-device checks** in §2 — the largest unverified surface by far.
2. **Eyeball the 07-31b–d visual changes** (§2) and settle the globe-size question.
3. Paste a **GoatCounter site code** to switch analytics on (§8) — a user step, not a code task.
4. The **Grok Build** experiment — repo is clean, standard static web code, ready to import; nothing
   here needs undoing for it. Untried.
5. Whatever the user's ongoing review turns up — that loop has caught the most real problems, including
   every defect fixed on 07-31b–d.

**Nothing is mid-flight.** No half-built feature, no uncommitted work, no unpushed commits.

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

## 7. SHIPPED 2026-07-31c: theory / attribution audit

Findings, sources and the phased plan are in **`research/RESEARCH_7_theory_audit.md`** — read it before
touching any caption. What landed:

- **ECDO attribution**: now "The Ethical Skeptic (Roger B. Cunningham)". **Not a de-anonymisation** — he
  publishes under his own name (book *Inversion — ECDO Theory*, April 2026, author-signed copies on his
  own site). Pseudonym stays first because that is how the work is published and searchable. Our
  14°S/31°E coordinates already matched his own ECDOview tool, so no numbers changed.
- **New Davidson — Bay of Bengal preset** (15°N/90°E, **75°**). He is the third pole in the widely-cited
  "three pole locations" framing and we shipped only Hapgood/ECDO/Zacharias, so the set misrepresented
  the landscape by omission. Coordinates + a graded caption only; no mechanism added.
- **Zacharias relabelled `GEOSYNC`** — it was a handle, so it read as a citable person. Labels now follow
  one rule: use the name the work is known by (Hapgood/Davidson by author, ECDO by acronym, GEOSYNC by
  platform). The caption still names @zachariaspro for discoverability.
- **Factual fix that justified the audit**: the Zacharias caption claimed the Chandler-wobble collapse was
  "still holding as of 2026". It is not — the wobble **re-excited around 2020–21** with a ~180° phase
  reversal (Shi et al. 2025, *J. Geodesy* 99:97). Research debt from the plan is **closed**.
  **Lesson recorded: never ship a user-visible claim phrased "as of \<year\>" — it expires silently.**
- Two bugs found while verifying: `applyPreset` refreshed only `fxFolder.controllers` (no recursion), so
  presets touching subfolder controls left stale checkboxes — now `walkControllers`; and `setCaptionBox`
  used `textContent`, so caption emphasis rendered as literal tags — now `innerHTML`, **safe only because
  every caption is a hard-coded constant in this file. If that ever stops being true, revert it.**

### Constraints that still bind any future theory edit
- The engine is **cause-agnostic** — presets are coordinates plus a graded caption, nothing more.
- **Terminology is locked** (2026-07-30): *established / DEBATED / UNVERIFIED*; "fringe"/"pseudoscience"
  appear in **no** user-visible string — state the specific reason instead. `STANDING` keys are internal ids.
- Any grading change updates **both** `STANDING_INFO` and the matching Model Caveats `<li>`.
- Scenario **coordinates** are load-bearing for share links; relabelling is safe, renumbering is not.

### Not done from RESEARCH_7 (deliberate, low priority)
- The "how these four differ" line for the explainer (same end state, four causes, four destinations).
- **Explicitly rejected**: importing ECDOview's 69 sites into E22 (a short *cited* list beats a long one),
  and their fossil/evaporite/Euler-heatmap overlays (ECDO-specific evidence, not cause-agnostic features).

---

## 8. Analytics — LIVE as of 2026-08-01 (site code `loopship`)

`ANALYTICS.code` in `geo.html` is now `'loopship'` (the user's GoatCounter site,
`loopship.goatcounter.com`) — previously `''` = inert. The script only loads over https (the
`analyticsEnabled()` gate), so it's silent on `localhost`/`file://` by design; it activates on the live
Pages deploy. Nothing else below changed.

- **GoatCounter, not Cloudflare**, because the question is "how many people *install* it", which needs
  custom events; Cloudflare Web Analytics is pageviews-only and cannot answer it. Cookieless, honours Do
  Not Track, https only.
- Records page views plus `pwa-installed` (the `appinstalled` event) and `pwa-launch-standalone` (once per
  session, display-mode check).
- **THE iOS TRAP — do not misread the numbers.** iOS fires neither `beforeinstallprompt` nor
  `appinstalled`, so iPhone/iPad installs report **zero** `pwa-installed` forever. The only iOS signal is
  `pwa-launch-standalone`, which counts *launches of an already-installed app*. Different questions —
  **never sum them.**
- **`sw.js` must keep bypassing `ANALYTICS_HOSTS`.** The SW is cache-first for non-HTML, so without the
  bypass it would cache the `/count` ping itself and answer every later hit locally — analytics would stop
  reporting while looking healthy. A dropped count offline is correct; a cached one is a lie.

---

## 9. SHIPPED 2026-08-01: loop-back review pass, and the backlog it produced

The user dropped screenshots of an external UX audit (highest/medium-impact recommendations, a
data/fidelity tier, a "don't chase" list, a "ship three things" table) and asked for it to be filtered
against the live code and the project's own locked decisions before acting on any of it — the "research"
step of **review → research → plan → revise → ship**, done for real this time (external, not a re-read of
our own code). Full plan reasoning is in the session's plan file (not tracked here verbatim); this section
is the durable record.

**The filtering mattered.** Two of the audit's twelve recommendations were already shipped —
Simple-mode-as-default (2026-07-30) and the so-what readout's core (`updateSimpleReadout()`,
2026-07-30) — because the reviewer worked from an outside vantage point, not this file. Also found: the
header's old "Parked product threads... Simple mode as the DEFAULT" line was stale documentation debt
(now deleted) — it would have led a future session to re-propose already-done work.

**Shipped this pass (Tier 0 + Tier 1 only — see geo.html's newest BUILD STATUS entry for the technical
detail):** GoatCounter enabled (§8); a "Share this view" CTA after a preset/replay completes; Bulge
Rigidity surfaced as a Simple-mode hero card (Simple mode had *zero* visibility into the model's central
honesty signal before this — `waterFolder` is `.adv-only`); a never-mode-gated plain-language stress
disclaimer in both Simple and Advanced readouts.

**Confirmed scope: Tier 0 + Tier 1 only, by the user's explicit choice** when asked how much to execute
this pass. Tier 2/3 and the declined items below are written down but deliberately unstarted.

### Backlog — Tier 2 (genuinely new, moderate effort, still engine-safe)
1. **Land-flooded% / seafloor-emerged% readout**, completing the so-what card. Needs a small standalone
   sampling function (the `renderMonumentAlignments()` pattern — called after `computeEffects()`, which
   must not itself be grown) tallying flood/dry/exposed-seabed state over a modest grid.
2. **City/place anchors** (NYC, London, Tokyo, Cairo, Sydney, Mumbai): fly-to via the existing
   `flyCameraTo()`/`latLonToViewDir()` plus a one-line "was land, now ocean" (or reverse) readout at that
   point, using the same dS/E math the shader already runs.
3. **Fault-gated "near plate edges only" as a second default story** — one preset wiring the existing
   `gateToFaults` (E3) + the Established-only bundle, with its own caption. Reuses E3 entirely.

### Backlog — Tier 3 ("more real," lower priority under accuracy-first-then-condense)
4. **True bathymetry**: `build/ETOPO_2022_v1_60s_surface.tif` (~465 MB, already downloaded) and
   `build/make_etopo_terrainrgb.py` (already written, round-trip verified <0.06 m) are **both already in
   the repo** — `earth_terrainrgb.png` still has uniform-depth oceans only because the script hasn't been
   *run*. Single biggest visual-honesty win left; the data cost is already paid.
5. **Mobile HUD density / "Events" chip** — lower priority than the external review framed it: Simple
   mode (the default) already hides the dense `.readout-adv` block outright, so this mainly affects
   Advanced-mode mobile users.
6. iOS real-device pass and KTX2 compression — unchanged from §2 / the "possible future perf" note in
   `geo.html`; not re-planned here, just re-affirmed.

### Declined (agrees with the external review's own "don't chase" list, and with LOCKED DECISIONS)
- More contested effect layers (solar/antipodal/deep-pref expansion) — fights the engine's own
  cause-agnostic, uniformly-graded architecture.
- A naive `computeEffects()` rewrite — already tried and reverted 2026-07-30; needs a real test harness.
- Mechanism debates as user-facing content (Hapgood vs. TPW vs. micronova) — RESEARCH_7 already declined
  this beyond one deferred explainer line.
- A hosted "community scenario gallery" — needs a backend/hosting/moderation, which contradicts the
  locked single-self-contained-static-file stack decision.
