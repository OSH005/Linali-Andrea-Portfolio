import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Shoot from './Shoot'
import type { CollectionData } from './data'
import type { MediaImage } from '@/lib/media'

vi.mock('@/components/circular-carousel/CircularCarousel', () => ({ default: () => <div data-testid="ring" /> }))

beforeAll(() => {
  // motion on
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

const shoot: MediaImage[] = Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, order: i + 1, width: 1000, height: 1500, placeholder: '', srcset: { avif: '', webp: '' }, src: `/p${i}.webp`, zoom: `/p${i}-z.webp` }))
const d = { title: 'Drift', shoot, alt: {} } as unknown as CollectionData

test('the pin decision is made in the ring view and does not change when the grid is shown', async () => {
  let h = 600 // the pin's height
  const spy = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => h)
  const { container } = render(<Shoot d={d} />)
  const sec = container.querySelector('#shoot')!
  await waitFor(() => expect(sec).toHaveAttribute('data-pin'))
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  h = 5000 // the grid is much taller than the screen
  act(() => void fireEvent(window, new Event('resize')))
  expect(sec).toHaveAttribute('data-pin')
  await userEvent.click(screen.getByRole('button', { name: 'Ring' }))
  h = 600
  act(() => void fireEvent(window, new Event('resize')))
  expect(sec).toHaveAttribute('data-pin')
  // a ring that doesn't fit the screen is never pinned
  h = 5000
  act(() => void fireEvent(window, new Event('resize')))
  expect(sec).not.toHaveAttribute('data-pin')
  spy.mockRestore()
})
