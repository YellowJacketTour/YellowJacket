// s4-twostreet.js — S4 (capstone) for Hold'em Oracle v0: the TWO-STREET REAL-CARD oracle. Composes the
// proven multi-street method (public card updates the range) with the real-card oracle (canon
// evalSevenCard) — the toy→real jump across a street transition.
//
// Game: reduced deck (7 ranks × 2 suits = 14). Fixed 4-card "turn board". Each player holds 2 of the 10
// remaining; street-1 (turn) betting; the RIVER is revealed (1 chance card → 5-card board); street-2
// (river) betting; showdown on the full 5-card board via canon evalSevenCard. Matched-total proposals,
// streets bet 2 then 4. Complete Honey-Stroke payoff (golf + brick ladder + tie-carry + honey), unified
// score = golf − honey/divisor (LOWER better). Exact (enumerable; hand values precomputed).
//
// GATES (the four that are NEW at two-street real-card scale; ground-truth/lossless already anchored by
// S2 byte-for-byte + S3 cache):
//   A — oracle correct: BR-to-exploitable-field = 0 (unique min), eps-ladder monotone.
//   B — brick discipline carries across two streets (pot-gated punishes over-commit ≫ flat-+1).
//   C — RANGE UPDATE on a real river: a hand's street-2 best response changes with the river card.
//   D — concentration + the AIVAT point: EV-loss grading is already an expectation (low variance); the
//       enumerable-exact grade is the variance-reduction LIMIT vs finite-sample MC.
'use strict';

// ===== canon evaluator (verbatim) =====
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
  let sf = 0;
  if (flushCards) { const fu = Array.from(new Set(flushCards)).sort((a, b) => b - a); const p2 = fu.concat(fu.includes(14) ? [1] : []); for (let i = 0; i + 4 < p2.length; i++) if (p2[i] - p2[i + 4] === 4) { sf = p2[i]; break; } }
  const pairs = [], trips = [], quads = [];
  for (const r in counts) { if (counts[r] === 2) pairs.push(RO[r]); if (counts[r] === 3) trips.push(RO[r]); if (counts[r] === 4) quads.push(RO[r]); }
  pairs.sort((a, b) => b - a); trips.sort((a, b) => b - a); quads.sort((a, b) => b - a);
  let value = 0, cat = 0;
  if (sf) { value = 800 + sf; cat = 8; } else if (quads.length) { value = 700 + quads[0]; cat = 7; }
  else if (trips.length && (pairs.length || trips.length >= 2)) { value = 600 + trips[0]; cat = 6; }
  else if (flushCards) { value = 500 + flushCards[0]; cat = 5; } else if (straightHigh) { value = 400 + straightHigh; cat = 4; }
  else if (trips.length) { value = 300 + trips[0]; cat = 3; } else if (pairs.length >= 2) { value = 200 + pairs[0] * 14 + pairs[1]; cat = 2; }
  else if (pairs.length === 1) { value = 100 + pairs[0]; cat = 1; } else { value = ranks[0]; cat = 0; }
  value = value * 100 + (ranks[0] || 0);
  let golf;
  if (sf) golf = -5; else if (quads.length) golf = -4;
  else if (trips.length && (pairs.length || trips.length >= 2)) golf = (trips[0] >= 11 ? -3 : -2);
  else if (flushCards) golf = (flushCards[0] >= 10 ? -2 : -1);
  else if (straightHigh) golf = (straightHigh >= 9 ? -2 : -1);
  else if (trips.length) golf = -1; else if (pairs.length >= 2) golf = (pairs[0] >= 11 ? -1 : 0);
  else if (pairs.length === 1) golf = (pairs[0] >= 10 ? 0 : 1); else golf = ((ranks[0] || 0) >= 11 ? 1 : 2);
  return { value, golf, cat };
}
function resolveBrickLoss(T, opener, mode, cap) { if (mode === 'pot-gated') { const op = (+opener >= 1 ? +opener : 2), t = Math.max(op, +T || op), c = +cap || 4; return Math.max(1, Math.min(c, 1 + Math.max(0, Math.floor((t - op) / op)))); } return 1; }

