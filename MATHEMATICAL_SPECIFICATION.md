<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", and the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) are trademarks of
  Blank Canvas, Inc. The mathematical formalization of the rule system in this
  document is the proprietary work of Blank Canvas, Inc.
-->

# Yellow Jacket Tour — Mathematical Specification

**Document version:** 1.0
**Author of record:** Dalton Graham
**Owning entity:** Blank Canvas, Inc. (Wyoming)
**Date:** 2026-05-02 (re-verified 2026-05-17 against the v69.124 build)
**Build status:** anchored to the canonical production release as of the document date. Re-verification note (2026-05-17): the formal specification below has been audited against the v69.124 single-file build (`index.html` @ 2026-05-17, the v69.124-spring-cleaning ship). **No mathematical objects in this document have changed** — the Honey-Stroke scoring law, the agreed-total wagering primitive, the round-divisor normalization, the dual-variant loss rule, the pot-gated brick sub-rule, the Tour de Bourdon Kalman/Glicko-2 rating filter, the Phase C observed-action / EV-loss skill-credit term, and the field-selection / off-season / honor-eligibility transitions are all in their last-canonical form (per the v69.103 audit committed in `research/AUDIT-AND-STUDY-v69.103.md`). The work shipped during v69.107–124 is UI/UX surface (The Card, The Session Card, Hero Strip, Golden Fairway music, dead-code/CSS prune) and does not modify any object formalized here.

**Rating-signal note (decision-quality canon).** The Phase C term referenced above is the live lever for the season rating, and its measured behavior should be read as follows. A *single* 72-hand (4×18) heads-up event carries almost no skill signal — outcome-only Spearman rho ≈ 0.05, and even the max skill-gap (0.30 vs 0.90) wins only ~0.56 of the time over 72 holes (ITM ≈ a coin flip); any claim that a single event has rho ≈ 0.4 or "beats WSOP single event" is incorrect. Skill resolves at the *season* level: the Phase C decision-quality credit (EV-loss vs GTO) lifts season rho_active from ~0.15 (outcome-only) to ~0.69 clean / ~0.47–0.62 at realistic human-grade solver noise (rho ≈ 0.90 is the clean-AI ceiling, not production). The decision term is best formalized as `decision = GTOq + ExploitCapture + GTO-mimicry-penalty` (the ExploitCapture extension, modeled weight `wX ≈ 0.45`, lifts top-decile precision ~0.50→0.63; a pure-GTO bot scores 0 exploit and is mimicry-flagged), blended with outcome at `decision/outcome weight α ≈ 0.8` (pure decision at α = 1.0 is worse; the 20% outcome term regularizes and minimizes collusion leverage). The rating saturates within ~1 season, and graded *volume* (not tenure) is the lever; leaderboard precision and any payout require an eligibility gate (≥40 graded events) — at casual volume (~2.4 events/player) top-1% precision ≈ 0.00. These figures are the session-measured canon; the formal section text below is unchanged.

This document is the formal mathematical specification of the Yellow Jacket Tour rule system. Every rule, every parameter, every transformation in the playable build is restated here as a precise mathematical object: a set, a function, a state-machine transition, or a numerical map.

This formalization serves four purposes:

1. **Clarity.** A rule that survives a mathematical restatement is unambiguous. Edge cases that prose elides are forced to surface as undefined function behavior.
2. **Defensive prior art.** Any future patent claim by a competitor against substantially-similar mechanics is defeated by this dated, precise disclosure (per `IP/DEFENSIVE_PUBLICATION.md`).
3. **Patent-attorney inputs.** Where any patent path remains viable post-*In re Smith* (Fed. Cir. 2016), claim drafting is grounded in this formal vocabulary, reframing rule-of-game claims as technical-method claims (per `IP/PATENT_ATTORNEY_BRIEFING.md` §3 and §4.5).
4. **Brand asset.** Comparable to *Magic: the Gathering*'s Comprehensive Rules document, this specification signals that Yellow Jacket Tour is a designed system, not a casual reskin.

## Notational conventions

- **Sets** are denoted with capital letters (e.g., `S`, `D`, `H`).
- **Functions** are denoted with lowercase letters or words (e.g., `score(·)`, `divisor(N)`).
- **Tuples** use angle brackets (e.g., `⟨a, b, c⟩`).
- **The integer set** is `ℤ`; the rationals `ℚ`; the reals `ℝ`; the unit interval `[0, 1] ⊂ ℝ`.
- **`⌊x⌋`** denotes floor; **`⌈x⌉`** denotes ceiling; **`max`**, **`min`** as standard.
- **Hand classes** are referenced by their conventional poker names (e.g., `RoyalFlush`, `OnePair`).

---

## 1. Game-State Universe

### 1.1. The deck

Let `D` be the standard 52-card deck:

```
D = { ⟨r, s⟩ : r ∈ {2, 3, 4, 5, 6, 7, 8, 9, T, J, Q, K, A}, s ∈ {♣, ♦, ♥, ♠} }
```

with `|D| = 52`.

### 1.2. A hand

A *hole-card pair* `H` is an unordered subset of `D` with `|H| = 2`. The set of all possible hole-card pairs is `H_pairs = { H ⊂ D : |H| = 2 }` with `|H_pairs| = C(52, 2) = 1326`.

A *board* `B` is an ordered tuple of community cards `B = ⟨c₁, c₂, c₃, c₄, c₅⟩` where each `cᵢ ∈ D` and all `cᵢ` are distinct from each other and from any player's `H`.

A *seven-card showdown set* for a player `p` is `S_p = H_p ∪ B`, with `|S_p| = 7`.

### 1.3. The hand class

There are sixteen hand classes used by the build's scorecard mapping (per RULES.md §7 / `golfScoreFromHandValue()`; the earlier "Schema 0" name is the superseded historical label).
Premium-bucket thresholds below mirror `golfScoreFromHandValue()` in the build exactly:

