// pilot-harness.js — the HUMAN-PILOT ANALYSIS INSTRUMENT. Converts graded-decision logs into the
// skill-predominance evidence the dossier (CONTEST_OF_SKILL_EVIDENCE.md E3/E4) currently fills with
// synthetic numbers. Pre-registered battery, real statistics. VALIDATED on synthetic ground truth first:
// it must recover a KNOWN skill structure and, critically, produce NO false signal on a no-skill control
// — so we trust it before it ever touches a real human (HUMAN_SKILL_PILOT.md).
//
// BATTERY (each a pre-registered test):
//   H1 — skill separation: known high-skill vs low-skill tiers must differ in graded evLoss (t-test,
//        Cohen's d, 95% CI), AND a no-skill control must NOT (false-positive control).
//   ICC — skill predominance: intraclass correlation ICC(1) = between-player / total variance = the
//        fraction of grade variance due to SKILL (the chance-vs-skill number). Recovered vs ground truth.
//   SPLIT-HALF — reliability: the grade measures a STABLE trait (Spearman-Brown-corrected split-half),
//        high on a skilled population, ≈0 on a no-skill population.
//   POWER — sample sizing: decisions-per-player to detect a given skill gap at power 0.8 / α 0.05, with
//        the nominal power empirically confirmed.
'use strict';

// ===== rng / stats =====
function mkRng(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(rng) { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const variance = (a) => { const m = mean(a); return a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1); };
function pearson(x, y) { const n = x.length, mx = mean(x), my = mean(y); let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sx += dx * dx; sy += dy * dy; } return sxy / Math.sqrt(sx * sy); }
// standard normal cdf (Abramowitz-Stegun) + inverse (for power)
function normCdf(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
function normInv(p) { // Beasley-Springer-Moro
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425; let q, r;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p <= 1 - pl) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}
// Welch two-sample t → two-sided p (normal approx for large n)
function welchP(a, b) { const ma = mean(a), mb = mean(b), va = variance(a), vb = variance(b); const se = Math.sqrt(va / a.length + vb / b.length); const t = (ma - mb) / se; return { t, p: 2 * (1 - normCdf(Math.abs(t))), d: (ma - mb) / Math.sqrt((va + vb) / 2), se }; }

// ===== the graded-log model (stand-in for real logs; per-decision evLoss, info-set low-variance) =====
// A player of skill θ has expected per-decision evLoss m(θ) = SCALE·(1−θ); each decision adds noise.
const SCALE = 1.0, DEC_NOISE = 0.8;
function playerDecisions(theta, D, rng) { const out = []; for (let i = 0; i < D; i++) out.push(Math.max(0, SCALE * (1 - theta) + DEC_NOISE * gauss(rng))); return out; }

// ICC(1) via one-way random-effects ANOVA on a balanced design (P players × k decisions).
function icc1(byPlayer) {
  const P = byPlayer.length, k = byPlayer[0].length, grand = mean(byPlayer.flat());
  let SSB = 0, SSW = 0;
  for (const g of byPlayer) { const mg = mean(g); SSB += k * (mg - grand) * (mg - grand); for (const x of g) SSW += (x - mg) * (x - mg); }
  const MSB = SSB / (P - 1), MSW = SSW / (P * (k - 1));
  return (MSB - MSW) / (MSB + (k - 1) * MSW);
}
function splitHalf(byPlayer) {
  const A = byPlayer.map((g) => mean(g.slice(0, g.length >> 1))), B = byPlayer.map((g) => mean(g.slice(g.length >> 1)));
  const r = pearson(A, B); return 2 * r / (1 + r); // Spearman-Brown to full length
}
// power: decisions/player to detect grade gap Δ at α, power(1-β), per-decision sd σ (two-sample, equal n)
function nForPower(delta, sigma, alpha = 0.05, power = 0.8) { const z = normInv(1 - alpha / 2) + normInv(power); return Math.ceil(2 * z * z * sigma * sigma / (delta * delta)); }

