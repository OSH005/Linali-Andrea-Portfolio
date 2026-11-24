import { act, render } from '@testing-library/react'
import { useState } from 'react'
import HomeStory from './HomeStory'
import { homeData } from './data'
import { remap, sceneRanges } from './timeline'

const st = { start: 0, y: 0, scroll: () => st.y, kill: vi.fn(), vars: {} as Record<string, any> }
const on: Record<string, () => void> = {}
vi.mock('gsap', () => ({ default: { registerPlugin() {}, ticker: { time: 0 } } }))
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
  window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo
  Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
  scrollTo.mockClear()
  st.kill.mockClear()
  st.y = 0
})

test('motion on: pins the stage for the whole timeline', () => {
  const { container } = render(<HomeStory data={data} />)
  const root = container.firstElementChild as HTMLElement
  expect(root).toHaveAttribute('data-stage')
  expect(st.vars).toMatchObject({ trigger: root, pin: true, start: 'top top' })
  expect(st.vars.end()).toBe('+=13500')
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
  expect(st.vars.end()).toBe(`+=${sceneRanges(1366).total}`)
  on.refresh()
  expect(scrollTo).toHaveBeenLastCalledWith({ top: remap(y, sceneRanges(900), sceneRanges(1366)), behavior: 'instant' })
})
