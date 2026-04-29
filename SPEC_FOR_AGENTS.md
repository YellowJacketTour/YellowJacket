# Yellow Jacket Tour — Canonical Specification

This file is the source-of-truth specification for the Yellow Jacket Tour engine, written for autonomous agents that need to fully reconstruct or reason about the system. Every rule below is stated as a deterministic predicate. Every config key is listed with its type and default. Every named function is given a file:line address.

The runtime master file is `yellow-jacket-tour-b.html` (single-file browser app, vanilla HTML/JS/CSS, ~19,800 lines). Line numbers below refer to that file. They drift when edits land — when reading, locate by symbol name first and use line numbers only as starting hints.

---

## §1. Domain definitions

### §1.1. Identifiers

- **Hand** — a single dealt unit of heads-up Texas Hold'em on a single golf hole.
- **Hole** — one of 18 (or 9, or 72) game-positions in a round; the index `h ∈ {0, 1, …, holesPerRound − 1}` is round-internal and 0-based.
- **Round** — one or more sequential holes constituting a scoring unit. Length is one of {1, 9, 18, 72}.
- **Match** — a contest between two heads-up opponents over a fixed number of rounds.
- **Event** — a tournament instance with a defined field, format, tier, and prize pool.
- **Season** — an annual cycle of events; the Tour state holds 0..N seasons in `TourState.seasons`.

### §1.2. Currencies

- **Honey** — a non-negative integer-valued in-event wager unit. Has no persistent player balance; exists only inside an event.
- **Nectar** — a non-negative real-valued bankroll currency. Persists across sessions in `TourState.bankroll`. Functionally USD-equivalent.

### §1.3. Hand value classes

13-class enumeration for a 7-card final hand (poker-standard, with two premium-kicker buckets):

```
0  HighCard
1  HighCard_JackHigh+        (premium bucket)
2  Pair
3  Pair_TT+                  (premium bucket)
4  TwoPair
5  TwoPair_JackPlus_TopPair  (premium bucket)
6  ThreeOfAKind
7  Straight
8  Straight_NineHigh+        (premium bucket)
9  Flush
10 Flush_TenHigh+            (premium bucket)
11 FullHouse
12 FullHouse_JackPlus_Trips  (premium bucket)
13 FourOfAKind
14 StraightFlush_or_RoyalFlush
```

Implemented in `evaluate7` and `golfScoreFromHandValue` (`yellow-jacket-tour-b.html:1643+`).

### §1.4. Score domain

A per-hole golf score is an integer in the closed interval `[−6, +2]`.

```
−6   cooler-bonus winner (matrix)
−5   royal/straight flush winner
−4   four of a kind winner
−3   full house, J+ trips winner
−2   full house standard winner | flush T-high+ winner | straight 9-high+ winner
−1   flush/straight standard winner | three-of-a-kind winner | two-pair J+ top winner
 0   par — tied showdown OR non-folder against a fold OR own-hand par showdown
+1   bogey — folder OR competitive-variant decisive-showdown loser OR pair-under-tens own-hand
+2   double bogey — high-card-weak own-hand at showdown
```

Mapping function: `golfScoreFromHandValue(handValue) → integer ∈ [−5, +2]` (`yellow-jacket-tour-b.html:1643`). The matrix layer in `golfScoresFromShowdown` extends the lower bound to −6 via the cooler bonus.

---

## §2. Per-hole engine

### §2.1. Phases

Every hole proceeds through five named phases. The poker-street name is the underlying internal token.

| Phase    | Internal street | Action          | Stroke-cap unlock |
|----------|-----------------|-----------------|-------------------|
| Tea Box  | preflop         | hole cards dealt; mandatory opener already posted; first betting round | 25% (ceil) |
| Drive    | flop            | 3 community cards revealed; second betting round | 50% (ceil) |
| Hazard   | turn            | 4th community card revealed; third betting round | 75% (ceil) |
| Putt     | river           | 5th community card revealed; final betting round | 100% |
| The Cup  | showdown        | resolution: showdown / fold / tie | — |

For caps ≤ 3 the progressive unlock is disabled and the full cap is available from Tea Box (a 25% step would round to <1 honey).

