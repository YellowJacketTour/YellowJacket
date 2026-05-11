<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", and the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) are trademarks of
  Blank Canvas, Inc. The scoring law and rule set described herein are
  proprietary. Unauthorized reproduction prohibited.
-->

# Yellow Jacket Tour — Complete Rules Manual

Yellow Jacket Tour is a hybrid of heads-up Texas Hold'em and tournament golf, scored on a single proprietary law called **Honey-Stroke** (also marketed as **Sweet Stroke** — same system, two consumer-facing brand names, both protected). Every hand of poker becomes one hole on a golf scorecard. The pot you win sweetens your golf score; the pot you lose costs you strokes. Lower wins, just like real golf.

**You're always on the Tour.** That's the central brand position. The Tour isn't just the championship circuit — it's the world you inhabit as a Yellow Jacket player. Tour events are where titles are won, but every cash hand you play, every table you sit at, every stroke you bank — those count too. Your strokes follow you across the Tour. Your reputation follows you across the Tour. There is no "outside the Tour" mode in this product; the cash tables are the Tour at the cash table.

The product runs in three modes inside that one Tour ecosystem: **tour events** (the WSOP/PGA-style championship circuit, the headline product, the home of Honey-Stroke), and two **cash-table** modes (Pure NLHE for poker purists who want the standard online poker experience inside the Tour, and YJ/Bumblebee Stroke for cash players who want a parallel stroke ledger that ties cash play to the same Tour-scoring framework).

This document is the canonical, plain-language manual. Every primary brand term, every rule, every worked example you need to play and to understand the system. ASCII diagrams included. Read top-to-bottom for the full picture, or jump to the mode you care about.

> All eight beats of a Yellow Jacket hand — **Tea Box, The Fairway, The Lay-Up, The Hazard, The Approach, The Green, The Putt, The Cup** — are proprietary brand terms of Blank Canvas, Inc. Casual variants (the Drive, the Iron, the Pin, the Drop, etc.) are documented in `IP/LEXICON.md` and accrue separate common-law rights through use. See `LICENSE.md` for full IP terms.

---

## Table of Contents

