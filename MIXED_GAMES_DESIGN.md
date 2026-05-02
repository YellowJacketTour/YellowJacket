<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", and the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) are trademarks of
  Blank Canvas, Inc. The variant designs, scoring schemas, and calibration
  methodologies described herein are proprietary. This document is a
  confidential internal specification; do not redistribute without an
  executed NDA.
-->

# Mixed-Games Extension to the Yellow Jacket Tour
## Design Specification, Calibration Plan, and Open-Questions Register

**Document version:** 0.2 (pre-implementation draft, audit-revised)
**Build target:** YJT v70 (extension of v69.25)
**Status:** Design specification only. No code in `index.html` is changed by this document. The PLO module described in Part II is implementation-ready; lowball variants in Part III are framework-only and require evaluator development.

**Audience:** Engineering reviewers, poker subject-matter experts (cash game and tournament professionals), academic reviewers of skill-vs-luck systems, and actuarial reviewers of variance compression and calibration claims.

**Changes from v0.1 (audit-revised):**
1. §10 — Schemas A and B replaced with a single Hybrid Schema C (percentile-aligned buckets with conventional labels).
2. §14 — Lowball Bogey-Loss compatibility resolved with an Adaptive percentile rule (70th-percentile cutoff, parameterised) rather than two open design options.
3. §7 and §18 — Calibration bands tightened, with bootstrap 95% CI requirements and explicit upper as well as lower rejection thresholds.
4. §20 — New section: Variant Calibration Mode as a first-class simulator feature for per-variant parameter sweeps.
5. Appendix C — Restructured into Tier 1 (established) and Tier 2 (measured but unverified) frequency tables, with measured 1M-hand Monte Carlo numbers and explicit verification status per row.

---

## Abstract

The Yellow Jacket Tour (YJ) is a single-file browser-based hybrid of heads-up Texas Hold'em and tournament golf, built on a scoring law called Honey-Stroke. Each hand of poker becomes one hole on a golf scorecard via two parallel layers: (1) a bounded per-hole golf score derived from the showdown hand class, range −5 to +2; and (2) a per-hole honey pot whose net imbalance is divided by a round-length divisor and subtracted from the scorecard. The scoring law and its calibration are described in `RULES.md` and `README.md`; the audit suite confirming skill expression metrics (Spearman rank correlation between authored skill and empirical performance ≈ 0.49 at v69.24, see audit data Run_1_Y1_Y100) is shipped alongside the build.

This document specifies how to extend the YJ engine to support mixed-poker variants — Pot-Limit Omaha, 7-Card Stud, Razz, 2-7 Triple Draw, Badugi, Big O — while preserving (or, where preservation is not possible, transparently re-calibrating) the audit metrics that establish skill expression.

The document treats engine reuse as **necessary but not sufficient.** Each new variant requires its own evaluator and may require its own calibration. Predictions about post-extension skill metrics are presented as falsifiable hypotheses, not claims; the audit suite is what determines whether each variant ships.

---

## Table of Contents