```
HandClass = {
  RoyalFlush,
  StraightFlush,
  FourOfAKind,
  FullHouse_Premium,                  -- J+ trips (primary kicker ≥ J)
  FullHouse_Other,
  Flush_Premium,                      -- T-high or higher
  Flush_Other,
  Straight_Premium,                   -- 9-high or higher
  Straight_Other,
  ThreeOfAKind,                       -- single class, no premium split
  TwoPair_Premium,                    -- J+ top pair
  TwoPair_Other,
  OnePair_Premium,                    -- pair TT or better
  OnePair_Other,
  HighCard_Premium,                   -- J-high or better
  HighCard_Other
}
```

The `evaluate7` function:

```
evaluate7 : S_p → HandClass
```

returns the best 5-card hand class achievable from the 7-card set `S_p`. The implementation enumerates `C(7, 5) = 21` 5-card subsets and selects the maximum under standard poker hand-rank ordering. Premium-bucket determinations are made by inspecting kicker ranks and pair-of-the-board structure within the chosen 5-card subset.

---

## 2. Bounded Per-Hand Score (per RULES.md §7)

The bounded golf-score map for Hold'em hand classes is:

```
score₀ : HandClass → {-5, -4, -3, -2, -1, 0, +1, +2}
```

defined explicitly:

```
score₀(RoyalFlush)             = -5
score₀(StraightFlush)          = -5
score₀(FourOfAKind)            = -4
score₀(FullHouse_Premium)      = -3
score₀(FullHouse_Other)        = -2
score₀(Flush_Premium)          = -2
score₀(Flush_Other)            = -1
score₀(Straight_Premium)       = -2
score₀(Straight_Other)         = -1
score₀(ThreeOfAKind)           = -1
score₀(TwoPair_Premium)        = -1
score₀(TwoPair_Other)          =  0
score₀(OnePair_Premium)        =  0
score₀(OnePair_Other)          = +1
score₀(HighCard_Premium)       = +1
score₀(HighCard_Other)         = +2
```

Range: `image(score₀) ⊂ [-5, +2] ⊂ ℤ`. The map is bounded, integer-valued, and monotone-non-decreasing in hand weakness within each family.

> **Authority note.** This table is reconciled to **RULES.md §7** (the player-facing single source of truth) and to `golfScoreFromHandValue()` in the build. An earlier draft of Schema 0 carried the Straight-and-below tiers shifted up by +1 (Straight 0/−1, Trips +1/0, Two Pair +1/0, Pair +2/+1); those values were stale and have been corrected here. Premium thresholds: Full House J+ trips, Flush T-high+, Straight 9-high+, Two Pair J+ top pair, Pair TT+, High Card J-high+.

---

## 3. The Eight-Beat Hand Sequence

A Yellow Jacket Tour hand is a finite sequence of eight beats. Let:

```
B_seq = ⟨ TeaBox, Fairway, LayUp, Hazard, Approach, Green, Putt, TheCup ⟩
```

Each beat `b ∈ B_seq` is classified as either a *state* beat or an *action* beat:

```
type : B_seq → {state, state+action, action, resolution}

type(TeaBox)    = state + action      -- combines preflop deal + opening pot + first bet
type(Fairway)   = state               -- flop deal
type(LayUp)     = action              -- flop bet
type(Hazard)    = state               -- turn deal
type(Approach)  = action              -- turn bet
type(Green)     = state               -- river deal
type(Putt)      = action              -- river bet
type(TheCup)    = resolution          -- showdown
```

The action beats are `BetBeats = { TeaBox, LayUp, Approach, Putt }`. Each hand passes through exactly four betting events.

---

## 4. The Agreed-Total Wagering Primitive

### 4.1. State

The pot at any moment in a hand is described by the tuple:

```
PotState = ⟨ a, b, p ⟩
```

where:
- `a ∈ ℕ₀` is the current **agreed total** (the most recently accepted proposal)
- `b ∈ ℕ₀ ∪ {⊥}` is the most recent open **bet/raise proposal** (`⊥` if none pending)
- `p ∈ {playerA, playerB}` indicates whose turn it is to act

### 4.2. Initialization

At the start of each hand (Tea Box):

```
PotState_initial = ⟨ a₀, ⊥, playerA ⟩
```

where `a₀` is the **mandatory opening pot**:

```
a₀ = openerHole(h, R)

openerHole(h, R) = {
  base_opener,                      if h ≤ |R| / 2
  base_opener × backNineMult,       if h > |R| / 2
}
```

with `base_opener = 2`, `backNineMult = 2`, `h` = hole index, `R` = round-length set (e.g., `R = {1..18}` for 18-hole rounds).

### 4.3. Transitions

Define the action set `A = {Check, BetTo(t), CallAccept, Fold}` where `t ∈ ℕ₀` is a proposed new total.

**Check** (only legal when `b = ⊥`):
```
⟨a, ⊥, p⟩ →[Check] ⟨a, ⊥, opp(p)⟩
```

If both players check on the same beat in succession, the beat closes and the next beat begins.

**BetTo(t)** (legal when `t > a` and `t ≤ streetCap(a)` per §4.4):
```
⟨a, b, p⟩ →[BetTo(t)] ⟨a, t, opp(p)⟩
```

The proposal `t` becomes the open bet/raise. The agreed total `a` is unchanged until the proposal is accepted.

**CallAccept** (legal when `b ≠ ⊥`):
```
⟨a, t, p⟩ →[CallAccept] ⟨t, ⊥, opp(p)⟩
```

The proposal `t` is accepted; it becomes the new agreed total. The pending proposal clears.

**Fold** (legal when `b ≠ ⊥`):
```
⟨a, t, p⟩ →[Fold] ⟨a, ⊥, terminal⟩    -- hand ends; non-folder wins
```

The unaccepted proposal `t` is discarded. The non-folder wins the pre-fold agreed total `a` as honey credit. The folder posts the bogey penalty per §6.

### 4.4. Per-Hole Cap (Hole Envelope) and Per-Beat Cap (Pot-Elastic K)

