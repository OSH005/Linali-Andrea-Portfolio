import { back, inOut, out3, seg, spring } from './ease'

test('easing endpoints and shapes', () => {
  expect(inOut(0.5)).toBe(0.5)
  expect(out3(1)).toBe(1)
  expect(back(0.8)).toBeGreaterThan(1)
  expect(spring(0)).toBe(0)
  expect(Math.abs(spring(2) - 1)).toBeLessThan(0.01)
  expect(seg(5, 0, 10)).toBe(0.5)
})
