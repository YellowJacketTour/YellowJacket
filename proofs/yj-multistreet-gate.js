// yj-multistreet-gate.js — MULTI-STREET YJ-faithful Honey-Stroke gate (the rung above the
// single-street yj-honeystroke-gate.js, and the correct rebuild of the NaN'd leduc-grader-gate.js).
//
// The ONE new thing above the single-street gate: a PUBLIC BOARD CARD revealed between two betting
// streets that UPDATES THE OPPONENT RANGE (the canonical Leduc mechanism) — does the complete
// Honey-Stroke EV-loss grader stay correct (BR=0, monotone) when the villain's range is re-weighted
// by a public card and a second, larger street of matched-total proposals?
//
// Hand model (Leduc-faithful): deck = ranks {0,1,2} (values 9 / J / A), TWO copies each (6 cards).
// Each player one private card; one public board card. Final hand = PAIR (cat 1) if private==board,
// else HIGH CARD (cat 0, a brick). At most one player can pair a given board (only one copy left).
// Showdown: pair > high card; ties when equal hv (same pair impossible; two equal high cards tie).
//
// Betting: matched-total proposals, ante 1 (opener pot 2). Street 1 bet/raise = 2; street 2 = 4
// (Leduc escalation). Per street: S1 opens [check,bet]; facing a bet [fold,call]; bettor can be
// raised once [fold,call,raise]. Contributions carry across streets.
//
// Scoring is the COMPLETE Honey-Stroke EV, canon-verbatim (golfScoreFromHandValue / resolveBrickLoss
// / golfScoresFromShowdown), unified as score = golf − netHoney/divisor (engine index.html:5830,
// LOWER better), with the brick ladder for high-card losers and tie-carry forward equity.
//
// LAW: EV-loss(infoset, action) = bestQ − Q(action), expectations over the villain RANGE (card
// removal of BOTH the hero card and the public board × villain actions in BOTH streets under the
// field), never the revealed card. Exact (no CFR / no sampling for the core grade).
'use strict';

// ============================================================================
// CANON SCORING — verbatim from index.html (see single-street gate for line refs).
// ============================================================================
function golfScoreFromHandValue(hv) {
  const cat = hv >>> 24, k1 = (hv >>> 20) & 0xF;
  if (cat >= 8) return -5;
  if (cat === 7) return -4;
  if (cat === 6) return (k1 >= 11 ? -3 : -2);
  if (cat === 5) return (k1 >= 10 ? -2 : -1);
  if (cat === 4) return (k1 >= 9 ? -2 : -1);
  if (cat === 3) return -1;
  if (cat === 2) return (k1 >= 11 ? -1 : 0);
  if (cat === 1) return (k1 >= 10 ? 0 : 1);
  return (k1 >= 11 ? 1 : 2);
}
function resolveBrickLoss(T, opener, mode, cap) {
  if (mode === 'pot-gated') {
    const op = (Number.isFinite(+opener) && +opener >= 1) ? +opener : 2;
    const t = (Number.isFinite(+T) && +T >= op) ? +T : op;
    const c = (Number.isFinite(+cap) && +cap >= 1) ? +cap : 4;
    return Math.max(1, Math.min(c, 1 + Math.max(0, Math.floor((t - op) / op))));
  }
  return 1;
}
function golfScoresFromShowdown(winnerHv, loserHv, useLoserBogey, hcSpec, brickMode, brickCap) {
  const wCat = winnerHv >>> 24, lCat = loserHv >>> 24;
  const winnerBase = golfScoreFromHandValue(winnerHv);
  const loserBase = golfScoreFromHandValue(loserHv);
  const brickLoss = resolveBrickLoss(+hcSpec.T, +hcSpec.opener, brickMode, brickCap);
  let winner = winnerBase, loser;
  if (useLoserBogey) loser = (lCat >= 4) ? loserBase : (lCat === 0 ? brickLoss : 1);
  else loser = loserBase;
  if (wCat >= 6 && lCat >= 6 && (wCat - lCat) <= 1) winner = Math.max(-6, winner - 1);
  return { winner, loser };
}

