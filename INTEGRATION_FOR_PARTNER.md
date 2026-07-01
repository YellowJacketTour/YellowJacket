# Integration Guide — canonical spec → the productized build

*This repository is the **canonical, validated specification + executable reference implementation** for
Yellow Jacket's skill engine, integrity layer, and economy. Every claim is backed by a `node`-runnable
proof in [`/proofs`](proofs/). This guide maps each component to **where it applies in the productized
monorepo** (`bullish0x/yellowjacket-tour`) so it can be ported intuitively, package by package.*

**How to read this:** the `/proofs/*.js` files are **reference implementations in plain Node** (no
dependencies). They are the source of truth for *behavior*; port the logic into the corresponding
TypeScript package/service and keep the proof as the conformance test (the ported code should reproduce
the proof's PASS gates).

---

## The map: canonical component → monorepo target

| Canonical component (spec + reference proof) | Apply in (`yellowjacket-tour`) | What to port |
|---|---|---|
| **Hand eval + Honey-Stroke scoring** — `RULES.md`, `MATHEMATICAL_SPECIFICATION.md`; `index.html` fns `evalSevenCard` / `golfScoreFromHandValue` / `resolveBrickLoss` / `golfScoresFromShowdown` | `packages/yellowjacket-core` | The canonical 7-card evaluator + the golf scorecard (Royal −5…High Card +2), the **brick ladder** for high-card losers, **tie-carry**, and **matched-total proposal** betting. These are the game's rules of record. |
| **The decision grader (the moat)** — `SKILL_GRADER_MANIFESTO.md`, `HOLDEM_ORACLE_V0_SCOPE.md`, `INTEL_FIELD_UNIVERSAL_GRADER.md`; proofs `kuhn-grader-gate`, `yj-honeystroke-gate`, `yj-multistreet-gate`, `s1`–`s4` | `packages/yellowjacket-core` (grading module) + a **solve-cache service** | EV-loss vs best-response, **info-set only (no hindsight)**; the **golf-class-aware abstraction** (equity bucketing alone loses ~29% of the signal — proven); the offline per-bucket oracle. |
| **Grade serving at scale** — `coverage.js`, `cache-at-scale.js`, `s3-solve-cache.js` | `services/tournament-worker` (or a dedicated `services/solve-cache`) | Sharded, versioned, **hierarchical-backoff** grade table; >1M lookups/s; incremental rebuild on a rules/abstraction bump (never serves a stale grade). |
| **The Yellow Jacket Score (rating)** — `rating-engine.js`, `GRADER_INTEGRATION_SCOPE.md` | `services/tournament-worker` | Bayesian rating over the grade: the **volume gate** (pay nothing without volume), **confidence-weighting** (RD), the **α=0.8** decision/outcome blend, cold-start GTO prior. |
| **Sealed Intel-Field ledger (integrity)** — `sealing.js`, `INTEGRITY_ARCHITECTURE.md`, `YJSACRED_WIRE_FORMAT.md` | `packages/fairness` + `services/chia-anchor` | Per-decision **commit-reveal + AES-256-GCM + Merkle**; publish the Merkle root during the round, **anchor it to Chia**; a grade is unforgeable (fails to recompute from the public hand history). |
| **Verifiable randomness + key custody** — `crypto-hardening.js` | `packages/vrf` + `services/vrf-signer` | **VRF** so the operator can't grind the round seed (their BLS-VRF/Chia VRF satisfies this — our RSA-FDH-VRF is the reference/fallback) + **Shamir k-of-n threshold custody** of the seed (no single party holds it). |
| **Anti-cheat / anti-RTA** — `exploit-capture.js`, `DETECTION_TECHNOLOGY.md`; mimicry in `yj-full-loop.js` | `packages/fairness` + `services/tournament-worker` | The **exploitation/mimicry shadow**: flag solver-bots (implausibly perfect play), **exclude them from money standings**; keep the field human. |
| **The two-basis economy** — `treasury-curve.js`, `overlay-ramp.js`, `economy-runner.js`, `competition-and-payouts.js`, `MONETIZATION_FRAMEWORK.md`, `GC_STRATEGY.md` | `services/tournament-worker` + a **treasury/payout service** | **Single events pay on SCORE** (a sport — upsets happen); **the leaderboard pays on the GRADE** (weekly/monthly/annual wage). Crown-band + power-law payout curve; overlay bootstrap; self-funded + sponsor purses additive. |
| **Small-sample trust** — `aivat.js` | `services/tournament-worker` | Unbiased variance reduction so **weekly** leaderboards are trustworthy on few hands. |
| **Human-pilot instrument** — `pilot-harness.js`, `HUMAN_SKILL_PILOT.md` | `research/` | The pre-registered skill-predominance battery (ICC, split-half, power) — swap in real logs to validate on humans. |
| **End-to-end reference** — `yj-full-loop.js` | integration/e2e tests across services | The whole pipeline in one run: graded → sealed → verified → rated → anti-cheat → paid, with bots excluded and a human money-leader. Use as the cross-service conformance target. |

---

## Priority order for porting (highest leverage first)

1. **`packages/yellowjacket-core`** — the hand eval + Honey-Stroke scoring + the grader. Everything depends
   on a correct, non-inverting grade. Conformance: the `*-grader-gate` and `s1`–`s4` proofs must pass when
   re-expressed against the ported code.
2. **`services/tournament-worker`** — the rating (volume gate + confidence-weighting), the leaderboard
   aggregation (weekly/monthly/annual), and the two-basis payouts. Conformance: `rating-engine`,
   `economy-runner`, `competition-and-payouts`.
3. **`packages/fairness` + `services/chia-anchor` + `packages/vrf`** — the sealed ledger + Merkle anchoring +
   VRF. Conformance: `sealing`, `crypto-hardening`.
4. **solve-cache service** — grade serving at scale. Conformance: `coverage`, `cache-at-scale`, `s3`.
5. **`packages/fairness`** anti-cheat — mimicry shadow. Conformance: `yj-full-loop` GATE 2.

---

## Non-negotiables to preserve when porting (these are *why* it works)

- **Info-set only, no hindsight** — grade over the opponent range × unrealized runouts, never the revealed
  cards. Do not leak the outcome into the grade.
- **Best-response to a FIXED field**, not a general-sum Nash equilibrium — this is what makes the grade
  exact and well-defined for the non-zero-sum golf payoff. GTO-adherence = BR to a *balanced* field.
- **The golf-class-aware abstraction** — do not bucket by chip-equity alone; it drops ~29% of the stroke
  signal (measured in `s1-abstraction-probe`).
- **The volume gate** — no payout below the graded-event floor; it is what makes the economy fair, more
  than any oracle precision.
- **Two payout bases** — score decides the event purse; the grade decides the leaderboard wage. Keep them
  separate (it is both the product design and the legal footing).

---

## What's canonical here vs. what the productized build owns

- **This repo owns:** the *rules of record*, the *grading method*, the *integrity spec*, the *economy
  model*, and the *conformance proofs*. When these change, this repo is the source; bump and re-port.
- **The productized build owns:** the client/apps, Nakama match runtime, Chia anchoring wiring, VRF
  signer, deployment, and UX. This repo does not dictate those — only the behavior they must reproduce.

*Reproduce any behavioral claim: `node proofs/<file>.js`. Start at [`README.md`](README.md).*
