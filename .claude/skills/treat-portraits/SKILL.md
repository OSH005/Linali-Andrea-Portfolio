---
name: treat-portraits
description: Turn casual phone portraits of the designer into on-brand images for her portfolio site (background-removed paper cutouts, palette colour grade, two-tone), entirely on this machine. Use when the user adds or replaces personal photos, asks to "fix", "edit", "enhance" or "cut out" a portrait, or needs images for the About section.
---

# Treat portraits

Phone snapshots sit badly next to editorial shoots. Don't try to make them look like a studio shoot: AI upscaling or retouching invents detail and reads as fake. Instead, **change how they are presented**, using the collage language of her own portfolio boards (cut-out figures, taped photos, torn paper).

Everything runs locally. **Never upload her photos to an online editor or API.**

## Tools

`tools/media/` (Node 22+). First time: `cd tools/media && npm install`.
`package.json` pins one sharp version through `overrides`. Without that pin, the background-removal library loads a second, older sharp and both crash on Windows (`ERR_DLOPEN_FAILED`).

```bash
# 1. Remove backgrounds (local model, ~4–12 s per photo)
node cutout.mjs <source-folder> <work-folder> <file1> <file2> …

# 2. Build the treatments. Edit the `jobs` map at the bottom of treat.mjs first:
#    one short name per source file.
node treat.mjs <source-folder> <work-folder> <output-folder>
```

`treat.mjs` writes four files per photo, all with EXIF and GPS removed:

| File | What it is | Use it for |
|---|---|---|
| `<name>-cutout.png` | Clean figure, transparent background. Edges hardened, only the largest shape kept (drops leftover railings or wall bits). | Layering over type or colour |
| `<name>-sticker.png` | Cutout with a paper-white border and a warm brown shadow, like the figures on her boards | **The main treatment.** Collage moments, the About section |
| `<name>-graded.jpg` | Full photo with the palette grade: blacks lifted to brown `#3B2418`, highlights toward cream, 18% less saturation, fine grain | Taped polaroids, backgrounds |
| `<name>-duotone.jpg` | Brown → cream two-tone | Large, quiet background areas only. It looks muddy at small sizes. |

## Rules for choosing

- **Resolution sets the size.** Show a photo no larger than half its pixel width on screen (2× screens). A 720 px photo is a 360 px polaroid at most.
- **Cutouts need a clear figure.** Check the result on cream at full size: hair edges, hands, held objects (a phone in a mirror selfie is fine, as it's part of the pose). Reject a cutout with holes or a missing limb rather than patching it.
- **One cutout per screen.** Several cutouts together look like clip art; one figure plus taped photos looks like her boards.
- **Bystanders:** a cutout removes them. A graded full photo keeps them, so crop them out or use the cutout.
- Always look at the output: compose it on cream (`#F2E8DA`) and screenshot at 1440 and 390 wide before using it. `Personal/edited/preview.html` is a working example layout.

## Done means

Every treated image has been looked at on cream at full size, has alt text describing her and what she wears, and has no EXIF data (check `sharp(file).metadata().exif` is undefined).
