# Yellow Jacket Tour — Brand Lexicon

**Maintainer:** Dalton Graham, on behalf of Blank Canvas, Inc.
**First adopted:** 2026-05-02
**Status:** Live. This is the canonical style guide for all YJT brand language. All product copy, marketing, code labels, and external communication must use the **primary marks** (column 2). The **casual variants** (column 4) may be used in flavor text, social media, in-game commentary, lore, and conversational marketing — each variant accrues common-law trademark rights through use.

This file exists to (a) prevent unintentional brand drift, (b) document the variant pool so that any of them can be filed at USPTO later if commercial value develops, and (c) serve as evidence of brand intent dating back to 2026-05-02.

---

## 1. The Eight Beats of a Hand

The canonical structure of a Yellow Jacket Tour hand. Real-golf semantic order: **action → state → action → state**, with the preflop deal+bet collapsed into the Tea Box (because in real golf you tee up and immediately drive — the tee box and the drive are one beat).

| # | Primary mark (FILE) | Type | Poker phase | Casual variants (USE, don't file) |
|---|---------------------|------|-------------|------------------------------------|
| 1 | **Tea Box** | combined state + action | preflop deal + opening pot + first bet | The Tee, The Drive, The Open, The First Sting, The Tee-Off |
| 2 | **The Fairway** | state | flop deal (3 community cards) | The Reveal, The Lay, First Bloom, The Spread |
| 3 | **The Lay-Up** | action | flop bet | The Iron, The Second, The Press, The Set |
| 4 | **The Hazard** | state | turn deal (4th community card) | The Lie, The Rough, The Bend, The Trap |
| 5 | **The Approach** | action | turn bet | The Run-Up, The Line, The Set-Up, The Pitch |
| 6 | **The Green** | state | river deal (5th community card) | The Pin, The Flag, In Close, On Pin |
| 7 | **The Putt** | action | river bet | The Strike, The Read, The Sink, Final Sting |
| 8 | **The Cup** | resolution state | showdown | The Drop, The Hole-Out, The Bottom, Ball In |

**Notes:**

- "Tea Box" intentionally collapses the preflop deal and the preflop bet because real golf does the same: at the tee box, the immediate next thing you do is drive. They are one indivisible beat.
- "The Drive" is a *casual variant for Tea Box*, not a separate beat. Players may say "I went big on the drive" meaning they raised aggressively preflop.
- The pattern from beat 2 onward is strict alternation: state (where the ball / cards landed) → action (the next shot / bet decision).
- Beats 1, 2, 4, 6, 8 are **states**. Beats 3, 5, 7 are **actions**.

---

## 2. The Two Currencies

| Type | Primary mark | Casual variants |
|------|--------------|------------------|
| Bankroll currency | **Nectar (◈)** | "the bank," "stash," "stack" (cash context only) |
| In-event wager unit | **Honey** | "the pot," "the comb" (when describing accumulated honey) |

**Trademark posture:** Nectar and Honey are too descriptive on their own to register strongly in Class 28 (games). They're protected by common-law use and by the Yellow Jacket Tour family-of-marks argument. Don't file them solo.

---

## 3. The Two Variants