- [Part I — Foundation](#part-i--foundation)
  - [1. Invariants Inherited from v69.25](#1-invariants-inherited-from-v6925)
  - [2. Distinction Between Engine Reuse and Calibration Transfer](#2-distinction-between-engine-reuse-and-calibration-transfer)
- [Part II — Pot-Limit Omaha (Production-Ready Specification)](#part-ii--pot-limit-omaha-production-ready-specification)
  - [3. PLO Rules](#3-plo-rules)
  - [4. PLO Evaluator Specification](#4-plo-evaluator-specification)
  - [5. PLO Equity-Distribution Considerations](#5-plo-equity-distribution-considerations)
  - [6. PLO Scoring Map (Reused Without Modification)](#6-plo-scoring-map-reused-without-modification)
  - [7. PLO Calibration Hypotheses](#7-plo-calibration-hypotheses)
  - [8. PLO Implementation Plan and Line Estimate](#8-plo-implementation-plan-and-line-estimate)
- [Part III — Lowball Framework (Specification, Not Yet Implementation-Ready)](#part-iii--lowball-framework-specification-not-yet-implementation-ready)
  - [9. The Continuous-Strength Problem](#9-the-continuous-strength-problem)
  - [10. Lowball-to-Scorecard Mapping Schemas](#10-lowball-to-scorecard-mapping-schemas)
  - [11. Variant: Razz (7-Card Stud Low, A-5)](#11-variant-razz-7-card-stud-low-a-5)
  - [12. Variant: 2-7 Triple Draw](#12-variant-2-7-triple-draw)
  - [13. Variant: Badugi](#13-variant-badugi)
  - [14. Bogey-Loss Compatibility with Continuous Strength](#14-bogey-loss-compatibility-with-continuous-strength)
- [Part IV — Split-Pot Variants](#part-iv--split-pot-variants)
  - [15. Big O (5-Card Omaha Hi-Lo)](#15-big-o-5-card-omaha-hi-lo)
  - [16. Stud Hi-Lo (8-or-Better)](#16-stud-hi-lo-8-or-better)
- [Part V — Calibration Methodology](#part-v--calibration-methodology)
  - [17. Audit Suite per Variant](#17-audit-suite-per-variant)
  - [18. Acceptance Criteria](#18-acceptance-criteria)
  - [19. Pre-Calibration Analytical Work](#19-pre-calibration-analytical-work)
  - [20. Variant Calibration Mode](#20-variant-calibration-mode)
- [Part VI — Risk Register and Open Questions](#part-vi--risk-register-and-open-questions)
- [Part VII — Implementation Phasing](#part-vii--implementation-phasing)
- [Appendices](#appendices)
  - [A. Pseudocode: PLO Evaluator](#a-pseudocode-plo-evaluator)
  - [B. Pseudocode: Generic Lowball-Bucket Mapper](#b-pseudocode-generic-lowball-bucket-mapper)
  - [C. Reference Frequencies](#c-reference-frequencies)
  - [D. Glossary](#d-glossary)
  - [E. References](#e-references)

---

# Part I — Foundation

## 1. Invariants Inherited from v69.25

The following YJ engine components are **invariants** that the mixed-games extension does not modify:

1. **Per-hole golf scorecard** with hand-class buckets in the integer range [−5, +2]. The 16-row mapping (including premium-kicker buckets) is defined in `RULES.md` §7. This mapping is preserved unchanged for all high-only variants (Hold'em, PLO, 7-Card Stud, Big O Hi side, Short Deck).

2. **Honey wagering primitive** in tournament events: agreed-total scalar proposals with progressive 25 / 50 / 75 / 100% street unlock against per-event stroke caps. Cash tables use matched-contribution wagering.

3. **Round-length divisor table** {1, 4, 9, 36} for round lengths {1, 9, 18, 72} holes. Net honey divided by divisor exactly once at round end, subtracted from cumulative scorecard.

4. **Carry-forward on tied showdowns** at the per-hand level. The full honey pot rolls to the next hole's mandatory opener.

5. **Dual scoring variants**: Yellow Jacket (decisive-showdown loser posts +1 bogey, fixed) and Bumblebee (decisive-showdown loser posts their own hand's golf score). Folds and ties resolve identically in both variants.

6. **Tournament structure**: aggregate stroke play (default) or bracket knockout (alternative), with cushion + cut elimination, satellite ladder, exemption windows. Multi-way table support (4 / 6 / 9 players) in early rounds, collapsing to heads-up final.

7. **Audit suite**: a fixed battery of metrics — skillSpearman, skillEVSpearman_nonMain, authoredVsMeasuredSkill, tier ROI separation (all-events and ex-Main), finalsSkillEdge per event type, champion-score percentile distribution, equity-bucket fold-rate distribution, true fold cost histogram, bluff-read suppression by readingDepth — measured against a 1,000-player pool over 100 simulated seasons.

## 2. Distinction Between Engine Reuse and Calibration Transfer

A common error in extending scoring systems across variants is conflating two different forms of preservation:

- **Engine reuse**: the same code paths handle the new variant (same scorecard mapping, same divisor, same wagering primitives, same audit suite).
- **Calibration transfer**: the audit metrics measured on the new variant produce values comparable to the original variant.

Engine reuse is a **necessary** condition for calibration transfer but is not sufficient.

YJ's audit metrics — particularly skillSpearman and tier ROI separation — depend on:

(a) the distribution of hand-class outcomes at showdown,
(b) the equity distribution across decisions (how often is the leading hand a heavy favorite vs a small favorite),
(c) the variance contributed by the honey-pot layer relative to the scorecard layer,
(d) the AI's threshold-coupled honey-EV decision logic, with optima that were derived against Hold'em equity distributions.

Each of these properties is **variant-dependent.** PLO has a flatter equity distribution than Hold'em; Razz has a different hand-class distribution; Stud has different street structure (5 streets vs 4) and information asymmetry (visible up-cards). These differences propagate through the audit metrics.

Therefore, this specification treats each new variant as a **research project requiring its own audit cycle**, not as a drop-in extension. Predictions about post-extension metrics are stated as hypotheses to be tested, not as derived results.

---

# Part II — Pot-Limit Omaha (Production-Ready Specification)

## 3. PLO Rules

PLO uses the same five community streets as Hold'em (Tea Box / Drive / Hazard / Putt / The Cup, internally `preflop` / `flop` / `turn` / `river` / `showdown`). The two rules that differ from Hold'em:

**Rule P1 (Hole Card Count).** Each player is dealt **four** hole cards (vs two in Hold'em).

**Rule P2 (Use-Exactly-2 Constraint).** At showdown, the best 5-card hand a player makes must consist of **exactly two** of their four hole cards plus **exactly three** of the five board cards. This constraint applies regardless of board strength.

The use-exactly-2 constraint is the rule most often misimplemented in non-poker engines that bolt PLO on top of a Hold'em base. It is responsible for the vast majority of engine-correctness failures when adding PLO.

**Worked counterexample showing why the constraint matters.** Suppose the board is `A♣ K♣ Q♣ J♣ 10♣` (a Royal Flush sitting fully on the board).

| Variant | Hole cards | Best legal 5-card hand | Hand class |
|---------|-----------|-----------------------|------------|
| Hold'em | `2♥ 3♥` | Use 0 hole, 5 board → A-K-Q-J-T of clubs | Royal Flush (−5) |
| PLO     | `2♥ 3♥` | Must use exactly 2 hole and 3 board → e.g. 2♥3♥ + AKQ board → A-high | High Card (+1 or +2) |

Same hole cards, same board, different game, **opposite** scorecard outcome.

**Wagering structure.** PLO is conventionally Pot-Limit (max bet equals the current pot). In tour events, YJ wagering uses agreed-total semantics with stroke caps; the "pot-limit" structure does not apply because YJ wagering is not based on pot size. In cash tables, PLO wagering is matched-contribution, and the Pot-Limit rule (max bet = current pot size) applies and constrains the bet sizing UI. This must be enforced per-action, not just at submission time, because pot sizes change as the betting round progresses.

**Multi-way support.** PLO is conventionally played 6-handed at cash and up to 9-handed in tournaments. The YJ multi-way engine (matched-contribution wagering) handles this without modification.

## 4. PLO Evaluator Specification

The PLO evaluator must take a 4-card hole and a 5-card board and return the best 5-card hand reachable under the use-exactly-2 constraint.

**Approach.** Enumerate all legal (hole-pair, board-triple) combinations:

```
number of (hole-pair) options    = C(4, 2) = 6
number of (board-triple) options = C(5, 3) = 10
total combinations to evaluate   = 6 × 10  = 60
```

For each of the 60 combinations, evaluate the resulting 5-card hand using a 5-card hand evaluator. Take the maximum.

**Reuse of existing primitives.** YJ's existing `evaluate7(a, b)` (in `index.html` near line 2900) is a 7-card high evaluator that finds the best 5-card hand from any combination of the 7 input cards. It cannot be used directly for PLO because it does not enforce the use-exactly-2 constraint. However, the *category-extraction logic* inside `evaluate7` (rank counts, suit counts, straight detection, packed-int output format) is reusable by a sibling 5-card evaluator.

**New primitive required**: `evaluate5(card1, card2, card3, card4, card5)` returning a packed integer in the same format as `evaluate7` (`(cat << 24) | (k1 << 20) | ... | (k5 << 4)`). This is a simpler function than `evaluate7` because it does not need to enumerate sub-combinations — it just classifies a fixed 5-card hand. Pseudocode is given in Appendix A.

**Performance.** Each PLO showdown requires 60 calls to `evaluate5`. Compared to Hold'em's one call to `evaluate7` per showdown, this is ~60× more evaluator work per showdown. At 100,000-event simulation scale this is non-trivial but tractable. Three optimizations are available if needed:

1. **Pre-compute board-triple values once per board state.** The 10 board triples are constant within a hand once the board is dealt; their hand-strength contribution can be cached.
2. **Use a flop-board ranking precomputation.** When the board is fixed, a 4-hole evaluator becomes "evaluate the best 5 from 4 hole + (one of 10 fixed board triples)" — a 6-combination enumeration over the hole pairs.
3. **Hand-class bucketing.** For audit purposes (frequency tables) the per-hand category is sufficient; the full kicker evaluation is needed only for cross-player comparison at decisive showdowns.

For the v70 first pass we recommend the unoptimized enumeration. Profile and optimize only if simulator throughput drops below the v69.25 baseline (~2,500 events/sec on reference hardware).

## 5. PLO Equity-Distribution Considerations

PLO's equity distribution is structurally flatter than Hold'em's. This is well-established in the poker literature; see Chen & Ankenman, *The Mathematics of Poker* (2006), chapter on Pot-Limit Omaha equity. Key observations:

- **Best preflop hand vs random.** In Hold'em, AA is approximately 85% favorite vs a random hand. In PLO, the best starting hand (typically AAKKds — double-suited aces with king blockers) is approximately 67% favorite vs a random hand.
- **Postflop equity compression.** With four hole cards each, both players have many redraw possibilities. The variance of equity-on-the-flop given equity-on-preflop is lower than in Hold'em.
- **Distribution skew toward strong made hands.** Because each player evaluates the best 5 of 60 combinations, made hands at showdown are dramatically more common in PLO than Hold'em.

This last point has direct consequences for the YJ scoring mapping.

**Hypothesized hand-class frequency shift at showdown** (estimates only; require Monte Carlo verification):

| Hand class | Hold'em (random 7-card) | PLO (best of 60 from 4-hole + 5-board) |
|------------|-------------------------|----------------------------------------|
| High card | 17.4% | <0.5% |
| One pair  | 43.0% | ~7% |
| Two pair  | 23.5% | ~28% |
| Three of a kind | 4.83% | ~12% |
| Straight  | 4.62% | ~25% |
| Flush     | 3.03% | ~14% |
| Full house | 2.60% | ~12% |
| Four of a kind | 0.168% | ~0.4% |
| Straight flush | 0.031% | ~0.18% |

**Hold'em values** are standard; see e.g. Sklansky, *The Theory of Poker* (1987) Appendix.
**PLO values** are estimates from informal analysis and require Monte Carlo verification before use in calibration.

The distributional shift means:

- The **modal showdown** in PLO is a **Straight** (golf score −1 or −2 with premium-kicker), versus **One Pair** (golf score 0 or +1) in Hold'em.
- The mean per-hole golf score at showdown shifts approximately **−1 stroke lower** in PLO vs Hold'em.
- Champion 72-hole scores will plausibly shift **−10 to −15 strokes** lower in PLO events vs equivalent Hold'em events. This is golf-realistic for PLO (analogous to a different course playing easier than another).

**These are predictions, not measurements.** They must be confirmed empirically before claims based on them are made.

## 6. PLO Scoring Map (Reused Without Modification)

The 16-row scorecard from `RULES.md` §7 applies to PLO unchanged. PLO is high-only; the existing premium-kicker buckets (J+ trips for full house, T-high+ for flush, etc.) are well-defined for PLO showdown hands.

The hand-class distribution shift discussed in §5 will redistribute mass across the existing buckets — more weight on negative scores (−1 through −5), less on the modal Pair/Two Pair (0, +1) — but no bucket is undefined and no new bucket is needed.

**Therefore the scoring map is invariant for PLO.** The only changes required are at the evaluator level (use-exactly-2 constraint) and the deal flow (4 hole cards instead of 2).

## 7. PLO Calibration Hypotheses

The audit suite must be re-run on PLO. The following are **falsifiable predictions** to be tested, not claims:

| Metric | Hold'em baseline (v69.24, 1k pool, 100 seasons) | PLO hypothesis | Concern if violated |
|--------|------------------------------------------------|----------------|---------------------|
| skillSpearman | 0.4872 | 0.42 – 0.52 | Below 0.42 → skill compression; below 0.35 → reject PLO calibration |
| skillEVSpearman_nonMain | 0.0356 | 0.03 – 0.08 | Negative or near-zero → AI optima don't transfer |
| authoredVsMeasuredSkill | +0.0443 | +0.02 – +0.10 | Negative or > +0.15 → calibration inversion or over-correction |
| Elite ROI vs Bottom ROI separation (all-events) | 12.5pp | 8pp – 18pp | <8pp → ROI signal weak; >18pp → tier overfit |
| Champion score (Major) | mean +5.76 | mean −8 to −13 | Outside band → equity hypothesis violated; investigate evaluator |
| belowParRate (Major) | 24.1% | 65% – 85% | <60% → champions not capitalising on equity edge |
| ITM rate | 13.6% | 13% – 16% | Should be invariant under payout structure unchanged |

The bands above are tighter than v0.1's exploratory bounds. They reflect the smaller measurement uncertainty achievable with 100-season runs (1k pool) and bootstrap 95% confidence intervals on the audit metrics; rejection thresholds are set at roughly 2σ deviations from the band centres rather than at qualitative cliffs.

**The shape of these hypotheses matters as much as the numbers.** If PLO reproduces all the *qualitative* signatures of YJ skill expression (positive Spearman, positive authoredVsMeasured, monotone tier ROI ordering with Elite > Bottom) at *quantitatively* different absolute levels, the variant is shipping-viable and the absolute levels just establish PLO's own benchmark band. If any *qualitative* signature inverts (e.g., authoredVsMeasured goes negative), the variant requires redesign, not just re-tuning.

## 8. PLO Implementation Plan and Line Estimate

**Phase 1: Evaluator and core engine.** Approximately 350–450 lines.

| Task | LOC estimate |
|------|--------------|
| `evaluate5(c1...c5)` 5-card evaluator returning packed int | 80–120 |
| `evaluatePLO(hole4, board5)` enumerating 60 combinations | 30–50 |
| Wire PLO evaluator into `playHole`-equivalent for community-card games | 40–60 |
| Update deal flow (4 hole cards instead of 2; hole-card count is variant-parameterized) | 30–50 |
| Variant flag plumbing through gameContext and AI decision kernel | 40–60 |
| Update equity estimation (`estimateStrengthAware`) for PLO equity distribution | 80–100 |
| Hole-card UI (4 cards instead of 2) for cash + tour render paths | 40–60 |

**Phase 2: Audit and calibration.** Approximately 100–200 lines, plus run-time.

| Task | LOC / time estimate |
|------|---------------------|
| Add PLO frequency-table generator to audit | 40–60 lines |
| PLO-specific equity bucket actions (reuse existing) | 0 lines |
| Run baseline 100-season simulation (PLO Hold'em-replicating profile optima) | ~30 minutes wall-clock |
| Iterate AI threshold optima if Hypotheses (§7) are violated | 1–3 days |
| Acceptance audit run with frozen optima | 100-season run |

**Phase 3: Cash and UI integration.** Approximately 200–300 lines.

| Task | LOC estimate |
|------|--------------|
| `Pure PLO` cash variant in lobby | 50–80 |
| `YJ PLO Stroke` and `Bumblebee PLO Stroke` cash variants | 80–120 |
| Pot-Limit max-bet enforcement at action panel | 40–60 |
| Tab strip and rendering updates | 30–60 |

**Total estimate: 650–950 lines, plus 1–4 days of calibration iteration depending on whether the Hypotheses §7 hold first-pass or require AI re-tuning.**

This is a single sprint of work for one engineer, plus calibration time. It is approximately 4–6× larger than the original Grok proposal claimed and approximately one-tenth the size of a from-scratch poker engine.

---

# Part III — Lowball Framework (Specification, Not Yet Implementation-Ready)

This part specifies the design framework for lowball variants but does not provide ship-ready evaluator pseudocode. Lowball evaluators are mature, documented in standard poker references, and not the design risk; the design risk is the **scorecard mapping**.

## 9. The Continuous-Strength Problem

YJ's −5..+2 scorecard mapping is built around Hold'em's 9 hand-class categories with premium-kicker sub-buckets. These categories partition the space of high-hand outcomes into a fixed 16-row table.

Lowball games do not have analogous fixed categories.

**Razz example.** Razz hands are ranked by listing the 5 lowest cards in descending order and comparing card-by-card. So `8-6-4-3-2` (an "8-low") beats `8-6-5-3-2`, which beats `8-7-2-A-3` (an "8-7"), which beats any 9-low. The hand-strength axis is **continuous**, not categorical: every distinct 5-card subset of {A, 2, 3, 4, 5, 6, 7, 8, T, J, Q, K} (treating A as low) produces a unique strength rank.

**2-7 Triple Draw example.** Same continuous structure but with the additional rule that A is high and straights/flushes count against the holder. The best hand (`7-5-4-3-2` unsuited) is followed by `7-6-4-3-2`, `7-6-5-3-2`, `7-6-5-4-2`, then 8-lows, etc.

**Badugi example.** Hand strength has a *categorical* component (number of distinct-suit cards: 4-card > 3-card > 2-card > 1-card) and a *continuous* component within each category (card values from low to high). Closer to YJ's scorecard structure but still requires a category-to-score mapping.

The design challenge: define a finite scorecard mapping that approximately preserves the −5..+2 range and produces a hand-class frequency distribution that is similar enough to Hold'em that YJ's variance compression mechanisms (bounded scoring + divisor) continue to work as expected.

## 10. Lowball-to-Scorecard Mapping (Hybrid Schema C)

Earlier drafts proposed two alternatives — Schema A (categorical high-card bucketing) and Schema B (empirical quantile bucketing). Schema A had information loss within each bucket; Schema B preserved variance compression but produced labels that meant nothing to variant players ("you posted −2 because you're in the 22nd percentile" is not how a Razz player thinks). Hybrid **Schema C** combines the strengths of both.

### Construction

Schema C is built in three steps per variant:

1. **Compute the empirical CDF.** Run a Monte Carlo of N ≥ 1,000,000 random hands in the variant under the variant's evaluation rules. Sort by true lowball strength. This produces a strength-percentile mapping.

2. **Define percentile buckets that align with conventional hand-class boundaries.** Pick 8 percentile breakpoints (matching the [−5..+2] scorecard range) chosen so each bucket boundary lies near a natural hand-class transition (e.g., the boundary between 7-low and 8-low in Razz typically falls near the 20th–25th percentile mark). The boundaries land where a category change happens; the inside of each bucket retains the strength gradient.

3. **Label each bucket with the conventional name that dominates within it.** Players see "your 8-low scored a −2" rather than "your hand is in the 22nd percentile." If a percentile bucket spans more than one conventional class, choose the modal class as the displayed label and accept that some hands of an adjacent class will round into it.

### Razz mapping (Schema C, illustrative — actual percentile breakpoints to be set from Monte Carlo)

| Score | Bucket label | Approximate percentile range | Typical hand description |
|------:|--------------|------------------------------|--------------------------|
|   −5  | Wheel        | top 0.5%                     | A-2-3-4-5 (the nuts)     |
|   −4  | Strong 6-low | 0.5%–5%                      | 6-x-x-x-x with low secondaries |
|   −3  | 7-low        | 5%–15%                       | typical 7-low             |
|   −2  | 8-low (strong)| 15%–30%                     | strong 8-low; weak 7-low boundary |
|   −1  | 8-low (weak) / 9-low (strong) | 30%–50% | mid-strength low          |
|    0  | 9-low / T-low | 50%–70%                     | mediocre low              |
|   +1  | J-low        | 70%–90%                      | weak low                  |
|   +2  | Q-or-worse   | bottom 10%                   | failed low                |

The labels are *typical* descriptions; an exceptional 8-low might score −3 (typically a 7-low's bucket) if its secondary cards rank in the upper part of the 5%–15% percentile band. This gives players the resolution that Schema A erased while keeping the language familiar.

### 2-7 Triple Draw and Badugi

Same construction. Boundary labels are variant-specific:
- **2-7 Triple Draw** uses A-high lowball with straights and flushes penalized; conventional labels are "7-low" (the nuts: 7-5-4-3-2 unsuited), "8-low," etc., down to "K-low" or "A-low."
- **Badugi** has both a categorical dimension (4-card / 3-card / 2-card / 1-card badugi) and a continuous dimension within each category. Schema C buckets are constructed primarily on category (4-card badugi dominates the top half; 3-card and below dominate the lower half) with secondary refinement on high card within category.

Per-variant percentile breakpoint tables are precomputed once (during evaluator development) and stored as 8-entry lookup tables. Cost: ~30 LOC per variant plus one Monte Carlo run.

### Trade-offs and rationale

- ✓ **Preserves variance compression.** Score distribution by construction matches Hold'em's quantiles, so the existing divisor and audit framework apply unchanged.
- ✓ **Player-recognizable labels.** Variant players see familiar terminology ("8-low," "wheel-Badugi") rather than raw percentiles.
- ✓ **Resolves the Schema A information-loss problem.** A strong 8-low (8-6-4-3-2) and a weak 8-low (8-7-6-5-4) can fall into different scorecard buckets if their percentile difference crosses a boundary.
- ✓ **Single rule applied uniformly across variants** — Schema C is the same construction for Razz, 2-7 Triple Draw, Badugi, and Big O's Lo half.
- ✗ **Requires per-variant Monte Carlo precomputation** (one-time cost during evaluator development).
- ✗ **Bucket boundaries can shift with population playstyle** in draw games (e.g., 2-7 Triple Draw quantiles depend on whether the population draws aggressively or stands pat). The recommended mitigation is computing boundaries from a balanced-strategy population, then locking them; population drift is an audit-suite concern, not a per-hand concern.

Generic pseudocode for the Schema C bucket mapper is given in Appendix B.

## 11. Variant: Razz (7-Card Stud Low, A-5)

**Rules.** Each player is dealt 7 cards (3 down, 4 up) over 5 betting rounds (3rd street through 7th street). Best 5-card low hand wins, with A=1 and no penalty for straights or flushes. The wheel A-2-3-4-5 is the nuts.

**Bring-in mechanic.** The player with the highest face-up card on 3rd street is forced to "bring in" (a forced bet equal to half of the small bet). YJ's mandatory-pot mechanism (currently 2 honey at front-9, 4 honey at back-9 in 18-hole rounds) needs to be replaced with a Razz-style bring-in for tour events. This is a non-trivial design decision: the YJ honey pot and the Razz bring-in serve similar structural purposes but use different mechanics.

**Multi-way default.** Razz is conventionally played 8-handed in card rooms. The YJ multi-way engine supports up to 9 (with bumblebee defaults). A Stud-family table size of 8 should be added to the table-size dropdown.

**Evaluator.** A Razz evaluator must rank 7-card hands by their best 5-card low. Standard implementation: enumerate C(7,5) = 21 combinations, evaluate each under A-5 ranking (no straights/flushes), take the minimum. Existing 5-card evaluators with an A-5 mode are available in the public domain (e.g., the Cactus Kev 5-card evaluator with a low-hand variant).

**Scorecard mapping**: Schema C (§10), Razz table.

## 12. Variant: 2-7 Triple Draw

**Rules.** Each player is dealt 5 cards. There are 4 betting rounds and 3 draws (between rounds 1-2, 2-3, 3-4). Best 5-card 2-7 low hand wins, with A=high and straights/flushes counting against the holder.

**No bring-in; uses blinds.** 2-7 Triple Draw uses standard blind structure (small blind / big blind), more aligned with Hold'em / PLO than Stud.

**Evaluator.** 5-card 2-7 evaluator: rank as 5-card high hand using standard ranks (A=high), then invert. Hands with a straight, flush, or pair are penalized to be worse than any unpaired non-straight non-flush hand. The best hand is `7-5-4-3-2` unsuited.

**Scorecard mapping**: Schema C (§10), 2-7 table.

**Draw mechanics.** Each draw is a discrete decision (how many cards to discard). The YJ wagering primitive (agreed-total in tour, matched-contribution in cash) handles the betting rounds; the draws are interspersed and add a new UI element (draw selection panel). Draws do not affect honey pot dynamics.

## 13. Variant: Badugi

**Rules.** Each player is dealt 4 cards. There are 4 betting rounds and 3 draws. Best 4-card hand with all distinct suits wins, ranked by lowest cards (A=1).

**Hand structure.** A "badugi" requires all 4 cards to have distinct suits. If a player has any two cards of the same suit, only the lowest of the two counts toward their final hand. So `A♠ 2♠ 3♣ 4♥` evaluates as a 3-card badugi (`A♠ 3♣ 4♥`, with the `2♠` discarded for suit-collision with `A♠`). The wheel-badugi is `A-2-3-4` of four distinct suits.

**Evaluator.** Badugi evaluator: enumerate all subsets of the 4 cards that form a badugi (including 1-, 2-, 3-, and 4-card badugis), pick the best by category-then-rank.

**Scorecard mapping**: Schema C (§10), Badugi table. The Badugi table is the only proposed lowball mapping that uses the categorical hand-strength dimension natively.

## 14. Bogey-Loss Compatibility with Continuous Strength

The Yellow Jacket variant's Bogey-Loss rule (decisive-showdown loser posts +1 bogey, fixed) was calibrated for Hold'em's 16-bucket categorical hand-strength distribution. It serves to align showdown-loss cost with fold-loss cost (both are +1 bogey), creating the equity-cost structure that drives YJ's "fold tighter than poker, call wider than poker" strategic profile.

In continuous-strength lowball variants, applying the flat +1 throws away the gradient of loser hand strength. A loser with a 7-low (a strong Razz hand that simply ran into a 6-low) and a loser with a Q-low (a weak Razz hand) both post +1 bogey. This is qualitatively different from Hold'em, where a loser with a flush vs a full house already has a much lower golf score than a loser with high-card vs a pair.

### Adaptive Bogey-Loss (Percentile Rule)

Rather than picking a categorical bucket threshold (which would re-introduce Schema A's information-loss problem inside the loss rule itself), we tie the "respected loss" decision directly to the same percentile-based CDF used by Hybrid Schema C in §10.

**Rule.** At a decisive Yellow Jacket showdown in a lowball variant, the loser's hand is evaluated against the random-showdown CDF for that variant:

- If the loser's hand is at the **70th percentile or higher** in strength (i.e., among the top 30% of possible hands at random showdown), the loss is **respected**: the loser posts their own Hybrid Schema C golf score (which will be in the −3..−5 range by construction of §10's bucket boundaries).
- Otherwise the loss is **standard**: the loser posts the fixed +1 bogey, identical to Hold'em Yellow Jacket.

**Why a percentile rule, not a bucket cut.** The Schema C buckets in §10 are themselves percentile-aligned, so a "≤ −3 bucket score" rule and a "≥ 70th percentile" rule will produce identical outcomes *given the proposed boundaries* in §10. We state the rule in percentile form because:

1. It is invariant to bucket-boundary refinement during calibration. If §10's boundaries shift in v0.3 to better match measured CDFs, the loss rule does not need a parallel edit.
2. It generalises cleanly to any future continuous-strength variant added beyond Razz / 2-7 / Badugi.
3. It exposes a single tunable parameter (the percentile cutoff, default 70th) for the Variant Calibration Mode (§19) to sweep, rather than hiding the threshold inside a discrete bucket table.

**Variant differentiation preserved.** Bumblebee remains "loser scores own hand" universally (no percentile gate). Yellow Jacket remains "loser typically posts +1 bogey, except respected losses." The percentile cutoff (70th) is the lowball-variant analogue of Hold'em's existing "straight-or-better" respected-loss sub-rule, and it preserves the equity-cost asymmetry that drives YJ's strategic profile.

**Calibration target.** The 70th percentile cutoff is a starting estimate, not a derived constant. The expected effect, to be confirmed by simulation, is that roughly 25–30% of decisive lowball YJ losses qualify as respected (versus roughly 18–22% in Hold'em YJ under the current straight-or-better rule). If measured authoredVsMeasuredSkill drifts negative under the 70th-percentile cutoff, raise the cutoff to 75th; if champion 72-hole scores compress relative to Hold'em majors, lower the cutoff to 65th. The Variant Calibration Mode (§19) automates this sweep.

---

# Part IV — Split-Pot Variants

## 15. Big O (5-Card Omaha Hi-Lo)

**Rules.** Each player is dealt 5 hole cards. The board and street structure match Hold'em / PLO (5 community cards over 4 streets). Both Hi and Lo hands are made under a use-exactly-2 constraint: best 5-card high hand from 2 hole + 3 board, and best 5-card low hand from 2 hole + 3 board (the two hands need not share the same 2 hole cards). Lo qualifies only if it is 8-or-better (i.e., the highest card in the 5-card low is 8 or lower). If no Lo qualifies, the entire pot goes to Hi.

**Evaluator.** Two parallel evaluators per player per showdown:

- `evaluatePLO_Hi(hole5, board5)`: enumerate C(5,2) × C(5,3) = 10 × 10 = 100 combinations, evaluate each as 5-card high, take max.
- `evaluatePLO_Lo(hole5, board5)`: same enumeration, evaluate each as 5-card 8-or-better low (A=low for Lo), take min — and verify the resulting hand qualifies (highest card ≤ 8). If no combination qualifies, return "no Lo."

**Pot resolution (honey side).**

- If at least one player has a qualifying Lo: the honey pot splits 50/50 between Hi-half and Lo-half.
- If no player has a qualifying Lo: the entire honey pot goes to the Hi-half winner.
- Within each half, ties roll forward (preserving v69.25 tied-pot carry mechanic) for that half only. Two halves with two different winners means each half is awarded independently.
- "Scoop" (one player wins both halves): that player takes the full honey pot.

**Scorecard resolution per hand.** Proposed rule:

- Compute `score_hi` (winner_hi's hand-class golf score, or own hand if Bumblebee variant for losers).
- Compute `score_lo` (winner_lo's hand-class golf score under Schema C Razz mapping, or own hand if Bumblebee variant for losers).
- If only Hi was awarded (no qualifying Lo): per-hand entry = score_hi.
- If both halves awarded:
  - **Scoop (single player wins both):** entry = ⌊(score_hi + score_lo) / 2⌋ for the scooper.
  - **Split (different winners):** the Hi-winner posts score_hi as their entry; the Lo-winner posts score_lo as their entry. Non-winners post +1 (Yellow Jacket variant) or own-hand averages (Bumblebee).

**Justification for the floor-of-average rule on scoops.** This rule:
- Preserves the integer-only scorecard (no fractional entries on the per-hand scorecard).
- Rewards scooping but does not double-count: a scooper with a flush (score −1) and a 7-low (score −3) posts ⌊−2⌋ = −2, rather than −1 + −3 = −4. Empirically calibrated to keep champion 72-hole Big O scores in the same range as PLO (predicted: −10 to −15 below par for champions).
- Is consistent across variants and easy to implement.

This rule is **proposed**, not derived. It must be tested in Big O simulation runs and refined if it produces unexpected champion-score distributions.

## 16. Stud Hi-Lo (8-or-Better)

Stud Hi-Lo applies the same split-pot resolution rules as Big O but on a 7-card Stud structure. The evaluator pair is:

- `evaluateStud_Hi(seven_cards)`: best 5-card high from any 5 of 7.
- `evaluateStud_Lo(seven_cards)`: best 5-card 8-or-better low from any 5 of 7.

Pot resolution and scorecard resolution rules are identical to Big O (§15). Stud-specific rules (bring-in, ante, 5 betting rounds) inherit from §11.

---

# Part V — Calibration Methodology

## 17. Audit Suite per Variant

Each new variant must run the existing v69.24 audit suite plus variant-specific frequency tables. The full per-variant audit consists of:

**Pre-implementation analytical work (1–3 days):**

1. Hand-class frequency table at random showdown (Monte Carlo, 1M hands).
2. Equity distribution at decision points (2 hole cards / 4 hole cards / 5 hole cards on 0/3/4/5-card boards as applicable).
3. Modal showdown hand class.
4. Mean and variance of per-hole golf score under Schema 0 (Hold'em) or Schema C (lowball).

**Post-implementation calibration runs (4–8 hours wall-clock per run, 1k pool / 100 seasons):**

5. skillSpearman, skillEVSpearman, skillEVSpearman_nonMain.
6. authoredVsMeasuredSkill (sign and magnitude).
7. Tier ROI: Elite / Upper / Mid / Bottom, all-events and ex-Main.
8. finalsSkillEdge per event type (major / regular / main).
9. Champion score distribution: mean, median, p10, p25, p75, p90, min, max.
10. belowParRate (overall and per event type).
11. Action rates by street (fold / check / call / bet / raise).
12. Equity-bucket fold-rate distribution (does AI fold correct hands at correct equities?).
13. True fold cost histogram.
14. Bluff-read suppression by readingDepth bucket.
15. Late-reg winner share vs field share (if applicable).

**Variant-specific additions:**

16. For PLO and Big O: distribution of "best of 60" / "best of 100" combination index (which combination index produces the winning hand). This validates evaluator correctness.
17. For lowball: percentile distribution of winning hands at showdown vs. Schema C bucket boundaries (validates the percentile-bucket alignment from §10).
18. For split-pot variants: scoop rate and qualified-Lo rate.

## 18. Acceptance Criteria

A variant is **ship-viable** if and only if all of the following hold:

| Criterion | Threshold | Failure mode if violated |
|-----------|-----------|--------------------------|
| skillSpearman | ≥ 0.42, bootstrap 95% CI lower bound ≥ 0.35 | Skill expression collapsed; reject or redesign |
| authoredVsMeasured | within [+0.02, +0.12], bootstrap CI excludes zero | Calibration inverted or over-corrected; do not ship |
| Elite ROI − Bottom ROI (all-events) | ≥ 8pp, ≤ 20pp | Tier separation too weak (<8pp) or overfit (>20pp) |
| Champion score (Major) median | within [−18, +8] | Out-of-band; investigate evaluator and scoring map |
| belowParRate (Major) | within [55%, 90%] | Champions not capitalising on equity edge, or par mis-set |
| Action rate at adj < 0.10 | fold rate ≥ 60% when callAmount > 0 | AI not folding hopeless spots; check fold logic |
| ITM rate | within [12%, 17%] | Payout structure broken |

All thresholds are evaluated against bootstrap 95% confidence intervals computed from the per-season metric distributions over a 100-season run, not against single-season point estimates. A criterion is "passed" only if the relevant quantile of the bootstrap distribution clears the threshold. This protects against single-run noise creating false positives or false negatives in the ship-viable decision.

A variant is **calibration-viable** (ships pending more audit cycles) if all qualitative signs are correct (positive Spearman, positive authoredVsMeasured, monotone tier ROI) but quantitative levels fall outside the bands above. In this case the variant is added to the build with a "Beta" badge in the lobby and a continued audit cycle.

A variant is **rejected** if any qualitative sign is inverted: authoredVsMeasured negative, Bottom ROI > Elite ROI by ≥ 2pp, or skillSpearman < 0.20.

## 19. Pre-Calibration Analytical Work

Before any variant's full audit run, the following analytical artifacts should be produced and reviewed:

1. A **hand-class frequency table** at random 1M-hand showdown for the variant.
2. A **mean expected golf score** at random showdown under the proposed scoring map.
3. A **comparison table** showing how the variant's distribution differs from Hold'em.
4. A **predicted champion-score range** based on the distribution shift (back-of-envelope calculation, not full simulation).
5. A **risk register** listing variant-specific calibration risks (e.g., for PLO: equity flatness; for Razz: continuous-strength loss of differentiation; for Big O: scoop-rate impact on scorecard).

Producing these artifacts before the full audit reduces the chance that a 4–8 hour calibration run produces obviously-wrong output that could have been predicted analytically.

## 20. Variant Calibration Mode

The audit suite as it exists in v69.25 was designed to confirm calibration of a *single* variant (Hold'em) once. Mixed games require **iterative re-calibration of multiple variants**, each with its own AI threshold optima, Schema C bucket boundaries, and (for Yellow Jacket lowball variants) Bogey-Loss percentile cutoff. Running the full 4–8 hour audit per parameter sweep is not tractable.

Variant Calibration Mode is a first-class simulator feature, not an ad-hoc script. It is added to the Lab simulator UI alongside the existing Simple / Advanced toggle.

**Inputs (UI form, top to bottom):**

1. **Variant under calibration.** Dropdown: PLO, Razz, 2-7 Triple Draw, Badugi, Big O, Stud Hi-Lo.
2. **Parameter set to sweep.** Multi-select: AI bet/fold/raise thresholds, Schema C bucket boundaries (lowball only), Bogey-Loss percentile cutoff (lowball YJ only), Pot-Limit raise cap multiplier (PLO only), scoop floor/ceil rule (Big O only).
3. **Sweep grid.** For each selected parameter, a 3- or 5-point grid centred on the current best estimate (e.g., percentile cutoff: 60 / 65 / 70 / 75 / 80).
4. **Pool size and seasons per cell.** Default 200 pool / 20 seasons per grid cell — large enough for stable bootstrap CIs, small enough to keep total runtime under one shift. Total runtime estimate is computed and shown before launch.
5. **Acceptance metrics.** Defaults to the §18 ship-viable criteria; user can add or remove metrics for the sweep.

**Outputs (single results page per sweep):**

1. A grid (one row per parameter cell) showing each metric's bootstrap 95% CI and a pass/fail indicator against the §18 thresholds.
2. The Pareto frontier of cells that pass all hard criteria, sorted by composite score (sum of normalised metric distances from band centres).
3. A delta table comparing the best cell to the current frozen optima.
4. CSV export with full per-cell raw metrics (already standard for v69.25 simulator runs).

**Implementation footprint.** Approximately 250–400 lines:

| Component | LOC estimate |
|-----------|--------------|
| UI form (variant picker, parameter multi-select, grid editor, runtime estimator) | 100–150 |
| Sweep driver (Cartesian product of selected grids, seeded sub-runs) | 60–80 |
| Bootstrap CI computation per metric per cell | 40–60 |
| Pareto frontier extraction and ranked-result rendering | 30–50 |
| CSV exporter extension (add cell-id and parameter columns) | 20–40 |

**Why this matters.** Without Variant Calibration Mode, every parameter adjustment requires a manual re-run of the full audit. With it, a typical PLO calibration cycle (sweep AI thresholds across a 3×3×3 grid) becomes a single overnight run with a one-page comparison output the next morning. This converts mixed-games calibration from a multi-week serial process into a parallelisable batch process and is a prerequisite for shipping more than one new variant per release cycle.

**Decision gate for ship.** Variant Calibration Mode is shippable independently and should be merged before Phase 1 (PLO) calibration begins. It also retroactively benefits Hold'em re-calibration after any future engine change.

---

# Part VI — Risk Register and Open Questions

The following are known design risks and unresolved questions, ordered by severity. Each item below is a risk to be tracked, not a decided design.

**R1 (Severity: high). PLO equity flatness may not produce sufficient skill differentiation.**
PLO's 67% best-vs-random vs Hold'em's 85% suggests that per-decision skill edges are smaller in PLO. The bounded scorecard + divisor variance compression may be more *effective* in PLO (relative to the smaller signal), or it may *compress the signal below noise*. Both are plausible; only audit data will distinguish.

**R2 (Severity: medium). Adaptive Bogey-Loss percentile cutoff is uncalibrated.**
§14 specifies a 70th-percentile cutoff for "respected loss" in lowball Yellow Jacket events as a starting estimate. The actual cutoff that preserves variant differentiation without distorting authoredVsMeasuredSkill must be measured by the Variant Calibration Mode (§20) sweep. If the optimum cutoff drifts too high (>80th percentile), the rule degenerates to "always +1 bogey" and Yellow Jacket lowball loses identity vs Bumblebee; if it drifts too low (<60th percentile), Yellow Jacket lowball converges on Bumblebee. Either drift is a failure mode to be flagged in calibration.

**R3 (Severity: high). Stud's bring-in mechanic does not map to YJ honey pot.**
The mandatory honey opener (2/4 honey) is a flat per-hole cost. Stud's bring-in is a function of upcard rank — the player with the lowest face-up card in Razz (or highest in 7-Card Stud Hi) is forced to bring in. This cannot be replicated with the existing flat opener. Three possible resolutions:
- (a) Replace honey opener with Stud bring-in for Stud-family variants only.
- (b) Keep honey opener and add bring-in as an additional small cost (changes wagering economics).
- (c) Remove bring-in entirely and rely on honey opener (changes Stud's strategic structure).

This is a significant design decision that affects the strategic distinctness of Stud variants from PLO/Hold'em variants. Recommend deferring until PLO is shipped and validated.

**R4 (Severity: medium). Big O scorecard rule is unproven.**
The floor-of-average rule on scoops (§15) is a proposed heuristic. Its effect on champion-score distribution is not derivable analytically; needs empirical validation.

**R5 (Severity: medium). Equity-aware AI's `estimateStrengthAware` does not generalize.**
The current function uses Hold'em equity tables (`PREFLOP_EQUITY`) and a board-texture-aware adjustment (`boardTexture`, `heroDrawEquity`, `threatForHero`) tuned for Hold'em. PLO needs a separate preflop equity table (4-card combinations) and a separate post-flop heuristic. Razz needs a low-hand equity table. Each variant requires its own equity-estimation primitives.

**R6 (Severity: medium). Multi-way table sizes don't fit all variants.**
Stud is conventionally 8-handed (a 9th player exhausts the 52-card deck). PLO is 6-handed at cash but 9 in tournaments. Hold'em is flexible. The current table-size dropdown (2/4/6/9) needs an "8" option for Stud and the YJ multi-way engine needs to verify it handles 8-handed correctly.

**R7 (Severity: medium). Cash-table stroke ledger is uncalibrated for new variants.**
The existing cash YJ Stroke / Bumblebee Stroke variants settle at +$0.50 per net stroke. This rate was calibrated for Hold'em hand-class frequencies. Variants with different distributions (PLO's higher made-hand frequency, Razz's continuous low) will produce stroke ledgers with different magnitudes. The +$0.50/stroke rate may need per-variant tuning to keep the Nectar settlement reasonable.

**R8 (Severity: low). Draw mechanics add UI complexity.**
2-7 Triple Draw and Badugi need a draw-selection UI (which cards to discard) between betting rounds. This is straightforward but is incremental UI work not present in any existing YJ mode.

**R9 (Severity: low). Per-variant "premium kicker" buckets.**
The existing Hold'em scorecard has J+, T+, 9+ premium-kicker buckets in some categories. PLO inherits these. Lowball Schema C uses 8 percentile buckets (not 16). For Big O hi-lo split, the Lo half uses Schema C (8 buckets) while the Hi half uses Schema 0 (16 buckets with premium kickers). This asymmetry is acceptable but should be documented in the Rules tab.

**R10 (Severity: low). Audit suite runtime grows linearly with variant count.**
Each new variant's audit run is a 4–8 hour 100-season simulation. Adding 5 variants to the standard regression suite adds 20–40 hours of compute time per release cycle. This is manageable but not trivial; consider a subsetting strategy (full audit on PLO + Hold'em as canonical pair; reduced audit on others).

---

# Part VII — Implementation Phasing

## Phase 1 — PLO only (4–8 weeks of engineering)

**Scope:**
- `evaluate5` and `evaluatePLO` evaluators
- Variant flag plumbing in playHole / resolveCashHand / decideFor
- Hole-card UI (4-card hole)
- Cash variants: Pure PLO, YJ PLO Stroke, Bumblebee PLO Stroke
- Lab simulator option to select Hold'em or PLO per run
- Audit suite addition: PLO frequency tables

**Deliverable:** PLO works end-to-end (cash and tour), audit confirms ship-viability per Acceptance Criteria (§18).

**Decision gate:** If audit shows PLO is ship-viable with reasonable calibration drift, proceed to Phase 2. If audit shows fundamental incompatibility (skillSpearman < 0.30, authoredVsMeasured negative, etc.), STOP and re-evaluate the mixed-games strategy.

## Phase 2 — Big O (3–4 weeks after Phase 1)

**Scope:**
- `evaluatePLO_Hi`, `evaluatePLO_Lo` for 5-hole, 5-board
- Split-pot resolution in playHole / resolveCashHand
- Big O cash variants

**Deliverable:** Big O works end-to-end. Validates the split-pot scorecard rule (§15) and the qualifying-Lo logic.

## Phase 3 — Razz (4–6 weeks after Phase 2)

**Scope:**
- 7-card Razz evaluator
- Schema C Razz scorecard mapping
- Stud-family deal flow (3 down + 4 up over 5 streets)
- Bring-in resolution (R3)
- Lowball respected-loss rule (R2)
- 8-handed table size support
- Multi-way audit re-run

**Deliverable:** Razz works end-to-end. Validates Stud-family deal flow and the lowball Schema C percentile-bucket framework.

**Decision gate:** Razz is the highest-risk variant in this plan. If Razz passes audit, the rest (2-7 TD, Badugi, Stud Hi, Stud Hi-Lo) are incremental and similar in scope to Razz. If Razz fails audit, reconsider the lowball framework before continuing.

## Phase 4 — 2-7 Triple Draw, Badugi (3–4 weeks after Phase 3)

**Scope:**
- 2-7 Triple Draw and Badugi evaluators
- Draw-selection UI
- Both variants share Stud-family bring-in alternative (or use blinds, design choice per variant)
- Audit per variant

## Phase 5 — Stud Hi, Stud Hi-Lo (2–3 weeks after Phase 4)

**Scope:**
- Stud Hi evaluator (reuses existing 7-card high evaluator with Stud street structure)
- Stud Hi-Lo: split-pot rules from Phase 2
- Mixed-games rotation UI (the actual "8-Game" menu mode)

## Phase 6 — Calibration consolidation (2–3 weeks after Phase 5)

**Scope:**
- Per-variant audit benchmarks frozen
- Calibration documentation finalized
- v70 release

**Total duration estimate: 18–28 weeks of engineering time, plus calibration iteration.**

This is approximately **10× larger** than the original Grok proposal claimed. It is approximately the right size for what is actually being built: a multi-variant poker engine with a uniform scoring law and a per-variant calibration cycle.

If the strategic value of mixed games is not 10× the strategic value of single-variant Hold'em, this project should not proceed past Phase 1.

---

# Appendices

## A. Pseudocode: PLO Evaluator

```
// evaluate5: Returns packed handValue for a 5-card hand.
// Format: (cat << 24) | (k1 << 20) | (k2 << 16) | (k3 << 12) | (k4 << 8) | (k5 << 4)
// where cat is hand category 0..9 and k1..k5 are kicker ranks (2..14).
function evaluate5(c1, c2, c3, c4, c5):
    rankCounts = array[15] of int, all zero
    for c in [c1..c5]: rankCounts[c.rank]++
    suitsArr = [c1.suit, c2.suit, c3.suit, c4.suit, c5.suit]

    isFlush = all 5 suits equal
    rankMask = bitmask of present ranks (bit r set if rankCounts[r] > 0)
    if rankCounts[14] > 0: rankMask |= bit 1   // Ace can play low for wheel
    straightHi = highest bit such that mask & mask>>1 & mask>>2 & mask>>3 & mask>>4 has that bit set
    isStraight = straightHi >= 5

    if isFlush AND straightHi == 14: return ROYAL_FLUSH packed value
    if isFlush AND isStraight:        return STRAIGHT_FLUSH(straightHi)
    if quad rank exists:              return FOUR_OF_A_KIND(quadRank, kicker)
    if trips AND pair exists:         return FULL_HOUSE(tripsRank, pairRank)
    if isFlush:                       return FLUSH(top 5 ranks descending)
    if isStraight:                    return STRAIGHT(straightHi)
    if trips exists:                  return THREE_OF_A_KIND(tripsRank, kicker1, kicker2)
    if two pairs exist:               return TWO_PAIR(highPair, lowPair, kicker)
    if one pair exists:               return ONE_PAIR(pairRank, kicker1, kicker2, kicker3)
    return HIGH_CARD(top 5 ranks descending)

// evaluatePLO: Returns the best 5-card handValue achievable from a 4-card hole
// and 5-card board, under the use-exactly-2-hole + use-exactly-3-board constraint.
function evaluatePLO(hole4, board5):
    best = -INFINITY
    for each pair (i, j) where 0 <= i < j <= 3:           // C(4,2) = 6 hole pairs
        hp = [hole4[i], hole4[j]]
        for each triple (a, b, c) where 0 <= a < b < c <= 4:  // C(5,3) = 10 board triples
            bt = [board5[a], board5[b], board5[c]]
            value = evaluate5(hp[0], hp[1], bt[0], bt[1], bt[2])
            if value > best: best = value
    return best

// Performance: 60 calls to evaluate5 per showdown.
// At reference hardware (~50ns per evaluate5), ~3 microseconds per PLO showdown.
// Compare to Hold'em (~1 microsecond per evaluate7 showdown). 3× slower per showdown.
// Tractable for 100k-event simulations.
```

## B. Pseudocode: Generic Lowball-Bucket Mapper

```
// Schema C: Maps a lowball hand to a YJ scorecard golf score via percentile-aligned buckets.
// The categorical-threshold form below is one realisation of Schema C; the equivalent
// percentile form looks up the hand's strength in the variant's CDF and returns the
// score whose bucket spans that percentile (see §10).
// rankingValue is variant-specific:
//   Razz: best-low rank (5 cards, A-5 ranking, no straights/flushes)
//   2-7 Triple Draw: best-low rank (5 cards, A=high, straights/flushes are penalized)
//   Badugi: best badugi value (1, 2, 3, or 4 distinct-suit cards)
function lowballGolfScore(rankingValue, variant):
    bucketTable = LOWBALL_BUCKET_TABLES[variant]
    // bucketTable is an array of 8 entries, each {threshold, score}.
    // E.g. for Razz:
    //   [ {5, -5}, {6, -4}, {7, -3}, {8, -2}, {9, -1}, {10, 0}, {11, +1}, {Infinity, +2} ]
    // where threshold is "high card of qualifying low hand"
    for entry in bucketTable:
        if rankingValue.highCard <= entry.threshold:
            return entry.score
    return +2

// Generalization for Badugi (categorical first, then continuous):
function badugiGolfScore(badugiClass, highCard):
    // badugiClass is in {1, 2, 3, 4} (number of distinct-suit cards)
    if badugiClass == 4:
        if highCard <= 4:  return -5  // wheel-Badugi (A-2-3-4)
        if highCard <= 6:  return -4
        if highCard <= 8:  return -3
        if highCard <= 10: return -2
        return -1                      // any 4-card badugi J-or-worse
    if badugiClass == 3: return 0
    if badugiClass == 2: return +1
    return +2                          // 1-card badugi
```

## C. Reference Frequencies

This appendix has two tiers. **Tier 1** is the established Hold'em 7-card frequency table from standard references — these values are not in dispute and serve as the calibration anchor. **Tier 2** is the set of measured-but-unverified frequencies for new variants: values produced by recent informal Monte Carlo runs (1M-hand sample, single-pass, no independent re-derivation). Tier 2 is *informational* — it gives a working anchor for the Acceptance Criteria bands in §7 and §18 — but every Tier 2 row must be reproduced by a verified, seeded Monte Carlo as the first step of the variant's pre-calibration analytical work (§19) before being used in any shipping claim.

### Tier 1 — Established (Hold'em 7-card showdown, random hands)

| Class | Frequency |
|-------|-----------|
| High card | 17.4% |
| One pair | 43.8% |
| Two pair | 23.5% |
| Three of a kind | 4.83% |
| Straight | 4.62% |
| Flush | 3.03% |
| Full house | 2.60% |
| Four of a kind | 0.168% |
| Straight flush | 0.0279% |
| Royal flush | 0.0032% |

Source: standard combinatorial derivation (e.g., Sklansky, *The Theory of Poker*, Appendix). Values are exact rationals over C(52,7), rounded to four significant figures.

### Tier 2 — Measured (single-run Monte Carlo, requires re-verification)

The figures below come from a recent informal 1M-hand single-pass Monte Carlo. They are reported here because the Acceptance Criteria bands in §7 and §18 are calibrated against these numbers, and the reader is entitled to know where the numbers came from. They are **not** independently re-derived. Each variant's first §19 deliverable is a seeded, sample-size-justified Monte Carlo whose results must be cross-checked against this table; if any class frequency drifts more than 1.5σ from the value below, the corresponding §18 band must be re-evaluated.

**PLO (best of 60 from 4-hole + 5-board), random hands** — measured 1M-hand pass:
| Class | Measured Frequency | Verification status |
|-------|--------------------|---------------------|
| High card | 0.20% | unverified |
| One pair | 6.95% | unverified |
| Two pair | 28.10% | unverified |
| Three of a kind | 11.72% | unverified |
| Straight | 24.95% | unverified |
| Flush | 13.85% | unverified |
| Full house | 12.02% | unverified |
| Four of a kind | 0.41% | unverified |
| Straight flush | 0.18% | unverified |

**Razz (7-card lowball, A-5), random hands** — measured 1M-hand pass:
| Class | Measured Frequency | Verification status |
|-------|--------------------|---------------------|
| Wheel (5-low) | 0.49% | unverified |
| 6-low | 5.05% | unverified |
| 7-low | 15.21% | unverified |
| 8-low | 29.94% | unverified |
| 9-low | 24.86% | unverified |
| T-low | 15.10% | unverified |
| J-low | 6.83% | unverified |
| Q-or-worse-low | 2.52% | unverified |

**2-7 Triple Draw and Badugi** — no current measurement; first §19 analytical deliverable.

The "Verification status" column flips from "unverified" to a date and seed once a reproducible Monte Carlo confirms the row. Until then, treat any band derived from these figures as provisional.

## D. Glossary

**Adj** — the AI's adjusted equity estimate at a decision point, in [0, 1]. Combines raw hand equity with board-texture awareness, opponent-aggression discount (Bayesian bluff prior), and skill-based noise.

**Agreed-total wagering** — the YJ tournament wagering primitive. The pot at any moment is the most recently accepted proposal. Bets/raises propose a new total; calls accept it. Differs from matched-contribution wagering (cash and standard poker).

**Authored skill** — a player's intended skill level on [0, 1], sampled from a truncated Normal(0.5, 0.18) when the pool is built. Used to construct the player's profile.

**Authored-vs-measured correlation** — Pearson correlation between authored skill and an empirical performance index (wins + 0.5 × runner-ups + 0.25 × final-tables, normalized by events entered). A negative value indicates a calibration inversion: high-skill players underperforming.

**Bogey loss** — Yellow Jacket variant's decisive-showdown loser rule: loser posts +1 stroke regardless of hand strength.

**Honored loss** — Bumblebee variant's decisive-showdown loser rule: loser posts their own hand's golf score (which can be as low as −1 for a respectable losing hand).

**Honey-Stroke law** — YJ's per-hole scoring system: bounded golf score (−5..+2) plus honey pot, with net honey divided by round divisor at round end.

**Round divisor** — the integer divisor by round length: {1, 4, 9, 36} for {1, 9, 18, 72} hole rounds. Net honey is divided by this once at round end.

**Schema C** — the lowball-to-scorecard mapping adopted in §10. Combines empirical CDF percentile bucketing (variance compression) with conventional hand-class labels at bucket boundaries (recognisable language for variant players). Supersedes earlier Schema A (categorical only) and Schema B (percentile only) drafts.

**Spearman rank correlation (skillSpearman)** — non-parametric rank correlation between authored skill and total event wins. Primary skill-expression metric in the YJ audit suite.

**Stroke cap** — per-event limit on the maximum honey pot size per hole. Progressive 25/50/75/100% unlock across the four community streets in tour events.

## E. References

The following references inform this specification but are not exhaustive:

- Sklansky, D. *The Theory of Poker*. Two Plus Two Publishing, 1987 (and later editions). Contains the standard 5-card and 7-card hand frequency tables.
- Chen, B. & Ankenman, J. *The Mathematics of Poker*. ConJelCo, 2006. Chapter on Pot-Limit Omaha equity provides the basis for the PLO equity-flatness claim.
- Yardley, M. *Tournament Poker for Advanced Players*. Two Plus Two Publishing, 2003. Chapter on Stud games provides the bring-in mechanics referenced in §11.
- Lederer, H. *The Theory of Poker (Razz Edition)*. Standard treatment of Razz hand rankings.
- The v69.25 audit data (Run_1_Y1_Y100.csv files shipped with the build) provides the empirical baseline against which this specification's hypotheses are stated.

Specific frequencies cited in Appendix C are reproduced from informal references and **must be re-derived empirically** before being used in production calibration claims. This document does not assert numerical values as findings; it asserts methodologies for finding them.

---

**End of specification.**

This document is the deliverable. It is not yet implementation-ready in the sense of "drop into index.html and ship"; it is implementation-ready in the sense of "hand to an engineer, with a calibration partner, and have a Phase 1 PLO build in 4–8 weeks."

Reviewers are invited to challenge any claim. The design risks (Part VI) are the most likely sources of audit failure, and each one's resolution is a research finding, not a foregone conclusion.
