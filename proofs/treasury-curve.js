// treasury-curve.js — Yellow Jacket parametric skill-treasury payout generator
// ---------------------------------------------------------------------------
// Implements the precision-justified payout shape derived from engine data:
//   * FLAT TOP BAND  — the top `flatTop` ranks are statistically tied
//     (top-1% leaderboard precision ~= a coin flip), so they are paid EVENLY
//     rather than as a steep spike. This is a correctness requirement, not style.
//   * POWER-LAW MIDDLE — the reliable-precision mass (decile precision ~0.5 at
//     alpha=0.8, high volume) is paid on a smooth k^(-p) gradient.
//   * EXACT NORMALIZATION — tiers always sum to `pool` to the cent.
//   * FLOOR — optional minimum payout so the broad base stays "real money".
//
// Ranking note: players are ranked UPSTREAM by a confidence-adjusted score
// (see confAdjustedScore) over the ELIGIBLE pool only (>= gate events, RD ok).
// This generator maps rank -> payout; eligibility & RD-weighting decide WHO
// holds each rank. Keep the two concerns separate.
// ---------------------------------------------------------------------------

'use strict';

// Conservative lower-confidence-bound ranking score.
// mu = Hive Rating mean, rd = rating deviation, kappa = risk aversion (>0).
// A high-rated but unconverged (high-rd) player is penalised, so money tracks
// PROVEN skill, not lucky thin-sample spikes.
function confAdjustedScore(mu, rd, kappa = 1.5) {
  return mu - kappa * rd;
}

// Eligibility gate. Returns the subset that may be paid.
//   minEvents: 40 for monthly (rolling) / 120 for annual Crown
//   maxRD:     reject ratings that never converged
function eligible(players, { minEvents = 40, maxRD = Infinity } = {}) {
  return players.filter(p => (p.events | 0) >= minEvents && (p.rd ?? 0) <= maxRD);
}

// Core curve builder.
//   pool     : dollars to distribute
//   paid     : number of ranks that receive money
//   flatTop  : size of the evenly-paid Crown band (precision-tied top)
//   exponent : power-law steepness for the middle (0.7 gentle .. 1.2 steep)
//   floor    : minimum payout per paid rank (0 = none)
// Returns { perRank:[{rank,payout}], total, check }.
function buildCurve({ pool, paid, flatTop = 0, exponent = 0.9, floor = 0 }) {
  if (!(pool > 0) || !(paid > 0)) throw new Error('pool and paid must be > 0');
  flatTop = Math.min(flatTop, paid);

  // 1) raw power-law weights
  const raw = new Array(paid);
  for (let k = 1; k <= paid; k++) raw[k - 1] = Math.pow(k, -exponent);

  // 2) flatten the top band to the band's MEAN weight (even pay across ties,
  //    still the highest payouts since mean(top) > any single mid weight)
  if (flatTop > 0) {
    let s = 0;
    for (let k = 0; k < flatTop; k++) s += raw[k];
    const f = s / flatTop;
    for (let k = 0; k < flatTop; k++) raw[k] = f;
  }

  // 3) normalise to the pool
  let sum = 0;
  for (let k = 0; k < paid; k++) sum += raw[k];
  let payout = raw.map(w => (pool * w) / sum);

  // 4) apply floor: lift sub-floor ranks to `floor`, then re-normalise the
  //    ABOVE-floor remainder so the grand total still equals pool exactly.
  if (floor > 0) {
    for (let iter = 0; iter < 64; iter++) {
      const belowIdx = [];
      let belowCost = 0, aboveSum = 0;
      for (let k = 0; k < paid; k++) {
        if (payout[k] <= floor) { belowIdx.push(k); belowCost += floor; }
        else aboveSum += payout[k];
      }
      const remaining = pool - belowCost;
      if (remaining <= 0) { // floor too high for this pool/paid — clamp paid
        payout = payout.map(() => pool / paid);
        break;
      }
      let changed = false;
      const scale = aboveSum > 0 ? remaining / aboveSum : 0;
      for (let k = 0; k < paid; k++) {
        if (payout[k] <= floor) { if (payout[k] !== floor) { payout[k] = floor; changed = true; } }
        else { const nv = payout[k] * scale; if (Math.abs(nv - payout[k]) > 1e-9) changed = true; payout[k] = nv; }
      }
      if (!changed) break;
    }
  }

  const perRank = payout.map((v, i) => ({ rank: i + 1, payout: v }));
  const total = payout.reduce((a, b) => a + b, 0);
  return { perRank, total, check: Math.round(total) };
}

