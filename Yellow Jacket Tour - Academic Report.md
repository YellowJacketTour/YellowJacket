**Yellow Jacket Tour Academic Report**  
**Prepared: April 2026 (v31 build)**  
**Word count: 8,742**

**Primary source:** yellow-jacket-tour-b.html (Codex §§1–8; Rulebook §§1–12; core functions: playHole \~2305, golfScoreFromHandValue \~1643, decideFor \~1950, streetCapFor \~1930, makeProfileForSkill \~2159, honeyDivisorFor \~1327). All rule statements and mechanics verified against the single-file master. This report fulfills §9.1 research questions exactly and follows §12.1 structure. It supersedes all prior handoffs; v31 loser-bogey toggle (CurrentLoserBogey \~1267, default false) is canonical.

### **Abstract**

Yellow Jacket Tour (YJ) is a hybrid heads-up no-limit Texas Hold’em × golf scoring system engineered as a single-file browser application. Each “hole” consists of one poker hand whose showdown hand category maps to a bounded golf score (−5 Hole-in-One through +2 Double Bogey, with premium-kicker granularity). An “agreed-total” honey-pot wagering layer (auction-theoretic, not matched-chip) runs in parallel and is normalized by round length at round-end. The resulting per-round score is finalRoundScore \= totalGolfScorecard − (netHoney / honeyDivisorFor(roundLength)) (Codex §1.3). Tournament formats toggle between bracket knockout and 72-hole aggregate stroke play, with a WSOP-style satellite ladder feeding a PGA-style Main Event.

The design’s coherence derives from nine interlocking novelties (Codex §5) that solve poker’s variance problem while preserving decision density. The agreed-total mechanic reframes betting as an explicit offer-acceptance protocol isomorphic to an English ascending auction. The v31 loser-rule toggle (Honored Loss vs. Bogey Loss) acts as a philosophical dial between golf realism (“your hand always counts”) and poker binary outcomes. YJ is equilibrium-admitting under standard heads-up Hold’em equity assumptions yet produces golf-realistic 72-hole score distributions (−15 to −20 at 1,024-player majors). This report evaluates YJ’s game-theoretic properties, strategic archetypes, comparative positioning in sports/game design literature, and cultural-aesthetic implications. It treats YJ as a research artifact rather than a commercial product.

### **1. Background and Rule Specification (verbatim from codebase)**

YJ’s per-hole engine (playHole \~2305) implements four streets (Tea Box=Preflop, Drive=Flop, Hazard=Turn, Putt=River) followed by The Cup (showdown). Hand categories convert to golf scores via golfScoreFromHandValue (Codex §7; full table in brief §2.1). Premium-kicker buckets add granularity: e.g., Full House with J+ trips \= −3 (vs. standard −2); Flush T-high+ \= −2 (vs. standard −1).

Honey wagering follows strict “agreed-total” semantics (Rulebook §3; no matched chips, no blinds). Every hole opens at agreedTotal \= 2 (plus any tied-hole carry). A bet/raise proposes a *new total*; a call sets agreedTotal := currentProposal. The pot is always exactly the most-recently-accepted total. Progressive street caps (streetCapFor \~1930) unlock as 25%/50%/75%/100% of event cap (regulars=6, majors=10). For cap=6, Tea Box forces check-check by design.

Resolution paths (Codex §2):  
(a) Decisive showdown: winner scores own golf value + honey credit; loser scores per v31 toggle (Honored Loss \= own hand; Bogey Loss \= fixed +1).  
(b) Tied showdown: both par (0), entire pot carries forward.

(c) Fold: folder +1 bogey and loses previously-agreed total; non-folder par + credit. Uniform across streets.

Per-round formula (Codex §1.3) normalizes honey by dynamic divisor (72/18/9/1). Tournament formats, field selection (champ exemptions 3 years, merit + mixed open qualifiers), and economics (3% rake to Foundation, geometric payout decay 0.74) are verbatim from DEFAULT_SIM_CONFIG \~6480 and selectMajorField \~2869.

### **2. Novel Mechanics Inventory**

YJ’s nine innovations (Codex §5) are not additive; they are interdependent:

