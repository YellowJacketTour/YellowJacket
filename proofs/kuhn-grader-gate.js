// kuhn-grader-gate.js — GROUND-TRUTH validation that decision-quality grading is correct + monotone.
//
// Kuhn poker (cards J<Q<K = 0<1<2) is EXACTLY solvable, so the "optimal" baseline is computed with
// ZERO approximation. This is the gate the engine's CFR grader fails (random out-graded the elite).
//
// Principles enforced (the manifesto + Intel-Field doc):
//  - DECISION quality, not outcome: we score EV-loss vs the best response, never chips won.
//  - INFORMATION-SET ONLY (no hindsight): each decision is graded over the opponent's RANGE
//    (belief over their card given their actions), integrated — NEVER over their revealed card.
//  - BEST-RESPONSE-TO-FIELD, not Nash: the baseline is the max-EV response to the actual field F.
//    (GTO falls out when F is balanced; here F is exploitable so exploitation skill must show.)
//
// EV-loss(infoset, action) = BRvalue(infoset) - Q(infoset, action), both CONDITIONAL on reaching
// the infoset, both expectations over the belief. >=0 always; a perfect exploiter scores 0.
'use strict';

// ---- payoffs to P1 at each terminal history, given cards (c1,c2) ----
function payoffP1(hist, c1, c2) {
  const hi = c1 > c2 ? 1 : -1;
  switch (hist) {
    case 'xx':  return hi * 1;   // check-check showdown, pot 2
    case 'bf':  return +1;       // P1 bet, P2 folded
    case 'bc':  return hi * 2;   // P1 bet, P2 called, showdown pot 4
    case 'xbf': return -1;       // P1 checked, P2 bet, P1 folded
    case 'xbc': return hi * 2;   // P1 checked, P2 bet, P1 called, showdown pot 4
  }
  throw new Error('non-terminal ' + hist);
}

// A strategy = aggressive-action probability per (decision-point, card).
//   p1o[c] = P(P1 bets at '')      p1f[c] = P(P1 calls at 'xb')
//   p2o[c] = P(P2 bets at 'x')     p2f[c] = P(P2 calls at 'b')
const CARDS = [0, 1, 2];
const others = (c) => CARDS.filter((x) => x !== c);
const norm = (w) => { const s = w[0] + w[1]; return s > 0 ? [w[0] / s, w[1] / s] : [0.5, 0.5]; };

