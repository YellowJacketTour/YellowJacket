# Yellow Jacket Tour

A heads-up Texas Hold'em poker tournament played onto a golf scorecard. Hand strength at showdown sets a per-hole golf score; honey wagering builds a per-hole pot using agreed-total semantics; net honey divides by the round's flat divisor and subtracts from the scorecard. Lower wins. The yellow jacket goes to the lowest 72-hole total on Sunday afternoon.

Single-file browser app. Vanilla HTML/JS/CSS. No backend. No build step.

## Run it

Open `yellow-jacket-tour-b.html` in any modern browser.

For local serving with hot-reload during development:

```powershell
.\serve-yellow-jacket.ps1
```

## Where to read about the game

Three documentation surfaces, three voices, one shared truth.

| Document | Voice | Audience |
|----------|-------|----------|
| **In-app Codex + Rulebook** (`#codex`, `#rules`) | Present-tense game-voice, fully detailed rule cards, live config snapshot | Players sitting at the table |
| **`RULEBOOK_NARRATIVE.md`** | Pure prose. Augusta, hive, sting. Commensurate analogies only. | Marketing, onboarding, anyone meeting the game for the first time |
| **`SPEC_FOR_AGENTS.md`** | Numbered sections, deterministic predicates, every config key typed, every function pinned to file:line | LLM agents, contributors, anyone reconstructing the engine |

Coach Corner (`#buzz`) hosts an interactive FAQ that draws from the same rule body as the in-app Rulebook.

## What's in the box

- **Tournament simulator** — full-pool seasons, multi-tier event structure (Regular / Major / Main), aggregate stroke-play and bracket formats, survival cushion + round-boundary cuts, late registration, sudden-death playoffs.
- **Two scoring variants** — Yellow Jacket (competitive Bogey Loss) and Bumblebee (casual Honored Loss). Decisive-showdown loser scoring is the only difference.
- **Multi-way tables** — 6 or 9 seats with matched-contribution wagering, collapsing to a heads-up final for Round 4.
- **Cash tables** — Yellow Jacket Cash and Bumblebee Cash with the dual-ledger Honey-Stroke system; chip stacks denominated in Nectar at 1:1.
- **Three.js + Rapier WASM atmospheric layer** — custom velvet shader, physics-driven chips, dealer button, celebration bloom on big pots. Disposed on navigation away from cash tables to release the WebGL context.
- **Bankroll engine** — Nectar wallet, P2P transfers, staking marketplace, BB jackpot, Golden Card Lottery, weekly quests, daily login streak.
- **Royal-purple-honey-garden aesthetic** — unified across every view; Bumblebee Cash adds a pastel-kawaii overlay via `body.kawaii-mode`.

## Files

```
yellow-jacket-tour-b.html      The master file. ~19,800 lines. The whole app.
yellow-jacket-tour.html        Earlier checkpoint. Reference only.
yellow-jacket.html             Earliest checkpoint. Reference only.

RULEBOOK_NARRATIVE.md          Prose rulebook companion.
SPEC_FOR_AGENTS.md             Canonical machine-readable specification.

serve-yellow-jacket.ps1        Local dev server.
```

The Desktop deployment at `C:\Users\k1rby\Desktop\Yellow Jacket\index.html` mirrors the master after each version bump.

## Currencies

**Nectar** ◈ — bankroll currency, USD-equivalent, persistent across sessions. Pays event buy-ins, settles cash-table P/L, receives prize payouts, denominates the staking marketplace.

**Honey** — per-event wager unit, integer-valued, exists only inside the boundary of a tour event. What gets bet and raised per hole; what the stroke caps are denominated in; what the round-end divisor normalises to a stroke credit on the scorecard.

The two never interconvert directly. You spend Nectar to enter; inside the event, Honey is the scoring instrument; when the event ends, the prize crosses back as Nectar. See `SPEC_FOR_AGENTS.md` §1.2 for the formal definitions.

## Tour Standard defaults

| Tier | Buy-in | Field | Stroke cap | Rake |
|------|--------|-------|------------|------|
| Regular  | $100      | 512 | 6  | 1.5% |
| Major    | $1,000    | 256 | 9  | 2.0% |
| Main early | —       | —   | 8  | 3.0% |
| Main 72-hole finals | $10,000 | 128 | 18 | 3.0% |

Sponsor purses, when configured, ride on top of the prize pool and are not raked.

## Engine touchpoints

The most-asked-about functions in the master file:

| Symbol | What it does |
|--------|--------------|
| `golfScoreFromHandValue` | hand class → bounded golf score (−5..+2) |
| `golfScoresFromShowdown` | frame-aware (winner, loser) score pair with respected-loss + cooler bonus |
| `decideFor` | AI decision kernel — pure Honey-Stroke EV math |
| `playHole` | full hole resolution (showdown / fold / tie) |
| `runStrokePlay` / `runMultiWayStrokePlay` | aggregate-format event runners |
| `runFinals` | 72-hole heads-up final |
| `selectMajorField` / `selectRegularField` | field composition |
| `DEFAULT_SIM_CONFIG` | every tunable parameter with annotated defaults |

Full index with file:line addresses in `SPEC_FOR_AGENTS.md` §9.

## Build version

The runtime constant `APP_VERSION` near the top of the master file identifies the active build.
