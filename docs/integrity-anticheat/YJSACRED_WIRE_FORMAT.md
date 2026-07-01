# YJSacred Wire Format — Partner-Server Spec

**Version:** YJSacred 1.0 (transcriptSchema: `v1.0`, namespace: `YJSacred/1.0`)
**Client build at time of writing:** YJ v69.128 (`2026.05.17-v69.128-yjsacred-audit-finishing`)
**Audience:** the partner-side server engineer integrating YJSacred-emitted transcripts and ledger entries into the operator's anti-cheat, identity, dispute, and transparency stack.

This document describes the **bytes the client puts on the wire**. It does not prescribe storage technology, identity strategy, or transparency-log mechanics — those are the partner's calls. It does prescribe *what the server must re-verify*, *what it cannot re-verify with the client's emitted data alone*, and *what it must layer on top*.

---

## 0. Mental model

The client emits two related kinds of artifact:

1. **Transcripts** — self-contained, self-hashed JSON objects describing one finished unit of play (a tour season, a fixed-hole match, or a single cash hand).
2. **Ledger entries** — append-only records that wrap a transcript (or another record) and chain to the previous record by SHA-256. The client maintains its own ledger for local auditability; the server maintains the authoritative one.

Both shapes are versioned by `transcriptSchema` and `namespace`. Any field-shape change bumps the schema version. Servers MUST reject unknown versions explicitly.

All hashing on the wire is **SHA-256, hex-encoded, lowercase**. All JSON is hashed via the client's `canonicalJSON` (deterministic key-sorted serializer — see §6).

---

## 1. Transport-level expectations

- **Encoding.** UTF-8 JSON. No BOM. No trailing newline expected.
- **Idempotency.** Servers should treat `transcriptHash` as the dedup key.
- **Schema gate.** If `transcriptSchema !== "v1.0"`, reject with a clear error.
- **Size limits.** The client caps `canonicalJSON` at 1M entries per array/object and depth 100. Servers SHOULD enforce a comparable upstream limit (suggested: 5 MB per transcript, 10 MB per ledger entry) to prevent slowloris-style ingestion DoS.

---

## 2. Transcript shapes

Every transcript carries these common fields:

```
transcriptSchema   "v1.0"               required, strict equality
namespace          "YJSacred/1.0"       required, strict equality
appVersion         string               informational (e.g. "2026.05.17-v69.128-...")
mode               "tour" | "solo" | "hotseat" | "sharelink" | "cash"
builtAt            ISO-8601 UTC string
telemetry          object               (see §2.4)
transcriptHash     64-char lowercase hex   SHA-256 of canonicalJSON(transcript - transcriptHash)
```

### 2.1 Tour-season transcript (`mode: "tour"`)

```
seedStr            string               the engine seed used by Season.startCareer
cfg                object               the deterministic engine config (see §2.5)
nSeasons           integer  ≥ 1
claimedResult: {
  finalTop:        array of {rank, id, name, skill, skillRank, skillPct, hiveRating, rd, vol, events, majorsPlayed, careerEarnings, bestFinish, jacketWins, majorWins, regularWins}  -- top 25 only
  careerLog:       array of {year, crown, jacket, riser, rhoSeason, rhoMain}
  lastSeason:      { year, hiveCrown, yellowJacket, rhoSeason }   -- nullable
}
```

Server re-verification: re-run `Season.startCareer(cfg, seedStr, nSeasons)`, compare `claimedResult.finalTop[0..4].name` and `claimedResult.careerLog` via canonical JSON. **This is full-strength deterministic replay.**

### 2.2 Match transcript (`mode: "solo" | "hotseat" | "sharelink"`)

```
gameVariant        "yellowjacket" | "bumblebee"
holeCapSpec        object | null
strokeCap          integer | null
totalHoles         integer
players: {
  p1: { name, golfTotal, honeyTotal, total },
  p2: { name, golfTotal, honeyTotal, total },
}
aiContext          { aiSkill, aiTier } | null
holes: [
  {
    holeNum, p1Golf, p2Golf, p1Honey, p2Honey, outcome, winner, winCat, loseCat, pot,
    deal: { p1Cards: [{r,s},...], p2Cards: [{r,s},...], community: [{r,s},...] },   -- v69.125+
    actions: [{ actor, kind, amount, street, agreedTotalBefore, agreedTotalAfter, currentProposalAfter, ts, latencyMs }],
    resolvedAt: ISO-8601 | null,
  }
]
claimedResult      { winner: "p1"|"p2"|"tie", p1Total, p2Total } | null
```

