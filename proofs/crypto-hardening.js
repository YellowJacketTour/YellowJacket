// crypto-hardening.js — production crypto for the Sealed Intel Field, replacing the commit-reveal
// placeholder with (1) a publicly-verifiable, UNIQUE VRF and (2) THRESHOLD custody of the round seed so
// no single party can grind or leak it. (HOLDEM_ORACLE_V0_SCOPE / GRADER_INTEGRATION_SCOPE §6 #2.)
//
//   1. RSA-FDH-VRF (RFC 9381 §4). Full-domain-hash the input, apply the RSA private permutation → proof
//      π; output β = H(π). UNIQUENESS: the RSA private op is a bijection ⇒ exactly one π per input ⇒ the
//      operator CANNOT grind the round randomness. PUBLIC VERIFIABILITY: anyone checks π^e = FDH(α) with
//      the public key. This upgrades commit-reveal (which only binds a chosen seed) to a seed the
//      operator provably could not have chosen to bias.
//   2. Shamir k-of-n threshold secret sharing over GF(2^521−1). The round seed is split among n
//      custodians; any k reconstruct it, any k−1 learn NOTHING. No single party holds the seed → no
//      unilateral peeking or grinding.
//
// Pure BigInt field arithmetic (no external libs); RSA key via node crypto, raw modexp via JWK params.
'use strict';
const crypto = require('crypto');

const sha256 = (b) => crypto.createHash('sha256').update(b).digest();
function powmod(base, exp, mod) { let r = 1n; base %= mod; while (exp > 0n) { if (exp & 1n) r = (r * base) % mod; exp >>= 1n; base = (base * base) % mod; } return r; }
function b64uToBig(s) { return BigInt('0x' + Buffer.from(s, 'base64url').toString('hex')); }
function bigToBuf(x) { let h = x.toString(16); if (h.length % 2) h = '0' + h; return Buffer.from(h, 'hex'); }

// ===== 1. RSA-FDH-VRF =====
function vrfKeygen() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, publicExponent: 65537 });
  const jpriv = privateKey.export({ format: 'jwk' }), jpub = publicKey.export({ format: 'jwk' });
  return { n: b64uToBig(jpub.n), e: b64uToBig(jpub.e), d: b64uToBig(jpriv.d), pub: { n: b64uToBig(jpub.n), e: b64uToBig(jpub.e) } };
}
// full-domain hash: derive an integer in [0, n) from alpha (MGF1-style stream, ≥ 2× modulus bytes to
// make the mod-n bias negligible < 2^-256).
function fdh(alpha, n) {
  const need = bigToBuf(n).length * 2; const chunks = []; let ctr = 0;
  while (Buffer.concat(chunks).length < need) { chunks.push(sha256(Buffer.concat([Buffer.from('FDH'), Buffer.from(alpha), Buffer.from([ctr++])]))); }
  return BigInt('0x' + Buffer.concat(chunks).toString('hex')) % n;
}
function vrfProve(sk, alpha) { const h = fdh(alpha, sk.n); const pi = powmod(h, sk.d, sk.n); return { pi, beta: sha256(bigToBuf(pi)) }; }
function vrfVerify(pub, alpha, pi, beta) {
  const h = fdh(alpha, pub.n);
  if (powmod(pi, pub.e, pub.n) !== h) return false;            // π^e must recover FDH(α)
  return sha256(bigToBuf(pi)).equals(beta);                     // β must be H(π)
}

// ===== 2. Shamir k-of-n over the Mersenne prime 2^521−1 =====
const P = (1n << 521n) - 1n;
function inv(a) { return powmod(((a % P) + P) % P, P - 2n, P); }   // Fermat inverse (P prime)
function randFieldElt() { return BigInt('0x' + crypto.randomBytes(66).toString('hex')) % P; }
function shamirSplit(secret, n, k) {
  const coeffs = [secret % P]; for (let i = 1; i < k; i++) coeffs.push(randFieldElt());
  const shares = [];
  for (let x = 1; x <= n; x++) { let y = 0n, xp = 1n; for (const c of coeffs) { y = (y + c * xp) % P; xp = (xp * BigInt(x)) % P; } shares.push({ x: BigInt(x), y }); }
  return shares;
}
function shamirReconstruct(shares) { // Lagrange interpolation at x=0
  let secret = 0n;
  for (let i = 0; i < shares.length; i++) {
    let num = 1n, den = 1n;
    for (let j = 0; j < shares.length; j++) if (j !== i) { num = (num * ((-shares[j].x % P) + P)) % P; den = (den * ((shares[i].x - shares[j].x % P) + P)) % P; }
    secret = (secret + shares[i].y * num % P * inv(den)) % P;
  }
  return ((secret % P) + P) % P;
}

