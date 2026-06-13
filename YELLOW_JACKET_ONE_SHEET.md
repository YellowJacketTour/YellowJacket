# 🐝 YELLOW JACKET TOUR — THE ONE SHEET
*Everything from the short game to the Main Event. Canonical to RULES.md §7 + the build's `golfScoreFromHandValue()`. **Lower score = better, always — it's golf.***

---

## 1. THE BIG IDEA (read this first)
**It's poker where the trophy is a golf scorecard.** You play normal Texas Hold'em hands, but you're not chasing chips — you're chasing the **lowest round**, like a golf tournament. Every hand you win is a "hole," and your hand's strength sets your score for that hole: a monster goes way under par (−5), garbage goes over par (+2).

Think of it as two layers stacked:
- **The golf layer (the real game):** your hand quality → a bounded score. This is ~90% of your result.
- **The honey layer (the side bet):** wagering moves **Honey** (think poker chips). At the end of the round the net honey is shrunk way down and nudges your golf card a little. *Honey breaks ties and rewards pressure — but it can't save a bad round.*

**Two temperaments:** **Yellow Jacket** = sharp (lose a showdown and you take a penalty stroke). **Bumblebee** = gentle (lose and you just post your own hand's score, no penalty).

> **Golf scoring is universal — every hand, every mode keeps a card.** Tour events roll it into a fixed round; cash tables (even plain poker) keep **the Endless Card** — see below.

## 2. THE WAYS TO PLAY
| Mode | In one line | You win… | Keeps a scorecard? |
|---|---|---|---|
| **Tour Event** | A bracketed tournament — the flagship | A buy-in prize pool + the title | ✅ Yes — the card *is* the result |
| **Cash: YJ / Bumblebee Stroke** | Normal cash poker **+** a golf card running alongside | Chips (the card is reputation only) | ✅ Yes (doesn't convert to money) |
| **Pure NLHE Cash** | Plain No-Limit Hold'em + a skill card alongside | Chips | ✅ **The Endless Card** (skill only) |
| **Short Game** | A fast 9-hole match (think a quick 9 after work) | per-table | ✅ Yes (honey cap = 4) |

### 🟢 THE ENDLESS CARD (for cash / hours-long sessions)
Cash play never "ends," so your card never forces a final number — it just keeps rolling, like a golfer's season:
- **Every showdown scores** (folds & ties don't touch the card — so a nit can't farm a low score by never playing).
- **Your headline number is your pace: "to par per 18"** = `(total strokes ÷ holes played) × 18`. It means the same thing after 12 hands or 12,000 — e.g. *"you're playing to −7 per 18."*
- **Every 18 scored holes auto-logs a round**, so a marathon session becomes a clean stack of 18-hole rounds + a **best round to beat.**
- **Pure NLHE default = Honored:** you just post your own hand's score, no penalties — pure poker stays pure. (Optional toggle to the Yellow Jacket penalty ladder if you want the sharper game.) The card is **skill/reputation only — it never touches your money.**

## 3. ONE HAND = 8 BEATS (one golf "hole")
`Tea Box → Fairway → Lay-Up → Hazard → Approach → Green → Putt → The Cup`
- **You bet on 4 of them** (the swings): **Tea Box** (preflop), **Lay-Up** (flop), **Approach** (turn), **Putt** (river).
- **The rest are deals/showdown:** Fairway (flop), Hazard (turn), Green (river), **The Cup** (showdown).
- **Tour betting is "agreed-total"** — you both agree on the number at risk for the hole (not chip-by-chip). **Cash betting is normal** (chips into a pot).

## 4. SCORING — YOUR HAND → YOUR SCORE *(the single source of truth)*
**Lower is better. Negatives are under par (good). A "premium kicker" upgrades you one notch.**

| Your hand | Normal | Premium version |
|---|---|---|
| Royal / Straight Flush | **−5** | — |
| Four of a Kind | **−4** | — |
| Full House | **−2** | **−3** if trips are Jacks+ |
| Flush | **−1** | **−2** if Ten-high or better |
| Straight | **−1** | **−2** if Nine-high or better |
| Three of a Kind | **−1** | *(no upgrade)* |
| Two Pair | **0** (par) | **−1** if top pair is Jacks+ |
| Pair | **+1** | **0** if Tens or better |
| High Card ("a brick") | **+2** | **+1** if Jack-high or better |

## 5. WHO WRITES DOWN WHAT (at showdown)
- **Winner:** always writes their hand score from the table above.
- **Bumblebee loser:** just writes their own hand score. No penalty — that's the gentle game.
- **Yellow Jacket loser:** climbs a **4-rung penalty ladder** (worse hand = higher rung):

| Rung | When | You post | Plain English |
|---|---|---|---|
| **1. Next Best** | You lost holding a **straight or better** | your own −5…−1 | "Got coolered" — still a great hand, still scores great. |
| **2. Take a Stroke** | You lost with a **pair / two pair / trips** | **+1** | A routine bogey. You had something, it wasn't enough. |
| **3. Lay a Brick** | You showed down **only a high card** AND the betting **never doubled the opening pot** | **+1** | You missed — but you kept it cheap. Same as folding. |
| **4. Stack Bricks** | You showed down **only a high card** AND you bet it up until the pot **at least doubled the opener** | **+2** *(+3/+4 in huge pots)* | **The blow-up.** You fired with nothing into a big pot — and lose the honey too. |

- **Folding** always costs exactly **+1** — never more, no matter what you held. (Cards stay hidden.)
- **The whole point of the brick rule:** because folding is only +1, you should *fold your air* — don't keep betting nothing and "stack bricks." That's what makes bluffing and starting-hand discipline matter.

## 6. THE BRICK, EXPLAINED SIMPLY 🧱
A **"brick"** = you reached the end with **nothing — just a high card** (air). Picture chunking your shot into the bunker.
- **Lay a Brick (+1):** one bad swing, but you checked it down and kept it cheap. No worse than folding.
- **Stack Bricks (+2 → +4):** you kept *throwing good money after bad* with that same nothing. Each brick you pile on digs the hole deeper.
- **The dividing line is dead simple:** *Did the betting at least double the opening pot?*  **No → Lay a Brick (+1).  Yes → Stack Bricks (+2+).**
- **The rule of thumb:** *fold the brick to a bet, or you'll stack 'em and eat the blow-up.*

## 7. THE MATH (only what you need)
- **Brick penalty:** `1 + (how many times the pot doubled past the opener)`, capped. *Opener = the mandatory pot: 2 honey on the front 9, 4 on the back 9. Cap = 2 normally, 4 in big events.*  → so +1 at the opener, +2 once it doubles, +3 at triple, +4 at quadruple.
- **Honey → your card (end of round):** `final score = golf card − (net honey ÷ honey cap)`. The **honey cap is big on purpose** so honey only lightly nudges the card: **36 / 9 / 4 / 1** for **72 / 18 / 9 / under-9** hole rounds.
- **How much you can bet:** each hole has a spending **envelope (E = 3)** → about **27 honey/hole** (108 on the 72-hole final). Bets can grow up to **5× the honey already in the pot** (a hard ceiling of 3× the envelope). **Tied holes carry the pot forward** to the next decisive hole — winner sweeps it.

## 8. EVENTS & MONEY
- **Buy-ins:** Regular **100**, Main Event **10,000** Nectar (Majors sit between). A **satellite ladder** lets a small entry (~15) win a bigger seat.
- **Rake:** **1.5%** on Regulars (3% legacy fallback). Sponsor money is added on top and is **never** raked.
- **Prize pool:** all buy-ins, minus rake, plus any sponsor purse.
- **Who gets paid:** the **top ~15%** of the field (`ITM = max 2, up to 64`), with the champion's slice scaled so the payouts add up exactly.
- **Round lengths:** 9 (bracket) / 18 (standard) / 72 (Main final).
- **Two crowns:** the **Yellow Jacket** = winning the Main Event (one wild week — anyone can spike it). The **Hive Crown** = best season-long rating (the *real* skill title — rarely an upset).

## 9. STRATEGY — WHY THIS ISN'T NORMAL POKER
Regular poker solvers chase **chips**. Yellow Jacket scores **golf**, so the math flips:
- **Fold freely.** Folding is only +1 — the cheapest exit. Don't bleed into bad spots; just take the bogey and move on.
- **Call thin.** Losing a showdown is *capped*, so chasing a cheap river is fine more often than in chip poker.
- **Never stack bricks.** The one true disaster is firing big with air (+2/+3/+4). Make a hand or give it up. *This is the skill lever.*
- **Go for the premium version.** A Jack-high straight beats a low one on the card (−2 vs −1) — reach for the better hand, not just the category.
- **Don't chase honey.** Golf is the game; honey only smooths the edges. Wreck your card chasing honey and you lose.

## 10. THE AI / SOLVER GRID (the shipped engine)
The AI converts its hand into a **win-chance**, then bets/folds on simple thresholds.

**Win-chance by hand category** (vs. an opponent who *didn't* already fold):
| High Card | Pair | Two Pair | Trips | Straight | Flush | Full House | Quads | Str. Flush | Royal |
|---|---|---|---|---|---|---|---|---|---|
| 5% | 38% | 72% | 87% | 92% | 96% | 98.5% | 99.9% | 100% | 100% |
*High Card is only 5% — anyone who calls your bet already beats air. That's why bluffing into a caller is doomed.*

**Best-play thresholds (top skill):** **bet** at ≥45% · **fold** below 20% · **raise** at ≥75%. Weaker players wobble off these numbers (more randomness, looser folds). Bluffing is capped at 18% of the time.

**Where the AI is headed:** L1 simple thresholds *(today)* → L2 hand-vs-range → L3 solved key spots → L4 full game-tree solving → **L5: a solver built specifically for golf scoring** *(nobody else has one — the moat).*

---
### ⏱️ 30-SECOND VERSION
**Make a hand → write a low number. Lose with a real hand → keep your score (Bumblebee) or take +1 (Yellow Jacket). Have nothing → fold for +1; never keep firing (don't stack bricks). Win honey to break ties — but golf is the game.**
**Lower is better.** 🐝
