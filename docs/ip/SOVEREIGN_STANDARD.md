# Yellow Jacket — The Sovereign Standard v1.0

**Scope.** Product philosophy + seven-pillar framework for any future partner-operator who runs Yellow Jacket as a commercial service.
**Status.** Recommendation to partner. Not a commitment by Blank Canvas, Inc. The single-file client (`index.html`) ships the primitives the Standard depends on; the operator side (council, transparency log, KYC pipeline, support staff) is the partner's responsibility to fund and run.

---

## Foundational Principle

> **Yellow Jacket exists to protect and elevate the player's composure, judgment, and long-term relationship with the game.**

Profit follows from doing this exceptionally well over many years. It is not the primary design driver.

## Reference Set

The Sovereign Standard synthesizes properties from:

- **Old-money private clubs** (White's, Brooks's, Knickerbocker) — discretion and restraint.
- **Luxury hospitality** (Aman, original Ritz-Carlton under Schulze) — anticipatory invisible service.
- **High-stakes card rooms and elite golf/yacht clubs** — ritual and composure.
- **Conservatories and performance institutions** — mastery as private pursuit.
- **Modern private banking and high-end digital platforms** — precision, intelligence, seamlessness.

The synthesis target is a category that does not yet exist: a digital private mastery club that achieves the dignity of old-money institutions with the capability of modern systems.

---

## The Seven Pillars (Hardened)

### 1. Maximum Feasible Discretion

- Results, volume, and financial activity are private by default.
- Public leaderboards eliminated or made minimal and explicitly opt-in. Wherever standings or payouts exist (even private/opt-in), they must be eligibility-gated (≥40 graded events) and use a flat-top "Crown band" (top-1% is a coin flip, so pay ties evenly) + RD-confidence-weighted power-law middle. Pay nothing without the volume gate.
- The platform never congratulates or surfaces wins in ways that create social pressure.
- Identity and integrity enforcement are handled separately and cleanly from play-data discretion (KYC/AML cannot be eliminated by philosophy; it can be structurally walled off).

### 2. Composure Protection

- The interface and experience actively reduce stimulation, tilt triggers, and impulsive behavior.
- Session management, reflection prompts, and result presentation are designed for emotional regulation.
- **The platform never exploits emotional states for engagement or spending.** (See Monetization Framework — this is constitutional, not aspirational.)

### 3. Ritual & Predictable Excellence

- Calm, consistent daily and weekly rhythm. Novelty is the exception, not the default.
- Core experiences (training structure, tournament cadence, interface behavior) change slowly and deliberately.
- Small repeated details create belonging over time.
- Requires founder/exec-level cultural protection against the engagement-led product instincts of growth teams.

### 4. Serious, Private Mastery

- Training is positioned as serious study, not gamified self-improvement.
- Feedback is precise, private, and respectful of the player's intelligence.
- Long-term skill development supported without creating dependency or nudging.
- Improvement is treated as a personal matter, not a public metric.

### 5. Anticipatory but Bounded Service

- Excellent and proactive for most players. Explicitly more resource-intensive for top tenure.
- Service quality scales with **tenure and conduct**, not with spend. (Tenure/conduct govern this membership/service tier only; any skill-based status or payout must be gated on graded volume, not tenure — see Pillar 6.)
- Integrity matters (bans, investigations) override "invisible service" — they are constitutional rules, not service failures.

### 6. Long-Term Membership Mindset

- Status earned primarily through consistent presence and conduct over time. (This governs the membership tier only. Any skill-based standing or payout is earned through graded VOLUME, not tenure — the rating saturates within ~1 season, and only ≥40 graded events earns the signal; elapsed time does not.)
- Designed for multi-year relationships.
- Short-term aggressive monetization tactics that damage long-term trust are structurally forbidden by the Monetization Framework.

### 7. Precision with Integrity Guardrails

- Technology handles scale and seamlessness.
- Human judgment is required for high-value decisions and all integrity matters (bans, investigations, KYC edge cases).
- See `INTEGRITY_ARCHITECTURE.md` for the structural mechanism.

---

## Game-Design ↔ Sovereign Standard Mapping

Each pillar is anchored to a specific Yellow Jacket mechanic. **A pillar without a mechanical anchor is decoration; this section is what makes the Standard load-bearing.**

| Pillar | Anchored In | Mechanic |
|---|---|---|
| 1 Maximum Feasible Discretion | YJSacred transcript layer + hash-chained ledger | Every action is already recorded and cryptographically verifiable without being publicly visible |
| 2 Composure Protection | Honey / divisor + stroke-penalty mechanics | The scoring system punishes short-term aggression and rewards patience — but the skill signal is realized only behind a graded-volume eligibility gate (≥40 graded events). Active season/career ρ ≈ 0.47–0.62 at realistic human solver-noise (~0.69 clean-AI; ρ ≈ 0.90 is the clean-AI ceiling, not production), lifted from ~0.15 outcome-only by decision-quality (EV-loss vs GTO) credit; graded volume, not tenure, is the lever. Single-event ρ ≈ 0.05 (a single 72-hand heads-up event is near a coin flip; ITM ~ coin-flip, max skill-gap win rate ~0.56) |
| 3 Ritual & Predictable Excellence | 72-hole match structure | Long, structured format creates rhythm; the chunked Spectator driver (v69.111) preserves it without freezing the tab |
| 4 Serious, Private Mastery | Training Credit + Hand Analysis subsystem | Already exists as a core loop; positioned by Monetization Framework as offline study, not in-game advantage |
| 5 Anticipatory but Bounded Service | YJSacred replay verifier + lowAssurance flag | Players can independently verify what happened; staff intervention scales with case complexity, not spend |
| 6 Long-Term Membership Mindset | Royal Suitor (skill, career-fed) vs. Yellow Jacket (chaos, event-fed) trophy design | Two distinct status paths: patient skill compounded over career, vs. moment-of-glory single-event |
| 7 Precision with Integrity Guardrails | YJSacred ledger + proposed Independent Integrity Council | Transcripts already enable verifiable enforcement; council provides structural neutrality |

