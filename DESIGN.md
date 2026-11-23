---
name: Linali Andrea
description: A womenswear designer's portfolio told as one slow, hand-made story
colors:
  cream: "#F2E8DA"
  brown: "#3B2418"
  tropical-teal: "#008794"
  paper: "#FBF8F3"
  brown-muted: "#5A4436"
  lunelle-night: "#21150F"
  lunelle-blush: "#E8C4C0"
typography:
  display:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "clamp(2.5rem, 7vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  hero:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "clamp(3rem, 11vw, 9.5rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Courier Prime, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.15em"
  sinhala:
    fontFamily: "Noto Serif Sinhala, serif"
    fontSize: "0.42em"
    lineHeight: 1.2
rounded:
  none: "0px"
  card: "40px"
  pill: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  s9: "96px"
  s10: "128px"
  s11: "176px"
  gutter-phone: "20px"
  gutter-tablet: "32px"
  gutter-desktop: "64px"
components:
  chip:
    textColor: "{colors.brown}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  button-send:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.brown}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 32px"
  polaroid:
    backgroundColor: "{colors.paper}"
    padding: "12px 12px 44px"
  footer-card:
    backgroundColor: "{colors.brown}"
    textColor: "{colors.cream}"
    rounded: "{rounded.card}"
---

# Design System: Linali Andrea

## Overview

**Creative North Star: "The Slow Hand"**

Everything on this site should feel made by hand and in no hurry. Her collections are built from Dumbara weaving, crochet, macramé, hand embroidery and reworked denim, and their subjects are healing, motherhood, slowing down and renewal. The interface borrows the language of her own portfolio boards: paper, pegs and tape, cut-out figures, stitched lines, typewriter labels. It never borrows the language of software: no glass panels, gradients, glows or neon.

The work leads and the interface steps back (Impeccable's "Experience" mode). Each chapter has its own light (cream day, Lunelle's night, a charcoal-to-cream journey for Mano Padana) and one authored moment. Motion is deliberate and unhurried, and in Drift it slows down on purpose. One continuous thread stitches the page from the first screen to the last.

**Key characteristics:**
- Cream ground, brown ink, teal used like a single coloured thread
- High-contrast Didone display (matches her LA monogram), typewriter labels, her handwriting as the accent
- Real photographs and her real boards; collage over cards
- One authored moment per chapter; everything readable with no motion and no JavaScript

## Colors

A warm, quiet palette taken from her work: the brown is in all four collections.

### Primary
- **Tropical Teal** (#008794): the "coloured thread". Focus rings, links, the stitched thread, 2–3 words in the manifesto, the draft marker. **Never for text under 24px** (3.5:1 on cream). In Drift, check it beside the cobalt photography; a deep indigo from Drift is the agreed fallback if the client prefers it.

### Neutral
- **Cream** (#F2E8DA): the page. Every chapter that isn't Lunelle sits on it.
- **Brown** (#3B2418): ink, and the footer card. 11.9:1 on cream.
- **Muted Brown** (#5A4436): labels, secondary text, the skills list. 7.5:1 on cream.
- **Paper** (#FBF8F3): polaroid frames, deck backgrounds behind pages, padding for off-ratio pages. It lets her white boards sit like real paper.

### Chapter palettes (per collection, from `content/collections/*.json`)
- **Lunelle Night** (#21150F) ground with cream ink and **Blush** (#E8C4C0) accent.
- Others use cream / brown / teal. A collection's ink on its ground must reach 4.5:1 (the content loader enforces it).

## Typography

Bodoni Moda (display and body) echoes the Didone "LA" monogram. Courier Prime is the typewriter from her boards ("CONCEPT", "COLOR BOARD"). Noto Serif Sinhala sets මනෝ පාදන. All three are self-hosted through `next/font`.

- **Hero name**: up to 9.5rem, line-height 0.88, tracking −0.04em. The one place type goes past 6rem.
- **Display** (chapter titles, manifesto, closing line): `clamp(2.5rem, 7vw, 6rem)`, line-height 0.95, tracking −0.03em, `text-wrap: balance`. One deliberate giant word per chapter is allowed in Phase 2.
- **Body**: 17px / 1.55, measure 34–65ch.
- **Label**: Courier Prime 12px uppercase, +0.15em, tabular numerals. Metadata only (season, counters, form labels). **Never a label above a heading.**
- Italic is for one accent word ("Behind the *work*") or the themes line, never a whole headline.

## Layout

- Content max-width 1440px. Gutters 20 / 32 / 64px (phone / tablet / desktop).
- Spacing scale on a 4px base (`--s-1` … `--s-11`). Tight inside a group, generous between. More space above a heading than below.
- Sections 128–176px vertical on desktop; chapters are 1–2 screens, pinned moments 3–4.
- Chapter head: title + season left, concept right (7fr / 5fr) on desktop, stacked on phones.
- Sideways scrollers bleed to the right edge so the next item peeks in.
- Equal left and right content edges. Nothing scrolls sideways at 320px. Touch targets ≥ 44px.

## Elevation & Depth

Depth comes from paper objects, not UI chrome. Soft, warm, offset shadows only: polaroids `0 10px 30px rgb(59 36 24 / .18)`, the hero lens `0 16px 40px rgb(59 36 24 / .22)`, deck stacks `0 10px 30px rgb(59 36 24 / .16)`. The Tumble Deck's own page shade is brown, not black. The footer is a brown card rising over the cream (`margin-top: −40px`, rounded top).

## Shapes

- Photographs and pages: square corners (they are prints and paper).
- Pills (999px) for chips and the send button.
- One large radius: the footer card's 40px top corners.
- The hero lens is a circle. Polaroids sit at small angles (−4°, 3°) with a strip of tape.

## Components

- **ShootGallery**: Ring (Circular Carousel) ↔ Grid toggle, Pause/Play, full-screen viewer (arrows, Esc, counter). Grid is the server-rendered default. Ring cards use the 640px files.
- **PortfolioReader**: a static three-sheet stack button ("Open the portfolio") opening the Tumble Deck full screen, with counter `NN / NN`, Zoom, and "Read the text" where text exists. Without JavaScript, a plain list of page links.
- **Chapter moments**: `ring`, `orbit`, `walk`, `studio` (Glass Folders, "In progress"), `gallery` (still grid).
- **Glass Folder**: only in the `studio` moment; tone light, marble art in the collection's palette, no add action.
- **Person collage**: one cut-out figure standing on the section's bottom edge, two taped polaroids.
- **Contact form**: underlined fields on brown, cream pill button, honeypot `_gotcha`, posts to the configured endpoint.
- Motion tokens: `--ease-out cubic-bezier(.16,1,.3,1)`, `--ease-in-out cubic-bezier(.77,0,.175,1)`; press 140ms, state 200ms, open 450ms, close 300ms. Hovers only on `(hover: hover) and (pointer: fine)`; press `scale(.97)`; photos zoom 1.03 inside their frame.

## Do's and Don'ts

**Do**
- Let her work and her words lead; quote her concepts verbatim.
- Use her own collage vocabulary: paper, tape, pegs, stitches, typewriter, handwriting.
- Give each chapter one authored moment and its own light.
- Keep every photo and page reachable with reduced motion and without JavaScript.
- Slow down where the story slows down (Drift).

**Don't**
- No glassmorphism outside the Revive studio folders; no gradients as decoration, glows, neon, or purple.
- No eyebrow labels above headings, no section numbers (01/02), no identical fade-in on every section, no parallax on text, no scroll-jacking.
- No teal small text. No Inter, Playfair, Cormorant or Instrument Serif.
- No AI upscaling or retouching of her photos; present them as collage instead.
- No invented credits, quotes, awards or clients.
