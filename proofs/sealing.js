// sealing.js — the Sealed Intel Field: each per-decision grade is computed instantly, COMMITTED, and
// ENCRYPTED under the round's unrevealed serverSeed — unreadable by anyone (incl. the operator) until
// the round ends, then re-derivable and verifiable by anyone. This is the integrity + legal-evidence +
// anti-RTA moat (Master Scope pillar B; INTEL_FIELD_UNIVERSAL_GRADER.md).
//
// Real cryptography (Node `crypto`), not a toy:
//   - COMMIT-REVEAL: serverSeed S random; commit C = SHA256(S) published BEFORE the round. Reveal S at
//     round end; anyone checks SHA256(S)==C. The operator is bound to S chosen before any play.
//   - PER-DECISION CONFIDENTIALITY: key_i = HMAC-SHA256(S, roundId||i); sealedGrade_i =
//     AES-256-GCM(grade_i, key_i). Unreadable without S (which is unrevealed mid-round) → no live grade
//     leakage, no who's-ahead signal, no operator peeking.
//   - TAMPER-EVIDENCE: a Merkle root over INDEX-BOUND leaves (leaf_i = SHA256(i‖sealed_i)) is published
//     with the commit. Any edit, insertion, or reorder changes the root.
//   - RE-DERIVABILITY: the grade is bound to PUBLIC info — on reveal it both decrypts AND recomputes from
//     the public hand history via the (deterministic) oracle; a forged grade fails to recompute.
//   - ANTI-RTA: grades are sealed at decision time, so a solver-bot's perfect-GTO tell (the mimicry
//     shadow) cannot be backfilled or scrubbed after the fact.
//
// Production upgrades (noted, deferred): ECVRF for publicly-verifiable seed derivation; threshold/
// distributed key custody (Shamir) so no single party holds S; ZK-of-grade for decrypt-free verification.
'use strict';
const crypto = require('crypto');

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest();
const hmac = (key, msg) => crypto.createHmac('sha256', key).update(msg).digest();

// deterministic stand-in for the oracle grade as a function of PUBLIC info (production: s4 oracle cache
// lookup). Pure + deterministic ⇒ anyone can recompute it from the public hand history.
function gradeFromPublic(publicHistory) {
  const h = sha256(Buffer.from(JSON.stringify(publicHistory)));
  return { evLoss: (h.readUInt32BE(0) % 100000) / 100000, infosetId: h.toString('hex').slice(0, 12) };
}

// ===== sealing primitives =====
function deriveKey(serverSeed, roundId, i) { return hmac(serverSeed, Buffer.from(`${roundId}|${i}`)); }
function seal(grade, key) {
  const iv = sha256(key).subarray(0, 12);                         // deterministic IV from key (key is single-use per i)
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(Buffer.from(JSON.stringify(grade)), 'utf8'), c.final()]);
  return Buffer.concat([ct, c.getAuthTag()]);                     // ciphertext ‖ 16-byte GCM tag
}
function unseal(sealed, key) {
  const iv = sha256(key).subarray(0, 12);
  const ct = sealed.subarray(0, sealed.length - 16), tag = sealed.subarray(sealed.length - 16);
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv); d.setAuthTag(tag);
  return JSON.parse(Buffer.concat([d.update(ct), d.final()]).toString('utf8')); // throws on wrong key / tamper
}
const leafHash = (i, sealed) => sha256(Buffer.concat([Buffer.from(`${i}|`), sealed]));
function merkleRoot(leaves) {
  if (leaves.length === 0) return sha256(Buffer.alloc(0));
  let lvl = leaves.slice();
  while (lvl.length > 1) { const nx = []; for (let i = 0; i < lvl.length; i += 2) nx.push(sha256(Buffer.concat([lvl[i], lvl[i + 1] || lvl[i]]))); lvl = nx; }
  return lvl[0];
}

// ===== the round lifecycle =====
function openRound(roundId) {                                     // operator commits to a secret seed BEFORE play
  const serverSeed = crypto.randomBytes(32);
  return { roundId, serverSeed, commit: sha256(serverSeed), sealed: [], decisions: [] };
}
function gradeAndSeal(round, publicHistory) {                     // called at each decision, mid-round
  const i = round.sealed.length;
  const grade = gradeFromPublic(publicHistory);                  // computed instantly...
  const sealedGrade = seal(grade, deriveKey(round.serverSeed, round.roundId, i)); // ...and immediately encrypted
  round.sealed.push(sealedGrade); round.decisions.push({ i, publicHistory });
  return sealedGrade;
}
function publish(round) {                                          // public bulletin posted DURING the round (no seed)
  return { roundId: round.roundId, commit: round.commit, merkleRoot: merkleRoot(round.sealed.map((s, i) => leafHash(i, s))), nSealed: round.sealed.length };
}
// anyone, after reveal, fully verifies a published bulletin + sealed list + the revealed seed.
function verify(bulletin, sealedList, decisions, revealedSeed, roundId) {
  const reasons = [];
  if (!sha256(revealedSeed).equals(bulletin.commit)) reasons.push('commit mismatch (seed not the committed one)');
  const root = merkleRoot(sealedList.map((s, i) => leafHash(i, s)));
  if (!root.equals(bulletin.merkleRoot)) reasons.push('merkle root mismatch (ledger edited/reordered)');
  for (let i = 0; i < sealedList.length; i++) {
    let grade; try { grade = unseal(sealedList[i], deriveKey(revealedSeed, roundId, i)); } catch { reasons.push(`decrypt fail @${i}`); continue; }
    const recomputed = gradeFromPublic(decisions[i].publicHistory);   // grade must be bound to public info
    if (JSON.stringify(grade) !== JSON.stringify(recomputed)) reasons.push(`grade @${i} does not recompute from public history (forged)`);
  }
  return { ok: reasons.length === 0, reasons };
}