Server re-verification:
- **If every hole has `deal`:** rerun the engine's `evaluate7` + `golfScoresFromShowdown` on each hole, confirm `winner`, `winCat`, `loseCat`, and `p1Golf`/`p2Golf` match. Then cross-check the running totals.
- **If any hole lacks `deal`:** pre-v69.125 transcript — re-verification can only check the running totals. The client surfaces this with `lowAssurance: true` from `replayMatch`. **Servers should reject low-assurance transcripts for any high-value decision** (payout, dispute resolution, leaderboard inclusion).

### 2.3 Cash-hand transcript (`mode: "cash"`)

```
tableId, tableHandId, variant, smallBlind, bigBlind
handNumber, seatPerspective: "hero"
outcome, handClass, golfDelta, chipDelta, pot, isShowdown
deal:    { hero: [{r,s},{r,s}], board: [{r,s},...] }
actions: [{ seatIdx, playerId, kind, amount, potBefore, currentBetBefore, ts, latencyMs }]
```

Server re-verification (the client only does the cheap structural checks listed in §3.2):
1. Re-run the betting state machine against `actions` to reconstruct the true pot and per-seat chip movements; confirm they match `pot` and `chipDelta`.
2. If `isShowdown`, run `evaluate7(deal.hero, deal.board)`, confirm category name matches `handClass`.
3. Confirm `outcome` is consistent with the resolved action log (fold → folder seat, etc.).

**The client does NOT do pot reconstruction.** This is intentional — the partner server is authoritative for chip math.

### 2.4 Telemetry sub-object (all transcripts)

```
telemetry: {
  clientCodeHash:   64-hex SHA-256 of the largest inline <script> in the running document
  userAgentHash:    64-hex SHA-256 of navigator.userAgent
  viewport:         "WIDTHxHEIGHT"      -- match only
  startedAt:        ISO-8601 | null     -- match only
  resolvedAt:       ISO-8601 | null     -- cash only
}
```

Server SHOULD maintain an allowlist of known-good `clientCodeHash` values (one per published build) and flag transcripts with unknown hashes for review. **This is a deterrent, not a prevention** — a sophisticated attacker can craft a patch that preserves the hash. See "Limitations of the client-code fingerprint" in the YJSacred docstring inside `index.html`.

### 2.5 Engine cfg fields (tour mode only)

The server's replay engine MUST agree with the client on these. Any drift breaks the replay.

```
universeSize, regularField, majorField, mainField,
nRegulars, nMajors,
holesPerRound, majorHoles, mainHoles,
minEventsForCrown, omega, finaleMode, finaleTargetWinProb,
skillSpread, skillCurve, honeyCapMode, offSeasonGap,
seed (echoes seedStr), nSeasons
```

The client's `_validateReplayCfg` enforces these caps on ingest — servers SHOULD do the same:

| Field | Hard cap |
|---|---|
| nSeasons | ≤ 30 |
| universeSize | 64 ≤ x ≤ 2048 |
| regularField / majorField / mainField | 8 ≤ x ≤ 1024 |
| holesPerRound / majorHoles / mainHoles | 0 ≤ x ≤ 216 |
| nRegulars / nMajors | 0 ≤ x ≤ 200 |

---

## 3. Server re-verification contract

### 3.1 Always do

- Verify `transcriptSchema === "v1.0"` and `namespace === "YJSacred/1.0"`.
- Verify `transcriptHash === SHA256(canonicalJSON(transcript - transcriptHash))`. Use **constant-time** comparison (the client does; servers MUST too).
- Verify `cfg` against §2.5 caps.
- Run the mode-specific replay (§2.1, §2.2, §2.3) and reject on mismatch.

### 3.2 Cash hand: client side does only structural sanity

The client's `replayCashHand` confirms:
- every `actions[]` entry has a known kind (`fold`/`check`/`call`/`bet`/`raise`/`post`/`allin`),
- timestamps are non-decreasing (1ms slack),
- bet/raise amounts strictly increase per street,
- claimed `pot` is ≥ the largest single action amount,
- showdown `handClass` matches `evaluate7`.

**It does NOT reconstruct the pot or chip movements** — the server must.

### 3.3 What the server must add (out of YJSacred scope)

