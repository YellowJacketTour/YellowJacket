<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup), and the
  Tour de Bourdon season-system marks ("Tour de Bourdon", "Tour of the
  Bumblebee", "the Nectour", "the Royal Suitor", "the Pollen Trail",
  "the Top Pot", "the Hive Rating") are trademarks of Blank Canvas, Inc.
-->

# Yellow Jacket Tour

Single-file HTML build of the Yellow Jacket Tour — a hybrid of heads-up Texas Hold'em and tournament golf, scored on a single law called **Honey-Stroke** (also marketed as **Sweet Stroke**). Plays in any modern browser. No install, no server, no accounts. The whole product is one `index.html`.

> **You're always on the Tour.** Every hand, every table, every stroke counts. Whether you're in a Major final, a Sudden Death playoff, or a $5/$10 cash table at 2am — the Tour is the world. Your strokes follow you. Your reputation follows you. Cash games aren't a separate product; they're the Tour at the cash table.

## What it is

A poker-and-golf hybrid where every hand of Hold'em becomes a single hole on a golf scorecard. Two layers run in parallel:

- **The scorecard** — your hand category at showdown sets a bounded golf score for the hole (Royal Flush −5 down to weak High Card +2). When you *win* the pot you post that number; when you *lose* it, the Yellow Jacket **loser ladder** decides (golf's own scoring shape — better than a bogey → a bogey → a worse-than-a-bogey blow-up): **Next Best** (a straight or better keeps its own −5…−1 — "coolered"), **Take a Stroke** (a pair / two pair / trips → +1 bogey), **Lay a Brick** (a high card checked through to the opener → +1) and **Stack Bricks** (a high card bet into a pot ≥ 2× the opener → +2, the blow-up). A fold sits off the ladder — *"put me down for 1"* — always +1, never +2, cards unrevealed. (The rare **cooler bonus** gives the *winner* of a full-house-over-full-house-or-bigger an extra −1.) The full per-hand-class outcome table — every score a hand can post (win, lose-Yellow-Jacket, lose-Bumblebee) plus folds, ties, and the honey layer — is `RULES.md` §7 (mirrored in the in-app Rules tab).
- **The honey pot** — every hole opens with a mandatory pot. Bets and raises propose a new agreed-total pot size; calls accept it. The hole winner takes the agreed total as honey credit. Tied holes roll the pot forward.

At the end of each round, that round's net honey is divided by the **honey cap** and subtracted from the round's scorecard. The honey cap has two selectable modes: `calibrated` (the ship default — a stepped table: 1 / 4 / 9 / 36 for 1- / 9- / 18- / 72-hole rounds) or `spec` (the v23 design-intent mode — the divisor is just the round's hole count N, so an 18-hole round divides by 18). Lower wins, just like real golf.

Two scoring **variants** ship alongside each other:

- **Yellow Jacket** (competitive): a decisive-showdown loser climbs a single **monotone ladder** — golf's own scoring shape (better than a bogey → a bogey → a worse-than-a-bogey blow-up), four named rungs:
  - **Next Best** *(a.k.a. respected loss / "coolered" / "a losing birdie")* — a **straight or better** keeps its own −5..−1 hand-class score. A birdie's a birdie, even on a hole you lost — you ran into a hand. (This is the loser side of the **cooler bonus**: the winner of a full-house-over-full-house-or-bigger gets an extra −1, the loser keeps their −5…−1.)
  - **Take a Stroke** *(a.k.a. "a two-putt bogey" / "take your medicine")* — a **pair / two pair / trips** posts the **+1 bogey**. The routine, no-drama loss.
  - **Lay a Brick** *(a.k.a. "checked it down with air")* — only a **high card** (a "brick") and the pot never reached double the opener (you checked it through) → **+1 bogey**. Air, but the cheap way.
  - **Stack Bricks** *(a.k.a. "the 3-putt" / "spewed into it")* — only a **high card**, and you committed honey until the agreed total reached at least double the opener → **+2 — the blow-up** (and you lose the larger honey too).
  
  Rungs 3–4 are the **pot-gated brick rule**: `1 + ⌊(T − opener)/opener⌋` clamped to `[1, cap]`; default `cfg.scoring.brickPenaltyMode = 'pot-gated'`, `brickLossCap = 2` (under cap +4 a big-pot brick keeps climbing to +3 / +4). A **fold** sits off the ladder — *"put me down for 1"*: the folder always posts **+1, never +2** (the only part that scales is the honey forfeit, sized to the *pre-bet* pot), cards unrevealed. So a brick you bet into and show down costs more than folding it (more on the card AND more honey) — that asymmetry is what makes pre-flop hand selection and bluffing matter. Read top to bottom: *Next Best (−5…−1) < {Take a Stroke, Lay a Brick} (+1) < Stack Bricks (+2)* — the worse your hand AND the more you committed, the more it costs, but a real made hand is forgiven. Brick-loss is configurable: `flat +1` (classic — Lay a Brick = Stack Bricks = +1; no fold/bluff equity), `flat +2`, `pot-gated cap +2` (default), `pot-gated cap +4` (aggressive). Sharper skill expression; champion scores a few under par. (Full per-hand outcome table: `RULES.md` §7.)
- **Bumblebee** (casual): no ladder — decisive-showdown losers score their own hand class, always (a brick loser posts their own +2 regardless of pot size). Gentler; champion scores deep under par, golf-major style.
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
  - **YJ Stroke** — keeps a second, *separate* ledger alongside the chips: a **golf scorecard** scored per showdown — you wager Nectar, but your hand quality is graded on its own. True golf convention (lower is better): the pot winner posts their own hand class (Royal/Straight Flush −5 … Full House −2 … Two Pair 0 … High Card +2); every other showdown player climbs the **Yellow Jacket loser ladder** — the same as on Tour: **Next Best** (a straight or better keeps its own −5..−1 — "coolered"), **Take a Stroke** (trips / two pair / pair → +1 bogey), **Lay a Brick** (a high card with the pot still just the posted blinds — you limped and checked it down → +1), **Stack Bricks** (a high card bet into a raised pot, ≥ 2× the blinds → +2, the blow-up). The posted blinds are the cash analog of the tour's mandatory honey opener. A fold is *"put me down for 1"* — except cash folds/ties don't touch the scorecard at all (only showdowns score). Multi-way tables apply the same ladder pairwise. The scorecard is a pure skill record — **it does not convert to Nectar** — and it counts toward your Tour reputation.
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

## Tour de Bourdon — the canonical season ("the Nectour")

The production season system (Spectator → "Tour de Bourdon" card, v69.87+) is **Tour de Bourdon** — "Tour of the Bumblebee," evoking the Tour de France; colloquially **"the Nectour."** A 1024-player universe plays a fixed 65-event calendar of three tiers:

- **52 Regulars** — the weekly grind. Retail-heavy fields (~50% open qualifiers), classic 4-round 72-hole tournaments. Prestige multiplier 1.0.
- **12 Majors — "the stages"** — the prestigious flock (Masters / U.S. Open vibe). ~15% open-qualifier slots; 4 staged 72-hole "mountain stages" with cuts between (288-hole championships). Lowest aggregate wins; no heads-up final. Prestige multiplier 1.35.
- **The Main Event → the Top Pot** — the season finale. ~25% open-qualifier slots, 4 staged legs to crown a standing, then the top 2 advance to **the Top Pot** — a heads-up final showdown over 72 holes. Prestige multiplier 1.6.

Every rated event feeds the **Hive Rating** — a Kalman / Glicko-2-flavored filter on latent skill that blends two signals at α = 0.6: the OUTCOME signal (event finishes, OWGR-style strength-of-field bump, cut-blind smooth performance order) and a DECISION-QUALITY signal (Phase C: an observed-action / EV-loss skill credit — the same metric PioSolver / GTOWizard / MonkerSolver use to measure poker skill, computed analytically for AI play and via a per-hand solver pass for the eventual real-player tour). The rating is published as a friendly Elo-style number (2000 ≈ tour-average, +400 per z-unit of skill) with a ± confidence band (RD) and Glicko volatility (streaky players keep a wider band).

At season's end, **three honors** are awarded:

- 🧥 **The Yellow Jacket** + 🧸 the Bumblebee plushie — won by the Top Pot heads-up champion. The chaotic week — anyone in the final 2 can take it. Trophy is the Kill-Bill-style yellow jumper.
- 👑 **The Royal Suitor** — won by the player atop the Hive Rating who meets all three eligibility criteria: ≥ minEventsForCrown events played, ≥ tier-scaled fraction of Majors (top-1%-rated need 90%, top-10% need 70%, everyone else 50% — anti-coasting), and rating deviation (RD) ≤ crownRdCap. Falls back to the highest lower-confidence-bound rating (μ − 1.5·RD) if nobody clears all three — a good-and-trusted pick, never a fluky-few-events spike. The season-long skill verdict; the maillot jaune of the bumblebee.
- 🌼 **The Pollen Trail** — won by the leader of the parallel decaying-points race (×0.92/event), a Tour-de-France-style points jersey running alongside but separate from the Hive Rating. The form champion, deliberately subordinate to the two headline honors. The maillot vert of the bumblebee.

**Measured production behavior** (v69.103+ deep validation sweep, 12 careers × 8 arms × 6 seasons): ρ(rating, true skill) over the regulars ≈ **0.49**; the Royal Suitor lands on a top-quartile (often top-10%) player; the literal #1 wins ~12% of years (matching golf's OWGR year-end-#1 rate); a top-5-skill player wins ~40%; the Top Pot stays near a coin-flip (the Jacket is standings-fed but heads-up is heads-up). Anti-gaming: an OWGR-style field-strength floor, Glicko volatility, multi-criteria Suitor eligibility with the tier-scaled Majors floor, and a dormant volume cap for a future multi-track calendar.

The Spectator screen's **Season Center** is a tabbed broadcast over a completed run: 🏁 The Season (hero honors + a playable ceremony reveal animation) · ⚔ The Top Pot (heads-up fight-card) · 📅 Calendar (with broadcast playback: ▶ / ⏸ / step / speed) · 📊 Hive Rating (with sub-board toggle to 🌼 Pollen Trail and 💰 Money List) · 🎟 Eligibility (the criteria + the "on the bubble — what I need" Bubble Watch board) · 🎯 Skill Check (the ρ diagnostics). Plus a chunked validation study (`Season.makeStudyJob` → `runNextChunk`) for arm-comparison studies. Console aliases: `runBourdonStudy(opts)` / `runNectourStudy(opts)` / `runBourdonCareer(cfg, seed, nSeasons)`.

## Currencies

Two distinct denominations with strictly separated roles:

- **Nectar** (◈) — the bankroll currency. Buys tour event entries, pays cash-table chips 1:1, lands prize payouts. Persistent across sessions. Lives in the unified ledger.
- **Honey** — the in-event wager unit. Lives ONLY inside tour events. Per-hole pot abstraction that converts to scorecard strokes via the honey cap, reconciled at each round end. Per-hole wagering is bounded by the hole envelope E (default 3 — each player may wager up to E strokes' worth of Honey per hole, i.e. `round(E × honeyCap)` honey) and per-beat by pot-elastic K (default 5 — each betting beat's cap is K times the Honey already agreed into the pot, hard-ceilinged at 3× the hole envelope). Never directly converts to Nectar.

Cash tables do NOT use honey. Chip stacks at cash are Nectar 1:1. The "YJ Stroke" and "Bumblebee Stroke" cash variants borrow only the *scorecard* half of the tour scoring law — they keep a **separate golf scorecard** scored per showdown from hand class (true golf convention, lower = better; the pot winner posts their own hand. Under YJ the showdown loser climbs the Yellow Jacket loser ladder — **Next Best** (own −5..−1 on a straight or better — "coolered"), **Take a Stroke** (+1 bogey on trips/two pair/pair), **Lay a Brick** (+1 on a high card the pot stayed at just the blinds for) and **Stack Bricks** (+2 — the blow-up — on a high card bet into a raised pot ≥ 2× the blinds), the posted blinds standing in for the tour's mandatory opener; under Bumblebee the loser posts their own hand, no ladder. Multi-way tables apply the same ladder pairwise; cash folds/ties don't touch the card — only showdowns score). The scorecard is a pure skill record — you wager Nectar, but your hand quality is graded on its own card — and it does **not** convert to Nectar: cashout pays your chip stack only. The scorecard feeds your Tour reputation / leaderboards.

## State of the build

- **Current version: v69.105** (2026-05-13). The skill / scoring / rating stack is at its highest-known-good state — full formula audit committed in `research/AUDIT-AND-STUDY-v69.103.md`, with 14 ✅ formulas verified, 5 calibration notes documented, and 1 runtime-vs-docs gap (brick-penalty mode not propagated into the Season-engine wrapper) found and fixed. Production rating is **Phase C @ α=0.6 (Phase 1 noise)** with event-length-noise scaling; measured ρ_active ≈ 0.49 / crownSkillPct ≈ 0.83 / trueNo1IsCrown ≈ 12% (matching golf's OWGR rate).
- Self-contained: one HTML file. Two optional CDN dependencies — Three.js (loaded synchronously for the 3D atmospheric felt) and Rapier WASM (loaded on demand for physics-based chip stacking). Both gracefully degrade if blocked; the 2D felt and tween chips take over.
- Save state is browser-local via the unified `yellowJacketSave` key; a smart-refresh banner handles version drift across deploys.
- CSV export with full config snapshot ships with every simulator run for reproducible audits. Tour de Bourdon's validation study has its own CSV export (`tour_de_bourdon_study_*.csv`) with per-arm metrics.
- Calibrated against an in-build audit suite: skill expression, tier ROI separation, and late-registration handling all verified for the heads-up engine; the multi-way runner (table sizes 4 / 6 / 9, aggregate format) is live with its own per-table-size calibration (caps, fold-discipline slack, opener scaling). Tour de Bourdon's per-event statistics (ρ_active / crownSkillPct / trueNo1IsCrown / top5IsCrown / jacketSeasonPct / etc.) are continuously validated against a deterministic-seeded chunked study.

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

- [`RULES.md`](./RULES.md) — every game mode's rules in plain language with ASCII diagrams. Read this if you want to know exactly what each mode does. **§9 covers Tour de Bourdon — the canonical season system.**
- [`LICENSE.md`](./LICENSE.md) — the full proprietary license. Read this before doing anything beyond looking.
- [`IP/`](./IP/) — the IP-protection scaffold: master inventory, brand lexicon, copyright/trademark filing briefs, NDA template, and ongoing-protection checklist.
- [`research/AUDIT-AND-STUDY-v69.103.md`](./research/AUDIT-AND-STUDY-v69.103.md) — the full formula audit (Honey-Stroke layer, AI profile, Kalman/Glicko math, Phase C EV-loss credit) + the deep 576-season-run statistical study measuring the production rating's behavior.
- [`research/STUDY-observed-action-gto-ev-loss.md`](./research/STUDY-observed-action-gto-ev-loss.md) — the feasibility analysis for Phase C: the GTO-EV-loss skill credit, with the digital-game / RFID-table-requirement discussion and the two-phase rollout roadmap.
- [`specs/`](./specs/) — design specs for individual interventions (`SPEC-eligibility-scales-with-rating.md`, `SPEC-eurovision-points-carry.md`).
- [`GROK_RESEARCH_BRIEF.md`](./GROK_RESEARCH_BRIEF.md) — the standing research brief used to direct external state-of-the-art evaluation against our design DNA.
- The build's in-app **Rulebook**, **Codex**, **Decision Tree**, and **Buzz's Corner** tabs duplicate and extend this content live, with the current config snapshot.

## License & credits

**Source-available, not open-source.** Yellow Jacket Tour is the proprietary intellectual property of Blank Canvas, Inc. (a Wyoming corporation). The source code, design documents, eight-beat hand structure (Tea Box → The Fairway → The Lay-Up → The Hazard → The Approach → The Green → The Putt → The Cup), Honey-Stroke / Sweet Stroke scoring law, dual-variant (Yellow Jacket / Bumblebee) loss-rule system, Buzz mascot, the Tour de Bourdon ("Tour of the Bumblebee" / "the Nectour") season system + its three honors (the Yellow Jacket, the Royal Suitor, the Pollen Trail) + the Top Pot heads-up finale + the Hive Rating + the Phase C observed-action EV-loss skill-credit term, and all related brand assets are all rights reserved. You may read this repository for personal study, security review, or evaluation. You may not copy it, redistribute it, deploy it, derive from it, or use the brand or rule system commercially without an executed license from Blank Canvas, Inc. Full terms in [`LICENSE.md`](./LICENSE.md).

The bumblebee mascot, the lore, the Honey-Stroke scoring law, and the audit-driven calibration are original to this build. Three.js (MIT) is used for the optional 3D atmospheric scene; Rapier (Apache 2.0) for the optional physics chip stacking. Both are loaded from CDN at runtime; neither is redistributed.

For commercial license inquiries, contact Blank Canvas, Inc. via the corresponding entity address on file with the Wyoming Secretary of State.
