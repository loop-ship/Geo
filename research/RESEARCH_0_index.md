# Pole-Shift Simulator — Research Document Set

Five research reports underpinning the build (`geo.html`). Each grades every claim by scientific
standing (established / contested / fringe-or-refuted) so the engine can label things honestly.
Attach all five to the project; the build file's self-describing header distills the key numbers
from these, so a fresh session does not need to re-read them to continue.

1. **RESEARCH_1_crustal_displacement_foundation.md**
   Core physics. Hapgood crustal displacement vs True Polar Wander; the equipotential
   water-redistribution math (ΔS = ½ω²(ρ_new²−ρ_old²)/g) and WGS84 constants; paleomagnetic
   markers (Laschamp, Younger Dryas); celestial triggers (Planet Nine vs Nibiru, micronova, CME
   coupling); monument/myth layer; the ECDO/ECDOview competitive landscape. The load-bearing
   "bulge does not relax" assumption is identified here.

2. **RESEARCH_2_zacharias_ecdo_landscape.md**
   What the "Zacharias model" actually is (@zachariaspro / geosyncmonitor.com — observational
   wobble-collapse → TPW), and how it differs from ECDO (core-mantle decoupling / Dzhanibekov flip,
   104° to Zambia), Hapgood (crust slips over interior), and Sitchin (Nibiru). Corrects the earlier
   Zacharias↔Sitchin name-conflation: there is no real lineage.

3. **RESEARCH_3_effects_layer_spec.md**
   The secondary-effects specification: volcanism from deglaciation/unloading, bulge-reorientation
   membrane stress, earthquake-volcano-tsunami cascades, GIA rebound seismicity, the solar-seismic
   anchor (Lyubushin/Anagnostopoulos/Zeigarnik), and the LOD/rotation modulation. Everything reduces
   to a Coulomb stress field; key bridge: ~9.81 kPa per meter of water ≈ the 0.01 MPa trigger threshold.

4. **RESEARCH_4_browser_globe_architecture.md**
   The build architecture: Three.js + WebGL2, single self-contained HTML, importmap + Python
   http.server; rotate the data lookup (R⁻¹·n), not the mesh; GPU per-fragment water and effects;
   ETOPO 2022 / Terrain-RGB elevation. Decides "self-contained first, architected for real data."

5. **RESEARCH_5_antipodal_deep_triggering.md**
   The antipodal / deep-earthquake triggering question (built into the engine as E9). Global dynamic
   triggering = mainstream; antipodal enhancement = contested (O'Malley 2018 vs Parsons & Velasco 2011);
   deep preference = speculative (off by default).

Companion (methodology, not research): SELF_DESCRIBING_HANDOFF.md and the kickoff header explain how the
build file carries its own context so it survives session gaps.
