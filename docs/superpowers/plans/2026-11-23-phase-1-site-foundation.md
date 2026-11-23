# Phase 1: Site Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working static Next.js site with every section rendered from data (four collections, the person section, contact), the media pipeline, and the three interactive components (Circular Carousel with grid and viewer, Tumble Deck reader, Glass Folders). It must look finished **without** scroll motion. Scroll motion (Lenis, thread, manifesto fill, hero lens, chapter lighting, pinning) is Phase 2.

**Architecture:** `site/` is a Next.js App Router app with static export. Content lives in JSON (`site/content/`). A Node media script turns originals in `media-src/` into web images plus a manifest. Pages read collections and the manifest at build time. Client components are limited to the carousel, the deck, the folders and the contact form.

**Tech Stack:** Next.js 16.4.6, React 19.3.1, Tailwind CSS 4.3.5, GSAP 3.15.1 (Tumble Deck ticker), sharp 0.34.5, Vitest 5.1.1, @testing-library/react 16.3.3, jsdom 31.0.1, @vitejs/plugin-react 6.3.0.

**Spec:** `PLAN.md` (design and decisions) and `PRODUCT.md` (product truth). Component sources: `Components/Circular component.txt` (JSX lines 69–1033, CSS lines 1038–1278), `Components/Tumble deck component.txt`, `Components/Glass morphism folder component.txt`.

## Global Constraints

- Palette tokens: `--cream #F2E8DA` (page ground), `--brown #3B2418` (ink), `--teal #008794` (accent: focus ring, links, the thread, large text only), `--paper #FBF8F3`. Teal is **never** used for text under 24px.
- Body text contrast ≥ 4.5:1, large text ≥ 3:1.
- Spacing scale (px): 4 8 12 16 24 32 48 64 96 128 176. Side gutters: 20px <640px, 32px 640–1023px, 64px ≥1024px. Content max-width 1440px. Body measure ≤ 70ch.
- Type: display `clamp(2.5rem, 7vw, 6rem)`, line-height 0.95, tracking -0.03em; body 17px/1.55; labels 12px uppercase tracking 0.15em. Fonts via `next/font/google` (self-hosted at build): Bodoni Moda (display + body), Courier Prime (labels, counters), Noto Serif Sinhala (Sinhala titles only).
- Easing tokens: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. Never ease-in.
- Durations: press 140ms, hover/state 200ms, overlay open 450ms, overlay close 300ms.
- Hover effects only inside `@media (hover: hover) and (pointer: fine)`. Pressables `:active { scale: .97 }`.
- No label/eyebrow above headings. No fade-in-on-scroll. All content visible with JavaScript disabled.
- Browser surfaces themed: `::selection` teal 30%, `caret-color` teal, focus ring 2px teal offset 3px, `text-underline-offset: 0.2em`.
- Images: originals only in `media-src/` (git-ignored). EXIF stripped. Widths 640/1280/2400, never upscaled. AVIF + WebP.
- Every URL to media comes from the manifest and is prefixed with `process.env.MEDIA_BASE_URL ?? ""`.
- Copy: no invented facts. Drafted bio text is shown with `draft: true` in data and is not rendered with any claim not found in her pages.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A source image smaller than 2400px wide: the build emits only the widths it really has, no upscaling (test in Task 3).
2. A portfolio page that is not ratio 1.414 (e.g. the portrait Mano Padana cover) is padded on paper colour, never cropped, so the deck shows it whole (test in Task 3).
3. A shoot photo with no alt text: the media build fails and names the file, instead of shipping an unlabeled image (test in Task 3).
4. Keyboard and focus: closing the reader or the photo viewer with Esc returns focus to the button that opened it, and the page underneath does not scroll while it is open (tests in Tasks 6 and 7).
5. JavaScript off or reduced motion: every photo and page is still reachable (grid default under reduced motion, static fallbacks in markup) (tests in Tasks 6 and 9).

---

## File Structure

```
media-src/                              originals (git-ignored), created in Task 2
  collections/<slug>/{shoot,pages}/, cover.*, logo.*
  personal/
site/
  package.json, next.config.ts, vitest.config.ts, tsconfig.json
  content/site.json                      site-wide copy and references
  content/collections/<slug>.json        one per collection
  scripts/media/build.mjs                CLI: npm run media -- <slug|--all>
  scripts/media/lib.mjs                  pure helpers + buildCollection()
  scripts/media/lib.test.mjs
  src/generated/media-manifest.json      generated, committed
  public/media/...                       generated, committed
  src/lib/contrast.ts (+ .test.ts)
  src/lib/collections.ts (+ .test.ts)
  src/lib/media.ts                       typed manifest access
  src/app/layout.tsx, globals.css, page.tsx
  src/app/work/page.tsx, src/app/work/[slug]/page.tsx
  src/components/circular-carousel/CircularCarousel.jsx, .css   (verbatim source)
  src/components/tumble-deck/TumbleDeck.tsx                     (source + 2 edits)
  src/components/glass-folder/GlassFolder.tsx                   (verbatim source)
  src/components/ShootGallery.tsx (+ .test.tsx)
  src/components/PortfolioReader.tsx (+ .test.tsx)
  src/components/StudioTable.tsx (+ .test.tsx)
  src/components/Chapter.tsx (+ .test.tsx)
  src/components/sections/{Hero,Manifesto,Person,Footer}.tsx
  src/components/ContactForm.tsx (+ .test.tsx)
```

