# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Accepted recommendation (PLAN.md section 5): Next.js App Router with static export, Tailwind CSS v4, GSAP + ScrollTrigger + SplitText, Lenis, deployed on Cloudflare Pages. No CMS: collections are JSON files plus a media build script.

## Users

- **Brands hiring designers:** fashion labels and houses looking for a womenswear designer. They scan fast, often on a phone from an Instagram or LinkedIn link, and judge craft, concept and process.
- **Private clients:** people who might commission custom pieces. They care about the finished garments and who she is.
- **Press and collaborators:** stylists, photographers, magazines and brands. They look for a point of view and a clear way to reach her.

## Product Purpose

The personal portfolio of **Linali Andrea**, a Sri Lankan womenswear designer who is a student / recent graduate looking for her first role and for commissions and collaborations. The site tells her story from first screen to last through her collections, and ends with one action: **get in touch**. Success means a visitor understands her point of view within the first screens and contacts her.

## Positioning

Concept-led womenswear built on slow, hand-made craft rooted in Sri Lanka (hand-woven Dumbara textiles, Kandyan dance references, crochet, macramé, hand embroidery, reconstructed denim), with each collection carrying an emotional subject: mental healing, motherhood, stepping away from speed, renewal. Her collections read in sequence as **mind → body → nature → renewal**.

## Operating Context

- Collections so far: Mano Padana / මනෝ පාදන (SS25), Lunelle (AW26), Drift (SS27), Revive (SS27, in progress, no shoot yet). More will be added; a new collection must be data, not code (`.claude/skills/add-collection`).
- Each collection has some of: shoot photographs, portfolio pages (landscape A3/A4 boards), a logo, concept text that currently lives only inside the page images.
- Visitors arrive mostly from social links, frequently on mid-range Android phones in South Asia.

## Capabilities and Constraints

- Story home page features at most 4 collections; every collection also has `/work/<slug>` and appears in `/work`.
- Shoot photos viewable as a ring (Circular Carousel), as a grid, and one by one full screen. Portfolio pages viewable in order (Tumble Deck, full-screen overlay, zoom, text version).
- Contact through a form (no personal email or phone printed).
- Image rules: originals never in git; EXIF/GPS stripped; web derivatives at 640/1280/2400 px.
- **Undecided:** page order for Mano Padana and Lunelle; final bio, education and contact details; domain name.

## Brand Commitments

- Name: Linali Andrea. Monogram: Didone "LA" (`Linali Andrea logo.png`).
- Colours named by the client: Cream `#F2E8DA` (main), Brown `#3B2418`, Tropical teal `#008794` (small pop only).
- The site must not feel generic or AI-made; it must have a wow factor and be motion-led and immersive.
- Personal portraits are casual phone photos used deliberately, as collage (`Personal/edited/`).

## Evidence on Hand

- Shoot photos: Drift 17, Lunelle 11, Mano Padana 6, Revive none.
- Portfolio pages: Drift pages 04–19, Revive 30–37, Mano Padana 10 + cover, Lunelle 20 + final garment page.
- Collection logos: Drift, Revive (PNG). No SVGs yet.
- **Absent, never to be invented:** bio, education, awards, client names, testimonials, press, CV. Drafts must be marked as drafts for her approval.
- **Rights pending:** model releases, photographer credit, consent for the Lunelle ultrasound images, permission for the Revive / E.L.V. Denim collaboration name.

## Product Principles

1. The work leads; the interface steps back.
2. Every screen moves the story forward from header to footer; nothing is filler.
3. Her own words and her own hand (handwriting, collage, stitches) over generic copy and decoration.
4. Adding a collection never needs new code.
5. Fast and readable on a mid-range phone, with or without motion.

## Accessibility & Inclusion

WCAG 2.2 AA: body text contrast ≥ 4.5:1 (teal never for small text), full keyboard access to carousel, viewer and deck, a complete `prefers-reduced-motion` path, pause for any motion longer than 5 s, text versions of portfolio pages, alt text describing every garment.
