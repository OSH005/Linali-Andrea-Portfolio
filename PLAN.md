# Linali Andrea — Portfolio Website Plan

Status: **Phase 1 built** (static site, media pipeline, components; merged to `main`). Next: Phase 2, an **immersive redesign** (decided 2026-11-23 after reviewing Phase 1: home becomes a short motion-led highlight reel featuring 2–3 collections; new `/about`; `/work` becomes `/collections` with full detail pages). Prompt: `docs/prompts/phase-2-immersive.md`. See `docs/START-HERE.md`.

> **Decisions made while building Phase 1 that override this plan** (details in `CLAUDE.md`):
> - Spreads (Drift, Revive) are **not split**. Their text and images cross the gutter, so each spread is one deck card at ratio 2√2 (2.83). Single pages stay at √2 (1.41). A collection may not mix the two; the media build refuses.
> - The deck takes its aspect from the collection's pages; **no cover cards**. The counter `NN / NN` shows position.
> - Spreads get an extra **4800 px** zoom image; text at 2400 px is unreadable.
> - The shoot gallery renders the **grid first** (works without JavaScript) and switches to the ring after load unless reduced motion is on.
> - "Read the text" exists only where `pageText` is filled (Drift spread 04 for now). Ask the client for the source text of her pages.

---

## 1. What we have (audit of the folder)

### The designer's work: 4 collections, which together tell a story

| # | Collection | Season | Concept (from her own pages) | Shoot photos | Portfolio pages |
|---|---|---|---|---|---|
| I | **මනෝ පාදන / Mano Padana**, "The Mind's Steps" (folder `Heritage`) | SS25 | Mental healing through culture. Kandyan dance, hand-woven Dumbara textiles. Palette goes black → grey → cream → brown, standing for the move from depression to peace. | 6 (Colombo, pink colonnades, mostly walking shots) | 10 spreads + 1 portrait cover |
| II | **Lunelle** (folder `Maternity`) | AW26 | Maternity wear, function and empowerment. The moon's cycle as the cycle of motherhood. Henry Moore sculptures. | 11 (dark studio, moon backdrop, candle, ultrasound) + 1 lineup illustration | 20 pages + 1 "final garment" page |
| III | **Drift** | SS27 | Stepping away from "social acceleration". Slow handcraft: crochet, macramé, hand embroidery. Fabric moving in coastal wind. Muse: Dr Asha de Vos, a marine biologist. | 17 (Sri Lankan coast, rocks, indigo and white, very strong) | 8 images, each holding 2 pages (pages 04–19) |
| IV | **Revive** | SS27 | Reclaimed and reconstructed denim, a collaboration project (E.L.V. Denim brand research). | **None** | 4 images, each holding 2 pages (pages 30–37), plus a logo |

The story writes itself: **mind → body → nature → renewal.** It is also chronological (2025 → 2026), so it reads as a designer growing up.

### Brand assets
- `Linali Andrea logo.png`: high-contrast Didone "LA" monogram. Good, and it fixes the type direction.
- Collection logos: Drift (handwritten script, very nice), Revive (brush caps). The Lunelle "logo" is a moody photo, not a logo. Mano Padana has a Sinhala script title on its cover.
- All logos are PNG. **We need SVGs** to animate them (stroke-drawing). Ask the client for the source files, or we trace them.

### The components (`/Components`)

| Component | Source | Status | My take |
|---|---|---|---|
| Circular Carousel | React Bits (free), full JS + CSS source included | Ready to use | Strong. Its `autoplay="drift"` mode literally matches the Drift concept. Has `onItemClick`, keyboard support, `fadeColor`, 4 presets. |
| ~~Page Flip~~ → **Tumble Deck Showcase** | Pasted by you: self-contained TSX, needs only React + **GSAP**. No license. | **Replaces Page Flip** (decided). Ready, with the wrapper work in section 3. | Pages stand on edge in a stack. The front page tips forward and lands flat, and the next one is revealed. It reads like laying her boards down on a table one by one, which suits a designer's portfolio. |
| Stipple Type | **React Bits Pro (paid)** | **On hold** (decided: type is sorted out later). Config lost (`<StippleType />` only). | Good fit if it comes back. Dots read as stitches and embroidery. |
| Dither Cursor | **React Bits Pro (paid)** | **Dropped** (decided) | Dithering is a digital, retro-computer look. It argues against a handmade, slow-craft story. |
| Glass Folder | Self-contained TSX, React only | Ready to use | Glassmorphism is one of the most overused looks right now. Used once, for one clear job (the "studio archive"), it works. See section 4. |

