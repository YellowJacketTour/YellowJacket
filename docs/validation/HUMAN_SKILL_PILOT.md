# Yellow Jacket Tour — Human Skill Measurement Pilot (Protocol)

**Purpose.** Put a *real* number on Yellow Jacket's human skill signal — the one thing the engine cannot measure — and produce the evidence base for the "contest of skill" legal posture and the Hive Rating calibration. This is the decisive experiment. Everything before it measured *bots*; this measures *players*.

---

## 0. Why this exists (read first — it's the whole motivation)

Every skill measurement we ran on the engine returned ρ ≈ 0.05 for a single heads-up event. **That number is an artifact of our *bots*, not a property of the game.** Three independent attempts to measure real skill axes all hit the same wall — the parameterized AI cannot *express* the skill, so it collapsed to symmetric noise:

| Skill axis we tried to measure | Why the bots couldn't express it |
|---|---|
| **Opponent exploitation** (read & punish leaks) | engine AI has no adaptive opponent model — plays its own balanced game |
| **Read-selection** (leverage your +EV spots) | proven 5× *in a calibrated model*, but the engine AI doesn't choose leverage |
| **Discipline / sustainability** (don't make the −EV decision that gets you cut) | **EV-rational bots never make the catastrophic decision in the first place** — when we cranked "looseness," the AI just played *effective* aggression and scored *better* |

The third is the deepest: the skill of **not making unsustainable decisions** (tilt, ego, chasing, stacking bricks, over-committing with air) is a *human-irrationality* axis. Our bots are rational, so they cannot leak — and the variance we attributed to "luck" is, in real humans, **decision-quality variance**: the sustainable players pull away, the unsustainable ones bleed and get cut. The cut structure *amplifies* this (a bad-decision spiral costs you the cut, not 2 strokes).

**Conclusion the pilot tests:** the true human per-hand / per-event skill signal is *unmeasured and very plausibly far above 0.05.* Only human hand data can settle it. We expect it to come back high.

---

## 1. The hypotheses (pre-registered)

| # | Hypothesis | Pass criterion |
|---|---|---|
| H1 | Human card-decision quality (EV-loss vs solver) separates skill tiers far more than our bots did | EV-loss gap between top and bottom tier ≥ several bb/100, monotonic across tiers |
| H2 | **Brick discipline** (rate of Stack-Bricks / air-into-pot) is a strong, separating skill axis | brick/spew rate correlates with tier; ρ(brick-discipline, tier) materially > 0 |
| H3 | **Sustainability / bust-cut avoidance** separates skill under the cut structure | survival-depth correlates with tier strongly |
| H4 | Per-event human ρ ≫ 0.05 (the bot floor) | single-event ρ(outcome, tier) comfortably above 0.05 (target ≥ 0.2–0.4) |
| H5 | Skill is decisive over a season aggregate | aggregate-standing ρ(standing, tier) high (≥ 0.6) — confirms the GC legal posture |
| H6 | Opponent exploitation adds signal (the ExploitCapture axis) | exploiters' EV gain vs leaky opponents > 0 and tier-correlated |

**Pre-register these before looking at data.** Lock the metrics and thresholds so the analysis isn't post-hoc.

---

## 2. What to measure (the metric stack)

Per player, computed from graded hand histories:

1. **Card-decision quality — EV-loss vs GTO** (bb/100). The primary card-skill metric. Requires the solver-graded grading pipeline (see `GRADER_PIPELINE_SCOPE.md`; solver fixed, `evByAction` ported). This is the strokes-gained analog.
2. **Brick discipline** — rate of *Stack-Bricks* outcomes (showing down air after building the pot) and avg brick penalty per air-hole. Directly from the loser-ladder scoring. *This is the discipline axis the bots couldn't show.*
3. **Sustainability / bust-cut avoidance** — survival depth in cut events; variance of cumulative score; frequency of decision-spiral sequences (consecutive −EV escalations). *The "unsustainable game theory" axis.*
4. **Opponent exploitation (ExploitCapture)** — EV gained above GTO vs the *modeled* opponent (read & punish). The RTA-resistant skill term.
5. **Positional / GC navigation** (if cut lines are visible in the pilot UI) — distance from position-optimal play; cut-bubble decision quality.
6. **Outcome** — per-event finish + cumulative standing (for ρ vs tier).

**Ground truth (the hard part):** each player needs an *external skill label* independent of the pilot — see §4.

---

## 3. The skill-label problem (and how to solve it)

ρ requires a "true skill" to correlate against. Options, best first:

- **A. Prior poker credential / track record.** Recruit across known tiers: verified online win-rate (bb/100 at known stakes), live results, recognized pros vs. recreational. The cleanest external label.
- **B. A standardized skill assessment.** Administer a short GTO-quiz / decision-quality test (independent of Yellow Jacket) to rank players before they play. Cheaper, noisier.
- **C. Within-pilot consistency (split-half).** Split each player's hands in two; rank by EV-loss on half A, validate on half B. Measures *reliability* of the skill metric without an external label (test-retest). Pair with A/B.
- **D. Seeded ringers.** Include a few known-strong and known-weak players as anchors to calibrate the scale.

Use **A + C** as the spine (external label + split-half reliability), with D as anchors.

---

## 4. Pilot design

- **Players:** target **N ≥ 60–100**, spanning the skill range (recruit deliberately across tiers per §3A; don't sample one homogeneous pool). More is better for the tail.
- **Volume:** target **≥ 1,000–3,000 graded hands per player** (the √N curve needs volume to separate adjacent tiers; H4/H5 both want it). Spread across multiple events/sessions so the *cut/sustainability* axes (H3) get exercised.
- **Format:** real Yellow Jacket heads-up + the cut-tournament/GC structure, **on the productized client** (the partner's Next.js/Nakama build — which is where humans actually play and where hand histories are captured server-authoritatively). The UI must expose the live leaderboard + cut lines if H5/positional is in scope.
- **Capture:** server-authoritative hand histories (the Nakama match handler already emits `OP_HOLE_RESULT` / `OP_ROUND_RESULT`; ensure full action+card logging per hand for grading). Per-seat redaction is fine for play; grading runs server-side on the full record.
- **Fairness/integrity:** the pilot doubles as a test of the detection stack — flag any RTA/collusion so it doesn't pollute the skill signal.

---

## 5. Measurement methodology

1. **Grade every hand** through the solver pipeline (`solveGTO` cache-backed + `OppModel` for ExploitCapture). Output per decision: EV-loss, brick outcome, exploit gain, position-loss.
2. **Aggregate per player:** mean EV-loss (bb/100), brick-discipline rate, survival depth, exploit gain, cumulative standing.
3. **Correlate vs the external skill label** (§3A) and report:
   - ρ(EV-loss, tier) — H1
   - ρ(brick-discipline, tier) — H2
   - ρ(survival, tier) — H3
   - **ρ(single-event outcome, tier)** — H4 (the headline: is it ≫ 0.05?)
   - **ρ(season standing, tier)** — H5 (the legal headline)
4. **Reliability:** split-half (§3C) — correlate each metric across two random halves of each player's hands. A high split-half ρ proves the metric is *measuring something stable*, independent of any label.
5. **The √N curve, on humans:** plot win-rate / ρ vs number of hands (1, 18, 72, 288, 1000+). This gives the *real human* "how few hands to distinguish skill" answer — the thing our bot curve (62% at 72 same-opp) only approximated.
6. **Decompose the variance:** how much of per-event score variance is (a) irreducible card luck vs (b) decision-quality (EV-loss + brick + sustainability)? This directly answers "how much of the 'noise' is actually skill."

---

## 6. Power / sample-size sanity

- To detect a per-event ρ = 0.25 at 80% power, α = 0.05: **N ≈ 100 players** suffices comfortably (and far fewer if the true ρ is higher). Recruit toward 60–100.
- To rank *adjacent* tiers reliably, volume per player matters more than headcount — the √N curve sets it. **Target ≥ 1–3k hands/player**; if adjacent tiers don't separate at that volume, that *itself* is the finding (skill needs the season aggregate, per H5).
- Pre-compute the detectable-effect-size table before recruiting; don't run underpowered.

---

## 7. What each outcome means

| Result | Interpretation | Action |
|---|---|---|
| H4 passes (single-event ρ ≫ 0.05) | the bots understated skill; the game is more skill-expressive per event than we measured | strengthen single-event skill claims (carefully); calibrate the rating |
| H4 fails, H5 passes | single events are variance (fine — drama), skill is in the aggregate | **confirms the GC/season legal posture: cash on the standing** (current design) |
| H2/H3 pass | discipline & sustainability are real, separating human skills | these become headline rating axes + marketing ("survive the cut") |
| Split-half high | the metrics are reliable regardless of labels | the rating measures *something real* — the core requirement |

**The pilot is designed so that *every* outcome is decision-useful** — it either raises the single-event skill claim or confirms the season-aggregate one, and either way it calibrates the rating and arms the legal opinion.

---

## 8. Legal relevance (why this is the evidence base)

A "contest of skill" defense (DFS / cycling-GC / golf-money-list precedent) is strongest with **empirical skill-predominance evidence on real players.** This pilot *is* that evidence:
- H5 (high season-aggregate ρ) is the load-bearing exhibit: it demonstrates the **prize-bearing contest (the standing) is skill-predominant.**
- H2/H3 (discipline & sustainability separate players) reinforce that outcomes track *decisions*, not chance.
- The split-half reliability shows the skill measure is stable, not noise-mining.
- **Keep the rule:** cash attaches to the *standing*, and the pilot measures the standing's skill-predominance. *Not legal advice — hand the pilot results to the per-state gaming attorney as the factual record.*

---

## 9. Instrumentation checklist (what must exist to run it)

- [ ] **Productized client** capturing full per-hand action+card histories (partner's Nakama build).
- [ ] **Solver grading pipeline** — `solveGTO` (cache-backed; `evByAction` ported ✓), `OppModel` ingestion from histories, `rolloutEV` (see `GRADER_PIPELINE_SCOPE.md` P-A2..A4).
- [ ] **Metric computation** — EV-loss, brick-discipline, survival, exploit, position-loss per player.
- [ ] **External skill labels** for ≥60–100 recruited players (§3A).
- [ ] **Cut-line / GC structure** in the pilot for H3/H5/positional.
- [ ] **Detection pass** to exclude RTA/collusion from the sample.
- [ ] **Pre-registered hypotheses + power table** locked before data.

---

## 10. Phases

1. **P-H1 — Instrument:** finish the grading pipeline (P-A2..A4) + per-hand capture in the client. *Blocking prerequisite.*
2. **P-H2 — Recruit & label:** 60–100 players across tiers, external labels (§3A), anchors (§3D).
3. **P-H3 — Run:** multi-session play to ≥1–3k hands/player through the cut/GC structure.
4. **P-H4 — Grade & analyze:** the metric stack (§5), against pre-registered hypotheses.
5. **P-H5 — Calibrate & report:** set the Hive Rating's real human calibration (EV-loss tiers, the axis weights), and produce the legal evidence packet.

---

## The one-line version
**Our bots can't make the human mistakes that are the skill, so they measured the floor of our tool and we mistook it for the game. This pilot measures the players — EV-loss, brick discipline, sustainability, exploitation — across a real cut/GC structure, and answers the only question that matters: how skill-determined is Yellow Jacket for actual humans? Run it; the evidence almost certainly comes back far above the bot floor — and it's also the factual record the legal posture needs.**

*Related: `GC_STRATEGY.md` (the Tour/GC architecture), `GRADER_PIPELINE_SCOPE.md` (the grading instrumentation), `exploit-capture-grader.md` (the ExploitCapture metric).*
