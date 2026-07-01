# License — Yellow Jacket Tour

**Software, design, brand, and rule system**
**Copyright (c) 2026 Blank Canvas, Inc.** — a Wyoming corporation
**Sole author:** Dalton Graham
**All Rights Reserved.**

---

## Plain-language summary

The Yellow Jacket Tour project (the source code in `index.html`, every Markdown document in this repository, the eight-beat hand structure, the Honey-Stroke and Sweet Stroke scoring laws, the Yellow Jacket and Bumblebee variants, the Buzz mascot, the brand lexicon, the **Tour de Bourdon** ("Tour of the Bumblebee" / **"the Nectour"**) season system and its three honors (**the Yellow Jacket**, **the Royal Suitor**, **the Pollen Trail**), **the Top Pot** heads-up finale, **the Hive Rating** (the Kalman/Glicko-2-flavored skill-rating filter), the **Phase C observed-action / EV-loss skill-credit** rating term, the audit data, and every related artifact) is **proprietary intellectual property of Blank Canvas, Inc.**

This repository is **source-available**, not open-source. You may read it. You may not copy it, redistribute it, deploy it, derive from it, embed it in another product, or use the brand or rule system in any commercial or competing project, without an executed license agreement from Blank Canvas, Inc.

If you found this repository because you are a user, a reviewer, a security researcher, an investor, an auditor, or a curious passer-by — welcome. The full license terms below describe what you can and cannot do.

If you want to use any part of this work commercially, contact Blank Canvas, Inc. at the address listed in `IP/IP_INVENTORY.md`. We grant licenses on reasonable terms; we do not grant unlicensed use.

---

## Full License Terms

### 1. Definitions

**"Work"** means everything in this repository, including but not limited to:

- All source code (`index.html` and any future code files);
- All documentation, rule manuals, and design specifications (every `.md` file in this repository, including but not limited to `README.md`, `RULES.md`, `MIXED_GAMES_DESIGN.md`, and the contents of the `IP/` directory);
- The eight-beat hand-structure system (Tea Box, Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) as a coordinated branded suite;
- The Honey-Stroke and Sweet Stroke scoring law in any expression or implementation;
- The dual-variant (Yellow Jacket / Bumblebee) loss-rule system;
- The agreed-total wagering primitive;
- The round-divisor variance-compression methodology;
- The survival-cushion late-registration handicap mechanic;
- The Adaptive Bogey-Loss percentile rule and the Hybrid Schema C bucket mapping;
- The Variant Calibration Mode methodology;
- The **Tour de Bourdon** season-system architecture and its colloquial branding ("Tour of the Bumblebee" / **"the Nectour"**) — the fixed three-tier calendar (Regulars / Majors-as-stages / the Main → the Top Pot), the multi-criteria rating-tier-scaled Royal Suitor eligibility predicate (with the LCB μ−1.5·RD fallback), the Eurovision-style decaying parallel points-carry ledger known as **the Pollen Trail**, the three-honors hierarchy (🧥 the Yellow Jacket + the Bumblebee plushie · 👑 the Royal Suitor · 🌼 the Pollen Trail), and the **Season Center** broadcast UI presentation;
- The **Top Pot** mark and the heads-up-final rating-seeded head-start mechanic (a calibrated nudge, not a skill guarantee — a single heads-up event over ~72 holes is high-variance / near coin-flip, so the seed is a small favoring nudge rather than a reliable favorite-identifier) — including the β-solving Monte-Carlo calibrated head-start variant;
- The **Hive Rating** mark and the underlying Kalman / Glicko-2-flavored latent-skill-rating filter as expressed in this Work — including the cut-blind smooth-order rankit performance-z, the OWGR-style strength-of-field bump (`fieldStrengthLambda · μ̄_field`), the field-strength floor (`sofMul`) anti-inflation guard, and the per-event-precision formula `τ_event = τ₀ · prestige(tier) · √(holes/72) · √(min(N,400)/64) · (rounds_played / R) · sofMul`;
- The **Phase C observed-action / EV-loss skill-credit** rating term — the analytical `true_EVloss = K·(1−skill)^p` model used for AI play, the event-length-scaled measurement-noise calibration `evLossNoise · √(18/holes)`, the per-event within-field z-normalization, the α-blend with the outcome-z, and the Phase 1 / Phase 2 (analytical-vs-solver) productionization roadmap;
- All related lore, characters (including but not limited to the "Buzz" mascot), names, and visual treatments;
- All audit data, calibration tables, AI threshold optima, simulation outputs, and Monte Carlo frequency tables, whether or not present in this repository.