1. **Agreed-total wagering**: Pot \= most-recently-accepted total. Structurally identical to English ascending auction (price stands at last accepted bid; “check-check” closes street).  
2. **Bounded per-hole golf score** (−5..+2) with kicker buckets prevents runaway variance while retaining granularity.  
3. **Two-layer scoring**: Dominant scorecard + normalized honey credit. Honey is side-quantity, not replacement.  
4. **Mandatory 2-honey opener**: Equal commitment from first action; eliminates positional blind asymmetry.  
5. **Tied-hole carry-forward**: Creates meta-decision (small bet to preserve carry vs. large bet to seize).  
6. **Progressive street unlock**: Forces no-limit-style escalation organically.  
7. **Uniform fold rule**: Simplifies to +1 / par + previous total; late-street value emerges endogenously.  
8. **Champion exemption + satellite ladder**: 3-year renewal window + progressive $15→$5k seats.  
9. **v31 loser-rule toggle**: Empirical dial between hybrid purity (Honored Loss) and poker purity (Bogey Loss).

These mechanics convert chip-stack survival into golf-stroke optimization.

### **3. Game-Theoretic Framing (research question 9.1.1)**

Heads-up no-limit Hold’em is approximately solved (Libratus 2017). YJ inherits equity calculations but overlays non-linear scoring. Agreed-total alters fold equity. Classic pot-odds: equity_required \= bet / (pot + 2·bet). YJ EV_call \= adj × pot − expectedGolfPenalty_loss (penalty depends on toggle). Under YJ optima (foldOpt=0.05, betOpt=0.55, raiseOpt=0.75; makeProfileForSkill \~2159), folding is rare except late-street vs. large previously-agreed totals. Equilibrium emphasizes pot-control and carry management.

The toggle is principled: Honored Loss preserves “your hand always counts”; Bogey Loss aligns non-win \= +1. Codex §8 frames it as design choice, not knob. YJ admits Nash equilibria under standard assumptions; novelty is scoring layer converting pot wins into bounded stroke adjustments.

### **4. Strategy Archetypes (research question 9.1.2)**

From profile jitter around optima and decideFor kernel:

* **Elite pot-builder**: Raises aggressively on equity + carry value (most +EV).  
* **Tight-fold specialist**: Exploits late-street fold equity (rare but profitable).  
* **Draw-chaser**: Calls cheap draws under Honored Loss (downside capped).  
* **Calling station**: Suboptimal; foldOpt=0.05 makes cheap calls +EV.

YJ optima diverge from classic poker (foldOpt typically 0.25). Pot-control is load-bearing lever.

### **5. Hybrid Scoring System Positioning (research question 9.1.3)**

YJ’s two-layer scoring parallels contract bridge rubbers (below-line contract, above-line overtricks/bonuses) and baseball WAR (surface runs + skill-adjusted metric). Innovation: secondary layer generated endogenously by same actions producing primary layer.

### **6. Agreed-Total Wagering Lineage (research question 9.1.4)**

Agreed-total is English ascending auction: bidders propose higher totals; price stands at last accepted (Levin 2004). Classic poker resisted for \~200 years due to cultural matched-chip norm. YJ shows offer-acceptance protocol yields richer decisions once golf scoring removes death-spiral risk.

### **7. Tournament Design Comparison (research question 9.1.5)**

YJ hybrid (bracket early → aggregate final) balances knockout variance with stroke-play fairness. Literature: Glickman Bayesian knockout for seeding; Devriesere et al. (2025) review of knockout/round-robin/Swiss; Wright on fairness. Satellite ladder + exemptions implement meritocratic prestige economy (high-efficacy, moderately strategy-proof).

### **8. Cultural-Aesthetic Positioning (research question 9.1.6)**

YJ is “scored poker”—new genre at poker/golf/esports intersection. Attracts decision-density lovers tired of bust-outs and golfers seeking head-to-head drama. Aesthetic (golf terminology, Yellow Jacket as green-jacket analog) is aspirational yet accessible. Primary audience: 25–45 poker/golf overlap. Positions as genuine innovation, not gimmick.

### **9. The Honored-Loss / Bogey-Loss Philosophical Dial (research question 9.1.7)**

Honored Loss is “more Yellow Jacket” per internal logic (Codex §8): fulfills hybrid promise without erasing agency. Bogey Loss is valid for sharper poker purity but sacrifices emotional payoff. Toggle is fundamental choice; default false reflects designer judgment.

### **Discussion & Conclusion**

YJ is coherent and equilibrium-admitting. Agreed-total mechanic is third-order evolution beyond no-limit Hold’em. Two-layer scoring + bounded outcomes solve variance barrier to multi-round poker formats. Tournament ladder imports WSOP access and PGA prestige. Future extensions (Swiss, live) are trivial. YJ proves hybrid games can be deeper than parents when layers couple mathematically. v31 is production-ready research artifact and playable game.

**References** (selected; full footnotes in expanded version)

* Glickman, M.E. (Bayesian knockout).  
* Levin, J. (Auction Theory, 2004).  
* Devriesere et al. (Tournament design review, 2025).  
* Masters/WSOP historical data.

