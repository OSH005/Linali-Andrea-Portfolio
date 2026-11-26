---
name: add-collection
description: Add a new fashion collection to Linali Andrea's portfolio site (shoot photos, portfolio pages, story text) so it appears in the home journey, in the /collections index and at /collections/<slug>. Use when the user says "add a collection", "new collection", "upload the X shoot", or drops a new folder of collection images.
---

# Add a collection

A collection is **data, not code**. Adding one means: originals in one folder, one JSON file, one media build. No component is written per collection. If a step below seems to need new code, stop and say so; the system is missing a feature, and that is a separate task.

DESIGN.md and PRODUCT.md (project root) describe the design system and the routes; PLAN.md section 6 the storage layout; the Phase 2 spec (`docs/superpowers/specs/2026-11-24-immersive-redesign-design.md`, section 7) the collection page. Read PLAN.md section 6 before starting. Routes: `/collections` lists every collection (in `order`) and `/collections/<slug>/` is its page.

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
- A page image wider than 2.5:1 is a two-page spread. It stays **whole** (one deck card, ratio 2√2), because her layouts cross the gutter. Name it by its first page number.
- Single pages are landscape √2 (ratio 1.414). The media build pads anything off-ratio on paper colour `#FBF8F3`, never crops.
- A collection is **all spreads or all single pages**. The media build stops with "Mixed page ratios" otherwise; pad singles into spreads in the source files, or split the collection.
- Accepted source types: `.jpg`, `.jpeg`, `.png`, `.webp`. Convert HEIC/TIFF first (they are skipped).

## 3. Write the collection file

`site/content/collections/<slug>.json`:

```json
{
  "slug": "example",
  "title": "Example",
  "season": "SS28",
  "year": 2027,
  "order": 5,
  "featured": true,
  "concept": "…her words…",
  "line": "One sentence of hers, shown in the /collections list.",
  "theme": "Nature",
  "lead": { "from": "shoot", "desktop": [13, 14, 7, 3], "phone": 17 },
  "palette": { "ground": "#F2E8DA", "ink": "#3B2418", "accent": "#2B4C7E" },
  "moment": "ring",
  "carousel": { "preset": "cylinder", "autoplay": "drift", "speed": 8 },
  "credits": { "photographer": "…", "models": ["…"], "collaboration": null },
  "rights": { "models": true, "photographer": true, "sensitive": "none", "confirmedBy": "client, 2026-11-23" },
  "alt": { "01-MMS_8188": "Model in an oversized cream shirt over an indigo crochet skirt, on coastal rocks" },
  "pageText": { "01": "Text of portfolio page 1, for the Read the text panel" },
  "pageOrder": "provisional"
}
```

**Required by the loader (`parseCollection`, build fails without them):** `slug`, `title`, `season`, `concept`, `line`, `year`, `order`, `featured`, `theme`, `lead`, `palette` (three `#RRGGBB`, ink on ground ≥ 4.5:1), `moment`, `credits`, `rights`, `alt`, `pageText` (may be `{}`) and `pageOrder`. Optional: `looks`, `titleNative`, `carousel`, `studio`.
- `pageOrder`: `"confirmed"` when the page order is verified (printed page numbers or the client said so), `"provisional"` when it is a guess (flag it to her).

**Fields new in Phase 2:**
- `order`: position in her journey (mano-padana 1, revive 2, lunelle 3, drift 4); the index and the "Next collection" link follow it.
- `line`: her one line about the collection, in her words, for the index.
- `theme`: one of the loader's themes (Mind, Body, Nature, Renewal). It is shown beside the season.
- `lead`: the photos of the collection page hero. `from` is `shoot` or `pages` (use `pages` when there is no shoot, as Revive does); `desktop` is a list of media `order` numbers shown side by side; `phone` is the one photo. The loader refuses numbers that do not exist.
- `looks` (optional, Drift only today): `[{ "n": 1, "shots": [7, 8], "text": "…" }]`, the look panels in the home Drift strip. Descriptions must be hers or approved by her.

**Index frame photos and tint** live in code, keyed by slug: `site/src/components/collections/data.ts` has `PICKS` (three media `order` numbers per collection for the follow frame and the phone rail) and `TINTS` (the row hover tint). A new collection works without them: it falls back to its first three photos and a cream tint. To choose, add an entry to each map, e.g. `PICKS['<slug>'] = [2, 5, 9]` and `TINTS['<slug>'] = 'rgb(r g b)'` (a light, desaturated tint of the collection's photos).

**Home journey:** the home page is a hand-built story of the four collections in order (`site/src/components/home/`); a fifth collection appears in `/collections` and has its own page, but is not added to the home story. Adding it to the home is a design task, not data.

**`moment`:** the loader still requires it (plus `carousel` for `ring`/`orbit`, `studio` for `studio`), but no page reads these any more. Use `"moment": "ring"` with a `carousel` block as the safe default.

Every shoot photo needs an `alt` entry describing the garment, not just "model". The media build fails on a missing alt.

## 4. Build the media

```bash
cd site && npm run media -- <slug>
```

It reads `media-src/collections/<slug>`, then:
- strips all EXIF (GPS, camera, dates) and applies rotation,
- validates alt text and page ratios first, then replaces the old output (a failed build keeps the previous images),
- keeps spreads whole and adds a 4800 px zoom for them,
- writes AVIF + WebP at 640 / 1280 / 2400 px to `site/public/media/<slug>/` (or to R2 when `MEDIA_BASE_URL` is set, see PLAN.md section 6),
- writes width, height and a blur placeholder for every image into `site/src/generated/media-manifest.json`.

> If `site/scripts/media/build.mjs` does not exist yet, it is build step 1 in PLAN.md section 9. Write it to exactly the behaviour above, test it on one existing collection, then continue.

## 5. Check it, by looking

1. Run the site. Open `/collections` (the new row, hover and open) and `/collections/<slug>`.
2. Screenshot at 1440, 1024, 768, 390 and 320 wide, and look at every shot.
3. Check: the hero shows the `lead` photos; the shoot ring and grid show every photo; the page reader turns pages in order, zooms, and "Read the text" has the page text (it is disabled on pages without `pageText`); a collection without a shoot shows no shoot section and no Shoot/Portfolio switch (the page renders them only when there is at least one shoot photo); the palette passes contrast (≥ 4.5:1); reduced motion and Motion off still show everything. Run `npm test` and `npm run test:build` inside `site/`.
4. Score with the rubric in PLAN.md section 5b. Fix anything under 7 before calling it done.

## 6. Report

List what was added, the moment chosen and why, any page that was padded or flagged, and any credit or rights item still missing.
