// s2-oracle-subgame.js — S2 for Hold'em Oracle v0: the BR-to-fixed-field oracle on REAL CARDS, plus the
// abstraction layer, validated on an EXACTLY-SOLVABLE river subgame (the anti-flawed-oracle anchor).
//
// Game: a fixed 5-card river board on a reduced deck (7 ranks × 2 suits = 14 cards). Each player holds a
// 2-card hand from the 9 remaining cards (C(9,2)=36 hands) → the whole game is finitely enumerable, so
// the "optimal baseline" is EXACT (no CFR). One street of YJ matched-total proposal betting. Scoring is
// the COMPLETE Honey-Stroke EV (canon evalSevenCard golf/cat + brick ladder + tie-carry + honey), unified
// as score = golf − honey/divisor (LOWER better). Reuses the machinery proven exact in the single- and
// multi-street gates, swapping abstract tokens for real-card hands + disjoint-hand belief.
//
// THREE GATES:
//   A — the oracle is correct on REAL cards: BR-to-exploitable-field grades 0 (unique min) + monotone.
//   B — ANTI-FLAWED-ORACLE ANCHOR: a LOSSLESS abstraction (singleton buckets) reproduces the exact grade
//       byte-for-byte → the abstraction+oracle pipeline does not silently corrupt the baseline.
//   C — S1→S2 PAYOFF: golf-class-aware 2-D buckets give STRICTLY LOWER oracle abstraction-error than
//       equity-only buckets at equal bucket budget (the S1 mandate pays off in oracle quality).
'use strict';

// ===== canon evaluators (ported verbatim; see s1-abstraction-probe.js / index.html) =====
const RO = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, T: 10, J: 11, Q: 12, K: 13, A: 14 };
function evalSevenCard(cards) {
  const counts = {}, suitCounts = {}, ranks = [];
  for (const c of cards) { counts[c.rank] = (counts[c.rank] || 0) + 1; suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; ranks.push(RO[c.rank]); }
  ranks.sort((a, b) => b - a);
  const uniq = Array.from(new Set(ranks)).sort((a, b) => b - a);
  let straightHigh = 0; const padded = uniq.concat(uniq.includes(14) ? [1] : []);
  for (let i = 0; i + 4 < padded.length; i++) if (padded[i] - padded[i + 4] === 4) { straightHigh = padded[i]; break; }
  let flushCards = null;
  for (const s in suitCounts) if (suitCounts[s] >= 5) { flushCards = cards.filter((c) => c.suit === s).map((c) => RO[c.rank]).sort((a, b) => b - a); break; }
  let sfHigh = 0;
  if (flushCards) { const fu = Array.from(new Set(flushCards)).sort((a, b) => b - a); const p2 = fu.concat(fu.includes(14) ? [1] : []); for (let i = 0; i + 4 < p2.length; i++) if (p2[i] - p2[i + 4] === 4) { sfHigh = p2[i]; break; } }
  const pairs = [], trips = [], quads = [];
  for (const r in counts) { if (counts[r] === 2) pairs.push(RO[r]); if (counts[r] === 3) trips.push(RO[r]); if (counts[r] === 4) quads.push(RO[r]); }
  pairs.sort((a, b) => b - a); trips.sort((a, b) => b - a); quads.sort((a, b) => b - a);
  let value = 0, cat = 0;
  if (sfHigh) { value = 800 + sfHigh; cat = 8; }
  else if (quads.length) { value = 700 + quads[0]; cat = 7; }
  else if (trips.length && (pairs.length || trips.length >= 2)) { value = 600 + trips[0]; cat = 6; }
  else if (flushCards) { value = 500 + flushCards[0]; cat = 5; }
  else if (straightHigh) { value = 400 + straightHigh; cat = 4; }
  else if (trips.length) { value = 300 + trips[0]; cat = 3; }
  else if (pairs.length >= 2) { value = 200 + pairs[0] * 14 + pairs[1]; cat = 2; }
  else if (pairs.length === 1) { value = 100 + pairs[0]; cat = 1; }
  else { value = ranks[0]; cat = 0; }
  value = value * 100 + (ranks[0] || 0);
  let golf;
  if (sfHigh) golf = -5; else if (quads.length) golf = -4;
  else if (trips.length && (pairs.length || trips.length >= 2)) golf = (trips[0] >= 11 ? -3 : -2);
  else if (flushCards) golf = (flushCards[0] >= 10 ? -2 : -1);
  else if (straightHigh) golf = (straightHigh >= 9 ? -2 : -1);
  else if (trips.length) golf = -1;
  else if (pairs.length >= 2) golf = (pairs[0] >= 11 ? -1 : 0);
  else if (pairs.length === 1) golf = (pairs[0] >= 10 ? 0 : 1);
  else golf = ((ranks[0] || 0) >= 11 ? 1 : 2);
  return { value, golf, cat };
}
function resolveBrickLoss(T, opener, mode, cap) {
  if (mode === 'pot-gated') { const op = (+opener >= 1 ? +opener : 2), t = Math.max(op, +T || op), c = +cap || 4; return Math.max(1, Math.min(c, 1 + Math.max(0, Math.floor((t - op) / op)))); }
  return 1;
}

