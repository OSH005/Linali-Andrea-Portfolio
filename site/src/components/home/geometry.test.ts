import { driftCardH, inkFor, jagSplit, leadFrame, litPath, lunelleMain, moonRise, penMask, skew, stripItems, stripX, tabletPhoto, tearPolygon, windowRects } from './geometry'

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

test('drift strip: items laid end to end with a gap; the track runs its length minus one screen; skew stays under 0.6deg', () => {
  expect(stripItems(['a', undefined, 'c'], [100, 50, 200], 10)).toEqual([{ start: 0, size: 100, id: 'a' }, { start: 110, size: 50, id: undefined }, { start: 170, size: 200, id: 'c' }])
  expect(stripX(1, 5000, 1600)).toBe(3400)
  expect(stripX(0, 5000, 1600)).toBe(0)
  expect(skew(1)).toBe(0.6)
  expect(skew(-1)).toBe(-0.6)
  expect(skew(0.05)).toBeCloseTo(0.3)
})

test('drift logo: a pen mask sweeps left to right at 104deg', () => {
  expect(penMask(0)).toBe('linear-gradient(104deg, #000 -28%, transparent -14%)')
  expect(penMask(1)).toBe('linear-gradient(104deg, #000 100%, transparent 114%)')
})

test('drift cards: 57% of a phone screen (less on short ones, so the captions fit); full height on desktop', () => {
  expect(driftCardH(844, true)).toBeCloseTo(480, 0)
  expect(driftCardH(640, true)).toBe(280)
  expect(driftCardH(900, false)).toBe(900)
})

test('drift opening: the full-screen photo shrinks into its card, covered all the way', () => {
  const a = leadFrame(390, 844, 320, 480, 64, 0)
  expect(a.clip).toBe('inset(-64px -70px -300px 0px)') // the whole screen
  expect(a.scale).toBeCloseTo(844 / 480)
  expect(a.dx).toBe(35)
  expect(a.dy).toBe(422 - 304)
  expect(leadFrame(390, 844, 320, 480, 64, 1)).toEqual({ clip: 'inset(0px 0px 0px 0px)', dx: 0, dy: 0, scale: 1 })
})

test('tablets: a portrait photo stands beside the text, keeping its 2:3', () => {
  const [x, y, w, h] = tabletPhoto(768, 1024)
  expect((w * 768) / (h * 1024)).toBeCloseTo(2 / 3)
  expect(x + w).toBeCloseTo(95.5)
  expect(y * 2 + h).toBeCloseTo(100)
  expect(x).toBeGreaterThan(42) // clear of the text column (4.5% + 38%)
  expect(tabletPhoto(1023, 768)[3]).toBeCloseTo(86)
  expect(windowRects(768, 1024, true).B).toEqual(tabletPhoto(768, 1024))
  expect(lunelleMain(820, 1180, true)).toEqual(tabletPhoto(820, 1180))
  expect(windowRects(599, 900, true).B[2]).toBe(100) // phones keep the full-width photo
  // a phone turned sideways keeps the phone layout (spec 5.7): the tablet layout needs 600px both ways
  expect(windowRects(844, 390, true).B[2]).toBe(100)
  expect(lunelleMain(932, 430, true)[2]).toBe(100)
  expect(windowRects(1023, 600, true).B).toEqual(tabletPhoto(1023, 600))
})