// ============================================================================
// DECK / HANDS
// ============================================================================
const NRANK = 3, COPIES = 2;
const RANKVAL = [9, 11, 14];                 // rank 0,1,2 → card value (drives golf premium buckets)
function handHv(privRank, board) {
  const v = RANKVAL[privRank];
  if (board !== null && privRank === board) return (1 << 24) | (v << 20); // PAIR
  return (0 << 24) | (v << 20);                                            // HIGH CARD (brick)
}
// card-removal rank counts after removing a set of used ranks (each use removes one copy)
function countsAfter(used) {
  const c = new Array(NRANK).fill(COPIES);
  for (const r of used) c[r]--;
  return c;
}

// ============================================================================
// BETTING (within a street) — same shape both streets; bet size differs.
// histories: ''/'k' open [k,b] ; 'kb'/'br' [f,c] ; 'b' [f,c,r]
// streetend (no fold): kk,kbc,bc,brc ; fold: kbf(S1),bf(S2),brf(S1)
// ============================================================================
const ANTE = 1, OPENER_POT = 2;
const BETSIZE = { 1: 2, 2: 4 };              // street → bet (and raise) size
const FOLD_TERMS = { kbf: 1, bf: 2, brf: 1 };// → folder seat
const STREET_END = { kk: 1, kbc: 1, bc: 1, brc: 1 };
const isStreetEnd = (s) => STREET_END[s] === 1;
const isFold = (s) => Object.prototype.hasOwnProperty.call(FOLD_TERMS, s);
const isStreetTerminal = (s) => isStreetEnd(s) || isFold(s);
function actorOf(s) { return ({ '': 1, k: 2, kb: 1, b: 2, br: 1 })[s]; }
function legalOf(s) {
  if (s === '' || s === 'k') return ['k', 'b'];
  if (s === 'kb' || s === 'br') return ['f', 'c'];
  if (s === 'b') return ['f', 'c', 'r'];
  throw new Error('no acts at sub-hist "' + s + '"');
}
// apply an action; returns {s, dCH, dCV} — contribution deltas for S1(CH)/S2(CV)
function applyAct(street, s, act) {
  const B = BETSIZE[street];
  const actor = actorOf(s);
  const add = (seat, amt) => (seat === 1 ? { dCH: amt, dCV: 0 } : { dCH: 0, dCV: amt });
  if (s === '') { if (act === 'k') return { s: 'k', dCH: 0, dCV: 0 }; return { s: 'b', ...add(1, B) }; }
  if (s === 'k') { if (act === 'k') return { s: 'kk', dCH: 0, dCV: 0 }; return { s: 'kb', ...add(2, B) }; }
  if (s === 'kb') { if (act === 'f') return { s: 'kbf', dCH: 0, dCV: 0 }; return { s: 'kbc', ...add(1, B) }; }
  if (s === 'b') {
    if (act === 'f') return { s: 'bf', dCH: 0, dCV: 0 };
    if (act === 'c') return { s: 'bc', ...add(2, B) };
    return { s: 'br', ...add(2, B + B) };  // raise = call the bet (B) + raise (B)
  }
  if (s === 'br') { if (act === 'f') return { s: 'brf', dCH: 0, dCV: 0 }; return { s: 'brc', ...add(1, B) }; }
  throw new Error('applyAct bad state ' + s + ' ' + act);
}

// ============================================================================
// TERMINAL PAYOFF to hero (LOWER better) — complete Honey-Stroke EV.
// ============================================================================
function showdownScore(heroSeat, heroRank, villRank, board, cH, cV, cfg) {
  const hHv = handHv(heroRank, board), vHv = handHv(villRank, board);
  const C = heroSeat === 1 ? cH : cV;        // matched at showdown (cH==cV)
  const pot = cH + cV, D = cfg.D;
  if (hHv > vHv) return golfScoreFromHandValue(hHv) - C / D;
  if (hHv < vHv) {
    const loser = golfScoresFromShowdown(vHv, hHv, true, { T: pot, opener: OPENER_POT }, cfg.brickMode, cfg.brickCap).loser;
    return loser + C / D;
  }
  const tieHoney = cfg.tieCarry ? (2 * cfg.w - 1) * (pot / 2) : 0;
  return 0 - tieHoney / D;
}
function foldScore(heroSeat, folderSeat, cH, cV, cfg) {
  const D = cfg.D;
  if (folderSeat === heroSeat) return 1 + (heroSeat === 1 ? cH : cV) / D;      // hero folded
  return 0 - (folderSeat === 1 ? cH : cV) / D;                                  // hero won folder's stake
}

