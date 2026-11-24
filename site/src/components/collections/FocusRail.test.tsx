import { act, render } from '@testing-library/react'
import { useSyncExternalStore } from 'react'
import CollectionIndex from './CollectionIndex'
import { indexData } from './data'

const ticks = new Set<() => void>()
vi.mock('gsap', () => ({ default: { ticker: { time: 0, add: (f: () => void) => ticks.add(f), remove: (f: () => void) => ticks.delete(f) } } }))
// one Motion switch shared by every component on the page
const motion = { on: true, subs: new Set<() => void>() }
const setMotion = (v: boolean) => ((motion.on = v), motion.subs.forEach((f) => f()))
vi.mock('@/lib/motion/useMotion', () => ({
  useMotion: () => ({ on: useSyncExternalStore((f) => (motion.subs.add(f), () => motion.subs.delete(f)), () => motion.on), setOn: setMotion }),
}))
const tick = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  ticks.forEach((f) => f())
}

beforeEach(() => {
  // a phone: below 1024, no fine pointer
  window.matchMedia = (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
  Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })
  motion.on = true
})

test('phone, motion on: the list pins and becomes the rail; the row in focus opens as you scroll', () => {
  const { container } = render(<CollectionIndex data={indexData()} />)
  const sec = container.querySelector('section')!
  expect(sec).toHaveAttribute('data-live')
  expect(sec.style.getPropertyValue('--len')).toBe(`${120 + 3 * 470}px`)
  const rows = [...container.querySelectorAll<HTMLElement>('ol[aria-label="Collections"] > li')]
  const lines = rows.map((r) => r.querySelector<HTMLElement>('[data-k="line"]')!)
  tick(0)
  expect(lines.map((l) => +l.style.opacity)).toEqual([1, 0, 0, 0])
  tick(120 + 3 * 470)
  expect(lines.map((l) => +l.style.opacity)).toEqual([0, 0, 0, 1])
  expect(rows[0].style.transform).toMatch(/^translateY\(-?\d/)
})

test('motion off mid-visit: the rail lets go and the open rows come back with no painted styles', () => {
  const { container } = render(<CollectionIndex data={indexData()} />)
  tick(600)
  act(() => setMotion(false))
  const sec = container.querySelector('section')!
  expect(sec).not.toHaveAttribute('data-live')
  expect(ticks.size).toBe(0)
  for (const el of sec.querySelectorAll<HTMLElement>('[style]')) expect(el.getAttribute('style')).toMatch(/^--i: \d;?$/)
})
