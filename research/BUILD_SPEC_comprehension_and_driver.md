# BUILD SPEC — Comprehension Layer + Driver Layer (next phase of geo.html)

**Status when written:** geo.html is at Stage 1–6 + enhancements **E1–E17 all DONE**. This doc specifies
the NEXT work and is meant to be ATTACHED TO THE PROJECT so a fresh chat builds from it (the previous
sessions stayed on the effects list precisely because that list — RESEARCH_3 — was attached; this plan was
not, which is the only reason it wasn't built yet).

>>> RECEIVING-SESSION INSTRUCTIONS (read first) <<<
1. Read geo.html's self-describing header first; it is the source of truth for what is already built.
2. Build in the ORDER below: PHASE A (comprehension) fully, THEN PHASE B (driver E18–E20).
3. Each item ships in its own mesh/overlay, default-OFF where it's a model claim, and BADGED by scientific
   standing — same conventions as E1–E17. Update the geo.html header + build log as the FINAL step (per the
   self-describing-artifact method).
4. Do NOT rebuild or renumber E1–E17. The driver layer is **E18, E19, E20** (NOT E16–E18 — that numbering
   in the driver research artifact predates E16/E17 being taken by tsunami + climate; renumber on sight).
5. Full physics, formulas, parameter values, and per-link scientific grading are in the driver/UX research
   (the artifact titled "Build Specification: UX Comprehension Layer + Driver/Trigger Layer"). This file is
   the execution plan; that artifact is the reference. If it is also attached to the project, cite it; if not,
   everything needed to build is summarized here.

------------------------------------------------------------
## WHY THIS EXISTS / HOW WE GOT HERE (so it doesn't recur)
The effects research (RESEARCH_3) was attached to the project, so fresh sessions correctly worked down it:
E11 deglaciation, E12 GIA, E13 solar-seismic, E14 cascade, E15 fault-style, E16 flank-collapse tsunami,
E17 climate zones. All good, all kept. The comprehension + driver plan was only ever a chat artifact, never
a project file, so no session saw it. FIX: this doc lives in the project. Attach it.

------------------------------------------------------------
## PHASE A — COMPREHENSION LAYER (build FIRST; no new physics, pure UX over existing controls)

### A1 — Scenario presets (one-click parameter bundles)
A preset is a named, serializable bundle applied THROUGH THE EXISTING SETTERS (single source of truth), with
an ANIMATED transition (don't teleport). Schema:
  { id, label, standing,                 // standing drives the badge colour
    pole:{lat,lon}, shiftAngleDeg,        // shiftAngleDeg cached for UI
    bulgeRigidity, layers:{E1..E17 bools},
    camera:{lat,lon,distance,tiltDeg}, caption }
Three presets with CONFIRMED coordinates:
  - HAPGOOD   — new NP 60°N, 73°W (Hudson Bay) → 30° shift (≤40° envelope). Pseudoscience (historical).
                alts: Greenland Sea 72°N/10°E (18°), Yukon 63°N/135°W (27°). Src: Hapgood 1958/1970.
  - ECDO      — new NP 14°S, 31°E (S. Zambia) → 104° along the 31°E meridian. FRINGE. Src: ecdoview.com.
  - ZACHARIAS — new NP 0.8°S, 2°E (Gulf of Guinea) → 90.8°. **ATTRIBUTION UNVERIFIED** — could not be tied
                to any named source; the real @zachariaspro uses ECDO's 104°/Zambia figures. SHIP IT (engine
                is cause-agnostic, coords are arbitrary) but LABEL "Zacharias (attribution unverified)" and
                badge SPECULATIVE.
Presets seed state; the user can free-explore afterward (don't lock controls).

### A2 — Story / guided-narrative mode (one master clock)
Define a single master clock T∈[0,1]. Refactor the EXISTING animations as sub-timelines of T:
  shiftProgress = clamp(remap(T, t0_shift, t1_shift, 0,1));
  bulgeRelax    = easeInOutCubic(clamp(remap(T, t0_bulge, t1_bulge, 0,1)));
Each story step = a keyframe range on T carrying {target params, caption, camera pose, layer-visibility mask}.
Transport: Play/Pause/Prev/Next + scrubber + "step N of M". Step boundaries can pause-for-Next (didactic) or
auto-continue (cinematic). Pacing 4–8 s/step for non-experts; one idea per step; caption BESIDE the globe, not
overlaid. Every driver/effect quantity must be a deterministic pure function of T so the scrubber is lossless
both directions. (This same clock becomes the Phase-B orchestration clock — see E20.)

### A3 — Guided camera (Three.js, 2025–2026)
Prefer the `camera-controls` lib (yomotsu): setLookAt/rotateTo/dollyTo/fitToSphere with built-in eased
transitions and an .enabled toggle (clean take-over → return-control). If staying on stock OrbitControls:
slerp the camera QUATERNION (constant angular velocity, short path) and tween distance + target separately —
do NOT lerp spherical angles (wobble). lat/long→vec3 on globe radius R:
  phi=(90-lat)π/180; theta=(lon+180)π/180;
  p=(-R sinφ cosθ, R cosφ, R sinφ sinθ).
enableDamping=true, dampingFactor≈0.05–0.1, controls.update() each frame. Abort the auto-move on user
pointerdown/wheel so the user never fights the camera; share one easeInOutCubic across all moves.

### A4 — Scientific-standing UI (badges + legend)
Three tiers — established / contested / speculative — encoded with COLOUR + ICON + WORD (never colour alone;
colourblind-safe). Suggested: established = teal ✓, contested = amber ~, speculative = violet ?. A compact chip
on each layer toggle, expandable to a tooltip: (1) what it shows, (2) one-sentence standing, (3) named source.
Persistent legend key (3 swatches + words) always visible. Show real numbers where they exist (e.g. "0.01 MPa
threshold"); avoid vague hedges. This makes the per-layer grading we already wrote into E1–E17 visible at a
glance instead of buried in the Model Caveats panel.

------------------------------------------------------------
## PHASE B — DRIVER / TRIGGER LAYER (build SECOND, as E18–E20)
The CAUSE that sits ABOVE the cause-agnostic engine. It emits exactly TWO time-varying scalars consumed by the
EXISTING layers, plus pure visuals. It NEVER reaches into E1–E17 internals (preserves cause-agnosticism — the
scalars could equally come from a slider). Everything here ships DEFAULT-OFF and BADGED FRINGE/SPECULATIVE.

### E18 — Perturbing body + orbit + tidal stress  [scalar #1: tidalStress(t) in MPa]
- Body on a path. Start with a PARAMETRIC flythrough (user sets perihelion d_min, asymptotic speed v∞,
  progress s∈[-1,1], s=0=closest approach) — easiest to choreograph; add Keplerian later (ellipse: solve
  M=E−e·sinE by Newton–Raphson; hyperbolic flyby: M=e·sinhH−H). Render body mesh + trail.
- Params in 3 unit systems: mass M in Earth masses (M⊕=5.97e24 kg); distance d in lunar distances
  (1 LD=3.84e5 km), Earth radii (1 R⊕=6371 km), AU; eccentricity; velocity.
- Tidal (differential) acceleration:  a_tidal ≈ 2·G·M·R⊕ / d³.
  Lunar yardstick: M=7.34e22 kg, d=3.84e8 m → a_tidal≈1.1e-6 m/s² → only a FEW kPa stress (BELOW 0.01 MPa).
  Coulomb contribution (illustrative scaling): ΔCFS_body ≈ 0.003 MPa · (M/M_moon) · (d_moon/d)³.
- HONEST VERDICT (label SPECULATIVE/FRINGE): no plausible body produces shift-causing tidal stress. DISPLAY
  the computed ΔCFS next to the 0.01 MPa line so users SEE it stays near/below threshold. Keep the
  USER-INITIATED shift as the primary path; the body never credibly causes the shift (hard physical ceiling).
- tidalStress(t) ADDS into the existing Coulomb field feeding E1.

### E19 — Eclipse + solar storm / proton-flux + magnetosphere  [scalar #2: protonFluxEnvelope(t)∈[0,1]]
- Eclipse geometry: body angular size δ=2·arctan(D_body/(2d)); occults Sun when D_body/d ≥ D_sun/d_sun≈0.0093
  (Sun ~0.53°). Multi-day totality needs an enormous/very close body → it would be one of the brightest objects
  in the sky for weeks beforehand (detectability tension — surface in tooltip). Configurable eclipseDurationHours
  + shadow mesh. Badge SPECULATIVE.
- Body→solar-perturbation: the MOST fringe link. Only peer-reviewed-but-CONTESTED adjacent work is planetary
  TIDES PACING the solar cycle (Stefani et al. 2016 SoPh 291:2197; 2019 SoPh 294:60) — NOT on-demand flare
  triggering. Model as an optional default-OFF SPECULATIVE gate: solarPerturbation=f(tidalForcing) that merely
  raises the probability/amplitude of a scripted storm after a lag.
- Proton-flux envelope (double-exponential "FRED" pulse, normalized to peak 1):
    P(t)=0 for t<t0; else A·(1−exp(−(t−t0)/τ_rise))·exp(−(t−t0)/τ_decay)
    τ_rise ~0.25–1 d (sharp), τ_decay ~3–7 d (the seismic window), optional τ≈18 d tail (Lyubushin).
  CME transit Sun→Earth configurable (default ~48 h; "Carrington" option 17.6 h).
- protonFluxEnvelope(t) MULTIPLIES the EXISTING E13 solar-seismic amplitude (so quakes bump BEFORE the shift).
  STANDING = CONTESTED (Marchitelli 2020 proton-density↔M>5.6 p<1e-5, 1-day lag VS Love & Thomas 2013 NULL +
  MDPI Atmosphere 2022 artifact question). 2–7 day window: Zeigarnik 2022.
- Magnetopause compression (VISUAL, physics ESTABLISHED): standoff R_mp ∝ P_dyn^(−1/6), P_dyn=ρv²; nominal
  ~10 R⊕, strong CME → <7 R⊕, extreme ~5 R⊕. Contract the magnetopause mesh sunward as protonFluxEnvelope
  rises (same scalar). NOTE: magnetosphere→seismicity link stays CONTESTED even though the compression is real.

### E20 — Master-timeline orchestration
One clock (the SAME T as Phase-A story mode). Driver emits ONLY the two scalars + visuals; effects layer
consumes them:
    CoulombField += tidalStress(t)          → E1 quakes vs 0.01 MPa
    E13_amplitude *= protonFluxEnvelope(t)  → solar-seismic
Sequence on the clock: body approaches (tidal stress rises) → (speculative) solar perturbation → solar storm /
proton-flux fires after a lag → modulates seismicity BEFORE the shift → combined stress (or USER) initiates the
pole shift → existing consequence engine runs E1–E17 → cascades settle. Make every scalar a deterministic pure
function of t (lossless scrub). Fuse with Phase-A by making the story clock and orchestration clock identical;
story steps just name t-ranges + captions over the driver→consequence sequence.

------------------------------------------------------------
## ACCEPTANCE / VERIFY (each item, before updating header)
- node --check clean on the extracted module; braces balanced; GLSL backtick-free; all new HUD ids present;
  any new mesh's count cleared when its toggle is off; default-OFF honoured for every model-claim layer.
- Each new layer badged by standing in BOTH the GUI and the Model Caveats panel.
- Header BUILD-LOG entry + LAST UPDATED bumped as the final step.

## DELIVERABLE NOTES
- The file the user runs is named **geo.html** (was index.html in earliest logs).
- Real vs illustrative numbers: REAL = 0.01 MPa (King/Stein/Lin 1994), lunar a_tidal 1.1e-6 m/s², Sun 0.53°,
  Carrington 17.6 h, 2–7 d window, R_mp∝P_dyn^(−1/6) ~10 R⊕, ECDO 104°/(14°S,31°E), Hapgood ≤40°/Hudson Bay.
  ILLUSTRATIVE = ΔCFS_body scaling, proton-flux pulse shape, τ=18 d tail, body→solar gate, Zacharias coords.