---

### Task 1: Scaffold `site/`, tokens, fonts, test runner, contrast helper

**Files:**
- Create: `site/` via `npx create-next-app@16.4.6 site --ts --tailwind --app --src-dir --no-eslint --import-alias "@/*" --use-npm --turbopack`
- Create: `site/vitest.config.ts`, `site/src/lib/contrast.ts`, `site/src/lib/contrast.test.ts`
- Modify: `site/next.config.ts`, `site/src/app/globals.css`, `site/src/app/layout.tsx`, `site/package.json`

**Interfaces:**
- Produces: `contrastRatio(fg: string, bg: string): number` (hex `#RRGGBB`, WCAG 2 relative luminance), `PALETTE = { cream, brown, teal, paper }` exported from `contrast.ts`. CSS custom properties from Global Constraints in `globals.css` (`:root` and Tailwind `@theme`: `--color-background: var(--cream)`, `--color-foreground: var(--brown)`, `--color-primary: var(--teal)`). Font CSS variables `--font-display`, `--font-label`, `--font-sinhala`.

- [ ] **Step 1:** Scaffold with the command above; add dev deps `vitest@5.1.1 @testing-library/react@16.3.3 @testing-library/user-event jsdom@31.0.1 @vitejs/plugin-react@6.3.0` and deps `gsap@3.15.1 sharp@0.34.5`. `vitest.config.ts`: plugin react, environment `jsdom`, `environmentMatchGlobs`/`projects` so `scripts/**/*.test.mjs` run in `node`; alias `@` → `src`. Script `"test": "vitest run"`.
- [ ] **Step 2: Write the failing test** `src/lib/contrast.test.ts`:

```ts
import { contrastRatio, PALETTE } from './contrast'
test('brown on cream passes AA body', () => expect(contrastRatio(PALETTE.brown, PALETTE.cream)).toBeGreaterThan(10))
test('teal on cream is large-text only', () => {
  const r = contrastRatio(PALETTE.teal, PALETTE.cream)
  expect(r).toBeGreaterThan(3); expect(r).toBeLessThan(4.5)
})
test('black on white is 21', () => expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1))
```

- [ ] **Step 3:** Run `cd site && npm test -- contrast`. Expected: FAIL (module not found).
- [ ] **Step 4:** Implement `contrast.ts`.
- [ ] **Step 5:** Run `npm test -- contrast`. Expected: 3 passed.
- [ ] **Step 6:** `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: true`. `globals.css`: first rule `html, body { background: var(--cream); color: var(--brown) }`, all tokens, browser-surface theming, `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }`. `layout.tsx`: the three fonts, `lang="en"`, title "Linali Andrea · Womenswear designer", description from `content/site.json` tagline (Task 4 creates it; use a literal until then). Remove the starter page content.
- [ ] **Step 7:** Run `npm run build`. Expected: exits 0, `site/out/index.html` exists.
- [ ] **Step 8: Commit** `feat(site): scaffold Next app with tokens, fonts and test runner`.

---

### Task 2: Move originals into `media-src/` with order

**Files:**
- Create: `media-src/collections/{mano-padana,lunelle,drift,revive}/…`, `media-src/personal/`, `media-src/_unused/`
- Modify: `.claude/skills/add-collection/SKILL.md` (media command path, see Interfaces)

**Interfaces:**
- Produces: the folder contract the media build reads: `shoot/NN-<orig>.<ext>`, `pages/NN.<ext>` (a spread is named by its first page number), optional `cover.*`, `logo.*`. `NN` is two digits.

Use `mv` (not copy). Mapping (PLAN.md section 1; Drift/Revive numbers read from the pages themselves):

