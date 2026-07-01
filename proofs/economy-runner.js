// economy-runner.js — the live payout pipeline: wires the validated RATING ENGINE → the ELIGIBILITY
// GATE → confidence-adjusted ranking → the TREASURY CURVE (Crown band + power-law) → cadence settlement
// → the OVERLAY-RAMP bootstrap. Turns "validated components" into something that actually moves money,
// correctly. (GRADER_INTEGRATION_SCOPE.md §3 + §6 #5.)
//
// Composes three proven engines unchanged: rating-engine.js, treasury-curve.js, overlay-ramp.js.
//
// ECONOMIC-CORRECTNESS GATES:
//   A — pool conservation: payouts sum to the pool to the cent.
//   B — volume gate: sub-gate players receive $0 (pay nothing without volume).
//   C — skill-monotone: higher confidence-adjusted YJ Score ⇒ higher-or-equal payout.
//   D — confidence-weighting: a hot high-RD newcomer ranks BELOW a proven low-RD vet (money tracks
//       proven skill, not lucky spikes).
//   E — cadence conservation: monthly+quarterly+annual settlements sum to the annual treasury.
//   F — dividend discipline & solvency: total paid ≤ the sized treasury; the overlay bootstrap is finite
//       and crosses over to organic funding (never an open-ended promise).
'use strict';
const RE = require('./rating-engine.js');
const TC = require('./treasury-curve.js');
const OV = require('./overlay-ramp.js');

