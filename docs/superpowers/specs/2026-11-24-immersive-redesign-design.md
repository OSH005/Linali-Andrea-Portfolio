# Phase 2 design: the immersive redesign

Date: 2026-11-24. Status: approved by the user through 18 rounds of browser mockups. This document turns those mockups into a buildable design.

**The reference mockup is part of this spec:** `docs/superpowers/specs/2026-11-24-immersive-redesign-mockup.html` (a copy of the final mockup, `v18.html`). It holds every approved layout, copy line and motion value as working code (four tabs: Home, Collections, Inside a collection, About; a screen-size switch for phone, tablet and laptop). Its images are served from `/files/` and are not in git; they are listed in section 9 with the recipes that made them. Where this document and the mockup disagree, this document wins; where this document is silent, copy the mockup.

---

## 1. Intent

The Phase 1 site shows everything but tells no story. Phase 2 makes it feel like landonorris.com does for Lando: you land, you meet **her**, and the site carries you through her work with motion that keeps you watching instead of scrolling past. The audience (brands hiring, private clients, press) mostly arrives on phones from social links, so the phone version must carry the same story, not a reduced one.

She speaks on the site in her own voice (first person). The site ends on one action: get in touch.

## 2. Goals, non-goals, anti-goals

**Goals**
- Home: an opening that introduces her (photo, name, role, her manifesto, her inspiration), then a continuous, scroll-driven journey through all four collections in the order **Mano Padana → Revive → Lunelle → Drift**, with Drift (the graduate collection) as the climax, then the contact card.
- `/collections`: an editorial index; `/collections/<slug>`: each collection explored in depth, with **the shoot and the portfolio as separate sections**, every shoot photo, and a page-by-page portfolio reader with zoom for small writing.
- `/about`: who she is, from her CV, in her voice; her inspiration; her skills.
- Premium, quiet typography; motion that feels authored, never like slide transitions.
- Fully responsive: phone, tablet portrait and landscape, laptop, desktop.