| Source | Destination |
|---|---|
| `drift collection/Shoot Pictures/*.jpg` | `drift/shoot/NN-<name>.jpg`, NN = current alphabetical order 01–17 |
| `drift collection/Portfolio pages/` 38dd5a1f→`04`, a4a7a94d→`06`, f016cdda→`08`, 95294d47→`10`, c3812c14→`12`, b73c13d5→`14`, 634977eb→`16`, 3ae59fcb→`18` | `drift/pages/NN.png` (spreads) |
| `drift collection/Portfolio pages/b31ee378…tiff` | `_unused/` (probable duplicate, unchecked) |
| `drift collection/drift collection logo.png` | `drift/logo.png` |
| `Denim/Denim/portfolio/` 3a783dd4→`30`, 6a63ac56→`32`, 6f406a19→`34`, 01406709→`36` | `revive/pages/NN.png` (spreads) |
| `Denim/Denim/logo.png` | `revive/logo.png` |
| `Heritage/IMG-*.jpg` | `mano-padana/shoot/NN-<name>.jpg`, alphabetical 01–06 |
| `Heritage/portfolio pages/5a7f0015…png` | `mano-padana/cover.png` |
| `Heritage/portfolio pages/` provisional: 438af55d→01, f1f1a518→02, 20f36419→03, 7ba9f01a→04, 488838a1→05, ea6c4306→06, 4eafdda3→07, 30bb515f→08, 9e446fd9→09, b8127fc2→10 | `mano-padana/pages/NN.png` |
| `Maternity/Maternity/MMS_*.jpg` | `lunelle/shoot/NN-<name>.jpg`, alphabetical 01–10 |
| `Maternity/Maternity/Logo.png` | `lunelle/cover.png` |
| `Maternity/Maternity/f60611e7…png` (line-up illustration) | `lunelle/pages/21.png` |
| `Maternity/Maternity/Portfolio pages/IMG-*.jpg` provisional, alphabetical → 01–20; `92b207d3…png` (final garment) → 22 | `lunelle/pages/NN.{jpg,png}` |
| `Personal/*` originals | `media-src/personal/originals/` |
| `Personal/edited/{balcony-sticker.png,beach-graded.jpg,mirror-graded.jpg,chair-graded.jpg}` | **copy** to `media-src/personal/` |
| `Linali Andrea logo.png` | **copy** to `media-src/brand/monogram.png` |

- [ ] **Step 1:** Run the moves. Then remove the now-empty client folders.
- [ ] **Step 2: Verify.** Run `find media-src -type f | wc -l` and `ls media-src/collections/*/pages`. Expected: drift pages `04 06 08 10 12 14 16 18`; revive `30 32 34 36`; mano-padana `01`–`10`; lunelle `01`–`22`; shoot counts drift 17, lunelle 10, mano-padana 6; total files in `media-src` = 93 (the 88 client media files plus 5 copies). Nothing lost.
- [ ] **Step 3:** Update the add-collection skill: media command becomes `cd site && npm run media -- <slug>`, script path `site/scripts/media/build.mjs`.
- [ ] **Step 4: Commit** `chore: move client originals into media-src (git-ignored)` (commits only the skill change and `.gitignore` if touched).

---

### Task 3: Media build

**Files:**
- Create: `site/scripts/media/lib.mjs`, `site/scripts/media/build.mjs`, `site/scripts/media/lib.test.mjs`
- Modify: `site/package.json` (`"media": "node scripts/media/build.mjs"`)

**Interfaces:**
- Consumes: Task 2 folder contract; `content/collections/<slug>.json` `alt` map (Task 4 writes real ones; tests use fixtures).
- Produces (`lib.mjs`):
  - `parseOrder(fileName: string): number` — leading `NN-` or `NN.` → number; throws `Error("No order prefix: <name>")`.
  - `isSpread(w: number, h: number): boolean` — `w / h > 2.5`.
  - `needsPad(w: number, h: number): boolean` — `Math.abs(w / h - Math.SQRT2) > 0.02`.
  - `widthsFor(srcWidth: number): number[]` — subset of `[640, 1280, 2400]` ≤ srcWidth; if srcWidth < 640, `[srcWidth]`.
  - `buildCollection(slug, { srcRoot, outRoot, urlPrefix, alt }): Promise<CollectionMedia>`
  - `buildPersonal({ srcRoot, outRoot, urlPrefix }): Promise<Record<string, MediaImage>>`
  - Manifest file `site/src/generated/media-manifest.json`: `{ collections: Record<slug, CollectionMedia>, personal: Record<name, MediaImage>, brand: { monogram: MediaImage } }`
  - `MediaImage = { id, order, width, height, placeholder, srcset: { avif, webp }, src, zoom }` — `id`: page `"04"` / shoot `"01-MMS_8188"`; `placeholder`: 16px-wide WebP data URL; `srcset.*`: `"<url> 640w, <url> 1280w"`; `src`: the 1280 WebP (or largest); `zoom`: the 2400 WebP (or largest). URLs: `${urlPrefix}/media/<slug>/<kind>/<id>-<w>.<fmt>`.
  - `CollectionMedia = { shoot: MediaImage[], pages: MediaImage[], cover?: MediaImage, logo?: MediaImage }`, arrays sorted by `order`. Pages from a spread `NN` become `NN` and `NN+1` (two digits). Padded pages are centred on `#FBF8F3` to ratio √2.
