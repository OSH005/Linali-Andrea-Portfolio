import { act, renderHook } from '@testing-library/react'
import { useMotion } from './useMotion'

let reduce = false
beforeEach(() => {
  reduce = false
  localStorage.clear()
  window.matchMedia = ((q: string) => ({ matches: reduce && q.includes('reduce'), media: q })) as unknown as typeof window.matchMedia
})

test('reduced-motion media means off', () => {
  reduce = true
  const { result } = renderHook(() => useMotion())
  expect(result.current.on).toBe(false)
})

test('motion is on by default without reduced motion', () => {
  const { result } = renderHook(() => useMotion())
  expect(result.current.on).toBe(true)
})

test("stored 'on' overrides reduced motion", () => {
  reduce = true
  localStorage.setItem('la-motion', 'on')
  const { result } = renderHook(() => useMotion())
  expect(result.current.on).toBe(true)
})

test('setOn(false) persists and a second instance follows', () => {
  const a = renderHook(() => useMotion())
  const b = renderHook(() => useMotion())
  act(() => a.result.current.setOn(false))
  expect(localStorage.getItem('la-motion')).toBe('off')
  expect(a.result.current.on).toBe(false)
  expect(b.result.current.on).toBe(false)
})