**Non-goals (this phase)**
- WebGL. The Phase 2 prompt allowed one lazy OGL layer; every approved moment is done with CSS, SVG and DOM transforms, so no OGL in Phase 2. (My call; revisit in Phase 3 if a moment needs it.)
- A CMS. Collections stay JSON + media build.
- Downloadable CV (her CV lists her referees' phone numbers and emails; see section 12).

**Anti-goals (would be a failure even if it works)**
- Big, in-your-face type on content pages. (The user rejected it three times.)
- Text that moves while you read it: no word-by-word fills or scroll-scrubbed text reveals on About or collection pages.
- Transitions that read as PowerPoint slides (plain crossfades or slide-ins).
- Blank, unfilled space on the phone under text.
- Cropping her photographs on desktop; AI upscaling; garment edits.
- The contact card or the header covering content the visitor is reading.

## 3. Constraints (carried from the project)

- Next.js 16 static export (`output: 'export'`), React 19, Tailwind v4, GSAP 3.15 (+ ScrollTrigger, SplitText), Lenis (to add). Read `site/node_modules/next/dist/docs/` before using an API.
- **Content visible without JavaScript and under reduced motion.** No element starts at `opacity: 0` in the HTML. Every moment below has a static fallback (section 10).
- **Teal `#008794` never on text under 24px.** Teal is for threads, stitches, rules and focus rings.
- **Never invent facts.** Everything on the site is from her CV, her portfolio text, her collection JSON, or approved copy in section 11.
- Never commit `media-src/` or EXIF. Derived images go through the media build.
- Test first; branch `phase-2-immersive`; merge only when the user says so.
- Vendored components stay verbatim (`circular-carousel`, `tumble-deck`, `glass-folder`); adapt through wrappers.
- Models' consent is confirmed (user, 2026-11-24, chat). Set each collection's `rights.models` to true with `confirmedBy: "user, 2026-11-24, chat"`. The Lunelle ultrasound image is treated as covered.
- Never publish her phone number, her email, or her referees' details. Contact goes through the form; LinkedIn is the one outside link.

## 4. Approaches considered

1. **GSAP ScrollTrigger timelines + Lenis smooth scroll (chosen).** Each page is a set of pinned scenes whose progress is scrubbed by scroll; Lenis gives the eased, weighted scroll the mockups emulate (lerp 0.1). Full control over clip-paths, masks and cross-scene transitions, works everywhere, and GSAP is already a dependency (the Tumble Deck uses it). Cost: JavaScript-driven, so every scene needs a no-JS/reduced-motion layout.
2. **Native CSS scroll-driven animations (`animation-timeline: scroll()/view()`).** Less JavaScript and runs off the main thread, but the approved moments need logic CSS can't express (sentence steps, window rect morphs between three states, the tear's jagged clip-path, Drift's horizontal strip with velocity skew), and support on the phones her audience uses is not universal. Rejected as the main engine; fine for small, self-contained effects (e.g. a reveal in a static section).
3. **A canvas/WebGL scene for the whole home page.** Most "cinematic", but heavy for mid-range Android, inaccessible text, and a big build. Rejected.

The Phase 2 prompt and PLAN.md already named approach 1; the mockups were built to emulate it.

## 5. Global design

### 5.1 Type (replaces DESIGN.md "Typography")

| Role | Font | Size at 1440 wide | Phone |
|---|---|---|---|
| Hero name (home only) | Gloock | 9.2vw (≈132px) | 58px → `clamp(58px,12vw,100px)` |
| Page / hero titles on content pages | Gloock | 3.6vw (≈52px) | `clamp(34px,8.4vw,56px)` |
| Section headings | Gloock | 1.9vw (≈27px) | `clamp(24px,5.4vw,34px)` |
| Home chapter titles | Gloock | 5.2vw | `clamp(38px,7.6vw,60px)` |
| Collection names in the `/collections` list | Gloock | 3.2vw (≈46px) | 22px compact → 28px open |
| Lead paragraph | Hanken Grotesk | `clamp(17px,1.35vw,20px)`, lh 1.6 | `clamp(17px,2.8vw,21px)` |
| Body | Hanken Grotesk 400/500 | `clamp(15px,1.15vw,17px)`, lh 1.75, max 58ch | `clamp(15px,2.4vw,18px)` |
| Labels | DM Mono 500 | 12px, uppercase, +0.14em | 11px |
| Drift narrative + look descriptions | Special Elite | `clamp(17px,1.75vw,27px)` | `clamp(18px,2.9vw,23px)` |
| Sinhala (මනෝ පාදන) | Noto Serif Sinhala | 0.36em of its title | same |

All from Google Fonts, self-hosted through `next/font/google`. Gloock has no italic: no italic display type anywhere. Labels may now sit above headings and carry numbers (01, 02): the approved design uses both, so DESIGN.md's "no eyebrow labels / no section numbers" rule is withdrawn.

### 5.2 Colour
Unchanged tokens (cream `#F2E8DA`, brown `#3B2418`, muted `#5A4436`, paper `#FBF8F3`, teal `#008794`, night `#21150F`, blush `#E8C4C0`). Added: `--mat #E6DBC9` (cutting mat), `--tape #F2E2B8` (tape measure). Mano Padana's scene grounds follow her colour board: charcoal `rgb(31 30 28)` → grey `rgb(94 89 83)` → cream → brown. Collections hover tints: Mano Padana `rgb(233 226 216)`, Revive `rgb(226 230 233)`, Lunelle `rgb(241 225 220)`, Drift `rgb(223 233 235)`.

### 5.3 Header (one component on every page)
Monogram · chapter roll · Collections · About · Contact · Motion on/off (phone: monogram · chapter roll · Menu).
- **Home landing:** bare, left-aligned with the hero text. As you scroll past the landing (between scroll units 600 and 1000 of the home timeline, i.e. the first ~0.45 viewport of the window opening) it glides to the centre and **forms a paper pill that sews itself on**: a teal running stitch 4px inside the edge draws in stitch by stitch (≈120 stitches). Monogram shrinks 44 → 30px (phone 36 → 26px).
- **Other pages:** centred pill from the start; the stitch sews in over the first second.
- **Fabric edge:** the pill's long edges ripple very slightly: amplitude `0.35px + min(3.6px, |scrollVelocity| / 450)`; at rest it barely breathes. Once sewn, the stitches drift along with scroll.
- **Chapter roll:** a DM Mono label naming where you are ("01 Mano Padana" … "— Get in touch"), rolling vertically when it changes; its width animates to the current label.
- **Headroom:** past the landing it slides up out of view while you scroll down (velocity > 140 px/s) and returns as soon as you scroll up (< −50 px/s) or reach the top of the page. Never hides on the landing or within half a screen of the top.
- **Day/night:** over dark scenes (Mano Padana's charcoal steps, Lunelle, the foam, the contact card, a collection's hero photo on desktop, the photo viewer) the pill turns night `rgb(38 25 18 / .86)` with cream ink, a cream monogram (`mono-cream.png`) and blush stitches.
- Links: magnetic pull ≤ 6px toward the cursor (desktop, fine pointers only); hover/current link gets a teal running-stitch underline.
- **Phone menu** (not mocked; my call): "Menu" opens a paper sheet that slides down from the pill and fills the screen: Collections, About, Contact in Gloock at section-heading size, the Motion on/off switch, LinkedIn, and Close (Esc / back closes it, through `useDialog`). Links close the sheet and navigate.
- Motion on/off: honours `prefers-reduced-motion` by default, stored in `localStorage`, and pauses every autoplaying thing (ring, moodboard frames, rolling films, home autoplay). It is the WCAG 2.2.2 pause control.

### 5.4 Smooth scroll and motion system
- Lenis: lerp 0.1; on touch, `syncTouch` with `syncTouchLerp 0.075`. In Drift's strip, lerp 0.07 and wheel multiplier 0.65 (the story slows down there).
- **Pacing: keep the approved speed.** Home totals ~13,500 scroll units at a 900px-tall viewport (≈15 viewports); see the scene table in 6.1. The user rejected word-count-based pacing.
- Easing vocabulary from the mockup: `out3`, `out4`, `inOut` (cubic), `back` (c=1.4, for the Drift logo rise), damped spring `1 − e^(−5.5t)·cos(9t)` (polaroid drops, pattern pieces), expo-out (viewer open).
- Photos inside moving frames get inner parallax (≈±4%) and enter with an inner scale (1.08–1.25 → 1); frames use clip-path reveals, never plain fades.
- Text on photos: `text-shadow: 0 1px 2px rgb(0 0 0/.5), 0 4px 14px rgb(0 0 0/.45), 0 10px 40px rgb(0 0 0/.35)`.
- Drift strip velocity skew: max 0.6°.

### 5.5 Contact card (every page)
Brown card with 28px top radius: "**Let’s make something together.**" (replaces "…something slow." everywhere: site.json, PLAN.md, docs/prompts/phase-2-immersive.md, docs/review/landonorris-motion-study.md), Name / Email / Message, "Send message".
- **Home:** rises over the last scene (last 600 units).
- **All other pages:** it is the **next block in the flow**: its top follows the end of the content (`top = max(H − cardH, contentBottom − scrollY)`), so it can never cover the last section. (A timed overlay covered the skills on phones; this is the fix.)

### 5.6 Voice
All site copy is first person: "I’m a fashion designer…", "About me", "What I work with", "In my words", "My graduate collection", "My inspiration". Her collection texts are already first person and are used verbatim. Alt text stays descriptive and third person. No "draft" markers on the site.

### 5.7 Responsive rules
Checked sizes: phone 390×844 (and 320 wide must not scroll sideways), tablet 768×1024, tablet landscape 1024×768, laptop 16:10, desktop 16:9.
- **≥1024 wide:** desktop layouts. Positions that were tuned for 16:9 are expressed relative to height where shape matters: photo windows keep the photo's own ratio on any aspect (Mano Padana window width `86% · H/W · 0.667`; Lunelle main photo width `100% · H/W · 0.667`).
- **<1024:** the phone layouts, scaled: type uses `clamp(phone px, n·vw, max)`, geometry that was fixed for 844px (Drift strip height 57% of the screen, Revive board 43%, Lunelle text under the photo at 64% + 20px) scales with the screen.
- **Tablets (600–1023):** where a phone layout would crop a portrait photo into a wide box, put the photo beside its text instead (the `/collections` open row). Pattern pieces and grids reflow to more columns.
- Phone landscape is not designed: show the phone layout (no desktop layout below 1024 wide). (My call.)

## 6. Home (`/`)

One pinned stage driven by one timeline. Scene lengths in scroll units (1 unit ≈ 1px of wheel at a 900px viewport):

| Scene | Units | What happens |
|---|---|---|
| op | 300 | Landing at rest. |
| manif | 500 | Her manifesto fills word by word over the first 350 units (the one place text fills; it is the home hero, approved). |
| open | 700 | The window opens behind her into Mano Padana. |
| mp | 4 × 345 | Mano Padana, four sentences. |
| tear | 420 | The page tears away into Revive. |
| rv | 3 × 340 | Revive, three sentences. |
| rise | 600 | The moon rises into Lunelle. |
| ln | 5 × 336 | Lunelle, five sentences. |
| foam | 420 | A wave of foam washes into Drift. |
| dIn | 480 | Drift's opening. |
| strip | 5400 | Drift's horizontal film strip. |
| foot | 600 | The contact card rises. |

Sentence steps: each step's sentence rises word by word (mask, 1.8% stagger) during the first 30% of its step and then holds; one sentence visible at a time; a counter `NN / NN`.

### 6.1 Opening: her
- Cream ground. Her **flush cut-out** (`herF`, no paper border) stands on the bottom edge with the hem below the screen (desktop: left 50%, height 106%, bottom −9%; phone: right −3%, height 60%, bottom −7%), soft brown drop shadow, rising 24px on load.
- Name "Linali Andrea" rises character by character on load (1.1s); label "Fashion designer · Sri Lanka"; her manifesto "I strongly believe that fashion is the best form of self expression." at 18% ink, filling to full ink word by word with scroll.
- **Moodboard columns** behind her (desktop right 55%; phone lower half): three columns of her inspiration photos (`inspE-1…7`, Drift moodboard) drifting endlessly up/down at different speeds.
- **The window:** a small print of her Mano Padana photo appears (rect A desktop `[66,40,·,30]`%), grows to centre (B) while she scales to 0.86 and fades, then slides right (C) as the ground floods from cream to her board's charcoal; hero text lifts and fades.

### 6.2 Mano Padana (SS25 · The Mind’s Steps)
Text column left (title + මනෝ පාදන, four sentences from her concept, counter); the print right shows her four walking photos, each revealed upward over the last (desktop: clip from bottom with inner scale 1.15 → 1; phone: photo slides up over the previous one, which shrinks to 0.9). Ground steps charcoal → grey → cream → brown; ink flips by luminance.

### 6.3 Tear → Revive (SS27 · Denim reconstruction)
The Mano Padana layer is clipped along a jagged paper edge that sweeps up the screen while the layer lifts (−8%) and rotates (−1.6°), with a blurred tear shadow; Revive scales 1.08 → 1 beneath. (Home uses Revive portfolio page 30 as the torn board and page 34 as the pile; Mano Padana's window shows its shoot photos 1–4; Lunelle's photo pairs per step are shoot 1+2, 9+8, 4+3, 5+7, 10+6.) Revive: logo, label, three sentences; **her torn board is stitched shut**: two halves (jagged split) drift together while teal cross-stitches appear along the seam. A second board peeks out from under it like a pile on her table. Phone: the board is 43% of the screen tall and pans horizontally; the pile sits under it.

### 6.4 Moonrise → Lunelle (AW26 · Maternity)
Revive darkens to night and recedes (scale 0.9); a moon (circular clip carrying her first Lunelle photo, with a blush ring) rises from below and grows to fill the photo frame. Lunelle: night ground, a large disc whose lit part waxes with progress, five sentences. Each step opens a new photo through a circle (inner scale 1.25 → 1) plus a second photo rising beside it. Phone: main photo top 64%, text under it, and a **lunar contact sheet** at the bottom: each step's photo seen through its moon phase, the current one lit and lifted.

### 6.5 Foam → Drift (SS27 · Graduate collection)
An ellipse of sea foam (`inspE-5`) washes up over the screen and away.
- **Drift opening:** the six-model photo full screen (desktop `d13`, phone `d17`); the **Drift script logo writes itself on** (a soft-edged mask sweeping left to right like a pen, 104°): desktop brown logo in the sky top-right with "Graduate collection" above it; phone cream logo over the dark rock with the label under it. The opening then shrinks into the first card of the strip.
- **The strip** (horizontal, driven by vertical scroll; skew ≤ 0.6°; cards scale 1.08 with inner parallax): lead photo → story panel (Drift logo as a brown silhouette + her first sentence in Special Elite) → photo → inspiration photo with sentence 2 overlaid → photo with sentence 3 overlaid → sentence 4 panel → for each look a panel (outline number, "Look 0n / 06", "Look 0n", description in Special Elite) + its two photos → three closing photos → end panel "Six looks, six models." + "Explore the collection →". A teal running stitch runs along the bottom, moving with the strip.
- **Look order (client):** 1 halter + indigo crochet (d07/d08) · 2 cobalt jacket (d03/d04) · 3 tunic + crochet-panel trousers (d11/d12) · 4 cream shirt (d01/d02) · 5 macramé dress (d06/d05) · 6 draped top + fringed bag (d09/d10). Descriptions in section 11.
- **Phone:** photos only in the strip (57% of the screen tall), captions underneath change with the card in focus, and a **six-look index** of thumbnails under the caption (current look lifted 6px with a teal stitch under its number; hidden while the logo caption shows).

## 7. Collections (`/collections`) and redirects

Rename `/work` → `/collections` everywhere (routes, links, tests, docs, the `add-collection` skill); `site/public/_redirects`: `/work/* /collections/:splat 301`.

### 7.1 Index
- Header: label "Collections · 04", heading "Four collections, in the order of my journey." (1.9vw).
- **Desktop list** on a 12-column grid, one row per collection in journey order: number (Gloock 1.2vw, muted) · name (3.2vw) with "SS25 · Mind · මනෝ පාදන" under it · her one line + what's inside ("6 photographs · 10 pages") · a round arrow button. Hairline rules between rows. All four rows fit the first screen at 16:9.
- **Hover:** other rows fade to 34% (no outlines); the row's name shifts 1vw; the arrow fills brown; a teal running stitch sews under the row; the page takes on the collection's tint; **a 17vw × 21vw photo frame follows the cursor** (to the right of it, lerp 0.12, tilting with speed ≤ 7°, skew ≤ 5°), cycling three of that collection's photos (clip wipe every 1.15s); moving between rows rolls the frame vertically to the next collection like film.
- **Click:** the frame opens to full screen and the collection page loads; implement with cross-document View Transitions (shared element: the frame image → the detail hero), 300–900ms.
- **Phone: focus rail.** Rows are compact (56×68 thumbnail, number · season · theme, name). As you scroll, the row in focus grows its thumbnail into the full photo (same element morphing, image cycling every 1.6s) with its line, count and "Open →"; the others fold back. Tablets: the open row puts the photo (46% wide, portrait) beside its text.
- **Seasons** (below the list): label "Seasons", heading "Three seasons, four collections."; a teal thread sews across the screen; at SS25, AW26, SS27 the year rises and that season's collections swing on the thread as polaroid tags (damped swing), Revive and Drift both at SS27. Then the contact card.

### 7.2 Collection detail (`/collections/<slug>`)
Same template for all; Revive has no shoot section.
1. **Hero:** her first photographs side by side at full height, uncropped (`LEAD` lists in the mockup), drifting slowly left; dark radial shade bottom-left; label "Collection 04 / 04 · SS27", title (3.6vw), her first sentence, and two buttons: **The shoot · 17** and **The portfolio · 8**. Phone: one photo (66% height) with the text block under it.
2. **In my words:** short and still. Label + "Drift · SS27" on the left, her concept as two short paragraphs (first one as a lead), and a two-column film of her photos rolling beside it (phone: two rows under the text). The text never moves.
3. **The shoot** (heading "17 photographs"; reuse and restyle Phase 1's `ShootGallery`, which already has ring, grid, pause and viewer): the **ring** (Circular Carousel, `cylinder` preset, autoplay drift, slow) with Pause and a Ring/Grid switch; drag to spin; the photo in front is described next to it ("03 / 17" + alt text). Ring rotation also follows scroll while the section is pinned (≈1.1 screens). **Grid:** CSS columns (3 desktop, 2 phone), photos uncropped, clip-reveal as they enter. **Viewer:** click a photo and it opens from where it sits (expo-out 0.6s) to fit the screen, uncropped, on a dark ground; arrows, keyboard, swipe, counter, caption, thumbnail strip (desktop); header hidden while open.
4. **The portfolio** (heading "8 spreads" / phone "8 spreads · 16 pages"): an inline **page reader** built on the Tumble Deck behaviour: pages stand in a stack (each behind at −3.2% and 0.965 scale), Next tips the front page forward until it lands flat (rotateX to −88° about its bottom edge, 0.75s), Previous reverses it. Desktop: round ← → buttons beside the page, the counter in the heading, a thumbnail rail under it. Phone/tablet portrait: **double spreads are split into single pages**, swipe to turn, controls row under the page.
   - **Zoom for small writing:** desktop hover shows a 220px **loupe at 3×** following the cursor; click (phone: tap) opens full-screen zoom at 2.5× on the point clicked, pan by moving the mouse (phone: drag), scroll or +/− for 1–5×, ← → to turn pages, Esc/Close. Serve the 4800px files for zoom where they exist.
   - **Read the text:** a drawer with the page's text from `pageText`; the button is disabled on pages without text (today only Drift p04 has text).
5. **Next collection:** "Next collection" (after Drift: "Back to the start of the journey"), name (2.8vw) + photo, links on.
6. A floating **Shoot | Portfolio** switch at the bottom centre appears from the shoot section to the next-collection section and jumps between them (sliding brown indicator).
7. Contact card as the next block.

## 8. About (`/about`)

1. **Opening:** cream; her flush cut-out; three personal photos as taped polaroids (mirror, chair, beach) that **drop in with a damped spring** and float at different depths with the mouse (phone: drifting on their own); two small inspiration photos at the back (desktop only). Text: label "About", "Linali Andrea" (3.6vw), "Fashion designer · Panadura, Sri Lanka", her sentence in quotes, "Get in touch →". Scrolling lifts the layers away at their depth.
2. **About me:** label "About me"; one paragraph (section 11); three facts (Studying / Experience / Recognition) as a hairline list; "LinkedIn →". Under it, **"My inspiration"**: fixed frames (5 desktop, 2 phone) that each change photo in turn with a wipe from the bottom (period 3.2s, staggered 0.6s). No horizontally rolling strips here (they misbehaved on phones).
3. **Skills: pattern pieces on her cutting mat.** Label "Skills", heading "What I work with", hint "Laid out like pattern pieces on my cutting mat." A cutting mat (cm grid, ruler along the top) holds four paper pattern pieces in a responsive grid (`repeat(auto-fill, minmax(210px,1fr))`: 4 across wide, 2 mid, 1 phone), each tilted (−2.2°, 1.6°, −1.2°, 2°) and offset (0, 22, 8, 30px) as if laid by hand:
   - 01 **Craft** on a bodice front, "Cut 1 on fold" (fold line): Dumbara weaving · Crochet & macramé · Hand embroidery · Denim reconstruction
   - 02 **Design** on a skirt panel, "Cut 2": Fashion design · Draping · Garment construction · Sustainable design
   - 03 **Tools** on a sleeve, "Cut 2 · mirror": Adobe Photoshop · Adobe Illustrator · Technical drawing · Fashion illustration
   - 04 **People** on a patch pocket, "Cut 1 · fold at top" (fold line): Leadership · Team building · Public speaking · Time management
   Each piece: number + grain-line arrow, name, four skills one per line, **all centred on the piece's own visual centre line** (bodice content box insets 6% / 26%; others symmetric), cut marking. Pieces drop onto the mat in turn (spring, 0.16s stagger) when the mat comes into view, then a dashed teal seam allowance sews in inside each edge; a piece lifts 6px and straightens on hover. Text is fitted: it starts under the name and steps down from 15px (never below 12px) until it clears the cut marking. A tape measure lies in the corner: "16 skills".
4. Contact card as the next block.

## 9. Content and media changes

**`site/content/site.json`** (first person, from her CV):
- role: "Fashion designer" (never "Junior fashion designer"); location "Panadura, Sri Lanka".
- bio (replaces the third-person draft; `draft` flag removed, the user approved it): see section 11.
- facts: the three in section 11; links: LinkedIn `linkedin.com/in/linali-andrea-831216363`.
- skills: the four groups in section 8.
- contact.closing: "Let’s make something together."
- tagline becomes "Fashion designer · Sri Lanka".

**Collections JSON:** `order` becomes journey order (mano-padana 1, revive 2, lunelle 3, drift 4); add `line` (section 11), `theme`, and `lead` (the detail hero photos: desktop list and one phone photo; mockup `LEAD` / `LEADP`: Mano Padana shoot 1–4 / 1; Revive page 30 / page 34; Lunelle shoot 1, 2, 9, 4 / 1; Drift shoot 13, 14, 7, 3 / 17); rights as in section 3; Drift gains `looks` (order, two shoot ids, description).

**Media build** (`site/scripts/media`, sharp; strips metadata):
- **Enhancement for all shoot photos, portraits and inspiration photos** (gentle, no garment changes, no upscaling): `.rotate().resize({fit:'inside', kernel:'lanczos3'}).linear(1.05,-5).modulate({brightness:1.02, saturation:1.05}).sharpen({sigma:0.6, m1:0.5, m2:1.2})`.
- **New personal assets:** `her-flush` (re-cut from `media-src/personal/originals/20261120_115442.jpg` with `@imgly/background-removal-node` via `tools/media/cutout.mjs`, alpha hardened, largest blob kept, trimmed, stray strap left of the hem removed, no sticker border; then `linear(1.03,-3)`, `modulate(1.02, 1.04)`, `sharpen(0.7)`); `face` (square crop of `chair-graded.jpg` centred at 0.58, 0.44, side 0.36 of width, for future use).
- **Inspiration** (`media-src/Inspiration`): 7 photos, in filename order, as `inspiration/1…7` at 640/1280.
- **Brand:** `mono-cream.png` (monogram alpha filled `#F2E8DA`); Drift logo in brown (silhouette, alpha from darkness, filled `#3B2418`, trimmed) and cream (`#F7F0E6`).
- Pages: keep 640/1280/2400 and the 4800 files for zoom.

**Docs:** DESIGN.md (type section 5.1, colours 5.2, header 5.3, components, withdraw the eyebrow/number rule, footer copy, add pattern-piece and reader components), PRODUCT.md (CV now on hand; facts allowed from it; routes `/collections`), PLAN.md and START-HERE.md (Phase 2 as built), `add-collection` skill (routes), the closing line in the four docs listed in 5.5.

## 10. Accessibility, reduced motion, no JavaScript

- **No JS:** every page renders as ordinary stacked sections with all text and images in the HTML: home's scenes become sections in order (opening, each collection's text + photos, Drift's looks as a list, contact form); the ring is the grid; the reader is a list of page images; the moodboard shows its first images; pattern pieces show laid flat.
- **Reduced motion / Motion off:** same stacked layout as no-JS but with JS features that don't move (viewer, zoom, reader buttons, Read the text); no Lenis, no pinning, no autoplay; fades and colour changes allowed.
- Keyboard: every control reachable; visible teal focus rings; Esc closes viewer/zoom/drawer; arrows navigate viewer and reader; dialogs through `useDialog`.
- Contrast: label/body ink on every ground ≥ 4.5:1 (the loader already checks collection ink); text on photos uses the shadow in 5.4 and is checked on the actual photos.
- Alt text for every photo from the collection JSON; decorative layers (moodboard columns, film rolls, tape, mat) are `aria-hidden`.
- Touch targets ≥ 44px; nothing scrolls sideways at 320px.

## 11. Approved copy

- Home opening: "Linali Andrea" · "Fashion designer · Sri Lanka" · "I strongly believe that fashion is the best form of self expression."
- Collection sentences on home: her concept text verbatim (Mano Padana 4, Revive 3, Lunelle 5, Drift 4 sentences, as in the mockup `MP`, `RV`, `LN`, `SP`).
- Drift captions: "Drift · SS27", "My graduate collection", "Six looks, six models.", "Explore the collection →".
- Look descriptions: 1 "White cropped halter top with a cobalt tie, and indigo crochet." · 2 "Cobalt wrap jacket with brown suede fringe and an openwork crochet back, over a short white skirt." · 3 "Pale blue sleeveless tunic with a cobalt scarf, and white flared trousers with blue crochet panels." · 4 "Oversized cream shirt with tie sleeves, over an indigo crochet skirt and crochet leg warmers." · 5 "Pale blue macramé dress with long fringe." · 6 "Sheer white draped top over a cobalt midi skirt, with a cream fringed macramé bag."
- Collection lines: Mano Padana "A mental healing journey through cultural aspects." · Revive "Discarded denim jeans have more life left in them." · Lunelle "A tribute to all the unstoppable mothers." · Drift "A calming breath taken to escape the fast paced world." Themes: Mind, Renewal, Body, Nature.
- About me: "I’m a fashion designer from Panadura, Sri Lanka, studying Fashion and Textile Design with Northumbria University. I work by hand, in Dumbara weaving, crochet, macramé, embroidery and reconstructed denim, and I give every collection an emotional subject: healing, motherhood, slowing down, renewal."
- Facts: Studying — "BA (Hons) Fashion and Textile Design", "Northumbria University · 2024–2027"; Experience — "Design Intern, MAS India", "2025"; Recognition — "Represented Sri Lanka at four World Chess Championships", "2015–2021".
- Closing: "Let’s make something together."

## 12. Open items for the client (do not block the build)

- A version of her CV without referee contacts, if she wants a download link.
- Photographer credit; the Revive / E.L.V. Denim name permission (from Phase 1).
- Revive's Phase 1 "studio" moment (Glass Folders) is not in the approved collection page; it is dropped unless she asks for it back.
- Portrait session: the About opening uses her existing casual photos; new portraits would replace the polaroids and the face crop.

## 13. Verification

- Unit tests (vitest) for new data and pure logic: schema of the new site.json fields, journey order, looks, the `/collections` routes, the `_redirects` file, the reader's page split for spreads (ar > 2 → two pages), the fit loop, header state (dock, headroom, chapter), the contact card position formula.
- `npm run test:build`: every route (`/`, `/collections/`, each `/collections/<slug>/`, `/about/`), redirects file, every manifest image including new assets.
- Browser checks (Playwright or `scripts/build`): no element starts at `opacity: 0` in the HTML; content present with JS disabled; no horizontal scroll at 320px; contact card never overlaps the last section at 390×844.
- `impeccable shot` at 1440×900, 1024×768, 768×1024, 390×844, 320×640; `impeccable motion-capture` for each moment; score with PLAN.md 5b (average ≥ 8, nothing < 7).

## 14. Left to the builder

- Component boundaries and file layout (one `Scene` system for home vs. per-section components), how ScrollTrigger pins are structured, and how the home timeline maps to scroll length on very tall or very short screens (keep the approved feel: ~15 viewport heights at 900px).
- Whether the reader wraps the vendored Tumble Deck or reimplements its tip-forward turn in a wrapper (keep the vendored file verbatim either way).
- Image loading strategy (lazy below the fold, preload the next scene), within PLAN.md's budget.
- Exact SVG paths for pattern pieces, the tape and the tear edge (the mockup's paths are fine to reuse).
