// Flush cut-out of her (no sticker border) + a square face crop, for the Phase 2 About page.
// Start from the raw background-removed cut (tools/media/cutout.mjs makes it); no background removal here.
// Usage: node tools/media/flush.mjs   (sharp is the one copy in site/node_modules; see CLAUDE.md)
import { createRequire } from 'node:module'
import path from 'node:path'
const sharp = createRequire(import.meta.url)('../../site/node_modules/sharp')
sharp.cache(false)

const personal = path.resolve(import.meta.dirname, '../../media-src/personal')

// Same logic as treat.mjs: drop ghost alpha, stretch the rest, keep only the biggest connected shape.
function keepLargest(d, w, h) {
  const lab = new Int32Array(w * h), sizes = [0]; let best = 0
  for (let p = 0; p < w * h; p++) {
    if (lab[p] || !d[p * 4 + 3]) continue
    const id = sizes.length; let n = 0; const st = [p]; lab[p] = id
    while (st.length) {
      const q = st.pop(); n++; const x = q % w, y = (q / w) | 0
      for (const r of [x > 0 ? q - 1 : -1, x < w - 1 ? q + 1 : -1, y > 0 ? q - w : -1, y < h - 1 ? q + w : -1])
        if (r >= 0 && !lab[r] && d[r * 4 + 3]) { lab[r] = id; st.push(r) }
    }
    sizes.push(n); if (!best || n > sizes[best]) best = id
  }
  for (let p = 0; p < w * h; p++) if (lab[p] !== best) d[p * 4 + 3] = 0
}

const { data, info } = await sharp(path.join(personal, 'originals/20261120_115442.cutout.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 3; i < data.length; i += 4) { const a = data[i]; data[i] = a < 90 ? 0 : Math.min(255, Math.round(((a - 90) * 255) / 120)) }
keepLargest(data, info.width, info.height)
const trimmed = await sharp(data, { raw: info }).trim({ threshold: 1 }).raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = trimmed.info
// A stray strap sits left of the hem: clear it (coordinates are in the trimmed cut).
for (let y = 2300; y < h; y++) for (let x = 0; x < Math.min(455, w); x++) trimmed.data[(y * w + x) * 4 + 3] = 0

await sharp(trimmed.data, { raw: trimmed.info })
  .trim({ threshold: 1 })
  .linear(1.03, -3)
  .modulate({ brightness: 1.02, saturation: 1.04 })
  .sharpen({ sigma: 0.7, m1: 0.5, m2: 1.2 })
  .png()
  .toFile(path.join(personal, 'her-flush.png'))

const chair = sharp(path.join(personal, 'chair-graded.jpg'))
const { width: cw, height: ch } = await chair.metadata()
const side = Math.round(0.36 * cw)
await chair
  .extract({ left: Math.round(0.58 * cw - side / 2), top: Math.round(0.44 * ch - side / 2), width: side, height: side })
  .resize(480, 480)
  .jpeg({ quality: 88 })
  .toFile(path.join(personal, 'face.jpg'))
console.log('her-flush.png', w, 'x', h, '(before final trim); face.jpg 480x480')
