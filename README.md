<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", and the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) are trademarks of
  Blank Canvas, Inc.
-->

# Yellow Jacket Tour

Single-file HTML build of the Yellow Jacket Tour — a hybrid of heads-up Texas Hold'em and tournament golf, scored on a single law called **Honey-Stroke** (also marketed as **Sweet Stroke**). Plays in any modern browser. No install, no server, no accounts. The whole product is one `index.html`.

> **You're always on the Tour.** Every hand, every table, every stroke counts. Whether you're in a Major final, a Sudden Death playoff, or a $5/$10 cash table at 2am — the Tour is the world. Your strokes follow you. Your reputation follows you. Cash games aren't a separate product; they're the Tour at the cash table.

## What it is

A poker-and-golf hybrid where every hand of Hold'em becomes a single hole on a golf scorecard. Two layers run in parallel:

- **The scorecard** — your hand category at showdown sets a bounded golf score for the hole (Royal Flush −5 down to weak High Card +2). A frame-aware showdown matrix adds respected-loss and cooler bonuses on top of the base mapping.
- **The honey pot** — every hole opens with a mandatory pot. Bets and raises propose a new agreed-total pot size; calls accept it. The hole winner takes the agreed total as honey credit. Tied holes roll the pot forward.

At the end of each round, that round's net honey is divided by the **honey cap** and subtracted from the round's scorecard. The honey cap has two selectable modes: `calibrated` (the ship default — a stepped table: 1 / 4 / 9 / 36 for 1- / 9- / 18- / 72-hole rounds) or `spec` (the v23 design-intent mode — the divisor is just the round's hole count N, so an 18-hole round divides by 18). Lower wins, just like real golf.

Two scoring **variants** ship alongside each other:

- **Yellow Jacket** (competitive): a decisive-showdown loser posts a +1 bogey — unless their hand was a straight or better (a "respected loss": their own −5..−1 hand-class score), or unless they reached showdown with only a high card (a "brick") **and bet into the pot**, in which case it's a +2 double bogey. That last wrinkle is the **pot-gated brick rule** (default; `cfg.scoring.brickPenaltyMode = 'pot-gated'`, cap +2): a brick that checked through to the opener still costs just +1, but a brick you committed honey to costs +2 — mirroring how folding a bigger pot costs more. It's the lever that makes pre-flop hand selection and bluffing matter (folding a brick to a bet becomes strictly correct; a big bet threatens bricks with a double bogey). Configurable: `flat +1` (classic — no fold/bluff equity), `flat +2`, `pot-gated cap +2` (default), `pot-gated cap +4` (aggressive). Sharper skill expression; champion scores a few under par.
- **Bumblebee** (casual): decisive-showdown losers score their own hand class, always (a brick loser posts their own +2 regardless of pot size). Gentler; champion scores deep under par, golf-major style.
- **Main-final override** (config `mainFinalsLoserBogey` / Simulator "Main final" control): the Main Event's 72-hole *final* can run a different loss rule than the rest of the Tour — *inherit* (default), *Yellow Jacket on the final* (keep it a tough, over-par gauntlet even if the Tour is Bumblebee), or *Bumblebee on the final* (deep sub-par champion, golf-major style, while the bracket-cut rounds stay competitive). Affects only the 72-hole final.

Same engine, same wagering primitives, same caps. Only the loser score differs.

## What's inside

The sidebar has 19 tabs covering four product areas:

### Play
- **Single Player** — heads-up vs a Yellow Jacket AI. Pick a skill tier (Beginner / Casual / Pro / Elite), match length (9 / 18 / 36 / 72 holes), and the per-hole cap — the hole envelope **E** (E × honey-cap(round length); E = 3 ≈ 27 honey/hole on an 18-hole match, the same default the simulator ships) or a legacy fixed cap (Regular 6 / Major 9 / Main-finals 18). The match uses the full canonical engine: the mandatory opener doubled on the back 9, agreed-total wagering under the hole-envelope + pot-elastic-K cap, the round-end honey cap, and the Simulator's scoring variant.
- **Multiplayer · Hot-Seat** — two humans, one device. Pass-the-laptop with a cover overlay so each player only sees their own cards. A "Match settings" panel picks holes, per-hole cap, and variant (Yellow Jacket / Bumblebee) for the match.
- **Multiplayer · Share-Link** — chess-by-mail. Make your move, copy the encoded URL, send it. Each state carries a checksum so tampering is detectable; the URL also carries the match's hole count, cap, and variant so the opponent loads it configured.
- **Yellow Jacket Cash** — the Tour at the cash table. 6-max drop-in cash tables. Cash chips are Nectar 1:1 — no honey at cash. Two sub-variants:
  - **Pure NLHE** — standard cash poker inside the Tour ecosystem, Nectar P/L only (variant-agnostic, so it's listed in both cash lobbies)
  - **YJ Stroke** — keeps a second, *separate* ledger alongside the chips: a **golf scorecard** scored per showdown — you wager Nectar, but your hand quality is graded on its own. True golf convention (lower is better): the pot winner posts their own hand class (Royal/Straight Flush −5 … Full House −2 … Two Pair 0 … High Card +2); every other showdown player posts the **Yellow Jacket loser score** — the same rule as on Tour: a *respected loss* (their own −5..−1) if they had a straight or better, a **+1 bogey** on trips / two pair / pair, and on a *brick* (high card only) the **pot-gated penalty** — +1 if the pot was just the posted blinds, +2 double bogey once it grew past that (any raised pot). The posted blinds are the cash analog of the tour's mandatory honey opener. Multi-way tables apply the same rule pairwise. The scorecard is a pure skill record — **it does not convert to Nectar** — and it counts toward your Tour reputation.
  - Multi-table support (up to 6 tables open simultaneously), keyboard shortcuts, time bank, pre-actions, opponent HUD, four-color deck, run-it-twice, all-in confirm
- **Bumblebee Cash** — the Tour at the cash table, gentler side. Same engine in pastel-kawaii skin; offers Pure NLHE plus **Bumblebee Stroke** — the same separate golf scorecard, except a showdown loss posts your **own hand class** instead of a fixed bogey (Honored Loss — a flush that loses the pot still posts −1 birdie). Auto-toggles a particle/foley aesthetic when seated. The scorecard counts toward your Tour reputation here too (and likewise doesn't convert to Nectar).

### Simulate
- **Simulator** — run 1 to 100 seasons over a pool of up to 100,000 players. Two modes:
  - *Simple* — pick seasons, click run. Appends to your tour career.
  - *Advanced* — every slider exposed: profile distribution, event structure, hole envelope E and pot-elastic K (the live wagering-cap controls), the **brick-loss** control (Yellow Jacket only — how a showdown lost holding only a high card scores: `flat +1` (classic — same as a fold, so pre-flop folding & bluffing barely matter), `flat +2` (anchored double bogey), `pot-gated cap +2` ★ **default** (+1 at the opener, +2 if you bet into the pot — EV-balanced, restores fold/bluff equity proportional to pot size, ~5× event-level skill expression, ~2½ strokes shallower champions, career skill metrics intact), or `pot-gated cap +4` (aggressive — bigger fold gain but skill metrics degrade); the AI's EV math + the skill metrics are aware of whichever mode is active), honey-cap mode (`calibrated` / `spec`), legacy per-tier stroke caps (used only when E = 0), sponsor purses (tour events take no rake — the full entry-fee pool, plus any sponsor purse, is the prize pool), satellite ladder, late registration window, multi-way table size (HU / 4 / 6 / 9 — sizes above HU route aggregate events through the multi-way matched-contribution runner; see Tournament formats), CI repeats with mean ± SD aggregation.
- Background mode runs while you browse other tabs. Smart-refresh banner detects build-version changes and offers a one-click reload preserving progress.

### Career
- **Dashboard** — latest champion, headline stats, Buzz's tip of the day
- **Events** — every tournament filtered/sorted/drilled; finals scorecard with animated reveal
- **Players** — virtualized grid of the entire pool, click any card for a full profile (radar, career timeline, H2H, badges, cuts performance)
- **Bankroll** — Nectar wallet with append-only ledger, daily-login streak, weekly quests, P2P transfers, prefs (foley, 3D layer, four-color deck, pot-odds, all-in confirm, run-it-twice, hand-strength meter, responsible-gaming alerts)
- **Staking** — peer-to-peer staking marketplace with markup, auto-settling contracts on event resolution
- **Economy** — macro snapshot: total Nectar circulating, Gini coefficient, velocity, BB jackpot pool, Golden Card lottery, 1-year stress test
- **Hand History** — every hand cross-format with replay modal
- **Hall of Fame** — all-time records, top-25 leaderboard, legendary moments (historic rounds, sudden-death classics, Grand Slams, back-to-back majors)
- **Analytics** — skill→wins curve, bracket conversion by tier, champion score distribution, H2H matrix, profit distribution, real-sport benchmarks (Masters / WSOP)
- **Compare** — head-to-head between any two players, including a Monte Carlo of 1,000 simulated matches if they met today

### Reference
- **Rulebook** — live config snapshot + complete rule cards with worked examples
- **Decision Tree** — stage-by-stage walkthrough of one hole with CSS-rendered cards, beat by beat (Tea Box → The Fairway → The Lay-Up → The Hazard → The Approach → The Green → The Putt → The Cup)
- **Codex** — long-form master manual: scoring law, tournament formats, strategy, economics, lore
- **Buzz's Corner** — searchable FAQ + strategy playbook + legendary moments

## Tournament formats

Two formats ship, switchable per simulation:

- **Aggregate stroke play** (default, PGA Masters feel) — every player plays 4 rounds × 18 holes against rotating partners. Lowest 72-hole net total wins. Survival cushion + round-boundary cuts (50% at R2, 50% at R3) eliminate mid-tournament. Top ~15% of finish positions cash with geometric payout decay (default 0.74).
- **Bracket knockout** (WSOP feel) — single-elimination. 9-hole rounds while field > 16, then 18-hole rounds, then a 72-hole heads-up final.

A season is a fixed slate of **4 majors + 40 regular tour events + 1 Main Event = 45 events** — the real PGA Tour's count and its 4-major cadence, with the lone Main standing in for the WSOP Main Event ⊕ FedEx Cup finale. The Main carries the biggest, hardest field on the calendar.

Heads-up (`tableSize: 2`) is the canonical engine and the default. Aggregate stroke play also runs **multi-way** (table size 4 / 6 / 9): rounds R1–R3 play at tables of N with matched-contribution wagering (real-poker pot construction), then R4 collapses to a heads-up final between the top-2 survivors; caps scale down with N, the opener doubles to 2 honey at N > 6, and the cut cushion tightens. The bracket-knockout format is heads-up only. Spectator Mode's "Live Tournament" runs a separate **golf-cut heads-up bracket** (50% of the field cut each round, the round before the championship labelled "Semi-Final" and the championship "Final Table"; field caps Regular 8 / Major 16 / Main 32).

## Currencies

Two distinct denominations with strictly separated roles:

- **Nectar** (◈) — the bankroll currency. Buys tour event entries, pays cash-table chips 1:1, lands prize payouts. Persistent across sessions. Lives in the unified ledger.
- **Honey** — the in-event wager unit. Lives ONLY inside tour events. Per-hole pot abstraction that converts to scorecard strokes via the honey cap, reconciled at each round end. Per-hole wagering is bounded by the hole envelope E (default 3 — each player may wager up to E strokes' worth of Honey per hole, i.e. `round(E × honeyCap)` honey) and per-beat by pot-elastic K (default 5 — each betting beat's cap is K times the Honey already agreed into the pot, hard-ceilinged at 3× the hole envelope). Never directly converts to Nectar.

Cash tables do NOT use honey. Chip stacks at cash are Nectar 1:1. The "YJ Stroke" and "Bumblebee Stroke" cash variants borrow only the *scorecard* half of the tour scoring law — they keep a **separate golf scorecard** scored per showdown from hand class (true golf convention, lower = better; the pot winner posts their own hand. Under YJ the showdown loser posts the Yellow Jacket loser score — a respected loss (own −5..−1) on a straight or better, +1 bogey on trips/two pair/pair, and a pot-gated +1/+2 on a high-card brick (the posted blinds standing in for the tour's mandatory opener); under Bumblebee the loser posts their own hand. Multi-way tables apply the same rule pairwise). The scorecard is a pure skill record — you wager Nectar, but your hand quality is graded on its own card — and it does **not** convert to Nectar: cashout pays your chip stack only. The scorecard feeds your Tour reputation / leaderboards.

## State of the build

- Self-contained: one HTML file. Two optional CDN dependencies — Three.js (loaded synchronously for the 3D atmospheric felt) and Rapier WASM (loaded on demand for physics-based chip stacking). Both gracefully degrade if blocked; the 2D felt and tween chips take over.
- Save state is browser-local via the unified `yellowJacketSave` key; a smart-refresh banner handles version drift across deploys.
- CSV export with full config snapshot ships with every simulator run for reproducible audits.
- Calibrated against an in-build audit suite: skill expression, tier ROI separation, and late-registration handling all verified for the heads-up engine; the multi-way runner (table sizes 4 / 6 / 9, aggregate format) is live with its own per-table-size calibration (caps, fold-discipline slack, opener scaling).

## How to use

### Play locally
Double-click `index.html`. Opens in your default browser and runs from the local filesystem. All state is browser-local. No server required.

### Publish on GitHub Pages
1. Upload `index.html` to a GitHub repo.
2. Settings → Pages → Build and deployment → Source: **Deploy from a branch**, Branch: **main**, folder: **/ (root)**.
3. Wait ~60 seconds. The Pages URL appears at the top of the Settings page.

Each visitor gets their own independent save state in their own browser. Career runs don't sync between devices.

### Updating a deployed copy
Replace `index.html` in the repo. Pages redeploys within ~60 seconds. The smart-refresh banner detects the new build version on next page load and offers a one-click reload that preserves career progress.

## Accessibility & responsive

- 48px minimum touch targets on mobile breakpoints
- Universal `:focus-visible` rings (gold in Augusta mode, pink in kawaii mode)
- `prefers-reduced-motion` disables all decorative animations (cards still deal, just without the squeeze/flip)
- All keyboard shortcuts published in `?` help and the command palette (`Ctrl+K`)

## Companion docs

- [`RULES.md`](./RULES.md) — every game mode's rules in plain language with ASCII diagrams. Read this if you want to know exactly what each mode does.
- [`LICENSE.md`](./LICENSE.md) — the full proprietary license. Read this before doing anything beyond looking.
- [`IP/`](./IP/) — the IP-protection scaffold: master inventory, brand lexicon, copyright/trademark filing briefs, NDA template, and ongoing-protection checklist.
- The build's in-app **Rulebook**, **Codex**, **Decision Tree**, and **Buzz's Corner** tabs duplicate and extend this content live, with the current config snapshot.

## License & credits

**Source-available, not open-source.** Yellow Jacket Tour is the proprietary intellectual property of Blank Canvas, Inc. (a Wyoming corporation). The source code, design documents, eight-beat hand structure (Tea Box → The Fairway → The Lay-Up → The Hazard → The Approach → The Green → The Putt → The Cup), Honey-Stroke / Sweet Stroke scoring law, dual-variant (Yellow Jacket / Bumblebee) loss-rule system, Buzz mascot, and all related brand assets are all rights reserved. You may read this repository for personal study, security review, or evaluation. You may not copy it, redistribute it, deploy it, derive from it, or use the brand or rule system commercially without an executed license from Blank Canvas, Inc. Full terms in [`LICENSE.md`](./LICENSE.md).

The bumblebee mascot, the lore, the Honey-Stroke scoring law, and the audit-driven calibration are original to this build. Three.js (MIT) is used for the optional 3D atmospheric scene; Rapier (Apache 2.0) for the optional physics chip stacking. Both are loaded from CDN at runtime; neither is redistributed.

For commercial license inquiries, contact Blank Canvas, Inc. via the corresponding entity address on file with the Wyoming Secretary of State.