// ===== deck / board / hands =====
// gappy, STRAIGHT-PROOF ranks (no 5 consecutive) so high-card BRICKS (cat 0) actually exist — a
// connected deck makes every unpaired hand a straight, leaving no bricks to test the discipline axis.
// 7 evenly-gapped (every-other) ranks → NO straights possible, and 4-card board leaves 3 non-board
// ranks so an unpaired 2-hole + river hand can be 3 DISTINCT off-board ranks = a real high-card BRICK.
const RANKS = ['2', '4', '6', '8', 'T', 'Q', 'A'], SUITS = ['s', 'h'];
const DECK = []; for (const r of RANKS) for (const s of SUITS) DECK.push({ rank: r, suit: s });
const cid = (c) => c.rank + c.suit;
const ID2I = {}; DECK.forEach((c, i) => (ID2I[cid(c)] = i));
const BOARD4 = ['Ah', 'Qs', '8h', '4s'].map((s) => DECK[ID2I[s]]);      // dry, gappy turn board → bricks exist
const boardSet = new Set(BOARD4.map(cid));
const REM = DECK.filter((c) => !boardSet.has(cid(c)));                   // 10 cards
// hands = all 2-card combos of REM
const HANDS = [];
for (let i = 0; i < REM.length; i++) for (let j = i + 1; j < REM.length; j++) HANDS.push({ cards: [REM[i], REM[j]], idx: [ID2I[cid(REM[i])], ID2I[cid(REM[j])]] });
const NH = HANDS.length;
const handMask = HANDS.map((h) => (1 << h.idx[0]) | (1 << h.idx[1]));
const boardMask = BOARD4.reduce((m, c) => m | (1 << ID2I[cid(c)]), 0);
const disjoint = (a, b) => (handMask[a] & handMask[b]) === 0;

// precompute showdown eval per (hand, river card index) — the only evalSevenCard cost, done once
const VAL = HANDS.map(() => ({}));
for (let h = 0; h < NH; h++) {
  for (let r = 0; r < DECK.length; r++) {
    if ((boardMask & (1 << r)) || (handMask[h] & (1 << r))) continue;
    VAL[h][r] = evalSevenCard(HANDS[h].cards.concat(BOARD4, [DECK[r]]));
  }
}
// river candidates given hero+villain hands
function rivers(hi, vi) { const used = boardMask | handMask[hi] | handMask[vi]; const out = []; for (let r = 0; r < DECK.length; r++) if (!(used & (1 << r))) out.push(r); return out; }
// street-1 (turn) equity of a hand vs uniform range over remaining rivers — for street-1 bucketing/strength
const EQUITY1 = HANDS.map((_, hi) => {
  let win = 0, n = 0;
  for (let vi = 0; vi < NH; vi++) { if (!disjoint(hi, vi)) continue; const rs = rivers(hi, vi); for (const r of rs) { n++; const a = VAL[hi][r].value, b = VAL[vi][r].value; win += a > b ? 1 : a === b ? 0.5 : 0; } }
  return n ? win / n : 0.5;
});

// ===== two-street matched-total betting (same tree as yj-multistreet-gate) =====
const ANTE = 1, OPENER_POT = 2, BETSIZE = { 1: 2, 2: 4 };
const FOLD_TERMS = { kbf: 1, bf: 2, brf: 1 };
const STREET_END = { kk: 1, kbc: 1, bc: 1, brc: 1 };
const isStreetEnd = (s) => STREET_END[s] === 1;
const isFold = (s) => Object.prototype.hasOwnProperty.call(FOLD_TERMS, s);
const actorOf = (s) => ({ '': 1, k: 2, kb: 1, b: 2, br: 1 })[s];
const legalOf = (s) => (s === '' || s === 'k') ? ['k', 'b'] : (s === 'kb' || s === 'br') ? ['f', 'c'] : ['f', 'c', 'r'];
function applyAct(street, s, act) {
  const B = BETSIZE[street]; const add = (seat, amt) => (seat === 1 ? { dCH: amt, dCV: 0 } : { dCH: 0, dCV: amt });
  if (s === '') return act === 'k' ? { s: 'k', dCH: 0, dCV: 0 } : { s: 'b', ...add(1, B) };
  if (s === 'k') return act === 'k' ? { s: 'kk', dCH: 0, dCV: 0 } : { s: 'kb', ...add(2, B) };
  if (s === 'kb') return act === 'f' ? { s: 'kbf', dCH: 0, dCV: 0 } : { s: 'kbc', ...add(1, B) };
  if (s === 'b') return act === 'f' ? { s: 'bf', dCH: 0, dCV: 0 } : act === 'c' ? { s: 'bc', ...add(2, B) } : { s: 'br', ...add(2, 2 * B) };
  return act === 'f' ? { s: 'brf', dCH: 0, dCV: 0 } : { s: 'brc', ...add(1, B) };
}

