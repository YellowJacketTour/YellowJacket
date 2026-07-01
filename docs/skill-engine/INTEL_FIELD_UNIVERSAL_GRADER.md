# Yellow Jacket — The Intel Field: One Universal Grader for One Sport

**The philosopher-king principle (the whole thing in one sentence):**
> A player's skill is the proximity of every decision, on every street, to the **best possible
> response given everything knowable about the actual opponents faced and the actual stakes at
> risk** — computed in real time, sealed by cryptographic commitment so it is unforgeable and
> unseeable until the round concludes, and aggregated over a lifetime into a single format-agnostic
> measure.

This one definition collapses heads-up, multi-way, cash, tournaments, and multi-way tournaments
into **one sport with one skill number** — and it is *irrefutable* because it is best-response
(always well-defined) rather than Nash (format-specific and multi-way-undefined), and *unforgeable*
because the verdict is committed before it can be seen.

---

## 1. Why best-response-to-field, not GTO (the load-bearing substitution)

| | GTO / Nash baseline | **Best-response-to-actual-field** (chosen) |
|---|---|---|
| Heads-up | well-defined | well-defined |
| **Multi-way (3+)** | **undefined** — not zero-sum, no unique equilibrium, no guaranteeable value, collusion-ambiguous | **always well-defined** — best response to N modeled opponents is a plain optimization |
| Measures | adherence to a theoretical construct | **real skill** — out-playing the humans actually present |
| Powered by | a solver in a vacuum | **the global population ledger** (the Intel Field improves the baseline forever) |
| Cheat surface | GTO-bot mimicry passes as skill | exploiting the field *is* the skill; mimicry is just one (mediocre) field-response |