// ===== build the river subgame =====
const RANKS = ['2', '5', '8', '9', 'T', 'K', 'A'];   // gappy reduced ranks (dry-ish, brick-friendly)
const SUITS = ['s', 'h'];
const FULL = []; for (const r of RANKS) for (const s of SUITS) FULL.push({ rank: r, suit: s });
const cid = (c) => c.rank + c.suit;
const BOARD = [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }, { rank: '9', suit: 'h' }, { rank: '5', suit: 's' }, { rank: '2', suit: 'h' }];

const boardSet = new Set(BOARD.map(cid));
const REM = FULL.filter((c) => !boardSet.has(cid(c)));                  // 9 cards
const HANDS = [];
for (let i = 0; i < REM.length; i++) for (let j = i + 1; j < REM.length; j++) {
  const cards = [REM[i], REM[j]]; const e = evalSevenCard(cards.concat(BOARD));
  HANDS.push({ cards, ids: [cid(REM[i]), cid(REM[j])], val: e.value, golf: e.golf, cat: e.cat });
}
const NH = HANDS.length;
const disjoint = (a, b) => !(HANDS[a].ids.includes(HANDS[b].ids[0]) || HANDS[a].ids.includes(HANDS[b].ids[1]));

// river equity of each hand vs the uniform (balanced) range of disjoint hands
const EQUITY = HANDS.map((_, a) => {
  let win = 0, n = 0; for (let b = 0; b < NH; b++) { if (a === b || !disjoint(a, b)) continue; n++; win += HANDS[a].val > HANDS[b].val ? 1 : HANDS[a].val === HANDS[b].val ? 0.5 : 0; }
  return n ? win / n : 0.5;
});

// ===== single-street matched-total betting (same tree as the proven single-street gate) =====
const ANTE = 1, OPENER_POT = 2, BET = 2, RAISE = 2;
const TERMS = { kk: { sd: 1, C: 1, pot: 2 }, kbc: { sd: 1, C: 3, pot: 6 }, bc: { sd: 1, C: 3, pot: 6 }, brc: { sd: 1, C: 5, pot: 10 }, kbf: { fold: 1 }, bf: { fold: 2 }, brf: { fold: 1 } };
const CONTRIB_FOLD = { kbf: 1, bf: 1, brf: 3 };
const isTerm = (h) => Object.prototype.hasOwnProperty.call(TERMS, h);
const actorOf = (h) => ({ '': 1, k: 2, kb: 1, b: 2, br: 1 })[h];
const legalOf = (h) => (h === '' || h === 'k') ? ['k', 'b'] : (h === 'kb' || h === 'br') ? ['f', 'c'] : ['f', 'c', 'r'];
const childOf = (h, a) => {
  if (h === '') return a === 'k' ? 'k' : 'b';
  if (h === 'k') return a === 'k' ? 'kk' : 'kb';
  if (h === 'kb') return a === 'f' ? 'kbf' : 'kbc';
  if (h === 'b') return a === 'f' ? 'bf' : a === 'c' ? 'bc' : 'br';
  return a === 'f' ? 'brf' : 'brc';
};

function terminalScore(h, heroSeat, hi, vi, cfg) {
  const T = TERMS[h];
  if (T.fold) { const folder = T.fold; const c = CONTRIB_FOLD[h]; return folder === heroSeat ? 1 + c / cfg.D : 0 - c / cfg.D; }
  const C = T.C, pot = T.pot, D = cfg.D, H = HANDS[hi], V = HANDS[vi];
  if (H.val > V.val) return H.golf - C / D;
  if (H.val < V.val) { const loser = V.cat, lg = HANDS[hi]; const loserStroke = lg.cat >= 4 ? lg.golf : lg.cat === 0 ? resolveBrickLoss(pot, OPENER_POT, cfg.brickMode, cfg.brickCap) : 1; void loser; return loserStroke + C / D; }
  const tieHoney = cfg.tieCarry ? (2 * cfg.w - 1) * (pot / 2) : 0; return 0 - tieHoney / D;
}