// ============================================================================
// Build the exact grader vs a fixed field F: BR action + EV-loss table per infoset.
// ============================================================================
function buildGrader(F) {
  const evloss = {}; // key `${pos}|${c}|${dp}` -> {br:bestAction, q:{agg,pass}, loss:{agg,pass}}
  const brAction = {};

  // ---- P1 deepest decision: (c1,'xb') call/fold ----
  for (const c1 of CARDS) {
    const oc = others(c1);
    const b = norm(oc.map((c2) => 0.5 * F.p2o[c2])); // belief over c2 given P2 bet at 'x'
    let qCall = 0; // call -> 'xbc' showdown pot4
    oc.forEach((c2, i) => { qCall += b[i] * payoffP1('xbc', c1, c2); });
    const qFold = -1; // 'xbf'
    const br = qCall >= qFold ? 'agg' : 'pass';
    const best = Math.max(qCall, qFold);
    brAction[`1|${c1}|f`] = br;
    evloss[`1|${c1}|f`] = { br, q: { agg: qCall, pass: qFold }, loss: { agg: best - qCall, pass: best - qFold } };
  }
  // ---- P1 open: (c1,'') bet/check (continuation uses BR at 'xb') ----
  for (const c1 of CARDS) {
    const oc = others(c1);
    // Q(bet): P2 faces 'b', calls w/ F.p2f -> 'bc' (±2) else 'bf' (+1)
    let qBet = 0;
    oc.forEach((c2) => {
      const call = F.p2f[c2];
      qBet += 0.5 * (call * payoffP1('bc', c1, c2) + (1 - call) * payoffP1('bf', c1, c2));
    });
    // Q(check): P2 bets w/ F.p2o -> P1 at 'xb' plays BR; else 'xx' (±1)
    let qChk = 0;
    oc.forEach((c2) => {
      const bet = F.p2o[c2];
      const brF = brAction[`1|${c1}|f`];
      const faceVal = brF === 'agg' ? payoffP1('xbc', c1, c2) : payoffP1('xbf', c1, c2);
      qChk += 0.5 * (bet * faceVal + (1 - bet) * payoffP1('xx', c1, c2));
    });
    const br = qBet >= qChk ? 'agg' : 'pass';
    const best = Math.max(qBet, qChk);
    brAction[`1|${c1}|o`] = br;
    evloss[`1|${c1}|o`] = { br, q: { agg: qBet, pass: qChk }, loss: { agg: best - qBet, pass: best - qChk } };
  }

  // ---- P2 facing bet: (c2,'b') call/fold (value to P2 = -payoffP1) ----
  for (const c2 of CARDS) {
    const oc = others(c2);
    const qCall = oc.reduce((s, c1, i) => {
      const b = norm(oc.map((x) => 0.5 * F.p1o[x])); // belief c1 | P1 bet
      return s + b[i] * -payoffP1('bc', c1, c2);
    }, 0);
    const qFold = -(+1); // 'bf' -> P1 +1 -> P2 -1
    const br = qCall >= qFold ? 'agg' : 'pass';
    const best = Math.max(qCall, qFold);
    brAction[`2|${c2}|f`] = br;
    evloss[`2|${c2}|f`] = { br, q: { agg: qCall, pass: qFold }, loss: { agg: best - qCall, pass: best - qFold } };
  }
  // ---- P2 open: (c2,'x') bet/check ----
  for (const c2 of CARDS) {
    const oc = others(c2);
    // Q(bet): P1 faces 'xb', calls w/ F.p1f -> 'xbc' (±2 to P2) else 'xbf' (P1 -1 -> P2 +1)
    let qBet = 0;
    oc.forEach((c1) => {
      const call = F.p1f[c1];
      qBet += 0.5 * (call * -payoffP1('xbc', c1, c2) + (1 - call) * -payoffP1('xbf', c1, c2));
    });
    // Q(check): 'xx' (±1 to P2)
    let qChk = 0;
    oc.forEach((c1) => { qChk += 0.5 * -payoffP1('xx', c1, c2); });
    const br = qBet >= qChk ? 'agg' : 'pass';
    const best = Math.max(qBet, qChk);
    brAction[`2|${c2}|o`] = br;
    evloss[`2|${c2}|o`] = { br, q: { agg: qBet, pass: qChk }, loss: { agg: best - qBet, pass: best - qChk } };
  }

  return { evloss, brAction };
}

// reach prob of each graded infoset vs field F (depends on F's play + the graded strat's own earlier play)
function reachProbs(S, F) {
  const r = {};
  for (const c of CARDS) {
    const oc = others(c);
    const avgP2bet = oc.reduce((s, c2) => s + 0.5 * F.p2o[c2], 0);
    const avgP1bet = oc.reduce((s, c1) => s + 0.5 * F.p1o[c1], 0);
    r[`1|${c}|o`] = 1 / 3;                                   // P1 always opens
    r[`1|${c}|f`] = (1 / 3) * (1 - S.p1o[c]) * avgP2bet;      // P1 reached 'xb' only if it checked & P2 bet
    r[`2|${c}|o`] = (1 / 3) * (1 - avgP1bet);                 // P2 at 'x' iff P1 checked
    r[`2|${c}|f`] = (1 / 3) * avgP1bet;                       // P2 at 'b' iff P1 bet
  }
  return r;
}

// expected EV-loss of strategy S vs field F (lower = better). Averages the two positions equally.
function grade(S, F, G) {
  const r = reachProbs(S, F);
  const aggProb = { o: (k, c) => S[k][c], f: (k, c) => S[k][c] };
  let total = 0;
  for (const c of CARDS) {
    for (const [pos, dp, key] of [[1, 'o', 'p1o'], [1, 'f', 'p1f'], [2, 'o', 'p2o'], [2, 'f', 'p2f']]) {
      const id = `${pos}|${c}|${dp}`;
      const pAgg = S[key][c];
      const L = G.evloss[id].loss;
      const condLoss = pAgg * L.agg + (1 - pAgg) * L.pass;
      total += r[id] * condLoss;
    }
  }
  return total; // expected EV-loss per hand (averaged over both positions)
}