GTO falls out as the limit: when opponents are **unknown or perfectly balanced**, the best response
to the field *is* the Nash strategy. So nothing is lost — GTO is the floor; reading and exploiting
the actual field is the ceiling. **The Intel Field (every player's career profile) is what defines
"the actual opponents," and it sharpens every grade as it grows.**

---

## 2. One grader, any format — the two pluggable layers

The grader factors into **(A) a value transform** (what a chip is worth in this format) and **(B) a
field model** (who's at this table). Swap those two; the engine is identical.

### A. Value transform — what EV is denominated in
- **Cash (HU or multi-way):** EV in chips/Honey directly. A chip is a chip.
- **Tournament (HU or multi-way):** chip-EV → **standing-equity** via an **ICM / future-game
  transform** (a chip near the bubble is worth more than a chip deep-stacked). The decision is graded
  in the currency that actually matters — survival/payout equity — not raw chips.
- **Season / GC:** the same transform pointed at the **Tour standing** (the `GC_STRATEGY.md` GC). A
  decision is graded by its effect on your *standing-equity*, unifying the grader with the Tour.

> One transform interface, three pointers (chips / tournament-payout / GC-standing). The grader code
> never changes; only what "value" means does.

### B. Field model — multi-way is solved by attribution, not Nash
For N players, a decision's EV is computed as the player's **marginal contribution** to the outcome,
against the modeled field:
- **All-in / showdown equity** is exact for any N (enumerate/MC the runout vs the live ranges) — this
  removes card variance multi-way exactly, the way "all-in EV" already does in broadcasts.
- **Best-response EV** of each action = expected value over the **N-opponent response model** (each
  opponent's continuation drawn from their Intel-Field profile), summed via **Shapley-style marginal
  attribution** so each player is credited only for *their* decision's contribution to the pot, never
  for teammates' or variance.
- **Collusion-resistant by construction:** you're graded on best-response to the field as it actually
  played — soft-play *lowers* the colluder's own grade (they left EV on the table), so collusion is
  self-penalizing in the skill metric, independent of the detection stack.

EV-loss per decision = `bestResponseEV(field) − chosenEV`, in the format's value units. **Lower is
better. Zero is perfect. Identical formula for HU, multi-way, cash, and tournament** — only A and B
differ.

---

## 3. The Intel Field — the impenetrable, real-time, sealed ledger

The ledger is a **commit-reveal sealed intelligence field**: graded instantly, readable by no one —
not opponents, not the player, not the operator — until the round between those players has ended.

- **Atom:** every decision → `{ features (the 11D+ context vector), EV-of-every-action, best-response
  EV, EV-loss, value-units, format, field-fingerprint }`.
- **Real-time + sealed:** the grade is computed the instant the action is taken (portable Oracle/net
  → microseconds), then **encrypted under a key derived from the round's not-yet-revealed
  `serverSeed`** (the commit-reveal + BLS-VRF already in the stack). The ciphertext is written to the
  ledger immediately and is **mathematically unreadable until round-end reveal** — so the verdict
  exists in real time but cannot be seen, leaked, or used as in-hand information by anyone.
- **Unforgeable / irrefutable:** because each grade was *committed before* the seed (and thus the
  cards/EV) could be known, no party could have back-dated, peeked, or tampered. At reveal, anyone
  can independently re-derive the grade from the now-public seed + the logged actions and verify the
  commitment. **The ledger proves itself.**
- **Tesseract aggregation:** decisions roll up into a lifetime hypercube — sliceable by
  `format × street × position × opponent-type × stake × time` — yielding a season value, a lifetime
  value, and *conditional* skill (your river play, your 3-bet-pot play, your short-stack play, your
  play vs aggression…). **One global population skill database, queryable down to every click.**

### Format normalization (so it's ONE number)
Because every grade is an **EV-loss in the format's own value units**, grades are made comparable by
expressing them as a **standardized deviation from optimal** (e.g., bb/100-equivalent, or
standing-equity-per-decision). A river fold in a multi-way tournament and a flop raise in a HU cash
hand both reduce to "how many units of optimal value did this decision leave on the table." That
common denominator is what lets HU, multi-way, and tournament play **feed one lifetime skill rating**
— the irrefutable, format-agnostic sport metric.

---

## 4. The Oracle is pluggable (CFR is one coefficient)

Behind a single `oracle.evOfActions(state, fieldModel, valueTransform) → {byAction, bestEV}` seam:
- **Today:** heavily-iterated multi-street CFR+/MCCFR for the field-response (HU exact; multi-way as
  best-response-to-modeled-field, not a multi-way Nash solve).
- **Tomorrow:** ReBeL-style search-with-value-net (Nash-convergent for the 2-player core),
  LP/minimax for small trees, learned policy nets — **all the same interface.**
- **Shipped:** the **distillate** — offline full-tree solves compressed into a portable value+policy
  net / Syzygy-style tablebase. Microsecond grading on a phone, full-tree-correct because the tree was
  solved upstream.

**Root cause of the current inversion (named, so the prototype targets it):** the existing rollout
grades against a **near-uniform reference policy** — so "optimal" is garbage and alignment-with-garbage
scores backwards (random bot 8.19 < elite 9.29). The tree depth is already present
(`cfrPlusRolloutValue`/`evByAction` roll through all streets); **the missing piece is a *converged*
reference policy.** That convergence is the moat.

---

## 5. Acceptance gates (no grade touches a prize until all pass)
1. **Ranks strong > random** (the current grader fails this).
2. **Monotonic** with true skill across a ladder.
3. **Concentrates** per single match (ρ ≥ 0.6 at 18 hands) once the reference is converged.
4. **Format-invariant:** the same player's skill number is stable across HU / multi-way / tournament.
5. **Sealed + self-verifying:** every grade re-derivable from the revealed seed; commitment checks.
6. **Solver-validated** against an independent strong solver on a benchmark suite.

---

## 6. Prototype plan (in-engine, hold nothing back)
1. Reuse the canon evaluator + `evByAction`/`cfrPlusRolloutValue` multi-street rollout machinery.
2. **Replace the weak reference policy with a converged one** (heavy offline CFR+ iterations / a
   strong reference) — fix the inversion at its true source.
3. Implement the **value-transform** (chips / ICM / GC) and the **field-model** (N-opponent profiles)
   seams so HU, multi-way, cash, and tournament all run through the one grader.
4. Run the **acceptance gates** on full hands across formats.
5. Wrap each grade in the **commit-reveal seal** (encrypt under the round seed; reveal at round end).
6. Validate, then **extract** the proven core to the portable distillate.

---

## The one line
**One sport, one number: how close was every decision to the best answer against the real people you
faced and the real stakes — graded the instant you clicked, sealed so no one can see it until the
round ends, proven by the seed afterward, and summed over a lifetime. Heads-up, multi-way, cash,
tournament — same law, swap only what a chip is worth and who's at the table. That is the Intel
Field, and no poker product has ever been able to build it.**

*Related: `SKILL_GRADER_MANIFESTO.md` (why decisions not chips), `GC_STRATEGY.md` (the standing the
tournament transform points at), `exploit-capture-grader.md` (the field-response / exploit axis),
`HUMAN_SKILL_PILOT.md` (validation on humans).*