### Image facts that shape the build
- **564 MB total.** Portfolio pages are 9922×3508 PNGs at 15–25 MB each. They cannot go on the web as they are.
- Drift and Revive images each hold **two pages** (e.g. "04 | 05"), designed across the gutter. They stay whole: one deck card per spread.
- Every page is a **landscape √2 sheet** (A3/A4 landscape, ratio 1.414). Single pages use `aspect` 1.414 and spreads 2.83, taken from the collection's pages. The one exception is the Mano Padana cover (portrait, 1905×2648). It stays out of the deck and is used as the chapter image instead.
- Pages have **white** backgrounds. On a cream site they will look like white paper, which is good if we treat them as real paper (shadow, book) and bad if we drop them in flat.
- The page files have random UUID names, so **page order is unknown** except for Drift and Revive, which are numbered. We need the order from the client.
- `drift collection/Portfolio pages/*.tiff` (77 MB) is probably a duplicate of one of the PNGs. Not checked.
- The pages are full of small text that cannot be read on a phone.
- **Privacy:** `Personal/20261120_115442.jpg` contains **GPS coordinates**, and it is stored sideways (EXIF rotation).

### Honest opinion on the content
- **Drift has the best photography by far.** Lunelle is good and moody. Mano Padana has 6 photos, too few for a carousel ring. Revive has no photos.
- **The `Personal` photos are casual phone snapshots** (one is 720×1280). **Decided: use them for now**, presented as collage rather than as editorial photos (section 3, item 7). Edited versions are in `Personal/edited/`, with a working layout in `Personal/edited/preview.html`. A proper portrait session later is still the best upgrade, and the layout takes new photos without changes.
- There is **no written copy**: no bio, education, CV, contact or socials. The concept text lives only inside page images.

---

## 2. Lessons from landonorris.com (what to take, what to leave)

I inspected it live. It was built by OFF+BRAND on **Webflow + Lenis (smooth scroll) + Rive (vector animation) + custom WebGL** (21 canvases on the home page). It took long enough to render that my browser's screenshot timed out once, so it is heavy.

| What they do | Why it works | Our version |
|---|---|---|
| Hero: his 3D head follows the cursor, and a circular mask reveals the helmet underneath | One subject, one gesture, instantly memorable | **Sketch → reality lens.** The hero shows her fashion illustration lineup. A soft circle under the cursor reveals the real photo of the same looks. "From sketch to garment" in one move. On mobile the lens drifts slowly by itself. |
| Manifesto text fills in, word by word, as you scroll, with key words in an accent colour | Makes you read | Her own statement (*"Fashion is the best form of self expression…"*) fills from faded to brown, with 2–3 key words in teal |
| A hand-drawn scribble animates over the big type | Human touch on a technical site | Her **handwriting and signature** drawn stroke by stroke (SVG). This is our strongest defence against an "AI-made" feel. |
| Faint topographic lines in the background | Texture without noise | **A single thread.** One stitched line (dashed running stitch, as on her Drift pages) runs down the whole page, sews each chapter to the next, and ends by signing her name in the footer. This is the story device that connects header to footer. |
| Photos scattered at different depths, parallax on scroll | Feels like a collage | Her pages are already collages: polaroids, torn paper, clothes pegs, swatches. Pin real shoot photos and swatches with pegs and tape, at different depths. |
| Footer rises as a rounded card with a huge closing line | A clear ending | A brown card rises over cream: *"Let's make something slow."*, contact details, and the thread finishes her signature. |
| Smooth scroll (Lenis) | Everything feels expensive | Same. Also **slow it down in the Drift chapter**, so the motion itself says "stop rushing". |

