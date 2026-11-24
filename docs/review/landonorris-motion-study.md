# landonorris.com: motion study

Studied 2026-11-23 at 1440×900, headless Edge 158 with WebGL. Two sources:
- **Measured:** frame strips in `docs/review/landonorris/` (`intro`, `hero`, `manif`, `foot`, `scroll-1`, `scroll-2`).
- **Read from their code:** OFF+BRAND's bundle `lando-by-OFF+BRAND.05.js` (1.3 MB) and the live Lenis instance.

Headless capture takes about 350 ms per frame, so timings from the strips are coarse. Every exact number below comes from their code.

## The stack, as shipped
- Webflow page, one 1.3 MB custom bundle (GSAP, ScrollTrigger, three.js, Rive runtime, taxi.js router), jQuery.
- 21 canvases on the home page.
- Loads 3 GLB models, 2 MSDF fonts and 8 Rive files (`signature`, `page-transition`, `btn-ui`, `circuits`, `reef`, `phrases`, `ln4`, `mob-landscape`).
- A `gl-fallback` class goes on `<html>` when WebGL fails. They designed a fallback too.

## Their house style, in numbers
Across the whole bundle:
- **Easing:** `power2.out` 36 times, `power2.inOut` 15, `expo.inOut` 12, `power3.out` 10, `ease:none` 17 (for scrubbed tweens).
- **Durations:** UI moves take 0.3–0.6 s; reveals take 1.5–2 s.
- **Staggers:** 0.015–0.03 s per character, 0.15 s per line.
- **Scroll links:** almost every scroll link is `scrub: true` (26 of them). Only one uses `scrub: 1`. The smoothing comes from Lenis, not from the scrub.

So: **one smoothing layer (Lenis), short UI moves, long reveals, tiny per-character staggers.**

## Moment by moment, first screen to footer

