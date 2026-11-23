# Prompt: Phase 2, Immersive redesign (new structure + motion)

Open this folder in Claude Code, start a **new session**, and paste everything below the line.

---

You are continuing the portfolio site for Linali Andrea, a Sri Lankan womenswear designer (recent graduate). Phase 1 is built and on `main`: a static Next.js 16 site rendered from data, with a media pipeline, a Circular Carousel gallery, a Tumble Deck portfolio reader and Glass Folders. It has **no motion yet**.

My feedback on Phase 1: **the home page doesn't look good.** The components feel out of order and "just there", one after another, and it lacks the motion graphics I had in mind. Phase 2 restructures the site and makes it immersive.

## Read before anything else
1. `CLAUDE.md`: rules, commands, gotchas (read the gotchas twice)
2. `DESIGN.md`: the design system, north star "The Slow Hand"
3. `PRODUCT.md`: audience (brands hiring, private clients, press), goal (get in touch), what must never be invented
4. `PLAN.md`: top status block, section 2 (what to take from landonorris.com, my motion reference), section 5b (spacing, type and motion rules)
5. `docs/ASSETS.md`: every image and where it's used
6. Look at what exists:
   - `cd site && npm run build`
   - serve `site/out` (`python -m http.server 4173 -d out --bind 127.0.0.1`)
   - `impeccable shot http://127.0.0.1:4173/ --viewport 1440x900,390x844 --full`

   Note what makes it feel like components "just there".

## The new structure (decided)
- **`/` Home: a short, immersive highlight reel.** Not every collection in full. It should feel like one continuous, motion-led story. Proposed order, which you may refine with me:
  1. **Hero, the signature moment.** Her name, plus the "sketch → reality" lens: a fashion sketch as the ground, the real photograph revealed through a circle that follows the cursor, drifting on its own on phones.
  2. **Manifesto.** Her sentence ("I strongly believe that fashion is the best form of self expression.") fills in word by word as you scroll.
  3. **Featured collections reel.** The 2–3 strongest collections (`featured` in their JSON; start with Drift, Lunelle, Mano Padana).
     - Each one is a full-screen, pinned scene: a large image, its title in display type, one line of her own concept words, and "Explore the collection →".
     - Scroll drives the transition from one scene to the next: a clip-path or mask wipe, and each scene's own light, e.g. Lunelle turns to night.
  4. **The designer, a teaser.** The collage (cut-out figure + taped polaroids, already built in `Person.tsx`), one line, and "About Linali →".
  5. **Footer.** The brown card rises over the cream: "Let's make something slow.", contact form.
- **`/collections` Collections index.** Every collection, not only the featured ones, as an editorial list: large title, season, one line.
  - On desktop, hovering a row reveals that collection's photograph, following the cursor (the ON/OFF-track hover idea from landonorris.com).
  - On phones, each row shows a thumbnail.
  - Each row links to its detail page.
- **`/collections/<slug>` Collection detail.** The full chapter as built in Phase 1:
  - the concept in her words,
  - its moment (ring / orbit / walk / studio),
  - the shoot viewer,
  - the Tumble Deck portfolio reader,
  - credits when supplied,
  - at the end, **"Next collection →"**, so the collections still read as a story.
- **`/about` About Linali.** The person collage as the hero, bio (still a draft, keep the draft marker in development), skills, her craft (Dumbara weaving, crochet, macramé, hand embroidery, denim reconstruction) shown with details cropped from her shoots and boards, and a link to contact.
  - Nothing invented: no education, awards or clients until she supplies them.
  - Leave a clearly marked slot for her CV and a portrait session.
- **Rename `/work` → `/collections`** everywhere (routes, links, tests, docs, the `add-collection` skill). Add `site/public/_redirects` with `/work/* /collections/:splat 301` for Cloudflare Pages.
- **Navigation** on every page: monogram (home), Collections, About, Contact (jumps to the footer).

## The quality bar: landonorris.com
I want the motion on the level of **https://landonorris.com**: it should feel natural and make people say "wow". That site was made by OFF+BRAND, an award-winning studio, with Webflow, Lenis, Rive and custom WebGL. What makes it feel that way, and what we match:
- **Everything responds.** The cursor, the scroll and hovers all produce motion, and the motion has weight: springs, inertia, easing, never linear or instant.
- **Choreography, not effects.** Type, images and backgrounds move together as one sequence, with deliberate timing offsets.
- **One unforgettable signature.** His 3D head follows the cursor, and a mask reveals the helmet underneath.
- **Transitions are part of the story:** between sections and between pages.
- **Small details everywhere:** a hand-drawn scribble over the type, the ON/OFF track hover, scattered photos at different depths, the footer rising as a card.

