// Real-browser checks against the static export (npm run test:browser builds first). Edge via playwright-core.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'

const out = path.resolve(import.meta.dirname, '../../out')
const drift = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../../content/collections/drift.json'), 'utf8'))
const ROUTES = ['/', '/collections/', '/collections/drift/', '/collections/revive/', '/about/']
const SIZES = [[320, 640], [390, 844], [768, 1024], [1024, 768], [1440, 900]]
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain' }

let server, base, browser
beforeAll(async () => {
  server = http.createServer((req, res) => {
    let f = path.join(out, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (f.endsWith(path.sep) || !path.extname(f)) f = path.join(f, 'index.html')
    if (!f.startsWith(out) || !fs.existsSync(f)) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream' })
    fs.createReadStream(f).pipe(res)
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${server.address().port}`
  browser = await chromium.launch({ channel: 'msedge' })
})
afterAll(async () => {
  await browser?.close()
  server?.close()
})

/** A page in a fresh context; collects page errors and 4xx/5xx responses. */
async function open(route, { width = 390, height = 844, ...opts } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, ...opts })
  const page = await ctx.newPage()
  const errors = [], bad = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`))
  await page.goto(base + route, { waitUntil: 'networkidle' })
  return { page, ctx, errors, bad }
}

describe.each(SIZES)('%ix%i', (width, height) => {
  test.each(ROUTES)('%s: nothing scrolls sideways, no page errors, no 4xx', async (route) => {
    const { page, ctx, errors, bad } = await open(route, { width, height })
    // scroll through the page so lazy images and scroll-driven layouts run
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < total; y += height * 2) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await page.waitForTimeout(60)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `sideways scroll at y=${y}`).toBe(true)
    }
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
    expect(bad).toEqual([])
    await ctx.close()
  })
})

test.each(ROUTES)('without JavaScript %s shows its headings', async (route) => {
  const { page, ctx } = await open(route, { javaScriptEnabled: false })
  const hidden = await page.$$eval('h1, h2, h3', (hs) =>
    hs.filter((h) => !h.closest('dialog')).filter((h) => {
      const r = h.getBoundingClientRect(), cs = getComputedStyle(h)
      return !(r.width > 0 && r.height > 0 && cs.visibility === 'visible' && +cs.opacity > 0)
    }).map((h) => h.textContent),
  )
  expect(hidden).toEqual([])
  if (route === '/') {
    const text = await page.evaluate(() => document.getElementById('drift').innerText)
    for (const look of drift.looks) expect(text).toContain(look.text)
  }
  if (route === '/collections/drift/') {
    const imgs = await page.$$eval('#shoot img', (is) => is.map((i) => [i.getBoundingClientRect().width > 0 && getComputedStyle(i).visibility === 'visible', i.naturalWidth > 0]))
    expect(imgs.length).toBeGreaterThanOrEqual(17) // her 17 photographs
    expect(imgs.filter(([seen, loaded]) => !seen || !loaded)).toEqual([])
  }
  await ctx.close()
})

test.each(ROUTES)('reduced motion %s: nothing keeps moving after 2s, no home stage', async (route) => {
  const { page, ctx } = await open(route, { reducedMotion: 'reduce' })
  await page.waitForTimeout(2000)
  const snap = () => page.evaluate(() => [...document.querySelectorAll('body *')].map((e) => getComputedStyle(e).transform).join('|'))
  const running = await page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === 'running').filter((a) => a.effect?.getKeyframes().some((k) => k.transform || k.translate || k.rotate || k.scale)).length,
  )
  expect(running).toBe(0)
  const a = await snap()
  await page.waitForTimeout(400)
  expect(await snap()).toBe(a)
  expect(await page.$('[data-stage]')).toBeNull()
  await ctx.close()
})

test.each(['/about/', '/collections/drift/'])('390x844 %s: at the bottom, the contact card starts below the last section', async (route) => {
  const { page, ctx } = await open(route)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(1500)
  const [foot, last] = await page.evaluate(() => [document.getElementById('contact').getBoundingClientRect().top, [...document.querySelectorAll('main > section')].at(-1).getBoundingClientRect().bottom])
  expect(foot).toBeGreaterThanOrEqual(last - 0.5)
  await ctx.close()
})