- **Identity / Sybil.** YJSacred has no concept of "who". The partner must bind each transcript to an authenticated identity.
- **Behavioral analytics.** Bot detection, collusion detection, soft-play detection. The transcript carries `actions[].latencyMs` and `actions[].ts` which feed this; the analytics layer is the partner's.
- **Durable storage.** The server's ledger is authoritative; the client's `TourState.sacredLedger` is a local audit copy bounded at 5000 entries.
- **Transparency log.** Periodically publish a Merkle root over the server's ledger (use `YJSacred.ledger.getMerkleRoot` directly or any RFC-6962-style CT log). The client's Merkle is **domain-separated** (`L|` for leaves, `I|` for internal nodes) — match this exactly.
- **Multi-sig over high-stakes transcripts.** `YJSacred.crypto.multiSigVerify` accepts t-of-n Ed25519 signatures over a transcript. The partner produces (sponsor + platform + auditor) signatures and pins them to the transcript record.

### 3.4 Money standings & prize eligibility (real-money / Pollen) — MANDATORY

The shipped client is an AI simulation: every "player" is a bot profile, all earnings are simulated **Nectar**, and the Money List gate is **display-only**. The instant real cash (a **Pollen** prize) is involved, the server — not the client — MUST enforce all of the following. This is the foundational integrity layer; do not pay real money without it.

