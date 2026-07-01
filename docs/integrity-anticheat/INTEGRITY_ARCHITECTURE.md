# Yellow Jacket — Integrity Architecture v2

**Independent Integrity Council + Public Transparency Log**
**Status.** Architectural recommendation to any future partner-operator. Not a commitment by Blank Canvas, Inc. Three real-world gating items remain open (§ Open Gating Items).

**Legal disclaimer (not legal advice).** This document describes a sweepstakes/real-money-adjacent integrity stack (Cayman foundation, gaming-fund escrow, regulator interaction, and any house-bot allowances). The sweepstakes model and shill-bot rules are under active 2025–26 legal and regulatory scrutiny; nothing here establishes blanket legality and nothing here is legal advice. A per-state / per-jurisdiction gaming-law opinion is a prerequisite to operation — the regulators and escrow institutions named below (UK GC, MGA, Curaçao, Ontario AGCO, Nevada NGC, Bank Frick, Walkers) are illustrative targets, not a settled legal posture. This requirement is gated by the deferred per-jurisdiction regulatory matrix (§ Open Gating Items).

---

## 1. Legal Structure & Structural Irrevocability

**Entity.** Cayman Islands Foundation Company structured as a Purpose Trust with a separate board. Sole purpose: independent oversight and enforcement of Yellow Jacket game integrity per published rules.

**Veto thresholds — two-tier:**

| Tier | Trigger | Mechanism |
|---|---|---|
| Full Council Veto | $500,000+ lifetime winnings/confiscations | All 7 council members may review; 5-of-7 to overturn operator action |
| Three-Member Sub-Panel Veto | $75,000–$499,999 | Three-member rotating sub-panel; 2-of-3 to overturn |
| Operator Discretionary (logged) | < $75,000 | Operator may act; action MUST be logged; council may pull any case for review at discretion |

Thresholds indexed annually to a published CPI basket.

**Threshold signature scheme.** FROST (Flexible Round-Optimized Schnorr Threshold Signatures) at 5-of-7 for the council, with operator co-signing for routine entries. FROST chosen over naive multisig for signer-set privacy and operational security. Keys held in distributed HSMs across at least two jurisdictions.

**Key rotation.** 4-of-7 threshold authorizes any key rotation. Annual ceremony with documented protocol and multi-party witnesses.

**Death-spiral clause.** If 3 or more council members resign within any 90-day period citing operator interference or non-compliance, the operator is contractually required to:
- Immediately pause all new high-value play ($75k+ threshold) until a new council is seated.
- Pay an **$8M penalty** (~3× annual integrity-layer operating budget) into a pre-funded escrow at a third-party institution, released to the new council automatically on trigger.

The penalty is **self-executing** (escrow release, not court-dependent litigation).

**Independent mirroring.** The transparency log is mirrored by a minimum of three independent infrastructure providers. Candidates: Cloudflare R2, a major academic CS-department infrastructure (e.g., MIT CSAIL or Stanford SAIL), IPFS + Filecoin pinning. Final selection pre-launch with named, contracted commitments.

**Mandatory completeness attestation.** Every 168 hours the council publishes a signed attestation: *"All enforcement actions between [timestamp X] and [timestamp Y] have been correctly logged and no actions known to the council were omitted."* A missing attestation is treated as a public alarm. The attestation is reconciled against the pre-commit detection queue (see §3) — not against the operator's word.

---

## 2. Council Composition, Appointment & Governance

**Composition.** 5–7 members across the following categories:

| Category | Purpose |
|---|---|
| Poker historian / tradition keeper | Institutional memory, cultural integrity |
| Mathematical game theory / detection specialist | Statistical authority, peer review of detection methods |
| Chess + poker dual-credential | Cross-domain discipline and respect |
| Former senior gaming regulator or compliance counsel | Regulatory realism, enforceability |
| Long-tenure serious recreational player | Player trust, lived-experience validation |
| Industry commentator / historian (optional 7th) | Public communication of decisions |

**Appointment.** Self-perpetuating with safeguards:
- Replacements require 5-of-7 approval from existing council + 30-day public comment period.
- **Mandatory rotation cap:** maximum 2 consecutive 3-year terms (6 years total), then 3-year gap before re-eligibility.
- **One externally appointed seat** by a recognized university law school or professional society — provides "watchdog among watchdogs" function.