test('390x844 /about/: every skill list ends above its cut marking, in type of at least 12px', async () => {
  const { page, ctx } = await open('/about/')
  await page.evaluate(() => document.getElementById('skills').scrollIntoView())
  await page.waitForTimeout(3500) // the drop runs about 2.2s
  const pieces = await page.$$eval('#skills figure', (fs) =>
    fs.map((f) => {
      const ul = f.querySelector('ul'), cut = f.querySelector('[data-cut]')
      const lim = cut.offsetTop > ul.offsetTop ? cut.offsetTop : f.clientHeight
      return { bottom: ul.offsetTop + ul.offsetHeight, lim, px: parseFloat(getComputedStyle(ul).fontSize) }
    }),
  )
  expect(pieces).toHaveLength(4)
  for (const p of pieces) {
    expect(p.bottom).toBeLessThanOrEqual(p.lim)
    expect(p.px).toBeGreaterThanOrEqual(12)
  }
  await ctx.close()
})

describe.each([[320, 640], [1440, 900]])('%ix%i', (width, height) => {
  test.each(ROUTES.flatMap((r) => [[r, 'reduce'], [r, 'no-preference']]))('%s (%s motion): no visible text under 12px', async (route, reducedMotion) => {
    const { page, ctx } = await open(route, { width, height, reducedMotion })
    await page.waitForTimeout(500)
    const small = await page.evaluate(() => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? 1 : 2) })
      const bad = new Set()
      for (let n; (n = w.nextNode()); ) {
        const e = n.parentElement
        // the "16 SKILLS" print on the tape measure (/about) is drawing, not copy: an aria-hidden SVG scaled with its picture
        if (e.closest('dialog:not([open]), script, style, noscript, svg[aria-hidden="true"]')) continue
        if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || e.getClientRects().length === 0) continue
        const cs = getComputedStyle(e)
        if (cs.clipPath.startsWith('inset(50%') || cs.clip === 'rect(0px, 0px, 0px, 0px)') continue // visually hidden (sr-only)
        if (parseFloat(cs.fontSize) < 12) bad.add(`${parseFloat(cs.fontSize).toFixed(1)}px ${e.tagName} "${n.textContent.trim().slice(0, 30)}"`)
      }
      return [...bad]
    })
    expect(small).toEqual([])
    await ctx.close()
  })
})

const overlap = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

test.each([[844, 390], [932, 430]])('phone turned sideways %ix%i: the Shoot | Portfolio switch never covers the ring or the reader', async (width, height) => {
  const { page, ctx } = await open('/collections/drift/', { width, height })
  const tops = await page.evaluate(() => ['shoot', 'portfolio'].map((id) => document.getElementById(id).getBoundingClientRect().top + scrollY))
  for (const y of [tops[0] + 200, tops[0] + 400, tops[1], tops[1] + 300]) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(700)
    const hit = await page.evaluate(() => {
      const sw = document.querySelector('nav[aria-label="Shoot or portfolio"]'), r = sw?.getBoundingClientRect()
      if (!sw || !r.width || getComputedStyle(sw).opacity === '0') return 0
      return [...document.querySelectorAll('#shoot figure, #shoot figcaption, #shoot p, #portfolio img, #portfolio button')]
        .map((e) => e.getBoundingClientRect())
        .filter((b) => b.width && b.left < r.right && r.left < b.right && b.top < r.bottom && r.top < b.bottom).length
    })
    expect(hit, `at y=${y}`).toBe(0)
  }
  await ctx.close()
})

test('phone turned sideways: the home page reads as the stacked page (no stage)', async () => {
  const { page, ctx } = await open('/', { width: 844, height: 390 })
  expect(await page.$('[data-stage]')).toBeNull()
  await ctx.close()
})

const motion = (page, v) => page.evaluate((v) => (localStorage.setItem('la-motion', v), dispatchEvent(new Event('la-motion'))), v)
/** Scrolls the stacked home page into Drift (its section top a little above mid-screen). */
const intoDrift = (page) => page.evaluate(() => window.scrollTo({ top: document.getElementById('drift').getBoundingClientRect().top + scrollY + 200, behavior: 'instant' }))

test('1440x900 home: Motion back on from the stacked page at Drift lands in the Drift scene', async () => {
  const { page, ctx } = await open('/', { width: 1440, height: 900 })
  await motion(page, 'off')
  await page.waitForFunction(() => !document.querySelector('[data-stage]'))
  await intoDrift(page)
  await page.waitForTimeout(300)
  await motion(page, 'on')
  await page.waitForSelector('[data-stage]')
  await page.waitForTimeout(600)
  expect(await page.$eval('[data-stage]', (e) => e.dataset.chapter)).toBe('4')
  await ctx.close()
})