// ============================================================================
// EXACT EVALUATOR — hero=best-response (min), villain=field F (mix), board=chance (avg).
// state: (street, board, sHist, cH, cV) with private ranks heroRank/villRank known here.
// ============================================================================
function evalState(street, board, s, cH, cV, heroSeat, heroRank, villRank, F, cfg) {
  if (isFold(s)) return foldScore(heroSeat, FOLD_TERMS[s], cH, cV, cfg);
  if (isStreetEnd(s)) {
    if (street === 1) {
      // chance: reveal the board from the remaining deck (after both privates)
      const cnt = countsAfter([heroRank, villRank]);
      const tot = cnt[0] + cnt[1] + cnt[2];
      let acc = 0;
      for (let b = 0; b < NRANK; b++) {
        if (cnt[b] === 0) continue;
        acc += (cnt[b] / tot) * evalState(2, b, '', cH, cV, heroSeat, heroRank, villRank, F, cfg);
      }
      return acc;
    }
    return showdownScore(heroSeat, heroRank, villRank, board, cH, cV, cfg);
  }
  const actor = actorOf(s), acts = legalOf(s);
  if (actor === heroSeat) {
    let best = Infinity;
    for (const a of acts) {
      const t = applyAct(street, s, a);
      best = Math.min(best, evalState(street, board, t.s, cH + t.dCH, cV + t.dCV, heroSeat, heroRank, villRank, F, cfg));
    }
    return best;
  }
  const d = F.dist(actor, villRank, street, board, s);
  let v = 0;
  for (const a of acts) {
    const p = d[a] || 0; if (p === 0) continue;
    const t = applyAct(street, s, a);
    v += p * evalState(street, board, t.s, cH + t.dCH, cV + t.dCV, heroSeat, heroRank, villRank, F, cfg);
  }
  return v;
}

// ============================================================================
// BELIEF over villain rank at a hero infoset (heroSeat, heroRank, street, board, s1Hist, s2Hist):
// card-removal prior (remove hero private + board if revealed) × P(villain's actions in both streets
// | rank) under F, normalized. Info-set only — never the revealed villain card.
// ============================================================================
function replayVillProb(villSeat, villRank, street1Hist, board, street2Hist, F) {
  // product of F probs over villain's actions; street1 uses board=null, street2 uses the board.
  let p = 1;
  const replay = (hist, street, brd) => {
    let cur = '';
    for (const a of hist) {
      const actor = actorOf(cur);
      if (actor === villSeat) p *= (F.dist(actor, villRank, street, brd, cur)[a] || 0);
      cur += a;
    }
  };
  replay(street1Hist, 1, null);
  if (board !== null) replay(street2Hist, 2, board);
  return p;
}
function belief(heroSeat, heroRank, board, s1Hist, s2Hist, F) {
  const villSeat = heroSeat === 1 ? 2 : 1;
  const used = board === null ? [heroRank] : [heroRank, board];
  const cnt = countsAfter(used);
  const w = new Array(NRANK).fill(0);
  for (let v = 0; v < NRANK; v++) {
    if (cnt[v] <= 0) continue;
    w[v] = cnt[v] * replayVillProb(villSeat, v, s1Hist, board, s2Hist, F);
  }
  const Z = w.reduce((s, x) => s + x, 0);
  return Z > 0 ? w.map((x) => x / Z) : cnt.map((c) => (c > 0 ? c : 0));
}

// EV-loss at a hero infoset. Need the live contributions (cH,cV) at the node + which street/board +
// the street histories. Q(action) integrates over belief; bestQ = min.
function infosetLoss(ctx, F, cfg) {
  const { heroSeat, heroRank, street, board, s, s1Hist, s2Hist, cH, cV } = ctx;
  const bel = belief(heroSeat, heroRank, board, s1Hist, s2Hist, F);
  const acts = legalOf(s);
  const Q = {};
  for (const a of acts) {
    const t = applyAct(street, s, a);
    let q = 0;
    for (let v = 0; v < NRANK; v++) if (bel[v] > 0) q += bel[v] * evalState(street, board, t.s, cH + t.dCH, cV + t.dCV, heroSeat, heroRank, v, F, cfg);
    Q[a] = q;
  }
  let bestQ = Infinity, brAct = acts[0];
  for (const a of acts) if (Q[a] < bestQ - 1e-12) { bestQ = Q[a]; brAct = a; }
  const loss = {}; for (const a of acts) loss[a] = Q[a] - bestQ;
  return { Q, bestQ, brAct, loss, acts };
}