**What to leave:** the WebGL weight, the sports-brand loudness (neon, all-caps shouting) and the long preloader. Her audience (brands, recruiters, Instagram traffic in Sri Lanka) will often be on mid-range Android phones.

---

## 3. The story: section by section, header to footer

Each chapter has **its own lighting and its own signature moment**, so nothing repeats. Showing the same carousel 4 times would kill the wow by the third.

0. **Thread-in (≤1.5 s, first visit only).** A thread stitches the "LA" monogram, then pulls away and becomes the page's thread. Skippable. Skipped entirely with reduced motion.
1. **Prologue / Hero.** Her name set large (the type treatment is decided later; Stipple Type is on hold) with the sketch → reality lens behind it. One-line subtitle, e.g. *Womenswear designer · Sri Lanka · Slow craft*.
2. **Manifesto.** Scroll-filled statement. Under it, her four themes as one quiet line: *mind · body · nature · renewal*.
3. **Chapter I: Mano Padana (SS25), "The Mind's Steps".** The background moves **from charcoal to cream** as you scroll, using her own colour board (depression → peace). Signature moment: a **pinned horizontal walk**: her 6 walking photos as steps, with Dumbara pattern strips between them. Ends with the closed stack of her pages: *Open the portfolio* (the Tumble Deck).
4. **Chapter II: Lunelle (AW26).** Lights go down to night. A moon rises and its **phase advances with scroll**. Signature moment: the **Circular Carousel, `orbit` preset**, with the 11 shots orbiting the moon (`fadeColor` set to the night colour). Click a card → full-screen view. Then the page stack: *Open the portfolio*.
5. **Chapter III: Drift (SS27).** Back to daylight. Coastal light, scroll deliberately slower. Signature moment: the **Circular Carousel, `cylinder` preset, `autoplay="drift"`**, with 17 shots and a slow speed, plus a visible pause button (it moves for longer than 5 s, so WCAG requires one). Then the page stack.
6. **Chapter IV: Revive (SS27), "In progress".** No shoot, so be honest and make that the point: **the studio table.** **Glass Folders**, each a stage (Research, Fabric & detail, Line-up), with the real pages and swatches as the "files". Its deck opens from here.
7. **The person.** Who's behind the work, told the way she builds her own boards: **one cut-out figure of her** (the balcony photo, whose brown satin skirt is the site's brown) standing on the bottom edge of the section, between two **taped polaroids** (the beach at sunset, which echoes Drift's coast, and the mirror shot in denim, which echoes Revive). The thread passes behind her. Then a short bio, education, skills (pattern making, Dumbara weaving, crochet, draping…) and a CV download.
   - Motion: the polaroids settle into place once (rotate and drop, 600 ms) when the section enters. The figure stays still; the thread draws past her.
   - On phones: text first, then a 560 px collage stage below it.
   - Not used: the snow photo (720 px, too small, with litter and bystanders), the duotones (muddy at small sizes) and the egg-chair cutout (the white chair vanishes on cream). The egg-chair **graded** photo is a spare polaroid.
8. **Epilogue / Footer.** The rising brown card, contact, socials, and the thread signs her name.

### Required behaviour for the carousel (from your brief)
- **Ring view** (default) ↔ **Grid view** toggle on each carousel.
- Click a card or a grid tile → **full-screen viewer** (one image, swipe or arrow keys, caption, counter, Esc to close), with a shared-element transition from the card.
- Reduced motion or a slow device → starts in grid view.
- Shoot photos are mostly 2:3 portrait. Use `aspectRatio={2/3}`. The few landscape group shots get cropped in the ring, and the viewer and grid show them whole.

### The portfolio pages: Tumble Deck

**What it does well:** it's lightweight (CSS 3D plus GSAP's ticker, no WebGL), it reuses a small pool of elements however many pages there are, and its fall has a believable bounce. It already supports keyboard, drag, wheel, click and reduced motion. It also needs no license.