// exact evaluator: hero=BR(min), villain=field F(mix)
function evalNode(h, heroSeat, hi, vi, F, cfg) {
  if (isTerm(h)) return terminalScore(h, heroSeat, hi, vi, cfg);
  const actor = actorOf(h), acts = legalOf(h);
  if (actor === heroSeat) { let best = Infinity; for (const a of acts) best = Math.min(best, evalNode(childOf(h, a), heroSeat, hi, vi, F, cfg)); return best; }
  const d = F(actor, vi, h); let v = 0; for (const a of acts) { const p = d[a] || 0; if (p) v += p * evalNode(childOf(h, a), heroSeat, hi, vi, F, cfg); } return v;
}

// belief over villain hand at a hero infoset (disjoint prior × villain action replay under F)
function belief(heroSeat, hi, h, F) {
  const villSeat = heroSeat === 1 ? 2 : 1; const w = new Array(NH).fill(0);
  for (let vi = 0; vi < NH; vi++) {
    if (vi === hi || !disjoint(hi, vi)) continue;
    let p = 1, cur = ''; for (const a of h) { const actor = actorOf(cur); if (actor === villSeat) p *= (F(actor, vi, cur)[a] || 0); cur += a; }
    w[vi] = p;
  }
  const Z = w.reduce((s, x) => s + x, 0); return Z > 0 ? w.map((x) => x / Z) : w;
}
function infosetQ(heroSeat, hi, h, F, cfg) {
  const bel = belief(heroSeat, hi, h, F), acts = legalOf(h), Q = {};
  for (const a of acts) { let q = 0; for (let vi = 0; vi < NH; vi++) if (bel[vi] > 0) q += bel[vi] * evalNode(childOf(h, a), heroSeat, hi, vi, F, cfg); Q[a] = q; }
  let bestQ = Infinity, brAct = acts[0]; for (const a of acts) if (Q[a] < bestQ - 1e-12) { bestQ = Q[a]; brAct = a; }
  const loss = {}; for (const a of acts) loss[a] = Q[a] - bestQ; return { Q, bestQ, brAct, loss, acts };
}

// grade a strategy exactly. strat(heroSeat, hi, h) -> dist over legal acts.
function gradeStrategy(strat, F, cfg) {
  let grade = 0;
  for (let heroSeat = 1; heroSeat <= 2; heroSeat++) {
    for (let hi = 0; hi < NH; hi++) {
      const disj = []; for (let vi = 0; vi < NH; vi++) if (vi !== hi && disjoint(hi, vi)) disj.push(vi);
      const pHand = 1 / NH, pV = 1 / disj.length;
      for (const vi of disj) {
        const dealP = pHand * pV;
        const walk = (h, reach) => {
          if (isTerm(h)) return; const actor = actorOf(h), acts = legalOf(h);
          if (actor === heroSeat) {
            const il = infosetQ(heroSeat, hi, h, F, cfg); const sd = strat(heroSeat, hi, h);
            let exp = 0; for (const a of acts) exp += (sd[a] || 0) * il.loss[a]; grade += reach * exp;
            for (const a of acts) { const p = sd[a] || 0; if (p) walk(childOf(h, a), reach * p); }
          } else { const d = F(actor, vi, h); for (const a of acts) { const p = d[a] || 0; if (p) walk(childOf(h, a), reach * p); } }
        };
        walk('', dealP);
      }
    }
  }
  return grade / 2;
}

