// Media build: originals in media-src → web images + manifest entries (PLAN.md section 6).
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

// libvips' cache keeps file handles open on Windows, which blocks rewriting outputs.
sharp.cache(false)

const WIDTHS = [640, 1280, 2400]
const PAPER = { r: 0xfb, g: 0xf8, b: 0xf3, alpha: 1 }
const isImage = (f) => /\.(jpe?g|png|webp)$/i.test(f)
const pad2 = (n) => String(n).padStart(2, '0')
const stem = (f) => f.replace(/\.[^.]+$/, '')

export function parseOrder(fileName) {
  const m = /^(\d+)[-.]/.exec(fileName)
  if (!m) throw new Error(`No order prefix: ${fileName}`)
  return Number(m[1])
}

export const isSpread = (w, h) => w / h > 2.5
// Standard tiers below the source width, plus the source's own width (capped at 2400), never upscaled.
const MAX = WIDTHS[WIDTHS.length - 1]
export const widthsFor = (w) => (w < WIDTHS[0] ? [w] : [...WIDTHS.filter((x) => x < Math.min(w, MAX)), Math.min(w, MAX)])

// Gentle, garment-safe lift for photographs (spec 9): no upscaling, no recolouring. Never for cut-outs, pages or logos.
export const enhance = (s) =>
  s
    .rotate()
    .resize({ fit: 'inside', kernel: 'lanczos3' })
    .linear(1.05, -5)
    .modulate({ brightness: 1.02, saturation: 1.05 })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 1.2 })

// Decoded once, upright, metadata dropped (sharp never copies EXIF unless asked).
async function load(file, { enhanced = false } = {}) {
  return (enhanced ? enhance(sharp(file)) : sharp(file).rotate()).raw().toBuffer({ resolveWithObject: true })
}
const fromRaw = ({ data, info }) => sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })

// Pads on paper colour to the target ratio; never crops.
async function padTo(img, ratio) {
  const { width: w, height: h } = img.info
  const W = Math.max(w, Math.round(h * ratio))
  const H = Math.max(h, Math.round(w / ratio))
  const x = W - w, y = H - h
  return fromRaw(img)
    .extend({ left: Math.floor(x / 2), right: Math.ceil(x / 2), top: Math.floor(y / 2), bottom: Math.ceil(y / 2), background: PAPER })
    .raw()
    .toBuffer({ resolveWithObject: true })
}

async function emit(img, { folder, id, order, outRoot, urlPrefix, zoomWidth }) {
  const { width, height } = img.info
  const dir = path.join(outRoot, 'media', folder)
  fs.mkdirSync(dir, { recursive: true })
  const ws = widthsFor(width)
  const url = (w, fmt) => `${urlPrefix}/media/${folder}/${id}-${w}.${fmt}`
  const srcset = { avif: [], webp: [] }
  for (const w of ws) {
    for (const fmt of ['avif', 'webp']) {
      await fromRaw(img).resize({ width: w }).toFormat(fmt, { quality: fmt === 'avif' ? 55 : 80 }).toFile(path.join(dir, `${id}-${w}.${fmt}`))
      srcset[fmt].push(`${url(w, fmt)} ${w}w`)
    }
  }
  const tiny = await fromRaw(img).resize({ width: 16 }).webp({ quality: 40 }).toBuffer()
  const largest = ws[ws.length - 1]
  // Extra zoom-only size (WebP) for wide spreads, whose body text is tiny at 2400px.
  const bigZoom = zoomWidth && width >= zoomWidth
  if (bigZoom) await fromRaw(img).resize({ width: zoomWidth }).webp({ quality: 80 }).toFile(path.join(dir, `${id}-${zoomWidth}.webp`))
  return {
    id,
    order,
    width,
    height,
    placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
    srcset: { avif: srcset.avif.join(', '), webp: srcset.webp.join(', ') },
    src: url(ws.includes(1280) ? 1280 : largest, 'webp'),
    zoom: url(bigZoom ? zoomWidth : largest, 'webp'),
  }
}

export async function buildImage(file, { enhanced, ...opts }) {
  return emit(await load(file, { enhanced }), opts)
}

const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

// `input` is a path or a PNG buffer. Returns a PNG: the colour `hex` everywhere, with `alpha` (1 channel raw) as its alpha.
async function solid(width, height, hex, alpha) {
  const [r, g, b] = hexRgb(hex)
  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) rgba.set([r, g, b, alpha[i]], i * 4)
  return sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer()
}

// Keeps the alpha of a transparent mark (path or buffer), fills its colour.
export async function recolor(input, hex) {
  const { data, info } = await sharp(input).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true })
  return solid(info.width, info.height, hex, data)
}