**Hole envelope.** Each player may wager up to `E ∈ ℕ₀` strokes' worth of Honey per hole. The per-hole pot ceiling for a round of `N` holes is derived uniformly from the round's honey cap (§5.1):

```
effectiveCap(N) = round( E × honeyCap(N) )
```

with `E ≥ 3` clamped (the engine floors a non-zero envelope at the short-cap value 3). The build default is `E = 3`; under the calibrated honey cap this gives `effectiveCap = 27` on 9- and 18-hole rounds and `effectiveCap = 108` on the 72-hole Main finals.

**Per-beat cap (pot-elastic K).** Within a hole, the maximum legal agreed total at a betting beat scales with the Honey already agreed into the pot:

```
streetCap(a) = min( 3 × effectiveCap,  ⌈ K × a ⌉ )
```

where `a` is the current agreed total and `K = potElasticK ∈ ℕ` (build default `K = 5`). **Short-cap short-circuit:** if `effectiveCap ≤ 3`, then `streetCap = effectiveCap` (or 3) for all beats. The `3 × effectiveCap` term is a global per-hole ceiling so a single hand cannot spiral past three envelopes.

The v43–v69.51 "progressive floor" layer — `streetCap = max(effectiveCap × {0.25, 0.50, 0.75, 1.00}_{beat}, min(globalCeiling, K × a))` with the floor scheduled per betting beat (Tea Box / Lay-Up / Approach / Putt) — was **removed in v69.52**; it never bound in any normal regime, so the live formula is the two-term `min(·, ·)` above with no per-street percentage unlock.

**Legacy per-tier stroke caps (used only when `E = 0`):**
```
strokeCap(Regular)        = 6
strokeCap(Major)          = 9
strokeCap(Main_Early)     = 8
strokeCap(Main_Finals)    = 18
```
These are the `E = 0` fallback only; under the default `E = 3` the live per-hole cap is `effectiveCap(N)` above (27 / 27 / 108), not these values.

### 4.5. Tied-Pot Carry

Define `PotCarry : ℕ₀ → ℕ₀` as the carry-forward function across consecutive tied holes. Let `t_h` denote the agreed total at the conclusion of hole `h`. Let `winner(h) ∈ {playerA, playerB, ⊥}` denote the hole's winner (`⊥` for a tied resolution).

```
carryIn(h) = {
  0,                             if h = 1
  t_{h-1},                       if h > 1 and winner(h-1) = ⊥ (tied)
  0,                             if h > 1 and winner(h-1) ≠ ⊥
}
```

The opening pot for hole `h` becomes:

```
a₀(h) = openerHole(h, R) + carryIn(h)
```

When a non-tied resolution finally occurs, the entire accumulated carry is awarded to the winner of that hole.

---

## 5. Round-Divisor Variance Compression

Let `R` be the round-length set with `|R| = N` (number of holes). The round-end transformation aggregates per-hole results into the final scorecard score.

### 5.1. The honey-cap (divisor) map

The round-end divisor is the **honey cap**, `honeyCap : {1, 9, 18, 72} → ℤ⁺`, which has two selectable modes (the active mode is recorded in run exports as `honey_cap_mode`):

```
mode = calibrated  (the build default — stepped table)
  honeyCap(1)  = 1
  honeyCap(9)  = 4
  honeyCap(18) = 9
  honeyCap(72) = 36

mode = spec  (the v23 design-intent mode)
  honeyCap(N)  = N            -- the divisor is the round's hole count
```

Reconciliation is **per round**: each round's net honey is divided by `honeyCap(N)` at that round's end, not once at event end. For round lengths not in `{1, 9, 18, 72}`, the calibrated mode is undefined (the build supports only these four canonical round lengths); the spec mode is defined for any `N ≥ 1`.

### 5.2. The round-end aggregation

For player `p` over a round of `N` holes, let:

