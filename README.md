# Yellow Jacket Tour

Single-file HTML build of the Yellow Jacket Tour — a hybrid of heads-up Texas Hold'em and tournament golf, scored on a single law called **Honey-Stroke**. Plays in any modern browser. No install, no server, no accounts. The whole product is one `index.html`.

## What it is

A poker-and-golf hybrid where every hand of Hold'em becomes a single hole on a golf scorecard. Two layers run in parallel:

- **The scorecard** — your hand category at showdown sets a bounded golf score for the hole (Royal Flush −5 down to weak High Card +2). A frame-aware showdown matrix adds respected-loss and cooler bonuses on top of the base mapping.
- **The honey pot** — every hole opens with a mandatory pot. Bets and raises propose a new agreed-total pot size; calls accept it. The hole winner takes the agreed total as honey credit. Tied holes roll the pot forward.

At round end, total net honey is divided once by the round-length divisor (1 / 4 / 9 / 36 for 1- / 9- / 18- / 72-hole rounds) and subtracted from the total scorecard. Lower wins, just like real golf.

Two scoring **variants** ship alongside each other:

- **Yellow Jacket** (competitive): decisive-showdown losers post a fixed +1 bogey. Sharper skill expression; harsher.
- **Bumblebee** (casual): decisive-showdown losers score their own hand class. Gentler; closer to par.

Same engine, same wagering primitives, same caps. Only the loser score differs.

## What's inside

The sidebar has 19 tabs covering four product areas:

### Play
- **Single Player** — heads-up vs a Yellow Jacket AI. Pick a skill tier (Beginner / Casual / Pro / Elite), match length, and stroke cap.
- **Multiplayer · Hot-Seat** — two humans, one device. Pass-the-laptop with a cover overlay so each player only sees their own cards.
- **Multiplayer · Share-Link** — chess-by-mail. Make your move, copy the encoded URL, send it. Each state carries a checksum so tampering is detectable.
- **Yellow Jacket Cash** — 6-max drop-in cash tables with three sub-variants:
  - **Pure NLHE** — standard cash poker, Nectar P/L only
  - **YJ Stroke** — adds an integer stroke ledger per hand (Bogey Loss), settles to Nectar at cashout at +$0.50 per net stroke
  - Multi-table support (up to 6 tables open simultaneously), keyboard shortcuts, time bank, pre-actions, opponent HUD, four-color deck, run-it-twice, all-in confirm
- **Bumblebee Cash** — same engine in pastel-kawaii skin, Honored Loss scoring (loser scores own hand class). Auto-toggles a particle/foley aesthetic when seated.

### Simulate
- **Simulator** — run 1 to 100 seasons over a pool of up to 100,000 players. Two modes:
  - *Simple* — pick seasons, click run. Appends to your tour career.
  - *Advanced* — every slider exposed: profile distribution, event structure, stroke caps, rake tiers, sponsor purses, satellite ladder, late registration window, multi-way table size (HU / 4 / 6 / 9), CI repeats with mean ± SD aggregation.
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
- **Decision Tree** — stage-by-stage walkthrough of one hole with CSS-rendered cards (Tea Box → Drive → Hazard → Putt → The Cup)
- **Codex** — long-form master manual: scoring law, tournament formats, strategy, economics, lore
- **Buzz's Corner** — searchable FAQ + strategy playbook + legendary moments

## Tournament formats

Two formats ship, switchable per simulation:

- **Aggregate stroke play** (default, PGA Masters feel) — every player plays 4 rounds × 18 holes against rotating partners. Lowest 72-hole net total wins. Survival cushion + round-boundary cuts (50% at R2, 50% at R3) eliminate mid-tournament. Top ~15% of finish positions cash with geometric payout decay (default 0.74).
- **Bracket knockout** (WSOP feel) — single-elimination. 9-hole rounds while field > 16, then 18-hole rounds, then a 72-hole heads-up final.

Multi-way tables (6 / 9 / max) route aggregate rounds through matched-contribution wagering; R4 collapses to a heads-up final between top-2 survivors.

## Currencies

Two distinct denominations with strictly separated roles:

- **Nectar** (★) — the bankroll currency. Buys tour event entries, pays cash-table chips 1:1, lands prize payouts. Persistent across sessions. Lives in the unified ledger.
- **Honey** — the in-event wager unit. Lives ONLY inside tour events. Per-hole pot abstraction that converts to scorecard strokes via the round divisor exactly once at round end. Never directly converts to Nectar.

Cash tables do NOT use honey. Chip stacks at cash are Nectar 1:1. The "YJ Stroke" and "Bumblebee Stroke" cash variants borrow only the stroke half of the tour scoring law — they accumulate an integer stroke ledger from hand class that settles to Nectar at cashout at +$0.50 per net stroke.

## State of the build

- **v69.25** — current head (`2026.04.29-v69.25-cash-variant-rename`)
- Self-contained: one HTML file. Two optional CDN dependencies — Three.js (loaded synchronously for the 3D atmospheric felt) and Rapier WASM (loaded on demand for physics-based chip stacking). Both gracefully degrade if blocked; the 2D felt and tween chips take over.
- Save state is browser-local via the unified `yellowJacketSave` key; smart-refresh banner handles version drift across deploys
- CSV export with full config snapshot ships with every simulator run for reproducible audits
- Calibrated against the audit suite: skill expression confirmed (Spearman ≈ 0.49 in v69.24+), tier ROI separation positive, late-reg domination resolved, multi-way variant inversion fixed

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
- The build's in-app **Rulebook**, **Codex**, **Decision Tree**, and **Buzz's Corner** tabs duplicate and extend this content live, with the current config snapshot.

## License & credits

The bumblebee mascot, the lore, the Honey-Stroke scoring law, and the audit-driven calibration are original to this build. Three.js (MIT) is used for the optional 3D atmospheric scene; Rapier (Apache 2.0) for the optional physics chip stacking. Both are loaded from CDN.
