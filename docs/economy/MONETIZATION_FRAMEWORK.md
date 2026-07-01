# Yellow Jacket — Monetization Framework v1.0

**Consistency:** Sovereign Standard v1.0 — Pillar 2 (Composure Protection) and Pillar 6 (Long-Term Membership).
**Scope:** Real-money play flows ONLY through Pollen sweepstakes events; prizes are overlay/guarantee-funded (not rake-extracted), and the margin engine is the Gold/Nectar layer — not tournament rake. Non-redeemable play uses Nectar (fantasy chips); Honey is in-match symbolic. Any rake sits inside the Pollen sweepstakes layer, not as the primary model. Optional training subscription, cosmetics, and sponsorships round out revenue. No other revenue mechanics permitted (see §5). NOTE: per-state gaming-law opinion required before any real-money/Pollen operation; the sweepstakes + shill-bot rules are under active 2025–26 regulatory scrutiny and nothing here is legal advice.

---

## 1. Rake Tables

Yellow Jacket uses a transparent rake model on Pollen sweepstakes entry fees. Rake decreases as buy-in increases on business grounds (prestige positioning and sponsor-overlay potential at higher stakes), NOT because a single-event skill edge lets better players "overcome" the rake. A single 72-hand event is near coin-flip (outcome skill rho ~0.05; max skill-gap win rate only ~0.56), so there is no exploitable per-event edge to grind against rake at low volume. Skill signal only emerges over graded VOLUME behind an eligibility gate (>=40 graded events), measured at the season-level decision-grading layer — not per-event finishing position.

| Buy-in Tier | Example Buy-in | Rake % | Reasoning |
|---|---|---|---|
| Micro / Daily | $1 – $5 | 5–8% | Acquisition and volume product. Higher rake acceptable at very low stakes where expected loss per session remains small. |
| Low-Stakes | $5 – $25 | 5–7% | Core recurring product. Balances house revenue with player retention. |
| Mid-Stakes | $25 – $100 | 4–6% | Core competitive product. Rake must stay moderate. |
| High-Stakes | $100 – $500 | 3–5% | Prestige positioning. Lower rake attracts serious players (note: stake size does not make a single event skill-dominated — single-event outcome rho ~0.05 regardless of stakes; skill is measured at the season/volume-gated decision layer). |
| Major / Flagship | $500+ | 3–4% | Prestige events. Lowest rake to emphasize skill and sponsor overlay potential. |

### Flagship Product: Daily $1 Yellow Jacket Qualifier

- **Buy-in:** $1 of Pollen (the redeemable sweepstakes voucher — real-money play is Pollen-only; non-redeemable play uses Nectar, Honey is in-match symbolic). Do not equate a generic "SC" with cash without the Pollen sweepstakes structure.
- **Rake:** 5–8% ($0.05 – $0.08 per entry), inside the Pollen sweepstakes layer.
- **Field target:** 300 – 1,500 players.
- **Eligibility gate:** prize-eligible standings require >=40 graded events. At casual volume (~2.4 events/player) top-1% precision is ~0.00 and the true best player can rank near the bottom — a single low-volume qualifier must NOT concentrate prize money on a near-random top finisher.
- **Payout (explicit math):**
  - After rake, the prize pool is 92–95% of total entries.
  - Payout curve is a **flat "Crown band"** across the top tier (top-1% is a coin flip, so ties are paid evenly) plus a **power-law middle**, RD-confidence weighted, behind the volume gate.
  - The flat min-cash band (defined as a percentage of field, see below) refunds buy-in to mid-finishers; positions outside both bands receive nothing.

**Worked example at 100 entries with 5% rake** (min-cash band defined as a percentage of field, so it scales with field size — at N entries the band is positions from just below the Crown band down through the (band%)·N seat; at 100 entries with a band running to 10% of field that is 7 seats, but at 300–1,500 entries the seat count scales with N):
- Total entries: $100.
- Rake to house: $5.
- Prize pool: $95.
- Min-cash band (positions below the Crown band through 10% of field = 7 seats at 100 entries): 7 × $1 = $7.
- Crown band (flat, paid evenly on ties) + power-law middle split the remaining $88, RD-confidence weighted, behind the >=40-event eligibility gate.
- Player outside both bands loses exactly $1.
- Player inside the min-cash band breaks even.

This is mathematically clean, fully publishable, and the player understands exactly what they're playing for.

This product is designed as a low-friction, high-volume acquisition engine. The real economic engine is the **Gold/Nectar margin** (not subscription + cosmetics, and not rake extraction — note the sanity-check table below where rake is nonetheless the largest single line, an internal tension to reconcile in pricing). Subscription and cosmetic conversion are secondary.

### Overlay (Marquee Events Only)

"Overlay" means the house or a sponsor adds money to the prize pool from outside entries. Use is **limited to marquee events** where added prize money is part of the prestige offering — typically sponsor-funded, occasionally house-funded for inaugural-edition or anniversary events. Overlay is appropriate when (a) it is announced before registration opens, (b) it does not change after registration opens, (c) it is disclosed on the same public page as the rake schedule. Overlay is **never** used to retroactively rescue a soft tournament or to drive last-minute registration via FOMO. Daily and weekly products do not have overlay under any circumstance.

