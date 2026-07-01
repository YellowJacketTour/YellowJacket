# YJ AI Engine — Solo, Self-Funded Roadmap (12 Weeks)

**Goal.** Replace the current myopic decision engine (which the v69.129 transcript proves can be bullied by consistent moderate pressure) with a match-aware engine that prices the Yellow Jacket stroke economy correctly and resists the "consistent c-bet → opponent folds → +1 stroke / hole" exploit.

**Constraint.** Zero third-party spend. No cloud training, no paid APIs, no contractors. Everything in this plan runs on hardware the developer already owns, with open-source tools.

**Approach.** Don't go full ReBeL day one. Go in three escalating tiers and stop as soon as the bot stops being exploitable. Most projects in this space waste effort by skipping the cheap fix.

---

## 0. The honest framing

State-of-the-art poker AI (ReBeL, Pluribus, AlphaHoldem) was trained on hundreds of GPU-years across a corporate cluster. You will not, alone, replicate that for Yellow Jacket — and **you don't need to**. Yellow Jacket is a heads-up game with a discrete action space (the engine caps bets at a pot-elastic ceiling, so the legal-amount set per street is small), a simple game tree relative to no-limit hold'em, and most importantly a *known closed-form scoring system* (the honey-stroke ladder). That closed-form scoring lets you cheat: you can compute the long-term objective analytically inside the value function instead of having to learn it from millions of samples.

What you actually need is **a match-aware value function plus enough self-play to break the current myopia**. The full ReBeL-style online search is the *capstone*, not the prerequisite.

The plan below is structured so each tier ships a usable engine. If Tier 1 is good enough, you stop. If Tier 2 is good enough, you stop. Tier 3 is there if you want SOTA.

---

## 1. Tools — everything is free and runs locally

| Tool | Version | Role | Cost |
|---|---|---|---|
| **Python 3.11+** | latest | host language for trainer | free |
| **PyTorch** | 2.x with CUDA | neural nets | free, runs on whatever GPU you have |
| **OpenSpiel** (DeepMind) | latest from GitHub | game framework, has Deep CFR + CFR reference impls | free |
| **NumPy / SciPy** | latest | math | free |
| **ONNX + onnxruntime-web** | latest | export trained model for browser inference | free |
| **Your existing JS engine** | YJ v69.129 | oracle for game-rule conformance tests | free |

**Hardware floor.** Any machine with a discrete GPU made in the last 5 years (8GB VRAM is enough for the model sizes in this plan). If you only have a CPU, every training phase still works — just multiply the wall-clock numbers by ~10×.

**Free GPU supplements (optional, no signup spend).** Kaggle Notebooks give 30 hr/week of free T4 or P100. Google Colab free tier gives ~12 hr/day on a T4. Either can host the long training runs in Tier 2/3 if your local GPU is small. *No payment required.* I list them as supplements only — the plan does not depend on them.

---

## 2. Tier 1 — Stroke-aware myopic engine (Weeks 1–2)

**Hypothesis.** The current bot folds too much because its value function is `expected_pot_chips`, with no awareness that every fold is +1 stroke and a 72-hole match accumulates those folds into a structural loss. Add a stroke-cost term to the EV calculation, and a fold-frequency-aware defense widener. No machine learning yet — just better economics.

### Deliverables

