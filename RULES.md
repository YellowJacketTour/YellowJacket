<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup), and the
  Tour de Bourdon season-system marks ("Tour de Bourdon", "Tour of the
  Bumblebee", "the Nectour", "the Royal Suitor", "the Pollen Trail",
  "the Top Pot", "the Hive Rating") are trademarks of Blank Canvas, Inc.
  The scoring law and rule set described herein are proprietary.
  Unauthorized reproduction prohibited.
-->

# Yellow Jacket Tour — Complete Rules Manual

Yellow Jacket Tour is a hybrid of heads-up Texas Hold'em and tournament golf, scored on a single proprietary law called **Honey-Stroke** (also marketed as **Sweet Stroke** — same system, two consumer-facing brand names, both protected). Every hand of poker becomes one hole on a golf scorecard. The pot you win sweetens your golf score; the pot you lose costs you strokes. Lower wins, just like real golf.

**You're always on the Tour.** That's the central brand position. The Tour isn't just the championship circuit — it's the world you inhabit as a Yellow Jacket player. Tour events are where titles are won, but every cash hand you play, every table you sit at, every stroke you bank — those count too. Your strokes follow you across the Tour. Your reputation follows you across the Tour. There is no "outside the Tour" mode in this product; the cash tables are the Tour at the cash table.

The product runs in three modes inside that one Tour ecosystem: **tour events** (the WSOP/PGA-style championship circuit, the headline product, the home of Honey-Stroke), and two **cash-table** modes (Pure NLHE for poker purists who want the standard online poker experience inside the Tour, and YJ/Bumblebee Stroke for cash players who want a parallel stroke ledger that ties cash play to the same Tour-scoring framework).

