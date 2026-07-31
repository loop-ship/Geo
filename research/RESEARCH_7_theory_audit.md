# RESEARCH 7 — Theory / Attribution Audit (2026-07-31)

**Status: RESEARCH DONE, PLAN PROPOSED, NOTHING IMPLEMENTED.** This exists to be revised before any
code changes. Scope: verify every theory the app names against what its author actually published,
fix attribution, close the one real gap (Ben Davidson), and refine where our labelling is thin.

Supersedes nothing — `RESEARCH_1` §6–7 and `RESEARCH_2` remain correct on the landscape. This is the
2026 refresh: **the single biggest finding is that ECDO now has a book, and our docs predate it.**

---

## 1. What changed since our research was written

| | Our docs said | Now confirmed |
|---|---|---|
| ECDO author | "The Ethical Skeptic" (pseudonym only) | **Roger B. Cunningham**, self-disclosed |
| ECDO canonical source | blog posts | **book: *Inversion — ECDO Theory*, April 2026** |
| Ben Davidson | micronova only, no pole | **Bay of Bengal, ~15°N 90°E** — a missing preset |
| ECDOview | "69 reference sites" | 69 sites **+ 4 more datasets** (see §2.1) |

---

## 2. Findings per theory

### 2.1 ECDO — Roger B. Cunningham ("The Ethical Skeptic")