function showdownScore(heroSeat, hi, vi, river, cH, cV, cfg) {
  const H = VAL[hi][river], V = VAL[vi][river], C = heroSeat === 1 ? cH : cV, pot = cH + cV, D = cfg.D;
  if (H.value > V.value) return H.golf - C / D;
  if (H.value < V.value) { const stroke = H.cat >= 4 ? H.golf : H.cat === 0 ? resolveBrickLoss(pot, OPENER_POT, cfg.brickMode, cfg.brickCap) : 1; return stroke + C / D; }
  return 0 - (cfg.tieCarry ? (2 * cfg.w - 1) * (pot / 2) : 0) / D;
}
function foldScore(heroSeat, folderSeat, cH, cV, cfg) { return folderSeat === heroSeat ? 1 + (heroSeat === 1 ? cH : cV) / cfg.D : 0 - (folderSeat === 1 ? cH : cV) / cfg.D; }

// exact evaluator: hero=BR(min), villain=field F(mix), river=chance(avg)
function evalState(street, river, s, cH, cV, heroSeat, hi, vi, F, cfg) {
  if (isFold(s)) return foldScore(heroSeat, FOLD_TERMS[s], cH, cV, cfg);
  if (isStreetEnd(s)) {
    if (street === 1) { const rs = rivers(hi, vi); let acc = 0; for (const r of rs) acc += evalState(2, r, '', cH, cV, heroSeat, hi, vi, F, cfg); return acc / rs.length; }
    return showdownScore(heroSeat, hi, vi, river, cH, cV, cfg);
  }
  const actor = actorOf(s), acts = legalOf(s);
  if (actor === heroSeat) { let best = Infinity; for (const a of acts) { const t = applyAct(street, s, a); best = Math.min(best, evalState(street, river, t.s, cH + t.dCH, cV + t.dCV, heroSeat, hi, vi, F, cfg)); } return best; }
  const d = F(actor, vi, street, river, s); let v = 0; for (const a of acts) { const p = d[a] || 0; if (p) { const t = applyAct(street, s, a); v += p * evalState(street, river, t.s, cH + t.dCH, cV + t.dCV, heroSeat, hi, vi, F, cfg); } } return v;
}

// belief over villain hand at a hero infoset (disjoint from hero + revealed river) × action replay
function belief(heroSeat, hi, street, river, s1Hist, s2Hist, F) {
  const villSeat = heroSeat === 1 ? 2 : 1; const w = new Array(NH).fill(0);
  const blocked = boardMask | handMask[hi] | (street === 2 ? (1 << river) : 0);
  for (let vi = 0; vi < NH; vi++) {
    if (handMask[vi] & blocked) continue;
    let p = 1, cur = '';
    for (const a of s1Hist) { if (actorOf(cur) === villSeat) p *= (F(villSeat, vi, 1, null, cur)[a] || 0); cur += a; }
    if (street === 2) { cur = ''; for (const a of s2Hist) { if (actorOf(cur) === villSeat) p *= (F(villSeat, vi, 2, river, cur)[a] || 0); cur += a; } }
    w[vi] = p;
  }
  const Z = w.reduce((x, y) => x + y, 0); return Z > 0 ? w.map((x) => x / Z) : w;
}
function infosetQ(ctx, F, cfg) {
  const { heroSeat, hi, street, river, s, s1Hist, s2Hist, cH, cV } = ctx;
  const bel = belief(heroSeat, hi, street, river, s1Hist, s2Hist, F), acts = legalOf(s), Q = {};
  for (const a of acts) { const t = applyAct(street, s, a); let q = 0; for (let vi = 0; vi < NH; vi++) if (bel[vi] > 0) q += bel[vi] * evalState(street, river, t.s, cH + t.dCH, cV + t.dCV, heroSeat, hi, vi, F, cfg); Q[a] = q; }
  let bestQ = Infinity, brAct = acts[0]; for (const a of acts) if (Q[a] < bestQ - 1e-12) { bestQ = Q[a]; brAct = a; }
  const loss = {}; for (const a of acts) loss[a] = Q[a] - bestQ; return { Q, bestQ, brAct, loss, acts };
}

