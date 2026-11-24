// gsap's ScrollTrigger calls matchMedia while the module loads
vi.hoisted(() => {
  window.matchMedia = (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

import { act, render } from '@testing-library/react'
import SmoothScroll from './SmoothScroll'
import { useMotion } from './useMotion'

const made: { opts: unknown; destroy: ReturnType<typeof vi.fn> }[] = []
vi.mock('lenis', () => ({
  default: class {
    destroy = vi.fn()
    on = vi.fn()
    raf = vi.fn()
    constructor(public opts: unknown) {
      made.push(this)
    }
  },
}))

let setOn: (v: boolean) => void
function Probe() {
  setOn = useMotion().setOn
  return <p>content</p>
}

beforeEach(() => {
  made.length = 0
  localStorage.clear()
  window.matchMedia = (() => ({ matches: false })) as unknown as typeof window.matchMedia
})

test('creates Lenis while on and destroys it when motion turns off', () => {
  const { getByText } = render(<SmoothScroll><Probe /></SmoothScroll>)
  expect(getByText('content')).toBeInTheDocument()
  expect(made).toHaveLength(1)
  expect(made[0].opts).toMatchObject({ lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075, autoRaf: false })
  act(() => setOn(false))
  expect(made[0].destroy).toHaveBeenCalled()
  expect(made).toHaveLength(1)
})

test('no Lenis under reduced motion', () => {
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce') })) as unknown as typeof window.matchMedia
  render(<SmoothScroll><Probe /></SmoothScroll>)
  expect(made).toHaveLength(0)
})