1. [The Core Engine (Used by Everything)](#1-the-core-engine-used-by-everything)
2. [The Two Currencies](#2-the-two-currencies)
3. [Mode A — Tour Events (Honey-Stroke)](#3-mode-a--tour-events-honey-stroke)
4. [Mode B — Cash Tables, Pure NLHE](#4-mode-b--cash-tables-pure-nlhe)
5. [Mode C — Cash Tables, YJ Stroke / Bumblebee Stroke](#5-mode-c--cash-tables-yj-stroke--bumblebee-stroke)
6. [What's Shared vs What's Different](#6-whats-shared-vs-whats-different)
7. [Hand Class → Golf Score Reference](#7-hand-class--golf-score-reference)
8. [Tournament Structure](#8-tournament-structure)

---

## 1. The Core Engine (Used by Everything)

Every mode in the build uses **the same poker engine**: standard Texas Hold'em.

```
                    THE STANDARD HOLD'EM HOLE
   ┌─────────────────────────────────────────────────────────┐
   │                                                          │
   │   Each player gets:  [▒▒]  [▒▒]   ← 2 hole cards        │
   │                                                          │
   │   The hand unfolds in eight named beats. Real-golf       │
   │   order: action → state → action → state.                │
   │                                                          │
   │     1. Tea Box™      tee up + opening pot + first bet   │
   │                      (collapses tee+drive into one beat) │
   │     2. The Fairway™  [♣][♦][♥]    (3 community cards)   │
   │     3. The Lay-Up™   second-shot bet on what landed     │
   │     4. The Hazard™   [♣][♦][♥][♠]  (4th community card) │
   │     5. The Approach™ shot toward the green              │
   │     6. The Green™    [♣][♦][♥][♠][♣] (5th community)    │
   │     7. The Putt™     final shot                         │
   │     8. The Cup™      ball drops — showdown resolves     │
   │                                                          │
   │   At The Cup each player makes the BEST 5-card hand     │
   │   from their 2 hole + 5 board cards.                    │
   │                                                          │
   └─────────────────────────────────────────────────────────┘
```

The eight **beats** of a Yellow Jacket hand. Each is a proprietary, branded event of the YJT system. The order is the real-golf order — every shot (action) lands somewhere (state), and from that state you pick the next shot. (Familiar poker references in parentheses for first-time readers.)

| # | YJ beat | Type | Poker reference | What happens |
|---|---------|------|-----------------|--------------|
| 1 | **Tea Box** | state + action | Preflop | Hole cards dealt; mandatory pot posted; first betting round. (Collapses "tee + drive" into one beat — at a real tee box you tee up and immediately drive.) |
| 2 | **The Fairway** | state | Flop deal | 3 community cards dealt face-up. Where your tee-shot ball landed. |
| 3 | **The Lay-Up** | action | Flop bet | Players bet/check/raise/fold based on the Fairway position. The second shot. |
| 4 | **The Hazard** | state | Turn deal | 4th community card dealt face-up. Where your second shot landed — could complicate or improve your line. |
| 5 | **The Approach** | action | Turn bet | Players bet/check/raise/fold. The shot aiming for the green. |
| 6 | **The Green** | state | River deal | 5th community card dealt face-up. Ball is on the green. |
| 7 | **The Putt** | action | River bet | Final betting round. The last shot. |
| 8 | **The Cup** | resolution | Showdown | Hands revealed, winner takes the pot (and the hole). The ball drops. |

**Why the deal-vs-bet split.** Conventional poker collapses each street into "the flop" / "the turn" / "the river" — one word for both the card-reveal moment and the betting round that follows. YJT pulls them apart so each gets its own narrative beat: in real golf, your shot (action) lands somewhere (state), and from that state you decide your next shot. Beats 2/3, 4/5, and 6/7 mirror that action-state pattern exactly.

**Every mode in the build uses these exact eight beats.** The only differences across modes are: (1) what you wager with, (2) what scoring layer (if any) sits on top, (3) whether play is continuous or organized into rounds/events.

**Casual variants.** Across marketing copy, Buzz tips, lore, and conversational play, these primary marks are paired with documented *casual variants* — for example, "the Drive" remains in active use as a casual variant for the Tea Box (the tee-shot moment), and "the Iron" or "the Press" may appear as variants of the Lay-Up. See `IP/LEXICON.md` for the full variant pool.

> **Trademark notice.** Tea Box, The Fairway, The Lay-Up, The Hazard, The Approach, The Green, The Putt, and The Cup are proprietary brand terms of Blank Canvas, Inc. used to name the eight events of the Yellow Jacket Tour hand structure. They are common-law trademarks as of 2026-05-02; paid USPTO registration is queued for the family-of-marks suite filing. The casual variants documented in `IP/LEXICON.md` accrue separate common-law rights through their use. See `IP/IP_INVENTORY.md` §2.3.

---

## 2. The Two Currencies

The build has **two distinct denominations** that must not be confused:

```
   ┌──────────────────────────┬──────────────────────────┐
   │         NECTAR (◈)        │          HONEY            │
   ├──────────────────────────┼──────────────────────────┤
   │ Bankroll currency.        │ In-event wager unit.      │
   │ USD-equivalent.           │                           │
   │                           │                           │
   │ Used to:                  │ Used to:                  │
   │   • Pay tour buy-ins      │   • Wager during a hole   │
   │   • Sit at cash tables    │     in tour events ONLY   │
   │   • Receive prize payouts │                           │
   │   • Transfer P2P          │ Lives only inside a       │
   │                           │ single tour event.        │
   │ Persists across events    │ Disappears at event end.  │
   │ and sessions.             │                           │
   │                           │                           │
   │ Cash chips ARE Nectar     │ Cash tables DO NOT        │
   │ 1:1.                      │ use honey at all.         │
   └──────────────────────────┴──────────────────────────┘
```

**Key invariant:** Nectar and Honey **never directly convert**. The bridge between them is your **finish position** in a tour event. Nectar in (buy-in) → play with Honey → finish position determined by stroke score → Nectar out (prize). At cash tables, only Nectar moves.

---

## 3. Mode A — Tour Events (Honey-Stroke)

Tour events are the WSOP/PGA-style format: pay a buy-in, play a fixed-length tournament, finish in a position, get paid.

### 3.1 Where to play

- **Single Player** menu — heads-up vs the AI
- **Multiplayer · Hot-Seat** — heads-up vs another human, same device
- **Multiplayer · Share-Link** — heads-up async by URL
- **Simulator** — mass-simulate full seasons with population AI

The interactive heads-up modes (Single Player, Hot-Seat, Share-Link) run the full canonical engine — the mandatory opener (doubled on the back 9 of each 18-hole stretch), agreed-total wagering under the hole-envelope **E** + pot-elastic **K** cap (§3.6), and the round-end honey cap (§3.5). Each match lets you set the hole count (9 / 18 / 36 / 72), the per-hole cap (the envelope E, default E = 3, or a legacy fixed cap), and — in Multiplayer — the scoring variant (§3.8); Single Player inherits the Simulator's variant.

### 3.2 The three event tiers

| Tier | Default buy-in | Field | Frequency |
|------|----------------|-------|-----------|
| **Regular** | $100 Nectar | 128 players | 40 per season |
| **Major** | $1,000 Nectar | 256 players | 4 per season |
| **Main Event** | $10,000 Nectar | 1,024 players | 1 per season |

**Season schedule.** A Yellow Jacket season is a fixed slate: **4 majors + 40 regular tour events + 1 Main Event = 45 events**. That mirrors the real PGA Tour's ~44-event calendar and its 4-major / roughly-1-in-10 cadence, which keeps a major title rare enough to mean something. The lone Main is the WSOP Main Event and the FedEx Cup finale rolled into one slot, and it carries the biggest, hardest field on the calendar (a WSOP-style championship) — the Main field is the largest of the three tiers, not the smallest. (In the Simulator's default 1,000-player pool the Main field is capped to 768; the playable Tour uses a 2,000-player pool and the full 1,024.)

Every season also has a **satellite ladder**, plus a Major-qualifier credential: the top **64** finishers of each Major earn a Main Event berth (no $10K Nectar buy-in required). With four majors that's 256 credentials against the ~269 qualifier seats in the Main field — a major top-64 finish is a reliable championship path (the FedEx-Cup-points logic). About 65% of the Main field enters directly by buy-in; the rest come through these credentials and the satellite ladder.

### 3.3 Format

Default format is **aggregate stroke play** (like the Masters):

```
   AGGREGATE STROKE PLAY (default)
   ─────────────────────────────────────────────────
   Round 1 (18 holes)  → score
   Round 2 (18 holes)  → score   } cumulative
   Round 3 (18 holes)  → score   } across all 4
   Round 4 (18 holes)  → score
   ─────────────────────────────────────────────────
   72-hole total → finish position → Nectar payout

   After R1, R2, R3:
     Cushion check: anyone too far below the leader is cut
     Round cut: bottom % of the surviving field is cut
```

Alternative is **bracket knockout** (single-elim, like WSOP), switchable in the simulator. Both formats use the same per-hole rules.

### 3.4 The Honey-Stroke scoring law

Every hole produces TWO outputs simultaneously:

```
   ┌──── PER HOLE ─────────────────────────────────────┐
   │                                                    │
   │   ┌─── LAYER 1: SCORECARD ────┐                   │
   │   │ Hand class at showdown    │                   │
   │   │ → integer golf score      │                   │
   │   │   (-5 to +2)              │                   │
   │   │ → added to round total    │                   │
   │   └───────────────────────────┘                   │
   │                                                    │
   │   ┌─── LAYER 2: HONEY POT ────┐                   │
   │   │ Hole opens at 2 honey     │                   │
   │   │ Bets/raises set new       │                   │
   │   │ agreed total              │                   │
   │   │ Calls accept it           │                   │
   │   │ → winner takes the pot    │                   │
   │   │   as honey credit         │                   │
   │   └───────────────────────────┘                   │
   │                                                    │
   └────────────────────────────────────────────────────┘
```

At the end of **each round** (per-round reconciliation, not once at event end), that round's net honey is divided by the **honey cap** and subtracted from the round's scorecard:

```
   FINAL ROUND SCORE = round scorecard − (round net honey ÷ honey cap)
```

The honey cap has **two selectable modes** (chosen in the Simulator and recorded in run exports as `honey_cap_mode`):

```
   calibrated  (the ship default — stepped table)
   ──────────────────────────────────
   Round length    Honey cap
   ───────────     ─────────
   1 hole              1
   9 holes             4
   18 holes            9
   72 holes           36

   spec  (the v23 design-intent mode)
   ──────────────────────────────────
   Honey cap = the round's hole count N
   (an 18-hole round divides net honey by 18)
```

So under the default (calibrated), an 18-hole round divides that round's net honey by **9**. Under spec it divides by 18. **Lower wins.**

### 3.5 Wagering: agreed-total semantics

Tour wagering is **NOT** like standard poker. Read carefully:

```
   AGREED-TOTAL WAGERING (tour events only)
   ─────────────────────────────────────────────
   The pot at any moment is the most recently
   ACCEPTED proposal. NOT a sum of contributions.

   • Hole opens with a mandatory pot (2 honey
     front 9, 4 honey back 9)
   • A "bet" or "raise" PROPOSES a new pot total
   • A "call" ACCEPTS that total
   • That total becomes the pot. Period.

   Worked example:
     Hole opens at 2.
     You raise to 5. Opp calls. Pot = 5 (NOT 7).
     Flop: you raise to 9. Opp calls. Pot = 9.
     Turn: both check. Pot stays 9.
     River: you raise to 12. Opp calls. Pot = 12.
     Showdown: winner takes 12 honey.

   Total contributions never enter the math.
   Only the most recent accepted proposal does.
```

### 3.6 Wagering caps: the hole envelope (E) and pot-elastic K

Wagering is bounded by two settings that work together. State beats (Fairway, Hazard, Green) carry no betting and inherit the cap of the betting beat that follows them.

**The hole envelope, E.** Each player may wager up to **E strokes' worth of Honey per hole**. The per-hole pot ceiling is derived uniformly from the round's honey cap:

```
   effectiveCap = round( E × honeyCap(roundLength) )
```

The ship default is **E = 3**. With the calibrated honey cap that is **27 honey per player per hole** on 9- and 18-hole rounds, and **108 honey** on the 72-hole Main finals.

When E > 0 (the default), the envelope **replaces** the older fixed per-tier stroke caps. Those per-tier values still exist, but only as the **E = 0 legacy fallback**:

```
   LEGACY PER-TIER CAPS (used only when E = 0)
   ─────────────────────────────────────
     Regular event:        cap =  6 honey
     Major event:          cap =  9 honey
     Main early rounds:    cap =  8 honey
     Main 72-hole final:   cap = 18 honey
```

Under default settings (E = 3) those legacy values are NOT the live caps; the live per-hole caps are 27 / 27 / 108 as above.

**Pot-elastic K.** Each betting beat's cap is K times the Honey already agreed into the pot, hard-ceilinged at 3× the per-hole envelope so a single hole's risk stays bounded:

```
   streetCap = min( 3 × envelopeCap,  ⌈K × agreedTotal⌉ )
```

with a short-circuit: if the envelope cap is ≤ 3, the cap is just the envelope cap (or 3). K (`potElasticK`) defaults to **5**. K is the pot's "acceleration"; the envelope is its "speed limit."

```
   WORKED EXAMPLE — Major round, E = 3 calibrated
   ─────────────────────────────────────────────
   envelopeCap = 3 × 9 = 27        ceiling = 3 × 27 = 81

   Tea Box opener 2          → cap = ⌈5×2⌉  = 10
   Lay-Up, 8 agreed          → cap = ⌈5×8⌉  = 40
   Approach, 24 agreed       → ⌈5×24⌉ = 120, clamped to 81
   The Putt                  → 81
```

### 3.7 Folds

Fold rule is **uniform on every betting beat**:

```
   ─── FOLD RESOLUTION ────────────────────────
   Folder:    +1 bogey on scorecard
              loses the previously agreed honey
   Non-folder: 0 par on scorecard
              gains the previously agreed honey

   Cards are NEVER revealed on a fold.
```

The "previously agreed total" matters: if you raise to 8 and opp folds, you gain whatever the pot was BEFORE your raise (e.g. 5), not the 8 you proposed.

### 3.8 Tied showdowns

Both players hold the same hand value: both score 0 par, the **entire pot rolls forward** to the next hole's mandatory opener. Multiple consecutive ties stack. The next decisive hole's winner sweeps the whole accumulated stack.

### 3.9 The decisive-showdown loser score (variants + the brick rule)

When a hand goes to showdown and is **not** a tie, the winner posts their own hand-class golf value (with the rare cooler bonus — see §7). The **loser's** score is where the two scoring variants diverge:

```
   ┌──── YELLOW JACKET (competitive — default) ────────────────────┐
   │  Decisive-showdown loser scores:                              │
   │    • straight or better (cat ≥ 4) → their own hand-class      │
   │      score, −5..−1 — a "respected loss" (you played a real    │
   │      hand; you don't deserve a bogey).                        │
   │    • a pair / two pair / trips (cat 1–3) → +1 bogey.          │
   │    • only a HIGH CARD — a "brick", nothing made (cat 0):      │
   │        +1 bogey IF they checked through to the mandatory       │
   │          opener (no extra honey committed);                    │
   │        +2 DOUBLE bogey if they BET into the pot (any honey     │
   │          committed past the opener).                           │
   │      → the "pot-gated brick" rule: brick = 1 + ⌊(T − opener)   │
   │        ⁄ opener⌋, where T is the agreed total at showdown and  │
   │        `opener` is the hole's mandatory pot (2 front-9,        │
   │        4 back-9), capped at +2.                                │
   │                                                               │
   │  Mirrors the fold rule (fold = +1 bogey + the honey forfeit)  │
   │  AND its pot-dependence: a brick you bet into costs more, just │
   │  as folding a bigger pot costs more. This is the lever that    │
   │  makes pre-flop hand selection and bluffing matter — folding a │
   │  brick to a bet is now strictly correct, and a big bet         │
   │  threatens a brick with a double bogey.                        │
   │  Sharper skill expression. Champion scores a few under par.    │
   └───────────────────────────────────────────────────────────────┘

   ┌──── BUMBLEBEE (casual) ────────────────────────────────────────┐
   │  Decisive-showdown loser scores their own hand-class score     │
   │  (−5..+2), always. Flush-loser still posts −1 birdie; a brick  │
   │  loser posts their own +2 regardless of pot size. "Your hand   │
   │  always counts." Champion scores deep under par, golf-major    │
   │  style.                                                        │
   └────────────────────────────────────────────────────────────────┘
```

**Folds and ties are the same in both variants.** Folders always post +1 bogey (§3.7); ties always carry the pot (§3.8).

**Configurability (Simulator → Advanced → "Brick loss").** The brick rule has three modes. *Pot-gated, cap +2* is the ship default (validated: it lifts event-level skill expression ~5× and pulls champion totals ~2½ strokes shallower while keeping the career skill metrics — Spearman, authored-vs-measured, elite-major dominance — within a few percent of the classic baseline). *Flat +1* is the classic Yellow Jacket rule (every cat<4 loss is a flat bogey — but then folding a brick costs exactly what showing it down costs, so pre-flop folding and bluffing barely matter). *Flat +2* anchors a uniform double bogey; *Pot-gated, cap +4* escalates further (+3/+4 at big pots — a bigger fold-equity gain, but the high-variance big-pot brick losses degrade the skill metrics). Bumblebee ignores the setting. The AI's showdown-EV math, the equity model, and the skill metrics are all aware of whichever mode is active, so simulation results are authentic to the rule in force.

**Main-final scoring override.** The Main Event's 72-hole *final* round can run a different decisive-loser rule than the rest of the Tour (config `mainFinalsLoserBogey`, exposed as the Simulator's "Main final" control): *inherit* (default — the final follows the variant above), *Yellow Jacket on the final* (force the +1-bogey rule there only — keeps the champion total a tough, over-par gauntlet even if the rest of the Tour is Bumblebee), or *Bumblebee on the final* (force own-hand-loss there only — pulls the champion total deep under par, golf-major style, while the bracket-cut rounds leading to it stay competitive). It affects only the 72-hole aggregate final; the Main's bracket-cut rounds (down to 16) always use the global variant. Everything else — and every regular and Major event — follows the variant chosen above.

### 3.10 Multi-way option (6 / 9 player tables) — designed, not yet active

> **Status:** not active in v69 — heads-up (`tableSize: 2`) is the only running mode. The 6- and 9-player table sizes appear in the Simulator's table-size dropdown for forward-compatibility, but the multi-way matched-contribution runner is not yet implemented; selecting a size above HU has no effect in the current build. This section documents the *designed* multi-way extension that is scaffolded for a v70+ release — it is the spec for when it ships, not a description of current behavior.

The design: the simulator's table-size dropdown carries 6 and 9 alongside HU (the default and, today, the only mode that runs). When the multi-way runner ships, multi-way tables will use **matched-contribution wagering** (like real poker — each player contributes to a shared pot, no agreed-total) rather than the agreed-total semantics of heads-up Honey wagering. R1–R3 are to be played multi-way; R4 collapses to a heads-up final between the top-2 survivors.

The multi-way variant is designed to default to Bumblebee (Honored Loss), since YJ Bogey Loss × 8 losers per pot would pull champion scores too far above par at 9-handed.

### 3.11 Payouts

Top ~15% of finish positions cash. The payout curve decays geometrically (default factor 0.74):

```
   GEOMETRIC PAYOUT CURVE (decay 0.74)
   ─────────────────────────────────────────
   1st place:    biggest share
   2nd:          1st × 0.74
   3rd:          2nd × 0.74
   ...
   15%-line:     last paying position

   Players outside the cash line: lose buy-in.
```

The prize pool is split this way. There is **no rake** on tour events — the full entry-fee (buy-in) pool goes entirely to the prize pool, and any configured sponsor purse is added on top. The Tour takes no house cut at any tier (Regular, Major, or Main).

---

## 4. Mode B — Cash Tables, Pure NLHE

Standard online poker. Drop in, drop out, no rounds, no events.

### 4.1 Where to play

**Yellow Jacket Cash** menu → variant dropdown → **Pure NLHE**

### 4.2 The rules

```
   ┌──── PURE NLHE CASH ─────────────────────────┐
   │                                              │
   │  Buy in with Nectar (e.g. $400 at 5/10).    │
   │  Your stack IS Nectar 1:1. No conversion.   │
   │                                              │
   │  Standard No-Limit Hold'em:                  │
   │    • Blinds posted each hand (SB/BB)         │
   │    • You can bet/raise ANY amount up to     │
   │      your full stack (all-in)                │
   │    • Min raise = previous raise increment   │
   │    • Pot at end of hand is sum of all       │
   │      contributions (matched-contribution,    │
   │      NOT agreed-total like tour)             │
   │                                              │
   │  Showdown: best 5-card hand wins the pot.   │
   │  Cash out anytime. Stack converts back to   │
   │  Nectar 1:1 minus rake taken per pot.        │
   │                                              │
   │  No scorecard. No honey. No strokes.         │
   │  Pure poker P/L in Nectar.                   │
   │                                              │
   └──────────────────────────────────────────────┘
```

### 4.3 Wagering: matched-contribution (standard)

```
   MATCHED-CONTRIBUTION WAGERING (cash)
   ─────────────────────────────────────────────
   Each player contributes to a shared pot.
   Pot = sum of all contributions to date.

   Worked example (5/10 stakes, $400 stacks):
     Preflop: SB $5, BB $10. Pot = $15.
     You raise to $30. Opp calls $30.
     Pot = $15 + $30 + $20 = $65.
     Flop: you bet $40. Opp calls $40.
     Pot = $65 + $80 = $145.
     ... and so on.

   Pot grows by every contribution.
   This is NOT how tour events work.
```

### 4.4 Bet sizing — fully uncapped

You can bet any amount from min-raise up to your full stack on any street. There's no stroke cap, no progressive street unlock, no agreed-total mechanism. It's NLHE with no asterisks.

### 4.5 No strokes, no honey

Pure NLHE has no parallel ledger, no scorecard, no stroke score. Your only result is chip P/L. Stack out > stack in = profit. That's it.

---

## 5. Mode C — Cash Tables, YJ Stroke / Bumblebee Stroke

Same NLHE engine as Pure, **plus a separate golf scorecard** — a per-hand evaluation of skill that runs alongside the chips. You wager Nectar; your hand quality is graded on its own card. The scorecard **does not convert to Nectar** — it is a pure skill record (it feeds your Tour reputation / leaderboards), so a session can be chip-positive and over par, or chip-negative and under par. The chips are the money game; the scorecard is the golf. *(You want to wager cash but have the skill of golf — the two ledgers stay separate.)*

### 5.1 Where to play

- **Yellow Jacket Cash** menu → **YJ Stroke** sub-variant (Bogey Loss)
- **Bumblebee Cash** menu → **Bumblebee Stroke** sub-variant (Honored Loss)

### 5.2 The chip side: identical to Pure NLHE

Bet/call/raise/fold mechanics are unchanged. Stack is Nectar. All-in is your full stack on any street. Matched-contribution pots. Standard rake per pot. Cashout pays your chip stack — nothing else.

### 5.3 The golf scorecard: a separate per-hand skill record

Every **showdown** adds to your scorecard, in **true golf convention** — lower is better, exactly like a tour-event scorecard and the dashboard champion score:

```
   ┌──── GOLF SCORECARD (cash YJ / BB Stroke) ─┐
   │                                            │
   │  At each SHOWDOWN, for every player still   │
   │  in the hand:                               │
   │                                             │
   │    Pot winner:  card += own hand class      │
   │       (Royal / Straight Flush −5 …          │
   │        Full House −2 … Two Pair 0 …         │
   │        High Card +2)                        │
   │                                             │
   │    Every other showdown player:             │
   │      YJ Stroke (Bogey Loss):   card += +1   │
   │      Bumblebee Stroke (Honored Loss):       │
   │                  card += own hand class     │
   │                                             │
   │  Multi-way tables: one pot winner; every    │
   │  other showdown player posts the loser      │
   │  score above.                               │
   │                                             │
   │  Folds do NOT touch the card. Only          │
   │  showdowns are scored.                      │
   │                                             │
   └─────────────────────────────────────────────┘
```

Sign convention: **a negative card = under par over the session** (good — like a real round). The ⛳ pill on each seat is that player's running card; green under par, red over.

Example: you win a showdown with a flush (−1) — card goes to −1. You win another with two pair (0) — card stays −1. You then lose a showdown holding only a high card: under YJ Stroke your card goes to 0 (a +1 bogey for the loss); under Bumblebee Stroke it goes to +1 (your high card scores its own +2, so −1 + 2 = +1).

### 5.4 No Nectar settlement — it's pure skill

When you stand up, your cashout is **just your chip stack** — the golf scorecard never adds to or subtracts from it. The scorecard is recorded to your Tour profile / leaderboards as a skill measure; it does not move money.

### 5.5 Why honey is NOT involved

Despite the brand name "Stroke," these cash variants borrow only the **scorecard** half of the tour Honey-Stroke law. The honey-pot half (agreed-total wagering, mandatory pots, divisor conversion) does NOT apply at cash. Cash is pure NLHE on the wagering side; the scorecard is a parallel skill layer that runs alongside.

---

## 6. What's Shared vs What's Different

```
   ┌──────────────────────────────────────────────────────────────┐
   │                    SHARED BY ALL MODES                        │
   ├──────────────────────────────────────────────────────────────┤
   │  • Standard Texas Hold'em (2 hole + 5 board cards)            │
   │  • Eight beats: Tea Box, Fairway, Lay-Up, Hazard, Approach,   │
   │    Green, Putt, The Cup                                       │
   │  • Hand rankings: HC < Pair < 2P < Trips < Straight <         │
   │    Flush < FH < Quads < SF < RF                               │
   │  • Best 5-card hand from 7 cards wins at showdown             │
   │  • Folds end the hand                                         │
   └──────────────────────────────────────────────────────────────┘

   DIFFERENCES BY MODE
                  ┌──────────────┬──────────┬──────────────┐
                  │ Tour Events  │ Pure NLHE│ YJ/BB Stroke │
                  │ (Honey-Strk) │ Cash     │ Cash         │
   ───────────────┼──────────────┼──────────┼──────────────┤
   Wager unit     │ Honey        │ Nectar   │ Nectar       │
   Wagering type  │ Agreed-total │ Matched  │ Matched      │
   Mandatory pot  │ 2 honey      │ Blinds   │ Blinds       │
   Cap per hole   │ Hole envel.  │ Stack    │ Stack        │
                  │  E×honeyCap  │          │              │
   Street cap     │ K×agreed,    │ None     │ None         │
                  │  ≤3×envel.   │          │              │
   Scorecard      │ Yes          │ No       │ Yes (cash)   │
   Honey ledger   │ Yes          │ No       │ No           │
   Golf scorecard │ Per-hand,    │ No       │ Yes (cumul.  │
                  │  rolled into │          │  session;    │
                  │  round score │          │  skill only) │
   Tied pots      │ Roll forward │ Split    │ Split        │
   Length         │ Event/round  │ Continu. │ Continuous   │
   Payout         │ Finish-pos   │ Per-hand │ Per-hand     │
                  │ ITM curve    │ winner   │ winner       │
   ───────────────┴──────────────┴──────────┴──────────────┘
```

---

## 7. Hand Class → Golf Score Reference

This table applies to: **Tour event scorecards** AND **Cash YJ-Stroke/Bumblebee-Stroke ledgers**.

```
   ┌──────────────────────────┬──────────┬──────────────────┐
   │  Hand Category           │ Score    │ Premium Bucket   │
   ├──────────────────────────┼──────────┼──────────────────┤
   │  Royal Flush             │   −5     │ —                │
   │  Straight Flush          │   −5     │ —                │
   │  Four of a Kind          │   −4     │ —                │
   │  Full House (J+ trips)   │   −3     │ J+ trips premium │
   │  Full House (standard)   │   −2     │ —                │
   │  Flush (T-high+)         │   −2     │ T-high+ premium  │
   │  Flush (standard)        │   −1     │ —                │
   │  Straight (9-high+)      │   −2     │ 9-high+ premium  │
   │  Straight (standard)     │   −1     │ —                │
   │  Three of a Kind         │   −1     │ —                │
   │  Two Pair (J+ top)       │   −1     │ J+ top pair      │
   │  Two Pair (standard)     │    0     │ —                │
   │  Pair (TT+)              │    0     │ TT+ premium      │
   │  Pair (under tens)       │   +1     │ —                │
   │  High Card (J+)          │   +1     │ J-high+ premium  │
   │  High Card (weak)        │   +2     │ —                │
   └──────────────────────────┴──────────┴──────────────────┘

   Range: −5 (best) to +2 (worst).
   Lower = better, like all golf scoring.
```

A frame-aware **showdown matrix** layers adjustments on top in tour events:

- **Respected loss** (Yellow Jacket variant): a loser whose hand is a straight or better posts their own hand-class score instead of a bogey
- **Pot-gated brick loss** (Yellow Jacket variant, default): a loser holding only a high card posts +1 if they checked through to the opener, +2 if they bet into the pot (configurable — see §3.9)
- **Cooler bonus**: when both players have full house or better in a tight gap, the winner gets an extra −1 stroke

The cooler bonus only fires in tour events, never at cash. The cash YJ-Stroke / Bumblebee-Stroke scorecards use the loser-score rules from §5 (which mirror §3.9's structure).

---

## 8. Tournament Structure

### 8.1 Aggregate stroke play (default)

```
   ┌──── 4-ROUND AGGREGATE EVENT (72 holes total) ──┐
   │                                                  │
   │  Round 1 (18 holes)                              │
   │     ↓                                            │
   │  After R1: cushion check                         │
   │  (gap to leader > 12 strokes → eliminated)       │
   │     ↓                                            │
   │  Round 2 (18 holes)                              │
   │     ↓                                            │
   │  After R2: cushion (8) + 50% cut                 │
   │     ↓                                            │
   │  Round 3 (18 holes)                              │
   │     ↓                                            │
   │  After R3: cushion (5) + 50% cut                 │
   │     ↓                                            │
   │  Round 4 (18 holes — championship round)         │
   │     ↓                                            │
   │  Final standings → ITM payouts                   │
   │                                                  │
   └──────────────────────────────────────────────────┘

   Canonical parameter arrays:
     Survival cushion (per round, in strokes): [12, 8, 5, 3]
     Cut schedule (per round, fraction eliminated): [null, 0.50, 0.50, null]

   The cushion tightens each round. Round 1 has the loosest survival
   threshold (12 strokes off the leader); Round 4 has the tightest (3).
   Cuts happen after Rounds 2 and 3 only (the 36-hole and 54-hole milestones);
   Rounds 1 and 4 have no field cut (R1 is too early to thin the field
   meaningfully; R4 is the final round and is decided on score, not cut).

   Eliminated players keep their cumulative score
   frozen and skip the remaining rounds. Their
   finish position reflects the round of elimination.
```

### 8.2 Bracket knockout (alternative)

```
   ┌──── BRACKET KNOCKOUT EVENT ────────────────────┐
   │                                                  │
   │  Round 1: 9-hole heads-up matches                │
   │     loser eliminated, winner advances            │
   │     ↓                                            │
   │  ... continues until field ≤ 16 ...              │
   │     ↓                                            │
   │  Round of 16+: 18-hole heads-up matches          │
   │     ↓                                            │
   │  Final 2: 72-hole heads-up final                 │
   │     ↓                                            │
   │  Champion crowned                                │
   │                                                  │
   └──────────────────────────────────────────────────┘
```

### 8.3 Multi-way table format (designed, not yet active)

> **Status:** not active in v69 — heads-up (`tableSize: 2`) is the only running mode. The diagram below is the *designed* multi-way tournament shape, scaffolded for v70+; the 6- and 9-player table sizes are present in the Simulator's table-size dropdown for forward-compatibility only and have no effect in the current build. Documented here as the spec for when the multi-way runner ships.

```
   ┌──── MULTI-WAY AGGREGATE (6 or 9 per table) ────┐
   │              (DESIGN — not yet active)          │
   │  R1: tables of N players, matched-contribution  │
   │  R2: tables of N players                         │
   │  R3: tables of N players                         │
   │  R4: collapses to heads-up final                 │
   │      (top-2 survivors, 18 holes)                 │
   │                                                  │
   └──────────────────────────────────────────────────┘
```

### 8.4 Golf-cut spectator tournament (Spectator Mode)

The Spectator Mode's "Live Tournament" runs a **golf-cut heads-up bracket**: after every round, **50% of the field is cut** by cumulative honey-adjusted strokes (the round's honey cap is applied at each round end, exactly as in a live event), and play continues until a champion is crowned. The championship round is labelled **"🏆 Final Table"** and the round before it **"🥇 Semi-Final."** Fields are capped per tier — Regular 8, Major 16, Main 32 — so the parallel simulation stays browser-feasible.

### 8.5 Sudden-death playoffs

If two or more players are tied after the scheduled holes, a short 2–4 hole aggregate playoff resolves the tie. No mandatory 1-on-1 final; playoff fires only when needed.

---

## Quick Reference Cheat Sheet

```
   ╔══════════════════════════════════════════════════════════╗
   ║                  WHICH MODE DO I WANT?                    ║
   ╠══════════════════════════════════════════════════════════╣
   ║                                                            ║
   ║  Want a tournament? Pay buy-in, finish in a position?     ║
   ║    → Tour Events (Single Player / Multiplayer / Sim)      ║
   ║      Honey-Stroke scoring. Yellow Jacket or Bumblebee.    ║
   ║                                                            ║
   ║  Want pure standard online poker? Drop in, drop out?       ║
   ║    → Yellow Jacket Cash → Pure NLHE                       ║
   ║      Just Nectar P/L. No strokes. Honey not involved.     ║
   ║                                                            ║
   ║  Want cash poker WITH a separate golf scorecard          ║
   ║  grading your hand quality (skill only, no payout)?      ║
   ║    → Yellow Jacket Cash → YJ Stroke (Bogey Loss)          ║
   ║    → Bumblebee Cash → Bumblebee Stroke (Honored Loss)     ║
   ║      NLHE wagering + separate golf scorecard.            ║
   ║                                                            ║
   ╚══════════════════════════════════════════════════════════╝
```

---

## One-Line Summaries

- **Tour Honey-Stroke** (also marketed as **Sweet Stroke**): 8-beat Hold'em hole (Tea Box → The Fairway → The Lay-Up → The Hazard → The Approach → The Green → The Putt → The Cup) + bounded golf score per hole + honey pot that converts to strokes via the honey cap at each round end. Two variants (Yellow Jacket / Bumblebee) differ only on decisive-showdown loser score.
- **Pure NLHE Cash**: Standard online poker, no strokes, no honey, just chip P/L.
- **YJ Stroke / Bumblebee Stroke Cash**: Pure NLHE wagering + a *separate* golf scorecard scored per showdown from hand class (true golf convention, lower = better; YJ loser posts +1 bogey, Bumblebee loser posts own hand). The scorecard is a pure skill record — it does not convert to Nectar; cashout pays your chip stack only.

That's the entire game in three sentences.