**Problems found in the source, and the fix for each:**

| Problem in the code | What would happen | Fix |
|---|---|---|
| It calls `preventDefault()` on every wheel event over the deck, and the deck **loops forever** | Placed inside the long story page, it traps the scroll: the visitor wheels and can never get past it. All three skills ban scroll-jacking. | **Never place it inline.** On the story page, each chapter shows a closed, static stack of pages with a button: *Open the portfolio*. That opens the deck **full screen** in an overlay (also at `/work/<collection>`). Lenis is paused while it's open (`lenis.stop()`), and there is a visible Close button plus Esc. |
| `touch-none` on the root | On a phone, a swipe over the deck can't scroll the page | Fine inside the full-screen overlay, where the deck should own the gestures |
| It's endless, so there's no start or end | The brief says "explore the pages **in order**". An endless loop hides where you are. | ~~Cover cards~~ (dropped: available covers crop badly). A **page counter** (`07 / 20`, tabular numerals). |
| No index callback. Clicking means "next". | No way to show a counter or zoom into the current page | **One small edit to the source:** an `onIndexChange(index)` prop, called from `paint()`. Then a **Zoom** button opens the current page in a pinch-zoom viewer (2400 px; 4800 px for spreads). |
| Card height is capped at 42% of the viewport (max 620 px) | At 1440×900 a page is about **535×378 px**, and on a 390 px phone about **296×209 px**. Her small page text can't be read. | Zoom (above) plus a **"Read the text"** panel with each page's text as real HTML (accessibility, SEO, phones) |
| `src` is swapped in from JavaScript, with no `srcset` and no preloading | Pages pop in blank, or look soft on retina screens | Pass the 1280 px WebP (crisp at 2× for 535 px). Preload the next 3 pages. |
| It uses `--color-background`, `--color-foreground` and `--color-primary`, plus Tailwind's `sr-only` and `touch-none` classes | Unstyled without those | Map them to our tokens in Tailwind v4's `@theme`: background is the chapter colour, foreground is brown, primary is teal (the focus ring). |
| The page shade is pure black (`#000`) | A cold grey cast on cream paper | Change the shade colour to brown `#3B2418`, so the shadow reads as warm |

**Settings (as built):** `aspect` = first page's width ÷ height, `depth={4}`, `scrollPerCard={240}` (default), `height="100svh"`, `background` set to each chapter's colour (cream, or night brown for Lunelle).

Each collection also gets its own URL (`/work/drift` etc.), which opens straight into its deck, so the client can share one portfolio directly on Instagram or LinkedIn.

---

## 4. Design direction

**Palette**

| Token | Value | Use |
|---|---|---|
| `--cream` | `#F2E8DA` | Main background |
| `--brown` | `#3B2418` | Text, footer card, Lunelle night (deepened) |
| `--teal` | `#008794` | Pop: links, focus rings, the thread, 2–3 manifesto words |
| `--paper` | `#FBF8F3` | Book pages and cards (so the white pages sit naturally) |
| `--charcoal` | from her Mano Padana board | Chapter I start only |

Honest notes on colour:
- Cream and brown are a perfect match: brown is in all four collections (Dumbara weave, Lunelle trousers, Drift fringe).
- **Teal is a risk next to Drift's photos**, which are cobalt and indigo, not teal. Two different blues side by side can look like a mistake. Keep teal tiny (thread, focus, links) or test a deep indigo taken from Drift. I recommend we mock both in the Drift section and decide by eye.
- **Teal on cream is 3.5:1 contrast.** That fails WCAG AA for body text. Use it only for large text (≥24px), lines and icons, never for small text.