**Recall mechanism.** 4-of-7 of remaining members may remove a council member for cause (compromise, conflict, incapacity, breach of conduct rules). Recall published in the transparency log with public reasoning.

**Compensation & operations.**
- Annual compensation per member: $75,000–$120,000 (consider $150,000–$250,000 if needed to attract the right caliber of senior compliance / former regulator).
- D&O insurance: council-controlled policy, operator-funded.
- Expense reimbursement.
- Geographic distribution: members in at least three time zones; quarterly video meetings minimum, annual physical meeting.

**Conflict of interest rules (strict).**
- No equity > 0.5% in any competing poker platform.
- No active consulting contracts with any competing operator.
- Annual financial disclosure to the ombudsman.
- Mandatory recusal on any case with personal or financial connection.
- No current or recent (5-year window) Yellow Jacket employees, > 1% shareholders, or active high-volume players may serve.

**Ombudsman.** One additional independent figure with explicit authority to publicly criticize council decisions or processes. Separate compensation, separate D&O, separate counsel. Appointed by external accreditation body. Term: 5 years, non-renewable.

**Staffing under the council entity.** The council itself is a part-time oversight body. Investigative work is performed by full-time employees of the council entity, separate from the operator:
- Executive Director: $200K–$300K/yr
- Forensic Analysts (3–5): $120K–$200K each
- Counsel (fractional or full-time): $100K–$200K/yr
- Operations / Admin: $80K–$120K/yr

---

## 3. Transparency Log — Cryptographic Design

**Core structure.** Merkle Mountain Range (following RFC 6962 Certificate Transparency).

**Pedersen commitments for player identity.**

```
C = g^playerID · h^r
```

…where the blinding factor `r` is held in council escrow, Shamir secret-shared among council members with a 4-of-7 unblinding threshold. This resists brute-force deanonymization while preserving council-side accountability.

**Batched publication.** All enforcement actions for a given week are published together at the start of the following week. Entries within the batch are unordered with respect to wall-clock time to prevent timing-correlation attacks against external observers.

**Pre-commit detection queue.** Every time an internal detection rule fires (collusion correlation, RTA score, multi-accounting flag, etc.), an entry is automatically written to a queue that the council has continuous-streaming read access to via cryptographically committed API. The weekly attestation reconciles:
- Actions in the published log, vs.
- Detection events in the pre-commit queue.

Mismatch (a detection that fired but wasn't surfaced as an action OR an action that wasn't preceded by a queued detection) triggers an automatic public flag. **This closes the "operator can simply not surface cases" hole that pure post-hoc logging cannot.**