1. **Per-account flags.** Every account carries `isBot` (house/AI-controlled?) and `prizeEligible` (default `true` for verified humans, **forced `false`** for any `isBot` account). House bots are permitted in real-money fields ONLY if **disclosed in-lobby** ("AI Opponent") AND `prizeEligible:false`.
2. **Human-only money standings.** Prize allocation and the published Money List for any Pollen event MUST be computed over the **`prizeEligible && !isBot`** subset only. Bots never receive a cash prize and never occupy a paid position — a human's payout depends solely on finish relative to other humans. (In heads-up Swiss, rank humans on their human-vs-human results so a bot pairing cannot move a human's money position.)
3. **Eligibility / volume gate.** No treasury or prize payout to an account below the gate: **≥ 40 graded events** (rolling window for periodic settlements, cumulative for the annual) and rating deviation **RD ≤ cap**. Rationale (measured): at casual volume (~2.4 events/player) top-1% leaderboard precision ≈ 0.00 and the true-best can rank near the bottom; the gate is the precondition for paying skill rather than variance. (The client sim's `minEventsForCrown` default of 8 is a short-season convenience; production real-money is **40**.)
4. **RD-confidence-weighted payout curve.** Within the gated, human-only set, weight shares by `percentile × (1/RD)` and pay a **flat top "Crown band" + power-law middle** (the top-1% is a coin flip, so pay near-ties evenly) — never a winner-take-most spike on a noisy rank-1.
5. **Rating grading is opponent-agnostic.** Decision-quality (GTOq + ExploitCapture − GTO-mimicry, the rating relevant grader) is graded on **all** of a human's hands regardless of whether the opponent was human or bot — bot matches still produce valid skill data (and against your own disclosed bots, ExploitCapture has zero opponent-model noise). Only the **money** side is human-only; the **rating** side is not.
6. **Not legal advice.** House bots influencing real-money allocation is a shill/fraud risk; the sweepstakes + shill-bot posture is under active 2025–26 scrutiny. A per-state gaming-law opinion is required before operating real-prize play.

---

## 4. Ledger entries (append-only)

The client wraps transcripts (and some non-transcript events) in ledger entries:

```
{
  id:           UUIDv4 string (crypto.randomUUID) OR 32-hex (getRandomValues fallback)
  index:        integer (0-based)
  previousHash: "genesis" (if index === 0) | 64-hex (prior entry's `hash`)
  record:       arbitrary JSON (typically { kind: "match"|"season"|"cash"|..., transcriptHash, transcript })
  hash:         64-hex = SHA256(previousHash + "|" + canonicalJSON(record))
  appendedAt:   ISO-8601 UTC
}
```

Server re-verification (mirror `YJSacred.ledger.verifyChain`):
- For every i: `entry[i].previousHash === entry[i-1].hash` (constant-time).
- For every i: `entry[i].hash === SHA256(entry[i-1].hash + "|" + canonicalJSON(entry[i].record))` (constant-time).
- Break at the first mismatch; do not continue silently.

The server's ledger is **the source of truth**. The client's local ledger is for user audit; users who manipulate localStorage can corrupt their local copy without affecting the server's.

---

## 5. Commit-reveal (multi-party shuffle / joint seed)

When the partner orchestrates a multi-party game and wants an unbiased joint seed:

1. Each participant `i` calls `YJSacred.commitReveal.createCommitment(secret_i)` and sends the resulting `commitment_i` (the SHA-256, hex) to the server. Keep `nonce_i` and `secret_i` private until reveal.
2. After all commitments are in, participants reveal `{commitment_i, nonce_i, secret_i}`.
3. The server (or any verifier) calls `combineCommitments([opening_0, opening_1, ...])`. Result: `{ ok, seed, openings }`.

The seed derivation is **length-prefixed and domain-tagged**:

```
seed = SHA256( "YJ-JOINT-SEED/v1 " + N + " " + Σ_i( len(secret_i_bytes) + ":" + secret_i_bytes ) )
```

where openings are sorted by `commitment` hex first (so participants can't manipulate the seed by reordering). This is collision-resistant against boundary-ambiguous secrets like `("a|b","c")` vs `("a","b|c")` — a property the pre-v69.127 join-by-pipe derivation lacked.

Use the resulting `seed` as the input to whatever deterministic engine drives the game (e.g. as the `seedStr` to `Season.startCareer`).

---

## 6. canonicalJSON — the deterministic serializer

All hashing in YJSacred uses `canonicalJSON`, not stock `JSON.stringify`. The server's implementation MUST match the client's byte-for-byte. Rules:

- Object keys: sorted with default JS string sort (Unicode code unit order), serialized as `JSON.stringify(key) + ':' + value`.
- Arrays: preserved in order.
- Numbers: `String(value)`; `NaN` and `±Infinity` serialize as `null` (not JSON-representable).
- Strings: `JSON.stringify(value)` (RFC 8259 escaping).
- Booleans: `"true"` / `"false"`.
- `null`: `"null"`.
- `undefined`: object properties with value `undefined` are skipped; bare `undefined` serializes as `"null"`.
- **BigInt:** serialized as `JSON.stringify(value.toString() + 'n')` (the `n` suffix is the YJSacred tag; pure JSON has no BigInt).
- **Cycles:** throw `"canonicalJSON: cycle detected at depth N"`.
- **Depth limit:** throw if depth > 100.
- **Entry-count limit:** throw if any single array or object has > 1,000,000 entries.

A reference TypeScript implementation can be derived 1:1 from the IIFE inside `index.html` (search for `function canonicalJSON`).

---

## 7. Constants & enum tables the server needs

- **Transcript schema:** `"v1.0"` (strict equality; bump on any field-shape change).
- **Namespace:** `"YJSacred/1.0"` (strict equality).
- **Ledger hard cap (client):** 5000. Server is unbounded.
- **Ledger soft warn (client):** 500.
- **Replay cfg caps:** see §2.5.
- **Action kinds (cash):** `fold`, `check`, `call`, `bet`, `raise`, `post`, `allin` (alias `all-in`).
- **Action kinds (match):** `fold`, `check`, `call`, `bet`, `raise`.
- **Hand category indices (top bits of `evaluate7` output):** the engine's `CATEGORY_NAMES` table in `index.html` is authoritative. Servers MUST clone it exactly.

---

## 8. Versioning policy

- `transcriptSchema` is bumped on ANY field-shape change. Adding a new optional field is still a bump (servers reject unknown versions explicitly, which prevents silent drift).
- `namespace` is bumped on a semantically breaking change (e.g. switching the hash from SHA-256 to SHA-3).
- `appVersion` is informational and changes on every public build. Servers MAY use it for telemetry but MUST NOT base correctness decisions on it.

---

## 9. Open server-side responsibilities (not covered here)

These are the partner's calls; YJSacred does not address them:

- Player identity and Sybil resistance.
- Soft-play / collusion detection.
- Sophisticated-bot detection.
- Transparency-log mechanics (publication cadence, root-archival format).
- Multi-sig key custody.
- KYC, AML, payment rails, prize disbursement.
- Anything game-economic.

If any of these change the wire format (e.g. adding a server-side signature envelope around the transcript), bump `transcriptSchema` and document the new fields here.

---

*End of spec. Questions about the wire format belong with the YJSacred client maintainer; questions about server-side anti-cheat belong with the partner team.*
