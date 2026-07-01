// competition-and-payouts.js — the TWO-BASE economy, proven. Yellow Jacket pays on two DIFFERENT things,
// and that difference is the whole point:
//
//   • SINGLE EVENTS are decided by the SCORE OUTCOME (the day's golf+honey result). Score is skill-tilted
//     but variance-present — sometimes a less-skilled player plays well or gets favorable bounces and wins.
//     That is NOT gambling; it is how every competition of skill works (a golf tournament, a tennis match).
//   • THE LONG-TERM LEADERBOARD is decided by the SKILL READOUT (the decision-grade), aggregated
//     WEEKLY / MONTHLY / ANNUAL with respective weights, volume-gated + confidence-weighted (+ AIVAT for
//     the weekly tier). Over aggregation, measured skill DOMINATES — so the leaderboard pays a wage that
//     COMPENSATES the skilled-but-unlucky whom single-event variance shortchanges.
//
// Score ≠ skill on any given day; the two payout bases make that a feature. Self-funded from player
// consideration; sponsor purses add on top. Composes treasury-curve.js unchanged.
'use strict';
const TC = require('./treasury-curve.js');

function mkRng(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(rng) { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function pearson(x, y) { const n = x.length, mx = x.reduce((a, b) => a + b) / n, my = y.reduce((a, b) => a + b) / n; let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sx += dx * dx; sy += dy * dy; } return sxy / Math.sqrt(sx * sy); }
function topDecilePrecision(score, truth) { const n = score.length, k = Math.max(1, n / 10 | 0); const te = new Set(score.map((_, i) => i).sort((a, b) => score[b] - score[a]).slice(0, k)); const tt = new Set(truth.map((_, i) => i).sort((a, b) => truth[b] - truth[a]).slice(0, k)); let h = 0; for (const i of te) if (tt.has(i)) h++; return h / k; }
// pay a pool to a ranked list of player-ids (best first) via the crown-band+power-law curve
function payByRank(pool, rankedIds, paidFrac, flatTop, floor) {
  const paid = Math.max(1, Math.min(rankedIds.length, Math.round(rankedIds.length * paidFrac)));
  const curve = TC.buildCurve({ pool, paid, flatTop: Math.min(flatTop, paid), exponent: 0.95, floor });
  const out = new Map(); for (let i = 0; i < paid; i++) out.set(rankedIds[i], curve.perRank[i].payout); return out;
}
const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

// ============================================================================
if (require.main === module) {
  const rng = mkRng(20260630);
  console.log('COMPETITION & PAYOUTS — single events pay on SCORE (a sport); the leaderboard pays on SKILL (a wage)\n');

  // ---- population + season ----
  const P = 2000, EVENTS = 156, WEEKS = 52, D = 60;        // 3 events/week × 52 weeks
  const theta = Array.from({ length: P }, () => Math.max(0, Math.min(1, 0.5 + 0.15 * gauss(rng))));  // true skill
  // per-event models (closed-form aggregation of D holes/decisions):
  //   SCORE (golf, lower=better): heavily variance-laden → single-event upsets are common (a real sport).
  //   GRADE (EV-loss, lower=better): the info-set decision-quality readout → low variance, skill-tilted.
  const SCORE_TILT = 15, SCORE_SD = 15.5, GRADE_SD = 0.8 / Math.sqrt(D);
  const evScore = Array.from({ length: P }, () => []), evGrade = Array.from({ length: P }, () => []);
  const eventEarn = new Array(P).fill(0);

  // event purse: self-funded (entries) + a sponsor purse on some events
  const ENTRY = 20, SPONSOR_EVENTS = 20, SPONSOR = 250000;
  let sponsorTotal = 0;
  for (let e = 0; e < EVENTS; e++) {
    const selfFunded = ENTRY * P, sponsor = (e % Math.floor(EVENTS / SPONSOR_EVENTS) === 0) ? SPONSOR : 0;
    sponsorTotal += sponsor;
    const purse = selfFunded + sponsor;
    for (let p = 0; p < P; p++) { evScore[p].push(-SCORE_TILT * theta[p] + SCORE_SD * gauss(rng)); evGrade[p].push((1 - theta[p]) + GRADE_SD * gauss(rng)); }
    // EVENT is decided by SCORE OUTCOME (lower golf score = better finish)
    const rankedByScore = Array.from({ length: P }, (_, p) => p).sort((a, b) => evScore[a][e] - evScore[b][e]);
    const pay = payByRank(purse, rankedByScore, 0.20, 8, 25);
    for (const [id, amt] of pay) eventEarn[id] += amt;
  }

  // ---- LONG-TERM LEADERBOARD, decided by the SKILL GRADE, over weekly/monthly/annual horizons ----
  const annualTreasury = TC.annualTreasury({ avgDailyField: 200000 });
  const cad = TC.cadence(annualTreasury);                 // {perWeek, perMonth, annualCrown} weekly/monthly/annual
  const lbEarn = new Array(P).fill(0);
  const windowGradeRank = (evtFrom, evtTo, minEvents) => {
    const ids = [], g = [];
    for (let p = 0; p < P; p++) { const slice = evGrade[p].slice(evtFrom, evtTo); if (slice.length < minEvents) continue; ids.push(p); g.push(slice.reduce((a, b) => a + b, 0) / slice.length); }
    return ids.map((id, i) => ({ id, g: g[i] })).sort((a, b) => a.g - b.g).map((x) => x.id);   // lower grade = better = first
  };
  // weekly (accessible, small gate; AIVAT-tightened in production), 52 settlements
  for (let w = 0; w < WEEKS; w++) { const from = w * 3, to = from + 3; const r = windowGradeRank(from, to, 2); const pay = payByRank(cad.perWeek, r, 0.25, 5, 20); for (const [id, amt] of pay) lbEarn[id] += amt; }
  // monthly (13 events/month), 12 settlements
  for (let m = 0; m < 12; m++) { const from = m * 13, to = from + 13; const r = windowGradeRank(from, to, 6); const pay = payByRank(cad.perMonth, r, 0.20, 10, 40); for (const [id, amt] of pay) lbEarn[id] += amt; }
  // annual crown (whole season), high volume gate
  const annualRank = windowGradeRank(0, EVENTS, 40);
  const annualPay = payByRank(cad.annualCrown, annualRank, 0.20, 25, 100); for (const [id, amt] of annualPay) lbEarn[id] += amt;

  // ---- season metrics ----
  const eventWins = new Array(P).fill(0);
  for (let e = 0; e < EVENTS; e++) { let best = 0; for (let p = 1; p < P; p++) if (evScore[p][e] < evScore[best][e]) best = p; eventWins[best]++; }
  const seasonGrade = evGrade.map((g) => g.reduce((a, b) => a + b, 0) / g.length);   // annual skill readout (lower=better)
  const totalEarn = eventEarn.map((v, i) => v + lbEarn[i]);

  // ---- GATE 1: single events are a real SPORT — skill tilts wins, but upsets are common ----
  const decileCut = theta.slice().sort((a, b) => b - a)[Math.floor(P / 10)];
  let topDecileWins = 0; for (let e = 0; e < EVENTS; e++) { let best = 0; for (let p = 1; p < P; p++) if (evScore[p][e] < evScore[best][e]) best = p; if (theta[best] >= decileCut) topDecileWins++; }
  const topDecileWinRate = topDecileWins / EVENTS;
  const g1 = topDecileWinRate > 0.10 && topDecileWinRate < 0.85;   // above the 10% chance baseline, but far from certain
  console.log('GATE 1 (single events = a sport: skill tilts wins, upsets common — NOT gambling):', g1 ? 'PASS' : 'FAIL');
  console.log(`   events won by a top-decile-skill player: ${(100 * topDecileWinRate).toFixed(0)}% (vs 10% by chance) → skill matters, but ${(100 * (1 - topDecileWinRate)).toFixed(0)}% of events an upset wins. Exactly how competitions of skill behave.`);

  // ---- GATE 2: SCORE ≠ SKILL in a single event ----
  const rhoEventWins = pearson(theta, eventWins.map((w) => w));         // over a whole season of single-event outcomes
  const singleFinish = evScore.map((s) => -s[0]);                       // one event's score (negated: higher=better finish)
  const rhoSingle = pearson(theta, singleFinish);
  const g2 = Math.abs(rhoSingle) < 0.35;
  console.log('GATE 2 (score ≠ skill on any given day — single-event outcome is variance-heavy):', g2 ? 'PASS' : 'FAIL');
  console.log(`   corr(skill, single-event finish) = ${rhoSingle.toFixed(2)} (low — that's the variance that makes it a contest, not a coronation)`);

  // ---- GATE 3: the LEADERBOARD reads SKILL, and sharpens with the horizon ----
  const rhoWeek = pearson(theta, evGrade.map((g) => -g[0]));            // one week ~ one event grade
  const rhoMonth = pearson(theta, evGrade.map((g) => -(g.slice(0, 13).reduce((a, b) => a + b, 0) / 13)));
  const rhoAnnual = pearson(theta, seasonGrade.map((v) => -v));
  const annualPrec = topDecilePrecision(seasonGrade.map((v) => -v), theta);
  const g3 = rhoWeek < rhoMonth && rhoMonth < rhoAnnual && rhoAnnual > 0.9 && annualPrec > 0.6;
  console.log('GATE 3 (the leaderboard reads SKILL and sharpens weekly→monthly→annual):', g3 ? 'PASS' : 'FAIL');
  console.log(`   corr(skill, grade)  weekly=${rhoWeek.toFixed(2)} → monthly=${rhoMonth.toFixed(2)} → annual=${rhoAnnual.toFixed(2)} ; annual top-decile precision=${annualPrec.toFixed(2)}`);

  // ---- GATE 4: the leaderboard PAYS THE TRULY SKILLED (compensating events' scatter) ----
  // Raw earnings-correlation is compressed by the top-heavy payout curve (many $0s), so the honest metric
  // is WHO the money reaches: the leaderboard's top earners are truly skilled (it ranks at corr≈1.0),
  // while the event top earners are scattered by variance. That gap IS the compensation.
  const precLbEarners = topDecilePrecision(lbEarn, theta);            // are leaderboard top-earners truly top-skill?
  const precEventEarners = topDecilePrecision(eventEarn, theta);      // are event top-earners truly top-skill?
  // a skilled-but-unlucky player: top-15% skill, bottom-third event earnings
  const skilled = Array.from({ length: P }, (_, p) => p).filter((p) => theta[p] >= theta.slice().sort((a, b) => b - a)[Math.floor(P * 0.15)]);
  const eeCut = eventEarn.slice().sort((a, b) => a - b)[Math.floor(P / 3)];
  const unlucky = skilled.filter((p) => eventEarn[p] <= eeCut).sort((a, b) => theta[b] - theta[a])[0];
  const skilledLbMean = skilled.reduce((a, p) => a + lbEarn[p], 0) / skilled.length;
  const skilledEvMean = skilled.reduce((a, p) => a + eventEarn[p], 0) / skilled.length;
  const g4 = precLbEarners > precEventEarners + 0.15 && skilledLbMean > skilledEvMean && (unlucky === undefined || lbEarn[unlucky] > eventEarn[unlucky]);
  console.log('GATE 4 (the leaderboard WAGE reaches the truly skilled; events scatter):', g4 ? 'PASS' : 'FAIL');
  console.log(`   top-earner precision (are they truly top-skill?):  leaderboard=${precLbEarners.toFixed(2)}  ≫  events=${precEventEarners.toFixed(2)}  → the wage pays skill, the purses scatter with variance`);
  console.log(`   skilled cohort mean income:  leaderboard ${usd(skilledLbMean)}  vs  event purses ${usd(skilledEvMean)} (the wage is their reliable income)`);
  if (unlucky !== undefined) console.log(`   e.g. a top-15%-skill, unlucky player: event purses ${usd(eventEarn[unlucky])} vs leaderboard wage ${usd(lbEarn[unlucky])} → the wage carries them.`);

  // ---- GATE 5: horizons conserve and each is significant ----
  const lbTotal = cad.perWeek * WEEKS + cad.perMonth * 12 + cad.annualCrown;
  const g5 = Math.abs(lbTotal - annualTreasury * 1.0) < 1 && cad.perWeek * WEEKS > 0 && cad.perMonth * 12 > 0 && cad.annualCrown > 0;
  console.log('GATE 5 (weekly·52 + monthly·12 + annual = leaderboard treasury; each tier significant):', g5 ? 'PASS' : 'FAIL');
  console.log(`   weekly ${usd(cad.perWeek)}×52=${usd(cad.perWeek * 52)} · monthly ${usd(cad.perMonth)}×12=${usd(cad.perMonth * 12)} · annual crown ${usd(cad.annualCrown)}  =  ${usd(lbTotal)}`);

  // ---- GATE 6: self-funded first, sponsors additive ----
  const totalSelfFunded = ENTRY * P * EVENTS, totalSponsor = sponsorTotal;
  const totalEventPurses = eventEarn.reduce((a, b) => a + b, 0);
  const g6 = Math.abs(totalEventPurses - (totalSelfFunded + totalSponsor)) < 1;
  console.log('GATE 6 (self-funded from consideration; sponsor purses add on top):', g6 ? 'PASS' : 'FAIL');
  console.log(`   event purses ${usd(totalEventPurses)} = self-funded ${usd(totalSelfFunded)} + sponsor ${usd(totalSponsor)}  (solvent without sponsors; sponsors are additive)`);

  const all = g1 && g2 && g3 && g4 && g5 && g6;
  console.log('\n' + (all ? '✅ ALL COMPETITION-&-PAYOUT GATES PASS' : '❌ SOME GATES FAILED') + ' — events are a sport (score, variance); the leaderboard is a wage (skill, aggregated). Two bases, one game.');
}