// ============================================================================
// GRADE a strategy exactly. strat(ctx) -> dist over legal acts. Probability-weighted walk over all
// deals + board chance + both streets; accumulate P(reach)×E_strat[EV-loss] at hero nodes. Avg seats.
// ============================================================================
function gradeStrategy(strat, F, cfg) {
  let grade = 0;
  for (let heroSeat = 1; heroSeat <= 2; heroSeat++) {
    for (let heroRank = 0; heroRank < NRANK; heroRank++) {
      const pHero = COPIES / (NRANK * COPIES);          // 1/3
      const cntV = countsAfter([heroRank]);
      const totV = cntV[0] + cntV[1] + cntV[2];
      for (let villRank = 0; villRank < NRANK; villRank++) {
        if (cntV[villRank] <= 0) continue;
        const dealP = pHero * (cntV[villRank] / totV);
        // walk one street
        const walkStreet = (street, board, s, cH, cV, s1Hist, reach) => {
          if (isFold(s)) return;
          if (isStreetEnd(s)) {
            if (street === 1) {
              const cnt = countsAfter([heroRank, villRank]);
              const tot = cnt[0] + cnt[1] + cnt[2];
              for (let b = 0; b < NRANK; b++) {
                if (cnt[b] === 0) continue;
                walkStreet(2, b, '', cH, cV, s1Hist, reach * (cnt[b] / tot));
              }
            }
            return; // street2 end = showdown (no decisions left)
          }
          const actor = actorOf(s), acts = legalOf(s);
          const s1H = street === 1 ? s : s1Hist;
          const s2H = street === 2 ? s : '';
          if (actor === heroSeat) {
            const ctx = { heroSeat, heroRank, street, board, s, s1Hist, s2Hist: s2H, cH, cV };
            const il = infosetLoss(ctx, F, cfg);
            const sd = strat(ctx, F, cfg);
            let expLoss = 0; for (const a of acts) expLoss += (sd[a] || 0) * il.loss[a];
            grade += reach * expLoss;
            for (const a of acts) { const p = sd[a] || 0; if (p === 0) continue; const t = applyAct(street, s, a); walkStreet(street, board, t.s, cH + t.dCH, cV + t.dCV, s1H, reach * p); }
          } else {
            const d = F.dist(actor, villRank, street, board, s);
            for (const a of acts) { const p = d[a] || 0; if (p === 0) continue; const t = applyAct(street, s, a); walkStreet(street, board, t.s, cH + t.dCH, cV + t.dCV, s1H, reach * p); }
          }
        };
        walkStreet(1, null, '', ANTE, ANTE, '', dealP);
      }
    }
  }
  return grade / 2;
}

// ============================================================================
// FIELD F — board/street-aware, exploitable (aggression tracks strength; under-bluffs, over-folds).
// ============================================================================
function strengthOf(privRank, street, board) {
  if (street === 2 && board !== null && privRank === board) return 0.75 + 0.05 * privRank; // paired
  // unpaired / street-1: by private rank only
  return 0.18 + 0.22 * privRank;
}
function makeField() {
  return {
    dist(actorSeat, privRank, street, board, s) {
      const st = strengthOf(privRank, street, board);
      if (s === '' || s === 'k') { const pBet = 0.10 + 0.80 * st; return { k: 1 - pBet, b: pBet }; }
      if (s === 'kb' || s === 'br') { const pCall = 0.10 + 0.85 * st; return { f: 1 - pCall, c: pCall }; }
      if (s === 'b') {
        const pFold = (1 - st) * 0.80;
        const pRaise = st * st * 0.55;
        const pCall = Math.max(0, 1 - pFold - pRaise);
        return { f: pFold, c: pCall, r: pRaise };
      }
      throw new Error('field no node ' + s);
    },
  };
}
const BALANCED = { dist(a, r, st, b, s) { const acts = legalOf(s), p = 1 / acts.length, o = {}; acts.forEach((x) => (o[x] = p)); return o; } };
const NIT = {
  dist(a, r, st, b, s) {
    if (s === '' || s === 'k') return { k: 0.70, b: 0.30 };
    if (s === 'kb' || s === 'br') return { f: 0.70, c: 0.30 };
    return { f: 0.70, c: 0.20, r: 0.10 };
  },
};

