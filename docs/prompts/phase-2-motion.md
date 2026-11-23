# Prompt: Phase 2, Motion

Open this folder in Claude Code, start a **new session**, and paste everything below the line.

---

You are continuing the portfolio site for Linali Andrea, a Sri Lankan womenswear designer. Phase 1 is built and merged to `main`: a static Next.js 16 site, rendered entirely from data, complete **without** scroll motion. Your job in Phase 2 is the motion layer: the thing that makes the site immersive and memorable while keeping it calm, fast and accessible.

## Read before anything else
1. `CLAUDE.md`: project rules, commands, gotchas (read the gotchas twice)
2. `DESIGN.md`: the design system, north star "The Slow Hand"
3. `PRODUCT.md`: audience, purpose, what must never be invented
4. `PLAN.md`: the top status block, section 2 (lessons from landonorris.com), section 3 (the story) and section 5b (spacing, type and motion rules)
5. `docs/ASSETS.md`: images and where they're used
6. Look at the current site: `cd site && npm run build`, serve `site/out` (e.g. `python -m http.server 4173 -d out --bind 127.0.0.1`) and screenshot it with Impeccable: `impeccable shot http://127.0.0.1:4173/ --viewport 1440x900,390x844 --full`

## How to work
1. Create a branch `phase-2-motion` from `main`.
2. Use `superpowers:writing-plans` to write the plan to `docs/superpowers/plans/<date>-phase-2-motion.md`. Follow the format of the Phase 1 plan in the same folder. **Show me the plan and wait for my OK.**
3. Execute it with `superpowers:executing-plans` and `superpowers:test-driven-development`. Keep `npm test` and `npm run test:build` green after every task.
4. For each motion moment, follow `skills-main:animate` (should it animate, purpose, properties, curve, interruption, exit) and `skills-main:choreograph` where several things move together. Use `impeccable animate` for its motion thesis and verification, and `skills-main:animation-performance` when anything drops frames.
5. Finish with `superpowers:finishing-a-development-branch`. Ask me before merging.

## Motion thesis (do not drift from this)
One continuous **thread** stitches the story from the first screen to the last. Every chapter has **one** authored moment and its own light. Motion is unhurried and slows down further in Drift ("stepping away from social acceleration"). Never the same fade-in on every section. No parallax on text. No scroll-jacking: the user's scroll always moves the page.

## What to build

**0. Foundation**
- **Smooth scroll:** add Lenis (`lenis@1.3.27`, already planned) driven by GSAP's ticker, plus `gsap/ScrollTrigger` and `gsap/SplitText` (GSAP 3.15.1 is installed). Put it all in one client `MotionProvider` in the root layout.
- **Off switch:** under `prefers-reduced-motion: reduce`, Lenis is off, nothing pins, nothing scrubs position, and only opacity/colour changes remain.
- **A visible "Motion on/off" control in the nav**, saved in `localStorage` and honouring the OS setting by default. It is the site-wide pause control WCAG 2.2.2 needs for anything moving longer than 5 s. It also sets the carousels' autoplay to off.
- **Dialogs:** `useDialog` must stop Lenis while a dialog is open and restart it on close. Write the test first.
- **Safe defaults:** all initial animation states are applied **from JavaScript after mount**. The server HTML stays fully visible. The existing build check (no `opacity: 0` / `visibility: hidden` in HTML) must keep passing.
- **Anchors:** in-page links (`#about`, `#contact`) scroll smoothly through Lenis.

**1. Thread-in (first visit only, ≤ 1.5 s, skippable)**
- A teal stitched line draws across the top of the hero, then becomes the page's thread.
- If `media-src/brand/monogram.svg` exists, it stitches the LA monogram first. If not, just the line; don't trace the PNG.
- It overlays content that is already rendered and never blocks reading.
- Any click or key skips it. Stored in `sessionStorage`. Skipped entirely under reduced motion or Motion off.

**2. Hero: "sketch → reality" lens (the signature moment)**
- The Drift range-plan sketch is the ground. The real line-up photo shows through a circle that follows the pointer: `clip-path: circle(19vmin at x y)`, lerp 0.1, only on `(hover: hover) and (pointer: fine)`.
- On touch devices and keyboard-only use, the lens drifts slowly on its own along a gentle loop (about 20 s). It pauses offscreen and with Motion off.
- **Entrance, once:**
  - The name rises line by line from a mask (SplitText lines, 800 ms, `--ease-out`, 80 ms stagger).
  - The lens scales 0.92 → 1.
  - The whole entrance is done by 1.5 s.