| # | Moment | Trigger | What moves | Easing and timing | Why it feels good |
|---|---|---|---|---|---|
| 1 | **Preloader** | load | A lime screen. The "LN" glyph cycles through letter fragments. "LOAD NORRIS" sits at the bottom. | About 2.5 s on a fast connection. In headless software rendering it was about 7 s. | Brand colour as a held breath. **Cost:** you wait. The PLAN already rejects a long preloader for her audience. |
| 2 | **Hero entrance** | preloader ends | The helmet is revealed over the face by a noise-shaped mask, then dissolves back to the face. | `REVEAL_DURATION 1.1 s`. Mask height runs from `REVEAL_SIZE 25` to 0. | It shows you the trick before you find it. You learn the hero is interactive without being told. |
| 3 | **Smooth scroll** | wheel / touch | The whole page | Lenis: `lerp 0.1`, `easing min(1, 1.001 − 2^(−10t))` (expo-out), `syncTouch: true`, `syncTouchLerp 0.075`, `touchInertiaMultiplier 35`, `touchMultiplier 1.25` | The weight under everything. On phones, touch is smoothed too, which most sites skip. |
| 4 | **Hero cursor: head** | mousemove | The face is **a photo on a plane with a depth map** (displacement 0.25, plus normal and roughness maps), not a 3D model. It turns toward the cursor. | Eased mouse: `ease 0.025` per frame, `intensity 0.075` | Very heavy lag. The head drifts after you, so it feels alive and calm rather than twitchy. |
| 5 | **Hero cursor: helmet reveal** | mousemove | A **fluid-simulation trail** (a stable-fluids pass, `tFluid`) shaped by simplex noise reveals the helmet *where the cursor has been*. Its strength follows cursor speed (`pace`, eased 0.01). When you stop, the trail dissolves over about 1 s and the face returns. | Noise: `SCALE 1`, `SPEED 0.1`, `DISTORT_INTENSITY 0.5`, `NOISE_DETAIL 3`, `CURSOR_SCALE 3`, `CURSOR_INTENSITY 0.15` | **This is the "how did they do that".** It is a trail, not a circle. The edge is organic, it answers speed, and it heals itself. A plain `clip-path: circle()` lens has none of these three. |
| 6 | **Nav settle** | first scroll (desktop > 991 px) | The logo and buttons scale from 1.2 to 1. | Scrubbed, `power2.out` | The hero feels framed. The nav "lands" as you leave it. |
| 7 | **Nav and button hover** | mouseenter / leave | Each character rolls up (`y: −100%`) and a copy rolls in. | `0.6 s power3.out, stagger 0.02, overwrite` | Same curve in and out, interruptible (`overwrite`). It reads as one mechanism. |
| 8 | **"Message from Lando" marquee** | in view | Two lines of type run in opposite directions. Scrolling up reverses them (timeScale ±1). A scrubbed x-offset adds the scroll's own push. A Rive **signature** draws over a grey photo. | Linear, infinite. Scrub 0. | The marquee obeys your scroll direction, so even "decoration" responds to you. The signature is the human touch. |
| 9 | **Statement ("Redefining limits…")** | enters at `top 95%`, once | **Oval line reveal:** each line's clip grows from `ellipse(20% 0% at 50% 0%)` to `ellipse(100% 120%)`. Characters drop from `y: −40%` to 0, staggered **from the centre**. | `1.5 s power2.inOut`, lines stagger 0.15 s, characters 0.015 s each | The curved clip and the centre-out stagger make type feel poured, not slid. Serif-lime and sans-cream words alternate. **Note:** it is *not* a scroll-scrubbed word fill (PLAN.md section 2 assumed it was). |
| 10 | **Horizontal track** (scattered photos) | pinned scroll, about 3 screens | The track moves sideways (`ease: none`, scrubbed). Each photo also slides 0 → 4 rem inside its frame as it passes. The background moves dark green → grey → cream across the pin. | Text lines reveal with a lime bar wiping off (`clip inset`, 0.6 s). | Photos at different sizes and heights read as a pinboard. Two speeds (track and photo) give depth. The background change is the scene's "own light". |
| 11 | **Image reveal** (site-wide) | `top 80%`, once | The image's wrapper clip opens from `ellipse(120% 0% at 50% 0%)`. A lime plate over it wipes away in the other direction. | 0.8 s and 0.6 s | Every image arrives the same way, but it is a *curtain*, not a fade. |
| 12 | **ON TRACK / OFF TRACK** | hover on either word | Two WebGL "tracks" scenes. Hovering swaps which side is lit. A hand-drawn lime "ON" scribble sits over the type. | Scene swap: `TRANSITION_DURATION`, `expo.in` out and `expo.out` in, rotation ±π/4 | A two-choice menu as an *object*. **Not captured:** my hover frames show no visible change, so the swap probably needs a real GPU. Values are from code only. |
| 13 | **Helmets hall of fame** | scroll / hover | A grid of cards with notched corners, each holding a WebGL helmet. | — | A collection shown as objects, not thumbnails. |
| 14 | **Store collage** | scroll | Product shots scattered at different depths around a big headline | Parallax | Collage composition again. |
| 15 | **Partners** | in view | A giant lime hand-written "Collabs" scribble over the heading; a logo marquee | — | A second hand-drawn moment. They repeat the device, at a different scale. |
| 16 | **Socials fan** | scrubbed by scroll | 7 cards fan out from a stack. Measured end pose: rotation 0 / ±7 / ±14 / ±21°, scale 1 / .935 / .850 / .776, x 0 / ±11 / ±22 / ±30, y 0 / 1.3 / 4 / 7.3. | Scrubbed | A deck of photos opening like a hand of cards: tactile. |
| 17 | **Footer** | last screen | A dark card with a **notched tab** on top rises over a lime glow. The signature draws above "ALWAYS BRINGING THE FIGHT." A helmet rises from the bottom edge. Link lists sit either side. | Scrubbed | A clear ending: the page *closes* like a lid. The signature bookends the marquee one. |
| 18 | **Page transition** | link click (taxi.js) | A full-screen Rive animation covers the page, the route swaps, then it uncovers. | Button fade 300 ms | Navigation never feels like a reload. |

## What actually makes it feel "natural"
1. **One smoothing source.** Lenis lerp 0.1 plus `scrub: true` everywhere. The two never fight, so nothing lags twice.
2. **Heavy cursor easing** (0.025 per frame, about 2.5× slower than a typical lerp of 0.1 per frame). Things *follow* you, they don't *track* you.
3. **Velocity-aware effects.** The hero reveal's strength comes from cursor speed, and the marquee flips with scroll direction. Motion that answers *how* you move, not only *where*, is the "alive" feeling.
4. **Curved masks, not fades.** Ellipse clips on type and images, a noise mask on the hero. Almost nothing fades in.
5. **A repeated hand-drawn device** (signature, "ON" scribble, "Collabs") ties a technical site to a person.
6. **Every scene has its own light.** Backgrounds change during pinned scenes.

## Where they pay for it (what we must not copy)
- 1.3 MB of JS, 21 canvases, GLB models, a multi-second preloader. Her visitors are on mid-range Android phones in South Asia.
- Loud lime, all-caps type, constant motion. That is wrong for "The Slow Hand".

## Mapping to her world