- CLI: `node scripts/media/build.mjs <slug>|--all` reads alt from `content/collections/<slug>.json`, reads `MEDIA_BASE_URL` for `urlPrefix`, writes into `public/`, merges into the manifest.

- [ ] **Step 1: Write the failing tests** `lib.test.mjs` (fixtures generated with sharp into a temp dir in `beforeAll`; one fixture JPEG carries EXIF GPS via `withExif`):

```js
test('parseOrder', () => { expect(parseOrder('03-MMS_1.jpg')).toBe(3); expect(parseOrder('18.png')).toBe(18); expect(() => parseOrder('x.png')).toThrow('No order prefix: x.png') })
test('isSpread', () => { expect(isSpread(9922, 3508)).toBe(true); expect(isSpread(4960, 3508)).toBe(false) })
test('needsPad', () => { expect(needsPad(4960, 3508)).toBe(false); expect(needsPad(1905, 2648)).toBe(true) })
test('widthsFor never upscales', () => { expect(widthsFor(4000)).toEqual([640,1280,2400]); expect(widthsFor(1200)).toEqual([640]); expect(widthsFor(500)).toEqual([500]) })
test('spread splits into two numbered pages', async () => { const m = await buildCollection('t', fx); expect(m.pages.map(p => p.id)).toEqual(['04','05']) })
test('non-√2 page is padded, not cropped', async () => { const p = (await buildCollection('t', fxPortrait)).pages[0]; expect(Math.abs(p.width / p.height - Math.SQRT2)).toBeLessThan(0.01) })
test('EXIF is stripped', async () => { const m = await buildCollection('t', fx); expect((await sharp(fileOf(m.shoot[0].src)).metadata()).exif).toBeUndefined() })
test('missing alt fails with the file name', async () => { await expect(buildCollection('t', { ...fx, alt: {} })).rejects.toThrow('Missing alt for 01-a') })
test('urls carry the prefix', async () => { const m = await buildCollection('t', { ...fx, urlPrefix: 'https://media.x' }); expect(m.shoot[0].src.startsWith('https://media.x/media/t/shoot/')).toBe(true) })
```

- [ ] **Step 2:** Run `npm test -- scripts/media`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `lib.mjs` then `build.mjs`. Use `sharp(...).rotate()` before resizing; never call `withMetadata`.
- [ ] **Step 4:** Run `npm test -- scripts/media`. Expected: 9 passed.
- [ ] **Step 5: Commit** `feat(media): media build with spreads, padding, EXIF strip and alt check`.

(Real collections are built in Task 4, once their alt text exists.)

---

### Task 4: Content model, collection files, real media

**Files:**
- Create: `site/src/lib/collections.ts`, `site/src/lib/collections.test.ts`, `site/src/lib/media.ts`, `site/content/site.json`, `site/content/collections/{mano-padana,lunelle,drift,revive}.json`
- Generated: `site/public/media/**`, `site/src/generated/media-manifest.json`

**Interfaces:**
- Consumes: `contrastRatio` (Task 1), media build CLI (Task 3).
- Produces (`collections.ts`):
  - `type Moment = 'ring' | 'orbit' | 'walk' | 'studio' | 'gallery'`
  - `interface Collection { slug; title; titleNative?; season; year; order; featured; concept; palette: { ground; ink; accent }; moment; carousel?: { preset: 'cylinder'|'orbit'|'wheel'|'panorama'; autoplay: 'drift'|'step'|'off'; speed?: number }; studio?: { label: string; pages: string[] }[]; credits: { photographer?: string; models?: string[]; collaboration?: string | null }; rights: { models: boolean; photographer: boolean; sensitive: string; confirmedBy: string | null }; alt: Record<string, string>; pageText: Record<string, string>; pageOrder: 'confirmed' | 'provisional' }`
  - `parseCollection(raw: unknown, file: string): Collection` — throws `Error("<file>: <field> …")` on a missing/invalid field, on `contrastRatio(palette.ink, palette.ground) < 4.5`, on `moment` `ring`/`orbit` without `carousel`, and on `moment: 'studio'` without `studio`.
  - `getCollections(): Collection[]` (sorted by `order`), `getFeatured(): Collection[]` (throws `"More than 4 featured collections"` if > 4), `getCollection(slug): Collection | undefined`.
  - `media.ts`: `getMedia(slug): CollectionMedia`, `getPersonal(name): MediaImage`, `getBrand()`, types re-exported from one `MediaImage`/`CollectionMedia` definition.