**Type (matches her monogram and her pages)**
- Display: a high-contrast Didone, like her LA logo. *Bodoni Moda* (free) or a paid editorial Didone if the budget allows.
- Labels: a typewriter face. Her pages already use typewriter labels ("CONCEPT", "COLOR BOARD"). Use it for metadata only (season, page counter, credits), **never as a small label above a heading**. Impeccable bans that pattern outright.
- Accent: **her real handwriting**, scanned and traced to SVG. Nothing says "not AI" more clearly.
- Sinhala: Noto Serif Sinhala for මනෝ පාදන.
- Avoid: Inter, Playfair, Cormorant, Instrument Serif. They are the current "template" signals.

**Texture:** subtle paper grain, torn paper edges, pegs and tape, all taken from her own pages. No gradients, no neon, no glass anywhere except the Revive folders.

**Glass Folder:** use `tone="light"` with a custom `art` recipe in each collection's colours (the component supports custom colours), or her fabric photos as `image`. Remove the `+` add action (`action="none"`). It is a showcase, not a file manager.

---

## 5. Tech stack (recommended)

| Need | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), static export** | React is required by every component. Real HTML for SEO and fast first paint. |
| Styling | **Tailwind CSS v4** + CSS variables for tokens | The Tumble Deck already uses Tailwind classes and token names |
| Scroll storytelling | **GSAP + ScrollTrigger + SplitText** (all free now) | Pinning, scrubbing, the manifesto fill, chapter colour shifts. The Tumble Deck runs on GSAP's ticker too, so one animation library serves everything. |
| Smooth scroll | **Lenis** | Same feel as the reference |
| Line drawing | Plain SVG + GSAP (`stroke-dashoffset`) | No Rive needed. Fewer tools to learn and pay for. |
| Shared transitions | View Transitions API (fallback: simple fade) | Card → full-screen viewer, home → collection page |
| Content | One typed file `content/collections.ts` | Content rarely changes. **No CMS**: it adds cost and complexity for no gain here. Add one later if the client wants to self-edit. |
| Hosting | **Cloudflare Pages** (free, commercial use allowed, fast in South Asia) | Vercel's free tier forbids commercial use |
| Analytics | Cloudflare Web Analytics or Plausible | No cookies, so no cookie banner |

Skipped on purpose: WebGL/Three.js, a CMS, a dark-mode toggle (the chapters handle light and dark), a blog, the Dither Cursor, and Motion/Framer Motion (GSAP already covers it, and one library is enough).

---

## 5b. Spacing, type and motion system (from the skills)

I went through the four skills you named and kept the rules that apply to an immersive portfolio.

**Which skill applies where.** Impeccable calls this kind of site **"Experience" mode**: the visitor is inside the work, and the interface steps back. That is the frame for everything below.

**Honest note on taste-skill:** it is built for company and shop sites (figma.com is its quality bar). It bans carousels, captions and scroll-linked motion, and it wants one section per screen. Those rules fight your brief. Impeccable's rule is **"the brief wins"**, so the carousel stays. From taste-skill I kept only the universal rules (marked *taste* below).

### Spacing
| Rule | Value | Source |
|---|---|---|
| Spacing scale | 4 px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 176 | Impeccable |
| Side gutters | 20–24 px on phones · 32 px on tablets · 48–64 px on desktop | MotionSites |
| Content width | max 1440 px (80rem). Lede 440–540 px. Body text 65–75 characters per line. | MotionSites, Impeccable |
| Section padding | 128–176 px top and bottom on desktop, about half that on phones. **More space above a heading than below it.** | MotionSites, Impeccable |
| Rhythm | Tight inside a group, generous between groups. Never one spacing value everywhere. | Impeccable |
| Edges | Every block sits on the same left and right content edges. No sideways scroll at 320 px. | *taste* |
| Chapter length | Each chapter is 1–2 screens, except pinned moments (the walk, the moon), which may run 3–4 | *taste* |
| Touch targets | At least 44 px, with 8 px between targets | *taste* |

