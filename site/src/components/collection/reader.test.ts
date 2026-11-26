import { getMedia } from '@/lib/media'
import { loupeStyle, readerPages, zoomOffset } from './reader'

test('readerPages: Drift (8 spreads) splits into 16 alternating halves only when narrow', () => {
  const drift = getMedia('drift').pages
  const narrow = readerPages(drift, true)
  expect(narrow).toHaveLength(16)
  expect(narrow.map((p) => p.half)).toEqual(Array.from({ length: 16 }, (_, i) => i % 2))
  expect(narrow[0].image).toBe(drift[0])
  expect(narrow[1].image).toBe(drift[0])
  expect(narrow[0].ar).toBeCloseTo(drift[0].width / drift[0].height / 2)
  const wide = readerPages(drift, false)
  expect(wide).toHaveLength(8)
  expect(wide.every((p) => p.half === -1)).toBe(true)
})

test('readerPages: Lunelle (22 singles) is never split', () => {
  const lunelle = readerPages(getMedia('lunelle').pages, true)
  expect(lunelle).toHaveLength(22)
  expect(lunelle.every((p) => p.half === -1)).toBe(true)
})

test('zoomOffset: centred when the page is smaller than the screen, else panned by mx/my (clamped)', () => {
  expect(zoomOffset({ W: 1000, H: 800, w: 500, h: 400, mx: 0.3, my: 0.3 })).toEqual({ x: 250, y: 200 })
  const big = { W: 1000, H: 800, w: 2500, h: 2000 }
  expect(zoomOffset({ ...big, mx: 0, my: 0 })).toEqual({ x: 0, y: 0 })
  expect(zoomOffset({ ...big, mx: 1, my: 1 })).toEqual({ x: -1500, y: -1200 })
  expect(zoomOffset({ ...big, mx: 2, my: -1 })).toEqual({ x: -1500, y: 0 })
})

test('loupeStyle: the point under the cursor sits in the middle of the 220px loupe at 3x', () => {
  expect(loupeStyle(0.5, 0.5, 400, 200)).toEqual({ backgroundSize: '1200px 600px', backgroundPosition: '-490px -190px' })
  expect(loupeStyle(0, 0, 400, 200, 2, 100)).toEqual({ backgroundSize: '800px 400px', backgroundPosition: '50px 50px' })
})
