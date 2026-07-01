# Grader Integration Scope — grade → rating → skill-dividend + AMOE prize structure

*The grader is validated end-to-end (Kuhn → single-street → multi-street → Hold'em Oracle v0, all gated).
This document specifies how its output becomes the **Yellow Jacket Score**, the **career skill-dividend**,
and the **AMOE graded-prize** events — and, critically, derives the **precision/coverage contract** the
oracle must satisfy for the economy to be fair, legal, and solvent. That contract is the feedback that
decides how aggressively (if at all) the oracle needs to be scaled past v0.*

> **One-sentence thesis (carried):** one artifact — the per-decision EV-loss grade — is the referee, the
> payroll engine, and the legal evidence. This doc wires it to all three.

**Status legend:** ✅ prototyped on disk · ◐ partially built · ▢ unbuilt (this doc scopes it).

---

## 1. The data contract — what the grader emits per decision (the source of truth)

Per graded decision (info-set only, no hindsight), the grader emits:

| Field | Meaning | Status |
|---|---|---|
| `evLoss` (official) | `bestResponseEV(balanced field) − chosenEV`, in stroke-EV units (≥0) | ✅ (v0 oracle) |
| `accuracy%` | player-facing golf-like headline (monotone transform of evLoss) | ◐ (rating runs on raw evLoss; display transform ▢) |
| `exploitCapture` (shadow) | EV-loss vs the *actual* field — exploitation signal | ✅ (`exploit-capture.js`) |
| `mimicryFlag` (shadow) | KL of play vs GTO-pure — the **primary anti-cheat / RTA tell** | ✅ (`exploit-capture.js`) |
| `reach` / `infosetId` / `bucketId` | provenance for aggregation + audit | ◐ (v0 cache keys; production schema ▢) |
| `sealedGrade` | grade encrypted under the round's unrevealed serverSeed (commit-reveal + VRF) | ▢ (sealing deferred; see §6) |

**Non-negotiable:** the official metric is **GTO-adherence (BR-to-balanced-field)**; exploitation +
mimicry are the **shadow** (hot-hand intel + anti-cheat), NOT the official score. The official score is
opponent-independent and legally strongest. (Locked principle #4.)

---

## 2. The Rating layer — the "Yellow Jacket Score"

**Goal:** aggregate noisy per-decision `evLoss` into a stable, confidence-weighted lifetime skill number.

**Design (carries the measured results in memory):**
- **Aggregation:** Bayesian skill rating (TrueSkill2 / WHR-style) over per-decision evLoss, NOT a raw
  mean. Cold-start with a **GTO prior** (everyone starts at the balanced-field baseline), personalize
  with volume. Status: ▢ (the rating *engine* is unbuilt; the *signal* it consumes is validated).
- **Confidence / uncertainty:** every score carries a rating-deviation (RD). **Confidence-weighting is
  load-bearing** — it stops a hot newcomer leapfrogging a proven vet. ◐ (specified, not built).
- **Blend:** `α = 0.8` decision-weight / `0.2` outcome-weight is the **measured optimum** (precision
  peaks at α=0.8; pure-decision α=1.0 is worse and the 20% outcome term also minimizes collusion
  leverage). ✅ measured (memory).
- **The volume gate is mandatory:** at casual volume (≈2.4 events/player) top-1% precision ≈ 0.00 and the
  true #1 ranked 1960/2000. Gated to **≥40 graded events + high volume**, top-decile precision ≈ 0.5.
  **Pay nothing without the volume gate.** ✅ measured — this is the single most important economic guard.

**What the rating consumes from the oracle:** raw `evLoss` per decision + its `reach`. Nothing finer.

---

## 3. The Economy — two layers, one scrape (wiring the validated grade to money)

*(Carries the locked economic model; the engines exist as node prototypes.)*

### 3a. Event prizes (variance-laden, the drama + the funding)
- Pay-to-enter purses, **open skill-rank** payouts (top graders win), free **AMOE** entry for "anyone can
  win." Winners by the **grade**, not chips. Status: ◐ (structure locked; event runner ▢).

### 3b. The forever career leaderboard (the invention — a skill wage)
- A defined % of all consideration funds **continuous, skill-only, no-win/lose** payouts on rolling
  **weekly / monthly / annual** boards ranked by the YJ Score. ✅ engines prototyped:
  - **`treasury-curve.js`** — parametric payout generator: **flat "Crown band" + power-law middle**
    (top-1% precision is a coin flip, so pay the top ties evenly and crown the champion by live final),
    normalizes exactly to the pool; 50k/200k/1M field tables.
  - **`overlay-ramp.js`** — bootstraps guarantee→organic funding over a 180-day logistic ramp
    (50k:$355k / 200k:$2.84M / 1M:$28.4M mature; early adopters get ~11.4× collective return decaying to
    0.58× at maturity).
- **Cadence:** 45% monthly / 25% quarterly / 30% annual (NOT end-loaded — end-loading maximizes
  noise + cheat exposure). ✅ decided.
- **Confidence-weighting** on every payout (RD-weighted Crown-band). ◐.
- **Dividend discipline:** a **sized, sustainable % of revenue**, never an open-ended promise. ✅ principle.

### 3c. Currency separation (legal/compliance spine)
- Nectar (non-redeemable, bots OK) / Pollen (redeemable voucher, real-money events) / Honey (in-match
  symbolic). Treasury skill measured on **real-money heads-up Pollen events** (solver-graded), never
  composited with bot-filled Nectar or multi-way. ✅ ruled. Server mandate in `YJSACRED_WIRE_FORMAT.md`.

---

## 4. AMOE + graded prize-event structure (the "anyone can win" + legal footing)

- **Free AMOE entry** + huge open field = "anyone can win life-changing money" without a raffle. ✅ locked.
- **Open skill-rank prizes** (marathon / open-championship model, not brackets/draws). ✅ locked.
- **Legal posture (honest, not settled):** the **dividend layer is cleanest** (pure skill, no win/lose);
  the **event-prize layer is per-state risk** (pay-in + variance). Cash must attach to the **season GC
  standing** (skill-predominant via √N aggregation), NOT single-event variance — that's the defensible
  contest-of-skill footing (cycling-GC / PGA-money-list / DFS precedent). The grader is the evidence.
  Per-state gaming-attorney opinion mandatory; not legal advice. ✅ posture documented.

---

## 5. ★ THE PRECISION / COVERAGE CONTRACT (the feedback to oracle scope — the point of this doc)

*What must the oracle actually deliver for §2–§4 to be fair, legal, and solvent? This is what decides
whether v0 precision suffices or the oracle must be scaled.*

| Requirement | Driven by | Measured / target | Implication for the oracle |
|---|---|---|---|
| **Monotone, non-inverting grade** | rating validity | ✅ proven (BR=0, ρ=1.0 every rung) | v0 already satisfies — the binding past failure is fixed |
| **Top-decile ranking precision ≈0.5** | dividend fairness | ✅ achievable at **≥40 events** (memory) | precision comes from **VOLUME**, not finer oracle resolution → scaling the oracle past v0 buys little ranking precision; the **volume gate** does the work |
| **Stroke-EV resolution fine enough to separate α=0.8 blended scores** | leaderboard ordering | v0 grades are continuous real-valued evLoss | v0 resolution is sufficient; coarser buckets only add bias bounded by Kroer–Sandholm (S1/S2 ≤10% target) |
| **Coverage of real spots without flawed-oracle bias** | legal evidence | ✅ anti-flawed-oracle anchored (S2 byte-for-byte) | **coverage breadth** (more boards/streets) matters more than per-spot precision — argues for *sampled 52-card breadth* over *4-street depth* |
| **Variance low enough for weekly boards** | small-sample payouts | EV-loss is already an expectation (low variance); AIVAT tightens residual | weekly boards need AIVAT-proper; annual boards are volume-saturated already |
| **Tamper-proof / RTA-resistant** | anti-cheat + legal | mimicry-shadow validated; sealing ▢ | the **shadow + sealing** matter more than oracle precision for integrity |

**The contract's verdict (preliminary):** the economy is gated by **volume and confidence-weighting**,
not by oracle precision. v0's grade quality is *already sufficient* for fair ranking at the volume gate;
the higher-leverage oracle investments are **coverage breadth** (sampled 52-card, more textures — so the
grade is defined everywhere a real hand occurs) and **AIVAT-proper** (so weekly small-sample boards are
trustworthy) — NOT four-street depth or marginal per-spot precision. **This redirects the scale-up:
breadth + variance-reduction > depth + precision.**

---

## 6. What's unbuilt, ranked by leverage (the real next-builds)

1. **Rating engine** (✅ **BUILT** — `rating-engine.js`, gated) — Bayesian Normal-Normal over the
   α=0.8-blended evLoss signal + RD confidence-weighting + the **volume gate**. All 4 gates pass and it
   *reproduces the measured findings*: volume-gate necessity (top-decile precision 0.18 casual → 0.41 at
   40 events → 0.55 at 80; true #1 buried below the gate), the **α=0.8 peak** (0.41 vs pure-outcome 0.22 /
   pure-decision 0.39 — the 0.2 outcome dilutes the systematic abstraction bias), no-skill control flat at
   chance, and confidence-weighting blocking a hot 3-event newcomer from leapfrogging a proven vet.
   Consumes only what v0 already emits.
2. **Sealing** (✅ **BUILT** — `sealing.js`, 6 gates) — commit-reveal (SHA256) + per-decision AES-256-GCM
   confidentiality (HMAC-derived keys under the unrevealed serverSeed) + Merkle tamper-evidence + grade
   re-derivability from public info. PROVEN: confidential pre-reveal, tamper/forgery/reorder all detected
   (a re-sealed flattering grade fails to recompute from the public hand history = the legal-evidence
   property). Production upgrades noted: ECVRF, Shamir threshold custody, ZK-of-grade.
3. **AIVAT-proper** (✅ **BUILT** — `aivat.js`, 4 gates) — control-variate (oracle value-function baseline)
   variance reduction. PROVEN: unbiased, **6.7× variance reduction** matching theory (removes deal-luck,
   leaves only residual), ~7× fewer hands per confidence (weekly-board enabler), and honestly variance-only
   (a biased grade shifts both estimators equally → cannot rescue a bad oracle).
4. **Oracle coverage breadth** (✅ **BUILT** — `coverage.js`, 4 gates) — the 52-card grade table built by
   sampling + **hierarchical backoff** (2-D bucket → equity-only → global mean). PROVEN: 100% effective
   coverage (99.95% direct 2-D hits) over 16 buckets, 28% tighter than equity-only (Kroer–Sandholm),
   generalizes to unseen spots (60% better than flat mean), well-supported buckets converge (0.07 shift).
5. **Event/economy runners** (✅ **BUILT** — `economy-runner.js`, 6 gates) — wires rating → eligibility
   gate → confidence-rank → `treasury-curve.js` → cadence → `overlay-ramp.js`. PROVEN on a $23.36M
   treasury: exact pool conservation, sub-gate players get $0, skill-monotone payouts, confidence-weighting
   beats hot newcomers, cadence conserved, dividend ≤ sized treasury, overlay finite + crosses to organic.

---

## 7. Recommended next move
Build **the rating engine (#1)** next — it is the load-bearing bridge (grade → YJ Score → payout) and it
embeds the **volume gate**, which §5 shows is what actually makes the economy fair, not more oracle
precision. It consumes exactly what v0 already emits, so it needs **no** oracle scale-up first. Gate it
the same way: a synthetic population with known skill → the rating must recover the ranking at the volume
gate (top-decile precision ≈0.5 at ≥40 events) and stay flat (~0 precision) for a no-skill control.

*Doc map: `HOLDEM_ORACLE_V0_SCOPE.md` (the validated grader) → this (integration + precision contract) →
`treasury-curve.js` / `overlay-ramp.js` (economy engines) → `INTEL_FIELD_UNIVERSAL_GRADER.md` §3
(rating) → `YELLOW_JACKET_MASTER_SCOPE.md` (the totality).*
