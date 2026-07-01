# Yellow Jacket — Executive Summary

*The first card game scored like a sport: every decision graded against optimal play, sealed and
unforgeable, aggregated into a lifetime skill score that drives a free-to-enter, anyone-can-earn career
economy. One artifact — the per-decision grade — is simultaneously the **referee**, the **payroll
engine**, and the **legal evidence**. This document is the verifiable synthesis; every claim below is
backed by a `node`-runnable acceptance gate in this repository.*

---

## 1. The one idea

Poker (and every game like it) has always been scored on **outcomes** — chips won — which are dominated by
chance over any short horizon. Yellow Jacket scores **decision quality**: how far each choice sits from the
mathematically optimal play (EV-loss vs the best response), measured **information-set only** — over the
opponent's range and unrealized runouts, never the revealed cards. That single change removes chance from
the *measurement* and makes skill legible, poker's version of golf's strokes-gained or chess's
centipawn-loss.

**Measured consequence:** grading decisions instead of outcomes is **18.8× lower variance** at equal sample
(`yj-full-loop.js`), and a prior engine study measured ρ≈0.92 on the decision-grade vs ρ≈0.05 on the chip
outcome. Skill, correctly scored, is dominant.

## 2. Why it's defensible (the moat)

- **A correct, non-inverting oracle.** Most graders quietly degrade into outcome-correlated noise; the
  binding failure is a flawed baseline. We prove ours never inverts (best-response grades exactly 0, ρ=1.0
  monotone with skill) at every scale we can solve in closed form, and prove the abstraction pipeline is
  **non-corrupting byte-for-byte** on a ground-truth subgame.
- **A payoff-aware abstraction nobody else needs.** Because our payoff is golf-stroke-dominant (not chip
  equity), standard equity bucketing throws away ~29% of the signal (measured). Our golf-class-aware
  abstraction cuts oracle error **84–92%** at equal budget — a genuine, measured invention.
