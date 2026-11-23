# Prompt: Phase 3, Polish, accessibility, SEO and release checks

Open this folder in Claude Code, start a **new session**, and paste everything below the line. Run this after Phase 2 is merged to `main`.

---

You are continuing the portfolio site for Linali Andrea. Phases 1 (static site) and 2 (motion) are merged to `main`. Phase 3 makes it ready to ship: it fixes the known minor issues, proves the critical flows in a real browser, and adds what search engines and link previews need. Nothing here changes the design direction.

## Read first
`CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`, the top block of `PLAN.md`, `docs/ASSETS.md`, and the Phase 1 and Phase 2 plans in `docs/superpowers/plans/`.

## How to work
Create a branch `phase-3-polish` from `main`. Plan with `superpowers:writing-plans` (save to `docs/superpowers/plans/<date>-phase-3-polish.md`), **show me and wait for my OK**, then run `superpowers:executing-plans` with `superpowers:test-driven-development`. Finish with `superpowers:finishing-a-development-branch` and ask before merging.

## 1. Known issues from the Phase 1 review (fix each with a failing test first)
1. **Reader zoom panel**:
   - Add a "Back to the pages" button.
   - Make the panel focusable (`tabIndex={0}`, `aria-label`) and move focus into it, so keyboard users can scroll the large image.
   - Do the same focus move for the "Read the text" panel.
2. **Counters** (`NN / NN`) in the photo viewer and the reader get `aria-live="polite"`.
3. **The Mano Padana walk** `<ol>` gets `tabIndex={0}` and a label, so it is keyboard-scrollable in Safari. Skip this if Phase 2's pinned walk already handles it.
4. **Single-page collections** (Lunelle, Mano Padana) say "page", not "spread". Spreads say "spread".
5. **Closing a reader that opened on its own** (`/collections/<slug>/`) returns focus to the "Open the portfolio" button, not `<body>`.
6. **Contact form**: after a successful send, focus and announce the thank-you (`role="status"`).
7. **Media build input checks**:
   - Error on `.heic`, `.tif`, `.avif` sources ("convert to JPG/PNG first") instead of skipping them silently.
   - `--all` ignores anything in `media-src/collections` that isn't a folder.
   - Whitespace-only alt text counts as missing.
8. **Collection file checks**:
   - `slug` must match the file name.
   - Every studio folder page id must exist in the media.
   - `wheel` and `panorama` carousel presets are either supported or rejected, never silently mapped to `cylinder`.
9. **Skills list**: give `site.json` a `skillsDraft: true` flag, shown the same way as the bio draft marker.
10. **`/collections` images** get `width`/`height` (no layout shift). The footer year is computed in the browser, or stated as the build year on purpose.

## 2. Real-browser tests (Playwright)
- Add `@playwright/test` with Chromium. Run it against the static export (`site/out`, served on a local port), as `npm run test:e2e`.
- **Required specs:**
  - **(a)** The deck turns a page with motion on: the card lands flat and the counter advances. Phase 1 had a freeze bug here.
  - **(b)** The photo viewer and the reader close with Esc **and** with a native `dialog.close()` (Android back): scroll unlocks and they reopen.
  - **(c)** With JavaScript disabled, every shoot photo and every portfolio page link is reachable.
  - **(d)** Reduced motion: no pinning, every section visible.
  - **(e)** Phones at 390 and 320 wide: no horizontal overflow on any route.
  - **(f)** The contact form posts to a stub endpoint and shows the thank-you.

## 3. Accessibility and quality audits
- Run `impeccable audit` and `impeccable critique` on `/`, `/collections/`, `/collections/drift/` and `/about/`. Fix every material finding; justify anything you keep.
- Keyboard-only walkthrough of the whole site. Every control reachable, visible focus, no traps except inside open dialogs.
- Check contrast at every chapter light, including Lunelle (cream on `#21150F`) and the Mano Padana transition.
- **Lighthouse**, mobile profile, on `/` and `/collections/drift/`:
  - Performance ≥ 90
  - Accessibility 100
  - Best practices ≥ 95
  - SEO 100

  Record the numbers.

## 4. Search and sharing
- **Metadata:**
  - A title and description per route. A collection's description is the first sentence of its concept, in her words.
  - `metadataBase`, read from an env var, `NEXT_PUBLIC_SITE_URL`.
- **Open Graph images:** one per collection (its strongest shoot photo, or its logo on paper), plus a site image. Generate them at build time with the existing sharp pipeline. Don't use a runtime image service.
- **Crawling:** `sitemap.xml` and `robots.txt` generated at build.
- **Structured data:** JSON-LD `Person` (name, jobTitle "Womenswear designer", nationality/location only as given in PRODUCT.md). No invented fields.
- **Icons:** favicon and apple-touch icon from the monogram.
- **404 page:** styled, with a link home.

## 5. Release gate
- When `PUBLISH=1` is set, `npm run build` must **fail** if any featured collection has `rights.models` or `rights.photographer` still `false`, or `rights.confirmedBy` empty. Name the collection and the missing consent in the error.
- Plain `npm run build` (development) keeps working.
- This exists because the Lunelle ultrasound images and every model photo are unconfirmed.

## 6. For the client (prepare, don't decide)
- A one-page mock comparing **teal vs a deep Drift indigo** as the accent in the Drift chapter, saved to `docs/review/accent-comparison.html`, with screenshots. The client chooses.
- A list of every draft text (bio, skills, provisional page orders) in `docs/review/for-client-approval.md`.

## Done means
`npm test`, `npm run test:build` and `npm run test:e2e` all green. Lighthouse numbers recorded. Audit findings fixed or justified. Screenshots at 5 widths scored ≥ 8 average. Report in plain language what changed, what you decided on my behalf, and what still needs the client.
