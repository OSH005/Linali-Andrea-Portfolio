---
name: add-collection
description: Add a new fashion collection to Linali Andrea's portfolio site (shoot photos, portfolio pages, story text) so it appears as a chapter, in the /work index and at /work/<slug>. Use when the user says "add a collection", "new collection", "upload the X shoot", or drops a new folder of collection images.
---

# Add a collection

A collection is **data, not code**. Adding one means: originals in one folder, one JSON file, one media build. No component is written per collection. If a step below seems to need new code, stop and say so; the system is missing a feature, and that is a separate task.

PLAN.md (project root) is the source of truth for the design system, the storage layout (section 6) and the chapter moments (section 3). Read section 6 before starting.

## 1. Collect before touching files

Ask the user for anything missing. Never invent it.

- **slug** (lowercase, short: `drift`), **title**, **season** (`SS27`), **year**
- **concept**: 2–4 sentences in the designer's own words (take them from her portfolio pages when possible, and quote, don't rewrite)
- **page order** for the portfolio pages
- **credits**: photographer, models, stylist, any brand collaboration
- **rights**: written OK from every model, the photographer, and any collaborating brand. Sensitive images (medical, children, pregnancy) need explicit confirmation. **No confirmation means the images are not published.** Record it in `rights` in the JSON.

## 2. Put the originals in place

```
media-src/collections/<slug>/
  shoot/    01-<anything>.jpg, 02-….jpg      ← the number prefix is the display order
  pages/    01.png, 02.png, …                ← portfolio pages, in reading order
  cover.jpg (optional)  logo.svg (optional)
```

- `media-src/` is **git-ignored**. The client's Drive holds the master copy.
- A page image wider than 2.5:1 is a two-page spread. The media build splits it down the middle automatically. Name it by its first page number.
- Portfolio pages must be landscape √2 (ratio 1.414) to fit the Tumble Deck without cropping. The media build flags any page that isn't. Fix those by padding to 1.414 on paper colour `#FBF8F3`, never by cropping.

## 3. Write the collection file

`site/content/collections/<slug>.json`:

```json
{
  "slug": "drift",
  "title": "Drift",
  "season": "SS27",
  "year": 2026,
  "order": 3,
  "featured": true,
  "concept": "…her words…",
  "palette": { "ground": "#F2E8DA", "ink": "#3B2418", "accent": "#2B4C7E" },
  "moment": "ring",
  "carousel": { "preset": "cylinder", "autoplay": "drift", "speed": 8 },
  "credits": { "photographer": "…", "models": ["…"], "collaboration": null },
  "rights": { "models": true, "photographer": true, "sensitive": "none", "confirmedBy": "client, 2026-11-23" },
  "alt": { "01-MMS_8188.jpg": "Model in an oversized cream shirt over an indigo crochet skirt, on coastal rocks" },
  "pageText": { "01": "Text of portfolio page 1, for the Read the text panel" }
}
```

**Choose `moment` by what the collection has:**

| Material | moment | Notes |
|---|---|---|
| 10+ strong shoot photos | `ring` (cylinder) or `orbit` | Use `orbit` when the concept has a centre (the moon in Lunelle) |
| 4–9 shoot photos | `walk` | Pinned horizontal sequence |
| Only sketches and pages, no shoot | `studio` | Glass Folders on the studio table, marked "In progress" |
| Anything else | `gallery` | Plain grid + viewer, always safe |

Never give two neighbouring featured chapters the same moment. Keep at most **4 `featured` collections** on the home story; the rest live in `/work`. Mark the oldest featured one `false` when adding a fifth.

Every shoot photo needs an `alt` entry describing the garment, not just "model". The media build fails on a missing alt.

## 4. Build the media

```bash
npm run media -- <slug>
```

It reads `media-src/collections/<slug>`, then:
- strips all EXIF (GPS, camera, dates) and applies rotation,
- splits spreads, checks page ratios,
- writes AVIF + WebP at 640 / 1280 / 2400 px to `site/public/media/<slug>/` (or to R2 when `MEDIA_BASE_URL` is set, see PLAN.md section 6),
- writes width, height and a blur placeholder for every image into `site/src/generated/media-manifest.json`.

> If `tools/media/build.mjs` does not exist yet, it is build step 1 in PLAN.md section 9. Write it to exactly the behaviour above, test it on one existing collection, then continue.

## 5. Check it, by looking

1. Run the site. Open the chapter on the home page and `/work/<slug>`.
2. Screenshot at 1440, 1024, 768, 390 and 320 wide, and look at every shot.
3. Check: the carousel or walk shows every photo; the deck opens, counts pages in order, and zooms; "Read the text" has the page text; the chapter's palette passes contrast (body text ≥ 4.5:1); reduced motion still shows everything.
4. Score with the rubric in PLAN.md section 5b. Fix anything under 7 before calling it done.

## 6. Report

List what was added, the moment chosen and why, any page that was padded or flagged, and any credit or rights item still missing.
