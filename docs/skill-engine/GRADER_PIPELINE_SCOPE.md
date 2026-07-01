# Production Decision-Quality Grader — Pipeline Scope

**Purpose.** Take the now-working solver and the verified grader math from a *simulation* into a system that grades **real human hand histories** for the Hive Rating / treasury. This is the build that makes "skill earns real money" defensible.

**Status going in (all verified this session):**
- Solver `runCFRPlus` produces real, converging, differentiated strategies (the infoset-key-collision bug is fixed). `runCFRPlus(...).strategy` is now trustworthy.
- `GTOq` (via the fork's `evByAction` direct rollout) — works.
- `MimicryFlag` — verified repaired against the fixed solver (a real GTO bot is now flagged; was evading).
- `ExploitCapture` — math node-tested + wired in `window.YJEconomy`; **missing the adapter that feeds it real opponents and real solver EVs.**

**The honest constraint (measured):** one solve ≈ 30–52 s at 400–600 iters. Live per-hand solving is infeasible. Everything below is built around an **offline, per-bucket solve cache** + **batch grading**, not live solving.

---

## The gap: three adapters between "fixed solver" and "graded humans"

### 1. `solveGTO(spot)` — cache-backed solver adapter
Returns `{ strategy, evByAction }` for a spot, from cache (offline-precomputed) or a live solve on cache miss.
- **Key** = `bucketOf(spot)` (already in `exploit-capture.js`: street + pot-odds bucket + board-texture class). Tune bucket granularity vs cache size.
- **Offline pre-compute:** enumerate the common buckets, solve each to a high iteration count (now that convergence is real), store `{strategy, evByAction}`. Port `evByAction` from the fork into the production solver (it's the per-root-action EV via rollout under the avg strategy).
- **Runtime:** O(1) cache lookup; live solve only on miss (rare if buckets are well-chosen), behind a default-off flag.
- **Verification gate:** cache hit-rate on a representative hand set ≥ 95%; cached strategy matches a fresh high-iter solve within small TV distance.

### 2. `OppModel` from real hand histories — the genuinely new piece
`estimateOppModel(observedOpponentDecisions, gtoFreqsByBucket, {shrinkK})` already exists in `exploit-capture.js` (Bayesian-ish bucketed frequencies shrunk toward GTO by `n/(n+k)`). What's missing is the **ingestion layer**:
- Parse a player's real hand histories → per-decision `{bucket, action}` records.
- Build the opponent's `freqsByBucket` (their leak vector vs GTO).
- Small-sample handling: the shrinkage is in place; calibrate `shrinkK` against real data — this is the dominant noise source in `ExploitCapture`.
- **Verification gate:** on synthetic opponents with known leaks, recovered `biasByBucket` correlates with the injected leak above a threshold.

### 3. `rolloutEV(spot, action, oppModel)` — EV vs the modeled opponent
Reference impl exists (`makeRolloutEV` over an injected payoff; the fork's `cfrPlusRolloutValue` is the CFR-tree version). Production: roll the cached/solved tree forward with **villain actions drawn from `oppModel.freqs`** (not the equilibrium), terminal via `cfrPlusTerminalPayoff`.
- **Verification gate:** against a leaky opponent, `rolloutEV(exploit_action) > rolloutEV(gto_mix)`; against a GTO opponent, ExploitCapture ≈ 0.

---

## Grading loop (batch, nightly)
For each treasury-eligible player (≥ gate events):
1. Their decisions → buckets.
2. Opponents' decisions → `OppModel` per opponent (or pooled).
3. Per decision: `GTOq` (cache EV-loss) + `ExploitCapture` (rolloutEV vs OppModel) − `MimicryFlag` → `DecisionScore`.
4. Aggregate → the decision-quality signal feeding the Glicko/Kalman Hive Rating at **α = 0.8**.

Only gated players need grading → the eligibility gate also **bounds compute**.

---

## Success metric (NOT exploitability for its own sake)
The solver's job here is a **grading oracle**, so measure the thing that matters:
- **Does real-hand decision-quality grading raise ρ_active** (rating↔true-skill) toward the ~0.69 clean ceiling, vs outcome-only? We measured grading-noise → ρ_active: 2.5→0.27, 0.9→0.59, 0.6→0.63. The target is to land the *production* grading noise in the 0.6–0.9 bb/100 band.
- **A/B harness:** rate the same population with (a) outcome-only, (b) GTOq-only, (c) full GTOq+ExploitCapture−Mimicry; compare ρ_active and leaderboard precision@decile.
- **wX re-sweep on REAL graded hands** (the modeled-signal result was 0.50→0.63 at wX≈0.45 — replace it with the production number).

---

## Phased plan (each phase independently shippable + verifiable)
- **P-A1 — Port `evByAction` to production `runCFRPlus`** (it's fork-only). Small, verifiable (differentiated EVs). Unblocks real GTOq + the cache values.
- **P-A2 — Offline per-bucket solve cache + `solveGTO` adapter.** Pick bucket granularity; pre-solve; lookup + miss-fallback. Gate: hit-rate + cache-vs-fresh TV.
- **P-A3 — Hand-history ingestion → `OppModel`.** The new code. Gate: leak recovery on synthetic opponents.
- **P-A4 — `rolloutEV` vs OppModel + full grading loop.** Gate: ExploitCapture behavior (exploiter > 0, GTO ≈ 0) end-to-end.
- **P-A5 — A/B ρ_active harness + wX re-sweep on real hands.** Gate: does it beat outcome-only / GTOq-only? Ship α/wX from the measured optimum.

---

## Honest risks / open questions
- **Non-zero-sum approximation now matters as a refinement.** The solver uses zero-sum negamax on a general-sum golf payoff (documented). It's an adequate heuristic baseline (the strategies are sensible), but it is **not** a true equilibrium — grading "EV-loss vs this baseline" is grading vs a strong-but-imperfect reference. Quantify the approximation error before attaching big money. (See `GROK_CFR_RESEARCH_ONESHOT.md` Q-A.)
- **OppModel small-sample noise** is the dominant `ExploitCapture` variance source; the `shrinkK` calibration is the key knob.
- **Opponent-selection farming** of `ExploitCapture` (seek easy reads) — needs the schedule/seat anomaly detection (server, `DETECTION_TECHNOLOGY.md`), not solvable in the grader.
- **VR-MCCFR is now optional**, not foundational — only pursue if P-A2's cached solves are too noisy/slow at the needed bucket granularity. Re-measure before building.
- **This is a real engineering project, not a session sprint** — each phase should be built and gated on its own, with the ρ_active A/B as the final arbiter of whether the whole pipeline earned its complexity.

---

*Files this builds on: `index.html` (fixed `runCFRPlus`), `index-expcap.html` (`evByAction`, `cfrPlusRolloutValue`), `exploit-capture.js` / `window.YJEconomy` (grader math), `treasury-curve.js` (payout from the resulting rating), `YJSACRED_WIRE_FORMAT.md §3.4` (server-side money gate).*