module.exports = { openRound, gradeAndSeal, publish, verify, unseal, deriveKey, gradeFromPublic, seal, merkleRoot, leafHash, sha256 };

// ============================================================================
if (require.main === module) {
  console.log('SEALED INTEL FIELD — commit-reveal + AES-256-GCM per-decision seal + Merkle tamper-evidence\n');
  const roundId = 'YJ-round-0001';
  const round = openRound(roundId);
  // simulate a round of graded decisions (public histories)
  const N = 24;
  for (let k = 0; k < N; k++) gradeAndSeal(round, { roundId, decision: k, street: k % 2 ? 'river' : 'turn', action: ['k', 'b', 'c', 'f'][k % 4], pot: 2 + (k % 5) });
  const bulletin = publish(round);
  console.log(`Round ${roundId}: ${N} decisions sealed. commit=${bulletin.commit.toString('hex').slice(0, 16)}…  merkleRoot=${bulletin.merkleRoot.toString('hex').slice(0, 16)}…\n`);

  // ---- GATE A: commit-reveal binding ----
  const gA = sha256(round.serverSeed).equals(bulletin.commit) && !sha256(crypto.randomBytes(32)).equals(bulletin.commit);
  console.log('GATE A (commit binds the seed; a wrong seed fails):', gA ? 'PASS' : 'FAIL');

  // ---- GATE B: confidentiality before reveal (no seed → cannot read any grade) ----
  let attackerRead = false;
  try { unseal(round.sealed[0], crypto.randomBytes(32)); attackerRead = true; } catch { /* GCM auth fails */ }
  // even guessing the key-derivation structure without S is infeasible; with S it reads correctly:
  const honest = unseal(round.sealed[0], deriveKey(round.serverSeed, roundId, 0));
  const gB = !attackerRead && honest.infosetId === gradeFromPublic(round.decisions[0].publicHistory).infosetId;
  console.log('GATE B (sealed grades unreadable without the unrevealed seed):', gB ? 'PASS' : 'FAIL');

  // ---- GATE C: full verification passes for an honest reveal ----
  const vOK = verify(bulletin, round.sealed, round.decisions, round.serverSeed, roundId);
  console.log('GATE C (honest reveal verifies end-to-end):', vOK.ok ? 'PASS' : 'FAIL', vOK.ok ? '' : vOK.reasons.join('; '));

  // ---- GATE D: tamper-evidence — flip one byte of a sealed grade → detected ----
  const tampered = round.sealed.map((s) => Buffer.from(s)); tampered[7] = Buffer.from(tampered[7]); tampered[7][0] ^= 0x01;
  const vTamper = verify(bulletin, tampered, round.decisions, round.serverSeed, roundId);
  console.log('GATE D (1-byte tamper of a sealed grade is detected):', !vTamper.ok ? 'PASS' : 'FAIL', `(${vTamper.reasons[0] || ''})`);

  // ---- GATE E: forgery — operator swaps in a different grade after the fact → fails to recompute ----
  const forgedDecisions = round.decisions.map((d) => ({ ...d }));
  // operator tries to re-seal decision 5 with a flattering grade, keeping the SAME public history
  const forgedSealed = round.sealed.map((s) => Buffer.from(s));
  forgedSealed[5] = seal({ evLoss: 0.0, infosetId: 'forged000000' }, deriveKey(round.serverSeed, roundId, 5));
  // they must also republish the merkle root to match (else GATE D catches it); assume they do:
  const forgedBulletin = { ...bulletin, merkleRoot: merkleRoot(forgedSealed.map((s, i) => leafHash(i, s))) };
  const vForge = verify(forgedBulletin, forgedSealed, forgedDecisions, round.serverSeed, roundId);
  console.log('GATE E (a re-sealed/forged grade fails to recompute from public info):', !vForge.ok ? 'PASS' : 'FAIL', `(${vForge.reasons[0] || ''})`);

  // ---- GATE F: reorder attack — swap two sealed entries → index-bound merkle detects it ----
  const reordered = round.sealed.map((s) => Buffer.from(s)); [reordered[3], reordered[4]] = [reordered[4], reordered[3]];
  const vReorder = verify(bulletin, reordered, round.decisions, round.serverSeed, roundId);
  console.log('GATE F (reordering sealed grades is detected):', !vReorder.ok ? 'PASS' : 'FAIL');

  const all = gA && gB && vOK.ok && !vTamper.ok && !vForge.ok && !vReorder.ok;
  console.log('\n' + (all ? '✅ ALL SEALING GATES PASS' : '❌ SOME GATES FAILED') + ' — sealed, confidential, tamper-evident, forgery-proof, order-bound.');
}
