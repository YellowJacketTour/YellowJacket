// s1-abstraction-probe.js — S1 GATE for Hold'em Oracle v0: does standard EQUITY bucketing preserve the
// YJ golf-stroke / brick signal, or does it merge hands that post different strokes (corrupting the
// decision-grade EV)? This is the v0 crux (HOLDEM_ORACLE_V0_SCOPE.md §2.5 ruling #1). We MEASURE it,
// against canon scoring, instead of assuming.
//
// Method: sample real flop spots (hero 2 + flop 3). For each, Monte-Carlo over (villain 2, turn, river)
// to estimate (a) EQUITY = P(hero wins)+½P(tie) — the standard bucketing axis; and (b) EXPECTED POSTED
// STROKE — the YJ golf payoff a hero actually posts at showdown (winner→own golf; loser→brick ladder /
// respected-loss / +1; tie→0). Then bucket by equity and measure how much stroke varies WITHIN each
// equity bucket. Large within-bucket stroke spread ⇒ equity buckets merge different-golf hands ⇒ the
// golf-class-aware layer is MANDATORY (gate verdict).
//
// Canon evaluators (evalSevenCard, golfScoreFromHandValue, resolveBrickLoss, golfScoresFromShowdown)
// are ported VERBATIM from index.html (lines 18895 / 4290 / 3499 / 4357).
'use strict';

// ---- canon: evalSevenCard (index.html:18895) — returns {value, className, golf} ----
const RO = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
function evalSevenCard(cards) {
  const counts = {}, suitCounts = {}, ranks = [];
  for (const c of cards) { counts[c.rank] = (counts[c.rank] || 0) + 1; suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; ranks.push(RO[c.rank]); }
  ranks.sort((a, b) => b - a);
  const uniq = Array.from(new Set(ranks)).sort((a, b) => b - a);
  let straightHigh = 0;
  const padded = uniq.concat(uniq.includes(14) ? [1] : []);
  for (let i = 0; i + 4 < padded.length; i++) if (padded[i] - padded[i + 4] === 4) { straightHigh = padded[i]; break; }
  let flushCards = null;
  for (const s in suitCounts) if (suitCounts[s] >= 5) { flushCards = cards.filter((c) => c.suit === s).map((c) => RO[c.rank]).sort((a, b) => b - a); break; }
  let straightFlushHigh = 0;
  if (flushCards) {
    const fu = Array.from(new Set(flushCards)).sort((a, b) => b - a);
    const p2 = fu.concat(fu.includes(14) ? [1] : []);
    for (let i = 0; i + 4 < p2.length; i++) if (p2[i] - p2[i + 4] === 4) { straightFlushHigh = p2[i]; break; }
  }
  const pairs = [], trips = [], quads = [];
  for (const r in counts) { if (counts[r] === 2) pairs.push(RO[r]); if (counts[r] === 3) trips.push(RO[r]); if (counts[r] === 4) quads.push(RO[r]); }
  pairs.sort((a, b) => b - a); trips.sort((a, b) => b - a); quads.sort((a, b) => b - a);
  let value = 0, className = 'High Card';
  if (straightFlushHigh) { value = 800 + straightFlushHigh; className = straightFlushHigh === 14 ? 'Royal Flush' : 'Straight Flush'; }
  else if (quads.length) { value = 700 + quads[0]; className = 'Four of a Kind'; }
  else if (trips.length && (pairs.length || trips.length >= 2)) { value = 600 + trips[0]; className = 'Full House'; }
  else if (flushCards) { value = 500 + flushCards[0]; className = 'Flush'; }
  else if (straightHigh) { value = 400 + straightHigh; className = 'Straight'; }
  else if (trips.length) { value = 300 + trips[0]; className = 'Three of a Kind'; }
  else if (pairs.length >= 2) { value = 200 + pairs[0] * 14 + pairs[1]; className = 'Two Pair'; }
  else if (pairs.length === 1) { value = 100 + pairs[0]; className = 'One Pair'; }
  else { value = ranks[0]; className = 'High Card'; }
  value = value * 100 + (ranks[0] || 0);
  let golf;
  if (straightFlushHigh) golf = -5;
  else if (quads.length) golf = -4;
  else if (trips.length && (pairs.length || trips.length >= 2)) golf = (trips[0] >= 11 ? -3 : -2);
  else if (flushCards) golf = (flushCards[0] >= 10 ? -2 : -1);
  else if (straightHigh) golf = (straightHigh >= 9 ? -2 : -1);
  else if (trips.length) golf = -1;
  else if (pairs.length >= 2) golf = (pairs[0] >= 11 ? -1 : 0);
  else if (pairs.length === 1) golf = (pairs[0] >= 10 ? 0 : 1);
  else golf = ((ranks[0] || 0) >= 11 ? 1 : 2);
  // category 0..9 for the YJ loser ladder (brick = High Card = 0)
  let cat;
  if (straightFlushHigh) cat = 8; else if (quads.length) cat = 7; else if (trips.length && (pairs.length || trips.length >= 2)) cat = 6;
  else if (flushCards) cat = 5; else if (straightHigh) cat = 4; else if (trips.length) cat = 3; else if (pairs.length >= 2) cat = 2; else if (pairs.length === 1) cat = 1; else cat = 0;
  return { value, className, golf, cat };
}

