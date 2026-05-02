# Yellow Jacket Tour — Complete Rules Manual

This document covers **every game mode** in the build, in plain language with ASCII diagrams. Read top-to-bottom for the full picture, or jump to the mode you care about.

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
   ┌─────────────────────────────────────────────────────┐
   │                                                       │
   │   Each player gets:  [▒▒]  [▒▒]   ← 2 hole cards     │
   │                                                       │
   │   The board grows:                                   │
   │     Tea Box (preflop)   no community cards yet       │
   │     Drive (flop)        [♣][♦][♥]                    │
   │     Hazard (turn)       [♣][♦][♥][♠]                 │
   │     Putt  (river)       [♣][♦][♥][♠][♣]              │
   │                                                       │
   │   At showdown each player makes the BEST 5-card      │
   │   hand from their 2 hole + 5 board cards.            │
   │                                                       │
   └─────────────────────────────────────────────────────┘
```

The five **streets** (poker terms in parentheses):

| YJ name | Poker term | What happens |
|---------|-----------|--------------|
| Tea Box | Preflop | Hole cards dealt, mandatory pot posted, betting |
| Drive | Flop | 3 community cards dealt, betting |
| Hazard | Turn | 4th community card, betting |
| Putt | River | 5th community card, final betting |
| The Cup | Showdown | Hands revealed, winner takes pot |

That's standard poker. **Every mode in the build uses these exact five streets.** The only differences are: (1) what you wager with, (2) what scoring layer (if any) sits on top, (3) whether play is continuous or organized into rounds/events.

---

## 2. The Two Currencies

The build has **two distinct denominations** that must not be confused:

```
   ┌──────────────────────────┬──────────────────────────┐
   │         NECTAR (★)        │          HONEY            │
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

### 3.2 The three event tiers

| Tier | Default buy-in | Field | Frequency |
|------|----------------|-------|-----------|
| **Regular** | $100 Nectar | 512 players | 25–52 per season |
| **Major** | $1,000 Nectar | 256 players | 4 per season |
| **Main Event** | $10,000 Nectar | 128 players | 1 per season |

Every season also has a **satellite ladder**: top 28 finishers of each Major earn a free Main Event seat (no $10K Nectar buy-in required).

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

At round end, total honey is divided by the **round divisor** ONCE and subtracted from the scorecard:

```
   FINAL ROUND SCORE = total scorecard − (net honey ÷ divisor)

   Round length    Divisor
   ───────────     ───────
   1 hole              1
   9 holes             4
   18 holes            9
   72 holes           36
```

**Lower wins.**

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

### 3.6 Stroke caps with progressive street unlock

Wagering is capped per event tier. The cap unlocks gradually across the four streets:

```
   PROGRESSIVE STREET UNLOCK
   ─────────────────────────────────────
   Tea Box (preflop)   25% of cap
   Drive (flop)        50% of cap
   Hazard (turn)       75% of cap
   Putt (river)       100% of cap

   Per-tier caps (default):
     Regular event:        cap =  6 honey
     Major event:          cap =  9 honey
     Main early rounds:    cap =  8 honey
     Main 72-hole final:   cap = 18 honey
```

So in a Major (cap 9): you can bet up to 3 honey on Tea Box, up to 5 on Drive, up to 7 on Hazard, up to 9 on Putt.

### 3.7 Folds

Fold rule is **uniform on every street**:

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

### 3.9 Variants — the only difference

The build ships **two scoring variants** that share every rule above except one:

```
   ┌──── YELLOW JACKET (competitive) ──────┐
   │  Decisive-showdown loser:              │
   │    +1 bogey, FIXED                     │
   │    (regardless of hand)                │
   │                                        │
   │  Mirrors the fold rule.                │
   │  Sharper skill expression.             │
   │  Champion scores climb above par.      │
   └────────────────────────────────────────┘

   ┌──── BUMBLEBEE (casual) ───────────────┐
   │  Decisive-showdown loser:              │
   │    Their own hand-class score (-5..+2) │
   │                                        │
   │  Flush-loser still posts -1 birdie.    │
   │  "Your hand always counts."            │
   │  Champion scores closer to par.        │
   └────────────────────────────────────────┘
```

**Folds and ties are the same in both variants.** Only the decisive-showdown loser score changes.

### 3.10 Multi-way option (6 / 9 player tables)

The simulator supports tables of 6 or 9 (HU is the default). Multi-way uses **matched-contribution wagering** (like real poker — each player contributes to a shared pot, no agreed-total). R1–R3 are played multi-way; R4 collapses to a heads-up final between the top-2 survivors.

Multi-way variant defaults to Bumblebee (Honored Loss) since YJ Bogey Loss × 8 losers per pot pulls champion scores too far above par at 9-handed.

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

After-rake prize pool is split this way. Rake is tier-based:
- Regular: 1.5% (multi-way scaled to 0.83% effective)
- Major: 2.0% (multi-way 1.10%)
- Main: 3.0% (no multi-way scaling)

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

Same NLHE engine as Pure, **plus a parallel stroke ledger** that settles separately at cashout.

### 5.1 Where to play

- **Yellow Jacket Cash** menu → **YJ Stroke** sub-variant (Bogey Loss)
- **Bumblebee Cash** menu → **Bumblebee Stroke** sub-variant (Honored Loss)

