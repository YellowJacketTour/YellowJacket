<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup), and the
  Tour de Bourdon season-system marks ("Tour de Bourdon", "Tour of the
  Bumblebee", "the Nectour", "the Royal Suitor", "the Pollen Trail",
  "the Top Pot", "the Hive Rating") are trademarks of Blank Canvas, Inc.
-->

# Yellow Jacket

### The first card game scored like a sport.

Golf and Texas Hold 'Em collide into a game where **every decision is graded against optimal play** — and
that grade, not the luck of the chips, is what compounds into a lifetime skill score and a career wage.

This repository is the **canonical specification + validated reference implementation**: the rules of
record, the skill-grading engine, the sealed-integrity layer, and the two-basis economy — each backed by a
`node`-runnable proof. Nothing here is asserted without a check.

> **New here?** Read [`ONE_PAGER.md`](ONE_PAGER.md) (the idea in a page) → [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md) (the verifiable synthesis).
> **Integrating the productized build?** Read [`INTEGRATION_FOR_PARTNER.md`](INTEGRATION_FOR_PARTNER.md) — it maps every component to the exact package/service to apply it in.

---

## The idea in 30 seconds

Every card game in history is scored on **who won the chips** — which luck dominates over any short
session. Yellow Jacket scores **the quality of each decision** (how close it was to optimal play), judged
only on what the player could know at the time. Luck is removed from the *measurement*. The result is
poker's *strokes-gained*: a clean, continuous, auditable measure of skill — the referee, the payroll, and
the legal evidence, all at once.

**Two ways to earn, decided by two different things — on purpose:**
- **Single events** are won by the day's **score** — skill-tilted but with real variance (sometimes an
  underdog plays well or catches good bounces and wins). A real sport, like a golf tournament.
- **The career leaderboard** pays a **wage on the measured skill grade**, aggregated weekly / monthly /
  annual — so consistent skill earns over time, carrying the great player who ran cold in single events.

---

## Repository map

| Path | What it is |
|---|---|
| [`ONE_PAGER.md`](ONE_PAGER.md) · [`EXECUTIVE_SUMMARY.md`](EXECUTIVE_SUMMARY.md) | The pitch and the verifiable synthesis |
| [`INTEGRATION_FOR_PARTNER.md`](INTEGRATION_FOR_PARTNER.md) | **How each component maps into the productized monorepo** (the integration map) |
| [`RULES.md`](RULES.md) · [`MATHEMATICAL_SPECIFICATION.md`](MATHEMATICAL_SPECIFICATION.md) · [`index.html`](index.html) | The rules of record + a complete playable build |
| [`docs/`](docs/) | Deep dives — overview, skill engine, integrity & anti-cheat, economy, IP, validation |
| [`proofs/`](proofs/) | ~20 self-contained `node` programs; each prints its own PASS/FAIL gates ([`proofs/RUN_THE_PROOFS.md`](proofs/RUN_THE_PROOFS.md)) |

### `docs/` structure
- `docs/overview/` — master scope, glossary
- `docs/skill-engine/` — the grader: manifesto, oracle build, universal grader, integration, roadmap
- `docs/integrity-anticheat/` — sealed ledger, bot detection, wire contract
- `docs/economy/` — monetization, the career skill-wage, the global competition
- `docs/ip/` — defensive publication, sovereign standard
- `docs/validation/` — the human-pilot protocol

---

## Verify anything

```
node proofs/kuhn-grader-gate.js          # the grading method is exact (best-response grades 0, rho=1.0)
node proofs/yj-full-loop.js              # the whole pipeline: graded -> sealed -> rated -> anti-cheat -> paid
node proofs/competition-and-payouts.js   # events pay on score (a sport); the leaderboard pays on skill (a wage)
```

Requires [Node.js](https://nodejs.org) only — no packages to install. See
[`proofs/RUN_THE_PROOFS.md`](proofs/RUN_THE_PROOFS.md).

---

*The technology is built and validated; the real-world rollout (production deployment, a human pilot,
per-state legal opinions) is execution, not invention. Reproduce any claim with `node proofs/<file>.js`.*
