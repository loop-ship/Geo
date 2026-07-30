# Building a Browser-Based 3D Pole-Shift / Crustal-Displacement Globe: Recommended Architecture and Build Path

## TL;DR
- **Build the self-contained version FIRST, but architect it for real data from day one.** Start with a procedural/low-res baked Earth (a 16-bit equirectangular heightmap of a few hundred KB) so the prototype runs instantly with zero downloads — but design the displacement, rotation, and water layers to read from a heightmap *texture* so swapping in real ETOPO 2022 data later is a one-line URL change, not a rewrite. The correct route is *one architecture, two data files*.
- **Use Three.js (r180+/r184) with WebGL2, a single custom `ShaderMaterial`, and an importmap-based single-file project served by Python's `http.server`.** This is the stack the closest real comparable (ECDOview) uses. Keep the topography in a fixed lat/long heightmap and apply the pole-shift as a rotation matrix in the shader; keep the spin axis and equipotential surface fixed in world space. WebGPU is baseline but not worth targeting first — flip the renderer later for free.
- **Compute water redistribution and the effects layer on the GPU in the fragment shader, per-fragment, in real time.** The bulge-difference formula (ΔS = ½·ω²·(ρ_new² − ρ_old²)/g) and the Coulomb-stress threshold are cheap per-pixel calculations; running them in-shader gives a real-time slider with no CPU recompute.

## Key Findings
**Central question — self-contained vs real-data-first vs both:** All three layers (displacement, Euler rotation, water redistribution) operate on a *heightmap texture and a lat/long grid*, not on specific data values. The data source is an interchangeable input. Start self-contained for instant feedback and trivial debugging, but wire the pipeline to consume a heightmap from the start. No painful rewrite: only the file and a couple of scale constants change.

**Closest real comparable:** ECDOview (ecdoview.com) states it is "built with Leaflet.js for 2D mapping, Three.js for 3D globe rendering." Its flood visualization is an adjustable elevation-threshold blue overlay (default 175 m, user slider) — exactly the fragment-shader approach below. The physically-accurate "sloshing" water (ECDOsim) is an offline Blender fluid sim on a DEM-displaced UV sphere — not real-time. The "Zacharias model" itself could not be confirmed as an interactive web app; "graphics comparable to Zacharias" = a polished interactive Three.js globe.

## Details

### 1. Tech stack
**Recommendation: Three.js (r180 from Sept 2025; r184 = `three@0.184.0`, latest mid-2026), WebGL2, single custom `ShaderMaterial`.**
- **Three.js** — best fit; raw GLSL access; ~2.7M weekly npm downloads (~270× Babylon.js). Choose this.
- **Babylon.js** — full game engine, WebGPU-first, larger bundle; overkill for one custom shader.
- **CesiumJS** — purpose-built geospatial globe with a fixed WGS84 ellipsoid; fights an arbitrary rigid crustal rotation and a custom reoriented sea level. Wrong tool.
- **globe.gl / three-globe** — Three.js wrapper; great for the aesthetic and marker layers but abstracts the shader you must own. Reference, not core.
- **deck.gl / regl / raw WebGL/WebGPU** — wrong scope or premature.
- **WebGPU vs WebGL2:** WebGPU is baseline but target WebGL2 + GLSL first (more tutorials, GPUComputationRenderer); since r171 you import `WebGPURenderer` with automatic WebGL2 fallback, so no loss starting on WebGL2.

### 2. Real elevation data
**Recommendation: ETOPO 2022 (NOAA NCEI), 60-arc-sec global tile, downsampled to a 16-bit equirectangular PNG.**
- ETOPO 2022: seamless topo+bathymetry, 15-arc-sec native; GeoTIFF/NetCDF; WGS84, meters re: EGM2008; global RMSE 7.17 m vs ICESat-2; free for all uses (DOI 10.25921/fd45-gt74). 60-arc-sec grid 21600×10800; 30-arc-sec 43200×21600. Use the Ice Surface version.
- GEBCO 2023: 15-arc-sec ocean+land; either works (ETOPO better validated over land). ETOPO1: 10800×5400, lighter mid-tier. SRTM: land-only, no bathymetry — unsuitable. Natural Earth: pretty color basemap, not precise elevation.
- **Resolution tiers:** self-contained 2048×1024 or 3600×1800 (~1–4 MB); real-data default 5400×2700; high 10800×5400 (watch MAX_TEXTURE_SIZE).
- **Encode bathymetry:** (1) 16-bit grayscale with offset/scale (decode `elevation = pixel*scale − offset`); or (2) **Terrain-RGB** `elevation = −10000 + (R*65536 + G*256 + B)*0.1` (0.1 m precision, easy in numpy+Pillow, trivial GLSL decode). Convert with GDAL/rasterio in Python.

