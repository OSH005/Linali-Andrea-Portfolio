import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import gsap from 'gsap'
import TumbleDeck from './TumbleDeck'

let reduceMotion = true

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  // Reduced motion makes each step land synchronously, no ticker needed.
  window.matchMedia = ((q: string) => ({ matches: reduceMotion && q.includes('reduce'), media: q })) as unknown as typeof window.matchMedia
})

const cards = [{ src: 'a.webp' }, { src: 'b.webp' }, { src: 'c.webp' }]

test('reports index 0 on mount and 1 after ArrowRight', async () => {
  const onIndexChange = vi.fn()
  render(<TumbleDeck cards={cards} onIndexChange={onIndexChange} />)
  expect(onIndexChange).toHaveBeenLastCalledWith(0)
  screen.getByRole('region').focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(onIndexChange).toHaveBeenLastCalledWith(1)
})

test('wraps from last to first', async () => {
  const onIndexChange = vi.fn()
  render(<TumbleDeck cards={cards.slice(0, 2)} onIndexChange={onIndexChange} />)
  screen.getByRole('region').focus()
  await userEvent.keyboard('{ArrowRight}{ArrowRight}')
  expect(onIndexChange).toHaveBeenLastCalledWith(0)
})

test('re-rendering with an equal cards array does not stop a running tumble', async () => {
  reduceMotion = false
  const add = vi.spyOn(gsap.ticker, 'add')
  const remove = vi.spyOn(gsap.ticker, 'remove')
  const { rerender } = render(<TumbleDeck cards={[...cards]} />)
  screen.getByRole('region').focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(add).toHaveBeenCalled()
  remove.mockClear()
  rerender(<TumbleDeck cards={[...cards]} />)
  expect(remove).not.toHaveBeenCalled()
  reduceMotion = true
})
