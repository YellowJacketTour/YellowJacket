# Defensive Publication — Yellow Jacket Tour Game-Mechanic System

**Author:** Dalton Graham
**Owner of record:** Blank Canvas, Inc. (Wyoming, USA)
**Publication date:** [TO BE FILLED ON ACTUAL PUBLICATION]
**Document SHA-256:** [TO BE COMPUTED ON ACTUAL PUBLICATION]
**Inventory cross-reference:** This publication corresponds to assets §4 of `IP_INVENTORY.md` dated 2026-05-02.

---

## Purpose

This document is a **defensive publication**. Its purpose is to place the game-mechanic system described below into the public prior-art record on a verifiable date, so that:

1. No subsequent party can obtain a patent on these mechanics, since the publication date precedes any such filing.
2. The author's authorship is verifiably dated.
3. The mechanics remain freely usable by the original author and by the public, while specific implementation (source code, brand, expression) remains separately protected by copyright and trademark.

This document does **not** grant any license to the brand assets ("Yellow Jacket Tour", "Honey-Stroke", "Bumblebee", "Buzz") or to the specific code, text, artwork, or audit data of the Yellow Jacket Tour product. Those remain the exclusive property of Blank Canvas, Inc., protected by US copyright registration (filed) and US trademark registration (filed). What is published here is the *abstract mechanic*, not the *product expression*.

---

## How to Use This Publication

If publishing as defensive prior art (the intended use):

1. Commit this document to a public, timestamped, immutable location:
   - **Recommended:** a GitHub repository under Blank Canvas, Inc.'s organization, with a signed and dated commit. GitHub commit timestamps are admissible evidence of publication date.
   - **Alternative:** a service designed for defensive publications, such as IP.com's Prior Art Database, the Linux Defensive Publications archive (for software-related), or Research Disclosure (a long-running journal of defensive publications).
   - **Belt-and-suspenders:** all of the above, plus an Internet Archive (web.archive.org) snapshot.
2. Update the header above with the actual publication date and the SHA-256 hash of the published file.
3. Save the URL(s) of all publication locations into `IP_INVENTORY.md` §11.

Once published, the document cannot be retracted from the prior-art record. **Do not publish until the patent attorney has confirmed that defensive publication is the chosen path** (publication closes the patent door — see `PATENT_ATTORNEY_BRIEFING.md` §6).

---

## 1. Field of the Disclosure

Computer-implemented hybrid card-and-sport games, specifically combinations of poker showdown evaluation with golf-style stroke scoring, with controlled monetary or score variance.

## 2. Background

Conventional poker is scored monetarily: each hand contributes a profit or loss to the player's bankroll. Conventional golf is scored as a sum of strokes per hole, with a known par for each hole and a fixed-length round (typically 18 holes). Hybrid games combining poker and golf have existed informally (home games, casino-curiosity decks) but no commercially published implementation has previously combined the following set of mechanics into a single system with documented variance-control properties.

## 3. The Mechanic System (Disclosed Prior Art)

The following mechanics are disclosed in detail. Each subsection is independently disclosed; the system as a whole is also disclosed.

### 3.1. Per-hand bounded golf score from poker showdown class

A method of computing, for each hand of poker played, a bounded integer "golf score" for each player based on the player's showdown hand class. The bounded score lies in a fixed integer range from a most-negative best-possible-hand value to a most-positive worst-possible-hand value. In the canonical instantiation, this range is **−5 (best, royal flush) to +2 (worst, weak high card)**, mapped per hand class according to the table in §3.2.

### 3.2. Hand-class to golf-score mapping table (Hold'em canonical instantiation)

The following 16-row mapping is one specific calibration of §3.1 for Texas Hold'em (5-card best-of-7 evaluation):

| Hand class | Sub-bucket / kicker | Golf score |
|------------|---------------------|------------|
| Royal Flush | — | −5 |
| Straight Flush | — | −5 |
| Four of a Kind | — | −4 |
| Full House | premium (top boat) | −3 |
| Full House | other | −2 |
| Flush | premium (A/K-high) | −2 |
| Flush | other | −1 |
| Straight | premium (T-high or better) | −1 |
| Straight | other | 0 |
| Three of a Kind | premium kicker (J+) | 0 |
| Three of a Kind | other | +1 |
| Two Pair | top pair, premium kicker (T+) | 0 |
| Two Pair | other | +1 |
| One Pair | premium pair (J+) and premium kicker (9+) | +1 |
| One Pair | other | +2 |
| High Card | — | +2 |