**Golf scoring is universal.** Every hand of poker, in *every* mode, has a golf value — the scorecard is the foundational mechanic, not a tour-event add-on. Tour events roll that value into a fixed round; cash tables keep it on **the Endless Card** (§4.5), a never-ending, self-normalizing record built for sessions that run for hours. There is no mode where your skill goes unrecorded.

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
9. [Tour de Bourdon — The Canonical Season ("the Nectour")](#9-tour-de-bourdon--the-canonical-season-the-nectour)
10. [The Honey-Stroke Scorecard Components (UI)](#10-the-honey-stroke-scorecard-components-ui) — *new in v69.124*

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

When a hand goes to showdown and is **not** a tie, the **winner** posts their own hand-class golf value (with the rare cooler bonus — see §7). The **loser's** score is where the two scoring variants diverge.

**The Yellow Jacket loser ladder.** Under the competitive variant, a decisive-showdown loser climbs a single monotone ladder — golf's own scoring shape: *better than a bogey → a bogey → a worse-than-a-bogey blow-up*. Four named rungs:

| Rung | Loser's hand at showdown | They post | Read it as… |
|------|--------------------------|-----------|-------------|
| **Next Best** *(a.k.a. respected loss / "coolered" / "a losing birdie")* | a **straight or better** (category ≥ 4) | their **own hand-class score, −5…−1** | *a birdie's a birdie, even on a hole you lost.* You had a real top-tier hand and ran into a bigger one — you keep your (negative) number. This is the loser side of the **cooler bonus** (§7): the winner gets an extra −1, the loser keeps their −5…−1 instead of any bogey. |
| **Take a Stroke** *(a.k.a. "a two-putt bogey" / "take your medicine" / a working bogey)* | a **pair / two pair / trips** (category 1–3) | **+1 bogey** | the routine, no-drama outcome — the modal showdown loss. You had something, it wasn't enough; write the one over and move on. (Same +1 the fold costs — see below.) |
| **Lay a Brick** *(a.k.a. "checked it down with air" / "a brick in your pocket")* | only a **high card** — a "brick", nothing made (category 0) — and the pot **never reached double the opener** (you checked it through) | **+1 bogey** | you showed down air, but the cheap way — you didn't commit to it. |
| **Stack Bricks** *(a.k.a. "the 3-putt" / "spewed into it" / "barreled with air")* | only a **high card** — a "brick" — and you committed honey until the **agreed total reached at least double the opener** | **+2 — the blow-up** *(climbs to +3 / +4 in big pots under the cap-+4 setting)* | the card-wrecker. You bet your nothing into a grown pot — and you lose the larger honey too, so committed air gets hit on both axes. |

The brick (Lay a Brick / Stack Bricks) score is `1 + ⌊(T − opener) ⁄ opener⌋`, clamped to `[1, cap]`, where **T** = the agreed total at showdown, **opener** = the hole's mandatory pot (2 honey front-9, 4 honey back-9), and **cap** = 2 by default. So T = opener → +1; T ≥ 2·opener → +2; under cap +4, T ≥ 3·opener → +3 and T ≥ 4·opener → +4. (A tiny min-raise that doesn't *double* the opener stays at +1.)

Read top to bottom the rungs are non-decreasing in cost — **Next Best (−5…−1)  <  {Take a Stroke, Lay a Brick} (+1)  <  Stack Bricks (+2)** — and they're strictly increasing in *blame*: you ran into a hand (no blame, still a birdie) → took a stroke (no blame, a bogey) → laid a brick (mild — air, but cheap) → stacked bricks (real — air you committed to, the blow-up). On the card, Take a Stroke and Lay a Brick are the same +1; the difference is the honey and the story.

**The fold sits off the ladder — "put me down for 1".** Whatever you'd been holding and however much was bet, the folder posts a **fixed +1 bogey** (the only part that scales is the honey forfeit, sized to the *previously-agreed* pot — see §3.7), and cards are never revealed. A fold **never** costs +2: that's the whole point of the escape hatch — *show* a brick you committed to and it's +2 (and you lose the bigger pot); *fold* it to a bet and it's +1 (and you lose only the smaller pre-bet pot). So folding a brick to a bet is strictly cheaper on both axes — which is exactly what gives folding (and therefore bluffing) its strategic weight.

Under **Bumblebee** there is no ladder — the loser always posts their **own hand-class score** (−5…+2), so a flush-loser still records a −1 birdie and a brick-loser posts their own +2 regardless of pot size.

The full per-hand-class outcome table (every score a hand can post — win, lose-Yellow-Jacket, lose-Bumblebee — plus folds, ties, and the honey layer) is in §7.

```
   ┌──── YELLOW JACKET (competitive — default) ────────────────────┐
   │  Decisive-showdown loser climbs the loser ladder:             │
   │    • NEXT BEST — straight or better (cat ≥ 4) → their own      │
   │      hand-class score, −5..−1. ("Coolered" — you played a      │
   │      real hand, ran into a bigger one; a birdie's a birdie.)   │
   │    • TAKE A STROKE — pair / two pair / trips (cat 1–3) → +1    │
   │      bogey. (The routine, no-drama loss — a two-putt bogey.)   │
   │    • LAY A BRICK — only a HIGH CARD ("a brick", cat 0) that    │
   │      checked through to the opener (pot never doubled it)      │
   │      → +1 bogey. (Showed down air the cheap way.)             │
   │    • STACK BRICKS — only a HIGH CARD bet into a grown pot      │
   │      (agreed total ≥ 2× the opener) → +2, the blow-up.        │
   │      (The 3-putt — and you lose the bigger honey too.)        │
   │      → the "pot-gated brick" rule: 1 + ⌊(T − opener) ⁄        │
   │        opener⌋, T = agreed total at showdown, opener = the    │
   │        hole's mandatory pot (2 front-9, 4 back-9), cap 2      │
   │        (cap 4 keeps it climbing +3/+4 in big pots).           │
   │                                                               │
   │  FOLD — "put me down for 1": folder posts +1, period (+ the   │
   │  previously-agreed honey forfeit); cards never revealed. A    │
   │  fold never costs +2 — fold a brick to a bet and it's +1 and  │
   │  the smaller pot; show it down and it's +2 and the bigger    │
   │  pot. That asymmetry is the lever that makes pre-flop folding │
   │  and bluffing matter. Sharper skill; champion a few under par.│
   └───────────────────────────────────────────────────────────────┘

   ┌──── BUMBLEBEE (casual) ────────────────────────────────────────┐
   │  No ladder — decisive-showdown loser posts their own hand-     │
   │  class score (−5..+2), always. Flush-loser still posts −1      │
   │  birdie; a brick loser posts their own +2 regardless of pot    │
   │  size. "Your hand always counts." Champion deep under par,     │
   │  golf-major style.                                             │
   └────────────────────────────────────────────────────────────────┘
```

**Folds and ties are the same in both variants.** Folders always post +1 bogey ("put me down for 1" — §3.7); ties always carry the pot (§3.8).

**Configurability (Simulator → Advanced → "Brick loss").** The brick rule has three modes. *Pot-gated, cap +2* is the ship default (validated: it lifts event-level skill expression ~5× and pulls champion totals ~2½ strokes shallower while keeping the career skill metrics — Spearman, authored-vs-measured, elite-major dominance — within a few percent of the classic baseline). *Flat +1* is the classic Yellow Jacket rule (every cat<4 loss is a flat bogey — but then folding a brick costs exactly what showing it down costs, so pre-flop folding and bluffing barely matter). *Flat +2* anchors a uniform double bogey; *Pot-gated, cap +4* escalates further (+3/+4 at big pots — a bigger fold-equity gain, but the high-variance big-pot brick losses degrade the skill metrics). Bumblebee ignores the setting. The AI's showdown-EV math, the equity model, and the skill metrics are all aware of whichever mode is active, so simulation results are authentic to the rule in force.

**Main-final scoring override.** The Main Event's 72-hole *final* round can run a different decisive-loser rule than the rest of the Tour (config `mainFinalsLoserBogey`, exposed as the Simulator's "Main final" control): *inherit* (default — the final follows the variant above), *Yellow Jacket on the final* (force the +1-bogey rule there only — keeps the champion total a tough, over-par gauntlet even if the rest of the Tour is Bumblebee), or *Bumblebee on the final* (force own-hand-loss there only — pulls the champion total deep under par, golf-major style, while the bracket-cut rounds leading to it stay competitive). It affects only the 72-hole aggregate final; the Main's bracket-cut rounds (down to 16) always use the global variant. Everything else — and every regular and Major event — follows the variant chosen above.

### 3.10 Multi-way option (6 / 9 player tables) — active

> **Status:** live. The Simulator's table-size dropdown offers 2 (heads-up, the canonical engine and the default), 4, 6, and 9. Any size above HU routes aggregate stroke-play events through the multi-way matched-contribution runner; heads-up (`tableSize: 2`) still uses the unchanged `playMatch` / `runStrokePlayEvent` path. The bracket-knockout format is HU-only — multi-way applies to the aggregate-stroke-play format.

How it works: rounds R1–R3 are played at tables of `tableSize` players using **matched-contribution wagering** (like real poker — each player contributes to a shared pot, no agreed-total) rather than the agreed-total semantics of heads-up Honey wagering; R4 collapses to a **heads-up final between the top-2 survivors** (which then plays under the heads-up engine). Cushion + cut mechanics layer on identically, with a tighter `[8, 5, 3, 2]` cushion table at multi-way.