- `content/site.json`: `{ name, tagline, manifesto, themes: string[], hero: { sketch: { collection, page }, photo: { collection, shoot } }, bio: { text, draft: true }, skills: string[], person: { figure, polaroids: [string, string] }, personalAlt: Record<string,string>, contact: { endpointEnv: "NEXT_PUBLIC_CONTACT_ENDPOINT" } }`.

Values:
- order/featured/moment: mano-padana 1 `walk`; lunelle 2 `orbit` carousel `{ preset: 'orbit', autoplay: 'drift', speed: 6 }`; drift 3 `ring` carousel `{ preset: 'cylinder', autoplay: 'drift', speed: 8 }`; revive 4 `studio` with `[{ label: 'Research', pages: ['30','31','32','33','36'] }, { label: 'Fabric & detail', pages: ['34','35'] }, { label: 'Line-up', pages: ['37'] }]`. All `featured: true`.
- palettes: all `{ ground: '#F2E8DA', ink: '#3B2418', accent: '#008794' }` except lunelle `{ ground: '#21150F', ink: '#F2E8DA', accent: '#E8C4C0' }`.
- seasons/years: SS25/2025, AW26/2026, SS27/2026, SS27/2026. `titleNative` for mano-padana: `මනෝ පාදන`.
- `concept`: transcribe **her own words** from: mano-padana page 10 (statement), lunelle page with "CONCEPT BOARD", drift page 04 (concept), revive page 30 (concept). Open each page at full resolution to read it. Quote, do not rewrite.
- `pageText`: drift pages 04–19 transcribed (template collection). Others `{}` for now (Ruling in ledger).
- `alt`: one line per shoot photo describing the garment and setting, written after viewing each photo.
- `rights`: every flag `false`, `confirmedBy: null`, `pageOrder`: drift/revive `confirmed`, others `provisional`.
- site.json: name `Linali Andrea`; tagline `Womenswear designer · Sri Lanka · Slow craft`; manifesto: her sentence from mano-padana page 10, `I strongly believe that fashion is the best form of self expression.`; themes `["mind","body","nature","renewal"]`; hero sketch `{ collection: 'drift', page: '18' }`, photo `{ collection: 'drift', shoot: '13-MMS_8698' }` (or whichever id the 6-woman group shot gets); bio drafted only from facts in PRODUCT.md, `draft: true`; person `{ figure: 'balcony-sticker', polaroids: ['beach-graded','mirror-graded'] }`.

- [ ] **Step 1: Write the failing tests** `collections.test.ts`:

```ts
test('parses a valid collection', () => expect(parseCollection(valid, 'v.json').slug).toBe('drift'))
test('names the missing field', () => expect(() => parseCollection({ ...valid, title: undefined }, 'v.json')).toThrow('v.json: title'))
test('rejects unreadable palette', () => expect(() => parseCollection({ ...valid, palette: { ground: '#F2E8DA', ink: '#008794', accent: '#000000' } }, 'v.json')).toThrow('contrast'))
test('ring needs carousel settings', () => expect(() => parseCollection({ ...valid, carousel: undefined }, 'v.json')).toThrow('carousel'))
test('studio needs folders', () => expect(() => parseCollection({ ...valid, moment: 'studio', studio: undefined }, 'v.json')).toThrow('studio'))
test('real content: four featured, in story order', () => expect(getFeatured().map(c => c.slug)).toEqual(['mano-padana','lunelle','drift','revive']))
test('real content: every shoot image has alt', () => { for (const c of getCollections()) for (const s of getMedia(c.slug).shoot) expect(c.alt[s.id]).toBeTruthy() })
```

- [ ] **Step 2:** Run `npm test -- collections`. Expected: FAIL.
- [ ] **Step 3:** Implement `collections.ts` and `media.ts`; write the five JSON files with the values above.
- [ ] **Step 4:** Run `npm run media -- --all`. Expected: exits 0; manifest has 4 collections; `drift.pages.length === 16`, `revive.pages.length === 8`, `drift.shoot.length === 17`; `du -sh public/media` under 120M.
- [ ] **Step 5:** Run `npm test -- collections`. Expected: 7 passed.
- [ ] **Step 6: Commit** `feat(content): collection model, four collections, generated media`.

---

### Task 5: Vendor the three components

**Files:**
- Create: `site/src/components/circular-carousel/CircularCarousel.jsx` (source lines 69–1033 verbatim), `CircularCarousel.css` (lines 1038–1278 verbatim), `site/src/components/glass-folder/GlassFolder.tsx` (whole file verbatim), `site/src/components/tumble-deck/TumbleDeck.tsx` (whole file + two edits), `site/src/components/tumble-deck/TumbleDeck.test.tsx`