- `holeScore(p, h) ∈ ℤ` denote the per-hole bounded golf score (per §2 + §6's loss-rule modifiers)
- `honeyNet(p, h) ∈ ℤ` denote the net honey gain/loss for player `p` on hole `h` (positive = won pot, negative = lost pot, zero = tied/folded-into)

The round-final score:

```
finalScore(p, R) = ( Σ_{h=1..N} holeScore(p, h) ) - ⌊ ( Σ_{h=1..N} honeyNet(p, h) ) / honeyCap(N) ⌋
```

**Key property:** the net-honey term is normalized by the honey cap *exactly once per round*, at round end. Lower `finalScore` wins (golf convention).

### 5.3. Variance-compression rationale

The calibrated honey-cap table is set such that the variance of the divided wager term approximately matches the variance of the bounded-score term over the same round length. Specifically, denoting `H_total(R) = Σ honeyNet(p, h)`:

```
Var[ ⌊ H_total(R) / honeyCap(N) ⌋ ] ≈ Var[ Σ holeScore(p, h) ]
```

where the equivalence is empirical (validated by Monte Carlo audit) rather than algebraic. The choice `honeyCap(72) = 36` (calibrated mode) is anchored to the legacy-cap-stroke-equivalence point: at the legacy Major cap 9, a max-pot hole transferred `⌊9/9⌋ = 1` stroke per max-pot win in 18-hole format; at the legacy Main Finals cap 18, a max-pot hole transferred `⌊18/36⌋ = 0` strokes per single max-pot win in 72-hole format (apex-drama design choice — only sustained pot dominance moves the score in a long format). Under the live default (hole envelope `E = 3`) the per-hole cap is wider — 27 honey on an 18-hole round, `⌊27/9⌋ = 3` strokes per max-pot win — which is the change that drove the betting distribution away from "check-through-to-showdown" toward a real fold/call decision tree.

### 5.4. The Endless Card (continuous / cash normalization)

Tour events have a fixed round length `N ∈ {9, 18, 72}`; cash play does not. The §5.2 aggregation assumes a terminating round, so continuous play uses a **rolling** normalization instead — golf scoring is universal across all modes (RULES.md §4.5), and cash tables carry it on the *Endless Card*.

Let `H ⊆ ℕ` be the (unbounded, growing) index set of **scored holes** for player `p` — i.e. holes that reached a contested showdown involving `p`. Folds and tied pots contribute no element to `H` (they neither score nor count toward the denominator). Let `s_p(h) = holeScore(p, h)` per §2 + §6, under the convention the cash table is set to:

```
holdScore convention (cash):
  win    → score₀(winner_p)                       -- own hand class, always
  loss   → score₀(loser_p)                         -- HONORED (Bumblebee) default for Pure NLHE
         | brickLoss / ladder per §6.1             -- if the table opts into YJ-Stroke
```

The Endless Card exposes three quantities, all defined incrementally so they are O(1) per hole and never require a session boundary:

```
cumulative(p)  = Σ_{h ∈ H} s_p(h)                       -- raw strokes to/from par (par = 0)
holesScored(p) = |H|
pace₁₈(p)      = ( cumulative(p) / holesScored(p) ) · 18   -- the headline: scoring average per 18-hole round
                 (defined for holesScored(p) ≥ 1; displayed rounded to 0.1)
```

`pace₁₈` is the canonical length-independent statistic — a golf scoring average projected onto a standard round, identical in meaning at `|H| = 12` and `|H| = 12 000`. There is **no honey term**: cash wagering is matched-contribution chips (RULES.md §4.3, §5.5), so `honeyNet ≡ 0` on the card and no divisor applies.

**Round bucketing.** Every `18` scored holes auto-closes one logged round `Rₖ = { holes ⌊18(k−1)⌋+1 … 18k }` with stamped total `Σ_{h ∈ Rₖ} s_p(h)`; a fresh round opens with no interruption to play. The live partial round is `R_current` with `holesScored(p) mod 18` holes. This yields, for an arbitrarily long session, a sequence `⟨R₁, R₂, …⟩` of completed 18-hole rounds plus one partial — preserving golf's natural unit (and a well-defined *best round* `min_k Σ_{h ∈ Rₖ} s_p(h)`) without ever forcing the session to end.

**Settlement.** The Endless Card never moves Nectar (RULES.md §5.4): cashout is the chip stack alone. The card is a skill record fed to the Tour profile / Hive-rating pipeline.

## 6. Per-Hand Resolution and the Dual-Variant Loss-Rule Selector

Let `winner_p, loser_p ∈ HandClass × HandClass` be the showdown hand classes of the winning and losing players respectively (ordered by `evaluate7`).

The per-hole score for each player depends on the hand resolution and the variant choice `V ∈ {YellowJacket, Bumblebee}`.

### 6.1. Decisive showdown (winner_p ≠ loser_p)

**Yellow Jacket variant** (Bogey Loss):

```
holeScore_winner(V = YellowJacket) = score₀(winner_p)
holeScore_loser(V = YellowJacket)  = brickLoss(loser_p, a_showdown, opener)   -- see below
```

The loser term selects across the **loser ladder** — four named rungs (the last two share the `HighCard` branch and are split by commitment):

```
brickLoss(loser_p, T, opener) =                       -- the Yellow Jacket loser ladder
    score₀(loser_p)                                  if loser_p ∈ { Straight_*, … RoyalFlush }   -- NEXT BEST  (own −5…−1; "coolered")
    1                                                if loser_p ∈ { Pair_*, TwoPair_*, ThreeOfAKind }  -- TAKE A STROKE  (+1 bogey)
    min(C, 1 + max(0, ⌊(T − opener) / opener⌋))       if loser_p ∈ { HighCard_* }                  -- LAY A BRICK (+1, T < 2·opener) → STACK BRICKS (+2 once T ≥ 2·opener; "the blow-up")
```

where `T` is the agreed total at showdown, `opener` is the hole's mandatory pot (2 on front-9 holes, `2·m` on back-9 with back-9 multiplier `m`, default `2·2 = 4`), and `C` is the brick cap (default `C = 2` — so the `HighCard` branch is `1` until `T` doubles the opener, then `2`; under `C = 4` it keeps stepping to `3` at `T ≥ 3·opener` and `4` at `T ≥ 4·opener`).

**Monotone-ladder property.** The rungs form a single non-decreasing ladder in (hand weakness, commitment): for any fixed `(T, opener)` with `T ≥ opener`,

```
score₀(loser_p)  ≤  1  ≤  brickLoss(HighCard_*, T, opener) ≤ C
   (NEXT BEST:             (TAKE A STROKE,         (LAY A BRICK = +1 at T < 2·opener;
    Straight…RoyalFlush,    Pair/TwoPair/Trips:     STACK BRICKS = +2…+C once T ≥ 2·opener
    own −5…−1)              +1 — same +1 as         — "the blow-up", and the loser also
                            LAY A BRICK on the card) forfeits the larger T in honey)
```

i.e. *Next Best ≤ {Take a Stroke, Lay a Brick} ≤ Stack Bricks* — a worse hand and a larger commitment each weakly increase the cost, with a straight-or-better hand the only case that posts a negative (forgiven) number; on the card Take a Stroke and Lay a Brick are the same `+1` (the difference is the honey forfeited). A **fold** sits off this ladder: the folder always posts `+1` ("put me down for 1" — §6.4), never `+2`, and the only part that scales is the honey forfeit (sized to the *pre-bet* agreed total) — so folding a `HighCard` to a bet is strictly cheaper than the Stack-Bricks branch on both axes (the card and the honey), which is exactly the cheap-escape asymmetry that gives `decideFor`'s fold/bluff comparison its teeth (§8). (The function is named `brickLoss` for historical reasons but selects across all four rungs; only the `HighCard` branch depends on `(T, opener)`.) The full per-hand-class outcome table — every score a hand can post (win, lose-YellowJacket, lose-Bumblebee) plus folds/ties/honey-layer — is `RULES.md` §7.

- **Next Best** is the rarest of the four loser rungs: it requires the *loser* of the decisive showdown to hold a straight or better, i.e. *both* players to have made a strong hand — a coincidence on the order of **~1–3% of decisive showdowns** under measured 7-card Hold'em distributions (closer to ~1% when independent, a few points higher on flush- or straight-coordinated boards). It strictly contains the **cooler bonus** frames (§6.2: both players ≥ full house, within one category) as a sub-case, so `P(Next Best) ≥ P(cooler bonus)` always; the cooler bonus itself fires on well under 0.1% of decisive showdowns. (An empirical session of ~100 decisive showdowns will frequently see zero Next Best events — consistent with the ~1–3% rate, and the figure to validate against telemetry rather than assume.)
- **Lay a Brick / Stack Bricks** (the "pot-gated brick") mirrors the fold cost's pot-dependence (`trueFoldCost = 1 + a / honeyCap(N)`, §8): a brick lost in a bigger pot costs more, just as folding a bigger pot costs more. This is the structural change that gives a fold/bluff decision real teeth — folding a brick to a bet is strictly correct, and a bet that doubles the opener threatens a brick-holding caller with a `+2` instead of `+1`. It is configurable (`cfg.scoring.brickPenaltyMode ∈ {'flat', 'pot-gated'}`, `cfg.scoring.brickLossCap`); the ship default is `'pot-gated', C = 2`. In `'flat'` mode both brick rungs collapse to `cfg.scoring.highCardShowdownLoss` (1 = classic, 2 = anchored double bogey) independent of `T`. The `decideFor` EV kernel evaluates `brickLoss(HighCard, level, opener)` at the level under consideration when scoring `showEV(·, level)`, so the AI plays the rule that is in force.

**Bumblebee variant** (Honored Loss):

```
holeScore_winner(V = Bumblebee) = score₀(winner_p)
holeScore_loser(V = Bumblebee)  = score₀(loser_p)
```

### 6.2. Cooler bonus

If both `winner_p` and `loser_p` are in `{ FullHouse_*, FourOfAKind, StraightFlush, RoyalFlush }` and within one hand-class category of each other, an additional `−1` stroke is awarded to the winner:

```
holeScore_winner_with_cooler = holeScore_winner − 1
```

This bonus fires on under 0.1% of decisive showdowns under measured distributions (rare set-over-set, full-over-full, quads-over-quads).

### 6.3. Tied showdown

Both players score:
```
holeScore_winner = holeScore_loser = 0     -- par
```

The agreed pot at hole-end carries forward (per §4.5).

### 6.4. Fold resolution

The non-folder is the de facto winner:

```
holeScore_nonfolder = 0       -- par
holeScore_folder    = +1      -- bogey
honeyNet_nonfolder  = +a_pre-fold
honeyNet_folder     = -a_pre-fold
```

Where `a_pre-fold` is the agreed total *prior* to the proposal that triggered the fold (the unaccepted proposal does not transfer).

---

## 7. Survival-Cushion Late-Registration Handicap

When a player enters a tournament after round 1 has begun (late registration), their starting score is computed by:

```
handicap(P_late, h) = leader(h-1) + cushion(h-1) × multiplier
```

where:
- `leader(h-1) ∈ ℝ` is the lowest cumulative score at end of hole `h-1`
- `cushion(h-1) = max_survivor(h-1) − leader(h-1) ∈ ℝ⁺` is the gap between the leader and the highest-scoring still-eligible survivor
- `multiplier ∈ ℝ⁺` is a calibration constant; current build value: `multiplier = 1.5`

Calibration anchoring: at `multiplier = 0.6` (an earlier calibration band) the late-entrant winning rate was materially higher (a near-parity ROI), and at `multiplier = 1.5` (the current calibration band) it falls to a near-floor rate. The specific figures (~44% and ~2.75%) are pending re-validation against telemetry — they carry no recorded sample size, pool size, seed count, or confidence interval, unlike the §14 calibration protocol (20 seeded seasons + bootstrap 95% CIs) — and should not be cited as measured until re-run under that protocol. The calibration target is non-zero but materially lower expected ROI for late entrants.

---

## 8. Fold Equity Cost (the True Fold Cost)

For decision-theoretic AI (and recommended for human play), the *true fold cost* at any decision point is:

```
trueFoldCost = +1 + (a_pre-fold / honeyCap(N))
```

The `+1` is the bogey on the scorecard; the `a_pre-fold / honeyCap(N)` is the honey forfeit normalized by round length. The build's AI uses this exact expression in its EV calculations (per the `decideFor` kernel in `index.html`, which carries a separately-tunable `decisionDivisor` for the EV math; default 9).

**Strategic consequence (formalized):** in the Yellow Jacket variant, the *expected* showdown loss for a player with adjusted equity `adj ∈ [0, 1]` calling/checking to agreed total `a` is:

```
EV_showdown(adj, a) = (2·adj − 1) × a − (1 − adj) × showdownGolfCost(adj, a)
```

where `showdownGolfCost(adj, a) = baseGolfCost(adj) + (brickLoss(HighCard, a, opener) − 1) · P(brick | lose, adj)`. The base term is the v23 13-bucket expectation (`≈ 1 − 2·adj − 2·adj²` as a linear fit); the brick-delta term is the extra cost from the pot-gated brick branch, weighted by the probability of bricking conditional on losing — modeled as `P(brick | lose, adj) ≈ max(0, 0.55 − 0.8·adj)` (decays from ~0.5 at `adj → 0` to 0 by `adj ≈ 0.7`). When the brick mode is `'flat'`, `brickLoss(HighCard, ·, ·) = highCardShowdownLoss` is independent of `a` and the delta is constant; under the default `'pot-gated', C = 2`, it climbs from 0 (at `a = opener`) to `+1·P(brick|lose,adj)` (at `a ≥ 2·opener`). Folding is strictly correct only when:

```
EV_showdown(adj, a) < −trueFoldCost,   trueFoldCost = 1 + a / honeyCap(N)
```

Because the brick branch *and* the fold cost both grow with `a`, the fold/show-down comparison stays meaningful at every pot size: a brick at the opener is roughly indifferent (`brickLoss = 1 = foldStroke`), but a brick that bet into a grown pot is strictly worse than folding. This is the structural property — "fold the trash you committed to" — that the pot-gated mode restores; under the legacy flat `+1` rule the comparison collapses to indifference for cat<4 hands and pre-flop folding never fires.

---

## 9. Bet-Tier Classification

For any proposal `BetTo(t)` against current agreed total `a`, the *bet tier* is:

```
tier : ℝ⁺ × ℕ × ℕ → {Probe, Press, Pot, Polarize, Shove}

ratio = (t − a) / max(a, 1)

tier(t, a, c_beat) = {
  Shove,      if t ≥ c_beat
  Polarize,   if 2.0 ≤ ratio < cap_threshold(c_beat)
  Pot,        if 1.0 ≤ ratio < 2.0
  Press,      if 0.5 ≤ ratio < 1.0
  Probe,      if 0   < ratio < 0.5
}
```

where `c_beat = streetCap(a)` is the per-beat ceiling at the current beat (`min(3 × effectiveCap, ⌈K × a⌉)` per §4.4). Because `streetCap` grows with the agreed total, the available tiers expand naturally as a hole develops: an opener against a small pot typically permits `{Probe, Press}`; later beats against a larger agreed total admit `Pot`, then `Polarize`, then `Shove` once `streetCap` reaches the `3 × effectiveCap` ceiling. This is the *escalation primitive*.

---

## 10. Schema C — Lowball Continuous-Strength to Bucket Mapping

For lowball variants (Razz, 2-7 Triple Draw, Badugi), the bounded golf score is computed via a percentile-aligned bucket mapping. Let `cdf_V : Hand → [0, 1]` denote the empirical strength CDF for variant `V`, computed by Monte Carlo with sample size `M ≥ 10⁶`.

Define eight percentile breakpoints `q₀ < q₁ < ... < q₇` aligning with conventional hand-class boundaries:

```
score_C : V × Hand → {-5, -4, -3, -2, -1, 0, +1, +2}

score_C(V, h) = ⎧ -5,  if cdf_V(h) ≤ q₁          (bucket 1: top 0.5%–5%)
                ⎨ -4,  if q₁ < cdf_V(h) ≤ q₂     (bucket 2)
                ⎨ -3,  if q₂ < cdf_V(h) ≤ q₃     (bucket 3)
                ⎨ ...
                ⎩ +2,  if cdf_V(h) > q₇          (bucket 8)
```

The breakpoints `q_i` are calibrated per-variant such that bucket boundaries align with conventional hand-class transitions. For Razz (canonical instantiation):

| `i` | `q_i` | Conventional label dominating bucket | `score_C` |
|----:|------:|--------------------------------------|----------:|
| 1   | 0.005 | Wheel (5-low)                        | -5        |
| 2   | 0.05  | 6-low                                | -4        |
| 3   | 0.20  | 7-low                                | -3        |
| 4   | 0.50  | 8-low (strong)                       | -2        |
| 5   | 0.75  | 8-low (weak) / 9-low                 | -1        |
| 6   | 0.90  | T-low                                | 0         |
| 7   | 0.97  | J-low                                | +1        |
| 8   | 1.00  | Q-or-worse low                       | +2        |

This is the "Hybrid Schema C" defined in `MIXED_GAMES_DESIGN.md` §10.

---

## 11. Adaptive Bogey-Loss (Lowball Variants)

For Yellow Jacket variant in continuous-strength lowball variants, the loss rule is:

```
holeScore_loser_lowball(V = YellowJacket, h) = {
  score_C(V, loser_hand),  if cdf_V(loser_hand) ≤ θ
  +1,                       otherwise
}
```

where `θ ∈ [0, 1]` is the *respected-loss percentile cutoff*. Default value: `θ = 0.30` (i.e., losers in the top 30% of possible hands receive their own bucket score; otherwise +1 bogey). Calibration of `θ` is performed via the Variant Calibration Mode (§14).

The percentile cutoff is invariant to bucket-boundary refinement of `score_C` (because it is defined directly against the CDF, not the bucket structure). This is the design choice from `MIXED_GAMES_DESIGN.md` §14.

---

## 12. Big O Hi-Lo Scoop Resolution

For the Big O variant (5-card Omaha Hi-Lo, 2-of-5 + 3-of-5 use rule), define:

```
score_hi : Hand → ℤ          -- per-hand score (RULES.md §7) applied to high hand
score_lo : Hand → ℤ          -- Schema C (Razz mapping) applied to qualifying low

qualLo(B, H_5) = (∃ subset of 2 from H_5, 3 from B, forming 8-or-better low)
```

**Pot resolution (honey side):**
- If at least one player has a qualifying low: pot splits 50/50 between Hi-half and Lo-half.
- If no qualifying low: entire pot to Hi-winner.
- Tied half-pot rolls forward (per §4.5) for that half only.

**Scorecard resolution:**

```
Scoop (winner of both halves):
  holeScore_scooper = ⌊ (score_hi(scooper) + score_lo(scooper)) / 2 ⌋
  holeScore_other(s) = +1 (YJ) or score₀(other_high) (BB)

Split (different winners of Hi and Lo):
  holeScore_hi-winner = score_hi(hi-winner)
  holeScore_lo-winner = score_lo(lo-winner)
  holeScore_neither   = +1 (YJ) or own-score (BB)
```

The `⌊·/2⌋` floor is the `MIXED_GAMES_DESIGN.md` §15 design choice — it preserves integer-only scorecard values and prevents the scoop from being arithmetically trivial.

---

## 13. AI Decision Kernel (Profile + Equity Adjusted)

The AI's decision at any action point is computed by:

### 13.1. Skill profile

A player profile is the tuple:

```
Profile = ⟨ noise, betThreshold, foldThreshold, raiseThreshold, regime ⟩
```

with:
- `noise ∈ [0, 1]` — equity-estimation noise scale
- `betThreshold ∈ [0.01, 0.99]` — adjusted equity above which the player bets
- `foldThreshold ∈ [0.01, 0.99]` — adjusted equity below which the player folds
- `raiseThreshold ∈ [0.01, 0.99]` — adjusted equity above which the player escalates rather than calls

For a given skill level `t ∈ [0, 1]` and regime-specific optima `⟨bet*, fold*, raise*⟩`, the profile is sampled:

```
betThreshold   = clamp( bet*   + dir × (1 − t) × 0.15 + jitter × jitterScaleB,  0.01, 0.99)
foldThreshold  = clamp( fold*  + dir × (1 − t) × 0.15 + jitter × jitterScaleF,  0.01, 0.99)
raiseThreshold = clamp( raise* + dir × (1 − t) × 0.10 + jitter × jitterScaleR,  0.01, 0.99)
```

where `dir ∈ {-1, +1}` is a random sign and `jitter ∈ N(0, 1)`.

### 13.2. Regime optima

Regime-specific threshold optima in the canonical build:

| Regime         | bet* | fold* | raise* | noise* |
|----------------|------|-------|--------|--------|
| Hold'em (HU)   | 0.45 | 0.20  | 0.75   | 0.075  |
| mw-yj (multi-way YJ) | 0.40 | 0.15 | 0.70 | 0.075 |
| mw-bb (multi-way BB) | 0.40 | 0.15 | 0.70 | 0.075 |

### 13.3. Adjusted equity

The decision input `adj ∈ [0, 1]` is computed from raw equity by:

```
adj = clamp( rawEquity + boardTextureAdj + bayesianBluffAdj − noise × ε,  0, 1 )
```

where `ε ∈ N(0, 1)`, `boardTextureAdj` adjusts for board threats/draws to the hero's range, and `bayesianBluffAdj` updates from per-match opponent action history.

### 13.4. Decision rule

Given `adj`, current pot `a`, action history, and profile thresholds:

```
action(adj, a, history, profile) = argmax over A of EV(action; adj, a, history, profile)
```

where the EV computation incorporates `trueFoldCost` (§8), expected showdown stroke penalty, and fold-equity estimates against villain's estimated range. The full kernel is approximately 200 lines of JavaScript in `index.html`; this specification documents the high-level mathematical structure.

---

## 14. Variant Calibration Mode

Let `Θ` be the parameter space for a variant under calibration:

```
Θ = ⟨ θ_AI_thresholds, θ_score_buckets, θ_loss_cutoff, θ_cap_multiplier, ... ⟩
```

A *calibration sweep* over a discrete grid `G ⊂ Θ` produces a per-cell metric vector:

```
m(g) = ⟨ skillSpearman(g), authoredVsMeasured(g), tierROIspread(g), championScore(g), ... ⟩  for g ∈ G
```

Each metric is computed from a fixed number of seeded simulation seasons (default: 20) at fixed pool size (default: 200), with bootstrap 95% confidence intervals.

The *acceptable region* `A ⊂ G` is:

```
A = { g ∈ G : ∀ metric m_i, m_i(g) ∈ accept_range_i }
```

The *Pareto frontier* `Φ ⊂ A` is the set of cells not dominated by any other cell in `A` under the composite distance metric:

```
d(g) = Σ_i normalized_distance( m_i(g), accept_center_i )
```

The output of the calibration mode is `Φ` ranked by `d`, plus a delta table comparing the top cell to the current frozen optima.

---

## 15. Calibration Constants — Named Values

For permanent record:

| Constant | Symbol | Value | Reference |
|----------|--------|-------|-----------|
| Hole envelope (default) | `E` | 3 | §4.4 |
| Pot-elastic multiplier (default) | `K` (`potElasticK`) | 5 | §4.4 |
| Honey-cap mode (default) | — | `calibrated` | §5.1 |
| Honey cap, 1 hole (calibrated) | `honeyCap(1)` | 1 | §5.1 |
| Honey cap, 9 holes (calibrated) | `honeyCap(9)` | 4 | §5.1 |
| Honey cap, 18 holes (calibrated) | `honeyCap(18)` | 9 | §5.1 |
| Honey cap, 72 holes (calibrated) | `honeyCap(72)` | 36 | §5.1 |
| Legacy stroke cap, Regular (E = 0 only) | `strokeCap(Regular)` | 6 | §4.4 |
| Legacy stroke cap, Major (E = 0 only) | `strokeCap(Major)` | 9 | §4.4 |
| Legacy stroke cap, Main early (E = 0 only) | `strokeCap(Main_Early)` | 8 | §4.4 |
| Legacy stroke cap, Main finals (E = 0 only) | `strokeCap(Main_Finals)` | 18 | §4.4 |
| Opener, holes 1–N/2 | `base_opener` | 2 | §4.2 |
| Back-9 multiplier | `backNineMult` | 2 | §4.2 |
| Late-reg multiplier | `multiplier` | 1.5 | §7 |
| YJ Hold'em bet optimum | `bet*_HU` | 0.45 | §13.2 |
| YJ Hold'em fold optimum | `fold*_HU` | 0.20 | §13.2 |
| YJ Hold'em raise optimum | `raise*_HU` | 0.75 | §13.2 |
| YJ multi-way bet optimum | `bet*_mw` | 0.40 | §13.2 |
| YJ multi-way fold optimum | `fold*_mw` | 0.15 | §13.2 |
| YJ multi-way raise optimum | `raise*_mw` | 0.70 | §13.2 |
| Profile noise scale | `noise*` | 0.075 | §13.2 |
| Adaptive Bogey-Loss cutoff (default) | `θ` | 0.30 | §11 |

These constants are the calibration-frozen values as of the canonical production release. Changes to any constant require a full audit re-run per `IP/EXECUTION.md` and the audit suite documented in the build.

---

## 16. Worked Numerical Examples

### 16.1. A standard Hold'em hand under Yellow Jacket variant

Setup: hole 5 of an 18-hole round, Major event, default settings (hole envelope `E = 3`, calibrated honey cap, so the per-hole envelope `effectiveCap = 3 × 9 = 27` and the per-hole ceiling `3 × effectiveCap = 81`; pot-elastic `K = 5`). Player A holds A♠K♠, Player B holds Q♦Q♣. Board runs K♥ 7♠ 2♣ 4♠ 9♠.

- Tea Box: opening pot `a₀ = 2`. A bets to 10 (`streetCap = min(81, ⌈5×2⌉) = 10`). B calls. `a = 10`.
- Fairway (deal): board K♥ 7♠ 2♣. A has top pair top kicker.
- Lay-Up: A bets to 40 (`streetCap = min(81, ⌈5×10⌉) = 50` — A sizes to 40). B calls. `a = 40`.
- Hazard (deal): board adds 4♠. A now has nut flush draw.
- Approach: A checks behind (the elastic cap is now `min(81, ⌈5×40⌉) = 81`, but A keeps the line bounded). `a = 40`.
- Green (deal): board adds 9♠. A completes nut flush (Flush_Premium, since A-high).
- Putt: A bets to 81 (`streetCap = min(81, ⌈5×40⌉) = 81` — the `3 × effectiveCap` ceiling binds). B calls. `a = 81`.
- The Cup: showdown. A's Flush_Premium beats B's TwoPair_Premium (kings-up, queens kicker).
  - `score₀(Flush_Premium) = -2` for A
  - Yellow Jacket loser rule: B's TwoPair_Premium is not in the respected-loss set, so the default applies → `holeScore_loser = +1`
  - `holeScore_A(this hand) = -2`
  - `honeyNet_A(this hand) = +81`
  - `holeScore_B(this hand) = +1`
  - `honeyNet_B(this hand) = -81`

After 18 holes (assume similar magnitudes for illustration), if A's totals are `Σ holeScore_A = -10`, `Σ honeyNet_A = +90`:
- `finalScore_A = -10 - ⌊90/9⌋ = -10 - 10 = -20`

A finishes 20 strokes under par. (Under the legacy `E = 0` Major cap of 9 the same line would have peaked at `a = 9` and the round-end honey term would be `⌊27/9⌋ = 3`, for `-13` — the wide envelope is what makes a single dominant hole, or a fold, matter.)

### 16.2. A late-registration entry

A new player enters after hole 12 of an 18-hole event:
- Leader after 12 holes: cumulative score = -8
- Highest still-eligible survivor: cumulative score = +6
- Cushion = 6 - (-8) = 14

Late entrant's starting score: `-8 + 14 × 1.5 = -8 + 21 = +13`.

The late entrant begins hole 13 at +13, playing only the 6 remaining holes of their abbreviated round. Their probability of winning the event is non-zero but materially below the survivors' (a near-floor rate per §7; the specific ~2.75% figure is pending telemetry re-validation).

### 16.3. A tied carry-forward

Hole 7 ends in a tied showdown with `a = 5`. Both players post 0 par; honey carry = 5.
Hole 8: opening pot = `openerHole(8, R) + 5 = 2 + 5 = 7` (front-9 opener of 2 plus carry-in of 5).
The agreed total at hole 8 starts at 7. Subsequent betting builds from there.

---

## 17. References to Build Implementation

The mathematical structures defined in this specification are implemented in `index.html` as follows (pointer references, not exhaustive):

| Section | Build location |
|---------|----------------|
| §1.1 deck | `makeDeck()` and `shuffleDeck()` |
| §1.3 hand class | `evaluate7()` (packed-int category in bits 24+); `handCategoryName()` |
| §2 per-hand score (RULES.md §7) | `golfScoreFromHandValue()` |
| §3 beat sequence | `streetLabel()`, `streetDealLabel()` |
| §4 wagering primitive | `playBettingRound()` (heads-up), `mpAct()` (multiplayer) |
| §4.4 per-hole / per-beat cap | `resolveEventStrokeCaps()` (hole envelope → per-hole cap), `streetCapFor()` (per-beat elastic cap) |
| §4.5 carry | `playHole()` (surfaces the tied-hole pot via `carryPot`); accumulated and swept in `playMatch()` |
| §5 honey cap | `honeyDivisorFor()` (reads the active `honey_cap_mode`) |
| §6 loss-rule selector / showdown matrix | `golfScoresFromShowdown()` |
| §7 late-reg | `applyLateRegistration()` |
| §8 fold cost | inlined in `decideFor()` EV computation |
| §9 bet tier | `betTierForProposal()` |
| §13 AI kernel | `decideFor()` with `makeProfileForSkill()` |
| event engine | `playHole()` / `playMatch()` / `runTourEvent()` / `runFinals()` |
| Simulator driver | `runLabSession()` |
| §15 constants | `DEFAULT_SIM_CONFIG` in `index.html` |

---

## 18. Reservation of Rights

The mathematical formalization in this document is the proprietary work of Blank Canvas, Inc., authored by Dalton Graham, dated 2026-05-02. This formalization is published as part of the IP-protection scaffold for Yellow Jacket Tour. Disclosure of this specification serves the dual purposes of (1) defensive prior-art establishment under `IP/DEFENSIVE_PUBLICATION.md`, preventing third parties from obtaining patent rights over substantially-similar mechanics, and (2) brand-asset signaling that Yellow Jacket Tour is a designed system with a precise mathematical foundation.

This specification does not grant any license to use the mechanics described herein in a competing product. The mechanics' patent eligibility, where applicable, remains with Blank Canvas, Inc. The brand assets (Yellow Jacket Tour, Yellow Jacket, Honey-Stroke, Sweet Stroke, Bumblebee, the eight-beat hand-flow lexicon) remain protected by trademark. The source code expression of these mechanics in `index.html` remains protected by copyright (registered with U.S. Copyright Office, case `1-15154925860`, 2026-05-02).

---

**End of mathematical specification, v1.0.**

Future revisions documented in this section. Major changes to the mathematical structure trigger a derivative-work copyright registration and an updated audit suite per `IP/EXECUTION.md`.