### §2.2. Mandatory opener

At the start of each hole the agreed pot is initialised to the opener:

```
opener(h, mult) = h < 9 ? 2 : 2 * mult
```

where `h` is the round-internal 0-based hole index and `mult = cfg.backNineOpenerMultiplier` (default 2). The back-9 opener doubles by default; playoff/sudden-death holes always run at the doubled rate. 9-hole bracket matches stay flat (never reach `h = 9`).

### §2.3. Agreed-total wagering (heads-up engine)

The agreed pot at any point in the hand is a single integer `agreedTotal`. It is never a sum of contributions. Wagering operates on three primitives:

- **bet/raise(newTotal)** — propose `newTotal` as the new agreed pot. Constraint: `newTotal > agreedTotal` and `newTotal ≤ streetCap(street, eventCap, agreedTotal, potElasticK)`.
- **call** — accept the most recent bet/raise. Side effect: `agreedTotal := proposedTotal`.
- **check / fold** — see §2.5, §2.6.

Function: `playBettingRound` (`yellow-jacket-tour-b.html:3831`).

### §2.4. Street cap (pot-elastic)

```
baseCap(street, eventCap) = {
  preflop:  ceil(0.25 * eventCap),
  flop:     ceil(0.50 * eventCap),
  turn:     ceil(0.75 * eventCap),
  river:    eventCap
}

streetCap(street, eventCap, agreedTotal, K) =
  min( max(baseCap(street, eventCap), agreedTotal + K * agreedTotal),
       3 * eventCap )
```

`K = cfg.potElasticK` (default 3). Hard ceiling of 3× the global cap prevents runaway. With `K = 0` the legacy progressive floor applies unchanged.

Implementation: `streetCapFor` (`yellow-jacket-tour-b.html:3278+`).

### §2.5. Tied showdown (carry-forward)

When both players post the same hand-class outcome and kickers do not break the tie:

```
hole_score(p) = 0  for both p
honey_credit(p) = 0  for both p
carry := agreedTotal     // rolls forward
```

The next hole's opener becomes `opener(h+1, mult) + carry`.

### §2.6. Fold

When player F folds in response to a bet/raise from player W:

```
hole_score(F) = +1     // bogey
hole_score(W) = 0      // par
honey_credit(W) = previousAgreedTotal   // the value BEFORE the unaccepted proposal
honey_credit(F) = 0
```

Cards are not revealed. The fold rule is uniform across all four streets.

### §2.7. Decisive showdown

Both players post own-hand golf scores by default (Honored Loss / Bumblebee). Under `cfg.loserBogey = true` (Yellow Jacket competitive variant) the loser's own-hand score is overridden to +1. The winner additionally receives the agreed pot as honey:

```
// loser_baseScore = golfScoreFromHandValue(loserValue)
hole_score(winner) = golfScoreFromHandValue(winnerValue) + matrixAdjustments
hole_score(loser)  = (cfg.loserBogey && !respectedLoss) ? +1 : loser_baseScore
honey_credit(winner) = +agreedTotal
honey_credit(loser)  = −agreedTotal      // zero-sum
```

`cfg.loserBogey` is mirrored to runtime constant `CurrentLoserBogey`. Set automatically by `cfg.gameVariant`:
- `'yellowjacket'` ⟹ `loserBogey = true`
- `'bumblebee'`    ⟹ `loserBogey = false`

Implementation: `playHole` (`yellow-jacket-tour-b.html:2305+`).

### §2.8. Showdown matrix (frame-aware)

When `cfg.scoring.useShowdownMatrix === true` (default), per-hole scoring is computed via `golfScoresFromShowdown(winnerValue, loserValue, loserBogeyOn)`. Two integer adjustments layer on top of §2.7 base scores:

#### §2.8.1. Respected loss

```
respectedLoss = loserBogeyOn === true
              && handCategory(loserValue) ≥ 4   // Straight or better
```

When `respectedLoss === true`, the loser posts `golfScoreFromHandValue(loserValue)` instead of the flat +1 bogey.

#### §2.8.2. Cooler bonus

