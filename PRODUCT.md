# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 App Router with static export, React 19, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, deployed on Cloudflare Pages. No WebGL. No CMS: collections are JSON files plus a media build script.

## Users

- **Brands hiring designers:** fashion labels and houses looking for a womenswear designer. They scan fast, often on a phone from an Instagram or LinkedIn link, and judge craft, concept and process.
- **Private clients:** people who might commission custom pieces. They care about the finished garments and who she is.
- **Press and collaborators:** stylists, photographers, magazines and brands. They look for a point of view and a clear way to reach her.

## Product Purpose

The personal portfolio of **Linali Andrea**, a Sri Lankan fashion designer (title on the site: "Fashion designer"; based in Panadura, Sri Lanka; studying BA (Hons) Fashion and Textile Design at Northumbria University, 2024–2027) looking for her first role and for commissions and collaborations. The site tells her story from first screen to last through her collections, and ends with one action: **get in touch** ("Let’s make something together."). Success means a visitor understands her point of view within the first screens and contacts her.

## Positioning

Concept-led womenswear built on slow, hand-made craft rooted in Sri Lanka (hand-woven Dumbara textiles, Kandyan dance references, crochet, macramé, hand embroidery, reconstructed denim), with each collection carrying an emotional subject: mental healing, motherhood, stepping away from speed, renewal. Her collections read in sequence as **mind → body → nature → renewal**.

## Operating Context

- Collections so far: Mano Padana / මනෝ පාදන (SS25), Lunelle (AW26), Drift (SS27), Revive (SS27, in progress, no shoot yet). More will be added; a new collection must be data, not code (`.claude/skills/add-collection`).
- Each collection has some of: shoot photographs, portfolio pages (landscape A3/A4 boards), a logo, concept text that currently lives only inside the page images.
- Visitors arrive mostly from social links, frequently on mid-range Android phones in South Asia.

## Capabilities and Constraints

- **Routes:** `/` (the home story: her opening, then all four collections in journey order Mano Padana → Revive → Lunelle → Drift, then the contact card), `/collections` (editorial index), `/collections/<slug>` (each collection in depth), `/about`. `/work/*` redirects to `/collections/*` (`site/public/_redirects`).
- A collection page has the hero, "In my words", the shoot (ring or grid, full-screen viewer; absent for Revive) and the portfolio as an inline page reader with zoom and "Read the text".
- **Voice:** the whole site speaks in her first person ("I’m a fashion designer…", "My graduate collection"). Alt text stays descriptive and third person. No "draft" markers on the site.
- **Privacy:** contact only through the form. Never publish her phone number, her email address or her referees' details. LinkedIn (`linkedin.com/in/linali-andrea-831216363`) is the only outside link. No CV download unless she supplies a version with the referees removed.
- Image rules: originals never in git; EXIF/GPS stripped; web derivatives at 640/1280/2400 px.
- **Undecided:** page order for Mano Padana and Lunelle (current order is a guess); domain name; the business email behind the form.

## Brand Commitments

- Name: Linali Andrea. Monogram: Didone "LA" (`Linali Andrea logo.png`).
- Colours named by the client: Cream `#F2E8DA` (main), Brown `#3B2418`, Tropical teal `#008794` (small pop only).
- The site must not feel generic or AI-made; it must have a wow factor and be motion-led and immersive.
- Personal portraits are casual phone photos used deliberately, as collage (a flush cut-out and three taped polaroids; see `docs/ASSETS.md`).

## Evidence on Hand

- Shoot photos: Drift 17, Lunelle 10, Mano Padana 6, Revive none; seven inspiration photos.
- Portfolio pages: Drift pages 04–19, Revive 30–37, Mano Padana 10, Lunelle 22.
- Collection logos: Drift, Revive (PNG). No SVGs yet.
- **Her CV is on hand** (it is not published; it lists referees' phone numbers and emails). Facts on the site come only from it, from her portfolio text and collection JSON, or from copy she approved: studying BA (Hons) Fashion and Textile Design, Northumbria University 2024–2027; Design Intern, MAS India, 2025; represented Sri Lanka at four World Chess Championships, 2015–2021; skills in four groups (Craft, Design, Tools, People). The bio in `site.json` was approved by the user.
- **Absent, never to be invented:** anything beyond the above: awards, client names, testimonials, press, credits. New copy needs her approval.
- **Rights:** the user confirmed on 2026-11-24 (chat) that the models consented, and the Lunelle ultrasound image is treated as covered (`rights.confirmedBy` in each collection JSON). Still open: photographer credit, permission for the Revive / E.L.V. Denim collaboration name.

## Product Principles

1. The work leads; the interface steps back.
2. Every screen moves the story forward from header to contact card; nothing is filler.
3. Her own words and her own hand (collage, stitches, pattern pieces) over generic copy and decoration.
4. Adding a collection never needs new code.
5. Fast and readable on a mid-range phone, with or without motion.

## Accessibility & Inclusion

WCAG 2.2 AA: body text contrast ≥ 4.5:1 (teal never for small text), full keyboard access to carousel, viewer and deck, a complete `prefers-reduced-motion` path, pause for any motion longer than 5 s, text versions of portfolio pages, alt text describing every garment.
