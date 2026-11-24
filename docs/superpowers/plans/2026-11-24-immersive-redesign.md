# Phase 2: Immersive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site as the approved motion-led story: a home page that introduces her and scrolls through her four collections, an editorial `/collections` index, a collection page per collection (shoot and portfolio as separate sections, with a page reader and zoom), and a first-person `/about`.

**Architecture:** Every page renders its full content as ordinary stacked sections on the server (the no-JS and reduced-motion layout). On the client, when motion is on, a section hydrates into its approved motion: the home page becomes one pinned stage driven by a GSAP ScrollTrigger timeline whose scene lengths come from one table; other pages use Lenis smooth scroll plus local effects (hover frame, ring, reader, pattern pieces). Pure geometry and timing live in small tested modules (`timeline.ts`, `geometry.ts`, `header.ts`, `reader.ts`, `fit.ts`); components only wire them to the DOM.

**Tech Stack:** Next.js 16.4.6 (static export), React 19.3.0, Tailwind 4.3.3, GSAP 3.15.1 (+ ScrollTrigger, SplitText), Lenis 1.3.27 (new), sharp 0.34.5, Vitest 5.1.1, @testing-library/react 16.3.3, playwright-core 1.65.1 (new, browser checks via the installed Edge).

**Spec:** `docs/superpowers/specs/2026-11-24-immersive-redesign-design.md`. Reference implementation of every layout, copy line and motion value: `docs/superpowers/specs/2026-11-24-immersive-redesign-mockup.html` (search it by the names given in each task: `LANav`, `colPaint`, `aboutPaint`, `paint(` for home, `build(`/`paint(` in the "INSIDE A COLLECTION" script). Read the spec section a task cites before starting it.

## Global Constraints

- Branch `phase-2-immersive`. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. `npm test` stays green after every task; `npm run test:build` after tasks that touch routes, media or styles.
- **Content visible without JavaScript and under reduced motion:** no element starts at `opacity: 0` or `visibility: hidden` in server HTML; motion is added by client classes only.
- **Text never moves while being read** on `/about` and `/collections*`: no word fills or scroll-scrubbed text reveals there. (Home sentence steps and the manifesto fill are the approved exceptions.)
- Teal `#008794` never on text under 24px (threads, stitches, rules, focus rings only).
- Type (spec 5.1): Gloock (display), Hanken Grotesk (body), DM Mono (labels), Special Elite (Drift narrative), Noto Serif Sinhala; all `next/font/google`. Content-page sizes at 1440 wide: titles 3.6vw, section headings 1.9vw, lead `clamp(17px,1.35vw,20px)`/1.6, body `clamp(15px,1.15vw,17px)`/1.75 max 58ch, labels DM Mono 12px +0.14em uppercase.
- Copy: first person; exact strings from spec section 11; "Let’s make something together." is the only closing line; her title is "Fashion designer" (never "Junior").
- Never publish her phone, email or referees. LinkedIn `https://www.linkedin.com/in/linali-andrea-831216363` is the only outside link.
- Desktop layouts at ≥1024px wide, phone layouts below (`@media (min-width: 1024px)`; JS uses `matchMedia('(min-width: 1024px)')`).
- Motion is off when `prefers-reduced-motion: reduce` unless the visitor turned it on, or when the visitor turned it off (`localStorage['la-motion']` = `'on'|'off'`).
- Vendored components (`circular-carousel`, `tumble-deck`, `glass-folder`) are not edited.
- Media: originals only in `media-src/`; every derived file through `scripts/media` (EXIF stripped); every URL from the manifest.

## Review Focus

1. **Reduced motion or Motion off mid-visit:** turning motion off from the header must kill pins, Lenis and autoplay and leave the stacked layout readable at the current position (test in Task 5 and Task 8).
2. **A phone 320px wide:** nothing scrolls sideways, long skills ("Denim reconstruction") fit inside their pattern piece at ≥12px, the header pill fits (tests in Tasks 6, 15 and 17).
3. **Resizing or rotating a tablet mid-scroll:** the home timeline recomputes scene lengths for the new height and keeps the visitor in the same scene (test in Task 7).
4. **A collection without some parts:** Revive (no shoot) shows no shoot section and no Shoot/Portfolio switch; a collection with single pages is never split; a page without text disables "Read the text" (tests in Tasks 12 and 13).
5. **Keyboard only:** viewer, zoom, page reader and phone menu all open, operate and close with keys, and focus returns to the opener (tests in Tasks 6, 12 and 13).

---

## File Structure

