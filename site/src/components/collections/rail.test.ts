import { morph, railLayout, railScroll, swing } from './rail'

test('railLayout: the row in focus is open, the others compact, stacked from the top', () => {
  const r = railLayout(0, 4, 92, 566, 210)
  expect(r[0]).toEqual({ top: 210, height: 566, f: 1 })
  expect(r[1]).toEqual({ top: 776, height: 92, f: 0 })
  expect(r[3].top).toBe(776 + 92 * 2)
})

test('railLayout: between two rows both are half open; the rail moves up one compact row per step', () => {
  const r = railLayout(1.5, 4, 92, 566, 210)
  expect(r[1].f).toBe(0.5)
  expect(r[2].f).toBe(0.5)
  expect(r[0].top).toBe(210 - 92 * 1.5)
  expect(railLayout(3, 4, 92, 566, 210)[3]).toMatchObject({ top: 210, f: 1 })
})

test('swing: a damped swing, still before the needle arrives', () => {
  expect(swing(0)).toBe(16)
  expect(swing(-1)).toBe(0)
  expect(Math.abs(swing(3))).toBeLessThan(0.01)
})

test('morph: a w×h thumbnail cut from the iw×ih photo box by scale and clip only', () => {
  expect(morph(300, 400, 300, 400)).toEqual({ k: 1, x: 0, y: 0 })
  const { k, x, y } = morph(56, 68, 342, 383)
  expect(k).toBeCloseTo(68 / 383)
  expect((342 - 2 * x) * k).toBeCloseTo(56) // visible width after the clip and the scale
  expect((383 - 2 * y) * k).toBeCloseTo(68)
})

test('railScroll: the scroll that puts row i in focus (inverse of the rail easing)', () => {
  expect(railScroll(0, 4)).toBe(120)
  expect(railScroll(3, 4)).toBeCloseTo(120 + 3 * 470)
  expect(railScroll(1.5, 4)).toBeCloseTo(120 + 1.5 * 470)
})