**Rule:** any future pillar revision or addition must map to an existing or planned mechanic. Pillars that float free of mechanics are dropped or the mechanic is added.

---

## What This Standard Looks Like In Practice

- A player can spend years on the platform with almost no public trace of their activity.
- Training feels like studying with a serious private tutor rather than using an app.
- Support feels like dealing with a competent private club staff — professional, discreet, quietly effective.
- Status feels earned through consistency rather than purchased or gamed — and any skill standing or payout is volume-gated (≥40 graded events) behind a flat Crown-band + RD-weighted power-law curve, so it cannot be earned on tenure or a lucky single event.
- The overall atmosphere is calm, serious, and slightly formal — closer to a traditional card room than a modern gaming platform.
- Players who stay for years feel a quiet sense of belonging that is difficult to articulate but easy to feel.

---

## Honest Assessment of Difficulty

This standard is significantly harder to execute than conventional "premium UX" or "VIP tiers." It requires:

- Exceptional discipline in product decisions (resisting engagement hacks).
- High-caliber support culture.
- Long-term thinking from leadership.
- Willingness to forgo short-term revenue opportunities that conflict with the philosophy.
- Founder-level cultural protection that survives ownership changes (the historical failure mode for restraint-based brands; cf. Ritz-Carlton post-Schulze, Aman in the last decade).

Very few organizations have the patience or restraint to maintain this standard at scale. The bet is that the LTV of a respected, retained player is dramatically higher than the LTV of an exploited one — and that this gap compounds across the multi-year membership horizon the Standard is designed for.

## The Kind of Operator Required

The Standard cannot be executed by an arbitrary commercial team. It requires a specific profile of operator and leadership, and the project's viability depends entirely on getting this right:

**The CEO / operating principal must:**
- Have the temperament of Horst Schulze (original Ritz-Carlton) or Adrian Zecha (Aman founder), not the temperament of a typical SaaS or gaming-platform founder. Specifically: a multi-decade horizon, deep aesthetic discipline, willingness to publicly decline revenue that violates principle.
- Personally own a majority of voting control, or have enforceable governance protections (e.g., a dual-class share structure or a purpose-trust ownership wrapper) against future board pressure to dilute the Standard.
- Treat the Sovereign Standard as a constitutional document, not a brand-marketing document. The seven pillars are vetoes on product proposals, not aspirations.

**The product / growth function must:**
- Be staffed with people who have demonstrated the ability to say "no" to engagement metrics. Most growth-led product hires are anti-correlated with the discipline this Standard requires. Hire from luxury hospitality, fine craft manufacturing, or curated-publishing backgrounds, not from mobile gaming.
- Operate under the Monetization Framework's Pricing-Decision Protocol (`MONETIZATION_FRAMEWORK.md` §6) as a binding constraint, not a guideline.

**The capital structure must:**
- Be patient. Standard venture timelines (5–7 year exit) are incompatible with the multi-decade compounding the Standard is designed for.
- Avoid investors who require growth-pressure exits. Family offices, founder-aligned debt, sovereign-wealth-adjacent capital, or genuinely long-horizon strategic capital are the right sources. Standard VC is the wrong one.
- Pre-commit to the integrity-layer budget (`INTEGRITY_ARCHITECTURE.md` §9, $9M–$15M over 3 years) as a non-negotiable line, not a discretionary one.

**The historical failure mode** for restraint-based brands is not a single bad decision; it is the slow erosion of restraint under ownership changes, growth pressure, and the natural human tendency to optimize for what's measurable. The Standard's defense against this is structural: founder voting control, the Independent Integrity Council, the Monetization Framework's prohibited-mechanics list, and the requirement that the entire monetization model be published on a single public page (§6(d) of the Monetization Framework). These four mechanisms together make drift visible and expensive. Without all four, the Standard will be visibly intact and operationally hollow within five years.

**If a prospective operator cannot meet these four requirements simultaneously, the right answer is to scale the Standard down to match the operator, not to launch with the full Standard and let it erode.** A 1/10th-scale honest version of the Standard is more valuable than a full-scale version that gets gradually compromised. See the Integrity Architecture's "Minimum Viable Integrity Layer" subsection for the scaled-down version.

---

## Relationship to Other Documents

- `INTEGRITY_ARCHITECTURE.md` — structural mechanism for Pillar 7. Independent Council + public transparency log.
- `MONETIZATION_FRAMEWORK.md` — economic translation of Pillar 2 and Pillar 6. Built on the Nectar/Pollen/Honey currency stack (Nectar = non-redeemable fantasy chips; Pollen = redeemable voucher; Honey = in-match symbolic), with real money ONLY via Pollen sweepstakes events and prizes funded by overlay/guarantees (not house bots). Subscription + cosmetics + sponsorship, plus a daily prize-pool split — note the modeled 58/32/10 split is a ~42% take (the rec player subsidizes the pool; Gold/Nectar margin is the real engine), so it must not be framed as "player-friendly" without that caveat. Includes a constitutional prohibited-mechanics list.
- `YJSACRED_WIRE_FORMAT.md` — the partner-server contract that makes Pillars 1, 5, 7 operationally enforceable.
- `index.html` — the client primitives (game engine, YJSacred, AI v130) the Standard sits on top of.

---

*Version 1.0. Locked pending real-world commitments: founding council cohort, partner-operator identification, and capital allocation. The document is architectural; the operation is downstream of human relationships and capital decisions no document can substitute for.*
