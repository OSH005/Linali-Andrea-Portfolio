import { act, fireEvent, render } from '@testing-library/react'
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

const screen = (wide: boolean, fine: boolean) => {
  // queries match on what they ask for: width, and hover/fine pointer
  window.matchMedia = ((q: string) => ({
    matches: (!q.includes('min-width: 1024px') || wide) && (!/hover|pointer/.test(q) || fine) && !q.includes('reduce'),
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
}
// jsdom cannot navigate; the click handlers run before this
const stay = (e: Event) => e.preventDefault()
beforeEach(() => addEventListener('click', stay))
afterEach(() => removeEventListener('click', stay))

test('a touch screen at 1024 or wider (iPad Pro) gets the rail, not a photo-less list; a mouse gets the desktop list', () => {
  screen(true, false)
  const touch = render(<CollectionIndex data={indexData()} />)
  expect(touch.container.querySelector('section')).toHaveAttribute('data-live')
  touch.unmount()
  screen(true, true)
  const mouse = render(<CollectionIndex data={indexData()} />)
  expect(mouse.container.querySelector('section')).not.toHaveAttribute('data-live')
})

const MODS = [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]

test('desktop: a ctrl/cmd/shift/alt/middle click (opens elsewhere) does not freeze the frame or name it; a plain click does', () => {
  screen(true, true)
  const { container } = render(<CollectionIndex data={indexData()} />)
  const a = container.querySelector<HTMLElement>('a[data-i="2"]')!
  fireEvent.pointerOver(a)
  const frame = container.querySelector<HTMLElement>('[aria-hidden="true"][style*="visibility"]')!
  for (const m of MODS) {
    fireEvent.click(a, m)
    expect(frame.style.viewTransitionName).toBe('')
  }
  fireEvent.click(a)
  expect(frame.style.viewTransitionName).toBe('collection-photo')
})

test('rail: a modified click leaves the photo unnamed; a plain tap names it', () => {
  const { container } = render(<CollectionIndex data={indexData()} />)
  const a = container.querySelector<HTMLElement>('a[data-i="1"]')!, pics = a.querySelector<HTMLElement>('[data-k="pics"]')!
  for (const m of MODS) {
    fireEvent.click(a, m)
    expect(pics.style.viewTransitionName).toBe('')
  }
  fireEvent.click(a)
  expect(pics.style.viewTransitionName).toBe('collection-photo')
})
