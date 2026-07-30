# Premise Audit — geo.html vs. its own research (2026-07-28)

Continues the numbering of `RESEARCH_1`–`5`. This is a findings-only pass: internal
consistency (does `geo.html` say what `RESEARCH_1`–`5`/`BUILD_SPEC` say it should) plus an
external fact-check (has anything the docs relied on changed since they were written). No code
was changed to produce this — see "Recommended next steps" at the end for what to act on.

Method note: web search/fetch access starts in 2026, so "current" below means as of
2026-07-28, roughly seven weeks after `geo.html`'s last build-log entry (2026-06-06).

---

## Findings, ranked by severity

### 1. [INACCURATE — fix] The "Zacharias" scenario caption contradicts the file's own header

`geo.html`'s SCENARIOS array (`geo.html:2442-2446`) ships the Zacharias preset at
0.8°S/2°E (Gulf of Guinea, ~90.8°) but its user-facing caption says:

> "These coordinates could not be tied to any named source (the real @zachariaspro uses
> ECDO's 104°/Zambia figures), so it is labelled attribution-unverified."

The same file's own header — under "THINGS A FRESH SESSION TENDS TO GET WRONG" — already
states the corrected understanding:

> `geo.html:377-378`: *"'Zacharias model' = @zachariaspro / geosyncmonitor.com (observational;
> wobble-collapse -> TPW; pole near Gulf of Guinea ~0.8S/2E). It is NOT Zecharia Sitchin /
> Nibiru."*