```
cooler = handCategory(winnerValue) ≥ 11        // Full House+
       && handCategory(loserValue)  ≥ 11        // Full House+
       && (handCategory(winnerValue) − handCategory(loserValue)) ≤ 1
```

When `cooler === true`, the winner score is decremented by 1 (additive).

All matrix outputs are integer.

---

## §3. AI decision kernel

### §3.1. Profile

Each player has a profile vector authored at pool generation time:

```
profile = {
  skill:       ∈ [0, 1],        // composite latent skill, sampled truncated-Normal(σ = cfg.skillSpread)
  noise:       ∈ [0, 1],        // per-decision randomness
  betOpt:      = 0.45,           // equity threshold for value bet
  foldOpt:     = 0.20,           // equity-slack threshold for fold
  raiseOpt:    = 0.75,           // equity threshold for raise
  bluffFreq:   ∈ [0, 0.18],     // bluff propensity, skill-correlated
  readingDepth: ∈ [0, 1],       // Bayesian read sophistication
  aggression:  ∈ [0, 1]         // bet-size shift
}
```

Profile centers and spreads live in `DEFAULT_SIM_CONFIG.{noiseCenter, betCenter, foldCenter, raiseCenter, *Spread}` (`yellow-jacket-tour-b.html:14185+`).

### §3.2. Equity estimate

`adj = adjustedEquity(holeCards, board, opponentRange, noise)` returns the bot's noisy estimate of `P(win at showdown)` ∈ [0, 1]. Updates every street.

### §3.3. EV formulas (golf-stroke units)

```
ev_fold              = −divisor − previousAgreedTotal
ev_check_or_call     = (2·adj − 1) · pot − showdownGolfCost(adj)
ev_bet_or_raise(NT)  = foldEquity(NT) · evWinByFold(NT)
                     + (1 − foldEquity(NT)) · evShowdownAtNewTotal(NT)
```

`divisor` = the round-end honey divisor (§4.2). Evaluated for each legal `newTotal` within the street's cap unlock. The bot picks `argmax` action, perturbed by profile-noise.

### §3.4. Fold conditions

Bot folds when ANY of:

```
(F1)  adj < 0.05                                            // hard low-equity floor
(F2)  adj < requiredEquity(pot, callCost) − foldOpt          // EV-slack fold
```

`foldOpt` has INVERTED polarity vs classic poker: high foldOpt means the bot folds rarely (skilled play in Honey-Stroke). Implementation in `decideFor` (`yellow-jacket-tour-b.html:3300+`).

### §3.5. Multi-way fold-floor scaling

At table size `N > 2`, the hard fold floor `0.05` is uniformly tightened:

```
HARD_FOLD_FLOOR(N) = max(0.05, 0.05 + 0.025 * (N − 2))
foldOpt_slack(N)   = 0.20 − 0.025 * (N − 2)
```

This prevents fold-rate collapse at 9-handed where per-pair equity thins.

### §3.6. Bet-size policy

Bet size = `proposedNewTotal − agreedTotal`. Skill-aware blend:

```
proposedNewTotal = round(
    (1 − skill) · randomBetSize(potOdds, agreedTotal)
  +  skill      · optimalBetSize(adj, foldEquityFn, agreedTotal)
)
```

Constrained by `streetCap(street, eventCap, agreedTotal, K)`.

### §3.7. Bayesian opponent reading

`readingDepth` controls a two-stage posterior on opponent's bluff frequency:
- prior: `bluffPrior ~ Beta(α, β)` from cohort statistics
- update: per-match aggression history feeds `oppHistory` map (per-actor aggression count, last bet-size ratio, street-level history)
- resulting `naiveDiscount` is blended into `adjRead = adj − readingDepth · naiveDiscount`

Used in fold and bet decisions instead of raw `adj` when `readingDepth > 0`.

---

## §4. Round and event scoring

### §4.1. Per-hole accumulation

```
totalGolf(player)  = Σ over holes of hole_score(player)
totalHoney(player) = Σ over holes of honey_credit(player)   // zero-sum across pair
```

### §4.2. Honey divisor (flat table)

