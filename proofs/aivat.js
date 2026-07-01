// aivat.js — AIVAT-style variance reduction for sample-efficient rating (Burch, Schmid, Moravčík,
// Bowling, AAAI 2018). It is an UNBIASED variance reducer (same expectation, lower variance) — it makes
// WEEKLY small-sample boards trustworthy; it CANNOT rescue a bad oracle (GRADER_INTEGRATION_SCOPE.md
// §2.3 / §6 #3). It tightens a GOOD oracle's estimate; the oracle's correctness is proven separately.
//
// THE CONSTRUCTION (control variate at the chance / known-strategy nodes):
//   We estimate a player's mean per-decision EV-loss  μ = E[L].  Decompose L by the dealt situation s
//   (the chance outcome — "which hand/board you drew") and the player's own (mixed) action a:
//       μ = E_s[ b(s) ],   b(s) = E_a[ L | s ]   (the ORACLE value-function baseline — exactly known).
//   AIVAT estimator over a sample:   μ̂_aivat = mean_i( L_i − b(s_i) ) + E_s[b(s)].
//   - UNBIASED:  E[L_i − b(s_i)] + E_s[b] = (μ − μ_b) + μ_b = μ  (the correction is mean-zero).
//   - VARIANCE:  Var(L − b(s)) = Var(L) − Var(b(s)) = E_s[ Var(L | s) ]  (law of total variance, since
//     b(s)=E[L|s] ⇒ Cov(L,b)=Var(b)). So AIVAT removes EXACTLY the "luck of the deal" component
//     Var_s(b(s)) and leaves only the player's own residual (action) variance. (Same principle at known-
//     strategy opponent nodes — integrate F analytically; identical control-variate form.)
//
// This is exactly why §5 said the exact enumerable grade is AIVAT's zero-variance LIMIT: if the player
// is deterministic given s, Var(L|s)=0 and AIVAT is exact.
'use strict';

// ===== a small, exactly-known grading model =====
// The DOMINANT variance in rating a player from a few hands is DEAL LUCK: which spots/difficulties the
// chance deal handed you. b[s] = the spot's expected per-decision EV-loss (its difficulty/leverage) and
// it varies a LOT across spots. The player's own per-spot grade noise σ is modest. AIVAT's baseline is
// exactly b[s] (the oracle value function), so the control variate removes the deal-luck variance.
const SPOT_B = [0.05, 0.20, 0.50, 1.00, 2.50, 4.00]; // per-spot expected EV-loss (deal-luck spread)
const PS = SPOT_B.map(() => 1 / SPOT_B.length);
const SIGMA = 0.6;                                    // player's idiosyncratic per-spot grade noise sd
function baseline() { return SPOT_B; }                // b(s) = oracle value-function baseline
function trueMu() { return SPOT_B.reduce((a, b, s) => a + PS[s] * b, 0); }

