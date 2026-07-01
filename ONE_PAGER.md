# Yellow Jacket
### The first card game scored like a sport.

---

**The problem.** Every card game in history is scored on **who won the chips** — an outcome that luck
dominates over any short session. That's why poker can't be a clean sport, can't pay a salary, and can't
escape the "gambling" box: it measures the coin flip, not the player.

**The invention.** Yellow Jacket scores the **decision**, not the outcome — how far each choice sits from
mathematically optimal play, judged only on what the player could actually know (no hindsight). It's
poker's strokes-gained: the luck is removed from the *measurement*. The same number is the **referee**
(who's playing best), the **payroll** (who gets paid), and the **legal evidence** (that skill, not chance,
decides).

**The proof.** Scoring decisions instead of outcomes is **~19× less noisy** than scoring chips — skill
becomes the signal instead of the static. Built and independently checked end-to-end: **15 software
modules, ~70 automated correctness tests, all passing**, from the grading engine to a live payout run to a
cryptographically-sealed, tamper-proof skill ledger. Anyone can re-run every claim.

**The economy.** Two ways to earn — decided by two different things, on purpose:
- **Single events** — free to enter, won by the day's **score**. Skill tilts it, but sometimes an
  underdog plays well or catches good bounces and wins — exactly like a golf tournament or a tennis
  match. A real sport, not a coronation (measured: the best player wins ~19% of events, not 100%).
- **A career skill-wage** — a sustainable share of revenue paid **continuously** to the best
  *decision-makers* on weekly/monthly/annual leaderboards, ranked by **measured skill, not by who got
  lucky that night**. Over the season, skill dominates — so the wage carries the great player who ran
  cold in single events. A paycheck that tracks *how well you play*. No game has ever offered this,
  because none could measure skill cleanly enough. Self-funded by the players; sponsor purses add on top.

**The moat.**
- A grading oracle that's provably **correct and un-gameable** (where rivals silently degrade into noise).
- A **sealed, VRF-hardened** skill ledger where a grade **cannot be forged or back-dated** — no operator,
  no cheater, no bot can touch it.
- Anti-cheat that **catches solver-bots and pays only humans** — demonstrated live.
- The measurement lab *is* the legal defensibility, and it mirrors real sport exactly: **single events**
  are a bounce-luck contest decided by score (legitimate skill competition, like a golf tournament),
  while the **career wage** attaches to **measured skill aggregated over the season** — the way cycling's
  GC and golf's money list already earn their legal footing, not single-event variance.

**The honest part.** Real-money gaming law is unsettled and per-state — we'd be the test case, and we've
built the evidence to be one. Everything to date is validated on models and synthetic players; the method
is proven, the real-world rollout (a human pilot, a compute cluster, per-state counsel) is execution, not
invention. We wrote the honest version down because a moat that survives due diligence is worth more than
a pitch that doesn't.

---

*"A free-to-enter sport where anyone can earn a living wage for playing well — and the scorecard is
unforgeable."*

**Status:** technical foundation complete and reproducible. **Next:** deploy, pilot with real players,
per-state legal opinions. **Reproduce any claim:** `node <module>.js`. Full record: `EXECUTIVE_SUMMARY.md`.
