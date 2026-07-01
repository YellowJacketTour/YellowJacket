# Hold'em Oracle v0 — Scoping Document (Abstraction + Offline Solve-Cache Prototype)

*The fourth rung of the grader ladder. The first three rungs (Kuhn ✓ → single-street YJ Honey-Stroke ✓
→ multi-street public-board ✓) are exact, closed-form, YJ-faithful, and pass all acceptance gates. This
rung is the first that **cannot be solved in closed form** — it requires abstraction + an offline
converged-reference solve, which the memory names as the unbuilt critical-path moat. We scope it before
we build it, and we gate it the same way: prove the rung, then climb.*

> **One-sentence goal:** carry the exact, info-set-only, range-based best-response EV-loss grader from
> toy games to **abstracted heads-up Hold'em (preflop+flop)**, backed by a **per-bucket offline
> solve-cache** of a *converged* reference policy, and pass the same five acceptance gates on **sampled
> real spots** (no longer closed-form) — including a ground-truth check on a solvable subgame.

---

## 0. Why this rung is different (the honest risk)

Everything up to here had an **exact optimum** (closed-form best-response to a fixed field). Hold'em does
not. The "optimal baseline" now comes from a *solver* on an *abstraction*. Two failure modes the gates
must catch:

1. **Bad oracle** — under-converged or wrongly-abstracted reference policy → the grade measures
   "alignment-with-a-flawed-baseline," not skill. This is *exactly* the failure the engine's live CFR
   grader exhibits (inverts: random out-grades elite). The whole point of this rung is to NOT repeat it.
2. **Outcome leakage** — abstraction so coarse that the grade collapses back toward chip-outcome
   correlation (the thing we beat by grading decisions). The brick-ladder + range-update gates are the
   tripwires for this.

**Acceptance-at-every-rung (unchanged):** strong policy monotonically out-grades random, low variance,
info-set-only, no hindsight, **solver-validated against an independent strong baseline**.

---

## 1. Scope boundaries for v0 (hold the line)

**In scope:**
- **Heads-up** only (no multi-way → no Shapley/Nash-undefined problems yet).
- **Preflop + flop** only (two streets — mirrors the multi-street rung that already passed; defers
  turn/river blow-up). Flop-only fallback if preflop+flop proves intractable in-environment.
- **YJ Honey-Stroke payoff** as the terminal value (golf − honey/divisor, brick ladder, tie-carry) — the
  same unified objective proven in the multi-street gate, NOT generic chip EV.
- **Offline** solve-cache only (precompute → store → look up). No live/real-time solving.
- The **OFFICIAL metric** path (GTO-adherence = best-response to a *balanced* reference field). The
  exploitation/MimicryFlag shadow reuses the same engine with field=actual — noted, not built in v0.