**Verification.**
- Public proof-of-inclusion API.
- Public proof-of-completeness API (against the council's attestations).
- Annual third-party academic audit, rotating university CS department, full report public.
- Public bug bounty: $5K–$500K tiered by severity, funded by the council entity.

**Cryptographic agility.** FROST + Pedersen are DLP-based and quantum-vulnerable on ~10-year horizon. The implementation wraps both primitives in an abstraction layer that supports migration to post-quantum primitives (Dilithium signatures, lattice-based commitments) without log-rewrite.

---

## 4. Appeal Mechanism & Funding

**Tiered process.**
1. Internal review (operator + evidence).
2. Council review + veto opportunity (per § 1 thresholds).
3. Binding arbitration (final step).

**Administration.**
- US players: JAMS, published rules.
- Non-US players: ICC or LCIA, with player choice of seat.
- Three-arbitrator panels: one appointed by each party, chair selected by the first two.

**Funding model.**
- Filing fee: 1% of dispute amount, capped at $10,000, refunded to player on prevailing.
- Hardship waiver: published criteria, decided by ombudsman.
- Arbitration cost: loser-pays default, with cost-shifting available.
- Council-entity backstop fund covers cost in operator-refusal cases.

**Disputed funds escrow.** Held at a specialized institution willing to handle gaming-related funds (Liechtenstein's Bank Frick, Cayman's Walkers Trustee, or equivalent). Multi-signature release controlled by the council's entity.

**Publication policy.** Post-arbitration: structured public summary in transparency log. Full record sealed unless a defined trigger is met (e.g., pattern of repeated behavior across multiple cases).

---

## 5. Regulatory Disclosure Handling

**Published per-jurisdiction matrix.** For each licensed jurisdiction the operator serves, the matrix documents:
- SAR/STR filing trigger and timing.
- Tipping-off restrictions and information-wall requirements.
- Customer-action moratorium periods.
- Operator → council briefing rules (when council may be informed of filings).

**Regulator wall.** Designated personnel handle all regulator interaction. These personnel are prohibited from briefing the council on filings until legally permitted under the matrix.

**Hierarchy.** Regulator orders > council veto > operator preference. The council may publicly note disagreement in the transparency log where legally allowed.

**Annual public report.** High-level counts and categories of regulator interactions (no specifics that would violate confidentiality).

---

## 6. Detection Technology

The detection methodology is specified in full in **`DETECTION_TECHNOLOGY.md`** (companion document). It covers four detection classes — collusion, RTA / solver assistance, multi-accounting, and bot — with target FP/FN rates per class, validation approach, and explicit limitations.

The detection layer populates the **pre-commit detection queue** defined in §3 of this architecture. Every detection flag requires human review before becoming an enforcement action; nothing is automatically published to the transparency log.

**Publication policy.** Methodology categories are public; specific thresholds and signal weights rotate on a non-public schedule. See `DETECTION_TECHNOLOGY.md` §5.

**Honest baseline.** Detection alone is insufficient — the published FN rates (10–35% depending on class) mean structural deterrents (transparency log, ban-and-confiscate consequences, the Sovereign Standard's reputation effects, ongoing method rotation) carry significant weight in suppressing actual cheating rates below raw detection rates.

---

## 7. Player-Side Visibility

The integrity architecture only protects players who know it exists. Therefore:

- Every player dashboard shows council status (✓ active), link to most recent completeness attestation, count of recent enforcement actions (anonymized), and a one-click link to the appeal process.
- Initial onboarding includes a one-paragraph explanation of the council and the transparency log.
- The full integrity architecture document is published on a single public page, always accessible.

---

## 8. Wind-Down Provision

If the operator becomes insolvent, is sold, or winds down:
- The council entity and transparency log continue under the purpose trust.
- Disputed funds remain under council escrow control until resolved.
- An endowment fund (~0.5% of GGR set aside during operating years into a perpetual trust) funds the council post-wind-down.
- If endowment is insufficient, a graceful shutdown procedure archives the log to a public institution (Internet Archive, university library, IPFS pinning).
- Successor operators (if any) must contractually assume integrity obligations.

---

## 9. Operating Budget

Realistic steady-state annual budget for the full integrity layer:

| Line | Range |
|---|---|
| Council compensation (7 × $75–250K) | $525K–$1.75M |
| Ombudsman (compensation + D&O + counsel) | $200K–$400K |
| Executive Director + forensic analysts + counsel + ops | $1M–$2M |
| Annual academic audit | $50K–$150K |
| Bug bounty pool | $100K–$300K |
| Mirroring + cryptographic infrastructure | $100K–$250K |
| Arbitration reserve fund | $100K–$500K |
| Cayman foundation maintenance + legal | $100K–$200K |
| **Total** | **~$2.2M – $5.5M / yr** |

Three-year capital floor for bootstrap: **$9M–$15M dedicated integrity-layer capital**. This is independent of the operator's core product capital.

**Base case (most likely):** $3.2M/yr operational + $11M three-year capital floor. Assumes a 7-member council at mid-compensation, lean forensic team (3 analysts), single bug-bounty tier funded, single annual academic audit, modest arbitration reserve.

**Low case (smaller partner / regional operator):** $2.2M/yr operational + $7M three-year capital floor. Assumes 5-member council at lower compensation, 2 forensic analysts, smaller reserves. Below this floor, the full architecture is not feasible — see "Minimum Viable Integrity Layer" below.

**High case (multi-jurisdictional, large operator):** $5.5M/yr operational + $18M three-year capital floor. Assumes 7-member council at higher compensation to attract senior regulator alumni, 5 forensic analysts, full bug-bounty tiers funded, two annual audits (cryptographic + operational), substantial arbitration reserves for high-stakes case load.

---

## 9a. Minimum Viable Integrity Layer

The full architecture described above assumes a sophisticated, well-capitalized operator. **If the partner-operator is smaller, regional, or bootstrapped, the architecture must scale down honestly rather than be launched at full scale and gradually compromised.** A scaled-down version that is genuinely operational is more credible than a full-scale version that gets gutted under capital pressure.

**Minimum Viable Integrity Layer (operates at ~$200K–$500K/yr):**

| Element | Full Architecture | MVI Version |
|---|---|---|
| Council | 7 members + ombudsman + staff, Cayman foundation | **3-member advisory board** (real humans, named publicly), no separate legal entity, no veto power — advisory only with public disagreement rights |
| Transparency log | FROST 5-of-7 multi-sig, MMR, Pedersen commitments, batched publication | **Public append-only JSON file**, hashed and signed by operator + at least one advisor weekly; published to a public mirror (e.g., GitHub repository with public history) |
| Pre-commit detection queue | Continuous-streaming API to council | **Weekly enforcement-action digest** emailed to advisors and published publicly |
| Appeals | JAMS / ICC arbitration, three-arbitrator panels, escrow | **Single-mediator dispute resolution** through an established consumer-arbitration service (e.g., AAA's expedited consumer process); operator-funded |
| Detection technology | Full forensic team + academic audits + bug bounty | **Published methodology document** + annual external review by a single named expert; no in-house forensic team beyond the operator's compliance staff |
| Regulatory disclosure | Per-jurisdiction matrix + regulator wall | **Single-jurisdiction operation** with documented compliance procedure; no parallel multi-regulator stack |
| Death-spiral clause | $8M self-executing escrow penalty | **Public-statement clause**: if all 3 advisors resign citing operator interference, the operator must publicly state so on the homepage for 30 days |

**MVI total annual cost:** $200K–$500K. Realistic for an operator with $2M–$10M ARR.

**MVI is still better than 100% of currently operating poker platforms** because no current operator publishes its enforcement log, names its advisors, or commits to consumer-arbitration appeals. It is not the full Sovereign Standard, but it is honest, defensible, and structurally aligned with the Standard's principles.

**Migration path.** As the operator grows, elements migrate upward toward the full architecture in defined order: (1) advisors → formal council with veto power, (2) JSON file → cryptographic MMR log, (3) weekly digest → continuous detection queue, (4) consumer arbitration → JAMS/ICC, (5) single jurisdiction → multi-jurisdiction matrix, (6) public-statement death-spiral → financial penalty. Each migration is itself publicly documented.

**Choosing between full architecture and MVI** is a capital + scope decision made before launch, not a runtime decision. Switching modes mid-flight is precisely the kind of erosion that destroys restraint-based brands.

---

## 10. Bootstrap Protocol (Year 0)

- Seed funding from founder / early capital allocation, separate from player funds.
- Cryptographic infrastructure built in parallel with core platform.
- Founding cohort recruitment begins immediately upon capital commitment.
- 4–6 tabletop exercises before going live: synthetic mock cases covering distinct case types (collusion ring, lone bot, suspected RTA, multi-accounting, false-positive resolution, regulator-conflict). Each tests a different part of the architecture under stress.

---

## Open Gating Items (Cannot Be Solved In Documentation)

These four items are real-world commitments that no document can substitute for. The architecture is approximately 75% real until they are addressed:

| Item | Status | Path Forward |
|---|---|---|
| **Founding cohort** | TBD | Recruit ≥1 real human with verbal commitment in principle. The framework is vaporware until this is done. |
| **Capital commitment** | Unspecified | $9M–$15M dedicated integrity-layer capital across first 3 years must be explicitly allocated (founder + investor + partner). |
| **Per-jurisdiction regulatory matrix** | Promised but not written | Actual matrix for 3–5 specific jurisdictions (UK GC, MGA, Curaçao, Ontario AGCO, Nevada NGC). Deferred until the partner-operator's target jurisdictions are chosen. |

---

## Relationship to Other Documents

- `SOVEREIGN_STANDARD.md` — Pillar 7 is operationalized by this architecture.
- `MONETIZATION_FRAMEWORK.md` — Section 6 (Pricing-Decision Protocol) routes high-impact monetization decisions through council review.
- `YJSACRED_WIRE_FORMAT.md` — the partner-server contract the cryptographic primitives in §3 sit on top of.
- `index.html` — the YJSacred client primitives (transcript layer, hash-chained ledger, Merkle inclusion proofs) the architecture cryptographically depends on.

---

*v2 of the architecture, post hyper-critical review. Open gating items must be resolved before the architecture is operational. The document is structurally sound; the operation is downstream of human and capital decisions that no further refinement can replace.*
