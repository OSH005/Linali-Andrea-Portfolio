# Prompt: Phase 4, Launch

Open this folder in Claude Code, start a **new session**, and paste everything below the line. Run this after Phase 3 is merged and the client has confirmed consent (see `docs/START-HERE.md`).

---

You are taking Linali Andrea's portfolio site live. Phases 1–3 are merged to `main`. The site is a static export (`site/out`). The plan is **Cloudflare Pages** (free, commercial use allowed, fast in South Asia), a contact-form service, Cloudflare Web Analytics, and her own domain.

## Read first
`CLAUDE.md`, `PRODUCT.md`, the top block of `PLAN.md` (sections 5–7 cover hosting, images and security), and `docs/START-HERE.md`.

## Ground rules for this phase
- **Ask before anything outward-facing:**
  - creating accounts or repositories,
  - pushing,
  - connecting services,
  - changing DNS,
  - publishing.

  I do the sign-ins and payments myself. Tell me exactly what to click when a step needs me.
- The repository must be **private**: it contains the client's unreleased work.
- **Never put secrets in the repo.** Form keys and site URLs go into Cloudflare's environment variables. Keep `site/.env.example` up to date with names only.
- Work on a branch `phase-4-launch`. Plan with `superpowers:writing-plans`, show me, then execute.

## Steps

**1. Pre-flight (in the repo)**
- `PUBLISH=1 npm run build` must pass. The rights gate from Phase 3 proves consent is recorded. If it fails, stop and tell me which consent is missing.
- `npm test`, `npm run test:build` and `npm run test:e2e` green.
- `site/out` total size is reported. It must stay well under Cloudflare Pages' limits (20,000 files, 25 MB per file).

**2. Security headers**
Add `site/public/_headers` for Cloudflare Pages with:
- `Content-Security-Policy`, with:
  - `default-src 'self'`,
  - images from `'self' data:`,
  - `connect-src`/`form-action` limited to the chosen form service's domain,
  - Cloudflare Web Analytics (`static.cloudflareinsights.com`, `cloudflareinsights.com`),
  - `frame-ancestors 'none'`.
  Check that Next's inline scripts still run (a hash/nonce, or `'unsafe-inline'` for scripts only if unavoidable; explain the trade-off).
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Long cache (`Cache-Control: public, max-age=31536000, immutable`) for `/_next/static/*` and `/media/*`.

Verify the headers on the preview deployment with `curl -I`.

**3. Contact form**
- Help me create a free Web3Forms or Formspree form that delivers to her **business** email alias, not her personal one.
- Set `NEXT_PUBLIC_CONTACT_ENDPOINT` in Cloudflare (production and preview).
- Turn on the service's spam filtering. The honeypot field is `_gotcha`.
- Send a real test message from the preview deployment and confirm it arrives.

**4. Repository and Cloudflare Pages**
- **GitHub:**
  - Create a private repo with me (I sign in). Add it as `origin`.
  - Push `main`. Don't push `media-src/`: it's git-ignored, check anyway.
- **Cloudflare Pages:** I connect the repo. Settings:
  - root directory `site`
  - build command `npm run build`
  - output directory `out`
  - `NODE_VERSION=24`
  - env vars `NEXT_PUBLIC_CONTACT_ENDPOINT`, `NEXT_PUBLIC_SITE_URL`
- Check the preview deployment: every route, images, the deck, the form, headers.

**5. Domain and analytics**
- Connect her domain in Cloudflare (I handle DNS access), with HTTPS on and `www` redirecting to the apex (or the reverse; ask me).
- Turn on **Cloudflare Web Analytics**. It's cookie-free, so no cookie banner is needed. Confirm no other third-party requests are made (check the network log).

**6. Launch checks on the live URL**
- Lighthouse mobile on `/` and `/collections/drift/`.
- `impeccable shot` at 1440 and 390 for every route.
- Open-graph previews: test one collection link in a social preview debugger.
- `sitemap.xml` and `robots.txt` reachable. Submit the sitemap in Google Search Console if I want it (ask).

**7. Handover**
Write `docs/OPERATIONS.md`:
- how to add a collection (the `add-collection` skill, then push to `main` and Cloudflare deploys),
- how to update portraits (the `treat-portraits` skill),
- where the form and analytics accounts live (account names only, no passwords),
- how to roll back a deploy in Cloudflare,
- when to move images to Cloudflare R2 (PLAN.md section 6: ~1 GB or ~15,000 files, via `MEDIA_BASE_URL`).

## Done means
The site is live on her domain over HTTPS, the form delivers, headers verified, analytics recording, no secrets in the repo, and `docs/OPERATIONS.md` written. Report the live URL, the Lighthouse numbers, and anything still waiting on the client.