// Dark ink on paper (opaque) becomes a transparent mark: alpha from darkness, filled `hex`, trimmed.
export async function silhouette(file, hex) {
  const { data, info } = await sharp(file).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const alpha = Buffer.alloc(w * h)
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let i = 0; i < w * h; i++) {
    const a = 255 - data[i]
    const v = a < 12 ? 0 : a > 243 ? 255 : Math.round(((a - 12) * 255) / 231) // paper noise drops out
    alpha[i] = v
    if (v) {
      const x = i % w, y = (i / w) | 0
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
    }
  }
  if (x1 < 0) throw new Error(`silhouette: no ink in ${file}`)
  return sharp(await solid(w, h, hex, alpha)).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer()
}

export async function buildCollection(slug, { srcRoot, outRoot, urlPrefix = '', alt = {} }) {
  const dir = path.join(srcRoot, slug)
  const ctx = { outRoot, urlPrefix }
  const list = (sub) => {
    const d = path.join(dir, sub)
    return fs.existsSync(d) ? fs.readdirSync(d).filter(isImage).sort((a, b) => parseOrder(a) - parseOrder(b)) : []
  }

  // Fail before any heavy work: every shoot photo needs alt text.
  const shootFiles = list('shoot')
  for (const f of shootFiles) if (!alt[stem(f)]) throw new Error(`Missing alt for ${stem(f)}`)

  // The deck uses one aspect per collection, so spreads and single pages must not mix.
  const pageFiles = list('pages')
  const kinds = new Set()
  for (const f of pageFiles) {
    const m = await sharp(path.join(dir, 'pages', f)).metadata()
    const [w, h] = (m.orientation ?? 1) >= 5 ? [m.height, m.width] : [m.width, m.height]
    kinds.add(isSpread(w, h))
  }
  if (kinds.size > 1) throw new Error(`Mixed page ratios in ${slug}: use all spreads or all single pages`)

  // Only now replace the previous output, so a failed build never leaves the site without images.
  fs.rmSync(path.join(outRoot, 'media', slug), { recursive: true, force: true })

  const shoot = []
  for (const f of shootFiles) {
    shoot.push(await buildImage(path.join(dir, 'shoot', f), { ...ctx, enhanced: true, folder: `${slug}/shoot`, id: stem(f), order: parseOrder(f) }))
  }

  const pages = []
  for (const f of pageFiles) {
    const n = parseOrder(f)
    const img = await load(path.join(dir, 'pages', f))
    const { width: w, height: h } = img.info
    // A spread is designed across its gutter, so it stays one card at 2√2.
    const spread = isSpread(w, h)
    const ratio = spread ? 2 * Math.SQRT2 : Math.SQRT2
    const page = Math.abs(w / h - ratio) > 0.02 ? await padTo(img, ratio) : img
    pages.push(await emit(page, { ...ctx, folder: `${slug}/pages`, id: pad2(n), order: n, zoomWidth: spread ? 4800 : undefined }))
  }

  const result = { shoot, pages }
  for (const kind of ['cover', 'logo']) {
    const f = fs.existsSync(dir) && fs.readdirSync(dir).find((x) => stem(x) === kind && isImage(x))
    if (f) result[kind] = await buildImage(path.join(dir, f), { ...ctx, folder: slug, id: kind, order: 0 })
  }
  return result
}

export async function buildPersonal({ srcRoot, outRoot, urlPrefix = '' }) {
  const dir = path.join(srcRoot, 'personal')
  const out = {}
  for (const f of fs.readdirSync(dir).filter(isImage).sort()) {
    // Photographs are enhanced; PNG cut-outs keep their alpha untouched.
    const enhanced = /.(jpe?g|webp)$/i.test(f)
    out[stem(f)] = await buildImage(path.join(dir, f), { outRoot, urlPrefix, folder: 'personal', id: stem(f), order: 0, enhanced })
  }
  return out
}

// srcRoot is the Inspiration folder itself. Filename order becomes ids 1…n, 640/1280 wide.
export async function buildInspiration({ srcRoot, outRoot, urlPrefix = '' }) {
  fs.rmSync(path.join(outRoot, 'media', 'inspiration'), { recursive: true, force: true })
  const out = []
  for (const [i, f] of fs.readdirSync(srcRoot).filter(isImage).sort().entries()) {
    // Downscale first so the sharpening lands at the delivered size.
    const small = await sharp(path.join(srcRoot, f)).rotate().resize({ width: 1280, withoutEnlargement: true }).toBuffer()
    out.push(await buildImage(small, { outRoot, urlPrefix, folder: 'inspiration', id: String(i + 1), order: i + 1, enhanced: true }))
  }
  return out
}