Multi-way calibration: per-player honey caps scale down with table size (≈ HU-cap ÷ 2.5 at 9-handed, tuned so per-pair stroke variance matches HU); AI fold discipline tightens by 0.025 of equity slack per extra seat (`slack = 0.20 − 0.025·(N−2)`) so fold discipline doesn't collapse at 9-handed; and at `tableSize > 6` the mandatory opener doubles to 2 honey to compensate for thinner per-seat equity. The decisive-loser rule still applies pairwise (winner vs each loser), including the pot-gated brick rule under Yellow Jacket.

The multi-way variant defaults to **Bumblebee** (Honored Loss — config `multiwayVariant`), because YJ Bogey Loss × up to 8 losers per pot would pull champion scores too far above par at 9-handed; the Simulator's "Multi-way" control flips it to Yellow Jacket if you want the harsh version. HU events ignore `multiwayVariant` and use the main Variant.

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
   │  No honey, no strokes-as-penalty — but        │
   │  your golf skill IS tracked on the           │
   │  Endless Card (§4.5). Money result is        │
   │  pure poker P/L in Nectar; the card is        │
   │  a parallel skill record, never money.       │
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

### 4.5 The Endless Card — golf scoring for the long session

Pure NLHE has **no honey** and **no penalty ledger** — your money result is pure chip P/L (stack out > stack in = profit). But your *golf skill* is always tracked, on **the Endless Card**: a continuous, self-normalizing scorecard built for cash sessions that never reach a "round end."

**How it scores.** Identical hand-class scoring to everything else (§7), recorded at every **showdown**:
- **You win the pot** → the card takes your own hand-class score (Royal/SF −5 … Two Pair 0 … High Card +2).
- **You lose a showdown** → by default Pure NLHE uses the **Honored (Bumblebee) convention**: you simply post your own hand's score — no penalty, no brick ladder. *(Pure poker stays pure; the card just records what you showed.)* A table option can switch the card to the **YJ-Stroke** loser ladder (§3.9) for players who want the sharper game.
- **Folds and tied pots do NOT touch the card.** Only contested showdowns score — so a session of nothing but folds simply scores zero holes, and a nit can't farm a low card by never playing.

**Why "endless."** A cash session has no fixed 9/18/72-hole boundary, so the card never forces a "final score." Instead it maps your play onto golf's natural unit — the 18-hole round — without ever making you stop:
- **Live headline = scoring average to par, per 18:** `pace = (cumulative strokes ÷ holes scored) × 18`. Par is 0. A player averaging −0.4/hole reads **"−7.2 per 18"** — instantly legible, and just as meaningful after 12 holes as after 1,200. This is the elegant, length-independent number the seat shows.
- **Auto-logged rounds:** every **18 scored holes** closes one round (its under/over-par total is stamped to your history) and a fresh round opens seamlessly. Hours of play become a clean series of 18-hole rounds plus a live partial — and a **best-round** to chase.
- **Raw counters** (cumulative strokes, holes scored) are always available underneath for the grinder who wants the absolute number.

**No Nectar settlement.** Like the YJ/BB Stroke cash card (§5.4), the Endless Card never adds to or subtracts from your cashout — it is recorded to your Tour profile / leaderboards as a skill measure only. The ⛳ pill on your seat shows your live "per 18" pace: green under par, red over.

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
   ┌──── GOLF SCORECARD (cash YJ / BB Stroke) ──────┐
   │                                                 │
   │  At each SHOWDOWN, for every player still        │
   │  in the hand:                                    │
   │                                                  │
   │    Pot winner:  card += own hand class           │
   │       (Royal / Straight Flush −5 …               │
   │        Full House −2 … Two Pair 0 …              │
   │        High Card +2)                             │
   │                                                  │
   │    Every other showdown player:                  │
   │      YJ Stroke (Bogey Loss) — the tour loser     │
   │        ladder (§3.9), with the posted blinds      │
   │        standing in for the mandatory opener:     │
   │          • NEXT BEST — straight or better → own  │
   │            −5..−1 ("coolered")                   │
   │          • TAKE A STROKE — trips / 2 pair /      │
   │            pair → +1 bogey                       │
   │          • LAY A BRICK — high card, pot was just │
   │            the blinds (limped, checked down)     │
   │            → +1 bogey                            │
   │          • STACK BRICKS — high card, pot grew    │
   │            to ≥ 2× the blinds (any raised pot)   │
   │            → +2, the blow-up (cap +2 at cash)    │
   │      FOLD — "put me down for 1": no scorecard    │
   │        entry at all (cash folds/ties don't       │
   │        touch the card; only showdowns score).    │
   │      Bumblebee Stroke (Honored Loss):            │
   │          card += own hand class, always          │
   │                                                  │
   │  Multi-way tables: one pot winner; every         │
   │  other showdown player posts the loser score     │
   │  above.                                          │
   │                                                  │
   │  Folds do NOT touch the card. Only showdowns     │
   │  are scored.                                     │
   │                                                  │
   └──────────────────────────────────────────────────┘