```
honeyDivisor(holesPerRound) = {
  1:  1,
  9:  4,
  18: 9,
  72: 36
}
```

The 18-hole heads-up divisor of 9 is the golf-native anchor (one side of a round). The Major Putt cap of 9 honey aligns with this divisor: a max-pot Major win contributes exactly one stroke. Implemented in `honeyDivisorFor` (`yellow-jacket-tour-b.html:2607+`).

### §4.3. Final round score

```
roundScore(player) = totalGolf(player) − totalHoney(player) / honeyDivisor(holesPerRound)
```

Lower wins. Fractional values are formatted to one decimal place by `formatScore` (`yellow-jacket-tour-b.html:6139`).

### §4.4. Decision divisor (independent)

The AI's per-decision EV math uses `cfg.decisionDivisor` (default 9) as the effective divisor in the ev_fold formula, regardless of round length. This is independent of the round-end normalisation divisor.

---

## §5. Tournament structure

### §5.1. Format dispatch

```
cfg.tournamentFormat ∈ { 'aggregate', 'bracket' }
```

- **aggregate** (default): 4 rounds × 18 holes = 72 holes. Every event resolves by full 72-hole score.
- **bracket**: single-elim. 9-hole rounds while field > 16, then 18-hole rounds until 2 remain, then 72-hole heads-up final.

### §5.2. Survival cushion + cut (aggregate format)

`cfg.survivalCushion` (default `[12, 8, 5, 3]`) — per-round stroke threshold. After round `r` (0-based):

```
For each player P with score S(P):
  leader = min(S(P) over active players)
  if S(P) − leader > cushion[r]:
    eliminate(P, reason='cushion', round=r+1)
```

`cfg.cutSchedule` (default `[null, 0.50, 0.50, null]`) — fractional cut after each round. Applied AFTER cushion eliminations:

```
if cutSchedule[r] > 0:
  remaining = active players after cushion
  k = floor(remaining.length * cutSchedule[r])
  eliminate bottom k by score, reason='cut', round=r+1
```

### §5.3. Multi-way cushion

When `cfg.tableSize > 2`, the default cushion tightens to `[8, 5, 3, 2]`. Override via `cfg.survivalCushion`.

### §5.4. Late registration

```
cfg.lateRegLastRound  ∈ ℤ ≥ 0     // 0 disables (default)
cfg.lateRegMaxEntries ∈ ℤ ≥ 0
```

When > 0, additional players from the pool may enter at round boundaries `r ≤ lateRegLastRound − 1`. They pay full buy-in and start at:

```
S(lateEntrant) = leaderScore + 0.6 * cushion[r]
```

Implementation: `applyLateRegistration` (`yellow-jacket-tour-b.html:4367`).

### §5.5. Finish-position ordering

Sorted lexicographically by (eliminationRound DESC, score ASC). Survivors of R4 outrank R3 eliminations regardless of score. Within an elimination tier, lower score wins.

### §5.6. Playoff resolution

Tied scores at R4 trigger a sudden-death playoff among tied players. Bounded at 8 holes for aggregate format, 30 for HU bracket finals. Beyond bound: fair-coin tiebreaker.

---

## §6. Field selection

### §6.1. Composition (Major)

```
majorChampShare:    0.14   // champion exemptions
majorRankingShare:  0.28   // career ranking
majorSeasonShare:   0.30   // prior-season merit
majorCareerShare:   0.18   // career performance
majorOpenShare:     0.10   // open qualifier
                    -----
                    1.00
```

Selection in priority order. Implementation: `selectMajorField` (`yellow-jacket-tour-b.html:2869+`).

### §6.2. Composition (Regular)

```
season-merit:      0.65
career-ranking:    0.20
open-qualifier:    0.15
```

Implementation: `selectRegularField` (`yellow-jacket-tour-b.html:2939+`).

### §6.3. Composition (Main)

```
direct-entry: cfg.mainDirectEntryShare = 0.65
satellite:    1 − 0.65 = 0.35
```

