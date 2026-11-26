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
  mat: "#E6DBC9"
  tape: "#F2E2B8"
typography:
  hero:
    fontFamily: "Gloock, serif"
    fontSize: "9.2vw"
    lineHeight: 0.9
  title:
    fontFamily: "Gloock, serif"
    fontSize: "3.6vw"
    fontWeight: 400
  heading:
    fontFamily: "Gloock, serif"
    fontSize: "1.9vw"
    fontWeight: 400
  lead:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "clamp(17px, 1.35vw, 20px)"
    lineHeight: 1.6
  body:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "clamp(15px, 1.15vw, 17px)"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "DM Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.14em"
  narrative:
    fontFamily: "Special Elite, serif"
    fontSize: "clamp(17px, 1.75vw, 27px)"
  sinhala:
    fontFamily: "Noto Serif Sinhala, serif"
    fontSize: "0.36em"
    lineHeight: 1.2
rounded:
  none: "0px"
  card: "28px"
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

The work leads and the interface steps back (Impeccable's "Experience" mode). On the home page each collection has its own light (a charcoal-to-cream journey for Mano Padana, Lunelle's night, Drift's daylight) and one authored moment; the content pages (`/collections`, each collection, `/about`) share one calm cream template. Motion is deliberate and unhurried, and in Drift it slows down on purpose. A teal running stitch (the header pill, the seasons thread, the seam in Revive, the strip in Drift) is the recurring thread.

**Key characteristics:**
- Cream ground, brown ink, teal used like a single coloured thread
- Gloock display (a high-contrast Didone, like her LA monogram), Hanken Grotesk body, DM Mono labels, Special Elite for Drift's narrative
- Real photographs and her real boards; collage over cards
- One authored moment per scene; everything readable with no motion and no JavaScript

## Colors

A warm, quiet palette taken from her work: the brown is in all four collections.

### Primary
- **Tropical Teal** (#008794): the "coloured thread". Focus rings, links, stitches (header pill, seams, seasons thread), rules. **Never for text under 24px** (3.5:1 on cream). In Drift, check it beside the cobalt photography; a deep indigo from Drift is the agreed fallback if the client prefers it.

### Neutral
- **Cream** (#F2E8DA): the page. Every page and scene except Lunelle's night and Mano Padana's early steps sits on it.
- **Brown** (#3B2418): ink, and the footer card. 11.9:1 on cream.
- **Muted Brown** (#5A4436): labels, secondary text, the skills list. 7.5:1 on cream.
- **Paper** (#FBF8F3): polaroid frames, deck backgrounds behind pages, padding for off-ratio pages. It lets her white boards sit like real paper.

### Added in Phase 2
- **Night** (#21150F) and **Blush** (#E8C4C0): Lunelle's home scene, the header pill's night state (`rgb(38 25 18 / .86)`, cream ink, cream monogram, blush stitches) and the contact card over dark scenes.
- **Mat** (#E6DBC9): the cutting mat on `/about`. **Tape** (#F2E2B8): the tape measure and taped polaroids.
- **Mano Padana's home grounds** follow her colour board: charcoal `rgb(31 30 28)` → grey `rgb(94 89 83)` → cream → brown; ink flips by luminance.
- **Collections hover tints** (data in `components/collections/data.ts`): Mano Padana `rgb(233 226 216)`, Revive `rgb(226 230 233)`, Lunelle `rgb(241 225 220)`, Drift `rgb(223 233 235)`.
- **There are no per-collection page palettes.** Every content page uses the same cream template. `palette` stays in each collection JSON and its ink/ground contrast (≥ 4.5:1) is still checked by the loader.

## Typography

Five families, all self-hosted through `next/font/google` (variables in `app/layout.tsx`): **Gloock** (display; echoes the Didone "LA" monogram; it has no italic, so there is no italic display type anywhere), **Hanken Grotesk** (body), **DM Mono** (labels), **Special Elite** (the typewriter voice of Drift's narrative and look descriptions) and **Noto Serif Sinhala** (මනෝ පාදන).

| Role | Font | At 1440 wide | Phone |
|---|---|---|---|
| Hero name (home only) | Gloock | 9.2vw | `clamp(58px, 12vw, 100px)` |
| Page / hero titles on content pages | Gloock | 3.6vw | `clamp(34px, 8.4vw, 56px)` |
| Section headings | Gloock | 1.9vw | `clamp(24px, 5.4vw, 34px)` |
| Home scene titles | Gloock | 5.2vw | `clamp(38px, 7.6vw, 60px)` |
| `/collections` names | Gloock | 3.2vw | 22px compact, 28px open |
| Lead paragraph | Hanken Grotesk | `clamp(17px, 1.35vw, 20px)` / 1.6 | `clamp(17px, 2.8vw, 21px)` |
| Body | Hanken Grotesk 400/500 | `clamp(15px, 1.15vw, 17px)` / 1.75, max 58ch | `clamp(15px, 2.4vw, 18px)` |
| Labels | DM Mono 500 | 12px, uppercase, +0.14em | 11px |
| Drift narrative | Special Elite | `clamp(17px, 1.75vw, 27px)` | `clamp(18px, 2.9vw, 23px)` |
| Sinhala | Noto Serif Sinhala | 0.36em of its title | same |

- Big type is for the home page only. Content pages stay at the sizes above; the client rejected oversized type on them three times.
- Labels may sit above headings and carry numbers (`01`, `Collection 04 / 04`). The old "no eyebrow labels, no section numbers" rule is withdrawn: the approved design uses both.
- Text on photographs uses `text-shadow: 0 1px 2px rgb(0 0 0/.5), 0 4px 14px rgb(0 0 0/.45), 0 10px 40px rgb(0 0 0/.35)`.

## Layout

- Content max-width 1440px. Gutters 20 / 32 / 64px (phone / tablet / desktop).
- **Desktop layouts at ≥ 1024px wide, phone layouts below** (`@media (min-width: 1024px)`; JS uses `matchMedia`). Tablets (`(min-width: 600px) and (min-height: 600px)`) put a portrait photo beside its text where the phone layout would crop it. Phone landscape is not designed: it shows the phone layout.
- Spacing scale on a 4px base (`--s-1` … `--s-11`). Tight inside a group, generous between. More space above a heading than below.
- Sections 128–176px vertical on desktop.
- Sideways scrollers bleed to the right edge so the next item peeks in.
- Equal left and right content edges. Nothing scrolls sideways at 320px. Touch targets ≥ 44px.

## Elevation & Depth

Depth comes from paper objects, not UI chrome. Soft, warm, offset shadows only: polaroids `0 10px 30px rgb(59 36 24 / .18)`, deck stacks `0 10px 30px rgb(59 36 24 / .16)`. The Tumble Deck's own page shade is brown, not black. The contact card is brown with a 28px rounded top. On the home page it rises after the last scene; on every other page it is the next block in the flow, so it never covers content.

## Shapes

- Photographs and pages: square corners (they are prints and paper).
- Pills (999px) for chips and the send button.
- One large radius: the contact card's 28px top corners. The header is a paper pill.
- The moon in Lunelle and the home foam are round or elliptical. Polaroids sit at small angles with a strip of tape; pattern pieces are tilted a degree or two.

## Components

All in `site/src/components/`. Content is in the server HTML; client classes add motion.

- **SiteHeader** (`header/`): one component on every page. Monogram (a CSS mask in the current ink, so day/night is free), chapter roll, Collections, About, Contact, Motion on/off. Bare on the home landing, then a paper pill with a teal running stitch that sews itself on; headroom hides it while scrolling down. Turns night over dark scenes. Phone: monogram, roll, Menu (a full-screen sheet through `useDialog`, with LinkedIn). State comes from `useHeader().set`, not props. **Motion on/off** (`localStorage['la-motion']`, honours `prefers-reduced-motion`) is the pause control: it kills Lenis, pins and autoplay and leaves the stacked layout readable.
- **HomeStory** (`home/`): one pinned stage and one timeline (`timeline.ts`); scenes live in `home/scenes/` (Opening, ManoPadana, Revive, Lunelle, Drift). Journey order Mano Padana, Revive, Lunelle, Drift. Plain stacked sections without JavaScript or with motion off.
- **Contact card** (`Footer.tsx`, `ContactForm`): variant `rise` on home, `flow` elsewhere. Underlined fields on brown, honeypot `_gotcha`, posts to `NEXT_PUBLIC_CONTACT_ENDPOINT`. Closing line: "Let’s make something together." (`site.json` → `contact.closing`).
- **CollectionIndex, FollowFrame, FocusRail, Seasons** (`collections/`): the `/collections` list with a cursor-following photo frame, the phone focus rail, and the seasons thread with swinging polaroid tags.
- **Collection page** (`collection/`): Hero, InMyWords, Shoot (wraps **ShootGallery**: Ring/Grid, Pause/Play, full-screen viewer; ring cards use the 640px files), **PageReader** (inline page-turn reader built on the Tumble Deck behaviour, with a 3x loupe, **ZoomView** and "Read the text"), SectionSwitch (floating Shoot | Portfolio), NextCollection. One cream template for every collection; Revive has no shoot section.
- **About** (`about/`): AboutOpening (flush cut-out, taped polaroids that drop with a spring), AboutMe, **InspirationFrames** ("My inspiration": fixed frames that each change photo in turn; no rolling strips), **PatternMat** (skills as pattern pieces on a cutting mat; text fitted by `fit.ts`, never below 12px).
- Motion tokens: `--ease-out cubic-bezier(.16,1,.3,1)`, `--ease-in-out cubic-bezier(.77,0,.175,1)`; press 140ms, state 200ms, open 450ms, close 300ms. Hovers only on `(hover: hover) and (pointer: fine)`. Photos in moving frames get inner parallax and clip-path reveals, never plain fades.
- Vendored and untouched: `circular-carousel`, `tumble-deck`, `glass-folder` (Glass Folder is no longer used on any page).

## Do's and Don'ts

**Do**
- Let her work and her words lead; quote her concepts verbatim.
- Use her own collage vocabulary: paper, tape, pegs, stitches, typewriter, handwriting.
- Give each home scene one authored moment and its own light.
- Keep every photo and page reachable with reduced motion and without JavaScript.
- Slow down where the story slows down (Drift).

**Don't**
- No glassmorphism; no gradients as decoration, glows, neon, or purple.
- No identical fade-in on every section, no parallax on text.
- **Text never moves while it is being read** on `/about` and `/collections*`: no word fills or scroll-scrubbed text reveals there. The home sentence steps and the manifesto fill are the approved exceptions.
- No plain crossfades or slide-ins that read as slides; no blank space under text on the phone; the contact card and the header never cover content.
- No teal small text. No Inter, Playfair, Cormorant or Instrument Serif.
- No AI upscaling or retouching of her photos; present them as collage instead.
- No invented credits, quotes, awards or clients.