**"Licensor"** means Blank Canvas, Inc., a Wyoming corporation, the owner of all right, title, and interest in the Work.

**"You"** (or "Licensee") means any individual or entity who accesses, views, downloads, clones, or otherwise interacts with this repository or any portion of the Work.

**"Use"** means any act of copying, distributing, displaying, performing, modifying, adapting, translating, deploying, hosting, embedding, or creating derivative works from the Work, in whole or in part.

### 2. Grant of Rights — What You May Do

The Licensor grants You a non-exclusive, non-transferable, revocable, worldwide, royalty-free license to:

- **Read and inspect** the Work for personal study, research, security review, or evaluation purposes.
- **Quote brief excerpts** of the Work in commentary, review, criticism, news reporting, scholarship, or research, in a manner consistent with the doctrine of fair use under 17 U.S.C. § 107 and equivalent provisions in other jurisdictions.
- **Discuss the Work** publicly, including describing its mechanics in your own words, provided you do not reproduce substantial portions verbatim and do not use the protected brand terms in a manner that suggests sponsorship or affiliation by the Licensor.

### 3. Restrictions — What You May Not Do

Without an express, written, executed license agreement from the Licensor, You may NOT:

(a) **Copy** the Work or any substantial portion of it, in any medium, for any purpose other than the limited inspection rights granted in §2.

(b) **Distribute, redistribute, or share** the Work or any substantial portion of it, including by uploading to another repository, hosting on another website, sharing as a file, or making available via any peer-to-peer or distribution system.

(c) **Deploy or host** any executable or runnable form of the Work, including the `index.html` file, on any public-facing or commercially-accessible URL, application store, mobile platform, embedded system, or distribution channel.

(d) **Modify, adapt, translate, port, or create derivative works** from the Work, in whole or in part, for any purpose, including but not limited to porting to other languages, platforms, frameworks, or media (e.g., implementing the rule system in another programming language, recreating it as a physical board game, or producing audio/video adaptations).

(e) **Use the brand assets** — including but not limited to the marks "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke", "Sweet Stroke", "Bumblebee", "Buzz", the eight-beat hand-structure marks (Tea Box, Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup), the Tour de Bourdon season-system marks ("Tour de Bourdon", "Tour of the Bumblebee", "the Nectour", "the Royal Suitor", "the Pollen Trail", "the Top Pot", "the Hive Rating"), the in-app scorecard-component marks ("The Card", "The Session Card", "Hero Strip"), and the **Golden Fairway** generative-music brand mark — in any commercial product, service, branding, advertising, marketing, social media account, domain name, or any context that could create confusion about source, sponsorship, or affiliation with the Licensor.

(f) **Use the rule system or game mechanics** — including but not limited to the Honey-Stroke law, the agreed-total wagering primitive, the round-divisor normalization, the dual-variant system, the eight-beat hand structure, the survival-cushion handicap, the Tour de Bourdon season-system architecture (the three-tier calendar, the multi-criteria tier-scaled Royal Suitor eligibility with LCB fallback, the parallel decaying-points Pollen Trail ledger, the Top Pot heads-up-final mechanic), the Hive Rating Kalman/Glicko-2-flavored rating filter as expressed in this Work, and the Phase C observed-action / EV-loss skill-credit rating term — in any commercial competing product. The mechanics may be discussed and analyzed (per §2 fair-use rights) but not implemented or commercially deployed.

(g) **Train machine-learning models** on the Work in whole or in part for the purpose of producing competing products, generating derivative works, or creating systems that reproduce the Work's distinctive characteristics. Inclusion of the Work in general-purpose model training corpora is not licensed and is subject to the Licensor's separate enforcement at its discretion.

(h) **Remove, alter, or obscure** any copyright notice, trademark notice, attribution, or this license file from any copy of the Work.

(i) **Misrepresent** the source or authorship of the Work, including by claiming to be the author or owner of all or part of the Work, or by attributing it to any party other than the Licensor.

(j) **Use the Work** in any manner that violates applicable law, including but not limited to laws governing gambling, age-appropriate content, data protection, or financial services in the jurisdiction where the Work is being used.

### 4. Trade Secrets — Additional Restriction