Direct seats prioritise champion exemptions (past Main winners within `cfg.exemptionYears = 3`), then top season-points players. Satellite seats prioritise current-year major qualifiers (top `cfg.mainQualifiersPerMajor = 28` from each major), then active cashers across regulars and majors. Remaining seats fill from open random.

### §6.4. Champion exemption

A player who wins ANY major receives free entry into all subsequent majors for `cfg.exemptionYears = 3` years after their most recent major win. The exemption window renews on each new major win.

A player who wins a SPECIFIC major receives lifetime exemption into THAT specific major event (Augusta rule). Tracked in `player.lifetimeExemptions` keyed by `eventName`.

---

## §7. Economics

### §7.1. Buy-ins (Tour Standard)

```
cfg.buyInRegular: number = 100
cfg.buyInMajor:   number = 1000
cfg.buyInMain:    number = 10000
```

### §7.2. Tiered rake

```
cfg.rakePercentRegular: number = 0.015   // 1.5%
cfg.rakePercentMajor:   number = 0.020   // 2.0%
cfg.rakePercentMain:    number = 0.030   // 3.0%
cfg.rakePercent:        number = 0.030   // legacy flat fallback (cash tables, pre-tier configs)
```

### §7.3. Prize pool

```
grossPool   = Σ direct buy-ins
revenue     = grossPool * tierRake
prizePool   = grossPool − revenue + sponsorPurse
```

Sponsor purses (`cfg.sponsorPurseRegular/Major/Main`, default 0) are added on top and are NOT raked.

### §7.4. Payout

```
itm_count = max(2, min(64, floor(fieldSize * 0.15)))
payout(rank) = champion_share * decay^(rank − 1)   for rank ∈ [1, itm_count]
where decay = cfg.payoutDecay = 0.74
```

Champion share is normalised so `Σ payout(rank) = prizePool`.

### §7.5. Satellite ladder

```
cfg.satelliteTierRegular: number = 15           // Tier 1 entry → Regular seat
cfg.satelliteTierMajor:   number = 150          // Tier 2 entry → Major seat
cfg.satelliteTierMain:    number[] = [500, 1500, 4000, 5000]   // Tier 3 ladder → Main seat
cfg.progressiveSatelliteRequirement: boolean = true
```

A player must have cashed in a lower-tier event to unlock the next tier.

---

## §8. Default config (`DEFAULT_SIM_CONFIG`)

Defined at `yellow-jacket-tour-b.html:14185+`. Complete listing with types and defaults:

```typescript
interface SimConfig {
  // Profile distribution
  noiseCenter: number = 0.200;   noiseSpread: number = 0.100;
  betCenter:   number = 0.650;   betSpread:   number = 0.200;
  foldCenter:  number = 0.290;   foldSpread:  number = 0.180;
  raiseCenter: number = 0.855;   raiseSpread: number = 0.150;
  skillSpread: number = 0.24;

  // Pool / season / field
  poolSize:                number = 1000;
  seasons:                 number = 100;
  majors:                  number = 4;
  regulars:                number = 25;
  mains:                   number = 1;
  majorField:              number = 256;
  regularField:            number = 512;
  mainField:               number = 128;
  exemptionYears:          number = 3;
  mainQualifiersPerMajor:  number = 28;
  mainDirectEntryShare:    number = 0.65;

  // Match structure
  earlyRoundHoles:    number = 9;
  lateRoundHoles:     number = 18;
  finalsHoles:        number = 72;
  strokeCap:          number = 3;          // legacy global cap (overridden per-tier)
  regularStrokeCap:   number = 6;
  majorStrokeCap:     number = 9;
  mainStrokeCap:      number = 8;
  mainFinalsStrokeCap:number = 18;

  // Scoring law
  scoringStyle:    'honey-stroke' = 'honey-stroke';   // immutable
  gameVariant:     'yellowjacket' | 'bumblebee' = 'yellowjacket';
  loserBogey:      boolean = true;
  multiwayVariant: 'yellowjacket' | 'bumblebee' = 'bumblebee';
  decisionDivisor: number = 9;
  scoring: { useShowdownMatrix: boolean = true };

  // Pot mechanics
  backNineOpenerMultiplier: number = 2;
  potElasticK:              number = 3;

  // Tournament
  tournamentFormat: 'aggregate' | 'bracket' = 'aggregate';
  survivalCushion:  number[] = [12, 8, 5, 3];
  cutSchedule:      (number | null)[] = [null, 0.50, 0.50, null];
  lateRegLastRound: number = 0;
  lateRegMaxEntries:number = 0;
  tableSize:        2 | 6 | 9 = 2;

  // Field selection (Major shares; sum = 1.0)
  majorChampShare:   number = 0.14;
  majorRankingShare: number = 0.28;
  majorSeasonShare:  number = 0.30;
  majorCareerShare:  number = 0.18;
  majorOpenShare:    number = 0.10;

  // Economics
  buyInRegular:        number = 100;
  buyInMajor:          number = 1000;
  buyInMain:           number = 10000;
  sponsorPurseRegular: number = 0;
  sponsorPurseMajor:   number = 0;
  sponsorPurseMain:    number = 0;
  rakePercent:         number = 0.030;     // legacy flat fallback
  rakePercentRegular:  number = 0.015;
  rakePercentMajor:    number = 0.020;
  rakePercentMain:     number = 0.030;
  payoutDecay:         number = 0.74;

  // Satellite ladder
  satelliteTierRegular:           number   = 15;
  satelliteTierMajor:             number   = 150;
  satelliteTierMain:              number[] = [500, 1500, 4000, 5000];
  progressiveSatelliteRequirement: boolean = true;

  // Operational
  largeSimMode: boolean = false;
  seed:         number  = 0;        // 0 = unseeded
  label:        string  = '';
  repeatRuns:   number  = 1;
}
```