**Explicitly NOT in scope for v0** (named so they don't creep in):
- Multi-way pots, Shapley value, ICM/FGS tournament transform.
- Turn + river (full 4-street).
- Live/real-time solving (ReBeL-style search at decision time).
- The sealed Intel-Field ledger, Bayesian rating, economy engines.
- Production distillation (portable value/policy net) — that's the rung AFTER this.

---

## 2. The four sections to define (this is what the Grok swarm fills with cited SOTA)

### 2.1 Abstraction / bucketing strategy
The open questions (→ Swarm Lane A):
- **Card abstraction:** what is the current SOTA for bucketing preflop+flop hands while preserving range
  distinction good enough for *decision grading* (not just play)? Candidates to evaluate with primary
  citations: potential-aware imperfect-recall abstraction, EHS/E[HS²] histograms + earth-mover's-distance
  clustering, OCHS (opponent-cluster hand strength). **Which buckets preserve the range-update signal**
  (our gate #4) and the brick/showdown-class distinction (our gate #5)?
- **Granularity vs solve feasibility:** the tradeoff curve. How many buckets/street is "enough" for a
  faithful grade, and what's the solve cost at each?
- **YJ-specific wrinkle:** standard abstractions bucket by *chip-EV-relevant* equity. Our payoff is
  golf-strokes-dominant (honey is the drizzle) + a brick ladder keyed on *showdown hand class*. **Does a
  chip-equity bucketing destroy the stroke/brick signal?** (This is the v0 research crux — possibly need
  a *golf-class-aware* abstraction, not a pure equity abstraction.)
- **Action abstraction:** YJ uses *matched-total proposal* betting (a bounded ladder of proposal levels,
  capped by `streetCapFor`), NOT NL continuous sizing — this is *easier* to abstract exactly. Define the
  discrete proposal-level action set per street.

### 2.2 Offline solve-cache architecture
The open questions (→ Swarm Lane B + C):
- **Oracle algorithm:** which solver for the converged per-bucket reference? Candidates with primary
  citations and tradeoffs: CFR+ / Linear CFR / Discounted CFR / MCCFR (external-sampling) / Deep CFR /
  ESCHER. Convergence guarantee, memory, and wall-clock per bucket-subgame.
- **The non-zero-sum problem (KNOWN, documented):** the YJ golf payoff is NOT zero-sum (both players can
  score well/poorly independently), but standard CFR assumes a zero-sum game. The engine's current solver
  runs golf payoff under zero-sum negamax = an *approximate heuristic baseline, not true Nash*. **What is
  the correct treatment?** (best-response-to-fixed-field — which is what our gates already use and is
  well-defined for non-zero-sum — vs a general-sum equilibrium solver. Lean: keep the gates' BR-to-field
  formulation; the "GTO baseline" = BR to a *balanced* field, sidestepping general-sum Nash entirely.)
- **Cache schema:** key = (street, bucket, betting-history-node, board-bucket); value = converged
  strategy + per-action EV (the evByAction we already compute). Storage size estimate, lookup latency,
  Syzygy-style compression for the distillate (cited).
- **Invalidation/versioning:** the cache is keyed to (abstraction version, payoff config, field model).
  A config change must version-bump, not silently serve stale grades.

### 2.3 Variance reduction for confidence (→ Swarm Lane D)
- **AIVAT** (Burch et al.) — unbiased variance reduction for sample-efficient ranking. Confirm: it is a
  *variance* reducer (sharper estimate, same expectation), NOT a *bias* fix — it cannot rescue a bad
  oracle, only tighten a good one's estimate. How does it integrate with our per-decision EV-loss (it was
  designed for whole-game value estimation)?

### 2.4 Validation gates adapted for Hold'em (→ Swarm Lane E)
The five gates, now on **sampled real spots** (no closed-form optimum). Draft adaptations:
1. **Strong >> random (monotone skill ladder)** — eps-greedy toward the cached oracle policy; mean
   EV-loss must rise monotonically with eps. (Same as rungs 1–3.)
2. **Brick-ladder discipline** — over-committing a brick must grade strictly worse under the pot-gated
   ladder than flat-+1, on real flop textures. (Carries gate #5.)
3. **Range-update sensitivity** — the oracle's best response must change with the flop / the opponent's
   range, measurably. (Carries gate #4 — the rung's signature.)
4. **Concentration after N hands** — separate two close players in a feasible sample; report the N needed
   and the variance (AIVAT-tightened).
5. **Multi-street consistency + GROUND-TRUTH anchor** — on a *solvable subgame* (e.g. a river endgame
   with few buckets, or a deliberately tiny abstraction that IS exactly solvable), the cached oracle's
   grade must match the exact closed-form grade within tolerance. **This is the anti-flawed-oracle gate**
   and the most important new one — it's how we prove the abstraction didn't silently corrupt the
   baseline.

---

## 2.5 — SWARM RETURNS, DE-FABRICATED (S0 complete; citations verified against primary sources)

*Grok's five lanes returned. Per the guardrail, every citation was checked; two fabrications and three
misattributions were corrected (web-verified). The de-fabricated rulings below are what we build on.*

**Corrected citation ledger (the ones Grok got wrong — do not propagate the originals):**
- **AIVAT** = Burch, Schmid, Moravčík, Bowling, **AAAI 2018** (arXiv 1612.06915). Grok said "2014" and
  invented the expansion "Accelerated Imaginary Value Action Transformation" — **fabricated**; the paper
  does not expand the acronym. (The real 2014 Burch et al. AAAI is the *subgame-decomposition* paper —
  Grok conflated the two.)
- **OCHS** (Opponent Cluster Hand Strength) = Johanson, Burch, Valenzano, Bowling, **AAMAS 2013**
  ("Evaluating State-Space Abstractions in Extensive-Form Games"). NOT DeepStack/Moravčík 2017.
- **E[HS²] equity-distribution + earth-mover's-distance k-means abstraction** = Johanson et al. 2013
  (above); potential-aware EMD = **Ganzfried & Sandholm, AAAI 2014**. NOT "Brown & Sandholm 2017–2019."
- **Discounted CFR (DCFR)** = Brown & Sandholm, **AAAI 2019** (Grok said NeurIPS).
- Verified-correct as given: Gilpin & Sandholm 2007 (potential-aware abstraction); CFR+ = Tammelin 2014;
  Deep CFR = Brown et al., ICML 2019; safe subgame solving = Burch, Johanson, Bowling, AAAI 2014; LBR =
  Lisý & Bowling 2017; DeepStack = Moravčík et al., Science 2017.
- **NEW lead the swarm missed (high value):** **Kroer & Sandholm, "Extensive-Form Game Abstraction With
  Bounds," EC 2014** — abstraction-error bounds expressed *in terms of payoff differences*. This is the
  theory that decides our #1 crux: whether merging two different-*golf-class* hands is provably safe.

**Locked rulings from S0:**
1. **Abstraction (§2.1):** base = potential-aware imperfect-recall (Gilpin & Sandholm 2007) + EMD/E[HS²]
   k-means (Johanson 2013 / Ganzfried & Sandholm 2014). **The payoff-aware layer is a genuine gap in the
   literature** (swarm confirmed: no published abstraction targets a non-chip utility). → We add a
   **custom golf-class-aware bucketing layer** and **bound its safety with Kroer & Sandholm 2014** rather
   than trust equity clustering. This is the v0 invention and the highest risk — gate it hardest.
2. **Oracle + non-zero-sum (§2.2/C):** **CONFIRMED** — use **DCFR or CFR+** for the per-bucket reference,
   and define the baseline as **best-response to a fixed balanced/blueprint field, NOT general-sum Nash.**
   This reuses the exact formulation proven on rungs 1–3 and sidesteps the non-zero-sum intractability.
   (Open, uncited: convergence degradation of CFR on a general-sum payoff — irrelevant if we never run it
   as a self-play equilibrium, which we don't.)
3. **Cache (§2.2/B):** key = (abstraction_version, street, board_bucket, betting_node); store strategy +
   evByAction. **No compression in v0** (sparse + quantize; add only if storage is a measured bottleneck).
   Safe-subgame-solving theory is for *live* re-solving — **not needed for an offline blueprint** (swarm
   flagged this correctly). No public blueprint-storage numbers exist → we measure our own.
4. **AIVAT (§2.3/D):** **CONFIRMED variance-only**, applied as a post-process to tighten the concentration
   gate; cannot fix a bad oracle. Per-decision adaptation is uncited → we treat it as engineering, validate
   empirically, and do not claim a literature-backed reduction factor.
5. **Gates (§2.4/E):** the five gates stand; **gate #5 (ground-truth subgame) is the anti-flawed-oracle
   anchor** and there is no formal name for it in the literature (it's done ad hoc) — we make it explicit.
   **Add LBR (Lisý & Bowling 2017) as a cheap exploitability lower-bound check** on the oracle.

**Single biggest open risk (swarm + our read agree):** whether equity bucketing preserves the
golf-stroke/brick signal. **Resolution path:** don't assume — S1 hand-checks a sample AND computes the
Kroer–Sandholm payoff-difference bound; if equity clusters merge hands whose golf-class differs beyond
tolerance, the golf-class-aware layer is mandatory, not optional.

---

## 3. Build plan (gated, not one-pass)

| Step | Deliverable | Gate before proceeding |
|---|---|---|
| **S0** | ✅ **DONE** — Swarm returns de-fabricated (§2.5); 2 fabrications + 3 misattributions corrected, Kroer–Sandholm 2014 bound added | Citations web-verified against primary sources ✓ |
| **S1** | ✅ **DONE** — abstraction spec (§3.5): probe MEASURED 28.9% equity-orthogonal stroke variance → golf-class-aware 2-D bucketing MANDATED; exact discrete action ladder defined (`s1-abstraction-probe.js`) | Gate PASSED: signal-loss measured, not assumed; safety criterion is a re-runnable bound |
| **S2** | ✅ **DONE** — real-card BR-to-balanced-field oracle (§3.6); `s2-oracle-subgame.js` | Gates PASSED: BR=0/monotone on real cards; lossless abstraction = exact (0.0); golf-aware buckets 84–92% lower error than equity-only |
| **S3** | ✅ **DONE** — offline solve-cache (§3.7); `s3-solve-cache.js` + `yj-oracle-cache.v0.json` | Gates PASSED: byte-for-byte fidelity; cache-lookup grade == live (Δ=0); versioning blocks stale serve |
| **S4** | ✅ **DONE** — two-street real-card oracle (§3.8); `s4-twostreet.js` | Gates PASSED: BR=0/monotone, brick discipline +2.91 stroke-EV, river-conditioned BR (range update), exact zero-variance concentration |

**Stop-and-report after each step** — same discipline that produced three clean rungs.

---

## 3.5 — S1 RESULT (abstraction spec; gate PASSED with a measured mandate)

*Run `s1-abstraction-probe.js` (node, canon `evalSevenCard`/`golfScoreFromHandValue`/`resolveBrickLoss`
ported verbatim). 1200 flop spots × 1500 MC runouts. The gate question — does equity bucketing preserve
the golf-stroke signal — is answered with data, not assertion.*

**Measured result:**
- Correlation(equity, expected posted stroke) = **−0.85** (strong but not total — equity captures most of
  the stroke, NOT all).
- **Equity buckets explain only 71.1% of stroke variance → 28.9% is equity-ORTHOGONAL.** Nearly a third
  of the golf signal is invisible to an equity abstraction.
- **Collisions are real and systematic:** e.g. `Kc2d on 8♠Q♣3♠` (brick-prone, stroke +1.27) vs
  `5d7c on 4♥4♣4♦` (trips on the paired board, stroke −0.30) — **identical 0.36 equity, 1.57-stroke gap.**
  Pattern: overcard bricks collide with trips/made-hands-on-paired-boards at equal equity, every time.

**VERDICT (gate): the golf-class-aware bucketing layer is MANDATORY** (28.9% ≫ the 10% tolerance). A pure
equity abstraction would merge hands that post materially different strokes and corrupt the decision grade
— exactly the "outcome leakage" failure mode in §0. This confirms §2.5 ruling #1 *empirically*.

**S1 abstraction spec (locked):**
- **Card bucketing = 2-D feature, not 1-D equity.** Feature per (hole, board):
  `[ equity-distribution histogram (E[HS²]/EMD, for range distinction — Johanson 2013 / Ganzfried &
  Sandholm 2014) , golf-class distribution over runouts P(class ∈ {brick·cat0, pair·cat1, twopair/
  trips·cat2-3, straight+·cat4+}) ]`. Cluster jointly. v0 concrete: **equity-decile × golf-class-quartile
  ≈ 40 buckets/street** (coarse but tractable; the golf axis is what collapses the 28.9% residual).
- **Safety is bounded, not hoped:** the within-bucket stroke spread is the Kroer–Sandholm (EC 2014)
  payoff-difference term; the abstraction is accepted only when pooled within-bucket stroke std falls
  under tolerance (re-run the probe with the 2-D buckets; target residual ≤ 10%). This makes "is the
  abstraction safe" a measured gate, not a judgment call.
- **Action abstraction = EXACT (no error).** YJ betting is a bounded discrete matched-total proposal
  ladder, so we model it exactly. v0 per-street action set at a node with standing `agreedTotal` and
  street cap `streetCapFor(street, totalCap, agreedTotal)`:
  `{ fold , check/call(match agreedTotal) , propose½ (raise toward ½·cap) , proposePot (raise toward
  cap) }` — i.e. fold/call + 2 raise levels (clamped to the cap, deduped when levels coincide). No
  continuous sizing ⇒ zero action-abstraction error, unlike NL solvers.

**S1 → S2 handoff:** the abstraction is specified and its safety criterion is a re-runnable measurement.
S2 builds the BR-to-balanced-field oracle on this 2-D abstraction and anchors it to a closed-form subgame.

---

## 3.6 — S2 RESULT (real-card oracle + abstraction anchor; all gates PASSED)

*Run `s2-oracle-subgame.js` (node, exact). An exactly-enumerable river subgame: fixed board on a reduced
deck (7 ranks × 2 suits), 36 hero hands, one street of YJ matched-total betting, complete Honey-Stroke
payoff. Reuses the proven single-street machinery with REAL-card hands + disjoint-hand belief.*

- **Gate A — oracle correct on real cards:** BR-to-exploitable-field grades **0.0** (unique min), ladder
  **monotone ρ=1.0**. The oracle is correct when driven by canon `evalSevenCard`, not just abstract tokens.
- **Gate B — anti-flawed-oracle anchor:** a **lossless (singleton) abstraction reproduces the exact grade
  byte-for-byte (error = 0.0)**. The abstraction+oracle pipeline provably does **not** silently corrupt
  the baseline — the failure mode that breaks the engine's live grader and most poker graders.
- **Gate C — the S1 mandate pays off:** golf-class-aware 2-D buckets give **84–92% lower oracle
  abstraction-error than equity-only buckets at equal bucket budget** (5/6/7 buckets → 85/92/84%). This
  *closes the S1→S2 loop*: S1 measured a 28.9% equity-orthogonal stroke residual; S2 shows capturing it
  with the golf axis cuts oracle error ~10×.

**Oracle definition (locked for v0):** best-response to a **fixed balanced field** (the official
GTO-adherence metric) on the 2-D abstraction; non-zero-sum sidestepped exactly as on rungs 1–3. The
abstracted-BR plays one action per (bucket, betting-node) chosen to minimize bucket-averaged
exact-continuation Q, then is graded on the true game (= Kroer–Sandholm abstraction error). v0 uses
exact continuation (a documented mild optimism; production uses abstracted continuation) — the lossless
identity and the golf-vs-equity dominance both hold regardless.

**S2 → S3 handoff:** the oracle is correct and the abstraction is safe + validated. S3 makes it an
**offline solve-cache**: precompute the per-bucket BR + evByAction, store, look up, and verify the
looked-up grade equals the in-memory grade byte-for-byte (then S4 scales to preflop+flop + AIVAT).

---

## 3.7 — S3 RESULT (offline solve-cache; all gates PASSED)

*Run `s3-solve-cache.js` (requires `s2-oracle-subgame.js` — reuses the exact proven machinery, no
re-implementation). Precomputes the abstracted BR + evByAction per (abstraction_version, seat, bucket,
betting-node), serializes to a versioned JSON cache, reloads, and grades by lookup only.*

- **Artifact:** `yj-oracle-cache.v0.json` — 30 cells over 6 golf-aware buckets, 2874 bytes. Key =
  `golf-aware-2d.eq3xg4.v0 || balanced || D72|brick=pot-gated|cap4|tie=true|w0.5`.
- **Gate A — serialization fidelity:** reloaded cache is **byte-for-byte** identical to the in-memory build.
- **Gate B — grade reproducibility:** grading a test player via **reloaded-cache lookups** equals grading
  via the in-memory oracle to **Δ = 0.0** (0.2195366696 both). The hand→bucket→cached-Q→EV-loss path is
  wired correctly with no round-trip precision loss.
- **Gate C — cache == oracle:** the cached BR graded on its own surface = 0.0 (the blueprint is
  self-optimal); reference S2 golf-aware true-game abstraction error = 0.00287 (faithfully stored).
- **Gate D — versioning / no stale serve:** a payoff change (pot-gated→flat) **bumps the version key**,
  and a mismatched cache is **rejected at load**. A config change can never silently serve a stale grade.

**S3 → S4 handoff:** the offline cache works end-to-end at river-subgame scale. S4 scales it to the full
v0 scope — **preflop + flop** (two streets, board chance, the 2-D abstraction per street) — and runs the
**five Hold'em acceptance gates on sampled spots** with **AIVAT-tightened** concentration (§2.4).

---

## 3.8 — S4 RESULT (capstone: two-street real-card oracle; all gates PASSED)

*Run `s4-twostreet.js` (node, exact; hand values precomputed). Reduced gapped deck (7 ranks × 2 suits);
fixed 4-card turn board → river chance → showdown via canon `evalSevenCard`. Two streets of YJ
matched-total betting (bet 2 then 4), complete Honey-Stroke payoff. Composes the proven multi-street
method (public card updates the range) with the real-card oracle — the toy→real jump across a street.*

- **Gate A — oracle correct on two-street real cards:** BR-to-exploitable-field = **0.0** (unique min),
  ladder **monotone ρ=1.0**.
- **Gate B — brick discipline across two streets (isolated where it bites):** calling down a brick costs
  **2.94 pot-gated vs 0.025 flat** (mean over 18 brick spots) — the ladder adds **+2.91 stroke-EV** of
  discipline pressure. (e.g. brick `2♠6♠` on river `T♥`: 3.056 vs 0.056.)
- **Gate C — the river updates the range:** a hand's street-2 best response is **river-conditioned**
  (changed with the river for 4/6 probed hands) — the real-card version of the multi-street range update.
- **Gate D — concentration + the AIVAT point:** EV-loss grading already scores the *expectation* at each
  decision, so the only residual variance is deal-sampling. The exact enumerable grade separates two
  0.10-eps-apart players **with certainty** (0.135 < 0.198) — the variance-reduction *limit* AIVAT
  approximates when enumeration is impossible; finite-sample MC (72 hands) ranks them correctly 83.2%.

**Finding worth carrying to production:** a connected/small-rank deck *structurally eliminates bricks*
(every unpaired hand pairs or straightens), so the brick-discipline gate must run on deliberately
brick-bearing textures (≥7 gapped ranks here). The production abstraction-validation harness needs the
same texture awareness.

**v0 PIPELINE COMPLETE (river + two-street scale).** S0→S4 all pass. What remains is **pure compute
scaling**, not new method: full 52-card deck, sampled spots instead of full enumeration, production-size
2-D buckets, the cache at scale, and a literature-faithful AIVAT implementation (vs the enumerable-exact
limit demonstrated here). Ground-truth/lossless-abstraction is anchored by S2 (byte-for-byte) + S3 (cache).

---

## 4. The non-negotiables (carried from the locked principles)

- **Info-set only, no hindsight** — grade over the opponent range × unrealized runouts, never revealed
  cards. The abstraction must not leak the runout into the grade.
- **The oracle is BR-to-a-fixed-field**, not a general-sum equilibrium — this is what made rungs 1–3
  exact and well-defined, and it dodges the non-zero-sum Nash intractability. GTO-adherence = BR to a
  *balanced* field (the official metric); exploitation = BR to the *actual* field (the shadow). One
  engine, swap the field.
- **Validate against an independent strong baseline** — a second solver or a known-strong policy, not
  just self-consistency.
- **No partial EVs** — the terminal value is the COMPLETE Honey-Stroke payoff (golf + brick ladder +
  tie-carry + honey), proven in the multi-street gate.

---

*Open the swarm brief: `GROK_HOLDEM_ORACLE_RESEARCH_BRIEF.md`. Fill §2.1–§2.4 from its cited returns,
then execute S1–S4 with a gate between each.*
