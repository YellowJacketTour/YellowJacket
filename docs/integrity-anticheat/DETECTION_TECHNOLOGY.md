# Yellow Jacket — Detection Technology

**Integrity Architecture addendum.**
**Scope.** Methodology, target error rates, validation approach, and explicit limitations. No architecture, staffing, or rollout described — those live in `INTEGRITY_ARCHITECTURE.md`.
**Status.** Recommendation to any future partner-operator. The detection methods below are populated to the pre-commit detection queue defined in `INTEGRITY_ARCHITECTURE.md` §3.

---

## 1. Collusion Detection

**Method.** Statistical correlation of decision patterns and timing across multiple accounts.

**Core signals.**
- Similarity of action sequences on identical or highly similar board textures.
- Timing correlation windows (reaction-time clustering).
- Outcome correlation (one account disproportionately winning or losing against another).
- Table and seating history overlap.

**Implementation approach.**
- Vectorize per-street decisions and timing.
- Apply clustering + time-windowed correlation scoring.
- Combine with basic financial-flow analysis between accounts.

**Primary structural defense.** Statistical ring-detection is a *second* line, not the primary defense. The decision-weighted rating (blend alpha ~0.8 decision / 0.2 outcome) structurally reduces the *leverage* a collusion ring can extract independent of whether the ring is detected: because skill credit is driven by opponent-agnostic decision quality (EV-loss vs GTO) rather than outcomes, dumping chips between accounts does not transfer rating. See `INTEGRITY_ARCHITECTURE.md` and the rating-design canon (blend alpha ~0.8).

**Target error rates (initial) — UNVALIDATED DESIGN TARGETS.**
- False Positive: ≤ 0.5% of accounts flagged per month.
- False Negative: 15–25%.

> **Status:** These figures are *design targets, not measured results.* They have not been validated against production data; they await synthetic-injection and red-team validation. The "state-of-the-art statistical detection" framing below is an uncited engineering expectation, not a benchmarked claim.

