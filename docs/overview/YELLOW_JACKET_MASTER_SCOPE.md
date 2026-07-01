# Yellow Jacket — Master Scope (Control Tower)

*The single source of truth for the totality. Every other doc is a deep-dive; this is the index, the
architecture, the build ladder, and the honest proven/unproven ledger. Read this first.*

> **The one-sentence thesis:** Yellow Jacket is the first card game scored like a sport — every
> decision graded against optimal play (poker's strokes-gained), sealed and unforgeable, aggregated
> into a lifetime skill score that drives a continuous, free-to-enter, anyone-can-earn career economy.
> The grader is the moat, the referee, the payroll engine, and the legal evidence — all one artifact.

---

## 1. The seven pillars (the totality)

| # | Pillar | What it is | Deep-dive doc |
|---|---|---|---|
| A | **The Sport** | Hold'em hands scored in a golf "Honey-Stroke" layer; heads-up + multi-way; cash + tournament; free + paid. | (engine `index.html`, `RULES.md`) |
| B | **The Grader** (moat) | Per-decision EV-loss vs optimal, **info-set-only (no hindsight)**, sealed. Official = GTO-adherence; shadow = exploitation/mimicry (integrity + hot-hand intel). | `SKILL_GRADER_MANIFESTO.md`, `INTEL_FIELD_UNIVERSAL_GRADER.md` |
| C | **The Rating** | "Yellow Jacket Score" = grade aggregated via Bayesian rating (TrueSkill2/WHR-style) with **confidence/volume weighting**; cold-start GTO-prior → personalization. | `INTEL_FIELD_UNIVERSAL_GRADER.md` §3 |
| D | **The Economy** | **Two earnings layers** (below). Free **AMOE** access; consideration scraped to fund the career board. | `MONETIZATION_FRAMEWORK.md`, `treasury-curve.js`, `overlay-ramp.js` |
| E | **The Competitions** | Continuous global GC (**Tour de Bourdon**, sponsored teams of 4), **World Cup** (top players per country), majors, annual main event. | `GC_STRATEGY.md` |
| F | **The Legal Posture** | Contest of skill (golf model). Dividend layer = cleanest; event-prize layer = per-state risk; grader = the evidence; AMOE = free-to-win. | this doc §5 |
| G | **The Tech Stack** | Partner build (Next/Nakama/Clerk/PixiJS/BLS-VRF/Chia) + our grader/rating/economy engines + the sealed Intel-Field ledger. | (`yellowjacket-tour` repo) |

---

## 2. The Grader — the load-bearing column (everything routes through B)

- **Metric:** EV-loss = `bestResponseEV(field) − chosenEV`, per decision, every street.
- **Official = GTO-adherence** (field = balanced/Nash): opponent-independent, fair, legally strongest.
  **Shadow = exploitation** (field = actual) + **MimicryFlag**: hot-hand intel + the **primary
  anti-cheat** (pure-GTO-official is RTA-bait; a solver-bot scores ~perfect on the official metric, so
  the human-exploits-field-vs-bot-plays-GTO-pure delta is the bot tell). *Unification: GTO and
  exploitation are the same engine with `field = Nash` vs `field = actual`.*
- **Hard rule — info-set only, NO hindsight:** grade over the opponent's *range* × *unrealized
  runouts*, never the revealed cards/outcome. (A correct +EV draw-call that bricked scores ~0, not a
  mistake.) Best-response to a *fixed* opponent model (no equilibrium fixed-point = the "lightening").
- **Sealed Intel Field:** each grade computed instantly, **encrypted under the round's unrevealed
  serverSeed** (commit-reveal + BLS-VRF), unreadable by anyone (incl. operator) until the round ends,
  then re-derivable + verifiable. Lifetime "tesseract" ledger, sliceable by every axis.
- **Player sees Accuracy %** (golf-like headline); the rating runs on **raw EV-loss** (magnitude
  counts).

---

## 3. The Economy — two layers, one scrape (D)

1. **Event prizes** — pay-to-enter purses (golf model); winners cash per event terms. Skill-driven
   but **variance-laden** (the LeBron truth: the best player loses Finals). The drama + the funding.
2. **The forever Yellow Jacket career leaderboard** — a defined % of all consideration (rake / entry /
   sweeps / skins / store) funds **continuous, skill-ONLY, no-win/lose** payouts on **rolling
   weekly / monthly / annual** boards, ranked purely by the grade. Runs a year at a time, stores
   forever. **Weekly = accessible (variance OK, smaller); annual + dividend = sustained, high-
   confidence, big.** Confidence weighting stops a hot newcomer leapfrogging a proven vet.
   *This is the invention: a wage that tracks measured decision quality, decoupled from event variance.*

**"Anyone can win life-changing money"** = free **AMOE** entry + broad payouts to the masses by skill
grade. Not a raffle, not winner-take-all — a continuously-paying skill economy anyone can climb onto.

**Discipline:** the dividend is a **sized, sustainable % of revenue**, never an open-ended promise.

---

## 4. The build ladder (B is gated; each rung passes before the next)

| Rung | Goal | Status |
|---|---|---|
| **Kuhn gate** | Prove the *method* (monotone, info-set-only, no-hindsight) on an exactly-solvable game | ✅ **PASSED** (`kuhn-grader-gate.js`): BR-to-field=0 unique-min, ρ=1.0, 72h ranks 0.10-gap 76% |
| **YJ Honey-Stroke gate** | Prove the COMPLETE EV-of-action (unified golf−honey/divisor + **brick ladder** + **tie-carry** + matched-total proposals) — the 3 rules that make YJ not-generic-poker, all of which the engine's own `cfrTerminalPayoff` gets wrong | ✅ **PASSED** (`yj-honeystroke-gate.js`, exact): BR=0 unique-min, ρ=1.0, 72h conc 76%, brick ladder punishes over-commit 79× harder than flat-+1 & flips the brick BR (the engine is blind), tie-carry `(2w−1)(pot/2)` modeled (policy-invariant → biases rating not policy). Finding: skill lives in **strokes & sizing**, not pot-win-rate (card-determined). |
| **Multi-street gate** | Prove the method survives a **public board that updates the range** across two escalating streets (the one new thing above; the faithful rebuild of the NaN'd off-spec `leduc-grader-gate.js`) | ✅ **PASSED** (`yj-multistreet-gate.js`, exact): BR=0 unique-min, ρ=1.0, 72h conc **84.7%** (more decisions/hand than single-street), the BR is **board-conditioned for all 3 private hands** (pairing flips check↔bet — the range update is load-bearing), brick ladder still load-bearing 5.1× on the larger street-2 pots. Supersedes `leduc-grader-gate.js`. |
| **Hold'em oracle** | Abstracted CFR+/value-net solve + **offline solve-cache**; pass the same gates on real spots | ▶ **NEXT** (Pluribus-class) |
| **Distillate** | Compress to a portable value/policy net (microsecond on-device grading) | pending |
| **Sealed ledger + rating + economy** | Intel-Field commit-reveal, Bayesian YJ Score, payout engines | pending (partly prototyped) |

**Acceptance gate (every rung):** strong policy **monotonically out-grades** random, low variance,
info-set-only, no hindsight, solver-validated.

---

## 5. Legal posture (honest)

- **Strongest available posture, NOT settled law.** We'd be the test case for a poker-derived game.
- **Dividend layer = the clean one** (pure skill grade, no win/lose, chance removed → genuine contest
  of skill, golf-like). **Event-prize layer = riskier** (pay-to-enter + variance in who wins → closer
  to skill-gaming, lives/dies on each state's skill-vs-chance test). **Per-state opinions mandatory.**
- *White v. Cuomo* (2022, NY) struck DFS down — **not** supportive precedent. AB 831 + the sweeps
  crackdown are live threats to chance-based models — which is why our **measured contest of skill** is
  a *stronger* footing than social-sweeps, and the grader is the evidence that must hold up.
- **Not legal advice.** The grader's correctness is the factual record the whole posture rests on.

---

## 6. Where we beat state-of-the-art (the "alien tech")

- **Decision-grader as payroll for the masses** — no poker product pays a continuous skill wage; we can
  because we grade decisions (chance-removed), not outcomes.
- **The sealed Intel Field** — real-time, encrypted, unforgeable per-decision ledger; nobody has the
  commit-reveal-sealed skill ledger.
- **Opponent-agnostic grade** — survives opponent rotation (every 18 hands) and bot-fill, because it's
  graded vs optimal-for-your-situation, not vs beating a specific player. (Measured.)
- **One grader, every format** — best-response-to-field (not Nash) unifies HU / multi-way / cash /
  tournament via a value-transform + field-model swap.

---

## 7. Open / unproven (honest ledger — research widely where flagged)

- **Oracle correctness at Hold'em scale** — the current engine grader is BROKEN (inverts); a *correct*
  oracle is unbuilt. **Research:** SOTA CFR+ / DeepStack / ReBeL / Deep CFR / ESCHER + AIVAT (the
  swarm-research prompt `GROK_SWARM_RESEARCH_PROMPT*.md` targets this).
- **AIVAT integration** — variance-reduction for sample-efficient weekly ranking (not the verdict).
- **Multi-way Shapley** — cost (exponential → sampling) + cold-start circularity. Research.
- **Sealing** — commit-reveal + threshold encryption sized; full ZK-of-grade deferred.
- **Dividend sizing** — the sustainable revenue % (treasury-curve / overlay-ramp).
- **Per-state legal** — the contest-of-skill test, state by state, for a poker-derived game.

*Doc map: this (control tower) → `SKILL_GRADER_MANIFESTO.md` (why decisions) →
`INTEL_FIELD_UNIVERSAL_GRADER.md` (the universal grader + sealing + multi-way + tournament) →
`GC_STRATEGY.md` (competitions) → `HUMAN_SKILL_PILOT.md` (human validation) →
`GRADER_PIPELINE_SCOPE.md` (engineering) → gates: `kuhn-grader-gate.js` (✓), Leduc (next).*
