# Yellow Jacket Tour — General Classification (GC) Strategy & Skill Architecture

**Thesis.** Yellow Jacket Tour is not "poker with a leaderboard." It is a **transparent, continuous, never-ending global General Classification** — a *Tour de France run over a poker-golf medium*. Single events carry the variance (the stage drama); the **GC standing over the season is where skill lives and where prizes attach.** This document is the measured foundation, the design, and the open questions.

> Naming: the brand already encodes this — *Tour de Bourdon*, the **yellow jacket = the maillot jaune**, Majors = mountain stages, the Main Event = the Champs-Élysées finish. The structure was always a Tour.

---

## 1. What we measured (the evidence base)

All numbers from the engine (`index.html`) and the calibrated proofs in this folder (`gc-position-policy.js`, `gc-press-test.js`). Honest, reproducible.

| Finding | Result | Implication |
|---|---|---|
| **Single-event card skill is compressed** | heads-up 72-hand outcome ρ ≈ 0.05; max-gap win-rate ~56% | One event is mostly variance — *by design* (stage drama). Don't hang skill on it. |
| **Skill grows with hands (√N)** | same-opp win-rate: N=1→52%, 72→62%, 288→72%, 600→80% | Skill is real; it *accumulates*. More hands ⇒ more obvious — monotonic. |
| **Rotating opponents < same opponent** | rotating/field regime stays ρ≈0.05 | You can't build a read across rotations; opponent-draw variance contaminates a single event. Aggregation (the season) is what concentrates it. |
| **EV-loss is the real card-skill axis** | win-rate tracked the *measured EV-loss gap*, not the skill *parameter* (which was non-monotonic) | Calibrate bots/tiers by **EV-loss (bb/100)**, not an abstract skill knob. |
| **Positional/GC skill DOMINATES card skill** | in a cut tournament with *variance control*: a positional-only player wins **4.5× fair** vs a card-skill player's **1.8×**; equal-cards, position-aware beats tight **90.6%** | The biggest skill axis is *navigating the GC* — and our card-only measurements never captured it. |
| **But the engine's `aggression` is NOT a variance lever** | wiring position-aware aggression into the engine gave **zero ρ lift** (0.038→0.031) | Your cards dominate score variance and you can't control them; aggression only moves EV. The bold-play theorem has nothing to grip. |
| **A per-hole PRESS unlocks it — 5×** | selective, read+position-driven press lifts per-tournament ρ **0.04 → 0.20** (control: random press ≈ flat) | A real, player-controlled *leverage* lever makes positional/leverage skill express. Optional, but powerful. |

**The synthesis:** positional/leverage skill is the dominant axis and is real — but the current game gives players *no variance lever* to express it, so today the GC is still card-luck per event. **Skill becomes reliable through season aggregation (√N) regardless; a Press would let it express within single events too.**

---

## 2. The GC structure

- **The standing (GC):** cumulative golf score (lower = better) across every event a player enters, continuously, season after season. This *is* the Hive Rating's outcome backbone. Every event type — heads-up, multiway, daily, weekly — feeds the one standing. *You are always on the Tour.*
- **Stages & weights:** Regular stages (1.0×), **Majors / "mountain stages"** (≥1.35×), the **Annual Main Event / Top Pot** (≥1.6×) — the blowout finale (parades, fireworks, hospitality; the Masters Sunday / Champs-Élysées). Weighting concentrates the season's meaning into the big events.
- **Cut lines:** golf-style cuts within events; for the season, a rolling money/eligibility line. **Visible in real time to all players** — this is the strategic surface.
- **Cash attaches to the STANDING, not single-event variance.** This is the load-bearing rule: it makes the prize-bearing element the skill-predominant one (the GC), keeps the legal posture a bona-fide contest of skill, and (per §1) rewards *positional skill* rather than *gambling variance*.

---

## 3. Position-aware decision layer (the AI/strategy core)

Grounded in **Dubins–Savage bold play / Pestien–Sudderth continuous red-and-black**: to maximize P(reaching a goal) in a sub-fair game, **bold when behind, timid when ahead.**