### Type
| Role | Size | Line height | Tracking |
|---|---|---|---|
| Display (her name, chapter titles) | `clamp(2.5rem, 7vw, 6rem)`. Max 6rem, except **one** deliberate giant word per chapter (e.g. "Drift"). | 0.95 | −0.02 to −0.04em (never tighter) |
| Body | 16–18 px | 1.5–1.6 | 0 |
| Labels (typewriter) | 11–13 px, uppercase | 1.2 | +0.15em |

At most two families plus the typewriter. Headings broken into lines by hand on desktop. Tabular numerals for counters.

### Motion
| Rule | Value | Source |
|---|---|---|
| One authored moment per chapter | Never the same fade-in on every section, no parallax on text, no scroll-jacking | All three |
| Easing | Entrances `cubic-bezier(0.16, 1, 0.3, 1)`. On-screen movement `cubic-bezier(0.77, 0, 0.175, 1)`. **Never ease-in.** Linear only for constant motion. | Emil, Impeccable |
| Durations | Press feedback 100–160 ms · hover and state 150–300 ms · overlays such as the deck opening 300–500 ms · focal entrances 500–800 ms · the hero sequence done by about 1.5 s | Emil, Impeccable, MotionSites |
| Exit faster than enter | e.g. the deck overlay opens in 450 ms and closes in 300 ms | Emil, Impeccable |
| Hover | Only on `(hover: hover) and (pointer: fine)`. Photos zoom 1.02–1.03 inside their frame. Buttons press to `scale(0.97)`. A hovered element never moves its neighbours. | Emil, *taste*, Impeccable |
| Smoothing | Cursor lens follows with lerp 0.1. Pinned stages use 0.14. | MotionSites |
| What to animate | `transform`, `opacity` and `clip-path` (for image reveals). Blur up to 20 px, only in small areas. | Emil |
| Safe default | Content is visible before any script runs. If JavaScript fails, nothing stays hidden. | Impeccable, MotionSites |
| Reduced motion | Keep fades and colour changes. Remove movement, Lenis and pinning. Carousel starts as a grid. The deck jumps whole pages (built in). | All |
| Loops | Anything moving for more than 5 s gets a pause button and stops when offscreen | *taste*, Impeccable |

### Browser surfaces (the cheap signal that a site was crafted)
Theme the text selection (teal at 30%), the caret, the scrollbar, the focus ring (teal, 2 px, offset 3 px) and the link underline offset. Impeccable calls this the detail models skip most often.

### How we check the work (a loop, not a single look)
1. Write the build spec at MotionSites precision: every element gets real values (sizes, colours, durations, easings), never "nice animation".
2. After each chapter, screenshot at **1440, 1024, 768, 390 and 320** and look at the screenshots.
3. Score with the MotionSites rubric (first glance, signature, type, composition, colour, media, motion, mobile, copy, polish). **The bar is an average of 8 or more, nothing under 7.** Fix the three weakest and shoot again, for up to 3 rounds.
4. Run Impeccable's `detect` on the changed files. For the focal moments (hero lens, moon, deck), use `motion-capture` normally and with reduced motion, and send both captures to its motion reviewer.

---

## 6. Images: where they live and how they are processed

**Design goal: more collections will come, so a new collection must be data, not code.** Adding one is three things: put the originals in a folder, write one JSON file, run one command. The project skill `.claude/skills/add-collection` walks through it.

### Folder layout
```
Linali Andrea Portfolio/
├─ media-src/                         ← ORIGINALS. Git-ignored. Master copy stays in the client's Drive.
│  ├─ collections/<slug>/
│  │   ├─ shoot/   01-….jpg 02-….jpg   ← number prefix = display order
│  │   ├─ pages/   01.png 02.png …     ← reading order; a spread (wider than 2.5:1) stays one card
│  │   └─ cover.jpg, logo.svg (optional)
│  └─ personal/
├─ site/                              ← the Next.js app
│  ├─ content/collections/<slug>.json ← the ONLY hand-written file per collection
│  ├─ public/media/<slug>/…           ← generated web images (committed)
│  └─ src/generated/media-manifest.json ← generated sizes, placeholders, URLs
└─ tools/media/                       ← image scripts (sharp; portrait tools already here)
```
The current client folders (`Heritage`, `Maternity`, `drift collection`, `Denim`) move into `media-src/collections/mano-padana`, `lunelle`, `drift` and `revive` in build step 1, renamed with order prefixes once the client confirms page order.

