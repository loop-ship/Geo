# An Effects-Layer Specification for a Pole-Shift Simulation Engine: Secondary Geophysical Mechanisms, Quantitative Triggers, and Scientific Grading

## TL;DR
- **The most implementable, best-established secondary effects are stress-triggering rules**: a Coulomb stress change as small as ~0.01 MPa (10 kPa) can trigger seismicity on critically stressed faults (King et al. 1994; Stein 1999); deglaciation raises subaerial volcanism 2–6× globally between 12 ka and 7 ka (Huybers & Langmuir 2009; up to 30–50× in Iceland); and large (M≥7) earthquakes produce a peak in VEI≥2 eruption rates lasting a few days within 750 km (Linde & Sacks 1998) — all reducible to "stress/load change X → rate change Y → lag Z" rules.
- **The rotational-bulge reorientation stress is the dominant novel driver and is physically founded but only loosely quantified for Earth**: reorientation over the equatorial bulge produces membrane stresses scaling as μ·f·g(β), reaching "several kilobars" (hundreds of MPa) for a 25° Mars shift (Melosh 1980); an Earth elastic-lithosphere analog plausibly reaches hundreds of MPa for large shifts — far above the ~0.01 MPa threshold, so a pole shift should drive essentially planet-wide fault reactivation in predictable latitude bands.
- **Grade the layers honestly**: deglaciation→volcanism, GIA→postglacial faulting, EQ→volcano triggering, hydrological-load→seismicity, and Coulomb/membrane stress physics are ESTABLISHED; LOD/rotation-rate→seismicity (Bendick & Bilham) and Chandler-wobble/seismicity coupling are CONTESTED; direct geomagnetic-storm→earthquake causation is CONTESTED-to-FRINGE and should be a tunable, low-weight term, consistent with the existing solar-seismic anchor.

## Solar-seismic anchor (already in hand — do not re-research, extend from these)
- **Lyubushin & Rodionov (2025):** proton flux accounts for up to 23–28% of M6.5+ earthquake intensity; decay τ ≈ 18 days; ~26.6-day solar-rotation periodicity in seismicity.
- **Anagnostopoulos et al. (2021):** coronal-hole High Speed Streams (not CMEs) are the dominant seismic trigger; 77% of M≥7.8 earthquakes occur in the solar-cycle decay phase.
- **Zeigarnik et al. (2022):** controlled MHD electric-current-injection field experiments — seismicity rises 2–7 days after each pulse; the Sept 6 2017 X9.3 flare caused a 68% increase in global M4+ earthquakes within ±11 days; telluric current densities from flares ~10⁻⁶ A/m² match artificial triggering; energy ratio 10⁻⁶ to 10⁻⁸ ("last straw" on faults at 90–98% of failure load).

## Details

### Mechanism 1 — Volcanism triggered by crustal stress, sea-level change, deglaciation
**(a) Deglaciation / unloading (ESTABLISHED).** Huybers & Langmuir (2009, *EPSL* 286:479): subaerial volcanism increases 2–6× globally between 12 ka and 7 ka; ocean-ridge production decreases as sea level rises. Iceland (Maclennan et al. 2002): eruption rates rose **30-fold** when a 2-km ice sheet was removed in ~1 kyr. Implementable rule: **unloading 1 km of ice → ~10 MPa depressurization → ~0.1% melt-fraction increase**. Magma-chamber: ~32 MPa excess pressure makes the eruptible fraction ~10× higher. Lag = melt-transport time from depth.
**(b) Sea-level / Milankovitch ridge volcanism (ESTABLISHED-to-CONTESTED).** Lund & Asimow (2011), Crowley et al. (2015, *Science*), Tolstoy (2015) show Milankovitch-band crustal-thickness variation; Goff et al. (2018) dispute the magnitude. Established in principle, contested in magnitude.
**(c) Earthquake→volcano triggering (ESTABLISHED).** Linde & Sacks (1998, *Nature* 395:888): VEI≥2 eruption-rate peak for a few days within 750 km (great EQ) / 250 km (large EQ); chance probability ≪1%. Manga & Brodsky (2006): ~0.4% of eruptions plausibly earthquake-triggered. Nishimura (2017): no significant effect below M7.5. Lags 0 days to 3–10 years (viscosity-dependent).