### 3. Displacement and rendering
**Recommendation: high-subdivision `SphereGeometry` displaced in a custom vertex shader; do NOT rely on stock `displacementMap`.**
- Geometry: ~256×128 up to 512×256 segments (512×256 ≈ 260k verts, trivial). Let the heightmap texture drive per-fragment color/lighting; don't tessellate to per-pixel.
- Custom vertex shader because you need the *same* heightmap sample (after the crustal rotation) for both displacement AND the per-fragment water calc, and the stock map can't apply your rotation to the lookup.
- Vertical exaggeration 10–50× (Everest is 0.14% of Earth's radius).
- **Water:** (a) translucent sphere at sea-level radius — simple but wrong after a shift (sea level becomes a reoriented ellipsoid); (b) **fragment-shader threshold (RECOMMENDED)** — per fragment, compute the local equipotential sea-surface height (reoriented bulge), compare to crust elevation, color water with a depth gradient. ECDOview's confirmed approach; handles the non-spherical reoriented sea level naturally.

### 4. The pole-shift / Euler rotation architecture
**Recommendation: separate two frames; rotate the *data lookup in the shader*, not the mesh or camera.**
- **Crustal frame (rotates):** topography as a fixed lat/long heightmap. Pole shift = rigid Euler rotation taking old pole to new pole; represent as a 3×3 matrix R (or quaternion) in JS.
- **Rotational frame (fixed):** spin axis (world +Y) and equatorial bulge / equipotential, which do NOT rotate.
- **Apply it:** in the shader, for world-space surface direction n, compute the crust sample direction `n_crust = R⁻¹ · n`, convert to lat/long, sample the heightmap; compute spin-axis distance ρ from the *world* position n.
- **Old vs new ρ:** ρ_new = sin(world colatitude)·radius (after the shift); ρ_old from the point's pre-shift latitude (un-rotated lookup). Both one-liners.
- **Why not rotate mesh/camera:** rotating the mesh moves the bulge/spin axis (wrong physics); rotating the camera changes nothing in the data relationship. Rotating the *data sampling* keeps the spin axis and equipotential fixed — physically correct and cleanest.

### 5. Water redistribution
**Recommendation: per-fragment on the GPU, real time.** Reference ellipsoid: WGS84, a−b ≈ 21,384.7 m. Per fragment: compute ρ_old, ρ_new; **ΔS = ½·ω²·(ρ_new² − ρ_old²)/g** (ω = 7.292115×10⁻⁵ rad/s, g ≈ 9.81); new local sea level = old + ΔS; if crust < sea level, flooded; map flood depth to a color ramp (1 m → 5 km) via a GLSL colormap or 1-D LUT. GPU gives a real-time slider at 60 fps; CPU precompute would stutter. First-order equilibrium (ignores sloshing, self-gravitation, isostatic rebound) — fine for visualization; note it in the UI.

### 6. Effects layer
**Recommendation: stress field as a data texture / fragment heatmap; discrete events as instanced meshes.** Water load ~**9.81 kPa per meter**; static triggering threshold **0.01 MPa (0.1 bar)** (King, Stein & Lin 1994; Stein 1999). ~1 m water ≈ order-of-magnitude below threshold; ~1–10 m approaches/exceeds it. Discrete markers: `InstancedMesh` (one draw call for thousands), per-instance transform/color at lat/long on the rotated crust. Global field: a `DataTexture` sampled in the fragment shader.

### 7. Project structure and dev workflow (Python-friendly)
**Recommendation: single self-contained `index.html` using an importmap + Three.js from a CDN, served by Python's built-in server.**
- One `index.html` with `<script type="importmap">` mapping `"three"` to a CDN and `<script type="module">` for your code. No build step, no Node.
- Serve locally: `python -m http.server 8000` (ES modules and texture fetches need HTTP, not file://).
- Stage the heightmap as a sibling file (or inline the small one as base64 for a truly single file).
- Graduate to Vite only when you add many modules/deps or want HMR/bundling.
- WebGPU upgrade later: switch the import to `three/webgpu` and `WebGPURenderer`; automatic WebGL2 fallback.

### 8. Existing open-source references
- **ECDOview** — closest functional comparable (Three.js + elevation-threshold flood). Template for architecture.
- **github.com/sovrynn/ecdosim** — Blender+QGIS DEM displacement pipeline; data-prep recipe.
- **vasturiano/three-globe and globe.gl** — MIT Three.js globe; best reference for marker layers/aesthetic.
- **tentone/geo-three** — tile-based geographic globe with GPU displacement.
- **w3reality/three-geo** — Terrain-RGB decode-and-displace pattern.
- **GPUComputationRenderer** — for later GPU ping-pong fields (dynamic stress diffusion, fake sloshing).

## Recommendations (six-stage build)
1. **Self-contained prototype (architected for real data):** single `index.html`, importmap → Three.js r184, `python -m http.server`; `SphereGeometry(1,384,192)`, one `ShaderMaterial`; small placeholder heightmap decoded in GLSL; vertex shader samples at R⁻¹·n and displaces with an exaggeration uniform.
2. **Pole-shift rotation:** matrix uniform R from user lat/long (lil-gui); spin axis/bulge stay fixed.
3. **Water redistribution (GPU):** ΔS in the fragment shader; color ramp 1 m→5 km; real-time on the slider.
4. **Swap in real data:** change the heightmap URL to an ETOPO 2022 60-arc-sec → 5400×2700 PNG (Python rasterio/GDAL + numpy/Pillow). Only the data changes.
5. **Effects layer:** Coulomb-stress fragment overlay (0.01 MPa; 9.81 kPa/m) + InstancedMesh markers.
6. **Polish / optional WebGPU.**

**Benchmarks that change the plan:** if MAX_TEXTURE_SIZE < heightmap, tile/downsample; if fps drops on the slider, work has moved to the CPU — keep it in-shader; for exact flooded-area/volume, add a one-off CPU pass but keep the visual layer on GPU.

## Caveats
- The underlying theory is fringe science; rapid cataclysmic pole shift is not accepted by mainstream geophysics. Output is a hypothetical scenario, not a forecast — label it.
- The physics is first-order: ΔS is an equilibrium approximation ignoring sloshing, self-gravitation, isostatic rebound, finite relaxation time. The 0.01 MPa threshold is a debated guideline. Present the effects layer as indicative.
- "Zacharias model" specifics are unverified; the confirmed comparable is ECDOview (Three.js).
- Data licensing is clean for ETOPO 2022 (free) and three-globe/geo-three (MIT). Live satellite imagery tiles have different terms.
- Three.js releases ~monthly with occasional breaking changes; pin the version in the importmap.