// ---- strategy builders ----
const mk = (p1o, p1f, p2o, p2f) => ({ p1o, p1f, p2o, p2f });
const uniform = mk([.5, .5, .5], [.5, .5, .5], [.5, .5, .5], [.5, .5, .5]);
const alwaysBet = mk([1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]);
const alwaysPass = mk([0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]); // never bet, always fold/check
const alwaysCall = mk([0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]); // calling station, never bets
// a balanced-ish "GTO-flavoured" reference (not exact Nash, just a sensible mixed strat)
const balanced = mk([.2, 0, .8], [0, .4, 1], [.2, 0, .8], [0, .5, 1]);

// the exact best-response-to-F strategy (pure BR actions from the grader) — should grade 0
function brStrategy(G) {
  const pick = (id) => (G.brAction[id] === 'agg' ? 1 : 0);
  return mk(
    CARDS.map((c) => pick(`1|${c}|o`)), CARDS.map((c) => pick(`1|${c}|f`)),
    CARDS.map((c) => pick(`2|${c}|o`)), CARDS.map((c) => pick(`2|${c}|f`)),
  );
}

// skill ladder: epsilon-greedy toward BR (eps=0 perfect, eps=1 uniform random)
function ladderStrat(G, eps) {
  const mix = (id) => { const br = G.brAction[id] === 'agg' ? 1 : 0; return (1 - eps) * br + eps * 0.5; };
  return mk(
    CARDS.map((c) => mix(`1|${c}|o`)), CARDS.map((c) => mix(`1|${c}|f`)),
    CARDS.map((c) => mix(`2|${c}|o`)), CARDS.map((c) => mix(`2|${c}|f`)),
  );
}

function spearman(x, y) {
  const rank = (v) => { const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b]); const r = []; idx.forEach((id, i) => r[id] = i); return r; };
  const rx = rank(x), ry = rank(y), n = x.length, m = (n - 1) / 2;
  let sxy = 0, sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { const dx = rx[i] - m, dy = ry[i] - m; sxy += dx * dy; sx += dx * dx; sy += dy * dy; }
  return +(sxy / Math.sqrt(sx * sy)).toFixed(3);
}

