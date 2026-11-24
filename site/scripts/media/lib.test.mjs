import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { parseOrder, isSpread, widthsFor, buildCollection, enhance, recolor, silhouette, buildInspiration } from './lib.mjs'

let fx, fxPortrait, fxWide, fxMixed, fxInspiration, logoFixture, strokeFixture, tmpRoot

async function img(file, width, height, withGps = false) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  let s = sharp({ create: { width, height, channels: 3, background: '#a07050' } })
  if (withGps) s = s.withExif({ IFD0: { Artist: 'camera' }, IFD3: { GPSLatitudeRef: 'N' } })
  await (file.endsWith('.png') ? s.png() : s.jpeg()).toFile(file)
}

beforeAll(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'media-'))
  await img(path.join(tmp, 'src/t/shoot/01-a.jpg'), 1200, 1800, true)
  await img(path.join(tmp, 'src/t/pages/04.png'), 2830, 1000)
  await img(path.join(tmp, 'src2/t/pages/01.png'), 500, 700)
  fx = { srcRoot: path.join(tmp, 'src'), outRoot: path.join(tmp, 'out'), urlPrefix: '', alt: { '01-a': 'A garment' } }
  fxPortrait = { srcRoot: path.join(tmp, 'src2'), outRoot: path.join(tmp, 'out2'), urlPrefix: '', alt: {} }
  await img(path.join(tmp, 'src3/t/pages/04.png'), 5000, 1768)
  await img(path.join(tmp, 'src4/t/pages/04.png'), 2830, 1000)
  await img(path.join(tmp, 'src4/t/pages/06.png'), 1414, 1000)
  fxMixed = { srcRoot: path.join(tmp, 'src4'), outRoot: path.join(tmp, 'out4'), urlPrefix: '', alt: {} }
  tmpRoot = tmp
  logoFixture = path.join(tmp, 'logo.png')
  await sharp({ create: { width: 8, height: 8, channels: 4, background: { r: 10, g: 20, b: 30, alpha: 1 } } }).png().toFile(logoFixture)
  // Black stroke (4x8 block) on white paper, with a white margin to be trimmed.
  strokeFixture = path.join(tmp, 'stroke.png')
  await sharp({ create: { width: 20, height: 20, channels: 3, background: '#ffffff' } })
    .composite([{ input: await sharp({ create: { width: 4, height: 8, channels: 3, background: '#000000' } }).png().toBuffer(), left: 8, top: 6 }])
    .png().toFile(strokeFixture)
  await img(path.join(tmp, 'insp/PXL_b.jpg.jpeg'), 1500, 1000)
  await img(path.join(tmp, 'insp/PXL_a.jpg.jpeg'), 900, 600)
  fxInspiration = { srcRoot: path.join(tmp, 'insp'), outRoot: path.join(tmp, 'out7'), urlPrefix: '' }
  fxWide = { srcRoot: path.join(tmp, 'src3'), outRoot: path.join(tmp, 'out3'), urlPrefix: '', alt: {} }
})

const fileOf = (url, root = fx.outRoot) => path.join(root, url.replace(/^https?:\/\/[^/]+/, ''))

test('parseOrder', () => {
  expect(parseOrder('03-MMS_1.jpg')).toBe(3)
  expect(parseOrder('18.png')).toBe(18)
  expect(() => parseOrder('x.png')).toThrow('No order prefix: x.png')
})

test('isSpread', () => {
  expect(isSpread(9922, 3508)).toBe(true)
  expect(isSpread(4960, 3508)).toBe(false)
})

test('widthsFor never upscales', () => {
  expect(widthsFor(4000)).toEqual([640, 1280, 2400])
  expect(widthsFor(1200)).toEqual([640, 1200])
  expect(widthsFor(1280)).toEqual([640, 1280])
  expect(widthsFor(500)).toEqual([500])
})

// Spreads are designed across the gutter (text and images cross it), so they stay whole.
test('spread stays one card at 2√2', async () => {
  const m = await buildCollection('t', fx)
  expect(m.pages.map((p) => p.id)).toEqual(['04'])
  expect(Math.abs(m.pages[0].width / m.pages[0].height - 2 * Math.SQRT2)).toBeLessThan(0.01)
})