Detection alone is insufficient; **structural deterrents** (the decision-weighted rating above, public transparency log, enforcement consequences, ongoing rotation of detection methods, and the Sovereign Standard's reputation effects on prospective cheaters) are required to compress the actual cheating rate below the raw detection rate.

**Validation.**
- Synthetic collusion-ring injection into historical data.
- Quarterly external statistical review.
- All automated flags require human review before enforcement.

---

## 2. Real-Time Assistance (RTA) / Solver Detection

**Method.** Combination of decision-quality deviation analysis and timing signature matching.

**Core signals.**
- Unnaturally consistent or fast decision timing on complex spots.
- Sustained GTO-like deviation patterns that exceed typical human ranges.
- Sudden, sustained improvement in specific hand categories without corresponding volume increase.

**Implementation approach.**
- Compare observed actions against engine-derived GTO baselines on matched board textures.
- Analyze per-street timing distributions for non-human signatures.
- Track consistency of high-quality play across sessions.

**Target error rates (initial).**
- False Positive: ≤ 1% of active accounts per month.
- False Negative: 20–35%.
- *Design targets, not measured/validated — see §1 status note and §6.*

**Validation.**
- Controlled testing against known solver-assisted sessions.
- Comparison against large verified human-only datasets.
- Multi-reviewer confirmation required on all flags.

---

## 3. Multi-Accounting Detection

**Method.** Combination of device/behavioral fingerprinting and play-pattern clustering.

**Core signals.**
- Device and connection fingerprint similarity.
- Behavioral biometric overlap (click patterns, decision timing style).
- Play schedule and table selection correlation.
- Deposit/withdrawal pattern overlap.

**Implementation approach.**
- Client-side fingerprinting + server-side behavioral clustering.
- Graph-based detection of high-similarity account clusters.
- Cross-reference with KYC and deposit data where available.

**Target error rates (initial).**
- False Positive: ≤ 0.3% of accounts per month.
- False Negative: 10–20%.
- *Design targets, not measured/validated — see §1 status note and §6.*

**Validation.**
- Red-team testing with known multi-account setups.
- Cross-check against manually confirmed cases.
- Human review required on all automated flags.

---

## 4. Bot Detection (Fully Automated Play)

**Scope.** Bots are *not* cheating per se. Disclosed, prize-ineligible bots are permitted for liquidity and table feel, and money standings are computed human-only — decision-grading is opponent-agnostic, so bot fill does not corrupt the human rating (human ranking rho stays ~0.84 under 50% bot fill). The integrity target is therefore narrow: detect **UNDISCLOSED bots in real-money (Pollen sweepstakes) prize-eligible events**, where an undisclosed bot is a shill/fraud risk. Detection below should be applied to that context, not to bot play in general (non-redeemable Nectar / cash-game / status play is out of scope).

**Method.** Detection of *absence of human behavioral signatures* rather than deviation from optimal play. This is distinct from RTA detection: RTA addresses a human player receiving solver assistance; bot detection addresses no human being present at all. The signal classes are complementary.

**Core signals.**
- Lack of natural mouse/click jitter and micro-variations.
- Perfectly regular session lengths and decision timing with no fatigue degradation.
- Absence of normal human variance (time-of-day effects, session-length effects, emotional tilt signals).
- Unnaturally consistent performance across long sessions without degradation.

**Implementation approach.**
- Behavioral biometric analysis focused on human-signature absence.
- Session rhythm and fatigue modeling.
- Cross-reference with device fingerprint stability over time.

**Target error rates (initial).**
- False Positive: ≤ 0.2% of accounts per month.
- False Negative: 10–25% (sophisticated bots that inject light human-like noise are harder to catch).
- *Design targets, not measured/validated — see §1 status note and §6.*

**Validation.**
- Red-team testing with known bot implementations.
- Comparison against verified human play distributions.
- Human review required on all flags.

---

## 5. General Principles & Publication Policy

- All detection outputs feed the pre-commit queue for council visibility (see `INTEGRITY_ARCHITECTURE.md` §3).
- **No automated enforcement.** Every flag requires human review before any action reaches the transparency log.
- **Confiscation is legally gated.** Any fund-confiscation consequence applies only to **redeemable Pollen** (the sweepstakes/real-money path), never to non-redeemable Nectar. Because confiscation touches the real-money path and the underlying sweepstakes + shill-bot model is under active 2025–26 gaming-law scrutiny, a per-state gaming-law opinion is **required** before any confiscate-on-flag regime is operated — especially given the non-trivial false-negative/false-positive rates above, which mean confiscation can act on contested statistical flags. *This is not legal advice.*
- **Publication policy:** High-level methodology categories are published (the section headers and signal lists above). **Specific thresholds, signal weights, and exact detection parameters are not published, and rotate on a non-public schedule.** Published thresholds become targets; methodology categories do not. This split is the same one used by every serious gaming-integrity operator.

---

## 6. Honest Limitations

- Soft collusion and careful RTA use will have meaningful false-negative rates. **The FP/FN figures throughout §1–§4 are design TARGETS, not measured or validated results** — they await synthetic-injection and red-team validation against production data (per the §1 status note). Treat them as engineering expectations to be tested, not benchmarked guarantees or "realistic" numbers.
- New or low-volume accounts are harder to assess reliably (insufficient signal density).
- The system **cannot detect off-platform collusion or assistance** — phone calls, voice chat, shared spreadsheets between separated devices, group coaching sessions during play. These remain in the partner-operator's social/behavioral-analytics surface.
- Sophisticated actors who deliberately play sub-optimally to avoid detection patterns remain difficult to catch.
- Bot detection becomes significantly harder when operators inject light human-like noise, use residential proxies, and vary device profiles. The cat-and-mouse dynamic is structural and ongoing.
- Detection accuracy improves with scale (more accounts, more hands, more signal). A small operator will have weaker detection than a large one purely as a function of statistical power, independent of method quality.

---

## 7. Relationship to Other Documents

- `INTEGRITY_ARCHITECTURE.md` — this addendum populates the pre-commit detection queue defined in §3 of that document. Flags surfaced here become candidate enforcement actions reviewed by the council under §1's veto thresholds; any consequence that confiscates funds is restricted to redeemable Pollen and subject to the legal gate noted in §5.
- `SOVEREIGN_STANDARD.md` — Pillar 7 (Precision with Integrity Guardrails) is partially realized by this detection layer; the rest is human judgment under the council architecture.
- `YJSACRED_WIRE_FORMAT.md` — the per-action telemetry the partner server collects (`actions[].latencyMs`, `actions[].ts`, full transcript hash chain) is the raw signal source for collusion and RTA detection.
- `index.html` — the YJSacred client primitives that produce the telemetry consumed here.

---

*v1.0. Detection methodology specification. The detection-method *categories* and target error rates are stable; specific implementation parameters are operational and rotate on a non-public schedule.*
