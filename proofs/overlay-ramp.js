// overlay-ramp.js — how much real money you must GUARANTEE (overlay) to bootstrap
// a Daily Dollar prize pool until organic real-money entries cover it.
// ---------------------------------------------------------------------------
// Bots solve the EMPTY-LOBBY problem (≈ free). They CANNOT fund prizes.
// Overlay solves the SMALL-PRIZE problem: you guarantee a prize pool bigger than
// early organic entries fund, and eat the shortfall until volume catches up.
// This models that shortfall, the crossover day, and the players' perceived
// "average return ratio" (the conversion hook) over a launch ramp.
// ---------------------------------------------------------------------------
'use strict';

// Logistic adoption from seedFrac→~1 of mature spend over rampDays (midpoint = rampDays/2).
function adoption(day, rampDays, seedFrac, steepness = 8) {
  const x = (day / rampDays - 0.5) * steepness;
  const logistic = 1 / (1 + Math.exp(-x));
  const lo = 1 / (1 + Math.exp(steepness * 0.5));       // logistic(0)
  const hi = 1 / (1 + Math.exp(-steepness * 0.5));      // logistic(rampDays)
  const norm = (logistic - lo) / (hi - lo);             // 0..1
  return seedFrac + (1 - seedFrac) * norm;
}

// One scenario. matureSpend = real $/day at maturity; prizeReturnPct = fraction
// of real spend that goes to the daily prize pool (your 58%). guarantee = the
// advertised daily prize pool you commit to (constant here; can be a schedule).
function rampOverlay({ matureSpend, prizeReturnPct, guarantee, rampDays, seedFrac }) {
  let totalOverlay = 0, crossover = null;
  const samples = [];
  for (let day = 1; day <= rampDays; day++) {
    const organicSpend = matureSpend * adoption(day, rampDays, seedFrac);
    const organicPrize = organicSpend * prizeReturnPct;
    const overlay = Math.max(0, guarantee - organicPrize);          // house tops up to the guarantee
    const paidPool = Math.max(guarantee, organicPrize);
    // players collectively get back this fraction of what they spent that day
    const returnRatio = organicSpend > 0 ? paidPool / organicSpend : Infinity;
    totalOverlay += overlay;
    if (crossover === null && organicPrize >= guarantee) crossover = day;
    if (day === 1 || day % Math.ceil(rampDays / 6) === 0 || day === rampDays) {
      samples.push({ day, organicSpend, organicPrize, overlay, paidPool, returnRatio });
    }
  }
  return { totalOverlay, crossover, samples };
}

// Suggest a guarantee that crosses over at `coverAt` fraction of maturity.
function guaranteeForCrossover(matureSpend, prizeReturnPct, coverAt = 1.0) {
  return matureSpend * coverAt * prizeReturnPct;
}

module.exports = { adoption, rampOverlay, guaranteeForCrossover };

// ---- demo: node overlay-ramp.js -------------------------------------------
if (require.main === module) {
  const usd = n => '$' + Math.round(n).toLocaleString('en-US');
  const PRIZE_RET = 0.58, RAMP = 180, SEED = 0.05;
  // mature real $/day from the model's paying-share assumptions
  const TIERS = [
    { name: '50k field',  matureSpend: 7200 },
    { name: '200k field', matureSpend: 57600 },
    { name: '1M field',   matureSpend: 576000 },
  ];
  for (const t of TIERS) {
    // guarantee = the prize pool organic will EVENTUALLY fund at maturity (crossover at day≈RAMP)
    const G = guaranteeForCrossover(t.matureSpend, PRIZE_RET, 1.0);
    const r = rampOverlay({ matureSpend: t.matureSpend, prizeReturnPct: PRIZE_RET, guarantee: G, rampDays: RAMP, seedFrac: SEED });
    console.log('\n============================================================');
    console.log(`${t.name}  | mature spend ${usd(t.matureSpend)}/day | guarantee ${usd(G)}/day | ${RAMP}-day ramp`);
    console.log(`  TOTAL BOOTSTRAP OVERLAY: ${usd(r.totalOverlay)}   crossover: day ${r.crossover || '>'+RAMP}`);
    console.log('  day    organic$/day   prize(organic)   overlay/day   paid pool   avg return×');
    for (const s of r.samples) {
      console.log('  ' + String(s.day).padStart(4) + '   ' + usd(s.organicSpend).padStart(11) + '   ' +
        usd(s.organicPrize).padStart(13) + '   ' + usd(s.overlay).padStart(11) + '   ' +
        usd(s.paidPool).padStart(10) + '   ' + s.returnRatio.toFixed(2) + '×');
    }
  }
  console.log('\nReturn× > 1.0 = early players collectively win back MORE than they spend (the conversion hook).');
  console.log('It decays to the prizeReturnPct (0.58) as organic entries cover the guarantee.\n');
}