test('a large spread gets a 4800px zoom image so its text stays readable', async () => {
  const p = (await buildCollection('t', fxWide)).pages[0]
  expect(p.zoom).toMatch(/04-4800\.webp$/)
  expect((await sharp(fileOf(p.zoom, fxWide.outRoot)).metadata()).width).toBe(4800)
})

test('non-√2 page is padded, not cropped', async () => {
  const p = (await buildCollection('t', fxPortrait)).pages[0]
  expect(Math.abs(p.width / p.height - Math.SQRT2)).toBeLessThan(0.01)
  expect(p.height).toBe(700)
})

test('EXIF is stripped', async () => {
  const m = await buildCollection('t', fx)
  expect((await sharp(fileOf(m.shoot[0].src)).metadata()).exif).toBeUndefined()
})

test('missing alt fails with the file name', async () => {
  await expect(buildCollection('t', { ...fx, alt: {} })).rejects.toThrow('Missing alt for 01-a')
})

test('urls carry the prefix', async () => {
  const m = await buildCollection('t', { ...fx, urlPrefix: 'https://media.x' })
  expect(m.shoot[0].src.startsWith('https://media.x/media/t/shoot/')).toBe(true)
  expect(fs.existsSync(fileOf(m.shoot[0].src))).toBe(true)
})

test('mixed spreads and single pages fail instead of cropping in the deck', async () => {
  await expect(buildCollection('t', fxMixed)).rejects.toThrow('Mixed page ratios in t')
})

test('a failed build keeps the previous output', async () => {
  const outRoot = path.join(tmpRoot, 'out5')
  const keep = path.join(outRoot, 'media/t/shoot/old.webp')
  fs.mkdirSync(path.dirname(keep), { recursive: true })
  fs.writeFileSync(keep, 'x')
  await expect(buildCollection('t', { ...fx, outRoot, alt: {} })).rejects.toThrow('Missing alt')
  expect(fs.existsSync(keep)).toBe(true)
})

test('a successful build replaces stale output', async () => {
  const outRoot = path.join(tmpRoot, 'out6')
  const stale = path.join(outRoot, 'media/t/shoot/stale.webp')
  fs.mkdirSync(path.dirname(stale), { recursive: true })
  fs.writeFileSync(stale, 'x')
  await buildCollection('t', { ...fx, outRoot })
  expect(fs.existsSync(stale)).toBe(false)
})

test('enhance keeps size and strips metadata', async () => {
  const out = await enhance(sharp(path.join(tmpRoot, 'src/t/shoot/01-a.jpg'))).jpeg().toBuffer()
  const m = await sharp(out).metadata()
  expect([m.width, m.height]).toEqual([1200, 1800])
  expect(m.exif).toBeUndefined()
})

test('recolor fills every visible pixel with the colour and keeps alpha', async () => {
  const px = await sharp(await recolor(logoFixture, '#F2E8DA')).ensureAlpha().raw().toBuffer()
  expect([...px.subarray(0, 4)]).toEqual([0xf2, 0xe8, 0xda, 255])
})

test('silhouette makes dark strokes opaque brown and white paper transparent, trimmed', async () => {
  const { data, info } = await sharp(await silhouette(strokeFixture, '#3B2418')).raw().toBuffer({ resolveWithObject: true })
  expect([info.width, info.height]).toEqual([4, 8])
  expect([...data.subarray(0, 4)]).toEqual([0x3b, 0x24, 0x18, 255])
})

test('inspiration is built in filename order as 1…n', async () => {
  const list = await buildInspiration(fxInspiration)
  expect(list.map((i) => i.id)).toEqual(['1', '2'])
  expect(list[0].width).toBe(900) // PXL_a sorts first
  expect(list[0].srcset.webp).toMatch('/media/inspiration/1-640.webp')
  expect(list[0].srcset.webp).toMatch('/media/inspiration/1-900.webp')
})