### 5.2 The chip side: identical to Pure NLHE

Bet/call/raise/fold mechanics are unchanged. Stack is Nectar. All-in is your full stack on any street. Matched-contribution pots. Standard rake per pot.

### 5.3 The stroke side: a parallel ledger

In addition to the chip P/L, every showdown adds an integer to your **stroke ledger**:

```
   ┌──── STROKE LEDGER (cash variants) ──────┐
   │                                          │
   │  At each SHOWDOWN:                       │
   │                                          │
   │    Winner: ledger += -(own hand score)   │
   │            (positive = good for you)     │
   │                                          │
   │    Loser:                                │
   │      YJ Stroke (Bogey Loss):             │
   │        ledger += -(+1) = -1              │
   │      Bumblebee Stroke (Honored Loss):    │
   │        ledger += -(own hand score)       │
   │                                          │
   │  Folds do NOT touch the ledger.          │
   │  Only showdowns produce strokes.         │
   │                                          │
   └──────────────────────────────────────────┘
```

The sign convention: **positive ledger = under par across the session** (good for you).

Example: you win a hand at showdown with a flush (golf score −1). Your ledger goes +1. You win another with two pair (golf score 0). Ledger stays at +1. You lose a showdown with a high card. Under YJ Stroke, ledger goes to 0. Under Bumblebee Stroke, ledger goes to −1 (your high card was +2 golf score).

### 5.4 Settlement at cashout

When you stand up:

```
   CASHOUT SETTLEMENT (YJ Stroke / Bumblebee Stroke)
   ────────────────────────────────────────────────────
   final Nectar payout = chip stack
                       + (stroke ledger × $0.50)

   Worked example:
     You buy in for $400.
     After 100 hands you have $445 chips and
     ledger of +18 (you played good hands well).

     Cashout = $445 + (18 × $0.50)
             = $445 + $9
             = $454 Nectar

   The +$0.50/stroke premium is paid by the house
   from rake. Negative ledger pays a small Nectar
   penalty beyond chip P/L.
```

### 5.5 Why honey is NOT involved

Despite the brand name "Stroke," these cash variants borrow only the **scorecard** half of the tour Honey-Stroke law. The honey-pot half (agreed-total wagering, mandatory pots, divisor conversion) does NOT apply at cash. Cash is pure NLHE on the wagering side; the strokes are a parallel scoring layer that runs alongside.

---

## 6. What's Shared vs What's Different

```
   ┌──────────────────────────────────────────────────────────────┐
   │                    SHARED BY ALL MODES                        │
   ├──────────────────────────────────────────────────────────────┤
   │  • Standard Texas Hold'em (2 hole + 5 board cards)            │
   │  • Five streets: Tea Box, Drive, Hazard, Putt, The Cup        │
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
   Cap per hand   │ Tier-based   │ Stack    │ Stack        │
   Street unlock  │ 25/50/75/100 │ None     │ None         │
   Scorecard      │ Yes          │ No       │ Yes (cash)   │
   Honey ledger   │ Yes          │ No       │ No           │
   Stroke ledger  │ No (per-hand │ No       │ Yes          │
                  │  rolled into │          │              │
                  │  round)      │          │              │
   Tied pots      │ Roll forward │ Split    │ Split        │
   Length         │ Event/round  │ Continu. │ Continuous   │
   Payout         │ Finish-pos   │ Per-hand │ Per-hand +   │
                  │ ITM curve    │ winner   │ cashout adj  │
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

A frame-aware **showdown matrix** can layer two adjustments on top in tour events:

- **Respected loss** (Yellow Jacket variant): a loser whose hand is a straight or better posts their own hand-class score instead of the flat +1 bogey
- **Cooler bonus**: when both players have full house or better in a tight gap, the winner gets an extra −1 stroke

These adjustments only fire in tour events, never at cash.

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

### 8.3 Multi-way table format (optional)

```
   ┌──── MULTI-WAY AGGREGATE (6 or 9 per table) ────┐
   │                                                  │
   │  R1: tables of N players, matched-contribution  │
   │  R2: tables of N players                         │
   │  R3: tables of N players                         │
   │  R4: collapses to heads-up final                 │
   │      (top-2 survivors, 18 holes)                 │
   │                                                  │
   └──────────────────────────────────────────────────┘
```

### 8.4 Sudden-death playoffs

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
   ║  Want cash poker WITH a stroke layer that pays            ║
   ║  +$0.50/stroke at cashout?                                ║
   ║    → Yellow Jacket Cash → YJ Stroke (Bogey Loss)          ║
   ║    → Bumblebee Cash → Bumblebee Stroke (Honored Loss)     ║
   ║      NLHE wagering + parallel stroke ledger.              ║
   ║                                                            ║
   ╚══════════════════════════════════════════════════════════╝
```

---

## One-Line Summaries

- **Tour Honey-Stroke**: 5-street Hold'em hole + bounded golf score per hole + honey pot that converts to strokes via round divisor. Two variants differ only on decisive-showdown loser score.
- **Pure NLHE Cash**: Standard online poker, no strokes, no honey, just chip P/L.
- **YJ Stroke / Bumblebee Stroke Cash**: Pure NLHE wagering + parallel stroke ledger from hand class at showdown, settling at cashout for ±$0.50 per net stroke.

That's the entire game in three sentences.