```
site/
  content/site.json                      first-person copy, facts, skills, portrait, closing (Task 1)
  content/collections/*.json             order, line, theme, lead, looks, rights (Task 1)
  src/lib/site.ts                        typed, validated site.json (Task 1)
  src/lib/collections.ts                 + line, theme, lead, looks (Task 1)
  src/lib/media.ts                       + inspiration, brand variants (Task 2)
  scripts/media/lib.mjs                  + enhance(), recolor(), silhouette(), buildInspiration() (Task 2)
  scripts/media/build.mjs                + inspiration, brand variants (Task 2)
  ../tools/media/flush.mjs               flush cut-out + face crop into media-src/personal (Task 2)
  src/app/layout.tsx, globals.css        fonts, tokens, type classes (Task 3)
  src/app/collections/page.tsx           index (Task 11)
  src/app/collections/[slug]/page.tsx    detail (Task 12)
  src/app/about/page.tsx                 about (Task 15)
  public/_redirects                      /work/* → /collections/:splat (Task 4)
  src/lib/motion/ease.ts                 easing + clamp helpers (Task 5)
  src/lib/motion/useMotion.ts            motion preference hook + toggle (Task 5)
  src/lib/motion/SmoothScroll.tsx        Lenis provider (Task 5)
  src/components/header/header.ts        fabricPath, headroom, dock (Task 6)
  src/components/header/SiteHeader.tsx   the pill, chapter roll, menu (Task 6)
  src/components/header/PhoneMenu.tsx    paper sheet menu (Task 6)
  src/components/Footer.tsx              contact card (Task 6)
  src/components/home/timeline.ts        scene table, ranges, steps (Task 7)
  src/components/home/story.ts           home copy excerpts + photo picks (Task 7)
  src/components/home/geometry.ts        window rects, tear edge, moon phase, strip (Tasks 8–10)
  src/components/home/HomeStory.tsx      stacked markup + pinned stage engine (Task 7)
  src/components/home/scenes/*.tsx       Opening, ManoPadana, Revive, Lunelle, Drift (Tasks 8–10)
  src/components/collections/*.tsx      CollectionIndex, FollowFrame, FocusRail, Seasons (Task 11)
  src/components/collection/*.tsx       Hero, InMyWords, Shoot, SectionSwitch, NextCollection (Task 12)
  src/components/collection/reader.ts    readerPages, zoomOffset, loupe (Task 13)
  src/components/collection/PageReader.tsx, ZoomView.tsx (Task 13)
  src/components/about/*.tsx             AboutOpening, AboutMe, InspirationFrames, PatternMat (Tasks 14–15)
  src/components/about/pieces.ts, fit.ts pattern geometry, text fitting (Task 15)
  scripts/browser/*.test.mjs             Edge checks against out/ (Task 17)
Removed: src/app/work/, components Chapter, StudioTable, PortfolioReader, sections/Hero, Manifesto, Person (replaced).
```

---

### Task 1: Content model in her voice

**Files:**
- Modify: `site/content/site.json`, `site/content/collections/{mano-padana,revive,lunelle,drift}.json`, `site/src/lib/collections.ts`
- Create: `site/src/lib/site.ts`, `site/src/lib/site.test.ts`
- Test: `site/src/lib/collections.test.ts`

**Interfaces:**
- Produces: `getSite(): Site`, `parseSite(raw: unknown): Site` with
  `Site { name; role: 'Fashion designer'; location: 'Panadura, Sri Lanka'; tagline; manifesto; bio: string; facts: { label: string; title: string; detail: string }[]; links: { linkedin: string }; skills: { name: 'Craft'|'Design'|'Tools'|'People'; piece: 'bodice'|'skirt'|'sleeve'|'pocket'; cut: string; skills: string[] }[]; portrait: { figure: string; polaroids: string[] }; personalAlt: Record<string,string>; contact: { endpointEnv: string; closing: string } }`
- Produces on `Collection`: `line: string; theme: 'Mind'|'Renewal'|'Body'|'Nature'; lead: { from: 'shoot'|'pages'; desktop: number[]; phone: number }; looks?: { n: number; shots: [number, number]; text: string }[]` (numbers are media `order`s).

- [ ] **Step 1: Write the failing tests**

`site.test.ts`:
```ts
import { parseSite, getSite } from './site'
test('site.json is first person and complete', () => {
  const s = getSite()
  expect(s.role).toBe('Fashion designer')
  expect(s.bio.startsWith('I’m a fashion designer from Panadura, Sri Lanka')).toBe(true)
  expect(s.contact.closing).toBe('Let’s make something together.')
  expect(s.facts.map((f) => f.label)).toEqual(['Studying', 'Experience', 'Recognition'])
  expect(s.skills.map((g) => [g.name, g.piece, g.skills.length])).toEqual([['Craft', 'bodice', 4], ['Design', 'skirt', 4], ['Tools', 'sleeve', 4], ['People', 'pocket', 4]])
  expect(s.portrait).toEqual({ figure: 'her-flush', polaroids: ['mirror-graded', 'chair-graded', 'beach-graded'] })
})
test('rejects a bio in the third person and contact details', () => {
  const s = structuredClone(getSite())
  expect(() => parseSite({ ...s, bio: 'Linali Andrea is a designer.' })).toThrow('bio must be first person')
  expect(() => parseSite({ ...s, bio: s.bio + ' Call +94 76 903 6230.' })).toThrow('no phone numbers or emails')
})
```
`collections.test.ts` (add):
```ts
test('journey order, lines, themes, leads', () => {
  expect(getCollections().map((c) => [c.slug, c.theme])).toEqual([['mano-padana', 'Mind'], ['revive', 'Renewal'], ['lunelle', 'Body'], ['drift', 'Nature']])
  expect(getCollection('drift')!.lead).toEqual({ from: 'shoot', desktop: [13, 14, 7, 3], phone: 17 })
  expect(getCollection('revive')!.lead).toEqual({ from: 'pages', desktop: [30], phone: 34 })
  expect(getCollection('drift')!.looks!.map((l) => l.shots)).toEqual([[7, 8], [3, 4], [11, 12], [1, 2], [6, 5], [9, 10]])
  expect(getCollections().every((c) => c.rights.models && c.rights.confirmedBy === 'user, 2026-11-24, chat')).toBe(true)
})
test('a lead number must exist in the collection media', () => {
  // extend the file's existing `valid` fixture with line: 'A line.', theme: 'Nature', lead: { from: 'shoot', desktop: [1], phone: 1 }
  expect(() => parseCollection({ ...valid, lead: { from: 'shoot', desktop: [99], phone: 1 } }, 'x.json', { shoot: [1, 2], pages: [] })).toThrow('lead 99 is not in shoot')
})
```

