# Patent Attorney Briefing — Yellow Jacket Tour

**Date prepared:** 2026-05-02
**Prepared for:** the patent attorney consultation, by Dalton Graham / Blank Canvas, Inc.
**Recommended counsel profile:** US patent attorney admitted to the USPTO bar, with experience in (a) software-implemented game mechanics post-*Alice v. CLS Bank* (2014), and (b) sports/entertainment IP. Search terms: "patent attorney game mechanic", "patent attorney poker software", "USPTO bar game patents."

This document is the single-page take-to-the-meeting brief. Hand it to the attorney at the start of the call. It contains the question being asked, the prior-art landscape as far as I know it, the candidate claims, and the budget envelope. The attorney should be able to give you a go/no-go recommendation in the same hour.

---

## 1. The Question

> "Of the design elements listed in §3 below, which (if any) are eligible subject matter for a US utility patent under current law (post-*Alice v. CLS Bank* (2014) and the resulting USPTO §101 guidance), and which would you recommend pursuing as a provisional patent application within the next 90 days?"

Secondary questions if time:

> "If patent eligibility is weak, what is the best non-patent posture: (a) defensive publication to lock in prior art and prevent others patenting the mechanics, (b) trade-secret protection of the calibration data and AI optima, or (c) some combination?"
>
> "Are there any foreign-jurisdiction filings (EPO, JPO) that should be considered, given that the product is a browser-based game with potential global reach?"

---

## 2. Background — What Yellow Jacket Tour Is

YJT is a single-file browser-based game that hybridizes heads-up Texas Hold'em (poker) with tournament golf scoring. Each hand of poker is one hole on a golf scorecard. The build is functional, calibrated, and ~20,000 lines of JavaScript in one HTML file. Companion documents:

- `README.md` — product overview
- `RULES.md` — full rule set in plain language
- `MIXED_GAMES_DESIGN.md` — extension specification for additional poker variants
- `IP_INVENTORY.md` — full asset inventory

**Currently:** not commercially available. Pre-launch, no public URL.

**Target:** browser game, distributed via GitHub Pages (free) or self-hosted; later, possibly app stores. No subscription, no microtransactions, no real-money gaming.

**Sole author:** Dalton Graham. Owning entity: Blank Canvas, Inc. (Wyoming).

---

## 3. Candidate Patent Subject Matter (the Mechanics)

The following are the design elements I believe may be patent-eligible. They are described in plain English here; technical implementation is in `index.html` and the design documents.

### 3.1. The Honey-Stroke scoring law (combination claim candidate)

**Claim sketch.** A computer-implemented method for scoring a sequence of poker hands as a golf-style scorecard, comprising:

(a) for each hand played in a series, evaluating the showdown hand class of each player and assigning a bounded golf score to each player based on the hand class, the bounded score lying in a fixed integer range (specifically −5 to +2);

(b) maintaining for each hand a per-hand pot of an in-game wager unit ("honey"), the pot increased by player wagers and accepted raises;

(c) at the end of a fixed-length series of N hands (where N is one of a finite set of round lengths), summing the per-hand bounded golf scores of each player to produce a stroke total, and summing the net win/loss of the in-game wager unit of each player to produce a net honey total;

(d) dividing the net honey total by an integer divisor that depends on the round length N, the divisor selected from a pre-specified table mapping each supported round length to a corresponding divisor (specifically: 1 hand → divisor 1; 9 hands → divisor 4; 18 hands → divisor 9; 72 hands → divisor 36); and

(e) computing each player's final score as the stroke total minus the divided net honey, with lower scores winning.

**Why this might be patent-eligible:** the divisor table mapping {1, 9, 18, 72} → {1, 4, 9, 36} is a specific, non-obvious technical choice that controls variance compression in a measurable way (verifiable by simulation). This is not "just a rule of a game" — it is a calibrated mathematical transformation that produces a measurable technical effect (variance compression of the score distribution). Compare *McRO v. Bandai Namco* (Fed. Cir. 2016) where a specific lip-sync rule set was held patent-eligible because it produced a non-abstract technical improvement.