1. **`decideFor` rewrite** in `index.html`. New value function:
   ```
   V(action) = EV_pot(action)
             - λ_fold · P(fold-this-hole | action) · stroke_cost(state)
             + λ_defense · defense_bonus(action, recent_fold_rate)
   ```
   - `stroke_cost(state)` = the YJ-specific stroke price for losing this hole at the current pot size, scaled by `holes_remaining / total_holes` (early-match folds cost more in compounded match score because they're paid more times).
   - `P(fold | action)` = a cheap closed-form estimate per action class. For `check`: ≈0 (you don't lose by checking). For `call`: 0. For `bet/raise size = s`: a logistic in `s / pot` calibrated to current opponent's recent fold rate. The bot already tracks opponent action history in `c.actions[]` — feed it in.
   - `defense_bonus` widens calling range when `recent_fold_rate < 0.3` (opponent isn't folding much → calls should be wider; pot-odds-only) OR when `bot_recent_fold_rate > 0.65` (bot has been folding too much → fold equity is dead, defend more).
2. **Knob exposure** in the Simulator view: λ_fold, λ_defense, fold-rate window size. Lets you tune by hand against the elite tier and against a scripted bully.
3. **Scripted-bully test rig**: a deterministic AI tier ("`tester-bully`") that c-bets every flop and small-3-bets every preflop limp. The current elite tier loses to this; the Tier-1 elite tier must not.
4. **Smoke tests**: 200 deterministic 72-hole solo runs against the bully at each λ setting; report mean p1_total, mean fold rate, mean stroke accumulation curve.

### Compute budget

**0 hours of training.** This is pure JS code + parameter sweeps. Everything runs in the browser on the existing engine. The "training" is a manual grid search over (λ_fold, λ_defense) by replaying the 200 sims and picking the best.

### Go/no-go gate

**Pass:** Tier-1 elite tier loses ≤ 8 strokes net to the scripted bully over a 72-hole match (current elite loses ~70+, per your transcript: 63 strokes given up at p2, 6 won at p1 → net 57-stroke deficit).

**Fail:** Bully still wins by 30+ strokes. Move to Tier 2.

**Expected outcome.** Tier 1 closes ~60–80% of the bullying gap. It does NOT close the gap against a *strong human who mixes pressure with strong-hand traps* — that's what Tier 2 is for.

---

## 3. Tier 2 — Deep CFR blueprint with match-aware rewards (Weeks 3–8)

**Hypothesis.** Closed-form economics buy you correct *aggregate* behavior but can't learn the game tree's mixed-strategy nuances (bluff frequencies, calling ranges by board texture, etc.). For those, you need a real solver. Deep CFR is the well-understood single-machine option.

The novel piece is the **reward**: instead of "pot chips at hand end" you optimize "final match score after 72 holes." This is where the YJ-specific economics get embedded in the policy, not just the EV calculation.

### Stage 2A — Port YJ rules to OpenSpiel (Weeks 3–4)

OpenSpiel's [`pyspiel.Game`](https://github.com/deepmind/open_spiel) interface needs a `YellowJacket` subclass.

**Critical correctness requirement:** the port must match the **canonical scoring spec — RULES.md §7 plus `golfScoreFromHandValue`** — on hand evaluation, golf scoring, honey accumulation, stroke ladder, and fold settlement. RULES.md §7 + `golfScoreFromHandValue` are the source of truth (an older "Schema 0" was stale); the conformance suite should assert that **both** the JS engine and the Python port match RULES.md §7, not merely match each other. Otherwise the trained policy will not transfer to the JS app. Build a conformance test harness:

1. Generate 10,000 random YJ holes via the JS engine. Capture `(deal, action_sequence, expected_p1Golf, expected_p2Golf, expected_p1Honey, expected_p2Honey)`.
2. Replay each through the Python port. Assert bit-identity on all four outputs.
3. CI gate: any divergence fails the build.

This is the highest-risk step in the entire roadmap. Budget two weeks. The JS engine has accumulated 69 versions of fixes (loser-bogey toggle, brick-penalty modes, brick-loss-cap, high-card-showdown-loss, honey-cap modes); each needs to be ported correctly.

**Deliverables:**
- `yj/game.py` — OpenSpiel `Game` + `State` subclasses
- `yj/conformance_test.py` — JS→Python conformance suite, 10K cases, CI-gated
- `yj/abstraction.py` — discretization of bet sizes into a fixed action vocabulary (probably 6–8 sizes: min-bet, 0.33×pot, 0.5×pot, 0.75×pot, 1×pot, 1.5×pot, all-in)

### Stage 2B — Deep CFR training with match rewards (Weeks 5–7)

OpenSpiel ships a reference Deep CFR implementation. Wire it up with a custom reward:

```python
def match_reward(trajectory):
    # trajectory = list of 72 hole outcomes
    p1_golf = sum(h.p1Golf for h in trajectory)
    p2_golf = sum(h.p2Golf for h in trajectory)
    p1_honey = sum(h.p1Honey for h in trajectory) / honey_divisor
    p2_honey = sum(h.p2Honey for h in trajectory) / honey_divisor
    p1_final = p1_golf - p1_honey
    p2_final = p2_golf - p2_honey
    # Symmetric, zero-sum, scaled into [-1, 1] for CFR stability:
    # Use the SAME round-length-aware honey_divisor here, not a hardcoded 36.0.
    # Per RULES.md §7, the divisor follows the 36/9/4/1 ladder by round length
    # (72/18/9/<9 holes); a literal 36.0 silently mis-scales non-72-hole training.
    return tanh((p2_final - p1_final) / honey_divisor)
```

This is the key innovation. Every gradient step now optimizes *final match score*, not pot chips. The folder/caller frequencies the network learns will price the stroke ladder correctly because that ladder is in the loss function.

**Training loop:**
- Self-play traversals: 200K–500K iterations
- Network: 4-layer MLP, ~256 width, ~2MB on disk after FP16 quantization (small enough to inline in `index.html` as base64)
- Wall-clock on a single RTX 3060 (8GB): ~80–150 hours. Spread over 2 weeks of overnight + weekend runs. **On Kaggle T4 free tier: ~40–80 hours, fits in 30 hr/week budget over 2 weeks.**

**Deliverables:**
- `yj/train_deepcfr.py` — training loop
- `models/yj_deepcfr_v1.onnx` — exported model
- `yj/eval.py` — exploitability + head-to-head vs Tier-1 + vs scripted bully

### Stage 2C — Browser integration (Week 8)

The trained ONNX model needs to run inside `index.html` without breaking the single-file constraint.

**Options:**
1. **`onnxruntime-web` CDN** (~2MB runtime, pinned + SRI'd). Pros: standard, fast. Cons: another CDN dependency, breaks the offline story slightly.
2. **Hand-coded matmul in JS** (no runtime, model weights inlined as base64 JSON ~2MB). Pros: zero deps, fully offline. Cons: ~3 days of work, slower inference (still fast enough for one decision per ~50ms).

Recommendation: **Option 2** for the YJ aesthetic ("single file, offline, secure" per the splash screen). The matmul code is a one-time write.

**Deliverables:**
- `js/yj_inference.js` (inlined into `index.html` as a `<script>` block) — pure-JS inference, ~200 lines
- Model weights base64-encoded in a `const YJ_AI_WEIGHTS_V1 = "..."` constant
- `decideFor` reroutes through the neural policy when "Neural" tier is selected; falls back to Tier-1 stroke-aware engine if model fails to load

### Go/no-go gate

**Pass:** Tier-2 neural policy beats Tier-1 stroke-aware engine by ≥5 strokes / 72-hole match, AND beats the scripted bully by ≥10 strokes, AND has measurable exploitability ≤ 50 mbb/100 (OpenSpiel reports this directly).

**Fail:** Stop and diagnose. The most likely failure mode is the conformance suite (Stage 2A) having missed some YJ scoring rule.

---

## 4. Tier 3 — ReBeL-style online search (Weeks 9–12)

**Hypothesis.** Even a well-trained Deep CFR policy plays the *blueprint*. At decision time, augmenting that blueprint with a **depth-limited search** over the current situation, evaluated by the same match-aware value function, can squeeze another ~30–50% reduction in exploitability. This is the ReBeL architecture.

This is the optional capstone. Many production poker bots ship without it because the gains are marginal vs. the engineering cost.

### Deliverables

1. **`yj/search.py`** — depth-limited subgame solver. At decision time, walk forward 1–2 streets, evaluate leaves with the Tier-2 value head, run a localized CFR solve over the resulting subgame (~1000 iterations), use the resulting policy at the root.
2. **JS integration**: the same matmul code from Stage 2C, called many times per decision. Budget: ~200ms per decision is acceptable UX.
3. **Eval**: Tier-3 vs Tier-2 head-to-head, exploitability measurement.

### Compute budget

**Inference-time only.** No additional training. The search uses the Tier-2 model as the leaf evaluator. Adds ~150ms latency per decision in the browser.

### Go/no-go gate

**Pass:** Tier-3 beats Tier-2 by ≥3 strokes / match AND has exploitability ≤ 25 mbb/100.

**Likely outcome.** Tier 3 is genuinely SOTA. It will play near the limits of what a determined human can exploit on a fixed strategy. The remaining attack surface is opponent-specific exploitation (dynamic adjustment to playing styles), which is **Tier 4 territory** and explicitly out of scope here.

---

## 5. Repo layout

```
yj-ai/
├── README.md              — start-here
├── pyproject.toml         — pinned deps (open_spiel, torch, onnx, numpy)
├── yj/
│   ├── __init__.py
│   ├── game.py            — OpenSpiel YellowJacket port (Stage 2A)
│   ├── abstraction.py     — bet-size discretization
│   ├── conformance_test.py — JS↔Python equivalence harness (Stage 2A)
│   ├── train_deepcfr.py   — Deep CFR training loop (Stage 2B)
│   ├── search.py          — depth-limited subgame solver (Tier 3)
│   ├── eval.py            — exploitability + head-to-head
│   └── export.py          — ONNX → JS-readable JSON weights
├── models/
│   ├── yj_deepcfr_v1.onnx
│   └── yj_deepcfr_v1.weights.json  — base64-ready for browser
├── js/
│   ├── yj_inference.js    — pure-JS matmul inference (Stage 2C)
│   └── yj_search.js       — JS port of search.py (Tier 3, optional)
└── notebooks/
    ├── conformance.ipynb  — interactive JS↔Python diff inspector
    └── training_curves.ipynb
```

Everything in `yj/` and `js/` is plain text and version-controllable. The model weights are deterministic given a fixed seed, so they're reproducible but you check the trained `.onnx` into the repo (a few MB).

---

## 6. The five things that will go wrong

Honest pre-mortem so you don't get blindsided.

1. **The conformance suite (Stage 2A) will discover bugs in the JS engine.** Every poker AI port surfaces edge cases — a corner case in the brick-penalty mode, an off-by-one in honey-divisor selection. Budget time to reconcile both implementations against RULES.md §7 + `golfScoreFromHandValue` (the source of truth) rather than pinning the Python to JS behavior including bugs — baking a stale-schema or buggy scoring rule into the trained policy makes it ground truth. **Decision rule: where JS diverges from RULES.md §7, fix the JS to match the canon and re-run the conformance suite; only pin to existing JS behavior when RULES.md §7 is genuinely silent on the case.**
2. **Training will diverge.** Deep CFR on novel reward functions is finicky. The `tanh` reward scaling is the usual fix; if it diverges anyway, reduce `λ_match_reward` and add a small chip-EV term as a warm-start. Plan for 2–3 restart cycles.
3. **The model will overfit to self-play and lose to a creative human.** Mitigation: during the last 20% of training, sample opponents from a *fixed pool* that includes (a) the Tier-1 stroke-aware engine, (b) the scripted bully, (c) a "calling station" (calls anything ≤ pot), (d) a "rock" (only plays premiums). Forces the policy to play robustly across styles.
4. **Browser inference will be too slow.** If a single forward pass takes >100ms in JS, quantize the model to int8 and use lookup tables. Worst case, ship the model as a service worker. Last resort: keep Tier 3's search server-side (which violates the no-spend constraint — so stop at Tier 2 if this happens).
5. **You'll be tempted to skip the conformance suite.** Don't. The 4-hour shortcut becomes a 4-week debugging quagmire when the trained policy plays moves that work in Python but score differently in JS.

---

## 7. Decision points

After **Tier 1 (week 2):** Stop and evaluate. If the bullying problem is solved well enough for your use case, you're done. Total cost: 2 weeks of your time, $0.

After **Tier 2 (week 8):** Stop and evaluate. If the neural policy holds up against humans in casual play, you're done. Total cost: 8 weeks, $0.

After **Tier 3 (week 12):** You have a SOTA YJ AI. Total cost: 12 weeks, $0.

---

## 8. What this plan deliberately does NOT do

- **No cloud training.** Wall-clock multiplies, but it works.
- **No hiring.** Single developer with PyTorch + a GPU.
- **No partner-server dependency.** The AI lives in `index.html` like everything else.
- **No real-money or competitive-play targeting.** This is for *casual play depth*, not for an online tournament environment that would need anti-collusion, identity, and the partner-server stack you've already noted is out of scope for YJSacred.
- **No opponent-specific exploitation.** A SOTA bot that *adapts* to a specific human's tells is a different (and harder) problem. This plan delivers a strong, robust, non-exploitable equilibrium-ish player. That's the right target for a single-player solo opponent.

---

## 9. First-day actions

If you're starting today:

1. `mkdir yj-ai && cd yj-ai && git init`
2. Install Python 3.11, create a venv.
3. `pip install open_spiel torch numpy onnx onnxruntime`
4. Read OpenSpiel's [Deep CFR tutorial](https://github.com/deepmind/open_spiel/blob/master/docs/intro.md) — 90 minutes.
5. Open `index.html`, locate `decideFor` (search "function decideFor"), `playBettingRound`, `applyCashAction`, and the scoring functions (`golfScoreFromHandValue`, `golfScoresFromShowdown`, `honeyDivisorFor`, brick-penalty logic). These are the surfaces the Python port must mirror — but the canonical oracle is **RULES.md §7 + `golfScoreFromHandValue`**, which both the JS engine and the port must conform to.
6. Begin Tier 1 immediately — it requires zero new infrastructure and gives you the quick-win data point on whether myopia really is the dominant failure mode.

---

*The roadmap stops here. Total wall-clock: 12 weeks part-time. Total cash spend: $0. Hardware: a single consumer GPU you already own. Resulting engine: somewhere between "robust mid-stakes pro" (Tier 2) and "near-Nash equilibrium" (Tier 3) on the YJ-specific game tree, with the stroke economy embedded in the value function rather than bolted on as an afterthought.*
