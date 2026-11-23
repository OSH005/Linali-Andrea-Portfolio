import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { parseOrder, isSpread, needsPad, widthsFor, buildCollection } from './lib.mjs'

let fx, fxPortrait

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

test('needsPad', () => {
  expect(needsPad(4960, 3508)).toBe(false)
  expect(needsPad(1905, 2648)).toBe(true)
})

test('widthsFor never upscales', () => {
  expect(widthsFor(4000)).toEqual([640, 1280, 2400])
  expect(widthsFor(1200)).toEqual([640])
  expect(widthsFor(500)).toEqual([500])
})

test('spread splits into two numbered pages', async () => {
  const m = await buildCollection('t', fx)
  expect(m.pages.map((p) => p.id)).toEqual(['04', '05'])
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