And `RESEARCH_2_zacharias_ecdo_landscape.md` (finding #3) — the report that exists
specifically to resolve this — concludes the real Zacharias/GEOSYNC model's own published
pole (via Sunfellow's index of his posts and a screenshot of the live tool) *is*
0.8°S/2°E, and that this is a **different** location from ECDO's Zambia figure, not the same
one. So the in-app caption has it backwards: the coordinates are *not* unattributable, and
Zacharias does *not* use ECDO's numbers — that was the resolved uncertainty, and the header
knows it, but the caption text was never updated to match.

**Caveat carried forward honestly:** geosyncmonitor.com is a JS single-page app; I couldn't
render it directly (confirmed again this session — only the boot screen is fetchable), so the
coordinate attribution still rests on secondary sourcing (Sunfellow's aggregation + a
screenshot), not a primary-source citation. The fix is to say that plainly, not to claim
"unverified" when the file's own research already narrowed it down.

**Suggested fix (not applied):** reword `geo.html:2442-2446`'s `standingWord` and `caption` to
credit @zachariaspro/GEOSYNC directly, note the coordinates come from secondary aggregation
(not a primary-source fetch), and — since this is the one preset whose defining feature is
*methodology*, not a causal story — mention the Chandler-wobble-collapse observational basis
that distinguishes it from ECDO (see finding 3 below). Currently the caption only gives
coordinates and never explains what Zacharias's model actually claims to observe.

### 2. [COSMETIC — citation drift] Two different citation sets for the same mechanism

The `STANDING_INFO` tooltip registry and the "Model Caveats" disclosure panel grade the same
enhancements but cite different papers for two of them:

| Layer | `STANDING_INFO` tooltip (`geo.html:3849-3868`) | Model Caveats panel (`geo.html:1519-1536`) |
|---|---|---|
| Deglaciation→volcanism (E11) | "Jull & McKenzie 1996; Sigmundsson 2010" | "Huybers & Langmuir 2009; Maclennan 2002" |
| GIA rebound (E12) | "Stewart 2000; Wu 1999" | "Wood 1989; Arvidsson 1996" (Pärvie fault) |

Both citation sets are real, relevant papers on the same phenomena — this isn't a factual
error, just drift between two UI surfaces that are supposed to carry "single grading, two
surfaces" (the project's own stated rule at `geo.html:552-553`). A user who hovers the GUI
chip and then opens Model Caveats sees two different sources for the same claim with no
indication they're both valid anchors for the same number. Low severity; worth unifying to
the `RESEARCH_3` anchors (Huybers & Langmuir 2009, Maclennan 2002, Wood 1989/Arvidsson 1996 —
these are also what the header's E11/E12 build-log entries themselves cite) so the tooltip and
the panel agree.

### 3. [MISSED THEORY DETAIL — enhancement] Zacharias's actual method (wobble collapse) isn't represented

`RESEARCH_2`'s central point is that Zacharias is methodologically distinct from ECDO: he
argues from live IERS polar-motion data that the **Chandler wobble is collapsing**, and treats
that as a precursor signal for TPW — an observational/geodetic framework, not a causal story
like ECDO's core-mantle decoupling. None of that appears anywhere in `geo.html` — the
Zacharias preset is presented as bare coordinates with no mention of the wobble-collapse basis
that's the whole reason his model is a distinct thing worth including. Given the user's stated
goal — faithfully simulating what each theory's own author actually claims, not just
reproducing a number — this is the biggest gap between "what we researched" and "what got
built" for this preset specifically.

**External update relevant here:** I checked the current (2026) status of the Chandler wobble
claim itself. `RESEARCH_2`'s "genuine observational kernel" read still holds — IERS data
confirms the amplitude collapse first noted around 2015 is still described as anomalous in the
most recent literature (a May 2026 arXiv multifractal-analysis paper explicitly treats it as
a "genuine dynamical regime change," and a 2025 *Geophysical Research Letters* paper, Jeon et
al., is newer than anything in `RESEARCH_2`). **But** that GRL paper gives the collapse a
mundane mechanistic explanation — mass anomalies from the 2010–2011 La Niña event — which is
a mainstream counter-explanation to "this signals an impending pole shift" that isn't
currently surfaced anywhere in the sim's honesty layer. If the Zacharias preset caption gets
rewritten (finding 1), this is the natural place to add it: "the wobble collapse is real and
still holding as of 2026, but recent work (Jeon et al. 2025) ties it to a mundane 2010–2011
mass-redistribution event rather than an approaching TPW."

*Sources: [Diminished Chandler Wobble After 2015 — Jeon et al. 2025, GRL](https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/2025GL116191); [Multifractal Complexity of the Chandler Wobble, arXiv 2605.29056 (2026)](https://arxiv.org/abs/2605.29056).*

### 4. [INFORMATIONAL — new since the research docs] ECDO theory published a new formalization in 2026

The Ethical Skeptic released a book, *Inversion — ECDO Theory*, in April 2026, with a related
March 2026 post, and there's now a July 2026 explainer piece and (unreachable to me,
403'd) Grokipedia coverage. None of this existed when `RESEARCH_1`/`RESEARCH_2` were written.
I fetched the book-announcement page and the July explainer directly:

- **No coordinate or mechanism change** — the book "overlaps 99% with the website material,"
  per a commenter quoted on the announcement page. The 104°/14°S,31°E figure `geo.html` ships
  is still current.
- **New supporting-evidence claim not in the sim:** the book teases that cities above ~2,250 ft
  elevation show a statistical bias toward alignment with the hypothesized new pole (Np'). This
  is new *evidence* offered for the existing hypothesis, not a hypothesis change — worth noting
  as a potential future monument/myth-layer input (the project's `RESEARCH_1` §6 already
  scoped a "monuments as a message to the future" layer that was never built), not something
  that makes today's ECDO caption wrong.
- **Notable for context, not action:** the July 2026 piece quotes The Ethical Skeptic saying
  that as of June 2026, "six individuals or groups had attempted simulations to explore how
  Earth's mechanics might behave within an ECDO framework." `geo.html` is effectively a
  candidate seventh — this project is timely, not stale, relative to its own subject matter.

*Sources: [Inversion — ECDO Theory announcement](https://theethicalskeptic.com/2026/03/25/inversion-ecdo-theory-the-hidden-mechanism-driving-cataclysm-cultural-tradition-and-climate/); [Could Earth Suddenly Shift Into a Different Rotational State? (2026-07-15)](https://www.abovethenormnews.com/2026/07/15/ecdo-theory/); [ECDOview](https://www.ecdoview.com/).*

### 5. [CONFIRMED — no action] Everything else spot-checked against 2026 sources still holds

These were checked and found to still match what's in `geo.html`/the research docs — logged
so a future session doesn't re-spend the search budget re-checking them:

- **O'Malley 2018 vs. Parsons & Velasco 2011 (antipodal triggering, E9's "contested" badge).**
  No replication or rebuttal of either paper turned up from 2019–2026. The dispute the sim
  surfaces is still the live, unresolved state of the field.
- **Solar-seismic coupling (E13/E19, "contested-to-fringe").** A May 2025 MDPI *Entropy* paper
  ("Quantitative Assessment of the Trigger Effect of Proton Flux on Seismicity") reports proton
  flux accounting for up to ~28% of seismic triggering — this is almost certainly the
  Lyubushin & Rodionov 2025 paper the header already cites (23–28% figure matches almost
  exactly); it independently confirms the number rather than contradicting it.
- **Planet Nine.** Still undetected as of mid-2026; a new infrared candidate (Phan & Goto 2026)
  and the Vera C. Rubin Observatory's 2026 survey start are genuine new developments but don't
  change `RESEARCH_1`'s framing ("legitimate, undetected, actively searched"). Not
  load-bearing for the sim (E18's body is user-parametrized, not tied to Planet Nine
  specifically), so no fix needed — optional flavor-text update only.
- **ECDOview's own figures** (104°, 14°S/31°E, Zambia, "two rotational states") — confirmed
  directly from ecdoview.com's own description; matches `geo.html`'s ECDO preset exactly.
- **Three.js version pin (`geo.html:1619`, `three@0.161.0`).** `RESEARCH_4` (written with more
  current framework knowledge) recommends r180+. This is a locked decision
  (`geo.html:312`: "Pin the Three.js version in the importmap for reproducibility") and
  deliberate, not a bug — flagging only for completeness, no action implied.

---

## Recommended next steps (priority order, not yet done)

1. **Fix the Zacharias caption** (finding 1) — factual correction, small, high-visibility (it's
   in the SCENARIOS UI every user sees), and directly serves the user's stated "faithfully
   simulate what the theory's author claims" goal.
2. **Enrich the Zacharias caption with the wobble-collapse method + the 2025 counter-explanation**
   (findings 3) — same edit, same location, turns a bare-coordinates preset into one that
   actually represents what makes Zacharias's model different.
3. **Unify the E11/E12 citations** between `STANDING_INFO` and the Model Caveats panel
   (finding 2) — small, mechanical, low-risk cleanup.
4. **Real-browser QA pass with real assets unzipped** — out of scope for this pass but still
   the header's own top "REMAINING" item (`geo.html:1082-1085`): several recent features
   (driver sequence, photoreal Earth, day/night cycle, flood-over-photoreal blending) are
   flagged "NOT browser-run (CDN blocked)" and never visually verified, and `ALL.zip`'s real
   textures/terrain/plate-boundary data aren't currently unzipped beside `geo.html`, so it's
   running on placeholder data today.
5. **Performance work** — not evaluated this pass (deferred until after the above, since it
   only matters once the app is confirmed running with real assets).

None of the above have been applied to `geo.html`. Waiting on direction on which to take first.
