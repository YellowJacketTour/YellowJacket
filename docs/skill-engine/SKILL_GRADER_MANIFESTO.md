# Yellow Jacket — The Skill Grader Manifesto (Decision-Quality as the Sport)

**The thesis (validated).** Yellow Jacket becomes the first *pure-skill poker sport* the moment the
result is the **graded quality of every decision**, not the chips won. Card luck is removed at the
**grading layer** — each decision is scored against the maximum-EV option *for that player's own
unique situation* (their cards, the runout, the bets, the opponent) — so luck never enters the
score, and **no two players ever share a deal** (which would be a cheating vector). This is poker's
**strokes-gained** — the move that turned "did the putt drop" (variance) into "how good was the
stroke" (skill), and made golf a measurable sport.

---

## 1. The proof (measured this session, engine + model)

**Same single matches, two scoring functions — ρ(true skill, score):**

| match length | scored by **chips won** (outcome) | scored by **decision-grade** |
|---|---|---|
| 72 hands | **0.059** | **0.925** |
| 18 hands | 0.021 | 0.775 |
| 9 hands | 0.028 | 0.650 |

(Outcome tuned to reproduce the real measured ρ≈0.05; the grade has no card-luck term so it
concentrates with the number of decisions.) **Even a 9-hand match graded on decisions is more
skill-defined than a 72-hand match scored on outcome.** The "skill only emerges over a season"
limit was an artifact of scoring the *outcome*. Score the *decisions* and single events are
skill-predominant.

> Career aggregation still *raises* confidence further (more decisions → tighter estimate), but it
> is no longer *required* for skill-predominance. The grade is skill-predominant per match.

---

## 2. The cold water — the current grader is BROKEN (must be fixed first)

Measured per-skill mean EV-loss from the engine's own grader (`evLossSum/evDecisions`):

| skill | 0.20 | 0.35 | 0.50 | 0.65 | 0.80 | 0.95 | random/bad bot |
|---|---|---|---|---|---|---|---|
| mean EV-loss | 8.62 | 8.66 | 8.71 | 8.09 | 9.08 | **9.29** | **8.19** |

**Flat ~8–9 for everyone, non-monotonic, the strongest bot scores *worst*, and a deliberately
random bot scores *better*.** The instrument that the entire vision depends on does not currently
measure decision quality. **This — not the concept, not the law, not the UI — is the real
gatekeeper.** The grade is only as real as the grader.

Root cause (consistent with prior findings): the **max-EV baseline is wrong**. The CFR/solver had
documented bugs (infoset-key aliasing, non-zero-sum payoff under zero-sum negamax, single-villain
MCCFR under-convergence). If "evOptimal" isn't actually optimal, EV-loss measures *alignment with a
flawed estimate*, not skill — exactly the inversion observed.

---

## 3. Why NOT duplicate deals (the correction)

Duplicate bridge normalizes luck by giving everyone the same deals — but that only works **in-person,
simultaneous, controlled**. Online and async, identical/repeated deals get **solved and shared**:
the deal becomes public knowledge → collusion/RTA on a known board. **Duplicate deals are a cheating
vector. Rejected.** Luck is removed by grading each *unique* deal against its own optimum, not by
repeating deals.

---

## 4. The architecture — the "perfect matrix algorithm" / career ledger

A **totally-encompassing career data ledger**: every click of every player, forever.

- **Atom = one decision.** For every betting decision on every street of every hand, record a rich
  **feature vector** (the "11D" distillation) of every knowable variable at that moment:
  `street, position, hole-equity, range-advantage, board texture, pot odds, SPR/stack depth,
  bet-sizing, opponent-model state, history, time-on-clock, …` — plus the **EV of every available
  action** and the **max-EV** among them.
- **Per-decision score = EV-loss = max-EV − chosen-EV** (≥ 0; perfect play → 0). The atomic,
  objective, card-luck-free skill signal.
- **Aggregation = the distillation.** Mean (and distribution) of EV-loss over any slice — this hand,
  this round, this event, this **season**, this **lifetime** — and conditioned on any feature axis
  (skill *in 3-bet pots*, *on the river*, *short-stacked*, *vs aggression*…). The ledger turns raw
  play into a true, multi-dimensional skill vector per player.
- **Two clocks:** a **season** value (the competitive standing / Hive Rating outcome) and a
  **lifetime** value (the career body of work — the legal + reputational bedrock).

This is simultaneously: the **sport's referee**, the **rating engine**, the **legal evidence
ledger**, and the **technical moat**. One artifact, four jobs.

---

## 5. The two EV baselines (the one real subtlety)

- **GTO EV-loss** (deviation from Nash) — opponent-independent, objective, uncontestable. The
  **bedrock**. Lead the official skill score with this.
- **Exploitative EV-loss** (deviation from max-EV *vs the opponent's actual strategy*) — needs an
  opponent model; it's where the *highest* skill lives (out-playing a specific human) but it's
  noisier and contestable. A **second jersey**, not the bedrock verdict.

Design choice, not a blocker: the official result can be GTO-EV-loss (clean), with exploitation as a
secondary, modeled axis (the `ExploitCapture`/`OppModel` work).

---

## 6. Acceptance tests for a CORRECT grader (the gate everything passes through)

A grader is not allowed near a prize until it provably:
1. **Ranks strong > random** — a strong bot MUST score lower EV-loss than a random one. (Today it
   fails this — random 8.19 beats elite 9.29.)
2. **Monotonic with true skill** — mean EV-loss decreases monotonically across a skill ladder.
3. **Concentrates** — single-match grade ρ(true skill) ≫ outcome ρ (target ≥ 0.6 at 18 hands,
   matching §1's model once the baseline is real).
4. **Tamper-proof** — encrypted/committed per decision, revealed only at conclusion; verifiable
   against the dealt cards (commit-reveal + VRF already in the stack).
5. **Solver-validated** — the EV baseline matches an independent strong solver within tolerance on a
   benchmark suite of spots.

---

## 7. What this reframes

- **Priority #1 is the grader.** Above UI, above season-aggregation, above the rest of the roadmap.
  The grader *is* the product. Everything else decorates it.
- **Single-event prizes become defensible** (with counsel) when attached to the **graded** result,
  because the grade is skill-predominant per match (§1). The season/lifetime ledger makes it
  overwhelming.
- **The legal posture inverts from defense to offense:** not "please believe poker is skill," but
  "here is the per-decision, solver-graded, tamper-proof career ledger proving it, down to every
  click." No prior operator can produce this. That's the moat and the category-exit.

---

## The one line
**Stop scoring who won the chips; score how well they played the cards they were dealt — every
decision, every hand, for a career — against a *correct* max-EV baseline. The concept is proven
(0.92 vs 0.05 in a single match). The only thing standing between here and the first real poker
sport is building the grader that actually works — because the one we have is measuring noise.**

*Related: `HUMAN_SKILL_PILOT.md` (validate on humans), `exploit-capture-grader.md` (the exploit
axis), `GC_STRATEGY.md` (the standing/Tour layer the ledger feeds), and the CFR solver fixes (the
broken baseline this manifesto depends on).*