### One JSON file per collection
It holds the title, season, concept text (in her words), palette, credits, rights confirmation, alt text for every photo, the text of each portfolio page, and two layout choices: `moment` (which chapter layout to use) and `featured` (whether it appears on the home story). The full template is in the add-collection skill.

### Reusable chapter moments (how it scales and keeps the wow)
The site has a small library of chapter layouts. Each collection picks one in its JSON, plus its own palette:

| moment | For | Built from |
|---|---|---|
| `ring` | 10+ shoot photos | Circular Carousel, cylinder |
| `orbit` | 10+ photos and a concept with a centre | Circular Carousel, orbit |
| `walk` | 4–9 photos | Pinned horizontal sequence |
| `studio` | No shoot yet | Glass Folders |
| `gallery` | Anything | Grid + viewer |

Every moment ends in the same "Open the portfolio" stack and Tumble Deck. A collection that deserves something new gets a **new moment** added to the library once, and then every later collection can use it too.

**The home story features at most 4 collections** (`featured: true`, in `order`), so it never becomes a 15-chapter scroll. Every collection, featured or not, is listed at `/work` and has its own page at `/work/<slug>`.

### The media build (`npm run media -- <slug>`)
- strips all EXIF (GPS, camera, dates) and applies rotation,
- keeps spreads whole (2√2), pads any page off its ratio on paper colour (never crops), and refuses a mix of spreads and single pages,
- writes **AVIF + WebP** at 640 / 1280 / 2400 px. Portfolio pages use 1280 in the deck and 2400 in the zoom viewer,
- writes width, height and a blur placeholder for every image into the manifest,
- **fails if a photo has no alt text** in the JSON.

### Where the web images live, now and later
- **Now:** `site/public/media/`, committed and deployed with the site. Today's four collections come to about **40–80 MB** (down from 564 MB) and about 600 files (roughly 100 images × 6).
- **Later:** Cloudflare Pages allows 20,000 files per deploy and 25 MB per file. Each image makes 6 files, so the limit arrives at roughly 3,000 source images. Also, every collection makes the git repo heavier. **Switch** when the repo's media passes ~1 GB or ~15,000 files, whichever comes first: upload to **Cloudflare R2** (10 GB free, no download fees) behind `media.<domain>`.
- The switch is one setting: every image URL comes from the manifest, which prefixes `MEDIA_BASE_URL`. No component changes.

### Portrait edits (done)
`Personal/edited/` holds, per photo, a clean cutout, a paper-sticker cutout, a palette-graded version and a duotone, all made on this machine (no online service) with EXIF and GPS removed. The tools are in `tools/media/`, and the project skill `.claude/skills/treat-portraits` explains how to redo them when new photos arrive.

Loading rules: carousel cards load the 640 version. The deck holds only its small pool of pages and preloads the next 3. Everything below the fold is lazy-loaded.

---

## 7. Privacy, rights and security