---

## §9. Function index (file:line)

The runtime constant `APP_VERSION` lives at `yellow-jacket-tour-b.html:1887` and identifies the active build.

### §9.1. Per-hand engine

| Function                       | Address (line) | Responsibility |
|--------------------------------|----------------|----------------|
| `evaluate7`                    | `~1525`        | 7-card hand evaluator → integer hand value |
| `golfScoreFromHandValue`       | `~1643`        | hand value → golf score (−5..+2) |
| `golfScoresFromShowdown`       | `~2956+`       | matrix-aware (winner, loser) score pair |
| `decideFor`                    | `~3300`        | AI decision kernel (returns action + size) |
| `playBettingRound`             | `~3831`        | single street's betting interaction |
| `playHole`                     | `~2305`        | full hole resolution (showdown / fold / tie) |
| `playMatch`                    | `~4140+`       | sequence of holes + playoff |
| `streetCapFor`                 | `~3278+`       | pot-elastic cap for a given street |
| `honeyDivisorFor`              | `~2607+`       | flat-table divisor lookup |

### §9.2. Tournament runner

| Function                       | Address (line) | Responsibility |
|--------------------------------|----------------|----------------|
| `runStrokePlay`                | `~4429+`       | aggregate-format event runner (HU) |
| `runMultiWayStrokePlay`        | `~4954+`       | multi-way table-format runner |
| `runFinals`                    | `~2617+`       | 72-hole heads-up final |
| `applyHole`                    | `~4750+`       | per-hole accumulator under multi-way matched-contribution |
| `applyLateRegistration`        | `~4367+`       | mid-event entrant admission |
| `selectMajorField`             | `~2869+`       | major field composition |
| `selectRegularField`           | `~2939+`       | regular field composition |
| `selectMainField`              | `~2999+`       | Main field composition (direct + satellite split) |

### §9.3. Pool and state

| Function                       | Address (line) | Responsibility |
|--------------------------------|----------------|----------------|
| `generatePool`                 | `~5650+`       | seed the player pool with profiles |
| `runSeason`                    | `~5800+`       | execute one annual cycle |
| `composite`                    | `~5950+`       | career composite for ranking |
| `payOut`                       | `~6000+`       | distribute prize pool by rank |
| `recordEventResult`            | `~6020+`       | persist event into season log |

### §9.4. Cash-table engine

