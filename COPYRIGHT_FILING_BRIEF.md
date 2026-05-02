# Copyright Filing Brief — Yellow Jacket Tour

**Date prepared:** 2026-05-02
**Prepared for:** Dalton Graham / Blank Canvas, Inc.
**Filing portal:** https://eco.copyright.gov (the "eCO" system at the U.S. Copyright Office)

This brief tells you exactly what to do, what to upload, what to type into each form field, and what each fee covers. It does not file anything for you — eCO requires you to log in personally, attest under penalty of perjury, and pay. A browser-piloting agent (Hermes/Codex) can drive the form clicks while you are present at the keyboard for login + payment + the attestation checkbox.

---

## 1. What You Are Filing

Four works total. Recommended approach: file as **two registrations**, not four, to save fees.

| # | Bundle | Form type | Fee | Why bundled |
|---|--------|-----------|-----|-------------|
| 1 | All three Markdown documents (`README.md`, `RULES.md`, `MIXED_GAMES_DESIGN.md`) | **Group registration of unpublished literary works** ("GRUW") | $85 single fee | Same author, same claimant, all unpublished, all literary works |
| 2 | `index.html` source code | **Standard application, computer program** | $65 (single author/claimant, single work) | Computer programs have a separate deposit rule |

**Total: $150.** If you instead file four separate single-work registrations you pay $65 × 4 = $260. The grouped option is recommended unless your attorney says otherwise.

If GRUW is not available for any reason (e.g. eCO system rejects the group), fall back to single-work registrations at $65 each.

---

## 2. Account Setup (One Time)

1. Go to https://eco.copyright.gov.
2. Click **"New User"** (top right).
3. Create a personal account in the name **Dalton Graham**, email `voxiesundragon@gmail.com`. The account is yours personally; the *claimant* on the filings will be the entity.
4. Verify the email link.
5. Log in.

Account is permanent and reused for every future filing.

---

## 3. Filing #1 — Group Registration of the Three MD Documents

### Form fields and exact values

After login, click **"Register a Group of Works"** → **"Group of Unpublished Works (GRUW)"**.