**Risk:** *Alice* and *Bilski* hold abstract ideas non-patentable, and "rules of a game" are commonly classified as abstract. The combination must be presented as a *technical improvement* (variance compression), not as a *rule of play*.

### 3.2. Agreed-total wagering primitive

**Claim sketch.** A computer-implemented method for managing a multi-round wager between two or more parties, where the pot at any moment is the most recently *accepted* proposal (rather than the sum of contributions), comprising:

(a) initializing the pot at a mandatory opening total;
(b) on a bet or raise action by a party, computing a proposed new pot total;
(c) on a call action by another party, accepting the proposed total as the current pot total;
(d) on a fold action, awarding the current pot total to the remaining party;
(e) carrying forward an unawarded pot to a subsequent round on a tied resolution.

**Why this might be patent-eligible:** distinguishable from the matched-contribution model that defines all conventional poker, blackjack, and most casino-game wagering systems. The agreed-total model is a specific data-structure and state-machine choice with downstream effects on UI ("how big is the pot?" is unambiguous at every moment) and on game-theory ("the call is a binding acceptance, not a contribution"). The novelty is in the *primitive*, not just the *application*.

**Risk:** very high *Alice* exposure if presented as "a way of wagering." Must be framed as a technical implementation choice for a state machine. Likely the weakest patent candidate of the four.

### 3.3. Round-divisor variance compression (technical-improvement claim)

**Claim sketch.** A computer-implemented method for compressing the variance of a sequence of monetary or score outcomes in a competitive game, comprising:

(a) accumulating per-round outcomes over a fixed-length series of N rounds;
(b) dividing the accumulated outcome by an integer divisor d(N) selected from a calibrated lookup table; and
(c) presenting the compressed value as the contribution of the wager subsystem to a final score.

**Why this might be patent-eligible:** this is the part of the design with the strongest *technical-improvement* characterization. The divisor choice is empirically calibrated to produce a target variance (audit-confirmed); it is not an arbitrary rule. The technical effect (variance compression of a numerical distribution) is measurable and reproducible. *Diamond v. Diehr* (1981) precedent: a mathematical formula applied in a specific technical context is patent-eligible.

**Risk:** an examiner may still reject as "abstract math." Strength of claim depends heavily on how it is drafted.

### 3.4. Dual-variant loss-rule system

**Claim sketch.** A computer-implemented game system supporting two distinct loss-resolution rules selectable per game session, comprising:

(a) a first variant ("Yellow Jacket") in which a decisive-showdown loser receives a fixed penalty score regardless of the loser's hand strength;
(b) a second variant ("Bumblebee") in which a decisive-showdown loser receives a variable penalty score equal to the loser's own hand-class score; and
(c) a shared engine, wagering primitive, and stroke cap, such that the variants differ only in the loss-resolution rule.

**Why this might be patent-eligible:** the *combination* of (i) a fixed-penalty loss rule and (ii) an own-hand-score loss rule, sharing the same engine and selectable per session, is a specific design choice that produces measurably different player-experience profiles (sharper vs gentler difficulty curves). Empirical audit data confirms this.

**Risk:** "two ways to score the same game" sounds abstract. The combination + the shared-engine constraint is the technical hook. Moderate strength.

### 3.5. Survival-cushion late-registration handicap

**Claim sketch.** A computer-implemented method for seeding late entrants into an in-progress tournament, comprising:

(a) maintaining a leading score among current participants;
(b) computing a survival cushion equal to the highest-scoring (worst-performing) survivor's score minus the leader's score;
(c) seeding the new entrant at a starting score equal to the leader's score plus the cushion multiplied by a pre-specified multiplier; and
(d) the multiplier is calibrated such that late entrants have measurably lower expected ROI than initial entrants but non-zero probability of winning.

**Why this might be patent-eligible:** the multiplier (currently 1.5 in v69.24) is a calibrated choice. The audit data confirms that earlier multiplier values (0.6) produced a measurable failure (late entrants winning ~44% of tournaments). The 1.5 value produces ~2.75%. This is a documented technical-effect calibration with empirical validation. Strong *McRO*-style argument.

**Risk:** lower than the others. This is a small, specific, calibration-driven mechanic with measurable audit data.