- [ ] **Step 2: Run `cd site && npx vitest run src/lib` and see both files fail** (missing module / missing fields).

- [ ] **Step 3: Write the data.** `site.json`: role, location, tagline `"Fashion designer · Sri Lanka"`, bio and facts verbatim from spec 11, `links.linkedin`, skills groups from spec 8 with cuts `"Cut 1 on fold"`, `"Cut 2"`, `"Cut 2 · mirror"`, `"Cut 1 · fold at top"`, `portrait`, `personalAlt['her-flush']` = the balcony-sticker alt text, closing. Remove `bio.draft`, `person`, `hero`, `themes`. Collections: `order` 1–4 in journey order, `line`/`theme` from spec 11, `lead` (spec 9), Drift `looks` with spec 11 texts, rights `{ models: true, confirmedBy: 'user, 2026-11-24, chat' }`. Set `featured: true` on all four.

- [ ] **Step 4: Implement `parseSite` / `getSite` in `site.ts`** (same style as `parseCollection`: `fail(msg)` with the file name). First person = bio starts with `I` and contains no `Linali Andrea is`/` she `; reject `/\+?\d[\d\s-]{7,}|@/` in bio and facts. Extend `parseCollection(raw, file, mediaOrders?)` to validate `line`, `theme`, `lead` (and, when `mediaOrders` is given, that every lead number exists); `getCollections()` passes orders from `getMedia`.

- [ ] **Step 5: Run `npx vitest run src/lib`**, expect PASS. Fix any other test that read removed fields (`Person`, `Hero` still compile until Task 7/14 replaces them: keep their imports working by leaving `personalAlt` and reading `portrait` where they read `person`).

- [ ] **Step 6: Commit** `feat(content): first-person site data, journey order, leads and Drift looks`.

### Task 2: Media for the new design

**Files:**
- Create: `tools/media/flush.mjs` (writes `media-src/personal/her-flush.png`, `media-src/personal/face.jpg`)
- Modify: `site/scripts/media/lib.mjs`, `site/scripts/media/build.mjs`, `site/src/lib/media.ts`
- Test: `site/scripts/media/lib.test.mjs`

**Interfaces:**
- Produces in `lib.mjs`: `enhance(sharpInstance) → sharpInstance` (the spec 9 recipe), `recolor(file, hex) → Buffer` (PNG: alpha kept, RGB filled), `silhouette(file, hex) → Buffer` (alpha from darkness, filled, trimmed), `buildInspiration({ srcRoot, outRoot, urlPrefix }) → MediaImage[]` (filename order, `inspiration/1…7`, widths 640/1280).
- Produces in the manifest/`media.ts`: `getInspiration(): MediaImage[]`; `getBrand(): { monogram; monogramCream; driftLogoBrown; driftLogoCream }`; personal gains `her-flush`, `face`.

- [ ] **Step 1: Write the failing tests** in `lib.test.mjs`:
```js
test('enhance keeps size and strips metadata', async () => {
  const out = await enhance(sharp(path.join(tmpRoot, 'src/t/shoot/01-a.jpg'))).jpeg().toBuffer()
  const m = await sharp(out).metadata()
  expect([m.width, m.height]).toEqual([1200, 1800]); expect(m.exif).toBeUndefined()
})
test('recolor fills every visible pixel with the colour and keeps alpha', async () => {
  const px = await sharp(await recolor(logoFixture, '#F2E8DA')).raw().toBuffer()
  expect([...px.subarray(0, 4)]).toEqual([0xf2, 0xe8, 0xda, 255])
})
test('silhouette makes dark strokes opaque brown and white paper transparent', async () => { /* fixture: black stroke on white */ })
test('inspiration is built in filename order as 1…n', async () => {
  const list = await buildInspiration(fxInspiration)
  expect(list.map((i) => i.id)).toEqual(['1', '2']); expect(list[0].srcset.webp).toMatch('/media/inspiration/1-640.webp')
})
```
- [ ] **Step 2: Run `npx vitest run --project node`**, see the four fail.
- [ ] **Step 3: Implement** the four functions; apply `enhance` in `load()` for `shoot`, `personal` and inspiration only (never pages, logos, cut-outs). `build.mjs --all` adds `manifest.inspiration` and the brand variants: `monogramCream` = recolor(`brand/monogram.png`, `#F2E8DA`), `driftLogoBrown` = silhouette(`collections/drift/logo.png`, `#3B2418`), `driftLogoCream` = recolor of that silhouette with `#F7F0E6`.
- [ ] **Step 4: Write `tools/media/flush.mjs`** from the spec 9 recipe (reuse `tools/media/cutout.mjs` for background removal and the `clean`/largest-blob logic of `tools/media/treat.mjs`; skip `sticker`; zero alpha for x < 455px and y > 2300px of the trimmed cut to drop the strap; face = square crop of `chair-graded.jpg` centred (0.58, 0.44), side 0.36 × width, 480px). Run it once: `node tools/media/flush.mjs`.
- [ ] **Step 5: Run tests (PASS), then `cd site && npm run media -- --all` in the background (~15 min)** and confirm the manifest has `inspiration` (7), `personal['her-flush']`, `brand.driftLogoCream`.
- [ ] **Step 6: Commit** (manifest + public/media + code; never media-src) `feat(media): enhancement, inspiration, flush cut-out, brand variants`.

### Task 3: Type and tokens

**Files:** Modify `site/src/app/layout.tsx`, `site/src/app/globals.css`; Test: `site/scripts/build/output.test.mjs`