**Interfaces:**
- Produces: `TumbleDeck` default export with props as the source plus `onIndexChange?: (index: number) => void` (called from `paint()` whenever `wrap(Math.round(pos), n)` differs from the last reported value, including the first paint with `0`). Shade colour becomes `var(--td-shade-color, #3B2418)` instead of `#000`. `CircularCarousel` and `GlassFolder` default exports unchanged.

- [ ] **Step 1: Write the failing test** `TumbleDeck.test.tsx` (stub `ResizeObserver` and `matchMedia`; reduced motion `true` so steps apply synchronously):

```tsx
test('reports index 0 on mount and 1 after ArrowRight', async () => {
  const onIndexChange = vi.fn()
  render(<TumbleDeck cards={[{ src: 'a' }, { src: 'b' }, { src: 'c' }]} onIndexChange={onIndexChange} />)
  expect(onIndexChange).toHaveBeenLastCalledWith(0)
  await userEvent.type(screen.getByRole('region'), '{ArrowRight}')
  expect(onIndexChange).toHaveBeenLastCalledWith(1)
})
test('wraps from last to first', async () => { /* 2 cards, ArrowRight twice → last call 0 */ })
```

- [ ] **Step 2:** Copy the TumbleDeck source unchanged; run `npm test -- TumbleDeck`. Expected: FAIL (`onIndexChange` never called).
- [ ] **Step 3:** Apply the two edits; copy the carousel and folder sources.
- [ ] **Step 4:** Run `npm test -- TumbleDeck`. Expected: 2 passed. Run `npx tsc --noEmit`. Expected: no errors in the three component folders.
- [ ] **Step 5: Commit** `feat(components): vendor carousel, folder and tumble deck (+ index callback)`.

---

### Task 6: ShootGallery (ring ↔ grid, pause, viewer)

**Files:**
- Create: `site/src/components/ShootGallery.tsx`, `ShootGallery.test.tsx`

**Interfaces:**
- Consumes: `CircularCarousel` (Task 5), `MediaImage` (Task 4).
- Produces: `ShootGallery({ images: MediaImage[]; alt: Record<string,string>; preset: 'cylinder'|'orbit'; autoplay: 'drift'|'step'|'off'; speed?: number; fadeColor: string; label: string })`.

Behaviour: a toggle button pair "Ring" / "Grid" (`aria-pressed`). Ring view renders `CircularCarousel` with `items` from `src`/`alt`, `aspectRatio={2/3}`, `fadeColor`, `captions={false}`, `onItemClick` opening the viewer. A "Pause" / "Play" button (`aria-pressed`) sets `autoplay="off"`. Grid view: `<ul>` of `<button>` tiles with `<img loading="lazy" srcSet sizes>`. Viewer: `<dialog>` opened with `showModal()`, full image (`zoom` src), counter `NN / NN` in the label font, ArrowLeft/ArrowRight move, Esc closes and focus returns to the opener, `document.body.style.overflow = 'hidden'` while open. Under `prefers-reduced-motion: reduce` the initial view is Grid. The grid markup is always in the HTML (hidden with `hidden` attribute in ring view), so with JS off the photos remain reachable.

- [ ] **Step 1: Write the failing tests** (mock `CircularCarousel` with `vi.mock` to render `<div data-testid="ring" data-autoplay={autoplay} />`; polyfill `HTMLDialogElement.prototype.showModal/close`):

```tsx
test('starts in ring view', ...)                       // getByTestId('ring') visible, Ring aria-pressed=true
test('starts in grid under reduced motion', ...)       // matchMedia reduce → Grid aria-pressed=true
test('toggle switches to grid', ...)
test('pause sets autoplay off', ...)                   // data-autoplay === 'off'
test('grid tile opens viewer at that photo', ...)      // click 3rd tile → dialog open, counter '03 / 17'
test('arrow keys move, Esc closes and restores focus', ...) // ArrowRight → '04 / 17'; Escape → dialog closed, document.activeElement === 3rd tile
test('locks page scroll while open', ...)              // body.style.overflow === 'hidden' then ''
```