// ---- canon: resolveBrickLoss (index.html:3499) ----
function resolveBrickLoss(T, opener, mode, cap) {
  if (mode === 'pot-gated') { const op = op2(opener), t = Math.max(op, +T || op), c = +cap || 4; return Math.max(1, Math.min(c, 1 + Math.max(0, Math.floor((t - op) / op)))); }
  return 1;
}
const op2 = (o) => (Number.isFinite(+o) && +o >= 1 ? +o : 2);

// hero's POSTED stroke at showdown given hero/villain final hands (YJ variant, brick ladder pot-gated).
function postedStroke(heroEval, villEval, pot, opener) {
  if (heroEval.value > villEval.value) return heroEval.golf;                 // winner posts own
  if (heroEval.value < villEval.value) {                                     // loser ladder
    if (heroEval.cat >= 4) return heroEval.golf;                             // respected loss
    if (heroEval.cat === 0) return resolveBrickLoss(pot, opener, 'pot-gated', 4); // brick
    return 1;                                                                // flat bogey
  }
  return 0;                                                                  // tie → par
}

// ---- deck / sampling ----
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['s', 'h', 'd', 'c'];
const DECK = [];
for (const r of RANKS) for (const s of SUITS) DECK.push({ rank: r, suit: s });
const cid = (c) => c.rank + c.suit;

function mkRng(seed) { let x = seed >>> 0; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }

// estimate equity + expected posted stroke for a flop spot via MC over (villain2, turn, river)
function probeSpot(hole, flop, K, rng, pot, opener) {
  const used = new Set(hole.concat(flop).map(cid));
  const rem = DECK.filter((c) => !used.has(cid(c)));
  let win = 0, tie = 0, lose = 0, strokeSum = 0, brickLose = 0;
  for (let k = 0; k < K; k++) {
    // draw 4 distinct from rem: villain a,b + turn + river
    const idx = [];
    while (idx.length < 4) { const j = (rng() * rem.length) | 0; if (!idx.includes(j)) idx.push(j); }
    const [va, vb, turn, river] = idx.map((j) => rem[j]);
    const board = flop.concat([turn, river]);
    const he = evalSevenCard(hole.concat(board));
    const ve = evalSevenCard([va, vb].concat(board));
    if (he.value > ve.value) win++; else if (he.value < ve.value) { lose++; if (he.cat === 0) brickLose++; } else tie++;
    strokeSum += postedStroke(he, ve, pot, opener);
  }
  const equity = (win + 0.5 * tie) / K;
  return { equity, expStroke: strokeSum / K, brickLoseFreq: brickLose / K };
}

// ---- stats ----
function pearson(x, y) {
  const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sx += dx * dx; sy += dy * dy; }
  return sxy / Math.sqrt(sx * sy);
}
const std = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length); };