**Attribution is settled and is NOT a de-anonymisation.** He publishes under his own name: the book
*Inversion — ECDO Theory* (April 2026) is credited to Roger B. Cunningham, his own site sells
"(Author Signed Copy)", and he appears on Grimerica (#765, 2026-06-02) as "Roger Cunningham aka The
Ethical Skeptic". Sunfellow's resource page — the source `RESEARCH_2` already used — names him too.

**Recommended citation form: "The Ethical Skeptic (Roger B. Cunningham)"** — pseudonym first because
that is how the body of work is published and searchable, real name in parentheses because it is
self-disclosed and lends the attribution weight. Not a judgement call about privacy; both are public.

**Canonical claims (from theethicalskeptic.com):**
- **104°** reorientation, "momentum-conserving gyroscopic … via a mediated Dzhanibekov TPW rotation"
- along the **31st East meridian**, "moving towards South Africa"
- Three-stage mechanism: geomagnetic field weakens → core loses magnetic moment and **decouples** from
  the outer body → **exothermic phase changes in the nickel-iron core** release latent kinetic energy
  and shed lubricating D″ material
- Cyclic, but **explicitly no confident recurrence prediction** — "we still cannot confidently predict
  when the next instance will occur"
- Evidence categories claimed: 200+ aligned monuments, karst erosion bands on pyramids, ocean sediment
  displacement, 175+ flood myths, human genome bottlenecks, abyssal ocean heating
- Timeline: first hypothesis **2020-02-16**, master article **2024-05-23**, book **April 2026**

**Our preset is numerically correct.** ECDOview states its NP′ as **14°S, 31°E** — exactly the
`lat:-14, lon:31` we ship, giving 104°. No change needed to the coordinates.

**ECDOview's actual feature set** (useful as competitive context, and it is more than we recorded):
69 reference sites across 6 regions; two-point great-circle bearing test against NP′ that **checks
forward and reverse and reports whichever is closer** (i.e. the same line-not-ray fold E22 uses —
our method matches theirs); "Mach" Euler-compatibility heatmap (NP′ claimed in the top 3.4%);
**54,971 marine-fossil locations** (five-fold longitudinal pattern, p = 0.018); **4,899 evaporite
deposits**; Meinesz shear trajectories; and an inundation overlay defaulting to **175 m**.

> **E22 note:** their NP′ sits *on* the 31°E meridian, and their site list spans Africa/Near East (17)
> and Europe (13) — so an unknown number of their 69 sites are vulnerable to exactly the same-meridian
> coincidence our layer flags. That remains our sharpest differentiator; do not weaken it.

### 2.2 Ben Davidson (@SunWeatherMan, Suspicious0bservers) — **THE REAL GAP**

The app ships Hapgood, ECDO and Zacharias. Davidson is the third pole in the widely-cited "three
different pole locations" framing, and **we don't have him**, so our scenario set misrepresents the
landscape by omission.

- **New north pole: Bay of Bengal, ~15°N, 90°E** → in our convention `lat:15, lon:90`, a **75° shift**
  (90 − 15), which is distinct from ECDO's 104° and Zacharias's ~90.8°.
- **Mechanism:** solar **micronova** pulse + geomagnetic field collapse → crust "unlocks" from the
  mantle → rapid gyroscopic crustal displacement. Set inside a claimed **~12,000-year disaster cycle**.
- **Lineage:** explicitly agrees with **Chan Thomas, *The Adam and Eve Story*** — worth naming, since
  it is the older source of this specific pole.
- **Claimed timeframe:** a 10–25 year window, argued from field decay and magnetic-pole motion.

**Standing — this is the important part.** `RESEARCH_1` §5 already grades the micronova as **refuted
as stated**, and the reason is concrete and citable, not hand-waving: *a micronova is a thermonuclear
runaway on a white dwarf in a binary system; the Sun is a main-sequence star with no solid surface and
no companion.* The legitimate adjacent science — superflares on Sun-like stars (Kepler) and extreme
solar proton events in ¹⁴C/¹⁰Be records (Miyake events, e.g. 774/775 CE) — is real and should be named
in the same breath, exactly as we do elsewhere.

So the preset ships as **coordinates + an honestly graded caption**, like every other. The engine
stays cause-agnostic; adding it endorses nothing.

### 2.3 Zacharias — the naming question, and a real counter-finding

**On the name: your instinct was right.** "Zacharias" is a *handle* (@zachariaspro); `RESEARCH_2`
records that the real identity is undisclosed. Labelling a scenario with a bare first-name-like handle
reads as a person we can cite, which we can't.

**Recommend relabelling to "Zacharias · GEOSYNC"** — keeps the recognisable handle, adds the actual
framework name (geosyncmonitor.com, "GEOSYNC // Earth Orientation Monitor"), and is more searchable.

**The substantive finding — our caption is currently one-sided.** The premise is that the Chandler
wobble is *collapsing*, signalling TPW onset. The collapse itself is real and mainstream-acknowledged
(2015–2020, amplitude falling from ~150 mas to under ~10 mas). But:
- it **re-excited around 2020–2021**, reportedly with an ~180° phase reversal, and
- the mainstream attribution is **hydrological and cryospheric mass anomalies** whose excitation
  destructively interfered with the ongoing oscillation — i.e. a *forcing* change, not an internal
  precursor to a pole shift.

A wobble that collapses and then comes back is much weaker evidence for imminent TPW than a wobble
that collapses and stays collapsed. Our Zacharias caption should carry that.

> ⚠ **RESEARCH DEBT — do not ship this claim until sourced.** The re-excitation and phase-reversal
> figures above came from a search summary, and the two papers I pulled (Jaroszewicz et al., *MFDFA
> study of the Chandler wobble's anomalous disappearance 2015–2020*; the EGU geodesy blog) did **not**
> confirm the specific numbers. Leads to nail down: that MFDFA paper's full text, A&A 2011 "The Earth's
> variable Chandler wobble", and current IERS polar-motion series. **One targeted source pull is owed
> before any of this reaches a user-visible string.**

### 2.4 Hapgood

Not re-audited this pass — `RESEARCH_1` already grades it (century-scale 40° slip **refuted as a
mechanism**; Einstein's foreword is a historical fact, not an endorsement of the mechanism) and the
2026-07-30 terminology pass rewrote the badge to "historical proposal · superseded". Include it in the
§4 sweep only to confirm the caption still matches.

---

## 3. Proposed plan (revise this before I build any of it)

**Phase 1 — attribution (small, safe, high value)**
1. ECDO caption/`STANDING_INFO` → "The Ethical Skeptic (Roger B. Cunningham)"; cite the book
   *Inversion — ECDO Theory* (2026) as the canonical source alongside the 2020/2024 posts.
2. Rename the Zacharias preset → **"Zacharias · GEOSYNC"**; caption names geosyncmonitor.com.
3. Sweep `RESEARCH_1`/`RESEARCH_2` for the "attribution unverified" language that the 2026-07-28 audit
   already partly fixed, so the docs stop contradicting the shipped captions.

**Phase 2 — the Davidson preset (the actual gap)**
4. New `SCENARIOS` entry: **Davidson — Bay of Bengal**, `lat:15, lon:90`, 75°.
5. Caption grades it honestly: micronova mechanism **refuted as stated** with the white-dwarf-binary
   reason given, the legitimate adjacent science (superflares, Miyake events) named, and the Chan
   Thomas lineage credited. Badge wording must follow the locked terminology (no "fringe").
6. Check whether the Model Caveats E13/E19 entries want a named cross-reference now that a
   solar-forcing *scenario* exists, not just solar-forcing *layers*.

**Phase 3 — refine where we're thin**
7. Zacharias caption gains the wobble counter-evidence — **gated on the §2.3 research debt.**
8. Consider a short "how these four differ" line in the explainer: same end state (a large reorientation),
   four different causes and four different destinations. That contrast is the honest framing and it is
   currently implicit.

**Explicitly NOT proposed:** importing ECDOview's 69 sites into E22 (we decided a short *cited* list
beats a long one — do not pad), and adding fossil/evaporite/Euler-heatmap overlays (large data work,
and they're ECDO-specific evidence, not cause-agnostic engine features).

---

## 4. Constraints the audit must not break

- **The engine is cause-agnostic.** A preset is coordinates + a graded caption. Adding Davidson must
  not add a mechanism, a coupling, or an endorsement.
- **Terminology is locked** (2026-07-30): displayed tiers are *established / DEBATED / UNVERIFIED*;
  "fringe" and "pseudoscience" appear in **no** user-visible string — state the specific reason
  instead (e.g. "no known mechanism"). `STANDING` object keys are unchanged internal ids.
- **One grading, two surfaces:** any change touches both `STANDING_INFO` and the matching Model
  Caveats `<li>`.
- **Scenario coordinates are load-bearing for share links** — changing a preset's numbers changes what
  old links reproduce. Renaming a *label* is safe; renaming a `SCENARIOS` **key** is not.
- Do not weaken E22's same-meridian check (§2.1).

---

## Sources

- [Sunfellow — The Coming Pole Shift](https://www.sunfellow.com/pole-shift/) (three pole locations; names Cunningham)
- [The Ethical Skeptic — pole-shift tag](https://theethicalskeptic.com/tag/pole-shift/) (canonical ECDO claims)
- [Inversion — ECDO Theory, BookBaby](https://store.bookbaby.com/book/inversion-%E2%80%94-ecdo-theory) / [author-signed copy](https://theethicalskeptic.com/accepting-pre-orders-now/)
- [Grimerica #765 — Roger Cunningham aka The Ethical Skeptic](https://grimerica.ca/2026/06/02/765-roger-cunningham-aka-the-ethical-skeptic-inversion-and-our-planets-dynamic-history/)
- [ECDOview](https://www.ecdoview.com/) (NP′ 14°S 31°E; 69 sites; fossil/evaporite/Euler datasets)
- [Jaroszewicz et al. — MFDFA study of the Chandler wobble's anomalous disappearance 2015–2020](https://arxiv.org/pdf/2605.29056)
- [A&A — The Earth's variable Chandler wobble](https://www.aanda.org/articles/aa/full_html/2011/02/aa15894-10/aa15894-10.html)
- [EGU Geodesy — From Wobble to Wander](https://blogs.egu.eu/divisions/g/2025/06/27/bits-and-bites-of-geodesy-from-wobble-to-wander-tracking-earths-shifting-rotation-axis/)