| Their moment | Our equivalent | Or why we skip it |
|---|---|---|
| 1 Preloader | **Thread-in**: a teal thread stitches the LA monogram, then pulls away into the page thread. First visit only, ≤ 1.5 s, skippable. | Their length is skipped on purpose. |
| 2 Hero entrance (auto-reveal) | **The lens shows its trick once:** on load the photo opens through the fabric lens and settles to its resting size, done by 1.5 s. Visitors learn it is interactive. | — |
| 3 Lenis config | **Same numbers:** `lerp 0.1`, `syncTouch` with `syncTouchLerp 0.075`, expo-out. In Drift, lerp drops to about 0.06 so the scroll slows down there. | — |
| 4 Head turns to the cursor (depth map) | **Skip the depth map.** We have no depth data for her photos, and a faked one would warp the garments. The photo inside the lens drifts slightly against the lens (2–3 %) instead, for depth. | No depth asset. Distorting her garments misrepresents the work. |
| 5 Fluid-trail reveal | **Fabric lens (OGL):** the sketch → photo reveal follows the cursor with heavy easing (about 0.04 per frame). The edge ripples with simplex noise "like fabric in wind". Strength and stretch follow cursor speed. When the cursor stops, the lens breathes and drifts. **The CSS fallback** is `clip-path: circle()` at lerp 0.1. | We keep a **lens, not a free trail**: the brief says "a circle that follows the cursor", and a self-healing trail would hide too much of the garment photo. Open question for the client: a trail-like soft edge? |
| 6 Nav settle | The monogram scales from 1.15 to 1 over the first 30 % of the hero's scroll, scrubbed. | — |
| 7 Character-roll hover | **Magnetic links** (≤ 6 px) plus an underline drawn as a running stitch. | Character rolls are a sports-brand tic. The stitch is her language. |
| 8 Marquee and signature | **The thread draws her signature** once she supplies it. Until then, no marquee. | A scrolling marquee is loud. No signature asset yet. |
| 9 Oval line reveal | **Manifesto:** her sentence fills word by word with scroll (the brief). We borrow their *curve*: each word's ink spreads from an ellipse, not a flat colour switch. Collection titles use the oval line reveal once, as each scene's authored moment. | — |
| 10 Horizontal track, scattered depths | **Featured reel** (pinned scenes, own light per collection) plus a **scattered depth gallery** of shoot photos and swatches drifting at 2–3 speeds, like her boards. | We pin vertically, not sideways: sideways tracks are hard on phones. |
| 11 Lime-plate image curtain | **Paper curtain:** images open with an ellipse clip, and a cream "paper" plate peels the other way. Used for the reel images only, not on every image. | One authored moment per scene, not site-wide. |
| 12 ON/OFF track hover | **`/collections` hover list:** hovering a row reveals that collection's photo, following the cursor with inertia and a speed-based wave (OGL). Phones show thumbnails. | — |
| 13 Helmet grid | Skip. | No 3D objects; her collections are already the "objects". |
| 14 Store collage | The **/about collage** (cut-out figure, taped polaroids, craft details) | — |
| 15 Hand scribbles | The **running stitch** under key words, drawn by `stroke-dashoffset`. Her handwriting replaces it when supplied. | — |
| 16 Socials fan | Skip on home. Maybe a **portfolio-page fan** on collection detail: the closed page stack opens into a fan before the Tumble Deck opens. *Proposal.* | Would add a second deck metaphor next to the Tumble Deck. |
| 17 Footer card with notch | **Brown card rises over cream** (`margin-top: −40px`, 40 px top radius). The thread ends there. "Let's make something slow." | Their notch is skipped; our card already has its shape. |
| 18 Rive page transition | **Cross-document View Transitions, 300 ms.** Collection photo → detail hero as a shared element where possible. | No Rive: one runtime fewer. |

## Benchmark targets for Phase 2
What "on their level" means here, measurably:
1. **Cursor response:** the lens follows with visible weight (ease ≤ 0.1 per frame), reacts to *speed*, has a living edge, and settles back. Not a rigid circle glued to the pointer.
2. **One smoothing layer:** Lenis plus `scrub: true`. No `scrub: 1` on top of Lenis.
3. **No plain fades** on focal moments: masks and curves.
4. **Choreography:** in each scene, type, image and light move as one timeline, with offsets of 0.1–0.15 s.
5. **Light changes inside pins:** each featured scene owns its ground colour.
6. **A clear ending:** the footer card closes the page.
7. **At a fraction of the cost:** ≤ 250 KB JS on `/` plus ≤ 60 KB of lazy WebGL, against their 1.3 MB plus models.