// grade a strategy exactly over all deals + river chance + both streets
function gradeStrategy(strat, F, cfg) {
  let grade = 0;
  for (let heroSeat = 1; heroSeat <= 2; heroSeat++) {
    for (let hi = 0; hi < NH; hi++) {
      const disj = []; for (let vi = 0; vi < NH; vi++) if (vi !== hi && disjoint(hi, vi)) disj.push(vi);
      const pHand = 1 / NH, pV = 1 / disj.length;
      for (const vi of disj) {
        const walk = (street, river, s, cH, cV, s1Hist, reach) => {
          if (isFold(s)) return;
          if (isStreetEnd(s)) { if (street === 1) { const rs = rivers(hi, vi); for (const r of rs) walk(2, r, '', cH, cV, s1Hist, reach / rs.length); } return; }
          const actor = actorOf(s), acts = legalOf(s), s1H = street === 1 ? s : s1Hist, s2H = street === 2 ? s : '';
          if (actor === heroSeat) {
            const ctx = { heroSeat, hi, street, river, s, s1Hist, s2Hist: s2H, cH, cV };
            const il = infosetQ(ctx, F, cfg), sd = strat(ctx);
            let exp = 0; for (const a of acts) exp += (sd[a] || 0) * il.loss[a]; grade += reach * exp;
            for (const a of acts) { const p = sd[a] || 0; if (p) { const t = applyAct(street, s, a); walk(street, river, t.s, cH + t.dCH, cV + t.dCV, s1H, reach * p); } }
          } else { const d = F(actor, vi, street, river, s); for (const a of acts) { const p = d[a] || 0; if (p) { const t = applyAct(street, s, a); walk(street, river, t.s, cH + t.dCH, cV + t.dCV, s1H, reach * p); } } }
        };
        walk(1, null, '', ANTE, ANTE, '', pHand * pV);
      }
    }
  }
  return grade / 2;
}

// ===== fields (street/river aware) =====
function balancedF() { return (actor, vi, street, river, s) => { const acts = legalOf(s), p = 1 / acts.length, o = {}; acts.forEach((a) => (o[a] = p)); return o; }; }
// exploitable: aggression tracks the villain hand strength (street-1 equity, or final value vs board at river)
function strengthOf(vi, street, river) {
  if (street === 2 && river != null) { const v = VAL[vi][river]; return Math.max(0.05, Math.min(0.95, (v.value % 100000) / 90000 * 0.6 + (v.cat / 8) * 0.4)); }
  return EQUITY1[vi];
}
function exploitableF() {
  return (actor, vi, street, river, s) => {
    const st = strengthOf(vi, street, river);
    if (s === '' || s === 'k') { const pBet = 0.10 + 0.80 * st; return { k: 1 - pBet, b: pBet }; }
    if (s === 'kb' || s === 'br') { const pCall = 0.10 + 0.85 * st; return { f: 1 - pCall, c: pCall }; }
    const pFold = (1 - st) * 0.8, pRaise = st * st * 0.55, pCall = Math.max(0, 1 - pFold - pRaise); return { f: pFold, c: pCall, r: pRaise };
  };
}
const brStrategy = (F, cfg) => (ctx) => { const il = infosetQ(ctx, F, cfg), o = {}; il.acts.forEach((a) => (o[a] = a === il.brAct ? 1 : 0)); return o; };
const ladder = (F, cfg, eps) => { const br = brStrategy(F, cfg); return (ctx) => { const acts = legalOf(ctx.s), b = br(ctx), o = {}; acts.forEach((a) => (o[a] = (1 - eps) * (b[a] || 0) + eps / acts.length)); return o; }; };

function spearman(x, y) { const rank = (v) => { const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b]); const r = []; idx.forEach((id, i) => (r[id] = i)); return r; }; const rx = rank(x), ry = rank(y), n = x.length, m = (n - 1) / 2; let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < n; i++) { const dx = rx[i] - m, dy = ry[i] - m; sxy += dx * dy; sx += dx * dx; sy += dy * dy; } return +(sxy / Math.sqrt(sx * sy)).toFixed(3); }

