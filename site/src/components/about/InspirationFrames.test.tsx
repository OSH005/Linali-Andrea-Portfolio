// motion on: a frame's incoming photo is a compositor layer only while it wipes in
import { render } from '@testing-library/react'
import InspirationFrames from './InspirationFrames'
import { getInspiration } from '@/lib/media'

const tick = vi.hoisted(() => [] as ((t: number) => void)[])
vi.mock('@/lib/motion/useMotion', () => ({ useMotion: () => ({ on: true, setOn() {} }) }))
vi.mock('gsap', () => ({ default: { ticker: { add: (f: (t: number) => void) => tick.push(f), remove() {} } } }))

test('will-change only on a photo that is wiping in', () => {
  const images = getInspiration().map((m) => ({ src: m.src, srcset: m.srcset, width: m.width, height: m.height, alt: '' }))
  const { container } = render(<InspirationFrames images={images} />)
  const frame = (f: number) => [...container.querySelectorAll<HTMLElement>(`[class*=mf] > :nth-child(${f + 1}) > *`)]
  const layers = (f: number) => frame(f).filter((e) => e.style.willChange).length
  tick[0](0)
  tick[0](1) // every frame resting on its first photo
  expect([0, 1, 2, 3, 4].map(layers)).toEqual([0, 0, 0, 0, 0])
  tick[0](2.7) // frame 0 wiping in its second photo (turns at 2.3s, wipes for 0.9s)
  expect(layers(0)).toBe(1)
  tick[0](3.3) // frame 0 settled; frame 1 wiping (0.6s later)
  expect([layers(0), layers(1)]).toEqual([0, 1])
})