- **A sealed, cryptographically-hardened skill ledger.** Every grade is committed and encrypted the instant
  it's computed, unreadable until round end, then re-derivable — and a forged grade **fails to recompute
  from the public hand history**. Publicly-verifiable VRF (operator can't grind randomness) + threshold key
  custody (no single party holds the seed). Nobody in this space has this.
- **A skill wage.** No poker product pays a continuous, skill-only career dividend — because none could
  measure skill cleanly enough. We can.

## 3. The complete system — 16 modules, ~76 gates, all passing

| Layer | Module(s) | Proven |
|---|---|---|
| **Grader** | `kuhn-grader-gate` · `yj-honeystroke-gate` · `yj-multistreet-gate` | Exact, info-set-only, monotone; models the full Honey-Stroke rules (golf + brick ladder + tie-carry + matched-total betting) |
| **Oracle v0** | `s1`–`s4` (+ `s3` cache) | Real-card abstracted Hold'em; golf-class-aware buckets; anti-flawed-oracle anchor; two-street range update |
| **Rating** | `rating-engine` | Volume gate (top-decile precision ~0.5 at ≥40 events, ~0 below), confidence-weighting, α=0.8 blend — all reproduce the measured optima |
| **Integrity** | `sealing` · `crypto-hardening` | Commit-reveal + AES-GCM + Merkle; RSA-FDH-VRF + Shamir k-of-n; forgery/tamper/reorder all detected |
| **Variance** | `aivat` | Unbiased 6.7× reduction; honestly variance-only |
| **Coverage** | `coverage` | 52-card grade table by sampling + backoff; 100% coverage, generalizes, converges |
| **Scale** | `cache-at-scale` | Sharded, versioned, incremental rebuild, >1M lookups/s, deterministic |
| **Economy** | `economy-runner` · `competition-and-payouts` (+ `treasury-curve`, `overlay-ramp`) | Two bases proven: single events pay on **score** (a sport — 19% top-skill wins, upsets common); the leaderboard pays on the **skill grade** (weekly/monthly/annual, corr→1.00, compensates the skilled-but-unlucky); solvent, pool-conserved, self-funded + sponsors additive |
| **Capstone** | `yj-full-loop` | The entire pipeline in one run: graded → sealed → verified → rated → anti-cheat → paid, with a **human** money-leader and bots excluded |
| **Pilot** | `pilot-harness` | Pre-registered stats battery (ICC, split-half, power, H1), validated on ground truth; ready for real logs |

**Verify anything:** `node <module>.js` prints its own PASS/FAIL gates. Nothing here is asserted without a check.

## 4. The economy — two DIFFERENT bases (the crucial distinction)

Yellow Jacket pays on two different things, and the difference is the whole design:

1. **Single events → paid on the SCORE OUTCOME.** The day's golf+honey result decides the purse.
   Score is skill-tilted but variance-present: sometimes a less-skilled player plays well or gets favorable
   bounces and wins. **That is not gambling — it is exactly how a competition of skill works** (a golf
   tournament, a tennis match). Measured (`competition-and-payouts.js`): the top-decile-skill player wins
   single events **19%** of the time (vs 10% by chance) — skill matters, but ~81% of events an underdog
   takes it. Correlation of skill with a single event's finish is only **0.12**. Free **AMOE** access;
   self-funded from entries, with sponsor purses added on top.
2. **The forever career leaderboard → paid on the SKILL GRADE.** A *sized, sustainable %* of revenue funds
   continuous, skill-only payouts on rolling **weekly / monthly / annual** boards, ranked by the decision-
   grade (not the score). Over aggregation the grade's correlation with true skill **sharpens 0.82 → 0.98
   → 1.00** across the three horizons — so the leaderboard **compensates the skilled-but-unlucky** whom
   single-event variance shortchanges. Measured: leaderboard money reaches the truly skilled (top-earner
   precision **0.94 vs 0.22** for events); a top-15%-skill unlucky player earns a **$39.6k wage vs $2.9k in
   purses**. **This is the invention: a paycheck that tracks measured decision quality, decoupled from the
   luck of any single night** — the way golf's money list and cycling's GC reward sustained skill above the
   variance of one round. Demonstrated on a modeled $23.36M leaderboard treasury (weekly $7.0M + monthly
   $7.0M + annual crown $9.3M), pool-conserved, volume-gated, confidence-weighted, AIVAT-tightened for the
   weekly tier.

## 5. Legal posture (honest)

Strongest *available* posture, **not settled law** — we'd be the test case. The structural argument mirrors
established sport: a **single event** is a legitimate contest of skill decided by the day's score (with
bounce-luck, like any golf tournament — measured: skill wins 19% vs 10% chance), while the **career
leaderboard wage** attaches to the **skill grade aggregated over the season** (skill-predominant via √N,
correlation → 1.00 — the PGA-money-list / cycling-GC shape). The **leaderboard/dividend layer is the
cleanest** (pure skill grade, no win/lose); the **event-prize layer is a bounce-luck sport**, per-state
risk on the pay-in + variance. The **grader is the evidence**, and it's reproducible. Per-state attorney
opinions are mandatory; this is not legal advice. Full mapping in `CONTEST_OF_SKILL_EVIDENCE.md` (E1–E9).

The key honest nuance, now measured: per-*decision* skill is a small variance fraction (~5%); it becomes
**dominant in aggregate** (projected 200-decision reliability 0.89). That is *why* cash must attach to the
standing — and the pilot instrument proves it quantitatively.

## 6. State: done vs remaining

**Retired (method / architecture / research risk):** the grader, the oracle + abstraction, the rating +
volume gate, the sealed + hardened ledger, variance reduction, coverage, the serving layer at scale, the
economy, the anti-cheat, and the pilot instrument — all built, cross-validated, reproducible.

**Remaining (execution only, no invention):**
- Deploy the distributed solve cluster (architecture + serving proven).
- Run a real human pilot through the validated instrument (protocol + harness ready).
- Obtain per-state legal opinions using the evidence dossier.
- Live player UX iteration.

**The bottom line:** a defensible, demonstrable, cryptographically-hardened technical moat with the legal
argument packaged — waiting on infrastructure, data, and lawyers, not on any unsolved problem.

---

*Entry points: this summary → `YELLOW_JACKET_MASTER_SCOPE.md` (the totality) →
`HOLDEM_ORACLE_V0_SCOPE.md` (the grader build) → `GRADER_INTEGRATION_SCOPE.md` (grade→money precision
contract) → `CONTEST_OF_SKILL_EVIDENCE.md` (legal). Reproduce with `node <module>.js`.*
