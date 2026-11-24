import { inkFor, jagSplit, litPath, lunelleMain, moonRise, tearPolygon, windowRects } from './geometry'

test('window rects: centred at 16:9, the photo keeps its 2:3 on a 4:3 screen', () => {
  const { A, B, C } = windowRects(1600, 900, false)
  ;[33.87, 7, 32.26, 86].forEach((v, i) => expect(Math.abs(B[i] - v)).toBeLessThan(0.01))
  expect(A).toEqual([66, 40, expect.closeTo(30 * (900 / 1600) * 0.667, 5), 30])
  expect(C[0]).toBeCloseTo(Math.min(58, 96 - B[2]))
  const t = windowRects(1024, 768, false).B
  expect(t[2]).toBeCloseTo(43.0, 1)
  expect((t[2] * 1024) / ((t[3] * 768))).toBeCloseTo(0.667, 3) // px aspect of the photo
  expect(windowRects(390, 844, true)).toEqual({ A: [60, 62, 20, 13.9], B: [0, 0, 100, 69.3], C: [0, 0, 100, 69.3] })
  const short = windowRects(320, 640, true).B // short phone: room for the text under the photo
  expect(640 - (short[3] * 640) / 100).toBeCloseTo(255)
})

test('tear: a jagged edge that sweeps from below the screen to above it', () => {
  expect(tearPolygon(0)).toContain('103')
  expect(tearPolygon(0)).toMatch(/^polygon\(0 0, 100% 0, /)
  expect(tearPolygon(1)).toContain('% -1') // edge near −12%
})

test('jag split: two halves along one seam, 19 cross-stitches', () => {
  const { left, right, stitches } = jagSplit()
  expect(stitches).toHaveLength(19)
  expect(left.startsWith('polygon(0 0, ')).toBe(true)
  expect(right.startsWith('polygon(100% 0, ')).toBe(true)
  const seam = (p: string) => p.split(', ').slice(1, -1).join()
  expect(seam(left)).toBe(seam(right)) // same seam points
})

test('ink by luminance: cream on dark grounds, brown on light', () => {
  expect(inkFor([31, 30, 28])).toBe('#F2E8DA')
  expect(inkFor([242, 232, 218])).toBe('#3B2418')
  expect(inkFor([59, 36, 24])).toBe('#F2E8DA')
})

test('moon phases: the lit path waxes from a sliver to the full disc', () => {
  expect(litPath(0.5)).toContain('A0.00 9')
  expect(litPath(0.18)).toMatch(/ 0 0 0 10 1$/) // waxing crescent: inner arc bulges right
  expect(litPath(0.999)).toMatch(/ 0 0 1 10 1$/)
})

test('lunelle main photo: right edge, keeps the photo 2:3 on any aspect; phone: top 64%, less on short screens', () => {
  const d = lunelleMain(1600, 900, false)
  ;[62.5, 0, 37.5, 100].forEach((v, i) => expect(d[i]).toBeCloseTo(v, 1))
  expect(lunelleMain(390, 844, true)).toEqual([0, 0, 100, 64])
  const p = lunelleMain(320, 640, true)
  expect(640 - (p[3] * 640) / 100).toBeCloseTo(300) // room for the text and the contact sheet
})

test('moonrise: rises from below to the middle, then grows to fill the frame', () => {
  expect(moonRise(0)).toEqual({ y: 150, r: 17 })
  expect(moonRise(0.65).y).toBe(50)
  expect(moonRise(1).r).toBe(120)
})