// mulberry32 — a good PRNG (the prior weak LCG biased the mean)
function mkRng(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(rng) { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function sampleSpot(rng) { let x = rng(), s = 0; for (; s < PS.length - 1; s++) { x -= PS[s]; if (x <= 0) break; } return s; }
// one graded decision: draw a spot (deal luck), realized EV-loss = b[s] + small idiosyncratic noise.
function gradeOneDecision(rng) { const s = sampleSpot(rng); return { s, L: SPOT_B[s] + SIGMA * gauss(rng) }; }

// ===== estimators over N decisions =====
function estimate(rng, N, beta = 0) {
  const b = baseline(), Eb = trueMu();
  let sumL = 0, sumCV = 0;
  for (let i = 0; i < N; i++) { const { s, L } = gradeOneDecision(rng); const Lb = L + beta; sumL += Lb; sumCV += (Lb - b[s]); }
  return { naive: sumL / N, aivat: sumCV / N + Eb };
}

// ===== stats over many trials =====
function moments(arr) { const n = arr.length, m = arr.reduce((a, b) => a + b, 0) / n; const v = arr.reduce((a, x) => a + (x - m) * (x - m), 0) / n; return { mean: m, var: v, sd: Math.sqrt(v) }; }

// ============================================================================
if (require.main === module) {
  console.log('AIVAT VARIANCE REDUCTION — unbiased, removes deal-luck variance, makes small-sample boards trustworthy\n');
  const mu = trueMu();
  console.log(`Model: ${SPOT_B.length} spots, expected-loss spread [${Math.min(...SPOT_B)}..${Math.max(...SPOT_B)}] (deal luck), per-spot grade noise σ=${SIGMA}. True mean EV-loss μ=${mu.toFixed(4)}.\n`);

  const N = 30;                           // a WEEKLY small sample (30 graded decisions)
  const TRIALS = 20000;
  const naive = [], aivat = [];
  const rng = mkRng(13579);
  for (let t = 0; t < TRIALS; t++) { const e = estimate(rng, N); naive.push(e.naive); aivat.push(e.aivat); }
  const mn = moments(naive), ma = moments(aivat);

  console.log(`Estimating μ from N=${N} decisions (weekly board), over ${TRIALS} trials:`);
  console.log(`   naive MC :  mean=${mn.mean.toFixed(4)}  sd=${mn.sd.toFixed(4)}`);
  console.log(`   AIVAT    :  mean=${ma.mean.toFixed(4)}  sd=${ma.sd.toFixed(4)}`);

  // theory: AIVAT removes the BETWEEN-spot (deal-luck) variance Var_s(b); residual is σ² per decision.
  const mb = trueMu();
  const varBetween = SPOT_B.reduce((a, b, s) => a + PS[s] * (b - mb) * (b - mb), 0);
  const varWithin = SIGMA * SIGMA;
  const varTotal = varBetween + varWithin;

  // ---- GATE A: both unbiased (means match the true μ) ----
  const gA = Math.abs(mn.mean - mu) < 0.01 && Math.abs(ma.mean - mu) < 0.01;
  console.log('\nGATE A (both estimators UNBIASED — same expectation):', gA ? 'PASS' : 'FAIL',
    `(naive μ̂=${mn.mean.toFixed(3)}, aivat μ̂=${ma.mean.toFixed(3)}, true μ=${mu.toFixed(3)})`);

  // ---- GATE B: AIVAT has strictly lower variance, matching theory (removes the BETWEEN-spot/deal-luck) ----
  const reduction = mn.var / ma.var;
  const theoryReduction = varTotal / varWithin;
  const gB = ma.var < mn.var && reduction > 1.5 && Math.abs(reduction - theoryReduction) / theoryReduction < 0.15;
  console.log('GATE B (AIVAT lower variance, matches theory = remove deal-luck):', gB ? 'PASS' : 'FAIL');
  console.log(`   variance  naive=${(mn.var).toExponential(2)}  aivat=${(ma.var).toExponential(2)}  →  ${reduction.toFixed(2)}× reduction  (theory ${theoryReduction.toFixed(2)}× : total ${varTotal.toFixed(3)} = deal-luck ${varBetween.toFixed(3)} + residual ${varWithin.toFixed(3)})`);

  // ---- GATE C: effective sample-size multiplier — AIVAT reaches a target SE in fewer hands ----
  // SE shrinks as 1/√N; variance ratio R ⇒ AIVAT needs N/R hands for the same SE.
  const effMult = reduction;
  const naiveHandsFor = (targetSE) => mn.var / (targetSE * targetSE);
  const aivatHandsFor = (targetSE) => ma.var / (targetSE * targetSE);
  const tSE = 0.10;
  const gC = aivatHandsFor(tSE) < naiveHandsFor(tSE) - 1e-9;
  console.log('GATE C (AIVAT reaches a target confidence in fewer graded hands):', gC ? 'PASS' : 'FAIL');
  console.log(`   to hit SE≤${tSE}: naive needs ~${Math.ceil(naiveHandsFor(tSE))} hands, AIVAT ~${Math.ceil(aivatHandsFor(tSE))} hands  (${effMult.toFixed(1)}× fewer → weekly boards become trustworthy)`);

  // ---- GATE D: AIVAT does NOT fix a biased oracle (honesty bound) ----
  // if the oracle's baseline is WRONG (biased by β), AIVAT stays unbiased w.r.t. the TRUE μ only when the
  // realized L uses the true model; a biased *grade* (wrong L) shifts BOTH estimators equally → AIVAT is
  // not a bias fix. Demonstrate: corrupt the grade by +β; both means shift by ~β.
  const beta = 0.5; const naiveB = [], aivatB = [];
  const rng2 = mkRng(2468);
  for (let t = 0; t < 8000; t++) { const e = estimate(rng2, N, beta); naiveB.push(e.naive); aivatB.push(e.aivat); }
  const shiftN = moments(naiveB).mean - mu, shiftA = moments(aivatB).mean - mu;
  const gD = Math.abs(shiftN - beta) < 0.05 && Math.abs(shiftA - beta) < 0.05;
  console.log('GATE D (AIVAT is variance-only — a biased grade shifts BOTH equally, AIVAT does NOT fix it):', gD ? 'PASS' : 'FAIL',
    `(both shift ≈+${beta}: naive +${shiftN.toFixed(2)}, aivat +${shiftA.toFixed(2)})`);

  const all = gA && gB && gC && gD;
  console.log('\n' + (all ? '✅ ALL AIVAT GATES PASS' : '❌ SOME GATES FAILED') + ' — unbiased, deal-luck removed, fewer hands per confidence, honestly variance-only.');
}

module.exports = { baseline, trueMu, estimate };
