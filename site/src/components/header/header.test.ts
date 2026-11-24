import { fabricPath, nextHidden, stitchDash } from './header'

test('fabricPath draws a closed pill: two long edges joined by two arcs', () => {
  const d = fabricPath(200, 40, 0, 0, 0)
  expect(d.startsWith('M20.0 0.00')).toBe(true)
  expect(d.match(/ A/g)).toHaveLength(2)
  expect(d.endsWith('Z')).toBe(true)
})

test.each([
  [false, { y: 900, v: 200, docked: true }, true],
  [true, { y: 900, v: -80, docked: true }, false],
  [true, { y: 100, v: 200, docked: true }, false],
  [true, { y: 900, v: 10, docked: true }, true],
  [true, { y: 900, v: 200, docked: false }, false],
  [false, { y: 300, v: 200, docked: true, keep: 450 }, false],
])('nextHidden(%s, %o) → %s', (prev, s, want) => {
  expect(nextHidden(prev, s)).toBe(want)
})

test('stitchDash sews stitch by stitch', () => {
  expect(stitchDash(1)).toBe('.5 .3333')
  expect(stitchDash(0)).toBe('0 100')
  expect(stitchDash(2 / 120)).toBe('.5 .3333 .5 .3333 0 100')
})