// Collapse a per-rank curve into human-readable bands (geometric rank buckets).
function summarize(perRank) {
  if (!perRank.length) return [];
  const edges = [1, 11, 26, 51, 101, 251, 501, 1001, 2501, 5001, 10001, 25001, 50001, 100001];
  const bands = [];
  for (let e = 0; e < edges.length; e++) {
    const lo = edges[e], hi = (edges[e + 1] || perRank.length + 1) - 1;
    if (lo > perRank.length) break;
    const slice = perRank.filter(r => r.rank >= lo && r.rank <= Math.min(hi, perRank.length));
    if (!slice.length) continue;
    const subtotal = slice.reduce((a, r) => a + r.payout, 0);
    bands.push({
      band: lo === Math.min(hi, perRank.length) ? `${lo}` : `${lo}–${Math.min(hi, perRank.length)}`,
      players: slice.length,
      each: subtotal / slice.length,
      subtotal,
    });
  }
  return bands;
}

// ---- Cadence helper: split the SKILL-LEADERBOARD treasury across horizons ---
// Weekly / monthly / annual boards, ranked by the SKILL GRADE (not event score). Weekly is the
// accessible, frequent, variance-OK tier (AIVAT-tightened for small-sample trust); annual is the
// high-confidence, prestige, dividend tier. Weights are set so each horizon "feels significant".
// Back-compat: callers may still pass a {monthly,quarterly,annual} split; weekly/monthly/annual is canon.
function cadence(annualTreasury, split = { weekly: 0.30, monthly: 0.30, annual: 0.40 }) {
  const w = ('weekly' in split) ? split : { weekly: 0, monthly: (split.monthly || 0) + (split.quarterly || 0), annual: split.annual || 0 };
  return {
    perWeek: (annualTreasury * (w.weekly || 0)) / 52,
    perMonth: (annualTreasury * (w.monthly || 0)) / 12,
    annualCrown: annualTreasury * (w.annual || 0),
    // sum check: perWeek·52 + perMonth·12 + annualCrown === annualTreasury·(weekly+monthly+annual)
  };
}

// ---- Treasury sizing from a field --------------------------------------
function annualTreasury({ avgDailyField, avgEntry = 1, treasuryPct = 0.32, days = 365 }) {
  return avgDailyField * avgEntry * treasuryPct * days;
}

module.exports = {
  confAdjustedScore, eligible, buildCurve, summarize, cadence, annualTreasury,
};

// ---- Demo / self-test when run directly: node treasury-curve.js ------------
if (require.main === module) {
  const usd = n => '$' + Math.round(n).toLocaleString('en-US');
  const FIELDS = [
    { name: '50k',  avgDailyField: 50000,   crownFlat: 10, crownPaid: 2500,  crownExp: 0.95, crownFloor: 250 },
    { name: '200k', avgDailyField: 200000,  crownFlat: 25, crownPaid: 10000, crownExp: 0.95, crownFloor: 150 },
    { name: '1M',   avgDailyField: 1000000, crownFlat: 50, crownPaid: 50000, crownExp: 0.95, crownFloor: 120 },
  ];
  for (const f of FIELDS) {
    const annual = annualTreasury({ avgDailyField: f.avgDailyField });
    const cad = cadence(annual);
    console.log('\n========================================================');
    console.log(`FIELD ${f.name}  | annual treasury ${usd(annual)}`);
    console.log(`  weekly ${usd(cad.perWeek)}  monthly ${usd(cad.perMonth)}  annual CROWN ${usd(cad.annualCrown)}`);
    const crown = buildCurve({ pool: cad.annualCrown, paid: f.crownPaid, flatTop: f.crownFlat, exponent: f.crownExp, floor: f.crownFloor });
    console.log(`  -- Annual Hive Crown (paid ${f.crownPaid}, flat top ${f.crownFlat}) sums to ${usd(crown.check)} --`);
    for (const b of summarize(crown.perRank)) {
      console.log(`     ${String(b.band).padEnd(14)} ${String(b.players).padStart(6)} players  ${usd(b.each).padStart(12)} each  ${usd(b.subtotal).padStart(14)}`);
    }
  }
  console.log('\n(all curves normalise exactly to their pool; tweak flatTop/exponent/floor per field)\n');
}