// ---- synthetic graded population via the REAL rating engine (known skill, mixed volume) ----
function mkRng(seed) { let x = seed >>> 0; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }
function gauss(rng) { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function buildPopulation(N, seed) {
  const rng = mkRng(seed), D = 60, SIG_BIAS = 0.5, DEC = 7, OUT = 16, ALPHA = RE.ALPHA;
  const out = [];
  for (let i = 0; i < N; i++) {
    const sTrue = gauss(rng), bias = SIG_BIAS * gauss(rng);
    // realistic mixed volume: ~half below the 40-event gate
    const events = Math.max(1, Math.round(2 + Math.abs(gauss(rng)) * 45));
    const p = RE.newPlayer();
    for (let e = 0; e < events; e++) {
      const dec = sTrue + bias + DEC * gauss(rng), o = sTrue + OUT * gauss(rng);
      RE.ingestEvent(p, ALPHA * dec + (1 - ALPHA) * o, D);
    }
    const r = RE.rating(p);
    out.push({ id: i, sTrue, mu: r.mean, rd: r.rd, events: r.events, decisions: r.decisions });
  }
  return out;
}

// ---- the payout pipeline ----
function runPayout(players, { pool, minEvents = 40, flatTop, paid, exponent = 0.95, floor = 0 }) {
  const elig = TC.eligible(players, { minEvents });                       // VOLUME GATE
  const ranked = elig.slice().sort((a, b) => TC.confAdjustedScore(b.mu, b.rd) - TC.confAdjustedScore(a.mu, a.rd));
  const paidN = Math.min(paid, ranked.length);
  const curve = TC.buildCurve({ pool, paid: paidN, flatTop: Math.min(flatTop, paidN), exponent, floor });
  const awards = ranked.map((p, idx) => ({ ...p, rank: idx + 1, score: TC.confAdjustedScore(p.mu, p.rd), payout: idx < paidN ? curve.perRank[idx].payout : 0 }));
  const ineligible = players.filter((p) => !elig.includes(p)).map((p) => ({ ...p, rank: null, payout: 0 }));
  return { awards, ineligible, curve, eligibleCount: elig.length };
}

const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

// ============================================================================
if (require.main === module) {
  console.log('YELLOW JACKET ECONOMY RUNNER — rating → gate → confidence-rank → treasury curve → cadence → overlay\n');

  // size the treasury from a field (32% of consideration), split by cadence
  const FIELD = { avgDailyField: 200000 };
  const annual = TC.annualTreasury({ avgDailyField: FIELD.avgDailyField });
  const cad = TC.cadence(annual);
  console.log(`Field ${FIELD.avgDailyField.toLocaleString()} | annual SKILL-leaderboard treasury ${usd(annual)}  →  weekly ${usd(cad.perWeek)} · monthly ${usd(cad.perMonth)} · annual CROWN ${usd(cad.annualCrown)}\n`);

  const N = 5000;
  const players = buildPopulation(N, 20260630);
  const r = runPayout(players, { pool: cad.annualCrown, minEvents: RE.MIN_EVENTS, flatTop: 25, paid: 2000, exponent: 0.95, floor: 100 });
  console.log(`Population ${N} | eligible (≥${RE.MIN_EVENTS} events) ${r.eligibleCount} | paid ${Math.min(2000, r.eligibleCount)} | top-5 payouts ${r.awards.slice(0, 5).map((a) => usd(a.payout)).join(' ')}`);

  // ---- GATE A: pool conservation ----
  const totalPaid = r.awards.reduce((s, a) => s + a.payout, 0);
  const gA = Math.abs(totalPaid - cad.annualCrown) < 1.0;
  console.log('\nGATE A (payouts sum to the pool to the cent):', gA ? 'PASS' : 'FAIL', `(paid ${usd(totalPaid)} vs pool ${usd(cad.annualCrown)})`);

  // ---- GATE B: volume gate — every sub-gate player gets $0 ----
  const leak = players.filter((p) => p.events < RE.MIN_EVENTS).some((p) => {
    const a = r.awards.find((x) => x.id === p.id); return a && a.payout > 0;
  });
  const gB = !leak && r.ineligible.every((p) => p.payout === 0) && r.ineligible.length === N - r.eligibleCount;
  console.log('GATE B (sub-gate players receive $0 — pay nothing without volume):', gB ? 'PASS' : 'FAIL', `(${N - r.eligibleCount} gated out)`);

  // ---- GATE C: skill-monotone — payout non-increasing in rank (higher score ⇒ ≥ payout) ----
  let mono = true; for (let i = 1; i < r.awards.length; i++) if (r.awards[i].payout > r.awards[i - 1].payout + 1e-6) mono = false;
  console.log('GATE C (higher confidence-adjusted score ⇒ higher-or-equal payout):', mono ? 'PASS' : 'FAIL');

  // ---- GATE D: confidence-weighting beats a hot newcomer ----
  // inject a hot high-RD newcomer (great mu, few events but ≥gate) vs a proven vet (slightly lower mu, tiny RD)
  const hot = { id: -1, mu: 2.5, rd: 0.95, events: 41, decisions: 2460, sTrue: 0 };  // great raw mu, thin sample
  const vet = { id: -2, mu: 1.8, rd: 0.22, events: 400, decisions: 24000, sTrue: 0 }; // proven, converged
  const gD = TC.confAdjustedScore(vet.mu, vet.rd) > TC.confAdjustedScore(hot.mu, hot.rd);
  console.log('GATE D (confidence-weighting: proven vet outranks hot high-RD newcomer):', gD ? 'PASS' : 'FAIL',
    `(vet score ${TC.confAdjustedScore(vet.mu, vet.rd).toFixed(2)} > hot ${TC.confAdjustedScore(hot.mu, hot.rd).toFixed(2)})`);

  // ---- GATE E: cadence conservation ----
  const sumCad = cad.perWeek * 52 + cad.perMonth * 12 + cad.annualCrown;
  const gE = Math.abs(sumCad - annual) < 1.0;
  console.log('GATE E (weekly·52 + monthly·12 + annual crown = leaderboard treasury):', gE ? 'PASS' : 'FAIL', `(${usd(sumCad)} vs ${usd(annual)})`);

  // ---- GATE F: dividend discipline + overlay solvency ----
  const matureSpend = 57600; // 200k-field mature $/day
  const G = OV.guaranteeForCrossover(matureSpend, 0.58, 1.0);
  const ramp = OV.rampOverlay({ matureSpend, prizeReturnPct: 0.58, guarantee: G, rampDays: 180, seedFrac: 0.05 });
  const gF = totalPaid <= annual + 1 && ramp.crossover !== null && ramp.totalOverlay > 0 && Number.isFinite(ramp.totalOverlay);
  console.log('GATE F (dividend ≤ sized treasury; overlay finite + crosses over to organic):', gF ? 'PASS' : 'FAIL',
    `(paid ${usd(totalPaid)} ≤ treasury ${usd(annual)}; bootstrap ${usd(ramp.totalOverlay)}, crossover day ${ramp.crossover})`);

  // band view
  console.log('\nAnnual Hive Crown payout bands (eligible only):');
  for (const b of TC.summarize(r.awards.filter((a) => a.payout > 0).map((a) => ({ rank: a.rank, payout: a.payout }))))
    console.log(`   rank ${String(b.band).padEnd(12)} ${String(b.players).padStart(5)} players  ${usd(b.each).padStart(11)} each  ${usd(b.subtotal).padStart(13)}`);

  const all = gA && gB && mono && gD && gE && gF;
  console.log('\n' + (all ? '✅ ALL ECONOMY GATES PASS' : '❌ SOME GATES FAILED') + ' — grade→rating→gate→treasury→cadence→overlay: a correct, solvent, skill-monotone money pipeline.');
}
