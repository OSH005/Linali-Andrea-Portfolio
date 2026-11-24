import { act, render } from '@testing-library/react'
import { useState } from 'react'
import HomeStory from './HomeStory'
import { homeData } from './data'
import { remap, sceneRanges } from './timeline'
import { MANIFEST } from './story'

const st = { start: 0, y: 0, scroll: () => st.y, kill: vi.fn(), vars: {} as Record<string, any> }
const on: Record<string, () => void> = {}
const ticks = new Set<() => void>()
vi.mock('gsap', () => ({ default: { registerPlugin() {}, ticker: { time: 0, add: (f: () => void) => ticks.add(f), remove: (f: () => void) => ticks.delete(f) } } }))
const tick = (y: number) => { Object.defineProperty(window, 'scrollY', { value: y, configurable: true }); ticks.forEach((f) => f()) }
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn((v) => ((st.vars = v), st)),
    addEventListener: (e: string, f: () => void) => (on[e] = f),
    removeEventListener: vi.fn(),
  },
}))
let setMotion: (v: boolean) => void
vi.mock('@/lib/motion/useMotion', () => ({
  useMotion: () => {
    const [v, set] = useState(true)
    setMotion = set
    return { on: v, setOn: set }
  },
}))

const data = homeData()
const scrollTo = vi.fn()
beforeEach(() => {
  window.matchMedia = (() => ({ matches: true, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo
  Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
  scrollTo.mockClear()
  st.kill.mockClear()
  st.y = 0
  tick(0)
})

test('motion on: pins the stage for the whole timeline; the contact card then follows in the flow', () => {
  const { container } = render(<HomeStory data={data} />)
  const root = container.firstElementChild as HTMLElement
  expect(root).toHaveAttribute('data-stage')
  expect(st.vars).toMatchObject({ trigger: root, pin: true, start: 'top top' })
  expect(st.vars.end()).toBe('+=12900') // 13 500 less the last 600 units: the card's own height scrolls it in
})

test('motion off mid-visit: kills the pin, drops the stage, lands on the section being watched', () => {
  const { container } = render(<HomeStory data={data} />)
  const root = container.firstElementChild as HTMLElement
  const lunelle = container.querySelector('#lunelle')!
  lunelle.getBoundingClientRect = () => ({ top: 4321 }) as DOMRect
  st.y = sceneRanges(900).steps.ln![1][0] + 10
  act(() => setMotion(false))
  expect(st.kill).toHaveBeenCalled()
  expect(root).not.toHaveAttribute('data-stage')
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 4321, behavior: 'instant' })
})

test('resize or rotate: new scene lengths, same place in the same scene', () => {
  render(<HomeStory data={data} />)
  const y = sceneRanges(900).steps.ln![2][0] + 100
  st.y = y
  Object.defineProperty(window, 'innerHeight', { value: 1366, configurable: true })
  on.refreshInit()
  expect(st.vars.end()).toBe(`+=${sceneRanges(1366).at.foot[0]}`)
  on.refresh()
  expect(scrollTo).toHaveBeenLastCalledWith({ top: remap(y, sceneRanges(900), sceneRanges(1366)), behavior: 'instant' })
})

test('one ticker paints the stage; far scenes are skipped and hidden from focus', () => {
  const { container } = render(<HomeStory data={data} />)
  expect(ticks.size).toBe(1)
  act(() => setMotion(false))
  act(() => setMotion(true)) // the word spans are new elements after each switch
  const top = container.querySelector<HTMLElement>('#top')!, rv = container.querySelector<HTMLElement>('#revive')!
  act(() => tick(10))
  expect(top.style.opacity).toBe('')
  expect(top.querySelector<HTMLElement>('p:last-of-type > span')!.getAttribute('style')).toContain('0.18') // manifesto at 18% ink
  expect(rv.style.visibility).toBe('hidden') // its text and links are not tabbable while off screen
  act(() => tick(sceneRanges(900).steps.rv![1][0]))
  expect(top.style.visibility).toBe('hidden')
  expect(rv.style.visibility).toBe('')
})

test('lunelle: the moon rises over Revive, then one sentence per step', () => {
  const { container } = render(<HomeStory data={data} />)
  const ln = container.querySelector<HTMLElement>('#lunelle')!, rv = container.querySelector<HTMLElement>('#revive')!
  const r = sceneRanges(900)
  act(() => tick(r.at.rise[0] + 300))
  expect(ln.style.visibility).toBe('')
  expect(rv.style.transform).toContain('scale(0.9') // Revive recedes into the night
  expect(ln.querySelector<HTMLElement>('picture')!.style.clipPath).toMatch(/^circle\(/) // the first photo seen through the moon
  act(() => tick(r.steps.ln![2][1] - 10))
  const ps = [...ln.querySelectorAll<HTMLElement>('.body > p')]
  expect(ps.map((p) => p.style.opacity)).toEqual(['0', '0', '', '0', '0'])
})

test('motion off keeps inline styles React set; only what paint wrote goes', () => {
  const { container } = render(<HomeStory data={data} />)
  act(() => setMotion(false))
  const h = container.querySelector<HTMLElement>('#home-ln')!
  h.setAttribute('style', 'color: red') // stands in for a style prop
  act(() => setMotion(true))
  act(() => tick(sceneRanges(900).steps.ln![1][0] + 10))
  act(() => setMotion(false))
  expect(h.getAttribute('style')).toBe('color: red')
  expect(container.querySelector('#lunelle [style]:not(#home-ln)')).toBeNull()
})

test('word spans only on the stage; motion off leaves the plain, unstyled page', () => {
  const { container } = render(<HomeStory data={data} />)
  const manif = container.querySelector('#top p:last-of-type')!
  expect(manif.querySelectorAll('span').length).toBe(MANIFEST.split(' ').length)
  act(() => tick(sceneRanges(900).at.mp[0] + 50))
  act(() => setMotion(false))
  expect(ticks.size).toBe(0)
  expect(manif.querySelector('span')).toBeNull()
  expect(container.querySelector('#top [style], #mano-padana [style], #revive [style]')).toBeNull()
  expect([...container.querySelectorAll('section')].map((n) => n.getAttribute('style'))).toEqual([null, null, null, null, null])
})

test('drift: the logo is written on, then the strip runs sideways with the scroll', () => {
  const { container } = render(<HomeStory data={data} />)
  const dr = container.querySelector<HTMLElement>('#drift')!, r = sceneRanges(900)
  act(() => tick(r.at.dIn[0] + 100))
  expect(dr.style.visibility).toBe('')
  expect(dr.querySelector<HTMLElement>('h2')!.style.maskImage).toMatch(/^linear-gradient\(104deg/)
  const track = dr.querySelector<HTMLElement>('ol')!
  act(() => tick((r.at.strip[0] + r.at.strip[1]) / 2))
  expect(track.style.transform).toMatch(/^translateX\(-\d/)
  act(() => setMotion(false))
  expect([...dr.querySelectorAll('[style]')].map((n) => n.getAttribute('style')).filter((v) => !/^--(ar|w): [\d.]+;?$/.test(v!))).toEqual([]) // only React's shape variables stay
})

test('desktop: the phone-only lunar contact sheet and Drift captions are not rendered (their photos are not fetched)', () => {
  const { container } = render(<HomeStory data={data} />)
  expect(container.querySelector('#lunelle image')).toBeNull()
  expect(container.querySelectorAll('#drift a[href="/collections/drift/"]')).toHaveLength(1)
})

test('drift: strip items off screen cannot take focus (the hidden-overflow layer would scroll to them)', () => {
  const { container } = render(<HomeStory data={data} />)
  const r = sceneRanges(900), lis = container.querySelectorAll<HTMLElement>('#drift ol > li'), end = lis[lis.length - 1]
  act(() => tick(r.at.strip[0] + 10))
  expect(end.style.visibility).toBe('hidden')
  expect(lis[0].style.visibility).toBe('')
  act(() => tick(r.at.strip[1] - 1))
  expect(end.style.visibility).toBe('')
  expect(lis[0].style.visibility).toBe('hidden')
})