// ============================================================================
if (require.main === module) {
  const rng = mkRng(20260630);
  const M = 1200, K = 1500, POT = 6, OPENER = 2;
  console.log('S1 ABSTRACTION PROBE — does EQUITY bucketing preserve the YJ golf-stroke / brick signal?\n');
  console.log(`Sampling ${M} flop spots, ${K} MC runouts each (canon evalSevenCard; brick ladder pot-gated, pot=${POT}).\n`);

  const spots = [];
  for (let m = 0; m < M; m++) {
    // deal hero 2 + flop 3 distinct
    const idx = []; while (idx.length < 5) { const j = (rng() * 52) | 0; if (!idx.includes(j)) idx.push(j); }
    const cs = idx.map((j) => DECK[j]);
    const hole = cs.slice(0, 2), flop = cs.slice(2, 5);
    const p = probeSpot(hole, flop, K, rng, POT, OPENER);
    spots.push({ hole, flop, ...p });
  }

  const eq = spots.map((s) => s.equity), st = spots.map((s) => s.expStroke);
  const r = pearson(eq, st);
  console.log('Correlation(equity, expected posted stroke):  r =', r.toFixed(3), '(stroke is LOWER=better, so expect r<0)');

  // bucket by equity decile; within-bucket stroke spread = the signal-loss metric
  const order = spots.map((_, i) => i).sort((a, b) => eq[a] - eq[b]);
  const B = 10, per = Math.floor(M / B);
  console.log('\nEquity decile  |  mean stroke  |  WITHIN-bucket stroke std  |  stroke range  |  brick-loss freq');
  let pooledWithin = 0, cnt = 0;
  const overallStd = std(st);
  for (let b = 0; b < B; b++) {
    const ids = order.slice(b * per, b === B - 1 ? M : (b + 1) * per);
    const bs = ids.map((i) => st[i]);
    const eqs = ids.map((i) => eq[i]);
    const bl = ids.map((i) => spots[i].brickLoseFreq);
    const wstd = std(bs);
    pooledWithin += wstd * wstd * ids.length; cnt += ids.length;
    const mean = bs.reduce((a, c) => a + c, 0) / bs.length;
    console.log(`  [${(Math.min(...eqs)).toFixed(2)}-${(Math.max(...eqs)).toFixed(2)}]   `
      + `${mean.toFixed(3).padStart(9)}   ${wstd.toFixed(3).padStart(12)}        `
      + `[${Math.min(...bs).toFixed(2)},${Math.max(...bs).toFixed(2)}]   ${(bl.reduce((a, c) => a + c, 0) / bl.length).toFixed(3)}`);
  }
  const rmsWithin = Math.sqrt(pooledWithin / cnt);
  const varianceExplained = 1 - (rmsWithin * rmsWithin) / (overallStd * overallStd);
  console.log('\nOverall stroke std:', overallStd.toFixed(3), ' | pooled WITHIN-equity-bucket stroke std (RMS):', rmsWithin.toFixed(3));
  console.log('Fraction of stroke variance EXPLAINED by equity bucket:', (100 * varianceExplained).toFixed(1) + '%',
    ' → residual (equity-ORTHOGONAL) stroke variance:', (100 * (1 - varianceExplained)).toFixed(1) + '%');

  // collision examples: pairs of spots with near-equal equity but very different posted stroke
  console.log('\nCOLLISION EXAMPLES (near-equal equity, divergent stroke — equity bucketing would merge these):');
  const fmt = (cs) => cs.map(cid).join(' ');
  let shown = 0;
  const usedI = new Set();
  for (let i = 0; i < M && shown < 4; i++) {
    if (usedI.has(i)) continue;
    for (let j = i + 1; j < M; j++) {
      if (usedI.has(j)) continue;
      if (Math.abs(eq[i] - eq[j]) < 0.015 && Math.abs(st[i] - st[j]) > 1.3) {
        console.log(`   eq≈${eq[i].toFixed(2)}:  [${fmt(spots[i].hole)} | ${fmt(spots[i].flop)}] stroke ${st[i].toFixed(2)}`
          + `   vs   [${fmt(spots[j].hole)} | ${fmt(spots[j].flop)}] stroke ${st[j].toFixed(2)}   (Δstroke ${Math.abs(st[i] - st[j]).toFixed(2)})`);
        usedI.add(i); usedI.add(j); shown++; break;
      }
    }
  }
  if (!shown) console.log('   (none found at |Δeq|<0.015 & |Δstroke|>1.3)');

  // VERDICT
  const residual = 1 - varianceExplained;
  console.log('\n──────────────────────────────────────────────────────────────');
  if (residual > 0.10) {
    console.log(`VERDICT: equity-ORTHOGONAL stroke variance is ${(100 * residual).toFixed(1)}% (> 10% threshold).`);
    console.log('→ A pure equity abstraction MERGES hands that post materially different strokes. The');
    console.log('  GOLF-CLASS-AWARE bucketing layer is MANDATORY for v0 (confirms scope §2.5 ruling #1).');
  } else {
    console.log(`VERDICT: equity-orthogonal stroke variance is only ${(100 * residual).toFixed(1)}% (≤ 10%).`);
    console.log('→ Equity bucketing largely preserves the stroke signal; golf-class layer is optional/light.');
  }
  console.log('──────────────────────────────────────────────────────────────');
}
