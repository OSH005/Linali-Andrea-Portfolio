import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { parseOrder, isSpread, widthsFor, buildCollection } from './lib.mjs'

let fx, fxPortrait, fxWide

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
  expect(widthsFor(1200)).toEqual([640])
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