Certain artifacts of the project — including the audit data, AI threshold optima, calibration tables, and Monte Carlo frequency tables — are treated as **trade secrets** of the Licensor and are not present in this public repository. If You receive any such artifact, You agree to maintain it in strict confidence per the terms of any executed Non-Disclosure Agreement (`IP/NDA_TEMPLATE.md`). Public disclosure of any trade-secret artifact, whether or not subject to a written NDA, may give rise to claims under the Defend Trade Secrets Act of 2016 (18 U.S.C. § 1836) and equivalent state and international laws.

### 5. Third-Party Components

The Work loads two optional CDN dependencies at runtime, neither of which is part of the Work and each of which is independently licensed:

- **Three.js** — MIT License. <https://github.com/mrdoob/three.js>
- **Rapier WASM** — Apache License 2.0. <https://github.com/dimforge/rapier>

The Licensor does not redistribute either dependency. Their respective licenses govern Your use of those libraries independently of this License.

### 6. No Warranty

THE WORK IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR THAT THE WORK WILL OPERATE WITHOUT INTERRUPTION OR ERROR. The Licensor makes no representation that the Work will be suitable for any particular use, including for use in any gambling or wagering context where local law applies.

### 7. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE LICENSOR, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR ACCESS TO OR USE OF THE WORK, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST DATA, BUSINESS INTERRUPTION, OR LOSS OF GOODWILL, REGARDLESS OF THE THEORY OF LIABILITY AND EVEN IF THE LICENSOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

### 8. Reservation of Rights

All rights not expressly granted in this License are reserved by the Licensor. No rights are granted by implication, estoppel, or otherwise. The Licensor may, at any time and at its sole discretion, grant additional rights to specific parties under separate written license agreements; nothing in this License limits the Licensor's right to do so.

### 9. Termination

Your rights under this License are automatically terminated, without notice, if You breach any term of this License. Upon termination, You must cease all use of the Work and destroy all copies in Your possession or control. The provisions of §§4, 6, 7, 8, 10, 11, and 12 survive termination.

### 10. Enforcement

The Licensor reserves all rights to enforce this License, including by seeking injunctive relief, monetary damages (including statutory damages under 17 U.S.C. § 504), attorneys' fees and costs (under 17 U.S.C. § 505 and equivalent provisions), and any other remedy available under law.

### 11. Governing Law and Jurisdiction

This License is governed by the laws of the State of Wyoming, without regard to its conflict-of-laws principles. Any dispute arising under or relating to this License shall be brought exclusively in the state or federal courts located in Laramie County, Wyoming, and You consent to the personal jurisdiction of those courts.

### 12. Entire Agreement and Severability

This License, together with any executed agreements with the Licensor (including but not limited to NDAs and commercial license agreements), constitutes the entire agreement between You and the Licensor regarding the Work and supersedes all prior or contemporaneous agreements regarding the same subject matter. If any provision of this License is held unenforceable, the remaining provisions remain in full force.

---

## Want a Commercial License?

If You wish to use the Work for any purpose not permitted by §2, contact the Licensor:

**Blank Canvas, Inc.**
Attn: Dalton Graham
voxiesundragon@gmail.com

The Licensor grants commercial licenses on reasonable terms. License types under consideration include:

- **Evaluation license** — limited-time, internal use for evaluation by potential commercial partners.
- **OEM / White-label license** — embed the Work or its rule system into another product or service.
- **Distribution license** — distribute the Work via a specific channel (app store, web property, embedded system).
- **Trademark license** — use the brand assets in a specific commercial context.
- **Acquisition** — acquire all rights to the Work outright.

Discussions are welcome.

---

**End of License.**

This License was last updated on **2026-05-17** (v69.124). Major revision history: 2026-05-02 (original); 2026-05-13 (v69.105) added the Tour de Bourdon / Nectour season-system marks, the three-honors hierarchy (Yellow Jacket / Royal Suitor / Pollen Trail), the Top Pot mark, the Hive Rating mark, and the Phase C observed-action / EV-loss skill-credit rating-term to the protected-IP enumeration; 2026-05-17 (v69.124) added the **Golden Fairway** generative-music brand mark and the **Honey-Stroke scorecard** product marks ("The Card" — the per-hole match scorecard component, "The Session Card" — the per-hand cash session log component, "Hero Strip" — the YJ-style hero-zone layout placing the user's avatar / hole cards / status tags in a dedicated bar below the felt). The Licensor reserves the right to amend this License for future versions of the Work; Your use of any specific version of the Work is governed by the License in effect at the time of Your access.
