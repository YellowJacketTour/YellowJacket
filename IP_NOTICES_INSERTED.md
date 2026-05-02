# Record of IP Notices Inserted into Source Files

**Date of original insertion:** 2026-05-02
**Date of mark-list expansion:** 2026-05-02 (same day, second pass)
**Author:** Dalton Graham
**Owning entity:** Blank Canvas, Inc. (Wyoming)

## Pass 2 — Mark list expanded

On the same day as original insertion, the notice blocks in all four primary files were updated to include the additional marks adopted into the inventory:

- **Yellow Jacket** (short form, distinct from Yellow Jacket Tour)
- **Sweet Stroke** (alt mark for the Honey-Stroke scoring law)
- **The eight-beat hand-flow lexicon**: Tea Box, Fairway, Drive, Hazard, Approach, Green, Putt, The Cup

The text below shows the **post-expansion** notice blocks. The original (pre-expansion) text is in the git history of `index.html` at commit `4da52e1`.

This document records the precise text of the copyright/trademark notice blocks that were inserted into the four primary source files on the date above. It exists so that, if a notice is ever stripped, modified, or challenged, the original inserted text and date are independently recorded here.

---

## File: `index.html`

**Inserted at:** the top of the file, immediately after `<!DOCTYPE html>` and before the existing build-status comments.

**Inserted text (post-expansion):**

```html
<!--
  Yellow Jacket Tour
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham
  "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke", "Sweet Stroke",
  "Bumblebee", and the Buzz mascot are trademarks of Blank Canvas, Inc.
  The eight-beat hand structure (Tea Box, Fairway, Lay-Up, Hazard, Approach,
  Green, Putt, The Cup) is a proprietary brand-term suite of Blank Canvas,
  Inc. The scoring law, agreed-total wagering primitive, honey-divisor
  normalization, and dual-variant (Yellow Jacket / Bumblebee) loss-rule
  system are proprietary to Blank Canvas, Inc.
-->
```

---

## File: `RULES.md`

**Inserted at:** the top of the file, immediately before the H1 title.

**Inserted text:**

```markdown
<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", and the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) are trademarks of
  Blank Canvas, Inc. The scoring law and rule set described
  herein are proprietary. Unauthorized reproduction prohibited.
-->
```

---

## File: `README.md`

**Inserted at:** the top of the file, immediately before the H1 title.

**Inserted text:**

```markdown
<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", and the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) are trademarks of
  Blank Canvas, Inc.
-->
```

---

## File: `MIXED_GAMES_DESIGN.md`

**Inserted at:** the top of the file, immediately before the H1 title.

**Inserted text:**

```markdown
<!--
  Copyright (c) 2026 Blank Canvas, Inc. All Rights Reserved.
  Author: Dalton Graham. "Yellow Jacket Tour", "Yellow Jacket", "Honey-Stroke",
  "Sweet Stroke", "Bumblebee", and the eight-beat hand-flow lexicon (Tea Box,
  Fairway, Lay-Up, Hazard, Approach, Green, Putt, The Cup) are trademarks of
  Blank Canvas, Inc. The variant designs, scoring schemas,
  and calibration methodologies described herein are proprietary. This
  document is a confidential internal specification; do not redistribute
  without an executed NDA.
-->
```

---

## Verification

Pre-insertion file SHA-256 hashes (from `IP_INVENTORY.md` §6, captured at 2026-05-02T22:20:33Z):

| File | Pre-insertion SHA-256 |
|------|------------------------|
| `index.html` | `bfb4c4799056c6b7d2dc93ffb6e53d62dac97b4dede436b89fa542a8d764734d` |
| `RULES.md` | `365907caec66efecfb81cb1dcfd1f344c14ecb1bef8def4f93c15f456aecd879` |
| `README.md` | `4eeb9dc66e98e09a05de4b1208da7b711a5682e4361908bfac195fe6f81df9c9` |
| `MIXED_GAMES_DESIGN.md` | `78b8c481759775a709448f7eba4007fba3efc46c12de2a033ae734895b90d090` |

Post-insertion hashes are recorded in the git history of this folder; run `git log --all --pretty=format:"%H %ci %s" -- index.html RULES.md README.md MIXED_GAMES_DESIGN.md` to retrieve.

---

## Future Updates

When a new version of any of the four files is shipped:

1. Update the year in the notice if a calendar year has rolled over.
2. Re-compute the file's SHA-256 and add to a new dated row in `IP_INVENTORY.md` §6.
3. Make a git commit specifically for the version bump and tag it with the version string (e.g., `git tag v69.26`).
4. If the entity name or attribution has changed (e.g., post-IP-assignment, the entity name is updated), reflect the change in all four notices in the same commit.

This file (`IP_NOTICES_INSERTED.md`) does not need to be updated for routine version bumps — it records the original insertion event. Add a new section here only if the *text* of the notice block changes substantively.