The mapping is *one* calibrated instantiation; the mechanic claimed is the bounded-score-from-class principle in §3.1, not this specific table.

### 3.3. Mandatory per-hand opening pot

A method of opening every hand of the series with a mandatory pot of an in-game wager unit (the "wager unit"), the unit being denominated separately from the player's underlying bankroll. The opening amount may vary by stage of the series (e.g., 2 units per hand for the first half of an 18-hand series, 4 units for the second half).

### 3.4. Agreed-total wagering primitive

A method of managing the wager pot as the most recently *accepted* proposal, distinct from the matched-contribution wagering of conventional poker. Specifically:

- The pot at any moment equals the most recent accepted proposal (initially the mandatory opening pot per §3.3).
- A bet or raise action by a player proposes a new pot total, which is greater than the current total.
- A call action by another player accepts the proposed total as the new current pot total.
- A fold action awards the current pot total to the remaining player.
- A tied resolution (no decisive showdown winner) carries the current pot total forward to the next hand of the series.

This is a state-machine primitive: each "accept" is an atomic state transition. The wager unit accumulates as a series-scoped accumulator that is independent of any individual player's contribution.

### 3.5. Stroke-cap progressive unlock

A method of capping the maximum pot size per hand at progressively higher thresholds as community-card streets are revealed. In a Hold'em-family canonical instantiation: 25% of the per-hand cap is unlocked preflop; 50% on the flop; 75% on the turn; 100% on the river.

### 3.6. Round-divisor variance compression

A method of compressing the contribution of accumulated wager-unit outcomes to a series-final score by dividing the net wager-unit total by an integer divisor at series end. The divisor is selected from a calibrated table mapping each supported series length to a corresponding divisor.

In the canonical instantiation:

| Series length (hands) | Divisor |
|-----------------------|---------|
| 1 | 1 |
| 9 | 4 |
| 18 | 9 |
| 72 | 36 |

The divisor table is calibrated such that the variance of the divided wager total is approximately matched to the variance of the per-hand bounded golf score (§3.1) summed over the same series length. The technical effect is variance compression of the wager-unit subsystem so that it does not dominate the bounded-score subsystem in determining the series winner. The divisor table is empirically derived; the principle disclosed is the use of a series-length-indexed divisor for variance matching.

### 3.7. Final score computation

The method of computing each player's final series score as:

`final_score = sum_of_per_hand_bounded_scores − (net_wager_unit_total / divisor(series_length))`

