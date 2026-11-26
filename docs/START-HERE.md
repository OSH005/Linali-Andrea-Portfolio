# Start here

A step-by-step guide to taking Linali Andrea's portfolio from where it is now to live.

## Where things stand

| Phase | What | Status |
|---|---|---|
| 0 | Plan, product brief, design system, edited portraits | ✅ Done |
| 1 | The site: every section from data, media pipeline, carousel, page deck, folders, contact form, `/work` pages | ✅ Done, on `main` |
| 2 | **Immersive redesign**: home is one scroll-driven journey (opening, Mano Padana, Revive, Lunelle, Drift, contact); new header; `/collections` index and detail pages with an inline page reader; `/about` with her skills as pattern pieces. Spec: `docs/superpowers/specs/2026-11-24-immersive-redesign-design.md` | ✅ Built on branch `phase-2-immersive`; **not merged** (merge only when the user says so). Before merging: look at it in a browser (`npm run dev`, then a phone width) |
| 3 | Polish, accessibility, real-browser tests, SEO, release gate | `docs/prompts/phase-3-polish.md` |
| 4 | Launch: Cloudflare Pages, form, domain, analytics | `docs/prompts/phase-4-launch.md` |

## Step 1: Look at what's built (5 minutes)
1. Open a terminal in this folder.
2. Install and start the site:
   ```bash
   cd site
   ```
   ```bash
   npm install
   ```
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 (check out the branch first: `git switch phase-2-immersive`). Try:
   - **The home journey.** Scroll from her opening through Mano Padana, Revive, Lunelle and Drift to the contact card. Turn **Motion** off in the header and check that the stacked layout reads.
   - **http://localhost:3000/collections/**: hover a row (desktop), then open a collection.
   - **A collection page.** Switch the shoot between Ring and Grid, click a photo to open it, then turn pages in the portfolio, use the loupe and zoom, and try "Read the text" (Drift page 04 only, for now).
   - **http://localhost:3000/about/**: the skills on the cutting mat.
   - **A phone width** (browser dev tools, 390 px, and 320 px for nothing scrolling sideways).
4. Note anything you dislike. It goes into the Phase 3 session.

Checks (inside `site/`): `npm test` (unit tests), `npm run test:build` (builds the static export and checks every route: `/`, `/collections/`, each `/collections/<slug>/`, `/about/`, the redirects file and every manifest image).

In Claude Code's desktop app you can also start it from the Preview button: `.claude/launch.json` defines it.

## Step 2: Send the client this checklist (today)
These don't block development, but some block **launch**. Copy the list into a message to her.

**Blocks launch:**
- [ ] Written OK from **every model** in the shoots (the user confirmed consent in chat on 2026-11-24; get it in writing). The Lunelle ultrasound image is treated as covered.
- [ ] **Photographer's name**, credit line, and OK to use the photos (the `MMS_` files).
- [ ] OK to publish **Revive** under the **E.L.V. Denim** collaboration name.
- [ ] OK to publish her **personal photos** (the cut-out and three polaroids, edited as collage).
- [ ] Her OK on the **bio, facts and skills** as written (from her CV; the user approved them).
- [ ] A **business email** for the contact form (not her personal one).
- [ ] Her **domain name** (or whether to buy one).

**Makes it much better:**
- [ ] **A version of her CV without the referees' phone numbers and emails**, if she wants a download link (none is offered until then).
- [ ] **Page order** for Mano Padana and Lunelle portfolio pages. The current order is a guess. Does Drift have pages 01–03 and 20–29?
- [ ] **Source text** of her portfolio pages (InDesign/Canva/PDF export), for "Read the text".
- [ ] **SVG files** of her LA monogram and collection logos (Drift, Revive, Lunelle, Mano Padana's Sinhala title).
- [ ] **Her handwriting** (a few lines) and **signature** on white paper, photographed flat. The thread will sign her name with it.
- [ ] **Teal or indigo?** She chooses once she sees the Phase 3 comparison.
- [ ] Optional: a proper **portrait session**. The layout takes new photos without changes.

When files arrive, put them where `docs/ASSETS.md` says (originals into `media-src/…`). Ask Claude Code to rebuild the media.

## Step 3: Phase 2 (immersive redesign): done, review it
Phase 2 was brainstormed through 18 browser mockups, written up as a spec (`docs/superpowers/specs/2026-11-24-immersive-redesign-design.md`, with the final mockup beside it) and built task by task on `phase-2-immersive` (plan: `docs/superpowers/plans/2026-11-24-immersive-redesign.md`). The original prompt is kept in `docs/prompts/phase-2-immersive.md` for history. Look at the site (Step 1), then say whether to merge.

## Step 4: Run Phase 3 (polish and release checks)
Same as step 3, with `docs/prompts/phase-3-polish.md`. Afterwards you'll have:
- `docs/review/accent-comparison.html`: send it to the client to choose teal vs indigo.
- `docs/review/for-client-approval.md`: every draft text, for her sign-off.

## Step 5: Record the client's consent
When the client confirms, update each collection file in `site/content/collections/<slug>.json`:
```json
"rights": { "models": true, "photographer": true, "sensitive": "…", "confirmedBy": "Linali, 2026-12-01, email" }
```
After Phase 3, a launch build (`PUBLISH=1`) refuses to run until this is done for every featured collection. That's on purpose.

## Step 6: Run Phase 4 (launch)
Same as step 3, with `docs/prompts/phase-4-launch.md`. You'll need to:
- sign in to **GitHub** (a private repository),
- sign in to **Cloudflare** (Pages, Web Analytics, and the domain's DNS),
- create a free **Web3Forms** or **Formspree** form.

Claude tells you exactly what to click and never handles your passwords.

## Later: everyday changes
- **New collection:** put the originals in `media-src/collections/<name>/` (`shoot/01-….jpg`, `pages/01.png`…), then ask Claude Code "add the <name> collection". The project skill `add-collection` takes it from there.
- **New personal photos:** ask Claude Code to "treat the new portraits" (skill `treat-portraits`).
- **Change text:** site-wide copy (name, manifesto, bio, facts, skills, closing line) is in `site/content/site.json`; each collection's text, one-line summary, theme, hero photos and (Drift) looks are in `site/content/collections/<slug>.json`.

## Where everything is
| File | What it's for |
|---|---|
| `CLAUDE.md` | Rules and gotchas Claude Code loads automatically every session |
| `PRODUCT.md` | Who the site is for and what it must do |
| `DESIGN.md` | Colours, type, spacing, components, do's and don'ts ("The Slow Hand") |
| `PLAN.md` | The full plan and the reasoning behind it |
| `docs/ASSETS.md` | Every image: original, web version, where it's used, what's still missing |
| `docs/prompts/` | The three phase prompts to paste into Claude Code |
| `docs/superpowers/plans/` | The detailed task plans each phase writes |
| `docs/superpowers/specs/` | The Phase 2 design spec and its reference mockup |
| `Personal/edited/preview.html` | The portrait treatments and the early collage mock (Phase 1 type; not the current design) |
| `.claude/skills/` | `add-collection`, `treat-portraits` |
| `media-src/` | Original images (not in git; back them up with her Drive) |