| Mark (PRIMARY — file) | Casual variants | What it is |
|------------------------|------------------|------------|
| **Yellow Jacket** (variant) | "YJ," "the sharp side," "the bogey rule" | Decisive-showdown loser climbs the **loser ladder** (below): Next Best (straight+ keeps own −5..−1) → Take a Stroke (pair/2P/trips → +1 bogey) → Lay a Brick (high card checked through → +1) → Stack Bricks (high card bet into a grown pot → +2, the blow-up) |
| **Bumblebee** (variant) | "BB," "the gentle side," "the honored rule" | Decisive-showdown loser posts their own hand-class score, always — no ladder |
| **The loser ladder** (concept) | "the bogey ladder," "the four rungs" | The single monotone ordering of the Yellow Jacket loser score: **Next Best** (straight+ → own −5..−1) **<** **Take a Stroke** = **Lay a Brick** (+1) **<** **Stack Bricks** (+2, or +3/+4 at cap +4). Golf's own scoring shape — better than a bogey → a bogey → a worse-than-a-bogey blow-up. The worse your hand AND the more you committed, the more it costs — but a real made hand is forgiven. A fold sits off the ladder ("put me down for 1") |
| **Next Best** (rule / outcome) | "respected loss," "coolered," "ran into a hand," "a losing birdie," "you still posted your number," "lipped out" | The top rung: a loser whose hand is a straight or better keeps their own −5..−1 hand-class score instead of any bogey. "A birdie's a birdie, even on a hole you lost." It's the loser side of the **cooler bonus** (the winner of that frame gets the extra −1). (Synonym **respected loss** retained; do **not** call it "the honored loss" — that's the Bumblebee variant.) |
| **Take a Stroke** (rule / outcome) | "a two-putt bogey," "a working bogey," "take your medicine," "paid it off," "take the L" | The middle rung: a loser with a pair / two pair / trips posts the flat +1 bogey — the routine, no-drama loss, the modal showdown loser |
| **Lay a Brick** (rule / outcome) | "a brick in your pocket," "checked it down with air," "laid up to bogey-plus" | The cheap brick rung: a loser holding only a high card who checked it through (the agreed total never reached double the opener) posts +1 — air, but you didn't commit to it |
| **Stack Bricks** (rule / outcome) | "the 3-putt," "the blow-up," "spewed into it," "barreled with air," "the brick wall" | The expensive brick rung: a loser holding only a high card who committed honey until the agreed total reached at least double the opener posts +2 (the blow-up) — and loses the larger honey too. Slogan: "fold the brick to a bet, or stack 'em and eat the blow-up" |
| **Brick** (term) | "air," "a whiff," "nothing made" | A hand that reaches showdown holding only a high card. Under Yellow Jacket a brick loser is on the Lay a Brick (+1) or Stack Bricks (+2+) rung depending on how much honey they committed |
| **Pot-gated brick** (rule) | "the brick tax," "the bluff-back lever" | The Yellow Jacket sub-rule covering the two brick rungs: brick loss = `1 + ⌊(T−opener)/opener⌋`, clamped to `[1, cap]`, cap 2 by default — `Flat +1 / Flat +2 / Pot-gated cap +2 ★ / Pot-gated cap +4` in the Simulator's "Brick loss" control. Mirrors how folding a bigger pot costs more; the lever that makes pre-flop hand selection and bluffing matter. At cash, the opener-analog is the posted blinds (small + big) |
| **Put me down for 1** (rule / phrase) | "a gimme," "conceded the hole," "open-folded," "concede it, take the stroke" | The fold cost on the scorecard: the folder always posts +1 — never +2, whatever they held and however much was bet — cards never revealed (the only part that scales is the honey forfeit, sized to the *previously-agreed* pot). Sits off the loser ladder. The cheap-escape asymmetry vs. Stack Bricks is what gives folding and bluffing their weight |
| **Cooler bonus** (rule) | "the collide," "two monsters" | A winner who shows a full house or better against a loser also at a full house or better, within one hand-category, gets an extra −1 (floored at −6). Tour events only; <0.1% of showdowns. The loser of that frame is on the **Next Best** rung |

---

## 4. The Scoring Law

| Mark (PRIMARY — file) | Used when | Casual variants |
|------------------------|-----------|------------------|
| **Honey-Stroke** | Default name; in-product references; rulebooks; technical documentation | "the law," "the system" |
| **Sweet Stroke** | Consumer-facing marketing; alternative brand presentation; "sweetening the pot" tagline | "Sweet," "the Sweet" |

Both names refer to the same scoring system. The two marks let the brand have range: Honey-Stroke for in-world / mechanical contexts, Sweet Stroke for marketing and casual reference.

### Scoring-law mechanics — preferred terms