| Function                       | Address (line) | Responsibility |
|--------------------------------|----------------|----------------|
| `renderCashView`               | `~9500+`       | cash-table view renderer |
| `cashHandTick`                 | `~10100+`      | per-hand state machine |
| `makeCashDeck` / `shuffleCashDeck` | `~9750+`   | cash-table deck (renamed to avoid collision with tour engine) |

### §9.5. UI helpers (added in this build)

| Function                  | Address (line) | Responsibility |
|---------------------------|----------------|----------------|
| `dealCard`                | `~19741`       | guard against re-animating already-dealt hole cards |
| `showActionIndicator`     | `~19751`       | silent visual feedback for poker action (check/bet/call/fold) |

---

## §10. State persistence

### §10.1. TourState shape

```typescript
interface TourState {
  pool:           Player[];          // persistent player profiles
  seasons:        Season[];          // historical event log
  currentSeason:  number;            // 1-based year counter
  bankroll:       number;            // Nectar balance
  ledger:         LedgerEntry[];     // bankroll transaction history
  preferences:    UserPreferences;   // theme, kawaii-mode, etc.
  activeGame:     Game | null;       // share-link game state
}

interface Player {
  id:                   number;
  name:                 string;
  skill:                number;       // ∈ [0, 1]
  noise: number; foldOpt: number; betOpt: number; raiseOpt: number;
  bluffFreq: number; readingDepth: number; aggression: number;
  majorWins: number; regularWins: number; mainWins: number; totalWins: number;
  runnerUps: number; eventsEntered: number;
  majorsEntered: number; regularsEntered: number; mainsEntered: number;
  lastMajorWin: number | null;       // year
  firstMajorWin: number | null;
  majorWinsByEvent: { [eventName: string]: number };
  bestFinalsScore: number;
  recentForm: number[];              // sliding window of recent placements
  currentSeasonPoints: number; lastSeasonPoints: number; qualSeasonYear: number;
  careerSpanStart: number | null; careerSpanEnd: number | null;
  reaches: { r1: number; r4: number; r2: number; finals: number; champ: number };
  buyInsPaid: number; prizeEarned: number; itmCount: number; finalTableCount: number;
  cuts: { aggregateEvents: number; madeR2: number; madeR3: number; cushionElim: number; cutElim: number };
  lifetimeExemptions: { [eventName: string]: boolean };   // Augusta rule
  mainQualifierUntil: number | null;
}
```

### §10.2. Save mechanism

Single LocalStorage key: `'yj-unified-save-v2'`. Bundle = `{ tour: TourState, lab: LabState, version: APP_VERSION }`. Hydrated by `loadUnifiedSave` on init; saved by `saveState`.

LargeSimMode disables mid-run autosaves to prevent quota errors at pool sizes ≥ 30,000. One final save runs after the loop completes; older runs are auto-pruned.

### §10.3. CSV export schema

`exportCSV` (`yellow-jacket-tour-b.html:8675+`) emits:
1. **Config snapshot** (`cfg.*` lines) — serialised `LabState.config`.
2. **Headline metrics** — `skillR2`, `skillR2_nonMain`, `skillSpearman`, `skillEVSpearman`, `eliteMajorDominance`, `finalsSkillEdge`, `finalsUpsetRate`, `belowParRate`, `repeatMajorRate`, `gini`, `itmRate`.
3. **Per-tier ROI** — Elite / Upper / Mid / Bottom with Main and non-Main variants.
4. **Distribution arrays** — `champScores`, `champScores_major`, `champScores_regular`, `champScores_main`.
5. **Major source distributions** — winner counts by source (champExempt / ranking / season / career / open).

Schema versioning: every export prepends `cfg.scoring.useShowdownMatrix`, `cfg.gameVariant`, `cfg.tableSize`, `cfg.multiwayVariant`, `cfg.rakePercentRegular/Major/Main` so audit comparisons across builds are unambiguous.

---

## §11. Rendering surfaces

### §11.1. View routes (hash-based)

```
#dashboard   #simulator   #events       #players
#bankroll    #tables      #bumblebee    #staking
#economy     #history     #hof          #analytics
#compare     #rules       #buzz         #solo
#multiplayer #decisiontree #codex
```

