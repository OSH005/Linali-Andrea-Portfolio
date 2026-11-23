# Start here

A step-by-step guide to taking Linali Andrea's portfolio from where it is now to live.

## Where things stand

| Phase | What | Status |
|---|---|---|
| 0 | Plan, product brief, design system, edited portraits | ✅ Done |
| 1 | The site: every section from data, media pipeline, carousel, page deck, folders, contact form, `/work` pages | ✅ Done, on `main` (61 unit tests + 13 build checks green) |
| 2 | Motion: smooth scroll, hero lens, the thread, chapter moments | ⏭ Next: `docs/prompts/phase-2-motion.md` |
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
3. Open http://localhost:3000. Try:
   - **The four chapters.** In Lunelle and Drift, switch Ring/Grid, Pause, and click a photo to open it full screen.
   - **"Open the portfolio"** in each chapter: click or drag to turn pages; try Zoom and "Read the text" on Drift's first spread.
   - **http://localhost:3000/work/**, then a single collection.
   - **A phone width** (browser dev tools, 390 px).
4. Note anything you dislike. It goes into the Phase 2 or 3 session.

In Claude Code's desktop app you can also start it from the Preview button: `.claude/launch.json` defines it.

## Step 2: Send the client this checklist (today)
These don't block development, but some block **launch**. Copy the list into a message to her.

**Blocks launch:**
- [ ] Written OK from **every model** in the shoots (Drift, Lunelle, Mano Padana).
- [ ] Explicit OK to publish the **Lunelle ultrasound images** and pregnancy photos.
- [ ] **Photographer's name**, credit line, and OK to use the photos (the `MMS_` files).
- [ ] OK to publish **Revive** under the **E.L.V. Denim** collaboration name.
- [ ] OK to publish her five **personal photos** (edited as collage).
- [ ] Approval of the **draft bio** and **skills list** (shown on the site with a "Draft" marker while developing).
- [ ] A **business email** for the contact form (not her personal one).
- [ ] Her **domain name** (or whether to buy one).

**Makes it much better:**
- [ ] **Page order** for Mano Padana and Lunelle portfolio pages. The current order is a guess. Does Drift have pages 01–03 and 20–29?
- [ ] **Source text** of her portfolio pages (InDesign/Canva/PDF export), for "Read the text".
- [ ] **SVG files** of her LA monogram and collection logos (Drift, Revive, Lunelle, Mano Padana's Sinhala title).
- [ ] **Her handwriting** (a few lines) and **signature** on white paper, photographed flat. The thread will sign her name with it.
- [ ] **Teal or indigo?** She chooses once she sees the Phase 3 comparison.
- [ ] Optional: a proper **portrait session**. The layout takes new photos without changes.

When files arrive, put them where `docs/ASSETS.md` says (originals into `media-src/…`). Ask Claude Code to rebuild the media.

## Step 3: Run Phase 2 (motion)
1. In Claude Code, open this folder and start a **new session** (a fresh context works best for a whole phase).
2. Open `docs/prompts/phase-2-motion.md`, copy everything below the line, and paste it as your first message.
3. Claude will read the project docs and write a plan. **Read the plan and reply "go" or with changes.**
4. It builds task by task, on a branch `phase-2-motion`, testing as it goes. Long steps (media builds, motion captures) run in the background; let them finish.
5. At the end it shows screenshots and scores and asks whether to merge. Look at the site (`npm run dev`) before saying yes.

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
- **Change text:** site-wide copy is in `site/content/site.json`; each collection's text is in `site/content/collections/<slug>.json`.

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
| `Personal/edited/preview.html` | The portrait treatments and the collage mock |
| `.claude/skills/` | `add-collection`, `treat-portraits` |
| `media-src/` | Original images (not in git; back them up with her Drive) |
