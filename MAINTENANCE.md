# IP Maintenance Checklist — Yellow Jacket Tour

**Owner:** Blank Canvas, Inc.
**Maintainer:** Dalton Graham
**Last reviewed:** 2026-05-02

This is the ongoing-protection checklist. Run through it on the cadence indicated. A scheduled background agent can poke you when each item is due (`/schedule`).

---

## Per-Release (Every time `index.html` ships a new version)

- [ ] Confirm copyright notice block is still at the top of `index.html` and the year is current.
- [ ] Re-compute SHA-256 of all four primary source files; append to `IP_INVENTORY.md` §6 as a new dated row.
- [ ] Make a dedicated git commit for the version bump and tag it (`git tag v69.X`).
- [ ] If the version represents > ~20% new code in `index.html`, queue a new copyright registration (Filing #2 from `COPYRIGHT_FILING_BRIEF.md`).
- [ ] If a new design document was added or an existing one significantly extended, queue a new GRUW filing (Filing #1 from `COPYRIGHT_FILING_BRIEF.md`).

---

## Monthly

- [ ] Review Google Alerts for: `"Yellow Jacket Tour"`, `"Honey-Stroke"`, `"Bumblebee poker"`, `"poker golf hybrid"`. (See setup instructions below.)
- [ ] Search GitHub for repos named or tagged with `yellow-jacket`, `honey-stroke`, or with `index.html` files containing the project's distinctive code patterns.
- [ ] Search the App Store and Google Play for similar-looking listings.

---

## Quarterly

- [ ] Check status of every pending copyright registration in `IP_INVENTORY.md` §11. The eCO portal lets you look up case status by case number.
- [ ] Check status of every pending trademark application via TSDR (https://tsdr.uspto.gov) using each serial number.
- [ ] Verify all NDAs in `/IP/executed-NDAs/` are still in their engagement period; mark any that have ended.
- [ ] Audit who currently has access to which files (`MIXED_GAMES_DESIGN.md`, audit data, AI optima). If anyone no longer has a Permitted Purpose under their NDA, request return/destruction of materials.

---

## Annually

- [ ] Update copyright notices to the new calendar year on all four primary files.
- [ ] Re-snapshot the full `IP_INVENTORY.md` with current dates, hashes, and version numbers. Save the prior version as `IP_INVENTORY_archive_YYYY.md` so the inventory has annual snapshots.
- [ ] Renew domain registrations (yellowjackettour.com etc., once acquired).
- [ ] Backup the entire `/IP/` folder to a second offline location (e.g., encrypted USB stored separately from your primary working copy).

---

## Specific Trademark Maintenance Dates

(Fill in once trademarks are registered.)

| Mark | Serial | Filed | Section 8 due (year 5–6) | Section 8 + 9 due (year 9–10) |
|------|--------|-------|---------------------------|-------------------------------|
| YELLOW JACKET TOUR | | | | |
| HONEY-STROKE | | | | |
| BUMBLEBEE | | | | |

A missed Section 8 cancels the mark — set hard calendar reminders for each, with a 6-month buffer.

---

## Specific Patent Maintenance Dates

(Fill in if any provisional or utility patent is filed.)

| Patent | App # | Filed | Provisional → Utility deadline | Maintenance fees due |
|--------|-------|-------|--------------------------------|----------------------|
| | | | | |

Patent maintenance fees are due at 3.5, 7.5, and 11.5 years post-grant for utility patents.

---

## Setup: Google Alerts

1. Go to https://www.google.com/alerts.
2. Create alerts for:
   - `"Yellow Jacket Tour"` (exact match)
   - `"Honey-Stroke"`
   - `Bumblebee poker`
   - `"poker golf hybrid"`
   - `"agreed-total wagering"`
3. Set "How often" to "Once a day" and "Deliver to" your project email.
4. Save.

Cost: free.

---

## Setup: GitHub Search Saved Queries

1. Go to https://github.com/search?type=repositories.
2. Run these queries and bookmark each:
   - `yellow-jacket-tour`
   - `honey-stroke`
   - `"agreed-total wagering"`
3. Visit weekly.

Cost: free.

---

## When You See a Suspected Infringement

1. **Document first.** Take dated screenshots of the infringing material; capture the URL; archive at web.archive.org.
2. **Save evidence to** `/IP/infringement-watch/YYYY-MM-DD-source-name/`.
3. **Compare** the alleged infringement against your registered IP (text, code, marks).
4. **For obvious clones (text or code copied verbatim, or trademarks used identically):** send a cease-and-desist letter. A simple letter in your own name costs $0; an attorney-drafted letter on letterhead costs $300–800 and carries more weight.
5. **For marketplace listings (App Store, Steam, etc.):** file a takedown via the platform's IP-claim form. Most platforms have a streamlined process for trademark holders.
6. **For substantial commercial infringement:** consult an IP litigator. Statutory copyright damages range from $750 to $30,000 per work infringed (up to $150,000 if willful). Trademark infringement damages depend on the infringer's profits and your actual damages.

Do **not** publicly accuse anyone of infringement on social media or in writing without first consulting counsel — false claims can expose you to a defamation or tortious-interference counter-suit.

---

## When Bringing on a Collaborator

1. Sign `NDA_TEMPLATE.md` *before* sharing any file beyond `README.md`.
2. Decide what files the Permitted Purpose actually requires; share only those.
3. Add the executed NDA to `/IP/executed-NDAs/` named with the counterparty + date.
4. Add a row to a contributor ledger in `IP_INVENTORY.md` recording: who, role, date, scope.
5. If the collaborator will produce code that ends up in `index.html`, ensure the work-for-hire and assignment provisions in NDA Part B apply to their work product *before* they begin.

---

## When Forming or Updating Blank Canvas, Inc.

1. Confirm the Wyoming entity is in good standing (file the Wyoming annual report on time — due on the first day of the entity's anniversary month each year).
2. Once formed, execute the **founder IP assignment** instrument from Dalton Graham (individual) to Blank Canvas, Inc. (entity).
3. Record the assignment with the U.S. Copyright Office (see `COPYRIGHT_FILING_BRIEF.md` §6) and via TEAS for any registered trademarks.
4. Update copyright notices on all source files to reflect the entity as the rights holder if not already.
5. Update `IP_INVENTORY.md` §1 with the entity's registered address and EIN.

---

**End of checklist.**
