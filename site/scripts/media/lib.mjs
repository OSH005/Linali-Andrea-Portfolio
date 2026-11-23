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
export const needsPad = (w, h) => Math.abs(w / h - Math.SQRT2) > 0.02
export const widthsFor = (w) => (w < WIDTHS[0] ? [w] : WIDTHS.filter((x) => x <= w))

// Decoded once, upright, metadata dropped (sharp never copies EXIF unless asked).
async function load(file) {
  return sharp(file).rotate().raw().toBuffer({ resolveWithObject: true })
}
const fromRaw = ({ data, info }) => sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })

async function crop(img, left, width) {
  return fromRaw(img).extract({ left, top: 0, width, height: img.info.height }).raw().toBuffer({ resolveWithObject: true })
}

async function padToSqrt2(img) {
  const { width: w, height: h } = img.info
  const W = Math.max(w, Math.round(h * Math.SQRT2))
  const H = Math.max(h, Math.round(w / Math.SQRT2))
  const x = W - w, y = H - h
  return fromRaw(img)
    .extend({ left: Math.floor(x / 2), right: Math.ceil(x / 2), top: Math.floor(y / 2), bottom: Math.ceil(y / 2), background: PAPER })
    .raw()
    .toBuffer({ resolveWithObject: true })
}

async function emit(img, { folder, id, order, outRoot, urlPrefix }) {
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
  return {
    id,
    order,
    width,
    height,
    placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
    srcset: { avif: srcset.avif.join(', '), webp: srcset.webp.join(', ') },
    src: url(ws.includes(1280) ? 1280 : largest, 'webp'),
    zoom: url(largest, 'webp'),
  }
}

export async function buildImage(file, opts) {
  return emit(await load(file), opts)
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

  const shoot = []
  for (const f of shootFiles) {
    shoot.push(await buildImage(path.join(dir, 'shoot', f), { ...ctx, folder: `${slug}/shoot`, id: stem(f), order: parseOrder(f) }))
  }

  const pages = []
  for (const f of list('pages')) {
    const n = parseOrder(f)
    const img = await load(path.join(dir, 'pages', f))
    const { width: w, height: h } = img.info
    const half = Math.floor(w / 2)
    const parts = isSpread(w, h) ? [await crop(img, 0, half), await crop(img, half, w - half)] : [img]
    for (const [i, part] of parts.entries()) {
      const page = needsPad(part.info.width, part.info.height) ? await padToSqrt2(part) : part
      pages.push(await emit(page, { ...ctx, folder: `${slug}/pages`, id: pad2(n + i), order: n + i }))
    }
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
    out[stem(f)] = await buildImage(path.join(dir, f), { outRoot, urlPrefix, folder: 'personal', id: stem(f), order: 0 })
  }
  return out
}