| Field | Value to enter |
|-------|----------------|
| Type of work | **Literary Work** |
| Title of group | `Yellow Jacket Tour — Design Documents (May 2026)` |
| Number of works in group | `3` |
| Title of work 1 | `Yellow Jacket Tour README` |
| Title of work 2 | `Yellow Jacket Tour Complete Rules Manual` |
| Title of work 3 | `Mixed-Games Extension to the Yellow Jacket Tour — Design Specification v0.2` |
| Year of completion (each) | `2026` |
| Author name | `Dalton Graham` |
| Author citizenship | `United States` |
| Author domicile | `Iowa, USA` |
| Author birth year | (your birth year — required field) |
| "Author's contribution is anonymous?" | **No** |
| "Author's contribution is pseudonymous?" | **No** |
| "Made for hire?" | **No** for the personal filing. (See §6 below — after the founder-IP-assignment is executed, future filings from Blank Canvas, Inc. will say Yes here.) |
| Author created | `Text` |
| Claimant name | `Dalton Graham` |
| Claimant address | (your home address) |
| Claimant transfer statement | Leave blank for this filing (you are still the author/owner; the entity assignment hasn't been recorded yet) |
| Limitation of claim — Material excluded | `None` |
| Limitation of claim — New material included | `Entire text` |
| Rights and permissions contact | Same as claimant |
| Correspondent | Same as claimant |
| Mail certificate to | Same as claimant |
| Special handling? | **No** (special handling = $800 expedited; not needed) |

### Deposit upload

Upload **one file per work**, all three in the same submission.

| Work | File to upload | Notes |
|------|----------------|-------|
| README | `README.md` | Upload as `.md`. eCO accepts plain text. |
| Rules manual | `RULES.md` | Same. |
| Design spec | `MIXED_GAMES_DESIGN.md` | Same. |

If eCO rejects `.md` extension (it sometimes does), rename copies to `.txt` before upload — the content is identical. Keep the original `.md` files unchanged.

### Pay and submit

- Fee: **$85**.
- Payment: ACH (free) or credit card (small surcharge). ACH is preferred.
- After payment, you receive a case number (format: `1-XXXXXXXXXX`). **Save this number** in `IP_INVENTORY.md` §11.
- The official certificate arrives by mail in 3–9 months (the wait does not affect your protection — the effective registration date is the date of submission).

---

## 4. Filing #2 — Source Code Registration for `index.html`

After login, click **"Register a Standard Application"** → **"Computer Program"** as the type of work.

| Field | Value |
|-------|-------|
| Type of work | **Computer Program** |
| Title | `Yellow Jacket Tour — Source Code v69.25` |
| Year of completion | `2026` |
| Date of first publication | Leave blank (work is not yet published — you have not made it commercially available) |
| Author name | `Dalton Graham` |
| Author created | `Computer program` |
| Claimant | `Dalton Graham` |
| Special handling? | No |

### Deposit upload — special rule for source code

The Copyright Office has a specific rule for computer-program deposits because source code may contain trade secrets. You have two options:

**Option A (recommended for your case): full source deposit.**
- Upload the entire `index.html` as one file.
- Choose `"Entire work, identifying material"` in the deposit form.
- This gives the strongest registration but means the full source is in the Copyright Office's deposit archive (technically retrievable with a Library of Congress request, in practice almost never accessed).

**Option B: first 25 / last 25 pages with trade-secret redaction.**
- Print or export the first 25 pages of `index.html` and the last 25 pages.
- Black out (redact) any portion you want to claim as a trade secret — typically the AI threshold optima section, calibration tables, and any other §7-trade-secret content from `IP_INVENTORY.md`.
- Combine into a single PDF and upload.
- This is the standard "trade-secret deposit" used by software companies. Slightly weaker registration scope but protects sensitive code.

**Recommendation for `index.html`:** Option A. The build is going to be self-published (single-file HTML, openly downloadable from GitHub Pages). There is no trade secret in the code itself; the trade secrets are in the audit data and threshold optima, which are *not* in the build. Full deposit is fine and gives you the strongest registration.

### Pay and submit

- Fee: **$65**.
- Same payment + case-number flow as Filing #1.

---

## 5. After Filing — What to Save

For each of the two filings, save the following to `/IP/registrations/`:

1. The eCO case number (format `1-XXXXXXXXXX`).
2. A PDF of the filing-confirmation email.
3. A copy of the deposit file(s) you uploaded, named with the case number.
4. The payment receipt.
5. A `case-NUMBER-summary.md` recording: filing date, work titles, claimant, fee paid, case number.

When the certificate arrives by mail, scan it and add to the same folder.

---

## 6. After the Founder IP Assignment Is Executed

Once Dalton Graham executes the IP-assignment instrument transferring all YJT assets to Blank Canvas, Inc., you should **record the transfer** at the Copyright Office.

- Form: "Document Cover Sheet" (eCO has a separate workflow for recording transfers).
- Fee: $125 for a transfer of one work, $125 + $25/title above 10.
- Upload: the executed assignment document + cover sheet.
- This puts the entity's name in the public record as the new owner. Without this step, the chain of title is unclear and future licensing or enforcement gets harder.

Schedule this for the same week as your corporate-attorney meeting that produces the assignment instrument.

---

## 7. Updates and Future Versions

Copyright registration covers the work as deposited. Material new versions need a new registration (called a "derivative work registration").

**When to re-file:**

- A new feature ships in `index.html` adding > ~20% new code → new registration (Filing #2 again, with title "Yellow Jacket Tour — Source Code vX.Y").
- A new design document is added (e.g., a future Mixed-Games Design v1.0 once a variant ships) → new GRUW registration.
- Minor fixes and refactors do not require re-filing.

Maintain a `registrations/REGISTRATION_LOG.md` with one row per filing for permanent record.

---

## 8. Common Mistakes to Avoid

1. **Filing as "published" when the work is not yet commercially available.** YJT is not published until you put it on a public URL or app store. Until then, "unpublished" is correct. Filing as "published" without a real publication date triggers eCO rejection.

2. **Author vs claimant confusion.** *Author* is who created it (Dalton Graham). *Claimant* is who owns the copyright today. Pre-assignment, both are Dalton Graham. Post-assignment, author stays Dalton Graham forever; claimant becomes Blank Canvas, Inc.

3. **Skipping the deposit copy.** Some online guides say "just describe the work." This is wrong — eCO requires the actual file to be uploaded.

4. **Forgetting the case number.** If the email gets lost and you don't record the case number, retrieving it later requires a written request to the Copyright Office. Save it immediately.

5. **Filing the same work twice.** Wastes the fee. eCO has duplicate-detection but it is not perfect; the rejected filing's fee is non-refundable.

---

## 9. Time and Cost Summary

| Item | Time | Cost |
|------|------|------|
| Account setup | 15 min | $0 |
| Filing #1 (GRUW for 3 MD docs) | 30–60 min | $85 |
| Filing #2 (source code) | 30 min | $65 |
| **Total to register everything you have today** | **~2 hours** | **$150** |

Optional later:
| Recording founder-IP assignment | 30 min + corporate attorney's draft | $125 + attorney fee |

---

**End of brief.** Hand this to the browser-piloting agent (or follow it manually) when ready to file.