### Mechanism 2 — Crustal stress from rotational/bulge reorientation
**Grade: ESTABLISHED physics, loosely quantified for Earth.** Melosh (1980, *Icarus* 44:745): "rotation of the lithosphere over the equatorial bulge by 25° produces membrane stresses of several kilobars" (~300–500 MPa for Mars, f≈0.005). Stress concentrates: N-S normal faults near the load (~30° lat), N-S thrust faults in polar regions, strike-slip between. Melosh (1977): peak stress difference σ_φφ − σ_θθ = 5(m−m')μ(1+σ)/(5+σ); azimuthal stress always exceeds meridional; thinner lithosphere → larger stress. Matsuyama & Nimmo (2008, *Icarus* 195:459): closed-form analytic stress; principal-stress ratio l₂/h₂ = (1+ν)/(5+ν); pattern independent of elastic parameters, magnitude set by h₂. Matsuyama & Nimmo (2011, Vesta): for ~6–20° reorientation, max shear ~1 MPa — "reactivate optimally-oriented pre-existing fractures." Latitudinal dependence is a degree-2 order-1 harmonic, peaking ~45° from the Euler axis; equatorward-moving zones extend, poleward-moving zones compress.

**Implementable rule:** Δσ_max ≈ μ·f·g(β)·[(1+ν)/(5+ν)] with f=1/298, μ≈4–7×10¹⁰ Pa, ν≈0.25; map principal stresses to fault styles (normal/thrust/strike-slip by zone). Even ~1 MPa is ~100× the 0.01 MPa threshold → near-global reactivation.
**Critical caveat:** Earth retains essentially no permanent fossil bulge (Mitrovica & Wahr 2011; Tsai & Stevenson 2007), so for slow TPW reduce the effective f; for a rapid (elastic-response) shift use the full elastic formulas. Tsai & Stevenson (2007): theoretical max TPW speed ~2.4°/Myr — a rapid pole shift is faster than any documented geological TPW, so present it as a scenario input.

### Mechanism 3 — Earthquake–volcano–sea-level cascades & feedbacks
**Grade: ESTABLISHED (loading physics).**
- **Coulomb/water-load thresholds:** reservoir-induced seismicity triggers at ΔCFS ~0.01 MPa; general range 0.01–1 MPa; 0.1 MPa robust (Stein 1999, *Nature* 402:605).
- **Water-load-to-stress:** σ = ρgh ≈ **9.81 kPa per meter of water**. So **~1 m of water ≈ 0.01 MPa ≈ the triggering threshold**; ~10 m ≈ 0.1 MPa. This is the bridge from the equipotential sea-level computation to the seismicity layer.
- **Seasonal hydrological loading:** 2–4 kPa monsoon-load stress modulates Himalayan seismicity with a 5–6 month lag — sub-10-kPa periodic loads measurably modulate rates.
- **Volcanic flank collapse → tsunami:** Anak Krakatau 2018 (collapse 2 min after a small EQ; ~430 dead); Fogo ~73 ka megatsunami run-up >270 m (Ramalho et al. 2015); Tenerife ~170 ka deposits to 132 m. ~25% of volcanic fatalities from volcano-induced tsunamis.
- **Cascade chain:** pole-shift bulge stress → fault reactivation → megathrust EQ → tsunamis + triggered eruptions (≤750 km, days) + flank collapses → secondary tsunamis. Sea-level redistribution → coastal load (~10 kPa/m) → more Coulomb triggering → feedback.

### Mechanism 4 — Geomagnetic / solar effects on the solid Earth (beyond the anchor)
**Grade: CONTESTED to CONTESTED-FRINGE.**
- **LOD / rotation-rate → seismicity (CONTESTED):** Bendick & Bilham (2017, *GRL* 44:8320) found a ~32-year M≥7 clustering and a ~5-year lag behind decadal rotational deceleration; "probabilities not predictions," stresses far below normal triggering thresholds. Implement as a low-weight multi-year envelope.
- **Chandler wobble ↔ seismicity (CONTESTED):** established direction is EQ → wobble excitation (O'Connell & Dziewonski 1976); reverse is much weaker. Treat polar-motion→seismicity as speculative.
- **Geomagnetic storms → earthquakes (CONTESTED-to-FRINGE):** Marchitelli et al. (2020) report SOHO proton density correlating with large EQs at 1-day lag; Love & Thomas (2013) found no significant triggering; a 2022 *Atmosphere* paper questions whether it is artifactual. Keep as the same tunable, low-weight term as the existing solar-seismic anchor — do not elevate to causal certainty.

### Mechanism 5 — Water-redistribution secondary effects (GIA and postglacial faulting)
**Grade: ESTABLISHED.** Fennoscandian Glacially-Induced Faults up to 160 km long, 30 m high; the Pärvie Fault (155 km) records a paleo-earthquake of Mw ~7.9 (Wood 1989); single events up to Mw 8.2 (Arvidsson 1996). Mechanism: glaciation-accumulated horizontal stress released during rebound; vertical stress = minimum principal stress → thrust faulting. **GIA timescales:** upper-mantle η ≈ 4–5×10²⁰ Pa·s; lower mantle >10²² Pa·s; Haskell ≈10²¹ Pa·s. **τ = η/μ** (μ≈7×10¹⁰): η=10²¹ → τ≈450 yr; bulk rebound over thousands of years. Model rebound as per-degree exponential relaxation; trigger faulting where rebound ΔCFS > 0.01 MPa. For a pole-shift water redistribution, the same load→stress→fault chain applies globally and far faster.

### Mechanism 6 — Atmospheric / climate effects
**Grade: ESTABLISHED (latitude→insolation); less-constrained (circulation speed).** TPW changes the latitude (and insolation) of every surface point (Daradich et al. 2017). Recompute insolation/climate-zone membership from the new paleolatitude of each cell after the Euler rotation. Jurassic "monster shift" (~30°, 160–148 Ma; Muttoni & Kent 2019) moved regions across climate belts. Climate-zone boundaries follow latitude essentially instantly in the insolation sense; ocean/ice responses lag centuries–millennia — model as relaxation toward the new equilibrium.

## Recommendations (five-stage effects build)
1. **Core Coulomb stress-triggering engine.** One ΔCFS field combining bulge-reorientation membrane stress + surface-load changes + earthquake static transfer. Rule: ΔCFS ≥ 0.01 MPa → trigger; 0.1 MPa → robust; ~1 kPa for dynamic/transient. Load conversion σ = ρgh ≈ 9.81 kPa/m.
2. **Couple bulge reorientation to the fault field.** Δσ_max ≈ μ·f·g(β)·(1+ν)/(5+ν); degree-2 order-1 pattern peaking ~45° from the Euler axis; fault style by zone; calibrate rate via the GIA/postglacial-fault analog (Mw up to ~8.2 in reactivated cratons).
3. **Volcanism and cascades.** Deglaciation multiplier 2–6× global / up to 30× regional, ~10 MPa/km ice with a melt-transport lag; EQ→volcano +probability within 750–800 km over days for M≥8; cascades to tsunamis and flank collapses.
4. **GIA rebound and its seismicity.** Per-degree exponential relaxation τ=η/μ; trigger where rebound ΔCFS ≥ 0.01 MPa.
5. **Weak/contested modulating terms as tunable, low-weight envelopes (default off/down-weighted):** LOD/rotation (Bendick & Bilham); geomagnetic/solar (Lyubushin τ≈18 d, ~26.6-d periodicity; Anagnostopoulos HSS-decay weighting; Zeigarnik 2–7 day lag). Promote a contested term only on independent replication with mechanism-level stress >0.01 MPa.

## Caveats
- A "rapid pole shift" is not a documented Earth event (fastest supported TPW ~2.4°/Myr); engine outputs are scenario exploration, not prediction.
- Earth has no permanent fossil bulge, so sustained membrane stress from slow reorientation is reduced; the large stresses apply to *rapid* reorientation. The per-degree Earth stress value is an inference from planetary-body scaling (Melosh/Matsuyama-Nimmo), not a published Earth number — flag it.
- Triggering thresholds describe critically stressed faults (90–98% of failure). Track a fault-criticality state or you over-predict triggering.
- Solar/geomagnetic→earthquake causation is genuinely disputed; keep it bounded and tunable.
- Milankovitch ridge-volcanism magnitude is contested; use the sea-level→decompression direction with conservative amplitudes.
- Postglacial paleo-earthquake magnitudes conflict (Mw 7.9 vs 8.2); propagate as uncertainty.