- [ ] **Step 2:** Run `npm test -- ShootGallery`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test -- ShootGallery`. Expected: 7 passed.
- [ ] **Step 5: Commit** `feat(gallery): ring/grid gallery with pause and photo viewer`.

---

### Task 7: PortfolioReader (closed stack → Tumble Deck overlay)

**Files:**
- Create: `site/src/components/PortfolioReader.tsx`, `PortfolioReader.test.tsx`

**Interfaces:**
- Consumes: `TumbleDeck` with `onIndexChange` (Task 5), `MediaImage`.
- Produces: `PortfolioReader({ title: string; pages: MediaImage[]; pageText: Record<string,string>; cover?: MediaImage; monogram: MediaImage; background: string; defaultOpen?: boolean })`, and pure helpers `deckCards(pages, cover, monogram)` → `[front, ...pages, back]` and `counterLabel(deckIndex: number, pageCount: number): string` (`0` → `"Cover"`, last → `"End"`, else `NN / NN` zero-padded).

Behaviour: closed state is a static stack (top three page thumbnails offset, `src` 640) and a button "Open the portfolio" (also has the collection title in its accessible name). Open state: a full-screen `<dialog>` with the `TumbleDeck` (`aspect={1.414}`, `depth={4}`, `height="100svh"`, `background`), a Close button, the counter, a "Zoom" button (disabled on covers) that shows the current page's `zoom` image in a scrollable panel, and a "Read the text" button rendered only when the current page has text, showing that text. Preload `src` of the next three cards with `new Image()`. Open 450ms / close 300ms opacity+scale(0.98) with `--ease-out`; instant under reduced motion. Esc closes; focus returns to the opener; body scroll locked while open.

- [ ] **Step 1: Write the failing tests** (mock `TumbleDeck` to render buttons that call `onIndexChange(n)`):

```tsx
test('counterLabel', () => { expect(counterLabel(0, 16)).toBe('Cover'); expect(counterLabel(7, 16)).toBe('07 / 16'); expect(counterLabel(17, 16)).toBe('End') })
test('deckCards wraps pages with covers', () => expect(deckCards(pages, cover, mono).length).toBe(pages.length + 2))
test('opens from the stack and closes with Esc, restoring focus', ...)
test('counter follows the deck', ...)                  // onIndexChange(3) → '03 / 16'
test('zoom shows the current page at full size', ...)  // index 3 → img src === pages[2].zoom
test('read-the-text only when the page has text', ...) // page '04' has text → button; page without → no button
test('defaultOpen opens on mount', ...)
```

- [ ] **Step 2:** Run `npm test -- PortfolioReader`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test -- PortfolioReader`. Expected: 7 passed.
- [ ] **Step 5: Commit** `feat(reader): portfolio reader with counter, zoom and page text`.

---

### Task 8: StudioTable and Chapter

**Files:**
- Create: `site/src/components/StudioTable.tsx`, `StudioTable.test.tsx`, `site/src/components/Chapter.tsx`, `Chapter.test.tsx`

**Interfaces:**
- Consumes: `GlassFolder`, `ShootGallery`, `PortfolioReader`, `Collection`, `CollectionMedia`.
- Produces: `StudioTable({ folders: { label: string; pages: string[] }[]; pages: MediaImage[]; palette })` — one `GlassFolder` per folder, `tone="light"`, `action="none"`, `art={{ style: 'marble', colors: [palette.ground, palette.ink, palette.accent] }}`, `files` = matching pages as `{ name: 'Page NN', image: src }`. `Chapter({ collection: Collection; media: CollectionMedia; monogram: MediaImage })` — `<section id={slug} aria-labelledby>` with `style` setting `--ground/--ink/--accent` from the palette, heading (title, Sinhala `titleNative` in `lang="si"` when present, season), concept paragraph, the moment, then `PortfolioReader`. Moments: `ring`/`orbit` → `ShootGallery` with the collection's carousel settings and `fadeColor = palette.ground`; `walk` → a horizontally scrollable `<ol>` of the shoot photos with `scroll-snap-type: x mandatory` (pinning is Phase 2); `studio` → `StudioTable` plus a line "In progress"; `gallery` → `ShootGallery` with `autoplay="off"` and initial Grid.

- [ ] **Step 1: Write the failing tests** (mock the three heavy components to marker elements):

```tsx
test.each([['ring','gallery-ring'],['orbit','gallery-orbit'],['walk','walk'],['studio','studio'],['gallery','gallery-grid']])('moment %s renders %s', ...)
test('Sinhala title is marked lang=si', ...)
test('studio table makes one folder per group with its page count', ...) // 3 folders; Research has 5 files
test('every chapter ends with the reader', ...)
```