- [ ] **Step 1: Failing build test**: `index.html` contains the CSS variables `--font-gloock`, `--font-hanken`, `--font-dm-mono`, `--font-special-elite`, `--font-noto-sinhala`, and does not contain `Bodoni`.
- [ ] **Step 2: Run `npm run test:build`**, see it fail.
- [ ] **Step 3: Implement.** `layout.tsx`: `Gloock({ weight: '400' })`, `Hanken_Grotesk({ weight: ['400','500'] })`, `DM_Mono({ weight: ['400','500'] })`, `Special_Elite({ weight: '400' })`, `Noto_Serif_Sinhala`; metadata title `"Linali Andrea · Fashion designer"`, description = tagline. `globals.css`: add tokens `--night #21150F`, `--blush #E8C4C0`, `--muted #5A4436`, `--mat #E6DBC9`, `--tape #F2E2B8`; utility classes `.label`, `.title-page` (3.6vw), `.title-section` (1.9vw), `.lead`, `.body`, `.narr` with the spec 5.1 sizes and phone clamps; body font Hanken.
- [ ] **Step 4: Run `npm run test:build`**, PASS.
- [ ] **Step 5: Commit** `feat(type): Gloock, Hanken Grotesk, DM Mono, Special Elite; type scale`.

### Task 4: Routes, redirects and the about route

**Files:** Move `site/src/app/work/` → `site/src/app/collections/` (index + `[slug]` keep Phase 1 content for now); Create `site/public/_redirects`, `site/src/app/about/page.tsx` (heading + bio for now); Modify `site/scripts/build/output.test.mjs`, `.claude/skills/add-collection/SKILL.md`, any `/work` link.

- [ ] **Step 1: Failing build test**: pages list becomes `['index.html','collections/index.html', 'collections/<each slug>/index.html', 'about/index.html']`; `out/_redirects` equals `/work/* /collections/:splat 301\n`; no HTML file contains `href="/work`.
- [ ] **Step 2: Run, see fail. Step 3: Move and create; `PageProps<'/collections/[slug]'>`. Step 4: Run, PASS.**
- [ ] **Step 5: Commit** `feat(routes): /work → /collections with redirects; /about`.

### Task 5: Motion foundation

**Files:** Create `site/src/lib/motion/ease.ts`, `ease.test.ts`, `useMotion.ts`, `useMotion.test.tsx`, `SmoothScroll.tsx`; Modify `site/package.json` (`lenis@1.3.27`), `layout.tsx` (wrap body in `SmoothScroll`).

**Interfaces:**
- `ease.ts`: `clamp01(v)`, `seg(v, a, b)` (= clamp01((v−a)/(b−a))), `lerp(a,b,t)`, `out3`, `out4`, `inOut` (cubic), `back(t, c = 1.4)`, `spring(t)` (= t ≤ 0 ? 0 : 1 − e^(−5.5t)·cos(9t)), `outExpo`.
- `useMotion(): { on: boolean; setOn(v: boolean): void }` — initial `false` on the server; on mount `localStorage['la-motion']` if set, else `!matchMedia('(prefers-reduced-motion: reduce)').matches`; `setOn` writes storage and dispatches `window` event `la-motion`.
- `<SmoothScroll>`: Lenis `{ lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075 }` only while `on`; `gsap.ticker` drives `lenis.raf`; `ScrollTrigger.update` on scroll; destroyed when motion turns off. Exposes `useLenis()` for scenes that slow it (Drift: `lerp 0.07`, wheel multiplier 0.65).

- [ ] **Step 1: Failing tests**: `inOut(0.5) === 0.5`; `out3(1) === 1`; `back(0.8) > 1`; `spring(0) === 0`; `|spring(2) − 1| < 0.01`; `seg(5, 0, 10) === 0.5`. `useMotion`: reduced-motion media → `on === false`; storage `'on'` overrides reduced motion; `setOn(false)` persists `'off'` and a second hook instance updates.
- [ ] **Step 2: Run, fail. Step 3: Implement. Step 4: Run, PASS.**
- [ ] **Step 5: Commit** `feat(motion): easing, motion preference, Lenis smooth scroll`.

### Task 6: Header, phone menu and contact card

**Files:** Create `site/src/components/header/header.ts`, `header.test.ts`, `SiteHeader.tsx`, `SiteHeader.module.css`, `SiteHeader.test.tsx`, `PhoneMenu.tsx`, `site/src/components/Footer.tsx` (+ module.css, test); Remove `sections/Footer.tsx` usages; mount header in `layout.tsx`.

**Interfaces:**
- `fabricPath(w: number, h: number, inset: number, amp: number, phase: number): string` (mockup `LANav` → `fabric`).
- `nextHidden(prev: boolean, s: { y: number; v: number; docked: boolean; keep?: number }): boolean` — `!docked || y < (keep ?? 160)` → false; `v > 140` → true; `v < −50` → false; else `prev`.
- `stitchDash(sewn: number, n = 120): string` — `''+n` stitches `'.5 .3333'` repeated `round(sewn·n)` times then `'0 100'`; full → `'.5 .3333'`.
- `<SiteHeader chapters={string[]} chapter={number} dock={number} dark={boolean} active?: 'Collections'|'About' />` with `x0` left alignment when `dock < 1`. Pages set chapter/dock/dark through a small context `HeaderContext` (`useHeader().set({ chapter, dock, dark })`).
- `<Footer variant: 'flow' | 'rise' />` — `'flow'` is a normal block after `<main>` (can never cover content); `'rise'` is used by the home stage.

