# CHANGELOG — Pole-Shift Simulator (geo.html)

Full build history, relocated verbatim out of `geo.html`'s header on 2026-07-28 to condense that
file (see the "2026-07-28: file reorg" entry in `geo.html`'s BUILD STATUS block). Nothing here
was rewritten or summarized — this is the exact original text, split into two parts:

- **Part 1 — Build narrative**, organized by stage/feature (what was built and why, one entry
  per Stage/enhancement/layer). This was `geo.html`'s original "BUILD STAGES" through
  "CINEMATIC LAYER" sections.
- **Part 2 — Session changelog**, organized chronologically (most recent first, each entry
  chaining to "Prior:"). This was `geo.html`'s original dated "LAST UPDATED" chain.

For CURRENT state, read `geo.html`'s own header first (BUILD STATUS, LOCKED DECISIONS, LOCKED
CONSTANTS, ASSETS, and the landmines/implementation-guardrail sections) — this file is the full
history behind that, not a substitute for it.

---

## Part 1 — Build narrative (by stage/feature)

 BUILD STAGES:
 [DONE]    Stage 1 — Kinematic core: single index.html; Three.js (WebGL2) via importmap+CDN (pinned);
                     SphereGeometry (384x192); ONE custom ShaderMaterial; topography displaced in the
                     VERTEX shader from a heightmap texture; orbit/zoom controls; vertical-exaggeration
                     uniform. Heightmap read as a TEXTURE (real-data swap later = change URL/source only).
                     Three reference frames kept conceptually distinct: crustal / rotational / render-world.
 [DONE]    Stage 2 — Pole-shift: rotation R from user new-pole lat/long (lil-gui). uRinv = inverse(R) mat3
                     uniform; shader samples crust at R^-1 * n (DATA LOOKUP only). Spin axis & bulge stay
                     FIXED in world space. Annotations: old-pole destination marker + tilted crustal equator;
                     HUD shows shift magnitude (= 90 - lat) and new-pole coords.
 [DONE]    Stage 3 — Water redistribution (GPU, per-fragment, real-time):
                     dS = uDsScale*(cos^2 worldLat - cos^2 oldLat)*rigidity; uDsScale = 0.5*omega^2*a^2/g
                     (~11025 m). depth = dS - E (E = crust elevation, meters). Four regimes coloured:
                     newly-flooded land / ocean / dry land / exposed former seabed. Rigid-bulge assumption
                     exposed as a 0..1 slider (1 = catastrophic flood; 0 = relaxed = no flood).
 [DONE]    Stage 4 — Real elevation via Mapbox Terrain-RGB texture (decodes to METERS in-shader).
                     Heightmap is a texture (Stage-1 architecture), so the swap is just loading a different
                     texture. TextureLoader loads sibling 'earth_terrainrgb.png'; procedural fallback (now
                     also Terrain-RGB) if absent. Browser PNG decode is 8-bit/channel, so 16-bit grayscale
                     would lose precision — Terrain-RGB packs elevation across R/G/B and survives. Production
                     file (true bathymetry) via make_etopo_terrainrgb.py from ETOPO 2022. The shipped
                     earth_terrainrgb.png here is REAL land topography (NASA SRTM/Blue Marble, sea level=val14,
                     Everest-calibrated) but with UNIFORM placeholder ocean depth (no real bathymetry until
                     the ETOPO script is run).
 [DONE]    Stage 5 — Effects layer: Coulomb stress-CHANGE proxy from the water-load change, as a per-fragment
                     overlay AND InstancedMesh event markers. dH = max(0,dS-E) - max(0,-E) (m of water);
                     stress = |dH| * 9.81 kPa/m (MPa); trigger > 0.01 MPa. Earthquakes = ALL over-threshold
                     sites (MAGNITUDE: loading & unloading both trigger). Volcanoes = strongest UNLOADING
                     sites only (decompression-melting analogy; loading suppresses). Markers placed on a
                     Fibonacci grid of WORLD dirs (lookup = R^-1*n, as the shader), seated on the displaced
                     surface, recomputed debounced on pole/rigidity change. Honesty "Model Caveats" panel added.
 [DONE]    Stage 6 — Polish: in-shader day/night terminator (legible night floor) + water specular sheen +
                     richer limb glow, all kept inside the ONE globe ShaderMaterial. VIEW folder (atmosphere +
                     day/night sliders, PNG snapshot). FPS + RENDERER readout. WebGPU detected & reported but
                     renderer stays WebGL2 (raw-GLSL ShaderMaterial would need a TSL/WGSL rewrite to run under
                     r161's WebGPURenderer — deferred, not worth regressing a smooth single-sphere build).
                     ALSO (completed after a mid-build interruption): animated crustal SLIDE (slerp R, ~1.4 s,
                     eased; toggle "Animate Shift"; flood/stress update live, markers settle after); graceful
                     no-WebGL2 screen instead of a black canvas; WebGL context-loss/restore recovery; tab-hidden
                     render pause; press H to hide all UI for screenshots.
                     >>> ALL STAGES COMPLETE. Next session = refinements/bugfixes, not new stages. <<<
 ------------------------------------------------------------
 POST-STAGE-6 ENHANCEMENTS (beyond the original 6-stage plan; added as one pass):
 [DONE]    E1 — Stress-weighted markers ("Density ∝ Stress", default ON): quake markers are thinned by a
                 keep-probability ∝ sqrt(stress) so marker DENSITY shows the stress field, not the Fibonacci
                 sampling lattice (fixes the "looks like a grid" read). Toggle off = every over-threshold site.
 [DONE]    E2 — Depth attenuation (opt-in): uStressAtten = exp(-2*pi*z/lambda) applied to BOTH the shader
                 overlay and CPU markers; sliders for seismogenic depth z (km) and load wavelength lambda (km).
                 Honest result: for a near-global water load lambda is planetary, so decay is small.
 [DONE]    E3 — Fault gate (opt-in): loads sibling plate_boundaries.json (Bird 2003 PB2002 via
                 make_plate_boundaries.py), rasterises boundaries into a (u,v) mask, keeps markers only on
                 near-boundary CRUST cells (lookup = R^-1*n). Absent file => inert with an honest HUD note.
 [DONE]    E4 — Timed bulge relaxation: "Relax Bulge → 0" animates uBulgeRigidity to 0 over N s (easeOut);
                 flood/stress track live, markers settle. Illustrative only (real isostatic relaxation ~10^3-10^4 yr).
 [DONE]    E5 — Manual shift scrubber ("Shift Progress" 0..1): slerps the SAME target R from identity, so you
                 can hand-scrub the crustal slide; re-targeting the pole resets it to 1.
 [DONE]    E6 — Geographic graticule (VIEW folder): lat/long grid FIXED in world space (spin-axis aligned),
                 marking the NEW geographic coordinates after a shift. Off by default.
 [DONE]    E7 — Touch: canvas touch-action:none so one-finger orbit / two-finger zoom don't scroll the page.
 [DONE]    E8 — Real-data generators (the missing Stage-4 asset script + the new fault data):
                 make_etopo_terrainrgb.py (ETOPO 2022 -> Terrain-RGB, true bathymetry) and
                 make_plate_boundaries.py (PB2002 -> plate_boundaries.json). Both verified by logic test here;
                 RUN LOCALLY (ETOPO host + GitHub are blocked in the build sandbox). Drop outputs beside index.html.
 [DONE]    E9 — Dynamic / antipodal triggering (opt-in, default OFF). Magenta tetrahedra, a SEPARATE
                 InstancedMesh (trigMesh, MAX_TRIG=600), never confused with the primary |Δσ| quakes. Logic:
                 take the strongest over-threshold stress-change site as a proxy SOURCE event; seed triggered
                 markers over the globe in WORLD space (the wave-focusing is a whole-Earth/rotational effect,
                 not crustal), with a keep-probability set by angular distance from the source; count scales
                 with source strength. Fault gate still applies; gated on showEarthquakes. NOW TWO DISTINCT
                 RULES (REFINED 2026-06-04 per RESEARCH_5): 'Global Dynamic Trigger' = MAINSTREAM field that
                 DECAYS with distance (near-source ~25° zone excluded as the primary quakes); 'Antipodal Bonus'
                 = CONTESTED reshaping to the O'Malley 2018 pattern (secondary ~45°, min ~90°, peak within
                 antipodalCap of the antipode). SCIENTIFIC STANDING LABELED (Model Caveats + GUI): global
                 dynamic triggering = MAINSTREAM (Hill 1993, Velasco 2008, Pollitz 2012 ~5x M>=5.5 for days);
                 antipodal enhancement = CONTESTED (O'Malley 2018 vs Parsons & Velasco 2011 = NO remote large
                 events); deep-preference = SPECULATIVE, no literature support (deep quakes least aftershock-
                 productive / least tidally triggered) so "Deep Pref" is OFF by default. HUD: TRIGGERED (r-trig).
 [DONE]    E10 — LOD / rotation-rate modulation (opt-in, default OFF). Cyan rings (lodMesh, MAX_LOD=800,
                 renderOrder 5), distinct from every other marker. Does NOT create events: when ON, it
                 highlights the subset of already-over-threshold quakes in the shallow EQUATORIAL band
                 (10°N–30°S, WORLD space — the band is rotational), with the selected fraction and ring size
                 scaling with a 'Rotational Slowing' knob (0..1; the sim has no time axis so this stands in for
                 the decadal LOD phase). STANDING = CONTESTED (Anderson 1974; Bendick & Bilham 2017; Bilham 2022:
                 ~25–30% rise in annual M>=7 during slowing, ~5–6 yr lag): the implied stresses (~14 Pa/ms LOD,
                 up to ~0.4 MPa) are orders of magnitude below a ~3 MPa coseismic drop, so it is SYNCHRONIZATION
                 of critical faults, not triggering — labeled in GUI + Model Caveats. HUD adds a SYNCH counter
                 (id r-lod). Source: Research_Report.md §5 + Caveats.
 [DONE]    E11 — Deglaciation→volcanism multiplier (opt-in, default OFF). ESTABLISHED. Bright incandescent
                 spheres (deglacMesh, MAX_DEGLAC=400, renderOrder 6) seated above the strongest-unloading
                 volcano cones. Does NOT add/move volcanoes: it AMPLIFIES the eruption RATE of the existing
                 unloading volcanoes via decompression melting and flags those whose multiplier exceeds the
                 user threshold. Multiplier curve deglacMultiplier(σ) = 1+(cap-1)·(min(1,σ/20MPa))^0.7,
                 anchored at Huybers & Langmuir 2009 (2–6× global; ~120 m sea-level unload ≈ ~1.2 MPa) and
                 Maclennan 2002 (~30× for ~2 km ice ≈ ~20 MPa; ~10 MPa/km → ~0.1% melt-fraction/km). GUI:
                 'Max Eruption ×' (cap) + 'Plume Threshold (×)'. HUD adds an ERUPT peak-× field (id r-deglac).
                 Source: RESEARCH_3_effects_layer_spec.md Mechanism 1(a).
 [DONE]    E12 — GIA rebound seismicity / postglacial faulting (opt-in, default OFF). ESTABLISHED. Cool-blue
                 cubes (giaMesh, MAX_GIA=1500, renderOrder 7) at UNLOADED sites. The load that rebounds is the
                 FULL rigid-bulge unload; the stress released so far scales with the relaxation fraction
                 (1 - bulgeRigidity) — so markers are ZERO at rigid bulge and GROW as you Relax Bulge → 0
                 (mirror of the instant-flood markers, which fade as rigidity→0). Collected in-loop, independent
                 of the instant-Δσ gate; faulting placed where rebound ΔCFS > giaThreshold (default 0.01 MPa,
                 King/Stein). GUI: 'Rebound ΔCFS (MPa)'. HUD adds a GIA counter (id r-gia). Source: RESEARCH_3
                 Mechanism 5 (τ=η/μ≈450 yr; Pärvie Mw~7.9 Wood 1989 / up to 8.2 Arvidsson 1996; thrust faulting).
 [DONE]    E13 — Solar-seismic coupling (opt-in, default OFF). CONTESTED-to-FRINGE — the weakest-supported
                 layer; ships OFF + low-weight, NEVER a driver. Spring-green dodecahedra (solarMesh,
                 MAX_SOLAR=1200, renderOrder 8). A 'Proton Flux' knob (0..1; stands in for the proton-flux /
                 flare state since the sim has no time axis) flags the MOST critically-stressed existing quakes
                 (count ∝ flux × proximity-to-failure) — the "last straw on faults at 90–98% of failure load"
                 reading. Zero markers at flux 0. STANDING LABELED in GUI + Model Caveats: Lyubushin & Rodionov
                 2025 (τ≈18 d, ~26.6-d periodicity, 23–28% of M6.5+); Anagnostopoulos 2021 (coronal-hole HSS,
                 77% of M≥7.8 in decay phase); Zeigarnik 2022 (2–7 d lag, X9.3→+68% M4+); the dispute is
                 surfaced (Marchitelli 2020 correlation vs Love & Thomas 2013 NULL + 2022 artifact question).
                 HUD adds a SOLAR counter (id r-solar). Source: RESEARCH_3 solar anchor + Mechanism 4.
 [DONE]    E14 — Earthquake→volcano cascade (opt-in, default OFF). ESTABLISHED, but the triggered fraction is
                 small. Hot-pink markers (cascadeMesh, IcosahedronGeometry, MAX_CASCADE=400, renderOrder 9) on
                 the unloading volcanoes that lie inside a great quake's triggering radius, + link LINES back to
                 the source quake (cascadeLines = LineSegments over a PREALLOCATED Float32Array, MAX_LINKS=600,
                 setDrawRange). Radius 250 km (large) → 750 km (great) scaled by the source quake's stress proxy
                 above 'Cascade Mag Floor'; quakes[] is sorted desc so sources are the cheap prefix (break on
                 floor, cap MAX_CASCADE_SRC=300); each volcano linked once (hitV). Does NOT create volcanoes or
                 assert eruption — shows exposure inside the published radius. HUD adds a CASCADE counter
                 (id r-casc). Source: RESEARCH_3 Mechanism 1(c)/3 (Linde & Sacks 1998; Nishimura 2017 M7.5 floor;
                 Manga & Brodsky 2006 ~0.4%).
 [DONE]    E15 — Fault-style classification (opt-in, default OFF). ESTABLISHED physics. NOT a new mesh: it is a
                 COLOUR MODE on the existing quakeMesh. When ON, each quake is recoloured by regime from how its
                 crust moved over the bulge under the pole shift — normal/extension (blue) if it moved
                 equatorward, thrust/compression (crimson) if poleward, strike-slip (gold) in the dead-band.
                 Classifier = sign of lc = (cw2 - cl2) stored per site (cos²(nowLat) - cos²(preLat)); 'Strike-slip
                 Band' tunes the dead-band. When OFF the amber→red magnitude colouring is restored unchanged.
                 HUD adds an N/T/S tally (id r-style). Source: RESEARCH_3 Mechanism 2 (Melosh 1980; Matsuyama &
                 Nimmo 2008/2011; degree-2 order-1, peaks ~45° from the Euler axis; near-zero fossil bulge caveat
                 Mitrovica & Wahr 2011).
 [DONE]    E16 — Volcanic flank-collapse → tsunami (opt-in, default OFF). ESTABLISHED (loading physics);
                 marker-level, exposure not forecast. Pale-aqua wavefront RINGS (tsuMesh, TorusGeometry,
                 MAX_TSU=300, renderOrder 10) laid flat on the ocean around COASTAL volcanoes. Does NOT create
                 volcanoes or assert collapse: it iterates the rendered unloading volcanoes (unloads[0..nv-1]),
                 keeps those whose edifice is above the reoriented sea level (dS·rigidity − E ≤ 0) AND has a
                 SUBMERGED crust neighbour within ~1.5° (so a collapse would enter water), and draws a ring whose
                 radius scales with the unloading proxy up to 'Max Tsunami Reach (km)'. Gated on showVolcanoes.
                 HUD adds a TSUNAMI counter (id r-tsu); new legend swatch. Source: RESEARCH_3 Mechanism 3
                 (Anak Krakatau 2018 ~430 dead; Fogo ~73 ka run-up >270 m, Ramalho 2015; Tenerife ~170 ka to
                 132 m; ~25% of volcanic fatalities). No shader change (CPU markers only).
 [DONE]    E17 — Climate zones / insolation recompute (Mechanism 6) (opt-in, default OFF). ESTABLISHED for the
                 instantaneous insolation map. A per-fragment OVERLAY in the ONE globe ShaderMaterial (same
                 pattern as the stress overlay — no new mesh, honours the one-ShaderMaterial decision). A pole
                 shift moves crust across the FIXED spin axis's latitude belts, so each cell's insolation/climate
                 zone changes: new belt from |asin(ndW.y)| (world lat), old belt from |asin(ndL.y)| (crust lat);
                 boundaries tropical<23.5° / temperate<66.5° / polar. Two modes (uClimateMode): map the NEW belts
                 everywhere, or highlight only crust that CROSSED a belt. New uniforms uShowClimate/uClimateMode +
                 3 belt colours; new GUI folder 'CLIMATE (Mechanism 6)'; new legend row. Off by default; reducible
                 to data-first. Source: RESEARCH_3 Mechanism 6 (Daradich 2017; Jurassic ~30° shift, Muttoni &
                 Kent 2019). CAVEAT kept visible: insolation change is instant but ocean/ice response lags
                 centuries-millennia (no time axis), and the 3-belt scheme is a coarse insolation proxy.
 ------------------------------------------------------------
 COMPREHENSION LAYER (Phase A of BUILD_SPEC_comprehension_and_driver.md; pure UX over existing controls, no
 new physics). Build order: A1 → A2 → A3 → A4, THEN the driver layer E18–E20. Driver numbering is E18/E19/E20
 (NOT E16–E18 — E16/E17 are already taken by tsunami + climate; do not renumber).
 [DONE]    A1 — Scenario presets. Named bundles applied THROUGH the existing setters (single source of truth),
                animated (reuse the Stage-6 shift slide + camera fly), never locking controls (seed then free-
                explore). Three: HAPGOOD (NP 60°N/73°W, 30°, pseudoscience-historical), ECDO (NP 14°S/31°E,
                104°, fringe), ZACHARIAS (NP 0.8°S/2°E, 90.8°, speculative — attribution UNVERIFIED, labelled).
                Each carries a scientific-standing badge (established teal ✓ / contested amber ~ / speculative
                violet ?). New: SCENARIOS GUI folder (top), a caption HUD beside the globe (#scenario), and a
                guided camera fly (flyCameraTo/advanceCamFly — direction-vector lerp+normalize, NOT spherical-
                angle lerp; aborts on user pointer/wheel). Coordinates verified: 90−lat = the claimed shift for
                all three. Source: BUILD_SPEC Phase A / A1.
 [DONE]    A2 — Story / guided-narrative mode. One master clock T∈[0,1]; the existing animations are PURE
                functions of T (shiftProgress over shiftWindow [0.10,0.34]; bulge relaxation over bulgeWindow
                [0.60,0.90], easeInOutCubic), so the scrubber is lossless both directions — nothing accumulates.
                Six keyframe steps (before → slide → mismatched bulge → stress → relaxation/GIA → equilibrium),
                each carrying a caption, a camera pose, and a layer-visibility mask. Transport = bottom bar
                (Prev / Play-Pause / Next / scrubber / "Step N of M" / Exit). Reuses setShiftProgress (shared
                with the E5 scrubber via refactor) + setBulgeRigidity + scheduleEffects + the A1 camera fly;
                narrates whatever pole is set (or a default ~82° if none). A user grab of the globe pauses
                playback (never fight the user). This SAME clock is the Phase-B E20 orchestration clock.
                Source: BUILD_SPEC Phase A / A2.
 [DONE]    A3 — Guided camera. Eased flys (flyCameraTo / flyCameraToDir) AND the story's per-T camera now move
                along the great-circle short arc by QUATERNION SLERP (setFromUnitVectors → slerp from identity),
                i.e. constant angular velocity — verified in Node (uniform 12° steps over a 120° arc, stdev 0;
                the prior lerp+normalize ramped 5.8°→19°, stdev 4.85). Distance tweens separately; one shared
                easeInOutCubic. OrbitControls keeps its existing damping (0.06) + update() each frame; a user
                pointerdown/wheel aborts any auto-move and control returns instantly (controls stay enabled, so
                the same gesture starts the drag — clean take-over). Dependency-free (no camera-controls lib),
                honouring the one-self-contained-file decision. Source: BUILD_SPEC Phase A / A3.
 [DONE]    A4 — Scientific-standing UI. Surfaces the per-layer grading (already in Model Caveats) at a glance:
                a colour+icon+word chip on every graded control (STANDING_INFO registry → 13 toggles: Earthquakes,
                Bulge Rigidity, E9 trio, E10–E17) prepended to the lil-gui label so the right-side ellipsis never
                clips it; hover gives what-it-shows + named source. Three tiers (established teal ✓ / contested
                amber ~ / speculative violet ?) from the shared STANDING map — never colour alone (icon AND word),
                colourblind-safe. Persistent always-visible key (#standing-key, top-centre). Real numbers kept
                (0.01 MPa threshold etc.). Source: BUILD_SPEC Phase A / A4.
            ==> PHASE A (COMPREHENSION LAYER) COMPLETE. Next: PHASE B driver layer E18 → E19 → E20.
 ------------------------------------------------------------
 DRIVER LAYER (Phase B of BUILD_SPEC). The CAUSE above the cause-agnostic engine: emits time-varying scalars
 consumed by the EXISTING layers, never reaching into E1–E17 internals. Default-OFF, badged FRINGE/SPECULATIVE.
 [DONE]    E18 — Perturbing body + orbit + tidal stress [scalar #1: tidalStress(s) in MPa]. A body on a
                parametric straight-line flythrough (progress s∈[-1,1], s=0 = closest approach at perihelion),
                rendered as a sphere + trail in world space (visual distance COMPRESSED to stay on screen; the
                readout carries true LD/R⊕). Physics: a_tidal = 2·G·M·R⊕/d³ (REAL; Moon ⇒ 1.10e-6 m/s², verified);
                Coulomb contribution ΔCFS = 0.003 MPa·(M/M_moon)·(d_moon/d)³ (ILLUSTRATIVE) is ADDED to every
                site's stress in computeEffects (bodyCoulombMPa(); feeds E1 — the scalar could equally be a
                slider, so cause-agnosticism holds). HONEST VERDICT shown live: a new HUD readout (BODY ΔCFS,
                id r-body) puts ΔCFS against the 0.01 MPa line — Moon at 1 LD = 0.003 MPa (30% of threshold);
                threshold needs an absurd ≥3.3-Moon body at the Moon's distance; readout turns red only when
                pushed past threshold (the reductio). Mass in LUNAR masses, perihelion in LUNAR distances. GUI
                'DRIVER · BODY (E18)' (speculative chip via A4); default OFF; the user-set shift stays primary.
                Source: BUILD_SPEC Phase B / E18.
 [DONE]    E19 — Eclipse + solar storm / proton-flux + magnetosphere [scalar #2: protonFluxEnvelope(t)∈[0,1]].
                FOUR links, FOUR standings, all default-OFF: (1) proton-flux→seismicity (CONTESTED) — a FRED
                double-exponential pulse P(stormDay) MULTIPLIES the E13 amplitude via protonFluxFactor() (peak
                normalized to 1, verified; P≥0.5 over ~0.2–5 d, tail to ~7 d). (2) magnetopause compression
                (ESTABLISHED, visual) — a Shue-shaped wireframe shell along uLightDir, standoff R_mp ∝
                P_dyn^(−1/6), compressing to 0.5× nominal at storm peak (matches 10→5 R⊕). (3) eclipse
                (SPECULATIVE) — body angular size vs the Sun's 0.53° from the E18 body (rocky density → radius);
                Moon-at-1-LD = 0.97 (barely total, verified); a dark subsolar shadow disc scales with coverage.
                (4) body→solar gate (SPECULATIVE, most fringe) — optional amplitude gate from the body's tides
                (Stefani 2016/2019 pacing only). Feeds E13 ONLY via protonFluxFactor() (cause-agnostic). New HUD
                'FLUX P' (id r-flux); GUI 'DRIVER · SOLAR STORM (E19)'; per-link chips via A4. Source: BUILD_SPEC Phase B / E19.
 [DONE]    E20 — Master-timeline orchestration. The Phase-B capstone, and it reuses the A2 STORY CLOCK rather
                than forking one: the story config became swappable (storyCfg), and a DRIVER-sequence config
                (STORY_DRIVER) re-times the shift to AFTER the storm. A '▶ Play driver sequence (E20)' button
                runs it on the same transport. When storyCfg.driver, applyStoryClock also calls applyDriverClock(T),
                driving the E18 body progress and the E19 stormDay as PURE functions of T (so the scrubber stays
                lossless). Verified ordering in Node: body closest approach T=0.40 → storm onset 0.42 → FLUX peak
                0.48 (BEFORE the shift at 0.55) → shift 0.55–0.72 → consequences/GIA → settle. Honest narrative:
                the captions show the body + storm visibly FALLING SHORT of the 0.01 MPa line, then the shift is
                taken as the premise and the E1–E17 chain runs. Driver scalars feed the engine only via the two
                documented hooks (bodyCoulombMPa into the Coulomb field; protonFluxFactor multiplying E13) —
                cause-agnosticism intact. Source: BUILD_SPEC Phase B / E20.
            ==> PHASE B (DRIVER LAYER) COMPLETE. BUILD_SPEC fully realized (Phase A A1–A4 + Phase B E18–E20).
 ------------------------------------------------------------
 CINEMATIC LAYER (E21) — Part 2 of the CME/Helioviewer research spec (Research Report Part 2 §6–§8). PURE
 VISUALISATION, DEFAULT-OFF, behind ONE quality switch (off/medium/cinema). Adds NO physics and NO new engine
 coupling — the CME is a READOUT of the existing E19 scalar protonFluxValue(); the only engine hooks remain
 bodyCoulombMPa()→Coulomb and protonFluxFactor()→E13 (E20 invariant preserved). Quality 'off' reproduces the
 pre-E21 render path byte-for-byte (renderer.render, no composer, no extra meshes) — legibility stays default.
 [DONE]    E21.1 — Quality switch + LAZY selective-bloom composer. New GUI folder 'VIEW · CINEMATIC (E21)' with
                 off/medium/cinema. On != off: build a two-EffectComposer selective bloom (official pattern) —
                 bloomComposer renders the scene with all NON-bloom-layer objects darkened to black (so the DATA
                 MARKERS and the globe NEVER bloom; HUD is DOM, already outside the canvas), finalComposer adds the
                 blurred bloom over the full scene via a mix ShaderPass + OutputPass. tick() and capturePNG() both
                 branch through renderCine() when active; 'off' calls renderer.render unchanged. setPixelRatio 1.5
                 on (perf), 2.0 off (=today). Composer built ONCE (lazy), resized on window resize. r161 addons
                 (EffectComposer/RenderPass/UnrealBloomPass/ShaderPass/OutputPass) — no WebGPU/TSL.
 [DONE]    E21.2 — Rendered Sun: AIA-style surface (own ShaderMaterial — the 'one ShaderMaterial' lock is about the
                 GLOBE; Sun/corona/atmo/CME are their own meshes, as the E18 body + E19 magnetopause already are).
                 fBM convection + granulation churn off the shared uTime, 171Å-gold default LUT (uPalette 1 = 304Å
                 orange), limb darkening + bright rim. Positioned along uLightDir (the single sun-direction source)
                 at SUN_DIST=6.4 — VISUALLY COMPRESSED (not to scale), same philosophy as the E18 body. + a LASCO-
                 style back-side additive Fresnel corona shell. Visible when quality != off.
 [DONE]    E21.3 — Earth-directed CME: a flux-rope cone (apex at Sun, axis = Sun→Earth = −uLightDir) + a CPU-advected
                 BufferGeometry of Points (CME_MAX=4000; the spec's WebGL2 fallback for the GPU-particle path).
                 Brightness/width ∝ protonFluxValue(); STORM OFF ⇒ flux 0 ⇒ CME invisible. Sub-toggle 'Earth-directed
                 CME (E21)'. Badged SPECULATIVE (it visualises the FRINGE body→CME catalyst — Battams/NRL: no
                 mechanism) via a new STANDING_INFO.showCME entry; chip re-applied with applyStandingBadges().
 [DONE]    E21.4 — Atmosphere shell (1.025× globe, BackSide additive day/night Fresnel — augments the in-shader uAtmo
                 limb glow) + dipole MAGNETOSPHERE FIELD LINES (7 L-shells × 8 longitudes; r = L cos²λ) compressed
                 on the DAYSIDE only by the EXISTING E19 magnetopauseR()/MP_R0 ratio (×0.5 at storm peak — matches
                 10→5 R⊕). Sub-toggle 'Magnetosphere Field Lines'. Verified in Node: flux 0 ⇒ no compression; night-
                 side untouched; CME axis · sunDir = −1; cause-agnostic gating (storm off / flux 0 ⇒ no CME).
 [DONE]    E21.5 — Photoreal Earth (Three.js-Journey day/night/specular/clouds). Edits the LOCKED globe shader the
                 ONLY sanctioned way: a uPhotoreal mix (default 0) + sampler uniforms uDayTex/uNightTex/uSpecClouds,
                 declared in BOTH the JS uniforms{} and the fragment uniform block (the standing same-decl landmine).
                 The photoreal result is computed as a fully-lit colour (city lights on the night side via dayMix,
                 sunlit clouds from spec/clouds.g, ocean glint from spec/clouds.r) and mixed at the END — so
                 uPhotoreal==0 reproduces the data path BYTE-FOR-BYTE. Samplers bind a 1x1 placeholder until the
                 sibling textures load; uPhotoreal is raised to 1 only when ALL THREE load AND (the 'Photoreal Earth'
                 toggle is on OR quality=='cinema'). Absent textures ⇒ inert (data colouring preserved). Bruneton
                 atmospheric scattering NOT included (the cheap Fresnel atmo shell + in-shader limb glow stand in).
                 TUNING DECISION (left for the browser): at uPhotoreal=1 the Blue-Marble fully REPLACES the data
                 colouring, so the flood/stress/climate overlays are hidden — that is why the driver run uses 'medium'
                 (data visible), not 'cinema'. If you want flood-over-photoreal, blend at <1 or re-apply the flood
                 tint after the photo mix.
            ==> E21 COMPLETE (E21.1–E21.6: Sun + corona + CME + atmosphere + field-lines + selective bloom + driver
                integration + photoreal Earth). All default-off / data-first; off==today byte-for-byte.
                KNOWN NUANCE (browser-tune): the COMPOSER path (medium/cinema) routes the raw-output globe shader and
                the colour-managed MeshBasic markers through one OutputPass, so the cinema globe colour may differ
                slightly from the default path; 'off' is unaffected. Resolve when browser-testing E21.5.
 ------------------------------------------------------------

---

## Part 2 — Session changelog (chronological, most recent first)

 LAST UPDATED: 2026-07-30 (PERFORMANCE PASS — followed review→research→plan. Diagnosis first: confirmed a real
   GPU (AMD RX 7700 XT via ANGLE/D3D11, not software rendering), so the low FPS seen earlier was NOT a code
   defect — the automation test tab reported document.hidden=true, and Chrome throttles requestAnimationFrame
   in backgrounded/unfocused tabs, which explained the near-zero FPS, the 10–30s "resource durations", and the
   screenshot/CDP timeouts. THREE fixes shipped, each correct regardless of that: (1) photoreal textures were
   8192×4096 (~134MB VRAM each once decompressed, ~400MB combined) for a sphere never more than ~1000px on
   screen → downscaled the 3 shipped files to 4096×2048 via PIL LANCZOS (originals preserved at
   archive/photoreal-8k-originals/); (2) those textures loaded UNCONDITIONALLY at startup though most sessions
   never enable Photoreal/Cinema → made lazy via ensurePhotorealLoaded(), fired only on first use of the
   Photoreal toggle or Cinema quality (verified in-browser: only earth_terrainrgb.png fetches at startup now,
   the 3 photoreal JPGs do not); (3) default pixel-ratio cap 2→1.5 (new DEFAULT_PIXEL_RATIO_CAP constant,
   matching the cap Cinema mode already used). ECDO-preset regression clean, no console errors. NOT verifiable
   here: an actual FPS before/after delta (needs a focused desktop tab). NOT done (deferred, gated on browser
   QA): shader branchless rewrite, KTX2/Basis compression. Backup: archive/geo.html.pre-perf-pass-2026-07-29.bak.
   Prior:
 LAST UPDATED: 2026-07-29 (CODE CONDENSE + DRAG-TO-POLE — followed review→research→plan; FIRST-EVER real-browser
   run of this file. RESEARCH (outward): confirmed our simplified bulge-difference math is a defensible real-time
   stand-in for the genuine rigorous tools (LIOUSHELL / Patočka 2021 for TPW; SELEN4 / giapy for GIA sea-level),
   now cited in the header ASSETS note + the user-facing Model Caveats lead; surveyed comparable tools
   (newpolesexplorer.com = casual drag-a-pole globe, no effects layer; TPWSim.org = early content hub) and
   concluded ours is the most rigorous in the space — condense the code, don't cut features. CHANGES: (a) deduped
   the 9 near-identical marker-mesh setup blocks into finalizeMarkerMesh(renderOrder); (b) SCOPE-CORRECTED the
   earlier 'generic effect engine' idea after reading computeEffects() in full — the per-layer LOGIC (data
   sources, placement math, gating) genuinely differs between E9–E16, only the mesh-SETUP boilerplate was true
   duplication, so forcing a generic engine would have risked behavior drift on never-run code; left the
   computeEffects() function-split undone for the same reason; (c) regrouped the flat 33-control EFFECTS folder
   into Established/Contested/Speculative subfolders by the tiers already in STANDING_INFO (lil-gui walkControllers
   already recurses, so badges/plain-language still apply); (d) NEW FEATURE drag-to-set-pole (default-OFF toggle
   in POLE SHIFT folder; raycasts the globe on pointerdown/move, converts the world dir back through uRinv to a
   crust lat/lon, feeds the SAME updateShift() the numeric fields + presets already call — single source of truth,
   no duplicated pole logic; OrbitControls handed the gesture only while the toggle is on). Browser-verified:
   Zacharias/ECDO/Hapgood presets, the corrected Zacharias caption, drag-to-pole (moved pole live, recomputed
   ~2,167 quakes / 58 volcanoes), the EFFECTS regroup — all render + work, no console errors. Backup:
   archive/geo.html.pre-code-condense-2026-07-29.bak. Prior:
 LAST UPDATED: 2026-07-28 (AUDIT + FIX — premise audit against RESEARCH_1–5/BUILD_SPEC plus a 2026 external
   fact-check; full findings in RESEARCH_6_premise_audit.md (new, sits beside geo.html). Two fixes applied:
   (1) the ZACHARIAS scenario preset (SCENARIOS array) had a stale/backwards caption claiming its coordinates
   were "attribution unverified" and that the real @zachariaspro uses ECDO's Zambia figures — RESEARCH_2 (which
   exists specifically to resolve this) already found the opposite: 0.8S/2E IS his own published pole, distinct
   from ECDO's, sourced via secondary aggregation (Sunfellow's index) since geosyncmonitor.com is an
   un-crawlable JS app. Caption rewritten to credit the real source, name the Chandler-wobble-collapse
   observational method that actually distinguishes his model from ECDO's causal story, and note a 2025 GRL
   paper (Jeon et al.) that offers a mundane counter-explanation (2010–2011 La Niña mass anomalies) for the
   wobble collapse rather than an impending shift. The A1 implementation note near LOCKED DECISIONS that told
   future sessions to "keep the [unverified] label" was also corrected — do not revert either. (2) Unified the
   STANDING_INFO tooltip citations for deglaciationMult (E11) and giaRebound (E12), which cited different papers
   than the Model Caveats panel for the same claims (Jull & McKenzie/Stewart & Wu -> Huybers & Langmuir 2009 /
   Maclennan 2002 / Wood 1989 / Arvidsson 1996, matching both the Caveats panel and the E11/E12 build-log
   entries above). Everything else spot-checked (O'Malley/Parsons antipodal dispute, solar-seismic figures,
   Planet Nine status, ECDO's own 104°/Zambia numbers, a new April-2026 ECDO book) still matches what's shipped
   — no other changes needed there. NOT yet done (see audit doc "next steps"): real-browser QA pass (several
   E18–E21 features are still flagged NOT browser-run below), and ALL.zip's real assets are not unzipped beside
   this file, so it currently runs on placeholder/procedural data only. node --check not re-run (comment- and
   string-only edits; no JS syntax touched outside two object-literal string values). Prior:
 LAST UPDATED: 2026-06-06 (ADD — Global sea-level mode. New WATER control 'Global sea level (m)' (waterParams.
   seaLevel, uSeaLevel, −8000..+8000) raises/lowers the equipotential UNIFORMLY: depth = dS + uSeaLevel − E. This
   is the "flood the Earth by raising the sea" mechanism (ice-melt / drawdown) — DISTINCT from the pole-shift
   bulge redistribution (dS). It floods/exposes by ABSOLUTE elevation, so its new coastlines are PERMANENT — they
   persist when the bulge relaxes to 0 (unlike the bulge flood, which vanishes at rigidity 0). Default 0 =
   unchanged. Visual/coastline tool; it does NOT feed the seismic effects layer (which models bulge-redistribution
   stress, not uniform load). node --check clean. Prior:
 LAST UPDATED: 2026-06-06 (REFINE — flooded water still read "too different" (flat, no glint, no clouds). Now the
   flood target gets the SAME clouds (sc.g) and a FORCED sun-glint (ocean mask = 1, since the spec map still says
   "land" there) as the open ocean, plus a softer shelf blue and lower defaults (uNewFloodTint 0.4→0.15,
   uOceanDeep #0d2440→#1c4a6b). Last-mile match is eyedropping 'Deep-water colour' to the day map's ocean. Prior:
 LAST UPDATED: 2026-06-06 (IMPROVE — flood-over-photoreal now reads as BELIEVABLE WATER instead of a flat teal
   decal. In the photoreal path the shift-caused change is re-rendered by kind: newly-flooded land = drowned
   terrain through turquoise shallows easing to true ocean-blue (uOceanDeep) with depth + the same photoreal
   sun-glint as the rest of the sea; drained seabed = the ocean-textured fragment tinted toward muddy ground.
   Two new knobs (both declared in uniforms{} AND the shader): uNewFloodTint (0=blends fully into ocean, 1=stays
   distinct; control 'New-flood tint (blend↔distinct)', default 0.4) and uOceanDeep ('Deep-water colour' picker,
   default #0d2440 — colour-match to the day map's ocean for a seamless join). DATA mode + uPhotoreal=0 unchanged
   (the whole block is still gated). Captured changeKind/changeT in the water section to drive it. node --check
   clean, both-places uniforms confirmed. GLSL not browser-compiled here. (The 'flat single colour during the
   shift' transition idea is NOT built — this resting-frame fix supersedes it; can add as a layer if wanted.) Prior:
 LAST UPDATED: 2026-06-06 (ADD — day/night cycle. New VIEW controls 'Rotate sunlight (day/night)' + 'Rotation
   speed (°/s)' orbit uLightDir around the FIXED world spin axis (_YAXIS) in tick(), so the terminator sweeps
   and the lit hemisphere moves (addresses "the sun is always on the same side"). Everything that reads uLightDir
   — the rendered Sun, the photoreal day/night, the eclipse, the magnetopause, the body's key light — follows
   automatically. DEFAULT OFF (static look preserved). PAUSED while a DRIVER story plays so the chain camera /
   CME axis (which key off uLightDir) stay stable. Pure visual; no engine coupling. node --check clean. Prior:
 LAST UPDATED: 2026-06-06 (FIX — photoreal textures were upside-down: equirect maps are north-up but the globe
   UV runs the other way. Flipped V (pUv = vec2(vUv.x, 1.0 - vUv.y)) on the three photoreal samplers ONLY (the
   terrain heightmap is left as-is, it was already correct). Sun confirmed already locked to uLightDir
   (_sunPos = uLightDir*SUN_DIST; day side = dot(N, uLightDir)) — the lit hemisphere already faces the Sun; any
   apparent offset is camera parallax (Sun 6.4u out, Earth r=1), not a lighting bug. node --check clean. Prior:
 LAST UPDATED: 2026-06-06 (POLISH — three optional items. (1) FLOOD-OVER-PHOTOREAL: the shift-caused water change
   (newly-flooded teal / drained seabed) is now captured in the globe shader and re-applied OVER the photoreal
   Earth, gated by a 'Keep flood on photoreal' toggle (uPhotoFloodKeep, default 1; declared in BOTH uniforms{}
   and the fragment block). Inert at uPhotoreal=0 — data path still byte-for-byte. So cinema/photoreal now shows
   the pretty globe AND the flood. (2) LEGEND PLAIN LABELS: the plain-language toggle now also relabels the
   bottom legend (LEGEND_PLAIN map; matches each row's trailing text, so the multi-swatch fault/climate rows are
   skipped safely). (3) SIMPLE-MODE READOUT: a friendly one-liner (#simple-readout) shown only in Simple mode —
   'Pole moved X° · N quake-prone sites · M volcanoes' — refreshed from updateShift + computeEffects + setUIMode.
   Verified: node --check clean, backticks balanced, uPhotoFloodKeep in both places, wiring present. GLSL not
   browser-compiled here. The two DATA ASSETS (real ETOPO bathymetry, plate boundaries) remain a LOCAL run — the
   generator scripts are in the project but their data hosts are blocked in this sandbox. Prior:
 LAST UPDATED: 2026-06-06 (FIX — driver→story cinematic-restore edge. Extracted restoreDriverCinematic(); it now
   runs on exitStory AND at the top of startStory when switching to a NON-driver story (previously the driver
   run's forced cinematic/zoom could stick if you started the base story without exiting). The driver stash is
   now guarded so replaying the driver without exiting won't capture the already-forced-on values. node --check
   clean. Prior:
 LAST UPDATED: 2026-06-06 (E21.5 BUILT — PHOTOREAL EARTH; E21 now COMPLETE. The locked globe shader gains a
   uPhotoreal mix (default 0) + uDayTex/uNightTex/uSpecClouds samplers (declared in BOTH uniforms{} and the
   fragment block). Photoreal is computed fully-lit (night-side city lights via the existing terminator, sunlit
   clouds, ocean glint) and mixed at the END, so uPhotoreal==0 == the prior data render byte-for-byte. Samplers
   bind a 1x1 placeholder; uPhotoreal rises to 1 only when all three sibling textures (earth_day/night/
   specular_clouds.jpg) load AND ('Photoreal Earth' toggle on OR quality=='cinema'). Absent textures ⇒ inert.
   Added a 'Photoreal Earth (E21.5)' control + the assets to the ASSETS list. NOTE: at full photoreal the data
   overlays are hidden by design (driver uses 'medium', not 'cinema', so the flood stays visible). Verified:
   node --check clean, backticks balanced, uPhotoreal declared in both places, default 0, single gate. GLSL not
   browser-compiled here — user QAs the look + drops in the textures. NEXT: optional polish (flood-over-
   photoreal blend, per-legend plain labels, simplified Simple-mode readout) + browser tuning. Prior:
 LAST UPDATED: 2026-06-06 (U2 BUILT — PLAIN-LANGUAGE layer (friendly-mode sub-stage). A 'Plain language' toggle
   (#plain-toggle) swaps ~46 jargon-y GUI control names for lay phrasing via a reversible map (stores originals;
   re-runs applyStandingBadges after each .name() so the standing chips re-attach — they key by c.property, not
   label). A 'What am I looking at?' button (#explain-btn) opens a condensed lay explainer (#explainer) covering
   the what-if premise, the colour key, the marks, and the not-a-prediction caveat + the ✓~? tiers. Entering
   SIMPLE mode now also turns plain-language on (Advanced leaves it as the user set it). DEFAULT off; Advanced +
   technical labels unchanged. Verified: node --check clean, backticks balanced, DOM ids present, wiring present.
   NOT browser-run. NEXT [CURRENT] = E21.5 photoreal Earth; remaining UX polish: per-legend-item plain labels,
   a simplified count readout in Simple, and the story→story cinematic-restore edge. Prior:
 LAST UPDATED: 2026-06-06 (U1 BUILT — FRIENDLY MODE, comprehension/UX pass (Phase A second installment). A
   SIMPLE/ADVANCED switch (#mode-switch, top-left): Advanced == the prior UI byte-for-byte; Simple collapses the
   dense numeric folders (water/effects/climate/body/storm/view) to their headers — one tap reopens, nothing
   removed — hides the technical readout (.readout-adv), and keeps Scenarios/Pole/Story/Cinematic up front. The
   map-key legend is now a COLLAPSIBLE list (#legend-head toggles #legend-wrap). EFFECT BUNDLE presets at the top
   of the EFFECTS dropdown: Essential (established core) / Full chain (everything bar the unsupported deep-pref) /
   None — group setters over the existing toggles, which still work. DEFAULT = Advanced (init only syncs the
   button state; folders/legend untouched). Verified: node --check clean, backticks balanced, DOM wrappers
   balanced, handlers wired. NOT browser-run. NEXT [CURRENT] = U2 plain-language captions (a 'what am I looking
   at?' toggle reusing the disclosure/caption text) + E21.5 photoreal Earth. Prior:
 LAST UPDATED: 2026-06-06 (E21.6 BUILT — DRIVER-SEQUENCE ↔ CINEMATIC integration. The '▶ Play driver sequence'
   run now (a) auto-enables cinematic 'medium' + the CME and widens controls.maxDistance to 16 (stashed/restored
   on exit), (b) drives a WORLD-SPACE driver camera (driverCameraPose, replacing the lat/lon story pose only when
   storyCfg.driver): broadside to the Sun–Earth line, distance 12 framing the body→Sun→Earth CHAIN during the
   driver beats, easing to a 3-unit Earth-centred shot for the consequences so the WATER SHIFT/flood reads, (c)
   gates the magnetopause + eclipse overlays to T<shiftWindow[0] so they don't bury the flood at the close shot,
   and (d) adds the body→Sun SPARK — the fringe catalyst link itself — as a violet body→Sun connector + a brief
   corona flare, timed to closest-approach→storm-onset, pure fn of story.T. Captions reworded to foreground the
   body→Sun spark as the most-fringe step. Verified: node --check clean, backticks balanced, Node logic tests
   pass (chain frames Sun 18.3°/Earth 11.7° < 21° vert half-FOV across the whole chain phase; consequence shot is
   Earth-tight at origin; spark peaks at onset, gone by consequences; overlays gated). Non-driver story + 'off'
   path unchanged. NOT browser-run (CDN blocked). NEXT [CURRENT] = E21.5 photoreal Earth + the friendly-mode UX
   pass. Prior:
 LAST UPDATED: 2026-06-06 (E21.1–E21.4 BUILT — CINEMATIC LAYER, Part 2 of the CME/Helioviewer spec: quality
   switch off/medium/cinema + lazy selective-bloom composer; rendered Sun (AIA fBM surface + LASCO corona);
   Earth-directed CME (flux-rope cone + CPU particle bloom) driven purely by E19 protonFluxValue(); atmosphere
   shell + dipole magnetosphere field lines compressed by the existing magnetopauseR(). ALL default-off; 'off'
   == pre-E21 path byte-for-byte. Verified: node --check clean, shader strings backtick-balanced, Node logic
   tests pass (compression 10→5 R⊕ at peak, CME axis · sunDir = −1, cause-agnostic gating), invariant grep
   confirms NO new engine coupling (no computeEffects/scheduleEffects/quakeMesh/quakes[] in the block). NOT yet
   run in a real browser (CDN blocked in sandbox) — QA the bloom look + the composer-path globe colour nuance.
   NEXT [CURRENT] = E21.5 photoreal Earth (edits the locked globe shader behind uPhotoreal + needs sibling
   textures). Prior:
   LAST UPDATED: 2026-06-04 (E18 VISUALS REWORKED — lit rocky body on an elliptical perihelion arc + halo + comet
   tail + orbit + label; physics preserved. PHASE B COMPLETE / BUILD_SPEC fully realized. Open: real-browser QA +
   the two local assets). Prior:
   LAST UPDATED: 2026-06-04 (E20 BUILT — master-timeline orchestration on the A2 story clock; PHASE B COMPLETE,
   BUILD_SPEC fully realized [A1–A4 + E18–E20]. Open: real-browser QA + the two local assets + E18 visual polish).
   Prior:
   LAST UPDATED: 2026-06-04 (E19 BUILT — eclipse + proton-flux storm + magnetosphere, scalar #2 multiplies E13;
   four links / four standings. + E18 perturbing body. Phase B. Next: E20 master-clock orchestration). Prior:
   LAST UPDATED: 2026-06-04 (E18 BUILT — perturbing body + tidal stress, first DRIVER-layer item / Phase B;
   ΔCFS shown vs the 0.01 MPa line. After PHASE A complete. Next: E19 proton-flux/eclipse → E20 orchestration).
   Prior:
   LAST UPDATED: 2026-06-04 (A4 BUILT — scientific-standing UI; PHASE A / COMPREHENSION LAYER COMPLETE [A1
   presets, A2 story/master-clock, A3 quaternion-slerp camera, A4 standing badges]. Next: PHASE B driver layer
   E18 → E19 → E20). Prior:
   LAST UPDATED: 2026-06-04 (A3 BUILT — guided camera on quaternion slerp; + A2 story / master clock; + A1
   scenario presets. COMPREHENSION LAYER / Phase A; next: A4 standing UI → driver E18–E20). Prior:
   LAST UPDATED: 2026-06-04 (A2 BUILT — story / guided-narrative mode, one master clock T; + A1 scenario
   presets. COMPREHENSION LAYER / Phase A; next: A3 guided camera → A4 standing UI → driver E18–E20). Prior:
   LAST UPDATED: 2026-06-04 (A1 BUILT — scenario presets, first item of the COMPREHENSION LAYER / Phase A of
   BUILD_SPEC_comprehension_and_driver.md; next: A2 story mode → A3 guided camera → A4 standing UI → driver
   E18–E20). Prior: E17 BUILT (climate zones / Mechanism 6); E16 (flank-collapse→tsunami); E9 REFINED. And:
   LAST UPDATED: 2026-06-04 (E17 BUILT — climate zones / Mechanism 6; + E16 flank-collapse→tsunami; + E9
   REFINED into two labeled rules; full entries at end of log). Prior:
   2026-06-03 (Stage 6 complete + POST-STAGE-6 ENHANCEMENTS E1–E15; full entries at end of log).
   Build log (oldest first):
   2026-06-02 — Stage 1 built + hotfix. Kinematic core complete: Three.js r161 pinned via
   importmap; 384x192 sphere; single ShaderMaterial; procedural equirectangular heightmap (CanvasTexture)
   displaced in the vertex shader; OrbitControls; vertical-exaggeration + relief-tint uniforms via lil-gui;
   three reference frames scaffolded in JS (crustFrame group, rotationFrame axis+bulge guides, world). Spin
   axis and a wireframe bulge ellipsoid are drawn FIXED in world space, ready for Stage 2 to rotate only the
   data lookup.
   HOTFIX: removed backticks from a comment INSIDE the vertex-shader template literal — they were closing
   the JS template string early ("Unexpected identifier 'dir'", black screen on init). LANDMINE for future
   sessions: never put backtick characters inside the /* glsl */ shader strings, not even in comments.
   FIX 2: procedural heightmap fbm passed a degenerate longitude coord (the GW factors cancelled to u*freq),
   so noise only varied by latitude -> horizontal "Jupiter bands". Now samples full 2D grid coords; biased
   to ~28% land (Earth-like). Reads as continents/oceans. (Stage 4 still replaces this whole block with a real
   ETOPO texture load; the placeholder just needs to look like terrain.)
   AUDIT (Stage 1 verified complete vs kickoff spec): single self-contained index.html; Three.js r161 pinned
   via importmap+CDN; 384x192 sphere; exactly one ShaderMaterial; vertex-shader displacement from a texture;
   2048x1024 procedural placeholder read AS a texture (Stage 4 = URL swap); OrbitControls; vertical-exagg
   uniform; three frames distinct (crust/rotation/world) with spin axis + rigid bulge FIXED in world space;
   no localStorage. STAGE-2 HOOK MADE PRECISE: split world `dir` from `lookupDir`. Stage 2 is now a single
   shader-line change (vec3 lookupDir = normalize(uRinv * dir)) + a mat3 uniform uRinv = inverse(R) + a
   lil-gui new-pole lat/long control. Correct per LOCKED DECISION (sample crust at R^-1 * n; mesh/camera
   never rotate). Known cosmetic: equirectangular UV sphere pinches relief at the poles (meridians converge
   to one vertex) — inherent to UV spheres, harmless for the kinematic core, same with real ETOPO.
   STAGE 2 BUILT (2026-06-02): pole shift implemented exactly per LOCKED DECISION. New-pole lat/long in
   lil-gui -> R = Quaternion.setFromUnitVectors(P, +Y) (P = chosen crust point) -> uRinv = inverse(R) mat3
   uniform -> vertex shader lookup vec3 lookupDir = normalize(uRinv * dir). Mesh & camera untouched; spin
   axis + rigid bulge stay fixed (verified by construction — they live in rotationFrame, never rotated).
   Annotations added in WORLD space (NOT the data mesh): amber old-pole marker at R*(+Y) with stalk, and an
   amber crustal-equator ring rotated by R to show tilt vs the fixed cyan rotational equator. HUD shows crust
   shift magnitude (= 90 - newPoleLat) and new-pole coords; lon sets direction, lat sets magnitude. Rotation
   geometry verified numerically in Node before coding (R*P=+Y; R^-1*(+Y)=P; R*R^-1=I; antipodal 180 deg ok;
   ECDO-ish lat -14 -> 104 deg). No theory presets baked in (engine stays CAUSE-AGNOSTIC; community pole
   coords have ambiguous "where pole goes" vs "what becomes pole" semantics — left to the user to set).
   STAGE 3 BUILT (2026-06-02): water redistribution in the FRAGMENT shader, per-fragment, real-time (live
   with the pole slider). E = vElev*uElevMeters (crust elevation, meters; placeholder scale 16000 => signed
   [-0.5..0.5] -> [-8000..8000] m, replaced by real meters at Stage 4). dS = uDsScale*(cw2-cl2)*rigidity,
   cw2=1-worldDir.y^2 (rho_new^2/a^2), cl2=1-lookupDir.y^2 (rho_old^2/a^2); uDsScale=0.5*omega^2*a^2/g
   ~=11025 m. Computed in normalized domain to avoid float32 cancellation on ~4e13 numbers. depth=dS-E;
   four colour regimes. Rigid-bulge slider uBulgeRigidity (HUD shows rigid/relaxed) — honestly the flood is
   an artifact of the rigid-bulge assumption; relaxed => dS=0 => no catastrophe. Physics verified in Node
   before coding (amplitude ±11025 m; drainage toward new pole, flooding toward new equator; regimes; toggle).
   Two new varyings (vWorldDir, vLookupDir) carry the directions to the fragment. SIMPLIFICATIONS (honest):
   no global volume conservation (a constant offset could be added later); centrifugal term only (the ~21 km
   real bulge includes self-gravitation; locked formula uses the ~11 km centrifugal part by design).
   STAGE 4 BUILT (2026-06-02): elevation is now a real texture decoded to METERS via Mapbox Terrain-RGB
   (height = -10000 + (R*65536+G*256+B)*0.1) in the vertex shader; vElev carries meters (was normalized);
   uElevMeters + uSeaLevel removed, uDispRefMeters (8000) added for displacement normalization. Procedural
   fallback rewritten to emit Terrain-RGB too, so ONE decode path serves both. TextureLoader pulls sibling
   earth_terrainrgb.png and swaps uHeight on success; HUD shows DATA source. Shipped earth_terrainrgb.png is
   REAL land topography (NASA SRTM/Blue Marble 10800x5400 -> 2700x1350, sea level=val 14, Everest-calibrated,
   ~29% land) — NOAA ETOPO is host-blocked in the build sandbox, so true global BATHYMETRY requires running
   make_etopo_terrainrgb.py (downloads ETOPO 2022 60s, writes the same filename at 5400x2700). Encoder<->shader
   decode verified to <0.06 m across -10000..+8849 m. texture.colorSpace=NoColorSpace so bytes survive.
   STAGE 5 BUILT (2026-06-03): effects layer = Coulomb stress-CHANGE proxy from the water-load change, added
   two ways without breaking the single-ShaderMaterial globe. (1) PER-FRAGMENT OVERLAY in the existing
   fragment shader: dH = max(0,dS-E) - max(0,-E) (m of water), stress = |dH|*0.00981 MPa (9.81 kPa/m), tinted
   when > uStressThresh (0.01 MPa); loading vs unloading hue. (2) EVENT MARKERS as two InstancedMeshes
   (octahedra=earthquakes coloured amber->red by |Δσ|; cones=volcanoes), placed by a CPU pass: a Fibonacci
   grid of WORLD dirs n, lookup = R^-1*n (same mapping as the shader), elevation from a new CPU sampler
   (makeHeightSampler reads the SAME Terrain-RGB pixels via a 2D canvas; same-origin => untainted), dS/dH/stress
   per site, seated on the displaced surface; debounced recompute (scheduleEffects, 90 ms) on pole/rigidity
   change. DECISIONS RESEARCHED FIRST (peer-reviewed): earthquakes use MAGNITUDE |Δσ| because unloading triggers
   too (Stein 1999; postglacial faulting Arvidsson 1996 / Lindblom 2015; erosional unloading Steer 2014;
   reservoir drawdown) and ΔCFS sign needs fault orientation the sim lacks; volcanoes use UNLOADING-only top-N%
   sites (decompression melting: Maclennan 2002, Eksinchol 2019; Santorini lowstands Satow 2021; loading
   suppresses). Effects scale with uBulgeRigidity (relaxed => dS=0 => ZERO events — honesty signal). Added a
   "Model Caveats" panel (fault-orientation blindness; surface-vs-depth; clock-advance-only triggering; no
   magnitudes/timescales; per-volcano ambiguity; rigid-bulge dependence). Marker math verified in Node before
   coding (identity=0 events; shift lights up; relaxed=0; volcanoes ⊆ unloading ⊆ over-threshold; no NaN).
   Module JS syntax-checked (node --check); GLSL strings confirmed backtick-free. SIMPLIFICATIONS (honest): no
   fault dataset (markers = "where stress changed enough for SOME plausibly-oriented fault", not located
   ruptures); surface vertical stress, not depth-resolved; instantaneous (real lags span years->millennia).
   NEXT: Stage 6 polish / optional WebGPU swap.
   STAGE 6 BUILT (2026-06-03): final polish; project feature-complete. Visual polish done INSIDE the single
   globe ShaderMaterial (honouring the one-ShaderMaterial decision): soft day/night terminator with a 0.42
   night-brightness floor so regimes stay legible, a wet specular sheen on submerged (ocean/flooded) fragments,
   and a richer day/night-tinted limb glow. New uniforms uAtmo + uDayNight drive a VIEW (Stage 6) folder
   (Atmosphere + Day/Night sliders, both safely reducible to flat data-first lighting), plus a "Save PNG
   snapshot" button (renderer now has preserveDrawingBuffer:true; filename tags the new-pole coords). HUD gains
   RENDERER + FPS readouts (FPS sampled twice a second; no Clock interference — uses performance.now()). WebGPU:
   detected via navigator.gpu.requestAdapter and reported in the HUD, but the renderer DELIBERATELY stays
   WebGL2 — r161's WebGPURenderer is node/TSL-based and cannot run our raw-GLSL ShaderMaterial without a full
   shader rewrite, which is not worth regressing a smooth single-sphere build (documented in LOCKED DECISIONS).
   CSS: control panel offset below the stage badge + scroll when tall; responsive layout < 760 px. Module JS
   syntax-checked (node --check); all fragment uniforms confirmed declared; GLSL strings backtick-free.
   ALL SIX STAGES COMPLETE — the simulator is the kinematic core + pole shift + water redistribution + real
   Terrain-RGB elevation + effects layer + polish, in one self-describing index.html.
   STAGE 6 COMPLETION (2026-06-03, after a mid-build interruption): the visual-polish part of Stage 6 above
   had landed, but the interaction/robustness items from the same plan had not been written when the session
   was cut off. Now finished: (1) animated crustal SLIDE — slerp R current->target, easeInOutCubic, ~1.4 s,
   toggle "Animate Shift"; the flood/stress field updates live through uRinv and the CPU markers settle once at
   the end (applyRotation/advanceShiftAnim added; updateShift refactored; dead _q temp removed). (2) Graceful
   no-WebGL2 screen (#fatal) instead of a black canvas, guarded before renderer creation. (3) WebGL
   context-loss/restore recovery (re-uploads the heightmap). (4) Tab-hidden render pause via visibilitychange.
   (5) Press H to hide all overlays for clean screenshots (body.ui-hidden). Re-verified: node --check clean,
   no duplicate folders/uniforms, all fragment uniforms declared, GLSL backtick-free, HUD ids present.
   (Provenance note for the record: this and the visual-polish Stage 6 were the SAME author/session, finished
   across an interruption — not a separate session, despite an earlier mis-narration to that effect.)
   POST-STAGE-6 ENHANCEMENTS BUILT (2026-06-03): one pass adding the items from the "what's left" list (all
   BEYOND the original 6 stages). (E1) stress-weighted quake markers (keep-prob ∝ sqrt(stress), default on) so
   density shows the field not the Fibonacci lattice — fixes the "grid" read the user flagged. (E2) opt-in
   depth attenuation uStressAtten = exp(-2π z/λ) on both shader overlay + CPU markers, with z/λ sliders (honest:
   near-global λ => little decay). (E3) opt-in fault gate: sibling plate_boundaries.json rasterised to a (u,v)
   mask, markers kept only on near-boundary CRUST cells (lookup R^-1*n, so it rotates with the crust); inert +
   HUD note when absent. (E4) timed bulge relaxation (animate rigidity->0, easeOut; illustrative). (E5) manual
   shift scrubber (slerp identity->target). (E6) geographic graticule fixed in world space. (E7) canvas
   touch-action:none. (E8) wrote the two real-data generators — make_etopo_terrainrgb.py (true bathymetry;
   encode/decode round-trip verified 0.0 m on test points, sea level -> RGB 1,134,160) and
   make_plate_boundaries.py (PB2002 -> polyline JSON; parse/densify verified) — both logic-tested here but RUN
   LOCALLY (ETOPO + GitHub hosts blocked in the sandbox). Verified: node --check clean, all fragment uniforms
   declared, GLSL backtick-free, no merged lines, HUD ids present. (Process note: a malformed str_replace
   briefly merged two lines and another briefly deleted the Stage 6 [DONE] header entry; both were caught by
   the post-edit checks and repaired before delivery — the verification habit, not luck, is what held.)
   E9 BUILT (2026-06-03): dynamic / antipodal triggering, the one item from the last research pass (antipodal +
   deep-earthquake connection) that was never slotted into the original plan. Added as opt-in, default OFF, in a
   SEPARATE InstancedMesh (trigMesh, magenta tetrahedra, MAX_TRIG=600) so it can never be confused with the
   primary |Δσ| quakes. Logic: strongest over-threshold stress-change site = proxy SOURCE; seed markers in a cap
   (antipodalCap, default 30°) around its ANTIPODE in WORLD space; count scales with source strength; fault gate
   still applies; gated on showEarthquakes. RESEARCH-FAITHFUL GRADING surfaced in GUI + Model Caveats: global
   dynamic triggering = MAINSTREAM (Hill 1993 / Velasco 2008 / Pollitz 2012, ~5x M>=5.5 for days); antipodal
   enhancement = CONTESTED (O'Malley 2018, conflicts with Parsons & Velasco 2011 = no remote LARGE events);
   deep-preference = SPECULATIVE, no literature support (deep quakes least aftershock-productive / least tidally
   triggered) => "Deep Pref" ships OFF and labeled. HUD gains a TRIGGERED counter (r-trig); new legend swatch;
   new landmine added above. Verified: node --check clean, GLSL backtick-free, all new HUD ids present, trigMesh
   wired (count cleared when off). NOTE for the receiving session: the file the user runs is named geo.html on
   their machine (was index.html in earlier logs) — same self-describing file, nothing else changed.
   E10 BUILT (2026-06-03): LOD / rotation-rate modulation — the LOD item from the NEXT list. Added opt-in,
   default OFF, in its own InstancedMesh (lodMesh, cyan rings, MAX_LOD=800, renderOrder 5). It is a HIGHLIGHTER,
   not a generator: with the toggle on, it marks the subset of already-over-threshold quakes lying in the
   shallow equatorial band (10°N–30°S, world-frame), selected fraction ∝ a 'Rotational Slowing' knob (0..1,
   standing in for the decadal LOD phase since the sim has no time axis). Graded CONTESTED in GUI + Model
   Caveats (Anderson 1974 / Bendick & Bilham 2017 / Bilham 2022: ~25–30% M>=7 rise during slowing, ~5–6 yr lag;
   stresses ~14 Pa/ms–0.4 MPa, orders of magnitude below a ~3 MPa drop → synchronization, not triggering). HUD
   gains a SYNCH counter (r-lod); new legend ring; new landmine added above. Built faithfully from
   RESEARCH_3_effects_layer_spec.md (Mechanism 4, LOD/rotation) + RESEARCH_5 §5/Caveats. Verified: module
   node --check clean, GLSL untouched/backtick-free, all new HUD ids present, lodMesh count cleared when off
   and at slowing=0.
   RESEARCH SET NOW COMPLETE IN PROJECT (verified 2026-06-03): RESEARCH_0_index + RESEARCH_1..5 are all
   attached. The "effects research artifact" the original NEXT note referred to is RESEARCH_3_effects_layer_spec
   .md, which specifies ALL remaining candidates with numbers and an explicit scientific grade — so the earlier
   "ASK for the source first" caveat is RESOLVED; the sources are in hand. (RESEARCH_5 = the former
   Research_Report.md = the antipodal/deep pass behind E9.)
   E11 BUILT (2026-06-03): deglaciation→volcanism multiplier, the highest-standing NEXT item (ESTABLISHED).
   Added opt-in, default OFF, in its own InstancedMesh (deglacMesh, incandescent-yellow icosahedra,
   MAX_DEGLAC=400, renderOrder 6). RATE AMPLIFIER, not a generator: iterates the already-rendered unloading
   volcanoes (unloads[0..nv-1]), converts each site's surface depressurization s.stress (MPa) into an eruption-
   rate multiplier deglacMultiplier(σ)=1+(cap-1)·(min(1,σ/20))^0.7, seats a plume above the cone for sites over
   the 'Plume Threshold (×)', scales the plume by the multiplier. peakMult scans all nv sites so the new HUD
   ERUPT field (id r-deglac) is the true peak ×. GUI adds 'Max Eruption ×' (cap, default 30) + 'Plume Threshold
   (×)' (default 6). Anchored to RESEARCH_3 Mechanism 1(a): Huybers & Langmuir 2009 (2–6× global; ~120 m post-
   glacial sea-level unload ≈ ~1.2 MPa → ~5× here) and Maclennan 2002 (~30× for ~2 km ice ≈ ~20 MPa). Graded
   ESTABLISHED in GUI + Model Caveats (per-volcano rate uncertain; melt-transport lag not modeled). Verified:
   module node --check clean, GLSL untouched/backtick-free, new HUD id present, deglacMesh cleared when off,
   multiplier curve logic-checked against both anchors.
   E12 BUILT (2026-06-03): GIA rebound seismicity / postglacial faulting (ESTABLISHED). Opt-in, default OFF,
   own InstancedMesh (giaMesh, cool-blue cubes, MAX_GIA=1500, renderOrder 7). Models the slow viscoelastic
   rebound that releases glaciation-accumulated stress as great THRUST faulting. Collected in the site loop,
   OUTSIDE the instant-Δσ gate: reference load = full rigidity-1 unload (dS_full); rebound ΔCFS =
   |dH_full|·9.81kPa/m·(1-rigidity); unloading sites only; trigger where rebound ΔCFS > giaThreshold (default
   0.01 MPa). Tied to the relaxation state so markers are ZERO at rigid bulge and grow as Relax Bulge → 0 — the
   complement of the instant-flood markers that fade as rigidity→0 (a genuinely nice demonstration: relax the
   bulge and watch the flood recede while postglacial faults light up). GUI adds 'Rebound ΔCFS (MPa)'; HUD adds
   a GIA counter (id r-gia). Anchored to RESEARCH_3 Mechanism 5: τ=η/μ≈450 yr; Pärvie Mw~7.9 (Wood 1989) to
   ~8.2 (Arvidsson 1996), conflict flagged in caveats. Verified: module node --check clean, GLSL untouched/
   backtick-free, new HUD id present, giaMesh cleared when off and zero at rigidity=1, grows monotonically as
   rigidity→0 (logic-checked).
   E13 BUILT (2026-06-03): solar-seismic coupling — the FINAL research candidate (CONTESTED-to-FRINGE, the
   weakest-supported layer). Opt-in, default OFF, own InstancedMesh (solarMesh, spring-green dodecahedra,
   MAX_SOLAR=1200, renderOrder 8). Pure re-weighter, never a driver: a 'Proton Flux' knob (0..1) flags the
   most critically-stressed existing quakes (count ∝ flux × proximity-to-failure), zero at flux 0 — the
   "last straw on faults at 90–98% of failure" reading. Standing labeled in GUI + Model Caveats with the
   dispute surfaced: Lyubushin & Rodionov 2025 (τ≈18 d, ~26.6-d period, 23–28% of M6.5+), Anagnostopoulos 2021
   (coronal-hole HSS, 77% of M≥7.8 in decay phase), Zeigarnik 2022 (2–7 d lag, X9.3→+68% M4+) — vs the Love &
   Thomas 2013 NULL + 2022 artifact question, both kept visible. HUD adds a SOLAR counter (id r-solar). Source:
   RESEARCH_3 solar anchor + Mechanism 4. Verified: module node --check clean, GLSL untouched/backtick-free,
   new HUD id present, solarMesh cleared when off and zero at flux=0 (logic-checked).
   ============================================================================================
   RESEARCH-CANDIDATE SET COMPLETE: all four NEXT items from the research pass are now built as labeled,
   default-OFF layers — E10 (LOD, contested), E11 (deglaciation→volcanism, established), E12 (GIA rebound,
   established), E13 (solar coupling, contested-fringe). Every mechanism in RESEARCH_3 that reduces to a
   marker/rate rule is now represented in the engine, each graded honestly in the Model Caveats panel.
   NEXT: no researched-but-unbuilt candidates remain. Future sessions = refinement/bugfix, performance, or a
   NEW research pass (e.g. RESEARCH_3 Mechanism 1(c) EQ→volcano cascade within 750 km — Linde & Sacks 1998 —
   and Mechanism 6 climate-zone/insolation recompute after the Euler rotation are spec'd but not yet built).
   E14 BUILT (2026-06-03): earthquake→volcano cascade (ESTABLISHED; small triggered fraction). Opt-in, default
   OFF. First layer to LINK two existing populations: hot-pink markers (cascadeMesh, MAX_CASCADE=400,
   renderOrder 9) on unloading volcanoes inside a great quake's triggering radius, plus link LINES (cascadeLines,
   the effects layer's first LineSegments, over a preallocated Float32Array, MAX_LINKS=600, setDrawRange) back
   to the source quake. Radius 250 km (large) → 750 km (great) by the source's stress proxy above 'Cascade Mag
   Floor'; exploits the desc-sorted quakes[] (break on floor, cap MAX_CASCADE_SRC=300; each volcano hit once via
   hitV). Anchored to RESEARCH_3 Mechanism 1(c)/3: Linde & Sacks 1998 (VEI≥2 peak within 750/250 km over days),
   Nishimura 2017 (nothing below M7.5), Manga & Brodsky 2006 (~0.4% of eruptions plausibly triggered). Graded
   ESTABLISHED with an explicit "exposure not forecast" caveat. HUD adds a CASCADE counter (id r-casc). Verified:
   module node --check clean, GLSL untouched/backtick-free, new HUD id present, cascade/links cleared when off,
   great-circle radius + sorted-prefix search logic-checked.
   E15 BUILT (2026-06-03): fault-style classification (ESTABLISHED physics; Mechanism 2). First enhancement
   that is a COLOUR MODE rather than a new mesh — it recolours quakeMesh by regime instead of magnitude when
   'Fault Style' is ON. Per-site regime = sign of lc=(cw2-cl2) (cos² nowLat − cos² preLat), already a byproduct
   of the stress calc: lc>0 equatorward→NORMAL (blue), lc<0 poleward→THRUST (crimson), |lc|≤band→STRIKE-SLIP
   (gold); 'Strike-slip Band' tunes the dead-band. OFF restores the amber→red magnitude ramp untouched. HUD adds
   an N/T/S tally (id r-style); legend gains a 3-swatch fault-style row. Graded ESTABLISHED with two caveats kept
   visible: it is the expected regime not a mapped focal mechanism, and Earth's near-zero fossil bulge makes the
   magnitude small for a SLOW shift (Melosh 1980; Matsuyama & Nimmo 2008/2011; Mitrovica & Wahr 2011). Verified:
   module node --check clean, GLSL untouched/backtick-free, new HUD id present, OFF path identical to pre-E15,
   sign convention logic-checked.
   E9 REFINED (2026-06-04): split the single antipodal-only trigger into the TWO distinct rules RESEARCH_5
   recommends, with separate labels. Before: 'Dynamic Trigger' seeded markers ONLY inside the antipodal cap —
   so the engine rendered only the CONTESTED piece while labeling the mechanism MAINSTREAM. Now: (1) 'Global
   Dynamic Trigger' (MAINSTREAM, Hill 1993 / Velasco 2008 / Pollitz 2012) seeds markers over the whole globe
   with a keep-probability that DECAYS with angular distance from the proxy source, excluding the near-source
   ~25° aftershock zone (already the primary |Δσ| quakes); (2) 'Antipodal Bonus' (CONTESTED, opt-in, default
   OFF) reshapes that field into the O'Malley 2018 angular pattern — secondary peak ~45° from source, minimum
   ~90°, primary maximum within antipodalCap of the antipode. Deep-preference unchanged (SPECULATIVE, OFF).
   Still ONE magenta mesh (trigMesh) — the standing distinction lives in the two toggles + caveats, not a new
   mesh, so no merge into quakeMesh. No shader change (CPU markers only); GLSL untouched. New GUI control
   'Antipodal Bonus (contested)'; 'Dynamic Trigger' relabeled 'Global Dynamic Trigger'; legend + Model-Caveats
   E9 entry updated to describe the two switches. Verified: module node --check clean, GLSL backtick-free, all
   HUD ids present (no new id), all fragment uniforms declared, no merged lines; angular-weight function logic-
   checked in Node (mainstream strictly decreasing with distance; antipodal trough at 90°, peak in the cap).
   E16 BUILT (2026-06-04): volcanic flank-collapse → tsunami (RESEARCH_3 Mechanism 3, ESTABLISHED loading
   physics; marker-level, exposure not forecast) — item (1) on the previous NEXT list. Opt-in, default OFF, own
   InstancedMesh (tsuMesh, pale-aqua TorusGeometry rings laid flat on the ocean, MAX_TSU=300, renderOrder 10).
   Does NOT create volcanoes or assert collapse: it iterates the rendered unloading volcanoes, keeps the COASTAL
   ones (edifice subaerial: dS·rigidity − E ≤ 0, AND a submerged crust neighbour within ~1.5°, so a collapse
   would enter the sea), and draws a wavefront ring whose radius = reachKm/6371 world units, reachKm scaling
   with the unloading proxy up to 'Max Tsunami Reach (km)' (default 500). Gated on showVolcanoes; both the
   subaerial and neighbour tests use the same dS/decode/UV as the shader (neighbour lookup = R^-1·nb). New GUI
   controls 'Flank-Collapse Tsunami (E16)' + 'Max Tsunami Reach (km)'; HUD adds a TSUNAMI counter (id r-tsu);
   new legend swatch + Model-Caveats entry. Anchors: Anak Krakatau 2018 (~430 dead, collapse ~2 min after a
   small EQ), Fogo ~73 ka (run-up >270 m; Ramalho 2015), Tenerife ~170 ka (deposits to 132 m), ~25% of volcanic
   fatalities. No shader change (CPU markers only). Verified: module node --check clean, GLSL backtick-free, all
   fragment uniforms declared, new HUD id present + wired, no merged lines, tsuMesh count cleared when off;
   neighbour-construction (unit, ~1.5°), reach-scaling (monotone), and the coastal truth table logic-checked in
   Node. The conflict/uncertainty (collapse volume, bathymetry, coast geometry not resolved) is in the caveats.
   E17 BUILT (2026-06-04): climate zones / insolation recompute (RESEARCH_3 Mechanism 6, ESTABLISHED for the
   instantaneous insolation map) — the last researched candidate and the "larger feature" on the prior NEXT
   list. Implemented as a per-fragment OVERLAY inside the existing globe ShaderMaterial (the same pattern as the
   stress overlay — NOT a new mesh, honouring the one-ShaderMaterial decision). Climate follows the FIXED spin
   axis, so a pole shift moves crust across the world-latitude belts: the shader computes the NEW belt from
   |asin(ndW.y)| and the OLD belt from |asin(ndL.y)| (boundaries 23.5°/66.5°), then either tints every cell by
   its new belt (uClimateMode 0, mix 0.30) or highlights only crust that CROSSED a belt (mode 1, mix 0.55).
   New uniforms uShowClimate/uClimateMode + 3 belt colours (declared in BOTH the JS uniforms{} and the fragment
   uniform block); new GUI folder 'CLIMATE (Mechanism 6)' with 'Climate Zones (E17)' + 'Show Belt Crossings';
   new legend row; new Model-Caveats entry. Off by default, reducible to data-first. Uses only GLSL builtins
   (degrees/asin/clamp/abs/mix); first enhancement since Stage 6 to touch the fragment shader. Anchors: Daradich
   2017 (TPW changes every cell's insolation); Jurassic ~30° shift across climate belts (Muttoni & Kent 2019).
   CAVEAT kept visible: insolation change is instant but ocean/ice response lags centuries-millennia (no time
   axis), and the 3-belt scheme is a coarse insolation proxy (no circulation/precip/ocean-heat). Verified:
   module node --check clean, GLSL backtick-free, fragment brace balance OK, ALL fragment uniforms declared in
   JS (incl. the 5 new ones), new GUI/legend/caveats wired, no merged lines.
   ============================================================================================
   RESEARCH SET FULLY REPRESENTED: every mechanism in RESEARCH_3 (1a/b/c, 2, 3, 4, 5, 6) plus the RESEARCH_5
   antipodal/deep pass is now built as a labeled, default-OFF layer (E1–E17). No researched-but-unbuilt
   candidate remains.
   NEW ROADMAP ATTACHED (2026-06-04): BUILD_SPEC_comprehension_and_driver.md is now a project file. It defines
   the actual next arc that earlier sessions missed (it was only ever a chat artifact): a COMPREHENSION LAYER
   (Phase A: A1 presets, A2 story mode, A3 guided camera, A4 standing UI) then a DRIVER LAYER (Phase B: E18
   perturbing-body/tidal, E19 eclipse/proton-flux/magnetosphere, E20 master-clock orchestration). Driver layer
   is E18/E19/E20 — the numbering collision the spec warns about is ALREADY RESOLVED in this file (E16/E17 are
   tsunami + climate; do not renumber). Build Phase A in order, then Phase B.
   A1 BUILT (2026-06-04): scenario presets — first comprehension-layer item. Three named bundles (Hapgood,
   ECDO, Zacharias) applied THROUGH the existing setters (updateShift / setBulgeRigidity / effectsParams+
   computeEffects / a new flyCameraTo), animated, controls left free. Each badged by scientific standing
   (established/contested/speculative; all three pole-shift scenarios are non-mainstream — Hapgood pseudoscience,
   ECDO fringe, Zacharias speculative + attribution-unverified). Added a SCENARIOS GUI folder (top of panel), a
   caption HUD beside the globe (#scenario + close), and a guided camera fly (direction-vector lerp+normalize,
   easeInOutCubic, aborts on user pointer/wheel). Verified: module node --check clean, GLSL untouched/backtick-
   free, all fragment uniforms declared, all new HUD ids present + wired, no merged lines; preset coordinates
   logic-checked (90−lat = claimed shift for all three: 30°/104°/90.8°). Source: BUILD_SPEC Phase A / A1.
   A2 BUILT (2026-06-04): story / guided-narrative mode. One master clock T∈[0,1]; the existing shift slide and
   bulge relaxation are now PURE functions of T (shiftProgress = remap(T, shiftWindow); bulgeRelax =
   easeInOutCubic(remap(T, bulgeWindow))), so the scrubber is lossless in both directions — verified in Node
   (same T → identical {shift,bulge,step} swept forward and reversed; shift rises 0→1 monotonically through its
   window, bulge falls 1→0 through its). Six keyframe steps with captions + camera poses + layer masks (before
   → slide → mismatched bulge → stress/quakes → relaxation/GIA → equilibrium). Refactor: extracted
   setShiftProgress (shared with the E5 scrubber) + prepareShiftTarget (sets _qTo without starting the 1.4 s
   slide); added shared easeInOutCubic/clamp01/remap01. Transport = bottom bar (#story-bar: Prev / Play-Pause /
   Next / scrubber / step counter / Exit) + a 'GUIDED STORY' GUI folder; caption reuses the A1 box (setCaptionBox
   shared). Camera is also a pure function of T (interp between step poses), written only when no intro/resume
   fly is in flight; a user pointerdown pauses playback. The story narrates the currently-set pole (or a default
   ~82° if none). This is the SAME clock Phase-B E20 will reuse to sequence the driver scalars before the shift.
   Verified: module node --check clean, GLSL untouched/backtick-free, all fragment uniforms declared, all new
   HUD ids present + wired, renderOrder set unchanged (no new mesh), no merged lines. Source: BUILD_SPEC Phase A / A2.
   A3 BUILT (2026-06-04): guided camera. Replaced the A1/A2 direction lerp+normalize with QUATERNION SLERP for
   every eased fly (flyCameraToDir/flyCameraTo) and for the story's per-T camera (slerpDir between precomputed
   step view-directions) — great-circle, constant angular velocity. Verified in Node: uniform 12° steps over a
   120° arc (stdev 0) vs the old lerp+normalize ramping 5.8°→19° (stdev 4.85). Distance tweens separately; one
   shared easeInOutCubic. OrbitControls damping (0.06) + per-frame update() were already present and kept;
   pointerdown/wheel still aborts a fly and control returns instantly (controls stay enabled so the same gesture
   begins the drag). Dependency-free (no camera-controls lib) per the one-self-contained-file decision. Verified:
   module node --check clean, GLSL untouched/backtick-free, all fragment uniforms declared, HUD ids intact,
   renderOrder unchanged (no new mesh), old lerp paths removed, 3-arg flyCameraTo still works for presets.
   Source: BUILD_SPEC Phase A / A3.
   A4 BUILT (2026-06-04): scientific-standing UI — final comprehension-layer item; PHASE A COMPLETE. A
   STANDING_INFO registry (13 graded controls: Earthquakes, Bulge Rigidity, E9 trio, E10–E17) drives a
   colour+icon+word chip injected into each control's lil-gui '.name' (prepended so the ellipsis never clips
   it; hover → what-it-shows + named source), plus a persistent always-visible key (#standing-key, top-centre).
   Three tiers from the shared STANDING map (established teal ✓ / contested amber ~ / speculative violet ?) —
   icon AND word, never colour alone (colourblind-safe). Reads the same grading as Model Caveats (keep both in
   sync). Chips stopPropagation so they never toggle the control; applyStandingBadges() runs once after all
   folders via walkControllers. Verified: module node --check clean, GLSL untouched/backtick-free, all fragment
   uniforms declared, new HUD id present + wired, renderOrder unchanged (no new mesh), and EVERY STANDING_INFO
   key cross-checked to map to a real control (no orphan chips). Source: BUILD_SPEC Phase A / A4.
   ============================================================================================
   PHASE A (COMPREHENSION LAYER) COMPLETE: A1 presets · A2 story/master-clock · A3 quaternion-slerp camera ·
   A4 standing UI. The cause-agnostic engine (Stage 1–6 + E1–E17) is now wrapped in a full comprehension layer.
   NEXT — PHASE B (DRIVER / TRIGGER LAYER), build in order E18 → E19 → E20 (NOT E16–E18; those are taken):
   E18 BUILT (2026-06-04): perturbing body + tidal stress — first driver-layer item. A sphere + trail on a
   parametric straight-line flythrough (progress s∈[-1,1], s=0 = closest approach), visual distance compressed
   to stay on screen. Emits ONE scalar bodyCoulombMPa() = 0.003·(M/M_moon)·(d_moon/d)³ MPa, ADDED to each
   site's Coulomb stress in computeEffects (feeds E1; never touches E1–E17 internals otherwise — cause-agnostic).
   Real physics verified in Node: a_tidal = 2GM·R⊕/d³ gives 1.10e-6 m/s² for the Moon (matches the spec's
   1.1e-6); ΔCFS for the Moon at 1 LD = 0.0030 MPa = 30% of the 0.01 MPa line; threshold needs ≥3.33 lunar
   masses at 1 LD (absurd); inverse-cube falloff symmetric about s=0; 50 Moons at 0.1 LD = 150 MPa = 15000×
   (the honest reductio that floods the globe). New HUD readout 'BODY ΔCFS' (id r-body) shows ΔCFS vs the line +
   true distance (LD, R⊕) + a_tidal, red only past threshold. GUI 'DRIVER · BODY (E18)' (mass in lunar masses,
   perihelion in lunar distances, flythrough s); speculative chip via A4; default OFF; user-set shift primary.
   Verified: module node --check clean, GLSL untouched/backtick-free, all fragment uniforms declared, new HUD id
   present + wired, renderOrder set unchanged (body uses default order), tidal math logic-checked. Source: BUILD_SPEC Phase B / E18.
   E19 BUILT (2026-06-04): eclipse + proton-flux storm + magnetosphere — scalar #2. A FRED double-exponential
   pulse P(stormDay) (closed-form peak normalization → exactly 1; verified peak day ≈1.2, P≥0.5 over ~0.2–5 d,
   tail to ~7 d) MULTIPLIES the E13 amplitude via protonFluxFactor() (=1 when off, so E13 unchanged) — quakes
   bump in the storm window. Magnetopause = a Shue-shaped wireframe shell along uLightDir whose standoff R_mp ∝
   P_dyn^(−1/6) compresses to 0.50× nominal at peak (matches real 10→5 R⊕; verified). Eclipse reads the E18
   body's angular size (rocky-density radius from mass) vs the Sun's 0.53°: Moon-at-1-LD = 0.97 coverage (barely
   total, verified — as real total eclipses are); a dark subsolar shadow disc scales with coverage. Body→solar
   gate (most fringe) optionally scales the storm amplitude by the body's tidal forcing. FOUR toggles, FOUR
   standings (contested / established / speculative / speculative), all default-OFF, each chipped via A4 and
   matched in the caveats. New HUD 'FLUX P' (id r-flux). The scalar feeds E1 ONLY through E13's amplitude
   (cause-agnostic). Verified: module node --check clean, GLSL untouched/backtick-free, all fragment uniforms
   declared, new HUD id present + wired, renderOrder set unchanged (magnetopause/shadow use default order),
   pulse/magnetopause/eclipse math logic-checked in Node. Source: BUILD_SPEC Phase B / E19.
   E20 BUILT (2026-06-04): master-timeline orchestration — Phase-B capstone. Reuses the A2 story clock (no second
   timeline): the story config is now swappable (storyCfg), with STORY_DRIVER re-timing the shift to AFTER the
   storm. A '▶ Play driver sequence (E20)' button runs it on the same transport/scrubber. When storyCfg.driver,
   applyStoryClock calls applyDriverClock(T), driving E18 body progress (s: −1→0 approach by T=0.40, →+1 recede)
   and E19 stormDay (onset T=0.42, scaled so the FRED peak lands T≈0.48) as PURE functions of T. Verified ordering
   in Node: body closest 0.40 → storm onset 0.42 → FLUX peak 0.48 (BEFORE the shift at 0.55) → shift 0.55–0.72 →
   consequences → GIA. Captions are honest: the body + storm visibly fall short of the 0.01 MPa line, then the
   shift is taken as the premise and E1–E17 run. Driver scalars feed the engine only via the two documented hooks
   (cause-agnostic). Verified: module node --check clean, GLSL untouched/backtick-free, all fragment uniforms
   declared, HUD ids intact, renderOrder set unchanged (E20 adds no mesh), no stale STORY.* refs, timeline
   ordering logic-checked. Source: BUILD_SPEC Phase B / E20.
   ============================================================================================
   PHASE B (DRIVER LAYER) COMPLETE: E18 perturbing body/tidal · E19 eclipse/proton-flux/magnetosphere · E20
   orchestration. BUILD_SPEC FULLY REALIZED (Phase A A1–A4 + Phase B E18–E20) on top of the Stage 1–6 + E1–E17
   cause-agnostic engine.
   REMAINING (polish / non-blocking):
   - E18 visual refinement [DONE 2026-06-04]: the body is now a LIT rocky sphere (MeshStandardMaterial + a
     DirectionalLight on uLightDir + dim ambient — lights touch ONLY the body, not the shader globe/markers) on
     the perihelion ARC of an eccentric ellipse r(ν)=r_p(1+e)/(1+e·cosν) ("we only see the tail end"), with a
     warm additive halo, a fading comet tail, the faint full hypothetical orbit, and a floating screen label
     (mass·distance). New 'Eccentricity' control. Physics untouched: closest approach == perihelion for any e,
     so the lunar yardstick (Moon@1 LD = 0.0030 MPa) is preserved (verified). Self-contained in the E18 block +
     updateBodyLabel (called from tick) + #body-label.
   - Real-browser QA pass per QA_CHECKLIST.md (especially: driver sequence playback + scrub losslessness; chips
     render; magnetopause/eclipse/body visuals; no console errors).
   - The two local generated assets (make_etopo_terrainrgb.py + make_plate_boundaries.py) — hosts blocked in the
     sandbox; user runs them locally for true bathymetry + the active-fault gate.
============================================================