**Rights and consent (most important, not technical):**
- **Written permission from every model**, especially the Lunelle model (pregnancy, and the **ultrasound scans are medical images**: confirm she is happy for them to be public).
- **Photographer credit and usage rights** for the shoots (the `MMS_` files come from a photographer's camera).
- The moodboard pages contain third-party photos (magazines, brands, real people such as the Drift muse). That is normal in a student portfolio, but a public site has more exposure. Mitigation: no high-resolution downloads, only web-size images; credit where possible; and the client approves the page selection.
- Revive is a "collaboration" built on E.L.V. Denim brand research: confirm she may publish it under that name.

**Personal data:**
- Strip EXIF from every image (one personal photo has her GPS location).
- Don't print her personal email or phone in plain text. Use a **contact form** (Web3Forms or Formspree free tier) with a honeypot and Cloudflare Turnstile, plus a business email alias.
- Self-host the fonts (no Google Fonts requests).

**Site security (a static site has a tiny attack surface):**
- Security headers via a Cloudflare `_headers` file: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
- With the Tumble Deck replacing Page Flip and Stipple Type on hold, **no paid React Bits Pro code is needed right now.** If Stipple Type comes back, its `REACTBITS_LICENSE_KEY` goes only in `.env.local` (git-ignored), and the repo stays private.
- Keep the repo private anyway: it holds the client's unreleased work.
- Don't disable right-click or add visible watermarks. They break accessibility and don't stop anyone. Serving only web-size images is the real protection.

---

## 8. Quality bars (the definition of "done")

- **Reduced motion:** with `prefers-reduced-motion`, everything still reads well. No smooth scroll, no pinning, grid instead of ring, fades instead of flights.
- **Performance:** LCP < 2.5 s on a mid-range Android over 4G. JS ≈ 250 KB gzipped or less, not counting images. 60 fps on scroll (animate only `transform`, `opacity` and `clip-path`).
- **Accessibility:** keyboard for carousel, viewer and deck; visible teal focus rings; alt text for every photo; HTML text versions of the portfolio pages.
- **Look-and-fix rubric:** an average of 8 or more, nothing under 7 (section 5b).
- **Mobile is designed, not shrunk:** test on a real phone, not just devtools.
- **SEO and sharing:** per-collection titles and descriptions, an Open Graph image per collection, `Person` structured data.

---

## 9. Build order (for Claude Code)

0. **Product context:** run `/impeccable init` to write `PRODUCT.md` (who she is, the audience, Experience mode), then keep the tokens from section 4 and the system in section 5b in `DESIGN.md`. Every later step reads these two files, so the design stays consistent across sessions.
1. **Assets:** move the client folders into `media-src/collections/<slug>/` (section 6), write `site/scripts/media/build.mjs` (`cd site && npm run media`), write the four collection JSON files, and build. Test the script on one collection first. Get the page order from the client first. From then on, every new collection follows the add-collection skill.
2. **Skeleton:** Next + Tailwind + tokens + fonts, every section with **static** content. Must look good with zero motion.
3. **Components:** Circular Carousel (+ grid toggle + viewer + pause), Tumble Deck (+ overlay, covers, counter, `onIndexChange`, zoom, "Read the text"), Glass Folder. Restyle all to the tokens.
4. **Motion pass:** Lenis, the thread, manifesto fill, chapter lighting, hero lens, signature drawing. Work chapter by chapter.
5. **Hardening:** reduced motion, mobile, accessibility, performance budget, headers.
6. **Launch:** Cloudflare Pages, domain, analytics, the client's final review.

---

## 10. What I need before building

**From you:**
1. ~~React Bits Pro license and Page Flip config~~ Decided: Tumble Deck replaces Page Flip, and Stipple Type is on hold. No license needed for now.
2. ~~Dither Cursor?~~ Decided: dropped.
2b. ~~Tumble Deck source~~ Saved as `Components/Tumble deck component.txt`, unchanged from what you pasted.
2c. Later: the hero type treatment (Stipple Type or something else).

**From the client:**
3. **Page order** for Mano Padana and Lunelle. Do pages 01–03 and 20–29 of the Drift/Revive book exist?
4. Bio, education, CV, contact email, socials, domain name.
5. ~~A proper portrait~~ Decided: use the personal photos for now, as collage (section 3, item 7). Her OK to publish those five photos, and a portrait session later if possible.
6. **SVG logos** (LA monogram, Drift, Revive, Lunelle, Mano Padana) and a few lines of **her handwriting** plus her signature, on white paper or as vectors.
7. Model releases, photographer name and credit line, and OK for the ultrasound images and the E.L.V. collaboration.
8. Her final say on teal vs. indigo once she sees both mocks.