test('home: a phone turned back from sideways to portrait at Drift stays in the Drift scene', async () => {
  const { page, ctx } = await open('/', { width: 844, height: 390 })
  await intoDrift(page)
  await page.waitForTimeout(300)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForSelector('[data-stage]')
  await page.waitForTimeout(800)
  expect(await page.$eval('[data-stage]', (e) => e.dataset.chapter)).toBe('4')
  await ctx.close()
})

test.each([['off', false], ['on', true]])('Motion %s in the header: the page change view transition runs: %s', async (pref, want) => {
  const { page, ctx } = await open('/collections/', { width: 1440, height: 900 })
  await ctx.addInitScript(() => addEventListener('pagereveal', (e) => {
    window.__vt = 'none'
    e.viewTransition?.ready.then(() => (window.__vt = 'ran'), () => (window.__vt = 'skipped'))
  }))
  await motion(page, pref)
  await Promise.all([page.waitForURL('**/about/'), page.click('header a[href="/about/"]')])
  await page.waitForFunction(() => window.__vt && window.__vt !== 'pending', null, { timeout: 5000 })
  expect(await page.evaluate(() => window.__vt === 'ran')).toBe(want) // off: skipped on the old page (none) or the new (skipped)
  await ctx.close()
})

test('OS reduced motion but Motion turned on: CSS transitions run again', async () => {
  const { page, ctx } = await open('/collections/', { width: 1440, height: 900, reducedMotion: 'reduce' })
  const dur = () => page.$eval('header a[href="/about/"]', (e) => getComputedStyle(e).transitionDuration)
  expect(await dur()).toBe('1e-05s')
  await page.click('header button[aria-label="Motion"]') // the visitor's own choice, mid-visit
  expect(await dur()).not.toBe('1e-05s')
  await ctx.close()
})

test('1440x900 collection: the hero strip stops painting once it is off screen', async () => {
  const { page, ctx } = await open('/collections/drift/', { width: 1440, height: 900 })
  const strip = () => page.$eval('#hero > div', (e) => e.style.transform)
  const a = await strip()
  await page.waitForTimeout(500)
  expect(await strip()).not.toBe(a) // it drifts while seen
  await page.evaluate(() => window.scrollTo(0, document.getElementById('portfolio').getBoundingClientRect().top + scrollY))
  await page.waitForTimeout(500)
  const b = await strip()
  await page.waitForTimeout(500)
  expect(await strip()).toBe(b)
  await ctx.close()
})

test.each([[1440, 900], [390, 844]])('%ix%i home: the first Tab shows a skip link that jumps past the story to the contact card', async (width, height) => {
  const { page, ctx } = await open('/', { width, height })
  const skip = page.locator('a[href="#contact"]', { hasText: 'Skip to contact' })
  expect(await skip.evaluate((e) => e.getBoundingClientRect().bottom <= 0)).toBe(true) // out of sight until focused
  await page.keyboard.press('Tab')
  expect(await skip.evaluate((e) => e === document.activeElement && e.getBoundingClientRect().top >= 0)).toBe(true)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(800)
  expect(await page.evaluate(() => [document.activeElement.id, document.getElementById('contact').getBoundingClientRect().top < innerHeight])).toEqual(['contact', true])
  await ctx.close()
})

test('1023x768 home: the Revive pile clears her logo', async () => {
  const { page, ctx } = await open('/', { width: 1023, height: 768 })
  await page.waitForSelector('[data-stage]')
  // sentence steps of Revive: 300+500+700+1380+420 units before it, 1020 long (timeline.ts), at a 768px screen
  for (const k of [0.2, 0.5, 0.9]) {
    await page.evaluate((y) => window.scrollTo(0, y), ((3300 + 1020 * k) * 768) / 900)
    await page.waitForTimeout(900)
    const [pile, logo] = await page.evaluate(() => [document.querySelector('#revive .wrap > div:last-child > picture:last-child'), document.getElementById('home-rv')].map((e) => e.getBoundingClientRect().toJSON()))
    expect(overlap(pile, logo), `k=${k} pile ${JSON.stringify(pile)} logo ${JSON.stringify(logo)}`).toBe(false)
  }
  await ctx.close()
})
