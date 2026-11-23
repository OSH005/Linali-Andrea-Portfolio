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
export const widthsFor = (w) => (w < WIDTHS[0] ? [w] : WIDTHS.filter((x) => x <= w))

// Decoded once, upright, metadata dropped (sharp never copies EXIF unless asked).
async function load(file) {
  return sharp(file).rotate().raw().toBuffer({ resolveWithObject: true })
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
    out[stem(f)] = await buildImage(path.join(dir, f), { outRoot, urlPrefix, folder: 'personal', id: stem(f), order: 0 })
  }
  return out
}