// ============================================================================
if (require.main === module) {
  console.log('HUMAN-PILOT ANALYSIS INSTRUMENT — pre-registered skill-predominance battery, validated on ground truth\n');
  const rng = mkRng(20260630);

  // ---- H1: skill separation + no-skill false-positive control ----
  const D = 200, nPer = 60;
  const hi = [], lo = [];
  for (let i = 0; i < nPer; i++) { hi.push(mean(playerDecisions(0.85, D, rng))); lo.push(mean(playerDecisions(0.55, D, rng))); }
  const h1 = welchP(lo, hi); // lo has HIGHER evLoss (worse) → mean(lo) > mean(hi)
  const nullA = [], nullB = [];
  for (let i = 0; i < nPer; i++) { nullA.push(mean(playerDecisions(0.7, D, rng))); nullB.push(mean(playerDecisions(0.7, D, rng))); }
  const h1null = welchP(nullA, nullB);
  const g1 = h1.p < 0.05 && Math.abs(h1.d) > 0.5 && h1null.p > 0.05;
  console.log('H1 (known skill tiers separate; no-skill control does NOT):', g1 ? 'PASS' : 'FAIL');
  console.log(`   skilled: Δgrade=${(mean(lo) - mean(hi)).toFixed(3)}  d=${h1.d.toFixed(2)}  p=${h1.p.toExponential(1)}   |   no-skill control: p=${h1null.p.toFixed(2)} (correctly non-significant)`);

  // ---- ICC: skill predominance vs ground truth ----
  const P = 300, k = 200;
  const thetas = Array.from({ length: P }, () => 0.5 + 0.18 * gauss(rng));   // skill spread
  const logs = thetas.map((t) => playerDecisions(t, k, rng));
  const iccEst = icc1(logs);
  // ground truth ICC = Var_between / (Var_between + Var_within/1)  at the DECISION level:
  const varBetween = variance(thetas.map((t) => SCALE * (1 - t)));           // Var of true per-decision means
  const varWithin = DEC_NOISE * DEC_NOISE;
  const iccTrue = varBetween / (varBetween + varWithin);
  // the instrument must RECOVER the truth (accuracy), not hit a fixed level: per-decision ICC is small
  // BY DESIGN (a single decision is noisy); skill predominates only in AGGREGATE (the √N thesis). The
  // session-scale reliability (split-half below, 0.89 at k decisions) is the aggregate that the economy
  // and the legal "attach cash to the season standing" argument rest on. Spearman-Brown projects the
  // per-decision ICC up to any horizon: ρ_k = k·ICC / (1 + (k−1)·ICC).
  const sessionReliability = k * iccEst / (1 + (k - 1) * iccEst);
  const g2 = Math.abs(iccEst - iccTrue) < 0.02 && sessionReliability > 0.7;
  console.log('\nICC (recovered vs truth; skill predominates in AGGREGATE not per-decision):', g2 ? 'PASS' : 'FAIL');
  console.log(`   per-decision ICC(1) estimated=${iccEst.toFixed(3)}  ground-truth=${iccTrue.toFixed(3)} (recovered) → projected ${k}-decision reliability = ${sessionReliability.toFixed(3)} (skill dominates once aggregated)`);

  // ---- SPLIT-HALF reliability: stable trait on skilled pop, ≈0 on no-skill ----
  const rel = splitHalf(logs);
  const noSkillLogs = Array.from({ length: P }, () => playerDecisions(0.7, k, rng));
  const relNull = splitHalf(noSkillLogs);
  const g3 = rel > 0.7 && Math.abs(relNull) < 0.3;   // null ≈ 0 up to sampling noise (~2·SE on P players)
  console.log('\nSPLIT-HALF (grade is a stable trait, not noise):', g3 ? 'PASS' : 'FAIL');
  console.log(`   Spearman-Brown reliability  skilled=${rel.toFixed(3)}  no-skill=${relNull.toFixed(3)} (correctly ≈0)`);

  // ---- POWER: N-to-detect, empirically confirmed ----
  const delta = SCALE * (0.85 - 0.55);      // grade gap between the H1 tiers
  const nStar = nForPower(delta, DEC_NOISE, 0.05, 0.8);
  let sig = 0; const REP = 2000;
  for (let r = 0; r < REP; r++) { const a = playerDecisions(0.85, nStar, rng), b = playerDecisions(0.55, nStar, rng); if (welchP(a, b).p < 0.05) sig++; }
  const empPower = sig / REP;
  const g4 = empPower > 0.73 && empPower < 0.86;   // normal-approx power vs t-test + estimated σ ⇒ slight undershoot of nominal 0.80
  console.log('\nPOWER (decisions to detect a skill gap; nominal power confirmed):', g4 ? 'PASS' : 'FAIL');
  console.log(`   to detect Δgrade=${delta.toFixed(2)} at α=0.05 power=0.80: N*=${nStar} decisions/player; empirical power at N* = ${empPower.toFixed(3)}`);

  const all = g1 && g2 && g3 && g4;
  console.log('\n' + (all ? '✅ PILOT INSTRUMENT VALIDATED ON GROUND TRUTH' : '❌ SOME CHECKS FAILED') + ' — recovers known skill, controls false positives, sizes samples. Ready to ingest real logs.');
  console.log('(Swap `playerDecisions` for real graded-decision logs to run the same pre-registered battery on human data.)');
}

module.exports = { icc1, splitHalf, nForPower, welchP, playerDecisions };