// ============================================================================
if (require.main === module) {
  const cfg = { D: 72, brickMode: 'pot-gated', brickCap: 4, tieCarry: true, w: 0.5 };
  console.log('S4 TWO-STREET REAL-CARD ORACLE — turn board + river chance + showdown (canon evalSevenCard)\n');
  console.log(`Board(turn) ${BOARD4.map(cid).join(' ')} | ${NH} hands | reduced deck ${RANKS.join('')}×${SUITS.join('')}\n`);

  const Fexp = exploitableF();
  // ---- GATE A ----
  const gBR = gradeStrategy(brStrategy(Fexp, cfg), Fexp, cfg);
  const eps = [0, .2, .4, .6, .8, 1.0];
  const lg = eps.map((e) => gradeStrategy(ladder(Fexp, cfg, e), Fexp, cfg));
  let mono = true; for (let i = 1; i < lg.length; i++) if (lg[i] < lg[i - 1] - 1e-9) mono = false;
  const rho = spearman(eps.map((e) => 1 - e), lg.map((g) => -g));
  const a1 = gBR < 1e-9 && lg[lg.length - 1] > gBR + 1e-9;
  console.log('GATE A (two-street oracle correct on real cards):', (a1 && mono) ? 'PASS' : 'FAIL');
  console.log(`   BR grade=${gBR.toExponential(2)} | monotone=${mono} rho=${rho} | ladder ${lg.map((g) => g.toFixed(3)).join(' ')}`);

  // ---- GATE B: brick discipline — ISOLATED at the infoset where it bites (calling a brick down on a
  // street-2 bet, which forces a showdown into a grown pot). The global brick-spewer is too blunt on a
  // foldy field (bluffing bricks is optimal there); the ladder's contribution is isolated by comparing
  // the EV-loss of CALLING DOWN a brick under pot-gated vs flat-+1, over every realized-brick spot. ----
  const cfgFlat = { ...cfg, brickMode: 'flat' };
  // build a street-2 "S1 faces S2's bet after a checked-through turn" node: s='kb', cH=1, cV=5, pot grows on call
  let nBrick = 0, sumPot = 0, sumFlat = 0, exampleShown = false;
  for (let hi = 0; hi < NH; hi++) {
    for (let r = 0; r < DECK.length; r++) {
      if (!VAL[hi][r] || VAL[hi][r].cat !== 0) continue;                 // hero holds a realized brick
      const ctx = { heroSeat: 1, hi, street: 2, river: r, s: 'kb', s1Hist: 'kk', s2Hist: 'kb', cH: 1, cV: 5 };
      const lp = infosetQ(ctx, Fexp, cfg).loss['c'];                     // EV-loss of CALLING (showdown the brick)
      const lf = infosetQ(ctx, Fexp, cfgFlat).loss['c'];
      nBrick++; sumPot += lp; sumFlat += lf;
      if (!exampleShown && lp > lf + 0.05) { console.log(`   e.g. brick ${HANDS[hi].cards.map(cid).join('')} on river ${cid(DECK[r])}: loss(call) pot-gated=${lp.toFixed(3)} vs flat=${lf.toFixed(3)}`); exampleShown = true; }
    }
  }
  const meanPot = sumPot / nBrick, meanFlat = sumFlat / nBrick;
  const a2 = meanPot > meanFlat + 1e-6;
  console.log('\nGATE B (brick discipline across two streets, isolated where it bites):', a2 ? 'PASS' : 'FAIL');
  console.log(`   mean EV-loss of CALLING DOWN a brick (${nBrick} brick spots):  pot-gated=${meanPot.toFixed(4)}  flat-+1=${meanFlat.toFixed(4)}  → the ladder adds +${(meanPot - meanFlat).toFixed(4)} stroke-EV of discipline pressure`);

  // ---- GATE C: the RIVER updates the range → a hand's street-2 BR changes with the river ----
  const Fbal = balancedF();
  console.log('\nGATE C (river updates the range → street-2 best response is river-conditioned):');
  let flips = 0, probed = 0;
  for (let hi = 0; hi < NH && probed < 6; hi++) {
    const rs = []; const seen = {};
    for (let r = 0; r < DECK.length; r++) { if (!VAL[hi][r]) continue; const ctx = { heroSeat: 1, hi, street: 2, river: r, s: '', s1Hist: 'kk', s2Hist: '', cH: ANTE, cV: ANTE }; const il = infosetQ(ctx, Fbal, cfg); rs.push(il.brAct); seen[VAL[hi][r].cat] = (seen[VAL[hi][r].cat] || 0) + 1; }
    const distinct = new Set(rs);
    if (distinct.size > 1) { flips++; if (probed < 4) console.log(`   hand ${HANDS[hi].cards.map(cid).join('')}: street-2 BR across rivers = {${[...distinct].join(',')}} (river-dependent)`); }
    probed++;
  }
  const a3 = flips > 0;
  console.log(`   → best response changed with the river for ${flips}/${probed} probed hands (real-card range update is load-bearing).`);

  // ---- GATE D: concentration + the AIVAT / variance-reduction point ----
  // EV-loss grading already scores the EXPECTATION at each decision (over villain belief), so the only
  // remaining variance is which deals are sampled. The exact enumerable grade is the variance-reduction
  // LIMIT (zero sampling variance) — the role AIVAT plays when enumeration is impossible.
  function mcMeanLoss(S, F, N, rng) {
    let sum = 0, cnt = 0;
    for (let i = 0; i < N; i++) {
      const heroSeat = (i % 2) + 1;
      // sample a deal: hero hand, villain hand disjoint, then play sampling actions + river chance
      const hi = (rng() * NH) | 0; const disj = []; for (let v = 0; v < NH; v++) if (v !== hi && disjoint(hi, v)) disj.push(v); const vi = disj[(rng() * disj.length) | 0];
      let street = 1, river = null, s = '', cH = ANTE, cV = ANTE, s1Hist = '';
      for (;;) {
        if (isFold(s)) break;
        if (isStreetEnd(s)) { if (street === 1) { const rs = rivers(hi, vi); river = rs[(rng() * rs.length) | 0]; street = 2; s = ''; continue; } break; }
        const actor = actorOf(s), acts = legalOf(s), s1H = street === 1 ? s : s1Hist;
        let pick;
        if (actor === heroSeat) { const ctx = { heroSeat, hi, street, river, s, s1Hist, s2Hist: street === 2 ? s : '', cH, cV }; const il = infosetQ(ctx, F, cfg); const sd = S(ctx); let x = rng(); pick = acts[acts.length - 1]; for (const a of acts) { x -= (sd[a] || 0); if (x <= 0) { pick = a; break; } } sum += il.loss[pick]; cnt++; }
        else { const d = F(actor, vi, street, river, s); let x = rng(); pick = acts[acts.length - 1]; for (const a of acts) { x -= (d[a] || 0); if (x <= 0) { pick = a; break; } } }
        const t = applyAct(street, s, pick); s = t.s; cH += t.dCH; cV += t.dCV; if (street === 1) s1Hist = s1H;
      }
    }
    return cnt ? sum / cnt : 0;
  }
  const A = ladder(Fexp, cfg, 0.20), B = ladder(Fexp, cfg, 0.30);
  const exactA = gradeStrategy(A, Fexp, cfg), exactB = gradeStrategy(B, Fexp, cfg);
  let seed = 777; const rng = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const N = 72, trials = 600; let right = 0;
  for (let t = 0; t < trials; t++) if (mcMeanLoss(A, Fexp, N, rng) < mcMeanLoss(B, Fexp, N, rng)) right++;
  const a4 = exactA < exactB; // the stronger player has the lower exact grade (zero-variance separation)
  console.log('\nGATE D (concentration + variance-reduction/AIVAT point):', a4 ? 'PASS' : 'FAIL');
  console.log(`   EXACT grades (zero sampling variance — the AIVAT limit): eps0.20=${exactA.toFixed(4)} < eps0.30=${exactB.toFixed(4)} → separated with certainty`);
  console.log(`   finite-sample MC (${N} hands): the better player ranks correctly ${(100 * right / trials).toFixed(1)}% of the time (variance from deal-sampling only — what AIVAT shrinks)`);

  const all = (a1 && mono) && a2 && a3 && a4;
  console.log('\n' + (all ? '✅ ALL S4 GATES PASS' : '❌ SOME S4 GATES FAILED') + ' — two-street real-card oracle: correct, brick-disciplined, river-range-updating, concentrating.');
  console.log('(Ground-truth/lossless-abstraction anchored by S2 byte-for-byte + S3 cache; full 52-card + production cache = pure compute scaling, post-v0.)');
}
