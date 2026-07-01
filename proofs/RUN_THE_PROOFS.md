# Reproducible Proofs — run the claims yourself

Every module here is self-contained and prints its own **PASS/FAIL** correctness gates. This is what makes
the whole package trustworthy: the claims are *executable*, not asserted.

## How to run

1. Install [Node.js](https://nodejs.org) (any recent version; no packages to install — pure standard library).
2. In a terminal, from this folder:
   ```
   node kuhn-grader-gate.js
   node yj-full-loop.js
   ```
   …or any file below. Each prints its results and a final ✅/❌ line.

To run everything at once (macOS/Linux/Git-Bash):
```
for f in *.js; do echo "=== $f ==="; node "$f"; done
```

## What each proof establishes

**The grading method is correct (exact, no approximation):**
- `kuhn-grader-gate.js` — on a fully-solvable game, the optimal play grades exactly 0 and skill is ranked perfectly (ρ=1.0). This is the test most graders secretly fail.
- `yj-honeystroke-gate.js` — the same, now modeling Yellow Jacket's real rules (golf strokes + the brick ladder + tie-carry + matched-total betting).
- `yj-multistreet-gate.js` — the method survives a public card that changes the situation mid-hand.

**The Hold'em skill engine (v0):**
- `s1-abstraction-probe.js` — *measures* that standard poker abstractions throw away ~29% of the skill signal, and that our golf-class-aware design is required.
- `s2-oracle-subgame.js` — the engine is correct on real cards, and the compression is proven non-corrupting **byte-for-byte** against a ground-truth solution.
- `s3-solve-cache.js` — the offline solved-strategy cache is faithful and versioned (a rules change can't serve a stale grade).
- `s4-twostreet.js` — the whole thing on two-street real-card hold'em.

**Rating, integrity, economy:**
- `rating-engine.js` — the "Yellow Jacket Score": pays only on *proven* skill (a volume floor), and a lucky newcomer can't leapfrog a veteran.
- `sealing.js` — the sealed ledger: a grade is confidential until reveal, and a forged grade **fails to recompute from the public record**.
- `crypto-hardening.js` — production crypto: a unique, publicly-verifiable VRF (the operator can't rig the randomness) + threshold key custody (no single party holds the secret).
- `aivat.js` — an unbiased statistical technique that makes small (weekly) leaderboards trustworthy.
- `coverage.js` — the grade is defined for **every** real hand across the full 52-card deck.
- `cache-at-scale.js` — the production serving layer: sharded, versioned, fast, rebuildable.
- `economy-runner.js` — a full payout run: the money is conserved to the cent, gated on skill, and solvent.
- `competition-and-payouts.js` — **the two-basis economy proven.** Single events are decided by the day's
  *score* (a real sport — the best player wins only ~19% of events, upsets are common); the long-term
  leaderboard is decided by the *skill grade* aggregated weekly/monthly/annual (correlation with skill
  sharpens 0.82→0.98→1.00), so the wage reaches the truly skilled and carries the great player who ran
  cold. Self-funded by entries; sponsor purses add on top.
- `exploit-capture.js` — the exploitation / anti-bot "shadow" metric.

**The whole system, together:**
- `yj-full-loop.js` — **the capstone.** Graded → sealed → verified → rated → anti-cheat → paid, on a
  synthetic population: solver-bots are caught and excluded, the money leader is a human, and grading
  decisions is shown to be ~19× less noisy than grading chips.

**Readiness to test on real humans:**
- `pilot-harness.js` — the pre-registered statistics battery (skill separation, reliability, sample-size
  power), validated on ground truth so it produces **no false signal** before it ever touches real data.

**Supporting engines:** `treasury-curve.js` (payout shape), `overlay-ramp.js` (launch funding).
**Artifact:** `yj-oracle-cache.v0.json` — a real serialized solve-cache.

---

*Total: ~21 modules, ~76 automated gates, all passing. If a claim in the documents matters to you, the
proof for it is here — run it.*