---

## 4. What I Believe Is *Not* Patentable

So you do not waste time on these:

- The general concept of "a poker game scored as golf" — too abstract, prior art exists in informal home-game variants going back decades.
- The 16-row hand-class to golf-score table — copyright protects the specific table; patent does not.
- Schema C bucket mapping with conventional labels — too close to a method of presentation.
- The Honey-Stroke name — trademark, not patent.

---

## 5. Prior-Art Landscape (As I Know It)

I have not done a formal patent search. The following is my best understanding from informal review:

- **Casino-style hybrid games:** patents exist for "Casino War" (USPTO various, 1990s) and other simple hybrids. None match the YJT scoring law.
- **Poker software:** PokerStars and similar sites hold patents on specific UI elements (multi-table tiling, bet-slider widgets) but I am not aware of any holding the agreed-total wagering primitive or the round-divisor normalization.
- **Variance-management gaming systems:** various patents on bonus-pool and rake-back systems. None match the divisor approach.
- **Golf-scoring sports games:** patents exist for Tiger Woods PGA Tour (EA) and similar, on physics simulations. None overlap with poker scoring.

A formal patent search by a registered searcher costs ~$500–1,500 and is the recommended next step *if* the attorney rates one or more of §3.1–3.5 as eligible. Without that search, any provisional filing is at risk of being invalidated by a prior-art reference.

---

## 6. Recommended Posture if Patents Are Marginal

If the attorney's read is "patent eligibility is weak across the board," fall back to:

1. **Defensive publication.** Publish `DEFENSIVE_PUBLICATION.md` in this folder to a timestamped public location. This creates dated prior art and prevents others from patenting the mechanics. The publication does not create exclusive rights, but it bars exclusive rights for everyone else.

2. **Trade-secret protection** of the audit data, AI threshold optima, and calibration tables. These are kept private (never published) and protected by NDAs (`NDA_TEMPLATE.md`) for any party who must see them.

3. **Aggressive copyright + trademark posture.** The brand and the specific text/code are protected. The mechanics can be replicated — but the brand carries the audience.

The attorney can advise on which combination is right.

---

## 7. Budget Envelope

| Item | Rough cost |
|------|-----------|
| This consultation (1 hour) | $300–600 |
| Formal prior-art search (if recommended) | $500–1,500 |
| Provisional patent application drafting (per claim) | $2,000–5,000 |
| Non-provisional (utility) patent application (12 months later, if worth it) | $8,000–15,000 |
| USPTO filing fees (small entity) | $700 (provisional) + $730 (utility filing) + $300 search fee + $500 examination fee |
| Maintenance fees (years 4, 8, 12 — small entity) | $500 + $1,250 + $2,500 = $4,250 over 12 years |

**Realistic minimum to hold one strong provisional for one year:** ~$3,000–6,000 all in.
**To convert to a granted utility patent:** add $10,000–25,000 over 1–3 years.

If the attorney rates 2–3 of the §3 candidates as eligible, the realistic spend is the cost of one provisional covering the bundle (claims drafted as alternative embodiments under one filing).

---

## 8. What I Will Do Before the Meeting

1. Email this brief + `IP_INVENTORY.md` + `MIXED_GAMES_DESIGN.md` (under NDA) ahead of time, so the attorney can pre-read.
2. Have `index.html` available at the meeting on a laptop so I can demo the working build.
3. Have the audit CSV (the calibration evidence for the technical-improvement argument) on the laptop.
4. Bring this printed brief.

---

## 9. What I Want to Leave the Meeting With

A signed engagement letter or a written go/no-go recommendation specifying:

- Which §3.x candidates the attorney recommends pursuing.
- Whether to pursue a single provisional covering all eligible candidates or separate provisionals.
- A timeline for the provisional filing (target: 90 days from the consultation).
- The estimated all-in cost.
- A recommendation on whether to do a formal prior-art search before drafting.
- Whether defensive publication should be filed in parallel as a backup.

---

**End of briefing.** Hand this to the attorney. Time-box the conversation: 30 minutes for them to read + question, 30 minutes for go/no-go and engagement.