// ============================================================================
// STRATEGIES — BR, eps-ladder, field.
// ============================================================================
function brStrategy(F, cfg) {
  return (ctx) => { const il = infosetLoss(ctx, F, cfg); const o = {}; il.acts.forEach((a) => (o[a] = a === il.brAct ? 1 : 0)); return o; };
}
function ladderStrategy(F, cfg, eps) {
  const br = brStrategy(F, cfg);
  return (ctx) => { const acts = legalOf(ctx.s); const b = br(ctx); const o = {}; acts.forEach((a) => (o[a] = (1 - eps) * (b[a] || 0) + eps / acts.length)); return o; };
}
const fieldStrategy = (F) => (ctx) => F.dist(actorOf(ctx.s), ctx.heroRank, ctx.street, ctx.board, ctx.s);

// ============================================================================
// NEXT-HOLE POT-WIN SHARE w — carry-free BR vs F, fraction of decisive pots the BR takes.
// ============================================================================
function potWinShare(F) {
  const cfg0 = { D: 1, brickMode: 'pot-gated', brickCap: 4, tieCarry: false, w: 0.5 };
  const br = brStrategy(F, cfg0);
  let win = 0, lose = 0;
  for (let heroSeat = 1; heroSeat <= 2; heroSeat++) {
    for (let heroRank = 0; heroRank < NRANK; heroRank++) {
      const pHero = COPIES / (NRANK * COPIES);
      const cntV = countsAfter([heroRank]); const totV = cntV[0] + cntV[1] + cntV[2];
      for (let villRank = 0; villRank < NRANK; villRank++) {
        if (cntV[villRank] <= 0) continue;
        const dealP = pHero * (cntV[villRank] / totV);
        const walk = (street, board, s, cH, cV, s1Hist, reach) => {
          if (isFold(s)) { if (FOLD_TERMS[s] === heroSeat) lose += reach; else win += reach; return; }
          if (isStreetEnd(s)) {
            if (street === 1) { const cnt = countsAfter([heroRank, villRank]); const tot = cnt[0] + cnt[1] + cnt[2]; for (let b = 0; b < NRANK; b++) if (cnt[b]) walk(2, b, '', cH, cV, s1Hist, reach * (cnt[b] / tot)); return; }
            const hHv = handHv(heroRank, board), vHv = handHv(villRank, board);
            if (hHv > vHv) win += reach; else if (hHv < vHv) lose += reach; return;
          }
          const actor = actorOf(s), acts = legalOf(s), s1H = street === 1 ? s : s1Hist;
          if (actor === heroSeat) { const ctx = { heroSeat, heroRank, street, board, s, s1Hist, s2Hist: street === 2 ? s : '', cH, cV }; const b = br(ctx); for (const a of acts) { const p = b[a] || 0; if (!p) continue; const t = applyAct(street, s, a); walk(street, board, t.s, cH + t.dCH, cV + t.dCV, s1H, reach * p); } }
          else { const d = F.dist(actor, villRank, street, board, s); for (const a of acts) { const p = d[a] || 0; if (!p) continue; const t = applyAct(street, s, a); walk(street, board, t.s, cH + t.dCH, cV + t.dCV, s1H, reach * p); } }
        };
        walk(1, null, '', ANTE, ANTE, '', dealP);
      }
    }
  }
  return win / (win + lose);
}

// ============================================================================
function spearman(x, y) {
  const rank = (v) => { const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b]); const r = []; idx.forEach((id, i) => (r[id] = i)); return r; };
  const rx = rank(x), ry = rank(y), n = x.length, m = (n - 1) / 2; let sxy = 0, sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { const dx = rx[i] - m, dy = ry[i] - m; sxy += dx * dy; sx += dx * dx; sy += dy * dy; }
  return +(sxy / Math.sqrt(sx * sy)).toFixed(3);
}
const fx = (n) => (n >= 0 ? ' ' : '') + n.toFixed(4);