```

The posted blinds (small + big) are the cash analog of the tour's mandatory 2-honey opener — the dead money in the pot before anyone acts — so the brick rule reads the same way at the cash table as on Tour: *fold the brick to a bet, or eat the double bogey.*

Sign convention: **a negative card = under par over the session** (good — like a real round). The ⛳ pill on each seat is that player's running card; green under par, red over.

Example: you win a showdown with a flush (−1) — card goes to −1. You win another with two pair (0) — card stays −1. You then lose a showdown holding only a high card in a raised pot: under YJ Stroke your card goes to +1 (a +2 double bogey — the pot grew past the blinds); had you limped and checked it down, it would be 0 (a +1 bogey). Under Bumblebee Stroke it goes to +1 either way (your high card scores its own +2, so −1 + 2 = +1).

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
   Scorecard      │ Yes          │ Yes      │ Yes (cash)   │
   Honey ledger   │ Yes          │ No       │ No           │
   Golf scorecard │ Per-hand,    │ Endless  │ Yes (cumul.  │
                  │  rolled into │  Card    │  session;    │
                  │  round score │  (§4.5)  │  skill only) │
   Tied pots      │ Roll forward │ Split    │ Split        │
   Length         │ Event/round  │ Continu. │ Continuous   │
   Payout         │ Finish-pos   │ Per-hand │ Per-hand     │
                  │ ITM curve    │ winner   │ winner       │
   ───────────────┴──────────────┴──────────┴──────────────┘
```

---

## 7. Hand Class → Golf Score Reference (the outcome matrix)

This is the single source of truth for **every score a hand can post**. It applies to **Tour event scorecards** AND **Cash YJ-Stroke / Bumblebee-Stroke ledgers** (with the cash caveats noted below). Lower = better, like all golf scoring.

### 7.1 The base hand-class score (what the winner posts)

A decisive-showdown **winner** posts the golf value of their own hand class. Each class has a *standard* value and, for several classes, a *premium-kicker* value one stroke better:

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
```

**Cooler bonus** (tour events only): when **both** players show a **full house or better** *and* they're within one hand-category of each other, the **winner** gets an extra **−1**, floored at **−6**. Frequency: well under 0.1% of showdowns; never affects the loser; never fires at cash.

### 7.2 The full outcome matrix — every score, every outcome

The **Lose — Yellow Jacket** column is the loser ladder of §3.9 — *Next Best* (straight+ keeps its own −5…−1), *Take a Stroke* (pair/2P/trips → +1 bogey), *Lay a Brick* (high card checked through → +1) and *Stack Bricks* (high card bet past 2× the opener → +2, the blow-up):

| Hand at showdown | **Win** the pot¹ | **Lose** — Yellow Jacket | **Lose** — Bumblebee |
|------------------|------------------|--------------------------|----------------------|
| Royal / Straight Flush | −5 | **−5**  · Next Best | −5 |
| Four of a Kind | −4 | **−4**  · Next Best | −4 |
| Full House (J+ trips) | −3 | **−3**  · Next Best | −3 |
| Full House (standard) | −2 | **−2**  · Next Best | −2 |
| Flush (T-high or better) | −2 | **−2**  · Next Best | −2 |
| Flush (standard) | −1 | **−1**  · Next Best | −1 |
| Straight (9-high or better) | −2 | **−2**  · Next Best | −2 |
| Straight (standard) | −1 | **−1**  · Next Best | −1 |
| Three of a Kind | −1 | **+1**  · Take a Stroke | −1 |
| Two Pair (J+ top pair) | −1 | **+1**  · Take a Stroke | −1 |
| Two Pair (standard) | 0 | **+1**  · Take a Stroke | 0 |
| Pair (TT or better) | 0 | **+1**  · Take a Stroke | 0 |
| Pair (under tens) | +1 | **+1**  · Take a Stroke | +1 |
| High Card (J-high+) | +1 | **+1** Lay a Brick / **+2** Stack Bricks² | +1 |
| High Card (weak) | +2 | **+1** Lay a Brick / **+2** Stack Bricks² | +2 |

¹ **Win:** add the cooler bonus (−1, floored at −6) when both players show a full house or better within one category — winner only, <0.1% of showdowns.
² **Brick:** **Lay a Brick = +1** if the agreed total never reached double the opener (you checked it through). **Stack Bricks = +2** (the blow-up) once it did. Formula `1 + ⌊(T − opener)/opener⌋`, clamped to `[1, cap]`. `cap = 2` by default; the **"Brick loss"** control (Simulator → Advanced) offers *Flat +1* / *Flat +2* / *Pot-gated cap +2 ★* / *Pot-gated cap +4* — under cap +4 a big-pot brick can reach **+3** or **+4**. Tour `opener` = the hole's mandatory pot (2 front-9, 4 back-9). See §3.9 for the full loser ladder. A **fold** never lands on this column — the folder always posts +1 ("put me down for 1"), cards unrevealed (§7.3).

### 7.3 Outcomes that don't depend on your hand

| Outcome | Folder / loser | Other player |
|---------|----------------|--------------|
| **Fold** — *"put me down for 1"* (cards never revealed) | **+1** bogey, always (never +2) + (the previously-agreed pot ÷ round-end honey cap) honey forfeit — the only part that scales | **0** par; gains the previously-agreed pot in honey |
| **Tie** (same hand value) | **0** par | **0** par; the *whole* pot carries to the next decisive hole, plus a consecutive-tie bonus of up to +5 honey |
| **Honey layer** (separate, applied once at round end) | round net honey ÷ round-end honey cap, added to that round's scorecard | — |

### 7.4 Cash caveats

The cash **YJ-Stroke / Bumblebee-Stroke** golf scorecards use the same matrix and the same loser ladder (§5, §3.9), with three differences: (a) **class-only** scores — no premium-kicker buckets; (b) **no cooler bonus**; (c) the brick rung's **`opener` is the posted blinds (small + big)** instead of a honey opener, and the cap is fixed at **2**. Cash folds and ties don't touch the scorecard at all — only showdowns are scored. The cash scorecard is a pure skill record; it does not convert to Nectar.

**Overall range:** −6 (cooler winner) … +2 (a weak high-card showdown loser under Bumblebee, or a committed brick under the default Yellow Jacket cap) — or up to +4 if the Brick-loss cap is raised to 4.

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

### 8.3 Multi-way table format (active)

> **Status:** live (see §3.10). Available in the aggregate-stroke-play format only; the bracket-knockout format is heads-up. Selecting table size 4 / 6 / 9 in the Simulator runs aggregate events through the multi-way matched-contribution runner; table size 2 (the default) uses the heads-up engine.

```
   ┌──── MULTI-WAY AGGREGATE (4, 6, or 9 per table) ─┐
   │  R1: tables of N players, matched-contribution  │
   │  R2: tables of N players                         │
   │  R3: tables of N players                         │
   │  R4: collapses to heads-up final                 │
   │      (top-2 survivors, plays the HU engine)      │
   │                                                  │
   │  Caps scale down with N; opener doubles to 2     │
   │  honey at N > 6; cushion table tightens to       │
   │  [8, 5, 3, 2]. Default loser rule at multi-way:  │
   │  Bumblebee (config multiwayVariant).             │
   └──────────────────────────────────────────────────┘