---

## 2. Subscription Positioning (Training Tools)

**Price:** $40 – $80 per month. Annual discount available (typical 2 months free on annual).

**Positioning statement.** The subscription is a study-room product positioned alongside top-tier solver/study tools (competitor price points such as GTO Wizard's top tier and Run It Once Vision are unverified and likely stale — verify as-of a dated source before citing specific figures, and confirm Run It Once Vision is still an active product). Yellow Jacket's edge is **integrated engine data** — players study their own actual hands against their own actual opponents with the engine's full transparency, which third-party products cannot offer. The Sovereign Standard brand premium supports the price point.

### What the subscription includes

- Advanced hand history review and filtering.
- Detailed performance analytics and trend tracking.
- Session replay with decision logging.
- Study mode access to historical hands and scenarios.
- Priority support for training-related questions.
- Export tools for personal study.
- Direct integration with the YJSacred transcript layer (verifiable, replay-checked own hands).

### What the subscription explicitly does NOT include

- **Any in-game statistical advantage or real-time assistance.**
- **Faster progression, bonus Training Credits, or multipliers tied to subscription status.**
- **Priority seating, VIP tournament access, or any gameplay-affecting perks.**
- **Any information or tools that alter decision-making during active play.**

The subscription is positioned strictly as an **offline study and analysis tool**. Improvement comes from the player's own study and application, not from in-game advantages.

---

## 3. Cosmetics Scope

Cosmetics exist purely for personal expression and have zero impact on gameplay or information.

### Allowed categories

- Card backs (purely visual).
- Table felts and backgrounds.
- Avatar accessories and frames.
- Minor UI color themes (non-informational).

### Hard rules

- **Maximum price** per cosmetic item: $4.99–$9.99 (one-time) or $2.99–$4.99/month for rotating themes.
- **No cosmetic may convey, imply, or display any game-state information** (no card backs whose patterns could leak data, no avatars that change based on stack size, tilt signals, or performance).
- **Cosmetics are never required** for any competitive or social function.
- **No randomized cosmetics** (no loot boxes, no gacha, no mystery boxes — see §5).

---

## 4. Sponsorship Structure

Sponsorship revenue is generated through marquee events and the annual physical convening.

### Tiers

- **Title Sponsor** — primary branding on one flagship event per year.
- **Presenting Sponsor** — secondary branding on multiple events.
- **Official Supplier** — product or service category exclusivity (e.g., timing partner, apparel).

### Explicit Prohibitions

- Sponsors cannot influence tournament rules, structures, or payout formulas.
- Sponsors cannot receive special privileges, preferential seating, or access to player data.
- Sponsor employees or representatives receive **no competitive advantages** in events they sponsor.
- **No sponsored placement** in tournament brackets or seeding.
- Sponsorships are prestige and visibility purchases only.

---

## 5. Prohibited Mechanics — Constitutional List

The following mechanics are explicitly forbidden under this framework. Any future product decision must be checked against this list. **The default answer to "should we add this?" is no.** The burden of proof is on the proposer.

**Prohibited:**

- Training Credit or progression multipliers tied to spend or subscription status.
- VIP or high-spender perks that affect tournament access, seating, or in-game experience.
- FOMO, limited-time scarcity timers, or countdown mechanics designed to drive spending.
- Value-explosion or heavily tiered currency packages that create extreme per-dollar disparities.
- Loot boxes or any randomized reward mechanic with real or perceived value.
- Daily login streak penalties or loss of progress for missing days.
- Energy or action-limiting systems that can be bypassed with payment.
- Any cosmetic that conveys game-state or performance information.
- Pay-to-skip mechanics or accelerated timers that affect competitive participation.
- In-product advertising.
- Sponsored placement or preferential treatment in tournament structures or brackets.
- **Pity timers / near-miss reward systems** — gacha-style mechanics that show "you were close" to incentivize the next spend.
- **Dynamic pricing tied to player behavior** — charging different players different prices for the same item based on engagement, spend history, or behavioral signals.
- **Endowed-progress mechanics** — "you're 60% of the way to X reward" pseudo-progress bars that engineer commitment to a path the player wouldn't otherwise have chosen.

### Bots and money flow

- **House bots may exist for liquidity and game-feel, but CANNOT fund prizes** — prizes are overlay/guarantee-funded (bootstrap overlay ~$355k / $2.84M / $28.4M at 50k / 200k / 1M daily). In any real-money (Pollen) event, house bots must be **disclosed, prize-ineligible, and money standings computed human-only**; undisclosed house bots in money events are a shill/fraud risk. (Decision-grading is opponent-agnostic, so bots do not corrupt the rating — human ranking rho stays ~0.84 under 50% bot fill.)

### Restricted / elite tiers

- **Do not concentrate elite players into restricted high-stakes tiers.** Concentrating elites COMPRESSES outcomes to a coin flip (0.80 vs 0.95 skill => ~0.50 win rate) and removes the skilled-player edge, which lives in the OPEN field vs weaker players (~0.63 ROI), not in restricted tiers.

This list functions as a constitutional boundary. Additions to the product must be evaluated against these prohibitions first.

---

## 6. Pricing-Decision Protocol

Any new monetization mechanic, price-point change, or product feature with revenue implications must:

**(a) Be checked against §5's prohibition list.**
A documented review noting which prohibitions were considered and how the proposed mechanic is or is not consistent.

**(b) Be assessed for consistency with all seven Sovereign Standard pillars in writing.**
The analysis is documented and retained. Pillar-by-pillar compatibility statement, with explicit reasoning for any pillar where the analysis is non-obvious.

**(c) For mechanics that touch player money flow** (anything beyond cosmetic or pure aesthetic), require Independent Integrity Council review under the partner-handoff architecture (see `INTEGRITY_ARCHITECTURE.md`), AND obtain a **per-state gaming-law opinion before any real-money / Pollen operation**. The sweepstakes model and shill-bot rules are under active 2025–26 regulatory scrutiny; this framework is not legal advice and is not a settled-legality assertion.

**(d) Be published in advance.**
Players must be able to read and understand the entire monetization model from a single public page at all times. Any change goes onto that page with a documented effective date.

**The default answer to "should we add this monetization mechanic?" is no.** The burden of proof is on the proposer to show consistency with §5, all seven pillars, and the player-publication requirement.

Point (d) is the most powerful: "all monetization mechanics are publicly documented on one page" makes the framework self-enforcing because any drift becomes visible. GGPoker, PokerStars, and every mainstream operator obfuscates rake structure and bonus mechanics. **Yellow Jacket publishing the entire monetization stack on one public page is itself a Sovereign Standard differentiator.**

---

## Economic Model (Sanity Check)

Conservative back-of-envelope for the canonical economy — **Gold/Nectar margin + Pollen sweepstakes, prizes overlay/guarantee-funded**. This is NOT a settled regulated model (per-state gaming-law opinion required, §6(c)), and every figure below is **illustrative pending real funnel data**. The old "$50/mo rake-equivalent → $6.0M" line was unsupported — it assumed ~$600/yr *net* per *active* user across free and paying alike, and ignored that (a) Pollen prizes + treasury are returned to players, and (b) overlay is a real cost. Rebuilt on **net house margin, net of overlay**:

**Assumptions (illustrative):** of 10,000 ACTIVE users, ~30% pay (3,000) and ~70% are free/liquidity (fill fields, fund nothing). Paying users spend ~$20/mo gross on Gold/Nectar + Pollen (≈ $720k/yr gross). Of Pollen spend, 58% → prizes and 32% → treasury are **returned to players**; the house keeps ~10% ops + the Gold/Nectar virtual-currency margin — a blended **net house margin ≈ 25%** of gross paid spend. Overlay (~$355k bootstrap at this scale) is a separate cost that can make early years net-negative.

| Segment | Volume | Basis | Annual NET revenue |
|---|---|---|---|
| Paying tournament/currency users | 3,000 | ~$20/mo gross × ~25% net house margin (post prizes/treasury) | ~$0.18M |
| Free / liquidity players | 7,000 | $0 direct (drive volume + field liquidity) | $0 |
| Training-tool subscribers | ~1,500 | $50/mo (mid of $40–$80) | $0.90M |
| Cosmetic buyers | 500 | ~$40/yr | $0.02M |
| Annual marquee sponsorships | — | — | $0.25M–$1.0M |
| **Subtotal at 10K active** | | | **~$1.35M–$2.1M / yr** |
| *less* overlay bootstrap (ramp) | | ~$355k at 50k-daily-equiv | **early years can be net-negative** |

The dominant engines are the **Gold/Nectar margin and the training subscription — NOT tournament rake** (which nets little once prizes + treasury are returned). At 100K active this scales to roughly **~$14M–$21M/yr gross contribution** (linear, illustrative, net of a proportionally larger overlay). PokerStars at peak was ~$300M/yr from ~5M active. The honest read: the canonical restraint-based, overlay-funded, skill-rewarding economy is **viable but margin-driven and modest at small scale** — it is not a rake-extraction cash machine, and that is by design.

The Sovereign Standard's bet: lifetime value of a respected, retained player is dramatically higher than the LTV of an exploited one. **This framework backs that bet.**

---

## Relationship to Other Documents

- `SOVEREIGN_STANDARD.md` — this framework operationalizes Pillar 2 (Composure Protection) and Pillar 6 (Long-Term Membership). The prohibited-mechanics list (§5) is the economic constitution implied by Pillar 2.
- `INTEGRITY_ARCHITECTURE.md` — §6(c) of this document routes high-impact monetization decisions through the Independent Integrity Council.
- `YJSACRED_WIRE_FORMAT.md` — the partner-server contract that handles the actual transaction flow.

---

*v1.0. Framework locked. Any modification requires explicit Pricing-Decision Protocol review per §6 and council notification if §6(c) applies.*