where lower scores win (golf convention). The wager-unit term is subtracted (so winning the wager subsystem improves the player's golf score by lowering it).

### 3.8. Dual-variant loss-rule system

A computer-implemented system supporting at least two distinct loss-resolution rules, selectable per session, sharing a common engine, common wagering primitive (§3.4), and common per-hand cap (§3.5). The two canonical variants are:

- **Variant A ("Yellow Jacket" instantiation):** a decisive-showdown loser receives a fixed penalty score (specifically +1, equal to the cost of folding) regardless of the loser's hand strength.
- **Variant B ("Bumblebee" instantiation):** a decisive-showdown loser receives a variable penalty score equal to the loser's own hand-class score (per §3.1).

The variants are functionally equivalent in all other respects.

### 3.9. Survival-cushion late-registration handicap

A method of seeding late entrants into a series-in-progress at a starting score equal to the leader's score plus a multiple of the survival cushion. The survival cushion is computed as the difference between the leader's score and the highest-scoring (worst-performing) currently-eliminated-eligible participant's score. The multiplier is calibrated such that late entrants have measurably lower expected probability of winning than initial entrants but a non-zero probability.

In the canonical instantiation, the multiplier is **1.5**, calibrated against an empirical measurement of late-entrant winning rates over a 100-season simulation (target: late entrants win approximately 2–3% of tournaments rather than the ~44% observed at lower multipliers).

### 3.10. Adaptive Bogey-Loss percentile rule (continuous-strength variants)

For variants of §3.8 Variant A applied to games with continuous-strength hand evaluation (lowball games such as Razz, 2-7 Triple Draw, Badugi), an adaptive method of determining when the fixed +1 penalty score applies versus when the loser's own hand-class score applies. Specifically: if the loser's hand is at or above a threshold percentile of the variant's random-showdown CDF (canonical threshold: 70th percentile), the loss is treated as a "respected loss" and the loser receives their own hand-class score; otherwise the loser receives the fixed +1 penalty.

### 3.11. Hybrid percentile-aligned bucket mapping (continuous-strength variants)

A method of mapping continuous-strength lowball hand evaluations to a finite scorecard golf-score range (per §3.1) by:

(a) computing the variant's empirical strength CDF from a Monte Carlo of at least 1,000,000 random hands;
(b) defining 8 percentile buckets aligned with conventional hand-class boundaries (e.g., 7-low, 8-low, 9-low for Razz);
(c) labelling each bucket with the modal conventional hand-class name within it.

This produces a discrete bucket mapping with conventional labels while preserving the variance compression of the underlying CDF.

### 3.12. Variant Calibration Mode (audit primitive)

A method of automated parameter sweep for game-variant calibration, comprising:

(a) defining a Cartesian grid over a set of variant parameters (such as AI decision thresholds, scoring bucket boundaries, and percentile cutoffs);
(b) running a fixed number of seeded simulation seasons per grid cell;
(c) computing bootstrap 95% confidence intervals for each acceptance metric per cell;
(d) extracting the Pareto frontier of cells that pass all hard acceptance criteria;
(e) outputting a ranked comparison against the current frozen optima.

The technical effect is a tractable per-variant calibration cycle (overnight rather than weeks) for game-design tuning.

---

## 4. Combined System

The mechanics §§3.1–3.12 may be combined in any subset and are all disclosed together as a single system, herein referred to as the "bounded-score-plus-divided-wager" game system. The canonical instantiation is the Yellow Jacket Tour browser game.

## 5. Implementation Reference

A working implementation of the system in §§3.1–3.12 exists in the form of a single-file HTML and JavaScript application (filename `index.html`, copyright Blank Canvas, Inc., 2026, separately registered with the US Copyright Office). The implementation is approximately 20,000 lines of code and includes the engine, wagering primitives, audit suite, and a calibrated AI opponent. The implementation file SHA-256 (as of 2026-05-02 pre-publication) is `bfb4c4799056c6b7d2dc93ffb6e53d62dac97b4dede436b89fa542a8d764734d`.

## 6. Calibration Evidence

Audit data demonstrating the technical effects claimed in §§3.6, 3.8, and 3.9 above is available on file with the author. The audit data includes, for the canonical Hold'em-only Yellow Jacket variant calibrated as of build version v69.24:

- Spearman rank correlation between authored-skill and empirical-performance across a 1,000-player pool over 100 simulated seasons: approximately 0.49 (versus near-zero in earlier uncalibrated builds).
- Late-entrant winning rate at multiplier 1.5: approximately 2.75% (versus approximately 44% at multiplier 0.6).
- Champion 72-hole stroke-play final score distribution: median approximately +5.76, with a defined par mapping.

The above are working empirical measurements supporting the technical-effect claims in this disclosure.

---

## 7. Author's Reservation

The author reserves all rights to: (a) the brand assets "Yellow Jacket Tour", "Honey-Stroke", "Bumblebee", "Buzz", and any related marks; (b) the specific source code, text, layout, artwork, and audio of the Yellow Jacket Tour product; and (c) any future patent rights to elements not disclosed in this document. The author does not waive rights to the *product expression*; what is disclosed and dedicated to the public prior-art record is the *abstract mechanic system* in §§3.1–3.12.

This is consistent with the standard defensive-publication posture: the *idea* is in the public domain (so no one can patent it); the *expression* and the *brand* remain proprietary.

---

## 8. Date Stamp and Authentication

This document is published on [PUBLICATION DATE] by Dalton Graham on behalf of Blank Canvas, Inc. The publication location of record is [URL]. The SHA-256 of this document at publication is [HASH].

Independent timestamping has been established by:
- Git commit timestamp: [COMMIT SHA AND DATE]
- Internet Archive snapshot: [URL AND DATE]
- (Optional) IP.com Prior Art Database submission: [SUBMISSION ID AND DATE]

---

**End of disclosure.**

— Dalton Graham, [PUBLICATION DATE]
