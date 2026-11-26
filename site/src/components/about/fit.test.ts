import { fitFontSize } from './fit'

test('fitFontSize steps down from 15px by 0.5 until it fits, never below 12px', () => {
  expect(fitFontSize(() => false)).toBe(15)
  expect(fitFontSize((px) => px > 13)).toBe(13)
  expect(fitFontSize(() => true)).toBe(12)
})