- [ ] **Step 1: Failing tests** (`header.test.ts`): `fabricPath(200, 40, 0, 0, 0)` starts with `M20.0 0.00`, contains two ` A` arcs and ends with `Z`; `nextHidden` table: `(false,{y:900,v:200,docked:true})→true`, `(true,{y:900,v:-80,docked:true})→false`, `(true,{y:100,v:200,docked:true})→false`, `(true,{y:900,v:10,docked:true})→true`; `stitchDash(1)` === `'.5 .3333'`. (`SiteHeader.test.tsx`): links Collections/About/Contact with Contact `href="#contact"`; the Motion button toggles `aria-pressed` and calls `setOn`; on a 390px viewport mock the Menu button opens a `<dialog>` with the three links, LinkedIn and the motion switch, Esc closes it and focus returns to Menu. (`Footer.test.tsx`): heading text `Let’s make something together.`; form fields Name, Email, Message.
- [ ] **Step 2: Run, fail. Step 3: Implement** per spec 5.3 (rendering the SVG fill + stitch path, the chapter roll as stacked spans translated by `−index·18px`, night colours, `mono-cream`, magnetic pull ≤ 6px under `(hover:hover) and (pointer:fine)`, the phone menu through `useDialog`). The pill is static and centred without JS. **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** `feat(header): sewn fabric pill, chapter roll, headroom, phone menu; contact card`.

### Task 7: Home story engine (stacked markup + pinned stage)

**Files:** Create `site/src/components/home/timeline.ts`, `timeline.test.ts`, `story.ts`, `HomeStory.tsx`, `HomeStory.module.css`; Modify `site/src/app/page.tsx`, `page.test.tsx`; Remove `components/Chapter*`, `sections/Hero.tsx`, `sections/Manifesto.tsx`, `StudioTable.tsx`.

**Interfaces:**
- `HOME_SCENES: readonly [name: SceneName, units: number, steps?: number][]` = op 300, manif 500, open 700, mp 1380 ×4, tear 420, rv 1020 ×3, rise 600, ln 1680 ×5, foam 420, dIn 480, strip 5400, foot 600.
- `sceneRanges(viewportH: number): { total: number; at: Record<SceneName, [number, number]>; steps: Partial<Record<SceneName, [number, number][]>> }` — units × `viewportH / 900`.
- `stepState(y: number, segs: [number, number][]): { index: number; k: number; within: number }` — `k = clamp01((y − a) / ((b − a) · 0.3))`; after the last segment, the last index.
- `story.ts`: `MP`, `RV`, `LN`, `SP` sentence arrays and `MANIFEST` exactly as the mockup's constants; Revive board/pile page numbers (30/34); Lunelle step pairs `[[1,2],[9,8],[4,3],[5,7],[10,6]]`; Drift strip sequences `DESK_STRIP` and `PHONE_STRIP` (as the mockup's `DSTRIP`/`PSTRIP`, using shoot orders and `inspiration` 6).
- `<HomeStory>` renders every scene as a `<section id>` in order `top, mano-padana, revive, lunelle, drift`; with motion on it adds `data-stage` to its root, pins it for `total` px with ScrollTrigger, and calls each scene's `paint(progress)` from one `onUpdate(y)`; a `ResizeObserver` recomputes ranges and maps the old position to the same scene fraction.
- Scene modules export `paint(y: number, r: ReturnType<typeof sceneRanges>, ctx: { phone: boolean; W: number; H: number; dt: number; now: number }): void` and own their DOM refs.

- [ ] **Step 1: Failing tests**: `sceneRanges(900).total === 13500`; `at.mp` = `[1500, 2880]`; `steps.ln` has 5 entries of 336; `sceneRanges(1800).at.strip[1] - at.strip[0] === 10800`; `stepState(1500, steps.mp).k === 0`, at `1500 + 345·0.3` → `k === 1`, at 99999 → index 3. `page.test.tsx`: section ids `['top','mano-padana','revive','lunelle','drift']` then `contact`; every `MP`/`RV`/`LN`/`SP` sentence and every look text is in the static HTML; no `opacity:0`/`visibility:hidden`.
- [ ] **Step 2: Run, fail. Step 3: Implement** the stacked layout (each scene readable on its own: title, sentences, photos) and the engine. The home header chapter = index of the scene containing `y` (`op/manif/open → 0`, `mp → 1`, `tear, rv → 2`, `rise, ln → 3`, `foam, dIn, strip → 4`, `foot → 5`); dock = `inOut(seg(y, at.open[0] − 100·s, at.open[0] + 300·s))`; dark per spec 5.3. **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** `feat(home): story engine, scene table, stacked fallback`.

### Task 8: Home: opening, window, Mano Padana, tear, Revive

**Files:** Create `site/src/components/home/geometry.ts`, `geometry.test.ts`, `scenes/Opening.tsx`, `scenes/ManoPadana.tsx`, `scenes/Revive.tsx` (+ module.css each).