- **State:** `(gap, holesLeft)` — projected margin to the relevant threshold (cut / leader / money line) and variance-weighted holes remaining.
- **Policy:** `a*(gap,holesLeft) = 0.5 − 0.5·tanh(z·k)`, `z = gap/(SD·√holesLeft)`. Behind ⇒ bold; ahead ⇒ timid; steep near the line. Wraps the card-EV AI (card layer = *what's +EV this hand*; position layer = *how much variance to take given where I stand*).
- **Objective-dependent (the real GC nuance):** survive cuts with timid reliability, then **attack the final mountain stage** to win outright. (Proof `gc-position-policy.js` EXP 1b: pure-aggressive wins *outright* more, position-aware is far more *reliable* — so prize design decides which is rewarded: **pay the standing ⇒ reward positional skill; pay single-event outright wins ⇒ reward variance.**)
- **Caveat (measured):** this layer only *moves the needle* if players have a real variance lever (see §6, the Press). Wired onto the current engine's `aggression`, it produced no lift.

Reference implementation + the dominance proof: `gc-position-policy.js`.

---

## 4. GC-strategy skill measurement (the second rating axis)

The analog of EV-loss, for the strategic layer:

> **`PositionLoss` = distance between the player's chosen aggression/leverage and `a*(gap, holesLeft)`** at each decision.

A skilled navigator is bold when behind the cut, timid when safe, and spends leverage on high-weight stages. The Hive Rating becomes **two axes**: `card-EV quality` (solver-graded, the existing grader) **+ `positional/leverage quality`** (this) — and §1 shows the positional axis is where skill *most* separates. This is also the cleanest legal evidence (it measures *strategic* skill directly).

---

## 5. Visible-cut-line game theory, solved per event type

One value-function framework, parameterized by the **objective**:

| Event type | Objective | Optimal posture |
|---|---|---|
| Stroke-play w/ cuts (Major) | survive cuts → win | timid-to-survive; bold on the bubble near each cut; attack the final stage |
| Continuous GC (season) | season standing | aggression/leverage scales with standing-vs-target × stage weight ("save legs for the mountains") |
| Single-elim bracket | binary win the match | match-play: bold when behind *in the match*, timid when ahead |
| Cash | chip EV (no standing) | position layer **off** — straight EV / bankroll stop-loss |

**Mitigations for a visible board:**
- **Bubble bunching** (everyone near the cut gambles) — *feature:* the *exact* right boldness is the skill (proven to separate).
- **Tanking** — neutralized by **GC/Swiss seeding**: tanking worsens the GC you're optimizing.
- **Collusion / soft-play** — neutralized by **random opponent rotation** (can't reliably collude with someone you rarely face) + the detection stack for residue.

---

## 6. The Press — OPTIONAL leverage mechanic (proven 5×, decision pending)

**DECISION (made): SHIP WITHOUT PRESSES.** Simpler game; skill is carried by **season aggregation** (§1–2, √N over the Tour standing). The press was acceleration of *single-event* skill, never the source of skill — so dropping it costs nothing structural. The material below is retained as the rationale + the option to revisit. **Load-bearing consequence: because per-event skill is low (ρ≈0.05) and the skill lives in the aggregate, cash MUST attach to the season GC standing, not single-event variance** — that one rule is what makes the contest skill-predominant and legally defensible. (DECISION below was the prior open question; the measured press analysis stands as the record of why the per-hole selection press — not the Nassau timing press — would have been the only skill-expressing version, had we wanted it.)

### Two press designs — and only one expresses skill (measured)

| | **Per-hole SELECTION press** (recommended) | **Authentic Nassau / TIMING press** |
|---|---|---|
| Mechanic | declare a press on a single hole → it counts M×; limited budget | commit: the *rest of the segment* counts at +weight; additive stacking; settles at segment end |
| Trigger / skill | press the holes where you have a real **edge** (read your +EV spots) | press when you're **behind the cut** (bold-play timing) |
| What it amplifies | **edge ⇒ card SKILL** (good players find +EV spots) | **position ⇒ LUCK** (position is mostly card variance) |
| Measured ρ effect | **0.04 → 0.20 (5×)** — `gc-press-test.js` | **0.046 → 0.042 (NONE; slightly negative)** — `gc-nassau-test.js` |
| Sensitivity | rises with read accuracy (2.3× weak → 6× elite) | **falls** as timing accuracy rises (0.061 → 0.019): optimal bold-play is universal ⇒ it *equalizes* and washes skill out |
| Verdict | **the skill lever** | **drama only — anti-skill as a primary mechanic** |

**The rule this revealed:** a press expresses skill *only if the press decision itself is hard and skill-laden* (reading a +EV spot). If the trigger is a simple position-response ("press when behind"), it amplifies luck and — played well by everyone — *reduces* skill differentiation below the no-press baseline. **Timing-when-behind is low-ceiling and learnable; spot-selection is high-ceiling.**

**Spec (recommended) — the SELECTION press, Honey-Stroke native:**
> Once per hole, before betting, a player may declare a **Press**: this hole counts at **M× weight** on the GC scorecard (golf *and* honey). **Limited press budget per round** (scarcity ⇒ the selection skill). Near-EV-neutral.
- **Risk symmetry (self-balancing):** press a birdie → M× under par; press a brick you lose → M× the Stack-Bricks blow-up. Over-pressing self-punishes.
- **Skill = which holes** — press where your read says you have edge. (This is the bit that separates players.)

**On the authentic Nassau commit-press:** keep it, if at all, **as a drama device** (the committed "she pressed the back 9!" moment), *not* as a skill differentiator — the measurement says it doesn't separate skill and can hurt it. A hybrid is possible: a *commit* press that may only be opened on a **read-identified +EV spot** (so the skill is the read, the drama is the commit) — untested, but it's the only way to get both.

---

## 7. Team mode (Tour de France)

Teams sign up; **games stay heads-up; opponents rotate to non-teammates** until a winner emerges.
- A **team classification** runs alongside the individual yellow jacket (Tour's team vs GC vs points jerseys).
- **Domestique dynamics emerge for free:** beating a rival in your heads-up takes strokes *from* their GC, so a team collectively grinds down their leader's rivals — without ever directly "helping" a teammate (which the 1v1 medium forbids). Organic team strategy *and* collusion-resistant (random rotation).

---

## 8. Honest open questions
- **Human read accuracy** is the parameter the Press lift hinges on (§6 sensitivity). Resolve with a human pilot.
- **Per-event vs season skill:** single events stay variance-heavy (good for drama); skill confidence requires the season aggregate. Set prize/eligibility cadence accordingly (the ≥40-event gate is the volume floor).
- **Press: build or not** — measured-positive but adds complexity; the GC works without it.
- **Card-skill calibration:** rebuild bot tiers by *measured EV-loss*, not the skill parameter (which we proved unreliable).

---

## 9. The combined skill stack (so it's not over-sold)
Total Hive Rating skill signal = three additive sources:
1. **Card-decision quality** — solver-graded EV-loss (the grader; solver now fixed).
2. **Positional/leverage quality** — §4 (the dominant axis; needs a variance lever like the Press to fully express within events).
3. **Season aggregation** — √N over the Tour (compounds any per-event edge into a strongly skill-determined standing).

No single piece makes ρ=0.9. Together — and especially via aggregation — they make the **GC standing** genuinely, defensibly skill-determined. That standing is the product, the prize basis, and the legal foundation.

*Proofs in this folder (all node-runnable): `gc-position-policy.js` (positional play dominates fixed play, 4.5×), `gc-press-test.js` (per-hole SELECTION press unlocks skill, 5×), `gc-nassau-test.js` (authentic Nassau TIMING press does NOT — it amplifies luck and equalizes). The contrast between the last two is the key design lesson: **a press is a skill lever only when the press decision is a hard read, not a position-response.***