**3. The thread**
- One SVG path in an absolutely positioned layer spanning the page.
- **Look:** stroke `#008794`, 1.6 px, dashed `10 9` (a running stitch), drawn by scroll with ScrollTrigger `scrub`. Draw it with a mask whose stroke-dashoffset animates over the dashed path, so the stitches stay dashed while drawing.
- **Route:** it travels through margins and gaps, never across body text. It passes behind the person cut-out and ends in the footer.
- When `media-src/brand/signature.svg` exists, it finishes by signing her name in the footer. Until then it ends in a small knot.
- **Phones:** a simpler path along the left gutter.
- **Reduced motion:** fully drawn and static.

**4. Manifesto**
- Words fill from 15% to 100% opacity as the section scrolls through (SplitText words, scrub).
- "fashion" and "self expression" turn teal. That's allowed because they are display size, ≥ 24px.
- **Reduced motion:** final state.

**5. Chapter I, Mano Padana ("The Mind's Steps")**
- **Light:** the section's ground moves from charcoal to cream as it scrolls, following her colour board (black → greys → cream → brown means depression → peace). Ink flips from cream to brown at the midpoint. Keep body contrast ≥ 4.5:1 at every scroll position, with a test that samples the interpolation.
- **The walk:** on desktop the section pins and the photo track moves sideways with the scroll (pin length = track overflow). This is not scroll-jacking: vertical scroll drives it and it releases at the end. Phones keep the native swipe. Reduced motion: no pin.

**6. Chapter II, Lunelle**
- The night arrives: the ground is already `#21150F`.
- An SVG moon rises behind the orbit carousel. Its phase advances from new to full as the chapter scrolls (a mask with a moving terminator).
- Draw the moon as a cream disc with a few low-opacity craters. No gradient blobs.
- **Reduced motion:** full moon, static.

**7. Chapter III, Drift**
- Lenis eases more slowly while Drift is in view (lerp about 0.06 instead of about 0.1), so the scroll itself feels slower.
- The ring keeps its slow drift.
- Nothing else moves. Restraint is the point.

**8. Chapter IV, Revive**
- The three Glass Folders assemble once when the table enters view, 120 ms apart, using the component's `appear` / `appearDelay`.
- First verify that the server HTML does **not** start them hidden. If it does, enable `appear` only after mount.

**9. Person section**
- The two polaroids settle once as the section enters: from ±8° and 24 px up to their resting angle, 600 ms `--ease-out`.
- The cut-out figure stays still.

**10. Footer**
- The brown card rises over the cream as it enters (translateY 80 px → 0, scrub).
- The closing line "Let's make something slow." rises line by line.

**11. Navigation between pages**
- Cross-document View Transitions (`@view-transition { navigation: auto; }`) between `/`, `/work/` and `/work/<slug>/`: a 300 ms cross-fade.
- Off under reduced motion.

## Budgets and rules
- Animate `transform`, `opacity`, `clip-path`, mask, and stroke-dashoffset only. Blur ≤ 20 px, only in small areas.
- **Easing and timing:** `--ease-out` for entrances; never ease-in; exits faster than entrances.
- **Performance:**
  - First-load JS on `/` ≤ 250 KB gzipped. Add a check in `site/scripts/build/` that fails above it.
  - LCP < 2.5 s on a throttled mid-range phone profile (Lighthouse).
  - 60 fps while scrolling on desktop.
- One heavy effect per viewport. No WebGL.
- Everything still works with JavaScript off and with Motion off.

## Verification (each moment, not just at the end)
- Unit tests for the logic: the motion-off/reduced-motion switch, Lenis stop/start with dialogs, the contrast check on the Mano Padana light, the thread-in session flag.
- `npm run test:build` stays green; add the JS-size check.
- For the hero, manifesto, Mano Padana walk, moon and footer: capture with Impeccable's `motion-capture` **twice**, normally and with `--reduced-motion`. Send both captures to the `impeccable-motion-reviewer` agent, and act on its fixes (at most 2 rounds).
- **The browser pane can't verify motion:** when it is hidden it runs 0 animation frames. Use `motion-capture` (headless Chrome).
- Screenshot at 1440, 1024, 768, 390 and 320. Score with the rubric in PLAN.md section 5b: average ≥ 8, nothing < 7. Write the scores into the plan's ledger.

## Out of scope for Phase 2
- Phase 3 work: accessibility and polish minors, SEO, Playwright, launch.
- New content, new collections, copy changes. If something needs content from the client, list it; don't invent it.

When you're done, tell me in plain language what moves now, what you decided on my behalf (each with the cost if it's wrong), what you could not verify, and which client assets would make it better (signature SVG, monogram SVG).