**Interfaces:** `windowRects(W: number, H: number, phone: boolean): { A; B; C }` (percent rects `[x, y, w, h]`; desktop `w = 86·H/W·0.667`, `A.w = 30·H/W·0.667`, `C.x = min(58, 96 − w)`); `tearPolygon(progress: number): string` (CSS `polygon(...)` from the mockup's `tearEdge`, edge y = lerp(103, −12, progress)); `jagSplit(): { left: string; right: string; stitches: [x, y][] }` (mockup `jag`/`leftPoly`/`rightPoly`); `mpGround(step: number, k: number): [r, g, b]` over `[[31,30,28],[94,89,83],[242,232,218],[59,36,24]]`; `inkFor(rgb): '#3B2418' | '#F2E8DA'` (luminance > .3 → brown).

- [ ] **Step 1: Failing tests**: `windowRects(1600, 900, false).B` ≈ `[33.87, 7, 32.26, 86]` (±0.01); at 1024×768, `B[2]` ≈ 43.0 (photo keeps 2:3); `tearPolygon(0)` contains `103`; `jagSplit().stitches.length === 19`; `inkFor([31,30,28]) === '#F2E8DA'`, `inkFor([242,232,218]) === '#3B2418'`.
- [ ] **Step 2: Run, fail. Step 3: Implement** geometry and the three scenes per spec 6.1–6.3 (values: figure flush positions; manifesto 18% → 100% ink over `manif[0]…manif[0]+350`; moodboard column speeds `1.2 + i·0.4` %/s alternating; window A→B→C; Mano Padana photo reveal; tear lift −8% / −1.6°; Revive scale 1.08 → 1; board join and 19 cross-stitches; phone board `0.427·H` tall panning; pile). The manifesto uses SplitText only on the client; the server HTML is the plain sentence. **Step 4: Run, PASS.** Then `impeccable motion-capture` of `/` from scroll 0 to 4500 at 1440×900 and 390×844; compare with the mockup "Home" tab at the same positions.
- [ ] **Step 5: Commit** `feat(home): her opening, window into Mano Padana, tear into Revive`.

### Task 9: Home: moonrise and Lunelle

**Files:** Create `site/src/components/home/scenes/Lunelle.tsx` (+css); Modify `geometry.ts`, `geometry.test.ts`.

**Interfaces:** `litPath(phase: number): string` (mockup `litPath`), `lunelleMain(W, H, phone): [x, y, w, h]` (desktop `w = 100·H/W·0.667`, `x = 100 − w`; phone `[0,0,100,64]`), `moonRise(p: number): { y: number; r: number }` (`y = lerp(150, 50, out3(seg(p,.1,.65)))`, `r = lerp(17, 120, inOut(seg(p,.6,1)))`).

- [ ] **Step 1: Failing tests**: `litPath(0.5)` contains `A0.00 9`; `lunelleMain(1600,900,false)` ≈ `[62.5,0,37.5,100]`; `moonRise(1).r === 120`.
- [ ] **Step 2–4:** implement spec 6.4 (night overlay on Revive, scale 0.9, ring, disc waxing, circle reveals, second photo per step, phone lunar contact sheet with five phases `[.18,.34,.5,.72,.999]`, text at `64% + 20px`); run; motion-capture 4500–8100.
- [ ] **Step 5: Commit** `feat(home): moonrise into Lunelle`.

### Task 10: Home: foam, Drift opening and strip

**Files:** Create `site/src/components/home/scenes/Drift.tsx` (+css); Modify `geometry.ts`, `geometry.test.ts`.

**Interfaces:** `stripItems(seq, sizes): { start; size; id }[]` and `stripX(progress, stripLen, W)` (= progress·(stripLen − W)); `skew(vel) = clamp(vel·6, −0.6, 0.6)`; `penMask(p): string` = `linear-gradient(104deg, #000 ${pen−14}%, transparent ${pen}%)` with `pen = lerp(−14, 114, out3(seg(p,.04,.46)))`.

- [ ] **Step 1: Failing tests**: `skew(1) === 0.6`; `penMask(0)` contains `-28%`; `stripX(1, 5000, 1600) === 3400`.
- [ ] **Step 2–4:** implement spec 6.5 (foam ellipse wash, Drift logo write-on in brown desktop/cream phone, lead shrinking into the first card, strip panels in Special Elite, look panels in client order, stitch line, phone captions and six-look index; Lenis lerp 0.07 and wheel ×0.65 while in `dIn…strip`; contact card `rise` over `foot`); run; motion-capture 8100–13500; check the strip at 1024×768 and 768×1024.
- [ ] **Step 5: Commit** `feat(home): foam into Drift, logo write-on, the film strip`.

### Task 11: Collections index

**Files:** Replace `site/src/app/collections/page.tsx`; Create `site/src/components/collections/{CollectionIndex,FollowFrame,FocusRail,Seasons}.tsx` (+css), `rail.ts`, `rail.test.ts`, `CollectionIndex.test.tsx`.

**Interfaces:** `railLayout(u: number, n: number, compact: number, expanded: number, top: number): { top: number; height: number; f: number }[]` (`f_i = inOut(clamp01(1 − |u − i|))`, `top_0 = top − compact·u`, heights `compact + (expanded − compact)·f`); `swing(t: number): number` (= t < 0 ? 0 : 16·e^(−2.6t)·cos(7t) degrees).

- [ ] **Step 1: Failing tests**: `railLayout(0,4,92,566,210)[0].f === 1` and `[1].f === 0`; at `u = 1.5`, rows 1 and 2 have `f === 0.5`; `swing(0) === 16`. Component: four rows in journey order, each with number, name, `SS25 · Mind · මනෝ පාදන` style meta, her line, count text (`6 photographs · 10 pages`, `Portfolio · 4 spreads`, `10 photographs · 22 pages`, `17 photographs · 8 spreads`, computed from the manifest), and a link to `/collections/<slug>/`; heading `Four collections, in the order of my journey.`; Seasons lists SS25 Mano Padana, AW26 Lunelle, SS27 Revive + Drift.
- [ ] **Step 2–4:** implement spec 7.1 (desktop grid + hover: dim 34%, tint, stitch, arrow fill, 17vw frame following at lerp .12 with tilt ≤7°/skew ≤5°, three-photo cycle 1.15s, film roll between rows; click → View Transition; phone focus rail with morphing thumbnail; tablets 600–1023 side-by-side open row; seasons thread with damped swing). View Transitions: `@view-transition { navigation: auto }` in `globals.css` and `view-transition-name: collection-photo` on the frame image and the detail hero's first image. Run; screenshots at the five viewports.
- [ ] **Step 5: Commit** `feat(collections): editorial index, follow frame, focus rail, seasons thread`.

### Task 12: Collection page: hero, words, shoot, switch, next

**Files:** Replace `site/src/app/collections/[slug]/page.tsx`; Create `site/src/components/collection/{Hero,InMyWords,Shoot,SectionSwitch,NextCollection}.tsx` (+css), `CollectionPage.test.tsx`; Modify `ShootGallery.tsx` (props `caption?: boolean` shows the front photo's `NN / NN` + alt; `pinned?: boolean`), `ShootGallery.test.tsx`.

**Interfaces:** `splitConcept(text: string): [string, string]` (sentences split at `. ! ?` before a capital or `“`, first half ⌈n/2⌉ sentences); `nextSlug(slug): string` (journey order, wraps to `mano-padana`).

- [ ] **Step 1: Failing tests**: `splitConcept` of Drift's concept returns two paragraphs whose join equals the concept; `nextSlug('drift') === 'mano-padana'`. Page: Drift has sections `hero, words, shoot, portfolio, next` and the hero buttons `The shoot · 17` and `The portfolio · 8`; Revive has no `#shoot` and no Shoot/Portfolio switch; the words section text is static (no `.w` word spans); next-collection label after Drift is `Back to the start of the journey`.
- [ ] **Step 2–4:** implement spec 7.2 items 1–3, 5–7 (hero filmstrip of `lead` photos at full height uncropped drifting left, radial shade, 3.6vw title; In my words grid with the rolling two-column film; ShootGallery restyled: ring default with pause, grid uncropped CSS columns with clip reveal, viewer opens from the clicked photo and is uncropped, ring rotation follows scroll while pinned for 1.1 screens; floating switch visible from the shoot to the next section; next link). Contact card `flow`. Run; screenshots.
- [ ] **Step 5: Commit** `feat(collection): hero, in my words, shoot, section switch, next`.

### Task 13: Collection page: the page reader and zoom

**Files:** Create `site/src/components/collection/reader.ts`, `reader.test.ts`, `PageReader.tsx`, `ZoomView.tsx` (+css), `PageReader.test.tsx`; Remove `PortfolioReader*`.

**Interfaces:**
- `readerPages(pages: MediaImage[], narrow: boolean): { image: MediaImage; half: -1 | 0 | 1; ar: number }[]` — spreads (`w/h > 2`) become two halves only when `narrow`.
- `zoomOffset(v: { W: number; H: number; w: number; h: number; mx: number; my: number }): { x: number; y: number }` — centred when the scaled page is smaller than the viewport on an axis, else `(W − w)·mx`, `(H − h)·my` with `mx,my` clamped to 0…1.
- `loupeStyle(rx: number, ry: number, w: number, h: number, zoom = 3, size = 220): { backgroundSize: string; backgroundPosition: string }`.
- `<PageReader pages pageText title narrow />`, `<ZoomView page half onClose onTurn />` (a `<dialog>` through `useDialog`).

- [ ] **Step 1: Failing tests**: Drift (8 spreads) narrow → 16 entries alternating halves 0/1, wide → 8; Lunelle (22 singles) narrow → 22; `zoomOffset({W:1000,H:800,w:500,h:400,mx:.3,my:.3})` → `{x:250,y:200}`; `mx: 0 → x 0`, `mx: 1 → x W − w`. Component: Next tips the front page (class `turning`) and the counter reads `Spread 02 / 08` (phone `Page 02 / 16`); Previous disabled on the first page; "Read the text" enabled only on Drift p04 and opens a drawer with that text; Enter on a page opens zoom at 250%, `+` → 350%, `−` floors at 100%, Esc closes and focus returns to the page; arrow keys turn pages inside zoom; without JS the server HTML lists every page image.
- [ ] **Step 2–4:** implement spec 7.2 item 4 (stack offsets −3.2% / 0.965, tip-forward turn 0.75s about the bottom edge to −88°, desktop round arrows beside the page and counter in the heading, rail, loupe 220px at 3×, zoom 1–5× with mouse pan / touch drag, 4800px files where the manifest `zoom` is larger). Use the vendored Tumble Deck's `fallAngle` for the tip curve. Run; screenshots and a motion-capture of a turn.
- [ ] **Step 5: Commit** `feat(collection): inline page reader with loupe, zoom and page text`.

### Task 14: About: opening and About me

**Files:** Replace `site/src/app/about/page.tsx`; Create `site/src/components/about/{AboutOpening,AboutMe,InspirationFrames}.tsx` (+css), `About.test.tsx`; Remove `sections/Person.tsx`.

**Interfaces:** `frameImage(f: number, t: number, n: number, period = 3.2, stagger = 0.6): { cur: number; prev: number; k: number }` (`k` progress of the wipe in the first 0.9s; `cur = (2f + 3·floor((t − f·stagger)/period)) mod n`).

- [ ] **Step 1: Failing tests**: `frameImage(0, 0, 7).cur === 0`, `frameImage(1, 0.6, 7).cur === 2`; page shows `About`, `Linali Andrea`, `Fashion designer · Panadura, Sri Lanka`, the quoted manifesto, the bio paragraph, three facts, a LinkedIn link with `rel="noopener"`, label `My inspiration` with 7 images in the HTML, and no text matching `/draft/i`, a phone number or an email address.
- [ ] **Step 2–4:** implement spec 8 items 1–2 (flush cut-out, three polaroids with spring drop and depth parallax, desktop-only small inspiration photos, About me grid, inspiration frames: 5 desktop / 2 phone). Run; screenshots.
- [ ] **Step 5: Commit** `feat(about): opening collage, about me, my inspiration`.

### Task 15: About: skills as pattern pieces

**Files:** Create `site/src/components/about/pieces.ts`, `fit.ts`, `fit.test.ts`, `PatternMat.tsx`, `PatternMat.module.css`, `PatternMat.test.tsx`.

**Interfaces:**
- `PIECES: Record<'bodice'|'skirt'|'sleeve'|'pocket', { d: string; fold?: string; cap: [number, number]; box: [number, number]; cutAt: CSSProperties; height: number }>` — paths, fold lines and caption tops from the mockup's `PIECES`; content boxes (left/right % insets) bodice `[6, 26]`, skirt `[20, 20]`, sleeve `[16, 16]`, pocket `[10, 10]`; heights 290 / 300 / 270 / 230 px.
- `fitFontSize(overflows: (px: number) => boolean, start = 15, min = 12, step = 0.5): number`.

- [ ] **Step 1: Failing tests**: `fitFontSize(() => false) === 15`; `fitFontSize((px) => px > 13) === 13`; `fitFontSize(() => true) === 12`. Component: four figures in order Craft/Design/Tools/People with their cut text and exactly the spec 8 skills, one `<li>` each, all centred (`text-align: center`); heading `What I work with`; hint `Laid out like pattern pieces on my cutting mat.`; tape reads `16 skills`; pieces carry no inline `opacity:0`.
- [ ] **Step 2–4:** implement spec 8 item 3 (mat grid and ruler, `repeat(auto-fill, minmax(210px, 1fr))`, tilts −2.2/1.6/−1.2/2° and offsets 0/22/8/30px on desktop, half tilt on phone, alternate alignment on phones/tablets, spring drop with 0.16s stagger when the mat enters, seam allowance draw then `.007 .005` dashes, hover lift 6px and straighten, `fitFontSize` measured against the cut marking on mount and on resize). Run; screenshots at 1100, 1300 and 1900px windows and 390×844.
- [ ] **Step 5: Commit** `feat(about): skills as pattern pieces on a cutting mat`.

### Task 16: Docs

**Files:** Modify `DESIGN.md`, `PRODUCT.md`, `PLAN.md`, `docs/START-HERE.md`, `docs/prompts/phase-2-immersive.md`, `docs/review/landonorris-motion-study.md`, `.claude/skills/add-collection/SKILL.md`, `docs/ASSETS.md`.

- [ ] **Step 1:** `grep -rn "something slow\|/work\|Bodoni\|Courier Prime\|Junior" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out .` (excluding `docs/superpowers/plans/2026-11-23-*`) lists every place to change.
- [ ] **Step 2:** Update: DESIGN.md (spec 5.1–5.3 type, colours, header, the withdrawn eyebrow/number rule, new components: SiteHeader, PageReader, PatternMat, InspirationFrames; footer copy); PRODUCT.md (CV on hand, facts from it, routes, first-person voice, no phone/email/referees); PLAN.md and START-HERE.md (Phase 2 as built, how to run); add-collection skill (routes, new JSON fields `line`, `theme`, `lead`); ASSETS.md (new assets).
- [ ] **Step 3:** Re-run the grep; only historical Phase 1 plan lines remain.
- [ ] **Step 4: Commit** `docs: Phase 2 design system, product facts, routes, closing line`.

### Task 17: Browser checks and the release gate

**Files:** Create `site/scripts/browser/site.test.mjs`; Modify `site/vitest.config.ts` (project `browser`, include `scripts/browser/**/*.test.mjs`, timeout 120s), `site/package.json` (script `"test:browser": "next build && vitest run --project browser"`, devDependency `playwright-core@1.65.1`).

- [ ] **Step 1: Write the checks** (serve `out/` on a free port with `node:http`; launch `chromium` with `channel: 'msedge'`):
  - for `/`, `/collections/`, `/collections/drift/`, `/collections/revive/`, `/about/` at 320×640, 390×844, 768×1024, 1024×768, 1440×900: `document.documentElement.scrollWidth <= innerWidth`; no page errors; no 4xx responses.
  - JS disabled (`javaScriptEnabled: false`): every page shows its headings, all Drift look texts on `/`, every shoot `<img>` on `/collections/drift/`.
  - Reduced motion (`reducedMotion: 'reduce'`): no element has a running transform animation after 2s; no `[data-stage]` on `/`.
  - 390×844 `/about/` and `/collections/drift/`: scrolled to the bottom, the footer's top is ≥ the last section's bottom (the contact card never covers content).
  - 390×844 `/about/`: every pattern piece's list bottom is above its cut marking; computed font size ≥ 12px.
- [ ] **Step 2: Run `npm run test:browser`**; fix until PASS.
- [ ] **Step 3: Release gate:** `npm test`, `npm run test:build`, `npm run test:browser` green; `impeccable shot` of every route at `1440x900,1024x768,768x1024,390x844,320x640 --full`; `impeccable motion-capture` of each home scene, the collections hover, a page turn and the pattern pieces; score with PLAN.md 5b (average ≥ 8, nothing < 7) and record scores in `docs/review/phase-2-scores.md`.
- [ ] **Step 4: Commit** `test: browser checks and Phase 2 review scores`. Then stop and ask the user before merging (superpowers:finishing-a-development-branch).