| Term | Use it for | Notes |
|------|------------|-------|
| **honey cap** | The round-end Honey→stroke divisor, applied once at each round end. | Two modes: `calibrated` (stepped table — round length 1→cap 1, 9→4, 18→9, 72→36) and `spec` (cap = the round's hole count N). Supersedes the older term **"round divisor"** (acceptable as a synonym, but "honey cap" is preferred in new copy). |
| **hole envelope (E)** | The per-hole, per-player Honey ceiling in stroke-equivalents. | Default E = 3. Per-hole cap = `round(E × honeyCap)`. When E > 0 it replaces the legacy per-tier stroke caps. |
| **pot-elastic K** | The per-beat cap multiplier. | Default K = 5. Each betting beat's cap is `min(3 × hole-envelope cap, ⌈K × agreed total⌉)`. |

---

## 5. Tournament-Format Names

| Mark | Status | Casual variants |
|------|--------|------------------|
| **Aggregate Stroke Play** | Generic golf — common-law only | "the long format," "stroke play" |
| **Bracket Knockout** | Generic — common-law only | "the bracket," "single-elim" |
| **The Hive** | Lore term — common-law; defer paid filing | "the colony," "the swarm" |
| **The Major** / **The Mains** | Common-law | "majors," "main" |
| **Sudden Death** | Generic — common-law only | "SD," "playoff" |

---

## 6. Mascot and Lore

| Mark (file) | Casual variants | Notes |
|-------------|------------------|-------|
| **Buzz** (mascot character) | "the bee," "tip-bee" | File the stylized character mark when art exists |
| **Stung** (gameplay event) | "got stung," "took a sting" | Common-law only; descriptive |
| **The Hive** (community/setting) | "hive members," "the colony" | Common-law; defer paid filing |

---

## 7. Cash-Table Variant Names

| Mark | Status | Casual variants |
|------|--------|------------------|
| **Pure NLHE** | Generic | "cash," "no-limit" |
| **YJ Stroke** | Sub-product mark; protected by parent | "the stroke ledger" |
| **Bumblebee Stroke** | Sub-product mark; protected by parent | "BB Stroke," "the gentle ledger" |

---

## 8. Style-Guide Rules

These are the rules for how to USE the marks in copy. Inconsistent use erodes both the family-of-marks trademark argument and brand recognition.

### Rule 1: Capitalize primary marks consistently

- Always: **Tea Box** (not "tea box" or "Teabox")
- Always: **The Fairway** (with capital T-h-e in formal copy; the article is part of the mark)
- Always: **The Lay-Up** (hyphenated, not "Layup" or "Lay Up")

### Rule 2: First use of any primary mark in a document gets a TM symbol

- Example: "After the Tea Box™, the Fairway™ reveals three community cards."
- Subsequent uses in the same document don't need the TM.
- This is not a legal requirement; it is a public assertion of trademark claim that strengthens the common-law position.

### Rule 3: Pair primary marks with familiar parentheticals on first use in player-facing copy

- Example: "**The Lay-Up** (the flop bet) is your second commitment to the hand."
- This is the "Whopper model" — the brand term replaces the generic, but the generic is named once so the reader doesn't get lost.
- After the first appearance, drop the parenthetical.

### Rule 4: Use casual variants in flavor text, marketing, and social — NOT in primary rules text

- ✅ Good marketing tweet: "Don't fear the Hazard. Trust your read on the line."
- ✅ Good Buzz tip: "When your drive lands clean, the iron is yours to play."
- ❌ Bad rules text: "The iron is the betting event after the Fairway." — should be "The Lay-Up is the betting event after the Fairway."
- The rule: rules and tutorials use the **primary mark only**; marketing and lore use **either**.

### Rule 5: Never use a casual variant generically

- ❌ "A drive in poker is just any preflop bet." — this teaches the public that "drive" is generic.
- ✅ "A Drive — what we call the tee-off in Yellow Jacket Tour — is your preflop bet." — this teaches the public that Drive is OUR term for our concept.

### Rule 6: Document new variants as they're coined

- If a new casual variant emerges (community use, a clever piece of marketing copy), add it to this file with a date stamp.
- Each documented variant accumulates common-law rights from its first dated use.

---

## 9. Filing Decision per Mark

| Mark | First-round filing? | Why |
|------|---------------------|-----|
| Yellow Jacket Tour | **Yes** | Flagship; arbitrary; strong |
| Yellow Jacket | **Yes** (after TESS clear) | Short form; strong |
| Honey-Stroke | **Yes** | Distinctive (hyphenated, suggestive) |
| Sweet Stroke | **Yes** (after TESS clear) | Suggestive; alt brand |
| Bumblebee | **Yes** (after TESS clear; DreamWorks check) | Distinctive in context |
| Buzz (word) | Defer to stylized | Common name; needs visual treatment |
| Tea Box | **Defer** to family suite | Clever pun but weak alone; file with stylized treatment in family-of-marks suite |
| The Fairway | Defer to family suite | Generic golf word; same deferral |
| The Lay-Up | Defer to family suite | Generic golf word; same deferral |
| The Hazard | Defer to family suite | Generic golf word; same deferral |
| The Approach | Defer to family suite | Generic golf word; same deferral |
| The Green | Defer to family suite | Generic golf word; same deferral |
| The Putt | Defer to family suite | Generic golf word; same deferral |
| The Cup | Defer to family suite | Iconic but legally crowded; file with stylized treatment |
| **All casual variants** | **Never** (unless commercial pressure changes) | Common-law only — costs $0, accrues through use |

---

## 10. Variant-Use Log (Append-Only)

When a casual variant is first used in a public artifact (marketing, build copy, social media, press release), record it here. This is the evidentiary backbone of the common-law trademark claim.

| Date | Variant | First public use | Context |
|------|---------|-------------------|---------|
| 2026-05-02 | (initial set) | This LEXICON.md document | Adopted as part of brand-lexicon scaffold |
| 2026-05-12 | "Next Best" (loser-ladder rung) — and casual variants "coolered," "ran into a hand," "a losing birdie," "you still posted your number," "lipped out" | `RULES.md` §3.9 / §7, in-app Rules-tab codex, README, build copy | Adopted as the name for the top rung of the Yellow Jacket loser ladder (straight+ keeps its own −5…−1) |
| 2026-05-12 | "Take a Stroke" (loser-ladder rung) — and casual variants "a two-putt bogey," "a working bogey," "take your medicine," "paid it off," "take the L" | `RULES.md` §3.9 / §7, in-app Rules-tab codex, README, build copy | Adopted as the name for the middle rung (pair / two pair / trips → +1 bogey) |
| 2026-05-12 | "Lay a Brick" (loser-ladder rung) — and casual variants "a brick in your pocket," "checked it down with air," "laid up to bogey-plus" | `RULES.md` §3.9 / §7, in-app Rules-tab codex, README, build copy, Simulator "Brick loss" control | Adopted as the name for the cheap brick rung (high card, checked through → +1) |
| 2026-05-12 | "Stack Bricks" (loser-ladder rung) — and casual variants "the 3-putt," "the blow-up," "spewed into it," "barreled with air," "the brick wall" | `RULES.md` §3.9 / §7, in-app Rules-tab codex, README, build copy, Simulator "Brick loss" control | Adopted as the name for the expensive brick rung (high card bet into a pot ≥ 2× the opener → +2, the blow-up) |
| 2026-05-12 | "Put me down for 1" (fold-cost phrase) — and casual variants "a gimme," "conceded the hole," "open-folded" | `RULES.md` §3.7 / §3.9 / §7, in-app Rules-tab codex, README, build copy | Adopted as the name for the fold cost (folder always posts +1, never +2; cards unrevealed) |
| | | | |

---

**End of lexicon.** This file replaces ad-hoc naming. When in doubt about how to refer to a stage, currency, variant, or character — consult this file.
