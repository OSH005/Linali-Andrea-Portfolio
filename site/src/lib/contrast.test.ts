import { contrastRatio, PALETTE } from './contrast'

test('brown on cream passes AA body', () => {
  expect(contrastRatio(PALETTE.brown, PALETTE.cream)).toBeGreaterThan(10)
})

test('teal on cream is large-text only', () => {
  const r = contrastRatio(PALETTE.teal, PALETTE.cream)
  expect(r).toBeGreaterThan(3)
  expect(r).toBeLessThan(4.5)
})

test('black on white is 21', () => {
  expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
})