Dispatcher: `onHashChange` (`yellow-jacket-tour-b.html:6179+`). Each route maps to `Views[name]` if defined, else a Phase-2-stub renderer.

### §11.2. View definitions

| Route          | View object             | File address |
|----------------|-------------------------|--------------|
| dashboard      | `Views.dashboard`       | `~6213` |
| simulator      | `Views.simulator`       | `~17196` |
| codex          | `Views.codex`           | `~6482` |
| rules          | `Views.rules`           | `~7215` |
| decisiontree   | `Views.decisiontree`    | `~7660` |
| buzz           | `Views.buzz`            | `~6383` |
| solo           | `Views.solo`            | `~6796` |
| multiplayer    | `Views.multiplayer`     | `~6874` |
| (others)       | stub via `forEach`      | `~6362+` |

### §11.3. CSS architecture

- Primary `:root` token block at `~13` — semantic palette tokens (`--bg-app`, `--text-primary`, `--gold`, etc.).
- Secondary `:root` at `~242` — aesthetic-system tokens (`--augusta-felt-*`, kawaii palette).
- Active-view body attribute: `document.body.dataset.activeView = name`.
- Theme toggles: `[data-theme="sunday"]` (dark), `body.kawaii-mode` (Bumblebee aesthetic).
- Unified accent class: `body.unified-honey-garden` applies royal-purple-honey-garden trim across all views.

### §11.4. 3D atmospheric layer

Loaded via CDN: Three.js (`unpkg.com/three@0.160.0`) and Rapier WASM (`unpkg.com/@dimforge/rapier3d-compat`). Mounted on cash-table views; disposed on hash change to release WebGL context. Toggle: `body[data-yj-3d-active="1"]`. Respects `prefers-reduced-motion`.

---

## §12. External I/O

### §12.1. Share-link round-trip

`encodeGameToURL(game) → string` and `decodeGameFromURL(url) → Game | null` use base64url-encoded JSON with a SHA-256 checksum. Tampered links are rejected. Used for `#play/<encoded>` deep links from external clients.

### §12.2. Hand-history export

`exportHandHistory(matchId) → string` emits PokerStars-compatible HH text for offline analysis tools. Schema in `formatHandHistory` (`~16400+`).

---

## §13. Determinism and reproducibility

### §13.1. Seeded RNG

When `cfg.seed > 0`, `seededRandom(seed)` (Mulberry32) replaces `Math.random` for all engine code paths. Identical config + seed produces identical outcomes across runs and platforms.

### §13.2. Floating-point boundaries

All scoring is integer at hand resolution. Fractional values appear ONLY at round-end after honey-divisor normalisation. Precision: IEEE-754 double; format to 1 decimal for display.

### §13.3. Tied-tie semantics

Two players with identical floating-point round scores after divisor normalisation enter playoff. Tied playoff scores trigger nested playoff (bounded). Beyond bound: deterministic fair-coin via seeded RNG.

---

## §14. Glossary

| Term | Definition |
|------|------------|
| Honey | integer per-event wager unit; zero-sum across pair |
| Nectar | real-valued bankroll currency; persistent |
| Honey-Stroke | the canonical scoring law (golf scorecard + normalised honey credit) |
| Agreed total | the current value of the hole's pot under HU semantics; never a sum of contributions |
| Carry | tied-hole pot rolled forward as starting honey on the next hole |
| Stroke cap | per-event maximum agreed pot per hole |
| Cushion | per-round elimination threshold; player out if score − leader > cushion |
| Cut | per-round bottom-fraction elimination |
| ITM | in-the-money — finishing in a paid position (top 15% of field) |
| HU | heads-up (table size 2) |
| skillR² | linear fit between skill and career earnings |
| skillSpearman | rank correlation between skill and career win totals |
| eliteMajorDominance | fraction of major wins captured by the top-10% skill tier |
| Augusta rule | lifetime exemption to a specific major event after winning it |
| Moneymaker effect | satellite winner reaching deep at the Main; modeled via the satellite ladder |
| Tour Standard | production-scale defaults: poolSize 25000, seasons 3, majors 12, regulars 40, fields 1024+ |