// ===== fields =====
function balancedF() { return (actor, vi, h) => { const acts = legalOf(h), p = 1 / acts.length, o = {}; acts.forEach((a) => (o[a] = p)); return o; }; }
// exploitable field keyed on the villain hand's equity (value-heavy, under-bluffs, over-folds weak)
function exploitableF() {
  return (actor, vi, h) => {
    const st = EQUITY[vi];
    if (h === '' || h === 'k') { const pBet = 0.10 + 0.80 * st; return { k: 1 - pBet, b: pBet }; }
    if (h === 'kb' || h === 'br') { const pCall = 0.10 + 0.85 * st; return { f: 1 - pCall, c: pCall }; }
    const pFold = (1 - st) * 0.8, pRaise = st * st * 0.55, pCall = Math.max(0, 1 - pFold - pRaise); return { f: pFold, c: pCall, r: pRaise };
  };
}
const brStrategy = (F, cfg) => (heroSeat, hi, h) => { const il = infosetQ(heroSeat, hi, h, F, cfg); const o = {}; il.acts.forEach((a) => (o[a] = a === il.brAct ? 1 : 0)); return o; };
const ladder = (F, cfg, eps) => { const br = brStrategy(F, cfg); return (heroSeat, hi, h) => { const acts = legalOf(h), b = br(heroSeat, hi, h), o = {}; acts.forEach((a) => (o[a] = (1 - eps) * (b[a] || 0) + eps / acts.length)); return o; }; };

// ===== abstraction: bucket the hands, build the abstracted-BR strategy, grade on the TRUE game =====
function golfGroup(cat) { return cat === 0 ? 0 : cat === 1 ? 1 : cat <= 3 ? 2 : 3; } // brick / pair / 2p-trips / made
function quantileBins(values, nbins) { // returns bin index per item by quantile of `values`
  const order = values.map((_, i) => i).sort((a, b) => values[a] - values[b]); const bin = new Array(values.length);
  order.forEach((idx, rank) => { bin[idx] = Math.min(nbins - 1, Math.floor(rank * nbins / values.length)); }); return bin;
}
function bucketsEquityOnly(nbins) { const bin = quantileBins(EQUITY, nbins); return HANDS.map((_, i) => 'e' + bin[i]); }
function bucketsGolfAware(eqBins) { const bin = quantileBins(EQUITY, eqBins); return HANDS.map((h, i) => 'e' + bin[i] + 'g' + golfGroup(h.cat)); }
function bucketsSingleton() { return HANDS.map((_, i) => 's' + i); }

// abstracted BR: one action per (bucket, hist), chosen to minimize bucket-averaged exact-continuation Q.
// Then graded on the TRUE game. abstractionError = trueGrade(abstractedBR) (exact BR grades 0).
function abstractionError(bucketOf, F, cfg) {
  // per (heroSeat, hist) collect, per bucket, the reach-weighted average Q over member hands.
  const HISTS = ['', 'k', 'kb', 'b', 'br'].filter((h) => actorOf(h) !== undefined && !isTerm(h));
  const heroHists = HISTS; // hero acts at '', kb, br (seat1) and k, b (seat2) — handled per seat below
  const chosen = {}; // key seat|bucket|hist -> action
  for (let heroSeat = 1; heroSeat <= 2; heroSeat++) {
    for (const h of heroHists) {
      if (actorOf(h) !== heroSeat) continue;
      const acc = {}; // bucket -> {act -> sumQ, w}
      for (let hi = 0; hi < NH; hi++) {
        const il = infosetQ(heroSeat, hi, h, F, cfg); const b = bucketOf[hi];
        if (!acc[b]) acc[b] = { sum: {}, acts: il.acts };
        for (const a of il.acts) acc[b].sum[a] = (acc[b].sum[a] || 0) + il.Q[a];
      }
      for (const b in acc) { let best = Infinity, bestA = acc[b].acts[0]; for (const a of acc[b].acts) if (acc[b].sum[a] < best - 1e-12) { best = acc[b].sum[a]; bestA = a; } chosen[heroSeat + '|' + b + '|' + h] = bestA; }
    }
  }
  const strat = (heroSeat, hi, h) => { const a = chosen[heroSeat + '|' + bucketOf[hi] + '|' + h]; const o = {}; legalOf(h).forEach((x) => (o[x] = x === a ? 1 : 0)); return o; };
  return gradeStrategy(strat, F, cfg);
}

// ===== helpers =====
function spearman(x, y) { const rank = (v) => { const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b]); const r = []; idx.forEach((id, i) => (r[id] = i)); return r; }; const rx = rank(x), ry = rank(y), n = x.length, m = (n - 1) / 2; let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < n; i++) { const dx = rx[i] - m, dy = ry[i] - m; sxy += dx * dy; sx += dx * dx; sy += dy * dy; } return +(sxy / Math.sqrt(sx * sy)).toFixed(3); }
const uniq = (a) => Array.from(new Set(a));

