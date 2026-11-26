// motion on: the drop hides the pieces before the first paint; the type fit runs at most once per frame on resize
import { render } from '@testing-library/react'
import { useEffect } from 'react'
import PatternMat from './PatternMat'
import { getSite } from '@/lib/site'

vi.mock('@/lib/motion/useMotion', () => ({ useMotion: () => ({ on: true, setOn() {} }) }))
vi.mock('gsap', () => ({ default: { ticker: { add() {}, remove() {} } } }))

const frames: FrameRequestCallback[] = []
beforeEach(() => {
  frames.length = 0
  window.IntersectionObserver = class { observe() {} disconnect() {} } as unknown as typeof IntersectionObserver
  window.requestAnimationFrame = (f) => frames.push(f)
  window.cancelAnimationFrame = () => {}
})

test('the pieces are hidden before the browser paints (no one-frame flash of the laid-out mat)', () => {
  const seen: string[] = []
  // passive effects run in tree order: this probe's runs before PatternMat's, so only a layout effect can have hidden the pieces by now
  function Probe() {
    useEffect(() => void seen.push(...[...document.querySelectorAll<HTMLElement>('figure')].map((f) => f.style.opacity)), [])
    return null
  }
  render(<><Probe /><PatternMat skills={getSite().skills} /></>)
  expect(seen).toEqual(['0', '0', '0', '0'])
})

test('a burst of resize events fits the type once, on the next frame', () => {
  const { container } = render(<PatternMat skills={getSite().skills} />)
  frames.length = 0
  const ul = container.querySelector('ul')!
  ul.style.fontSize = '1px'
  for (let i = 0; i < 5; i++) dispatchEvent(new Event('resize'))
  expect(frames).toHaveLength(1)
  expect(ul.style.fontSize).toBe('1px') // untouched until the frame
  frames[0](0)
  expect(ul.style.fontSize).not.toBe('1px')
})