// ============================================================================
if (require.main === module) {
  // Field F: an EXPLOITABLE "honest recreational" — under-bluffs, folds J too much, transparent.
  const F = mk([.10, .10, .80], [.00, .40, 1.0], [.10, .10, .80], [.00, .50, 1.0]);
  const G = buildGrader(F);
  const BR = brStrategy(G);

  console.log('KUHN GROUND-TRUTH GATE — EV-loss vs best-response-to-field (exact, info-set-only)\n');
  console.log('Field F (exploitable): p1o', F.p1o, 'p2f', F.p2f, '\n');

  console.log('Archetype grades (mean EV-loss per hand, LOWER=better):');
  const archetypes = [
    ['best-response-to-F (max exploiter)', BR],
    ['balanced / GTO-flavoured', balanced],
    ['always-bet (maniac)', alwaysBet],
    ['always-call (station)', alwaysCall],
    ['uniform random', uniform],
    ['always-pass (nit: never bet, always fold)', alwaysPass],
  ];
  const rows = archetypes.map(([name, S]) => [name, grade(S, F, G)]);
  rows.forEach(([n, g]) => console.log('  ' + g.toFixed(4).padStart(8) + '   ' + n));

  // ACCEPTANCE #1: best-response-to-F must grade ~0 and be the unique minimum.
  const brGrade = grade(BR, F, G);
  const others_ = rows.filter(([n]) => !n.startsWith('best-response')).map(([, g]) => g);
  console.log('\n  ACCEPTANCE #1 (BR-to-F is the unique minimum, ~0):',
    (brGrade < 1e-9 && Math.min(...others_) > brGrade + 1e-6) ? 'PASS' : 'FAIL', `(BR=${brGrade.toFixed(4)})`);

  // ACCEPTANCE #2: monotonicity across the eps skill ladder.
  const eps = Array.from({ length: 21 }, (_, i) => i / 20);
  const ladderGrades = eps.map((e) => grade(ladderStrat(G, e), F, G));
  let monotone = true;
  for (let i = 1; i < ladderGrades.length; i++) if (ladderGrades[i] < ladderGrades[i - 1] - 1e-9) monotone = false;
  const skill = eps.map((e) => 1 - e);
  const rho = spearman(skill, ladderGrades.map((g) => -g));
  console.log('  ACCEPTANCE #2 (skill ladder monotone, strong<<random):', monotone ? 'PASS' : 'FAIL',
    `  rho(skill,-grade)=${rho}  | eps0=${ladderGrades[0].toFixed(4)}  eps1=${ladderGrades[20].toFixed(4)}`);

  // ACCEPTANCE #3: concentration — can we separate two close players in FEW hands? Simulate.
  function simGrade(S, F, G, N, rng) {
    // play N hands, random position each, sample actions, accumulate realized per-decision EV-loss
    let sum = 0, cnt = 0;
    for (let h = 0; h < N; h++) {
      const deal = [0, 1, 2].sort(() => rng() - .5); const c1 = deal[0], c2 = deal[1];
      // P1 line
      const s = S; // graded strat plays both seats vs F
      // seat assignment: alternate
      const asP1 = h % 2 === 0;
      const me = asP1 ? c1 : c2, opp = asP1 ? c2 : c1;
      // walk the tree; at MY infosets accumulate EV-loss; sample actions for both
      const act = (p, c, dp) => (rng() < (asMe(p) ? S : F)[key(p, dp)][c] ? 'agg' : 'pass');
      const asMe = (p) => (asP1 ? p === 1 : p === 2);
      const key = (p, dp) => `p${p}${dp}`; // not used; inline below
      // explicit Kuhn rollout
      const Sp = (p, dp, c) => (asMe(p) ? S : F)[`p${p}${dp}`][c];
      const myProbStrat = (p, dp, c) => (asMe(p) ? S : F);
      // simpler: define action prob getters
      const PA = (p, dp, c) => { const st = asMe(p) ? S : F; return st[`p${p}${dp}`][c]; };
      // map our strat keys: p1o,p1f,p2o,p2f already named that way
      const getp = (p, dp, c) => (asMe(p) ? S : F)[`p${p}${dp}`][c];
      // accumulate for my decisions
      const addLoss = (pos, dp, c, chose) => { if (asMe(pos)) { sum += G.evloss[`${pos}|${c}|${dp}`].loss[chose]; cnt++; } };
      // P1 open
      let a1 = rng() < getp(1, 'o', c1) ? 'agg' : 'pass'; addLoss(1, 'o', c1, a1);
      if (a1 === 'agg') { // 'b' -> P2 face
        let a2 = rng() < getp(2, 'f', c2) ? 'agg' : 'pass'; addLoss(2, 'f', c2, a2);
      } else { // 'x' -> P2 open
        let a2 = rng() < getp(2, 'o', c2) ? 'agg' : 'pass'; addLoss(2, 'o', c2, a2);
        if (a2 === 'agg') { let a3 = rng() < getp(1, 'f', c1) ? 'agg' : 'pass'; addLoss(1, 'f', c1, a3); }
      }
    }
    return cnt ? sum / cnt : 0; // mean per-decision EV-loss
  }
  // two players 0.10 apart in eps; can 72 hands rank them?
  let rng = (() => { let s = 12345; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; })();
  const A = ladderStrat(G, 0.20), B = ladderStrat(G, 0.30);
  const trials = 400, N = 72; let aWins = 0;
  for (let t = 0; t < trials; t++) {
    const ga = simGrade(A, F, G, N, rng), gb = simGrade(B, F, G, N, rng);
    if (ga < gb) aWins++; // stronger (lower eps) should have lower mean EV-loss
  }
  console.log(`  ACCEPTANCE #3 (concentration): over ${N} hands, the better of two players 0.10 apart`,
    `ranks correctly ${(100 * aWins / trials).toFixed(1)}% of the time`);

  console.log('\nEV-loss table (per infoset; loss of the WRONG action shows what the grader punishes):');
  for (const id of Object.keys(G.evloss).sort()) {
    const e = G.evloss[id]; const wrong = e.br === 'agg' ? 'pass' : 'agg';
    console.log(`  ${id}  best=${e.br.padEnd(4)}  loss(${wrong})=${e.loss[wrong].toFixed(3)}`);
  }
}