// ============================================================================
// MAIN
// ============================================================================
if (require.main === module) {
  const F = makeField();
  const w = potWinShare(F), wBal = potWinShare(BALANCED), wNit = potWinShare(NIT);
  const D = 72;
  const cfg = { D, brickMode: 'pot-gated', brickCap: 4, tieCarry: true, w };

  console.log('YJ MULTI-STREET HONEY-STROKE GATE — public board updates the range across two streets\n');
  console.log('Hand model: ranks {9,J,A}×2; private + public board; PAIR(private==board) > HIGH-CARD brick. Streets bet 2 then 4.');
  console.log('Next-hole pot-win share of the BR:  vs F =', w.toFixed(4), ' vs balanced =', wBal.toFixed(4), ' vs nit =', wNit.toFixed(4), '\n');

  const BR = brStrategy(F, cfg);
  const archetypes = [
    ['best-response-to-F (exact optimum)', BR],
    ['eps 0.25 (strong)', ladderStrategy(F, cfg, 0.25)],
    ['eps 0.50 (mid)', ladderStrategy(F, cfg, 0.50)],
    ['eps 0.75 (weak)', ladderStrategy(F, cfg, 0.75)],
    ['uniform random', ladderStrategy(F, cfg, 1.0)],
    ['plays-the-field (mimics F)', fieldStrategy(F)],
  ];
  console.log('Archetype grades (mean reach-weighted EV-loss per hand, LOWER=better):');
  const rows = archetypes.map(([n, S]) => [n, gradeStrategy(S, F, cfg)]);
  rows.forEach(([n, g]) => console.log('  ' + fx(g) + '   ' + n));

  // #1 BR unique min ~0
  const brG = gradeStrategy(BR, F, cfg);
  const others = rows.filter(([n]) => !n.startsWith('best-response')).map(([, g]) => g);
  const a1 = brG < 1e-9 && Math.min(...others) > brG + 1e-9;
  console.log('\n  ACCEPTANCE #1 (BR-to-F unique minimum, ~0):', a1 ? 'PASS' : 'FAIL', `(BR=${brG.toExponential(2)})`);

  // #2 monotone ladder
  const eps = Array.from({ length: 21 }, (_, i) => i / 20);
  const lg = eps.map((e) => gradeStrategy(ladderStrategy(F, cfg, e), F, cfg));
  let mono = true; for (let i = 1; i < lg.length; i++) if (lg[i] < lg[i - 1] - 1e-9) mono = false;
  const rho = spearman(eps.map((e) => 1 - e), lg.map((g) => -g));
  console.log('  ACCEPTANCE #2 (multi-street ladder monotone, strong<<random):', mono ? 'PASS' : 'FAIL', `  rho=${rho}  eps0=${lg[0].toExponential(2)} eps1=${fx(lg[20])}`);

  // #3 concentration via simulation
  function simMeanLoss(S, N, rng) {
    let sum = 0, cnt = 0;
    for (let i = 0; i < N; i++) {
      const heroSeat = (i % 2) + 1;
      const deck = []; for (let r = 0; r < NRANK; r++) for (let c = 0; c < COPIES; c++) deck.push(r);
      for (let j = deck.length - 1; j > 0; j--) { const k = Math.floor(rng() * (j + 1)); [deck[j], deck[k]] = [deck[k], deck[j]]; }
      const heroRank = deck[0], villRank = deck[1], boardRank = deck[2];
      // walk streets sampling actions
      let street = 1, board = null, s = '', cH = ANTE, cV = ANTE, s1Hist = '';
      for (;;) {
        if (isFold(s)) break;
        if (isStreetEnd(s)) { if (street === 1) { street = 2; board = boardRank; s = ''; continue; } break; }
        const actor = actorOf(s), acts = legalOf(s), s1H = street === 1 ? s : s1Hist;
        let pick;
        if (actor === heroSeat) {
          const ctx = { heroSeat, heroRank, street, board, s, s1Hist, s2Hist: street === 2 ? s : '', cH, cV };
          const il = infosetLoss(ctx, F, cfg); const sd = S(ctx, F, cfg);
          let x = rng(); pick = acts[acts.length - 1]; for (const a of acts) { x -= (sd[a] || 0); if (x <= 0) { pick = a; break; } }
          sum += il.loss[pick]; cnt++;
        } else {
          const d = F.dist(actor, villRank, street, board, s);
          let x = rng(); pick = acts[acts.length - 1]; for (const a of acts) { x -= (d[a] || 0); if (x <= 0) { pick = a; break; } }
        }
        const t = applyAct(street, s, pick); s = t.s; cH += t.dCH; cV += t.dCV; if (street === 1) s1Hist = s;
        void s1H;
      }
    }
    return cnt ? sum / cnt : 0;
  }
  let seed = 24681357; const rng = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const A = ladderStrategy(F, cfg, 0.20), B = ladderStrategy(F, cfg, 0.30);
  const N = 72, trials = 1500; let right = 0;
  for (let t = 0; t < trials; t++) { if (simMeanLoss(A, N, rng) < simMeanLoss(B, N, rng)) right++; }
  console.log(`  ACCEPTANCE #3 (concentration): ${N} hands rank 0.10-eps-apart players correctly ${(100 * right / trials).toFixed(1)}% of the time`);

  // #4 the public board updates the range — show the SAME private hand's best response FLIPS with the
  //    board (pairing vs not), proving range/strength re-weighting flows through the multi-street EV.
  console.log('\n  ACCEPTANCE #4 (public board updates the range → best response is board-conditioned):');
  let flips = 0, shown = 0;
  for (let pr = 0; pr < NRANK; pr++) {
    const acts = [];
    for (let b = 0; b < NRANK; b++) {
      // hero's street-2 OPENING decision (street 1 checked through), conditioned on the board.
      const ctx = { heroSeat: 1, heroRank: pr, street: 2, board: b, s: '', s1Hist: 'kk', s2Hist: '', cH: ANTE, cV: ANTE };
      const il = infosetLoss(ctx, F, cfg);
      acts.push((pr === b ? 'PAIR' : 'high') + `→${il.brAct}`);
    }
    const distinct = new Set(acts.map((a) => a.split('→')[1]));
    if (distinct.size > 1) flips++;
    shown++;
    console.log(`     private ${RANKVAL[pr]}: street-2 open BR by board  [ ${acts.join('  ')} ]`);
  }
  const a4 = flips > 0;
  console.log(`     → the best response changes with the board for ${flips}/${shown} private hands (pairing flips check↔bet): the range update is load-bearing.`);

  // #5 carry the YJ axes through multi-street: brick ladder still load-bearing on the (bigger) street-2 pot
  const cfgFlat = { D, brickMode: 'flat', brickCap: 4, tieCarry: true, w };
  function brickSpewer(F, c) {
    const br = brStrategy(F, c);
    return (ctx) => {
      const paired = ctx.board !== null && ctx.heroRank === ctx.board;
      if (!paired) { // a brick (unpaired): force commitment
        if (ctx.s === '' || ctx.s === 'k') return { k: 0, b: 1 };
        if (ctx.s === 'kb' || ctx.s === 'br') return { f: 0, c: 1 };
        if (ctx.s === 'b') return { f: 0, c: 1, r: 0 };
      }
      return br(ctx);
    };
  }
  const spewPot = gradeStrategy(brickSpewer(F, cfg), F, cfg);
  const spewFlat = gradeStrategy(brickSpewer(F, cfgFlat), F, cfgFlat);
  const a5 = spewPot > spewFlat + 1e-6;
  console.log('\n  ACCEPTANCE #5 (brick ladder still load-bearing across two streets):', a5 ? 'PASS' : 'FAIL');
  console.log(`     brick-spewer EV-loss  pot-gated=${fx(spewPot)}  flat-+1=${fx(spewFlat)}  (pot-gated punishes ${(spewPot / Math.max(spewFlat, 1e-9)).toFixed(1)}x harder on the larger street-2 pots)`);

  const allPass = a1 && mono && a4 && a5;
  console.log('\n' + (allPass ? '✅ ALL MULTI-STREET ACCEPTANCE GATES PASS' : '❌ SOME GATES FAILED') + ' — public-board range update + YJ Honey-Stroke EV.');
}