- [ ] **Step 2:** Run `npm test -- Chapter StudioTable`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test -- Chapter StudioTable`. Expected: 8 passed.
- [ ] **Step 5: Commit** `feat(chapters): chapter shell with five moments and studio table`.

---

### Task 9: Story page sections, contact form, routes

**Files:**
- Create: `site/src/components/sections/{Hero,Manifesto,Person,Footer}.tsx`, `site/src/components/ContactForm.tsx`, `ContactForm.test.tsx`, `site/src/app/work/page.tsx`, `site/src/app/work/[slug]/page.tsx`, `site/src/app/page.test.tsx`
- Modify: `site/src/app/page.tsx`

**Interfaces:**
- Consumes: everything above; `content/site.json`.
- Produces: routes `/`, `/work/`, `/work/<slug>/` (via `generateStaticParams` from `getCollections()`); `ContactForm({ endpoint?: string })`.

Section specs (static; Phase 2 animates them):
- **Hero:** full viewport (`min-height: 100svh`). Name in display type, tagline in body type, the hero sketch page as the ground with the hero photo shown inside a 38vmin circle (static position right of centre: `clip-path: circle(19vmin at 62% 50%)`). Monogram top-left as home link; nav right: Work, About, Contact (anchors).
- **Manifesto:** the manifesto sentence as display type, max 18ch per line, then the themes joined with ` · ` as one quiet line.
- **Chapters:** `getFeatured()` in order, each a `Chapter`.
- **Person:** the collage from `Personal/edited/preview.html` (figure cutout standing on the section's bottom edge, two taped polaroids, phone layout below 760px), headline `Behind the work, a slow hand.`, the bio (rendered with a visible "Draft" marker only in development builds, `process.env.NODE_ENV !== 'production'`), skills as a plain list.
- **Footer:** a brown (`--brown`) card with `border-radius: 40px 40px 0 0` rising over cream, closing line `Let's make something slow.` in display type (cream on brown), the `ContactForm`, a line of credits, `© <year> Linali Andrea`.
- **ContactForm:** fields name, email, message (all required, labels visible), a hidden honeypot field `company` (`tabIndex={-1}`, `autoComplete="off"`, visually hidden); on submit `fetch(endpoint, { method: 'POST', body: FormData })`. States: idle, sending (button disabled, label "Sending…"), sent ("Thank you. I'll reply soon."), error (message names the problem and says to try again). No endpoint → error "The contact form isn't connected yet." without calling fetch. A filled honeypot → shows "sent" without calling fetch.
- **/work:** list of every collection (title, season, one shoot or cover image) linking to `/work/<slug>/`. **/work/<slug>:** `Chapter` for that collection with the reader `defaultOpen`.

- [ ] **Step 1: Write the failing tests:**

```tsx
// ContactForm.test.tsx
test('requires name, email and message', ...)          // submit empty → fetch not called, fields :invalid
test('posts and shows thanks', ...)                     // fetch resolves ok → 'Thank you. I'll reply soon.'
test('shows a retry message on failure', ...)           // fetch rejects → text includes 'try again'
test('no endpoint → not connected message, no fetch', ...)
test('honeypot filled → pretends success, no fetch', ...)
// page.test.tsx (render Home with heavy components mocked)
test('story order: hero, manifesto, 4 chapters, person, footer', ...)
test('no element starts hidden by default (JS-off safety)', ...) // no inline opacity:0 / visibility:hidden in the rendered HTML
```

- [ ] **Step 2:** Run `npm test -- ContactForm page`. Expected: FAIL.
- [ ] **Step 3:** Implement sections, form and routes.
- [ ] **Step 4:** Run `npm test`. Expected: all suites pass.
- [ ] **Step 5:** Run `npm run build`. Expected: exits 0; files exist: `out/index.html`, `out/work/index.html`, `out/work/{mano-padana,lunelle,drift,revive}/index.html`.
- [ ] **Step 6: Commit** `feat(site): story page, person section, contact form and work routes`.

---

### Task 10: Look-and-fix pass

**Files:**
- Modify: whatever the review finds (section components, `globals.css`).

- [ ] **Step 1:** Serve `site/out` (`npx serve out -l 4173`, background) and screenshot `/`, `/work/`, `/work/drift/` with `impeccable shot http://localhost:4173/<path> --viewport 1440x900,1024x768,768x1024,390x844,320x640 --full`.
- [ ] **Step 2:** Score each page with the rubric in PLAN.md section 5b (first glance, signature, type, composition, colour, media, motion-readiness, mobile, copy, polish). Write the scores and the three weakest items into the ledger.
- [ ] **Step 3:** Fix the three weakest with concrete value changes; rerun `npm test` (Expected: all pass) and re-shoot. Up to 3 rounds, stop when average ≥ 8 and nothing < 7.
- [ ] **Step 4:** Run `impeccable detect --json` over `site/src`. Expected: no unexplained findings (the cream palette and italic accent are documented brand decisions; ignore them per-file with a reason, as done for `Personal/edited/preview.html`).
- [ ] **Step 5: Commit** `fix(site): look-and-fix pass` and append the final scores to the ledger.