We are **not** copying his site: not his layout, effects one-to-one, colours or loudness. Each of our effects comes from her world (fabric moving in coastal wind, stitches, paper, the moon, handwoven texture), so it feels natural for a slow-craft designer. The goal is the same level of polish and the same "how did they do that" moment.

## Motion thesis (do not drift from this)
Immersive and award-level, but in the spirit of "The Slow Hand": crafted, fluid and confident, never busy or loud.
- One continuous teal **stitched thread** runs through the home page and ties the scenes together.
- Every scene has **one** authored moment and its own light.
- Drift deliberately slows the scroll.
- No identical fade-in on every section, no parallax on text, no scroll-jacking (the user's scroll always moves the page; pinned scenes release at their end).
- Everything still readable with JavaScript off and under reduced motion.

## Components and tools to use
- **Smooth scroll and scroll storytelling** (the backbone of the "natural" feel):
  - **Lenis** (`lenis@1.3.27`) on GSAP's ticker, in one client `MotionProvider`.
  - **GSAP ScrollTrigger** for pins and scrubs.
  - **GSAP SplitText** for type reveals.
  - GSAP 3.15.1 is installed.
- **Already in the project, reuse them:**
  - Circular Carousel (collection detail galleries),
  - Tumble Deck (portfolio reader),
  - Glass Folders (Revive's studio),
  - `useDialog` (every dialog).
- **One WebGL layer, for the signature moments only.** Use **OGL** (`ogl`, about 30 KB), not three.js.
  - **Loading:** load it after the first paint.
  - **Fallbacks:** on low-power devices (`navigator.hardwareConcurrency <= 4` or `deviceMemory <= 4`), with Motion off, or if WebGL fails, fall back to the CSS version of the same effect.
  - **Use it for:**
    - **Hero, "fabric lens":** the sketch → photo reveal under the cursor. The edge of the lens ripples like fabric in wind (a noise-driven displacement). The lens has inertia, stretching slightly with cursor speed and settling with a spring.
    - **Featured reel transitions:** between scenes, a displacement wipe driven by a woven-texture map (Dumbara pattern, crochet), so one collection "weaves" into the next.
    - **`/collections` hover:** the revealed photo follows the cursor with inertia and a subtle wave distortion proportional to speed.
- **New pieces to build:**
  - **Hero lens:** the CSS fallback uses `clip-path: circle()` following the pointer, lerp 0.1.
  - **Featured reel:** pinned scenes with mask transitions (WebGL above, CSS fallback).
  - **Hero type:** characters rise from a mask with a slight overshoot. The hero has a "breathing" state: the lens drifts slowly when the cursor is idle.
  - **Scroll-velocity feel:** image cards and the thread respond subtly to scroll speed (a small skew or stretch that settles). This is what makes smooth scroll feel alive.
  - **Magnetic links and buttons:** nav items and "Explore the collection →" pull slightly toward the cursor (desktop only, max 6 px).
  - **Hand-drawn moments:** her handwriting or signature drawn stroke by stroke (SVG `stroke-dashoffset`) once she supplies it. Until then, the stitched thread does this job.
  - **Scattered depth gallery:** in the featured reel or on `/about`, a few shoot photos and swatches pinned at different depths, drifting at different scroll speeds, like her collage boards.
  - **The thread:** an SVG path drawn by scroll, dashed like a running stitch.
  - **Hover-reveal list** for `/collections`.
  - **Thread-in intro:** first visit only, ≤ 1.5 s, skippable.
  - **Page transitions:** cross-document View Transitions, 300 ms.
- **Motion on/off control in the nav:**
  - It honours the OS reduced-motion setting by default and is saved in `localStorage`.
  - It's the pause control WCAG 2.2.2 needs, and it also stops the carousels.
  - `useDialog` must stop Lenis while a dialog is open.
- **Not used:**
  - **Dither Cursor:** dropped; it's off-brand.
  - **Stipple Type:** on hold; needs a paid licence.
  - **three.js and 3D models:** too heavy, and no 3D asset of her exists. The single OGL layer above is the limit.

## How to work
0. **Study the reference first.** Open https://landonorris.com in the browser and break down every motion moment from the first screen to the footer. For each one, write down what triggers it, what moves, the easing and duration (measured where you can), and why it feels good. Save this to `docs/review/landonorris-motion-study.md`. Then map each moment to our equivalent in her world, or say why we skip it. Use this study as the benchmark for everything below.
1. **Then `superpowers:brainstorming`.** Before designing anything, ask me what I picture for the home page motion: what happens as someone lands and scrolls. Show me mockups in the browser (the brainstorming skill's visual companion) for the hero, the featured reel and the `/collections` list, and let me react.
2. Write the design doc to `docs/superpowers/specs/<date>-immersive-redesign-design.md`, and get my approval.
3. **Plan:** `superpowers:writing-plans` writes the plan to `docs/superpowers/plans/<date>-immersive-redesign.md`, following the format of the Phase 1 plan in that folder. Show me the plan and wait for my OK.
4. **Build:**
   - Create a branch `phase-2-immersive` from `main`.
   - Use `superpowers:executing-plans` with `superpowers:test-driven-development`.
   - Keep `npm test` and `npm run test:build` green after every task.
5. **Motion craft:**
   - For each moving piece, follow `skills-main:animate` (should it animate, purpose, properties, curve, interruption).
   - Use `skills-main:choreograph` where several things move together, and `skills-main:animation-performance` if anything drops frames.
   - Use `impeccable animate` for the motion thesis and verification.
6. Finish with `superpowers:finishing-a-development-branch`. Ask me before merging.
7. Update `CLAUDE.md`, `docs/START-HERE.md`, `docs/ASSETS.md`, `PLAN.md`'s status block and the `add-collection` skill to match the new structure.

## Budgets and rules
- Animate `transform`, `opacity`, `clip-path`, mask and stroke-dashoffset only. Blur ≤ 20 px, small areas only.
- **Easing and timing:** `--ease-out` for entrances; never ease-in; exits faster than entrances. Hero entrance done by 1.5 s.
- **Performance:**
  - First-load JS on `/` ≤ 250 KB gzipped, **not counting** the lazily loaded WebGL chunk. Add a check in `site/scripts/build/` that fails above it.
  - The WebGL chunk is ≤ 60 KB gzipped, loaded after the first paint, and it never blocks content.
  - LCP < 2.5 s on a throttled mid-range phone (Lighthouse).
  - 60 fps scrolling on desktop.
- Initial animation states are set **from JavaScript after mount**. The server HTML stays fully visible; the existing build check (no `opacity: 0` in HTML) must keep passing.
- Teal never on text under 24px. Content contrast ≥ 4.5:1 at every scroll position, including scenes that change light; write a test for it.
- Phones are designed, not shrunk:
  - pinned scenes become stacked full-screen scenes,
  - the hover list shows thumbnails,
  - the lens drifts on its own.
- **No invented facts.** If a page needs content she hasn't given (education, CV, credits), leave a marked slot and list it for me.

## Verification
- Unit tests for the logic:
  - the motion on/off switch,
  - Lenis stopping and starting with dialogs,
  - contrast during light changes,
  - the intro's session flag,
  - the `/work` → `/collections` redirects file.
- `npm run test:build` covers every route: `/`, `/collections/`, every `/collections/<slug>/`, `/about/`.
- Motion: capture the hero, the featured reel, the manifesto and the footer with Impeccable's `motion-capture`, once normally and once with `--reduced-motion`. Send both to the `impeccable-motion-reviewer` agent and act on its fixes (at most 2 rounds). The browser pane runs 0 animation frames when hidden; use `motion-capture` (headless Chrome).
- **Benchmark against the reference.** Capture landonorris.com's hero and one scroll transition with `motion-capture` too. Put our filmstrips next to theirs in `docs/review/`, and judge honestly: smoothness, responsiveness, choreography, and the "wow" of the signature moment. Write where we fall short and fix the biggest gap before finishing.
- Check WebGL fallbacks: with WebGL disabled, on a low-power profile, and with Motion off, every scene still looks finished (the CSS versions).
- Screenshot every route at 1440, 1024, 768, 390 and 320. Score with PLAN.md section 5b's rubric: average ≥ 8, nothing < 7. Put the scores in the plan's ledger.

## Out of scope
Phase 3 work (accessibility and polish minors, Playwright, SEO, release gate) and launch. Don't add new collections or invent copy.

When you finish, tell me in plain language: what the home page does now from first screen to last, what moved where, what you decided on my behalf (each with the cost if it's wrong), what you couldn't verify, and which client assets would make it better (signature SVG, monogram SVG, her handwriting).