```

### 8.4 Golf-cut spectator tournament (Spectator Mode)

The Spectator Mode's "Live Tournament" runs a **golf-cut heads-up bracket**: after every round, **50% of the field is cut** by cumulative honey-adjusted strokes (the round's honey cap is applied at each round end, exactly as in a live event), and play continues until a champion is crowned. The championship round is labelled **"🏆 Final Table"** and the round before it **"🥇 Semi-Final."** Fields are capped per tier — Regular 8, Major 16, Main 32 — so the parallel simulation stays browser-feasible.

### 8.5 Sudden-death playoffs

If two or more players are tied after the scheduled holes, a short 2–4 hole aggregate playoff resolves the tie. No mandatory 1-on-1 final; playoff fires only when needed.

---

## 9. Tour de Bourdon — The Canonical Season ("the Nectour")

Tour de Bourdon — "Tour of the Bumblebee," evoking the Tour de France; colloquially **"the Nectour"** — is the production season layer of Yellow Jacket Tour. It sits **above** the per-event Honey-Stroke engine (§3) and gives the year a shape: a fixed calendar of events, one rolling skill rating, and three named year-end honors. The live engine is on the Spectator screen → "Tour de Bourdon" card; the validation study is on the same card; console aliases `runBourdonStudy(opts)` / `runNectourStudy(opts)` / `runBourdonCareer(cfg, seed, nSeasons)`.

### 9.1 The calendar — three tiers

A production season is a fixed slate of **65 events** in a 1024-player universe:

| Tier | # / season | Field size | Open-qualifier slots | Format | Prestige multiplier |
|---|---|---|---|---|---|
| **Regulars** | 52 | 256 | ~50% (retail-heavy) | classic 4-round 72-hole tournament | 1.0 |
| **Majors — "the stages"** | 12 | 320 | ~15% (mostly exempt elite) | 4 staged **72-hole** "mountain stages" with cuts (288-hole championship); no heads-up final | 1.35 |
| **The Main Event → the Top Pot** | 1 | 384 | ~25% (longest qualifier chain) | 4 staged 72-hole legs to crown a standing; then the top 2 advance to **the Top Pot — a 72-hole heads-up final** | 1.6 |

The **Tour-de-France framing** is deliberate: Regulars are the weekly stages; Majors are the mountain stages where the field separates; the Main is the climactic time-trial-into-finale; the Top Pot is the closing sprint. The Majors *are* called "the stages" inside the engine and in the broadcast.

### 9.2 The Hive Rating — the season's skill rating

Every rated event feeds the **Hive Rating** — a Kalman / Glicko-2-flavored filter on each player's latent skill. The published rating is an Elo-style integer: `clamp(800, 3200, round(2000 + 400·μ))`, with a ± confidence band (RD) and a Glicko-2-flavored volatility term (streaky players keep a wider band, anti-bank).

Per event, two signals feed the rating, blended at **α = 0.6**:

1. **OUTCOME signal** — a field-relative performance z: `(1 − marginWeight)·z_rank + marginWeight·z_margin + fieldStrengthLambda·μ̄_field`, where `z_rank` is the rankit (probit) transform of a **cut-blind smooth per-round-average order** (so a strong player who got cut on a near-coin-flip cut still measures well), `z_margin` is the winsorized stroke margin, and the final term is the OWGR-style strength-of-field bump.
2. **DECISION-QUALITY signal (Phase C, v69.103+)** — an observed-action / **EV-loss skill credit**: per hand, the engine computes the EV-gap between the action a player took and the action a game-theoretic-optimal solver would have taken at that decision node. The gap (in bb/100) is z-normalized across the event's field and fed into the rating. For AI play, the formula is analytical (`true_EVloss = K·(1−skill)^p`, with measurement noise scaled by √(18/holes) so longer events measure with proportionally lower noise). For a real-player tour, a per-hand solver pass against the player's strategy posterior fills the same slot (the same metric every modern poker training tool — PioSolver, GTOWizard, MonkerSolver — uses for poker skill measurement; chess engine analysis and golf's strokes-gained metric do the equivalent in their sports).

The per-event update precision is `τ_event = τ₀ · prestige(tier) · √(holes/72) · √(min(N,400)/64) · (rounds_played / R) · sofMul`, where `sofMul = 0.6` if the field is weak (the strength-of-field floor — anti-farming guard). Between events the rating drifts (1/P += ω·f, where f is volatility-scaled); between seasons the off-season drift widens the band further (form fades, OWGR-style).

### 9.3 The three honors

At season's end the rating board produces three named honors. They are **deliberately usually different people**.

#### 🧥 The Yellow Jacket + 🧸 the Bumblebee plushie — the chaotic week

Won by **the Top Pot heads-up champion** — i.e. whoever wins the heads-up final at the end of the Main Event. The trophy is the Kill-Bill-style yellow jumper plus a Bumblebee plushie companion gift. The Top Pot is single-match, so the Jacket stays close to a coin-flip between the two finalists, though both finalists are fed by the Main's standings, so the Jacket winner is still typically a high-rated player even when not the highest-skill on the day.

Three Top-Pot finale modes (`finaleMode`):
- **`none`** (production default) — straight heads-up, lowest score wins, anyone's game.
- **`fixed`** — the higher-rated finalist gets a stroke head-start ∝ rating advantage (β fixed).
- **`calibrated`** — β is Monte-Carlo-solved per event to hit a target favorite-win probability θ*.

#### 👑 The Royal Suitor — class confirmed

Won by **the player atop the Hive Rating** at season's end who meets all three eligibility criteria:

1. **Events:** played ≥ `minEventsForCrown` of the season's events (production: ~45% of the calendar, ≥3).
2. **Majors:** played ≥ **rating-tier-scaled** fraction of Majors:
   - Top-1%-by-rating need **≥ 90%** of Majors (≥11 of 12)
   - Top-10%-by-rating need **≥ 70%** of Majors (≥9 of 12)
   - Everyone else needs **≥ 50%** of Majors (≥6 of 12)
   This is the **anti-coasting rule** (v69.105 default): a dynasty player can't bank a Y2 lead by skipping the late Majors of the schedule — elite status is also a participation obligation.
3. **Confidence:** rating deviation (RD) ≤ `crownRdCap` (~ 160 Hive-Rating points).

**LCB fallback:** if NO player clears all three criteria in a given season, the title falls to the player with the highest **lower-confidence-bound rating** `μ − 1.5·RD` among those who played enough events. This is "good AND trusted" — never a fluky-few-events spike.

The Royal Suitor is the maillot jaune of the bumblebee — the season's skill verdict, analogous to golf's OWGR year-end #1 / cycling's GC winner / tennis's year-end ATP #1. Measured production behavior (in-app, real engine, locked production config, Phase C @ α=0.6): **the Royal Suitor lands on a top-decile-skill player consistently** (crownSkillPct ≈ 0.90), and the **true #1 skill player lands in the top 8–9% of the season rating** (bestPlayerRatingPct ≈ 0.91) — the rating reliably *finds* the elites, even though it doesn't always crown the literal-rank-1 player specifically (at a 1024-player universe with the wide skill spread, many near-elite players are tightly bunched at skill ≥ 0.93 and the rating's specific rank-1 floats within that cluster). The right way to read the system is "the Suitor is reliably a near-elite player," not "the literal #1 always wins" — that latter framing isn't even what real-world year-end rankings deliver.

#### 🌼 The Pollen Trail — the form champion

A **third honor**, deliberately subordinate to the two headlines. Won by the leader of a **parallel decaying-points race** that runs alongside but separate from the Hive Rating (the rating math is *not* touched).

Mechanics:
- Each event awards points to the top finishers on a Tour-de-France-jersey-style curve (top-15 in Regulars, top-16 in Majors, top-16 in the Main; bigger weights for bigger tiers).
- Every event a player participates in, **all their prior points are multiplied by 0.92** before that event's points are added. Decay-on-participation means dormancy doesn't penalize; recent form does.
- Season-end leader = the **Pollen Trail** — the year's "form champion." A player who was sharpest most recently rather than across the whole season.

Mirrors the Tour de France's three jerseys: yellow (GC) → green (points) → polka-dot (mountains). Here: gold-Jacket / blue-Suitor / green-Pollen-Trail. The Pollen Trail can and often does crown a different player than the Suitor — that's the design.

### 9.4 Field selection — the qualifier ladder

Each event's field is built by `_pickField(U, size, slots)`:
- Top `(size − slots)` players by Hive Rating = **exempt**.
- Remaining `slots` are picked from outside the exempt set by `μ + qualifierNoise·N(0,1)` (with `qualifierNoise = 1.4` z-SD).
- For **Majors**, the qualifier-q also includes a `formWeight·formΔ` term (default 0.7) — so a hot streak earns Major spots over a slightly higher-rated but cold player. The "breakthrough qualifier" narrative.

Qualifier-slot fractions by tier are derived in `_norm` from field size: Regulars 50%, Majors 15%, Main 25%.

### 9.5 Off-season + multi-year careers

Between calendar years:
- Each player's rating drifts (`driftRating(dt = offSeasonGap = 2)`) — extra process noise, form fades.
- Volatility relaxes toward typical (`vol ← 0.5·vol + 0.5`).
- All other state (earnings, wins, majorsPlayed, Pollen Trail points if you keep the flag on across seasons) carries forward at the engine's choice.

A 6-season `runCareer` is the production default — long enough to see legacies emerge, short enough to run in seconds in the validation study.

### 9.6 Anti-gaming

1. **Field-strength floor (SOF)** — a weak field (mean rating below `sofFloorMu = −0.10` z) has its results carry only 60% of the normal information weight (`τ × 0.6`). Can't farm rating off soft fields.
2. **Glicko volatility** — wildly-swinging results widen the drift band, so a hot streak can't be banked permanently.
3. **Multi-criteria Suitor eligibility** — events + tier-scaled Majors + RD-tightness, all three. A deep run in 2 events does not crown anyone.
4. **Anti-coasting Majors floor (v69.105)** — top-rated players have to play MORE Majors, not fewer. Elite participation is mandatory.
5. **Volume cap (dormant)** — `volumeCapPerWindow` / `volumeWindow` are built into the engine for a future multi-track calendar where a player could enter overlapping events. Disabled by default because the current sim is sequential.

### 9.7 The validation study

`Season.makeStudyJob(opts)` runs **chunked** (non-freezing) multi-arm validation studies that the user can drive from the Spectator UI:
- Each arm is a (RegHoles, MajHoles, MainHoles) tuple plus optional flag overrides.
- Production sweeps compare the locked default config vs the classic-18-everything baseline vs a no-skill reference (`skillSpread='flat'`).
- Outputs a full metric table: ρ_active / ρ_season / ρ_eligible / ρ_main / crownSkillPct / trueNo1IsCrown / top5SkillIsCrown / jacketSkillPct / jacketSeasonPct / topPotFavoriteWon / topPotNo1InFinal / rhoByYear.
- CSV export with full config snapshot. Deterministic per seed.

Confirmed measured behavior (v69.103+ real-engine in-app validation sweeps at the locked production config, Phase C @ α=0.6, Phase 1 noise, event-length-scaled):
- **ρ_active ≈ 0.90** (Spearman rating-vs-true-skill, over the regulars) — far above the early stub-based prediction of 0.49; the analytical EV-loss term carries much more signal in the real engine than the stub-extrapolation suggested
- **Royal Suitor skill ≈ top decile** (crownSkillPct ≈ 0.90 — consistently a near-elite player)
- **bestPlayerRatingPct ≈ 0.91** — the literal #1-skill player lands in the top 8–9% of the season rating reliably; the rating *finds* the elites
- **rhoByYear curve flat across a 30-year career arc** (~0.89–0.91 from Y1 onward, no drift, no decay) — multi-decade career stability is measured
- **trueNo1IsCrown / top5SkillIsCrown are structurally low for this config** — NOT because the rating fails, but because at a 1024-player universe with the wide skill spread (0.20–0.95) many near-elite players are tightly bunched at skill ≥ 0.93 and the rating's specific rank-1 floats within that cluster. The Crown is reliably *near*-elite but not specifically *the literal #1* often — and this is the correct, defensible read of how a real world ranking actually works
- **Top Pot stays near coin-flip** (the Yellow Jacket is fed by the Main's standings, but the heads-up single match preserves single-week chaos by design)

### 9.8 The Season Center (broadcast UI)

A finished `runCareer` opens the **Season Center** on the Spectator screen — a tabbed broadcast over the season result:

- **🏁 The Season** — the two headline honors as hero cards (with a "▶ Play the ceremony" reveal animation), the championships strip (every Major's winner), biggest riser / faller, the Pollen Trail strip, at-a-glance stats.
- **⚔ The Top Pot** — the heads-up final as a fight-card. Favorite vs underdog (named), Hive Ratings, skill %iles, the score line + head-start (if any), the Jacket awarded.
- **📅 Calendar** — every event in order, with **broadcast playback** (▶ / ⏸ / step / speed 0.5×–5×) that reveals events one at a time, with a "now-playing" card highlighting the most recent reveal.
- **📊 Hive Rating** — the rating board, with a sub-board toggle: **📊 Hive Rating** (the skill rating) / **🌼 Pollen Trail** (the form-champion points board) / **💰 Money List** (season earnings standings).
- **🎟 Eligibility** — the three Suitor criteria + the LCB fallback explainer + the "on the bubble — what I need" headline + the **Bubble Watch** board (top 5 just-missed players with their specific shortfalls).
- **🎯 Skill Check** — the ρ diagnostics + the honest "skill-dominant with chaotic Jacket" framing + the year-by-year career arc in multi-season mode.

The Spectator card also includes the **validation study** (chunked, non-freezing) with arm-comparison + a CSV export for off-line analysis.

---

## 10. The Honey-Stroke Scorecard Components (UI)

The rules above describe the *engine*. The build also ships three branded scorecard components that visualize the engine's output at the table. They are part of the user-facing product; the engine logic is unchanged.

### 10.1 The Card — per-hole match scorecard (v69.112)

Renders below every fixed-hole match (Solo / Hot-seat / Share-link). An Augusta-luxe cream-paper card with hair-thin gold rules and serif numerals. Single contiguous strip on wide screens, wraps to two stacked halves (front-9 / back-9) at narrow widths.

- **Columns:** `HOLE` (player names) · `1`…`9` · `OUT` · `10`…`18` · `IN` · `TOT` (standard golf-scorecard layout, dates to St Andrews).
- **Per-cell content (4 layers):**
  - **Stroke value** in 17px Cormorant Garamond serif (`+1`, `0`, `−2` etc.), background color-coded — **Eagle** (≤−2, rich gold gradient), **Birdie** (−1, muted gold), **Par** (0, no fill), **Bogey** (+1, muted rose), **Double** (+2, rich rose).
  - **Hand-class abbreviation** under the stroke (`1P`, `2P`, `3K`, `ST`, `FL`, `FH`, `4K`, `SF`, `RF`, `HC`; `FOLD` if the hole was folded).
  - **Honey delta** as a small monospace `+8` / `−8` annotation.
  - **Future / unresolved holes** show a single light-gray hyphen.
- **Subtotals:** OUT and IN columns use the same coloring rules over the segment's net strokes; TOT gets a heavier "engraved" gold double-rule and a 19px numeral.
- **Running totals strip** below the grid: each player's display total (`golfTotal − honey/divisor`) in a 22px serif numeral, with a `X golf · Y honey ÷N` caption underneath.
- **Legend strip:** Eagle / Birdie / Par / Bogey / Double swatches + the hand-class abbreviation key.

The Card appears both under the live table during a match and at the climax of the end-of-match summary panel.

### 10.2 The Session Card — per-hand cash session log (v69.114)

Renders below every cash table seat (YJ-Stroke / Bumblebee Stroke / pure NLHE). Reuses the `.yj-scorecard` shell but indexes by **hand played at this seat this session** (not by hole), growing as the session continues. ALL hands logged; no cap.

- **Two view modes**, toggle via a chip-pair at the top of the card:
  - **🧮 Grid** (default for ≥10 hands): multi-row wrap, **18 hands per row** (golf-scorecard cadence — one row reads like one notional round), with per-row subtotals and a cumulative totals strip at the bottom.
  - **➡ Strip** (default for <10 hands): single horizontal row, scrollable on narrow screens, all hands inline 1..N + TOT.
- **Per-cell content:**
  - **YJ-Stroke / BB-Stroke tables:** golf delta (same eagle/birdie/par/bogey/double coloring as The Card) + hand class + chip P/L delta.
  - **Pure NLHE tables:** the coloring is repurposed to chip P/L (chips won = birdie-gold, chips lost = bogey-rose, no P/L = par), since there's no golf scorecard at pure tables.
- **Cumulative totals strip:** golf scorecard + chip P/L side-by-side for HS variants; chip P/L only for pure NLHE.
- **Hover tooltips** on each cell with the full hand summary (hand #, hand class, golf delta, chip delta, pot size).

Data flow: at hand resolution, `resolveCashHand` pushes a full entry into `seat.handLog[]` for every seated player (`{hand, golf, chip, handClass, outcome, pot, isShowdown}`). Only the user's seat is rendered; opponent logs are kept for future opponent-tendency analytics.

### 10.3 Hero Strip — the cash-table hero zone (v69.118)

A dedicated bar **below the felt** containing the user's avatar / name / stack / hole cards / status tags. Replaces the pre-v69.118 "hero at felt rim" rendering (which collided with the action panel). Matches the PokerStars / GG / ACR / Chess.com paradigm.

- **Left column:** 52px gold-gradient avatar (★) + serif name + monospace stack (`1,000 ◈`). Avatar gets a white-gold double-ring when the user holds the dealer button.
- **Center column:** hero hole cards at 84×118 px — larger than at the rim. When no cards yet, a quiet "— waiting for cards —" placeholder. When folded, a red-tagged "FOLDED THIS HAND" badge.
- **Right column:** stacked status tags — `BUTTON`, `YOUR TURN` (animated gold pulse when acting), `⛳ ±N.N` (the golf scorecard pill, color-coded by sign), and `Ns` (time-bank countdown when on the clock).
- **Strip wrapper:** gold-tinted gradient, hair-thin gold border, inset highlight. When acting: outer ring + gold glow. When folded: opacity 0.55 + slight grayscale.

The seat-loop now skips `i === youSeatIdx` — opponents distribute on a 120° **top arc** (from −150° to −30°), reserving the felt's bottom 60° as the hero zone visually. No more rim/strip overlap.

### 10.4 Golden Fairway — generative background music (v69.123)

Optional ambient music. Toggle + volume slider live in the sidebar foot ("Golden Fairway" pill below the version line).

- **Powered by Tone.js** (loaded from CDN; gracefully disables if the CDN is blocked — toast once, button greys out).
- **Three concurrent voices:**
  - **Pad** — sine PolySynth, slow A/D/R, soft chord bed at −18 dB.
  - **Lead** — sawtooth PolySynth, sharp attack, melodic phrases (3–5 chord-tone notes per bar) with occasional 5th-above color tones.
  - **Pulse** — MembraneSynth at −22 dB, quarter-note athletic drive on root note (dedicated voice; doesn't compete with the lead).
- **Real chord progression**: Emaj7 → C#m7 → Amaj7 → B7 (I–vi–IV–V with 7ths), one chord per bar at 82 BPM.
- **Reverb bus** (decay 2.8s, wet 0.22) — the "expensive room" sound.
- **Persistence:** toggle state + volume saved to `TourState.preferences.{musicEnabled, musicVolume}`.

Not auto-started on page load (browser autoplay policy requires a user gesture); the toggle activates the AudioContext on click.

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
- **Tour de Bourdon** ("the Nectour"): the canonical SEASON layer — a fixed calendar of 52 Regulars + 12 Majors + the Main Event, with a single rolling Hive Rating (Kalman/Glicko on latent skill, blending outcome + decision-quality EV-loss credit at α=0.6) and three year-end honors — 🧥 the Yellow Jacket (chaotic week, the Top Pot heads-up champion) + 👑 the Royal Suitor (class confirmed, the season-rating crown, multi-criteria eligibility) + 🌼 the Pollen Trail (form champion, the decaying-points race). Measured: ρ ≈ 0.90 over the regulars, Suitor consistently top-decile-skill (crownSkillPct ≈ 0.90), 30-year career rating-stability flat (no drift), Top Pot near coin-flip.

That's the entire game in four sentences.