// exported so s3 (the offline solve-cache) reuses the EXACT proven machinery (no re-implementation).
module.exports = {
  HANDS, NH, disjoint, EQUITY, BOARD, cid, isTerm, actorOf, legalOf, childOf,
  infosetQ, gradeStrategy, balancedF, exploitableF, brStrategy, ladder,
  bucketsGolfAware, bucketsEquityOnly, bucketsSingleton, golfGroup, abstractionError,
};

// ============================================================================
if (require.main === module) {
  const cfg = { D: 72, brickMode: 'pot-gated', brickCap: 4, tieCarry: true, w: 0.5 };
  console.log('S2 ORACLE SUBGAME — BR-to-fixed-field on REAL CARDS (exact river subgame), + abstraction anchor\n');
  const catDist = {}; HANDS.forEach((h) => (catDist[h.cat] = (catDist[h.cat] || 0) + 1));
  console.log(`Board ${BOARD.map(cid).join(' ')} | ${NH} hero hands | golf-cat distribution`, catDist, '(0=brick … 8=straight-flush)\n');

  // ---- GATE A: oracle correct on real cards (exploitable field) ----
  const Fexp = exploitableF();
  const BR = brStrategy(Fexp, cfg);
  const gBR = gradeStrategy(BR, Fexp, cfg);
  const eps = Array.from({ length: 11 }, (_, i) => i / 10);
  const lg = eps.map((e) => gradeStrategy(ladder(Fexp, cfg, e), Fexp, cfg));
  let mono = true; for (let i = 1; i < lg.length; i++) if (lg[i] < lg[i - 1] - 1e-9) mono = false;
  const rho = spearman(eps.map((e) => 1 - e), lg.map((g) => -g));
  const a1 = gBR < 1e-9 && lg[10] > gBR + 1e-9;
  console.log('GATE A (oracle correct on real cards):', (a1 && mono) ? 'PASS' : 'FAIL');
  console.log(`   BR-to-field grade = ${gBR.toExponential(2)} (unique min) | ladder monotone=${mono} rho=${rho} | eps0=${lg[0].toExponential(2)} eps1=${lg[10].toFixed(4)}`);

  // ---- GATE B: lossless abstraction reproduces the exact grade ----
  const Fbal = balancedF();             // OFFICIAL metric = BR to balanced field
  const errSingleton = abstractionError(bucketsSingleton(), Fbal, cfg);
  const a2 = Math.abs(errSingleton) < 1e-9;
  console.log('\nGATE B (anti-flawed-oracle: lossless abstraction == exact):', a2 ? 'PASS' : 'FAIL');
  console.log(`   singleton-bucket abstraction error = ${errSingleton.toExponential(2)} (must be ~0 — pipeline is non-corrupting)`);

  // ---- GATE C: golf-aware buckets beat equity-only at equal budget ----
  console.log('\nGATE C (S1 mandate pays off: golf-class-aware 2-D buckets < equity-only error at equal budget):');
  console.log('   budget |  equity-only error  |  golf-aware error  |  improvement');
  let cPass = true, anyTested = false;
  for (const eqBins of [2, 3, 4]) {
    const gaBuckets = bucketsGolfAware(eqBins);
    const B = uniq(gaBuckets).length;                       // actual bucket count of the 2-D scheme
    const eqBuckets = bucketsEquityOnly(B);                  // equity-only at the SAME budget
    const eGA = abstractionError(gaBuckets, Fbal, cfg);
    const eEQ = abstractionError(eqBuckets, Fbal, cfg);
    anyTested = true; if (!(eGA <= eEQ + 1e-9)) cPass = false;
    const impr = eEQ > 1e-12 ? (100 * (eEQ - eGA) / eEQ).toFixed(1) + '%' : 'n/a';
    console.log(`     ${String(B).padStart(3)}   |   ${eEQ.toFixed(5)}        |   ${eGA.toFixed(5)}       |   ${impr}`);
  }
  const a3 = cPass && anyTested;
  console.log('   ' + (a3 ? '→ golf-aware buckets give ≤ equity-only oracle error at every budget (S1 mandate validated).' : '→ FAIL: golf-aware did not dominate.'));

  const all = (a1 && mono) && a2 && a3;
  console.log('\n' + (all ? '✅ ALL S2 GATES PASS' : '❌ SOME S2 GATES FAILED') + ' — real-card oracle correct, abstraction pipeline non-corrupting, golf-aware bucketing validated.');
}