module.exports = { vrfKeygen, vrfProve, vrfVerify, fdh, shamirSplit, shamirReconstruct, P };

// ============================================================================
if (require.main === module) {
  console.log('CRYPTO HARDENING — RSA-FDH-VRF (unique, publicly verifiable) + Shamir k-of-n threshold custody\n');

  // ---- RSA-FDH-VRF ----
  const sk = vrfKeygen();
  const roundInput = Buffer.from('YJ-round-0007|serverSeedCommit');
  const { pi, beta } = vrfProve(sk, roundInput);
  console.log(`VRF: 2048-bit RSA-FDH. β(round randomness)=${beta.toString('hex').slice(0, 24)}…\n`);

  const gA = vrfVerify(sk.pub, roundInput, pi, beta);
  console.log('GATE A (VRF proof verifies with the public key):', gA ? 'PASS' : 'FAIL');

  const p2 = vrfProve(sk, roundInput);
  const gB = p2.pi === pi && p2.beta.equals(beta);
  console.log('GATE B (VRF is DETERMINISTIC/UNIQUE — operator cannot grind the randomness):', gB ? 'PASS' : 'FAIL');

  const forgedBeta = vrfVerify(sk.pub, roundInput, pi, sha256(Buffer.from('lie')));
  const forgedPi = vrfVerify(sk.pub, roundInput, pi + 1n, beta);
  const wrongInput = vrfVerify(sk.pub, Buffer.from('different-round'), pi, beta);
  const gC = !forgedBeta && !forgedPi && !wrongInput;
  console.log('GATE C (VRF soundness — forged β/π or wrong input all rejected):', gC ? 'PASS' : 'FAIL');

  // unpredictability: β changes unpredictably with the input
  const b2 = vrfProve(sk, Buffer.from('YJ-round-0008|serverSeedCommit')).beta;
  let diffBits = 0; for (let i = 0; i < 32; i++) { let x = beta[i] ^ b2[i]; while (x) { diffBits += x & 1; x >>= 1; } }
  const gD = diffBits > 90 && diffBits < 166;   // ~128 bits differ for independent 256-bit outputs
  console.log('GATE D (VRF output looks random — ~half the bits flip on input change):', gD ? 'PASS' : 'FAIL', `(${diffBits}/256 bits differ)`);

  // ---- Shamir threshold custody ----
  const seed = BigInt('0x' + crypto.randomBytes(32).toString('hex'));   // the 256-bit round serverSeed
  const N = 5, K = 3;
  const shares = shamirSplit(seed, N, K);
  console.log(`\nShamir: seed split into ${N} custodian shares, threshold ${K}.`);

  const recA = shamirReconstruct([shares[0], shares[2], shares[4]]);     // 3 different shares
  const recB = shamirReconstruct([shares[1], shares[3], shares[4]]);     // another 3
  const gE = recA === seed && recB === seed;
  console.log('GATE E (any K=3 shares reconstruct the seed exactly):', gE ? 'PASS' : 'FAIL');

  const under = shamirReconstruct([shares[0], shares[1]]);               // only K-1=2 shares
  const gF = under !== seed;                                             // 2 shares reveal NOTHING about the seed
  console.log('GATE F (K−1=2 shares CANNOT reconstruct — no single/minority party holds the seed):', gF ? 'PASS' : 'FAIL');

  // tamper: a corrupted share yields a wrong secret (detectable when cross-checked against the commit)
  const bad = [{ x: shares[0].x, y: shares[0].y + 1n }, shares[2], shares[4]];
  const gG = shamirReconstruct(bad) !== seed;
  console.log('GATE G (a corrupted share is detectable — reconstruction diverges):', gG ? 'PASS' : 'FAIL');

  const all = gA && gB && gC && gD && gE && gF && gG;
  console.log('\n' + (all ? '✅ ALL CRYPTO-HARDENING GATES PASS' : '❌ SOME GATES FAILED') + ' — unique publicly-verifiable VRF + k-of-n threshold seed custody.');
}
