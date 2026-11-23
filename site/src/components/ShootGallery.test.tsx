import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShootGallery from './ShootGallery'
import type { MediaImage } from '@/lib/media'

vi.mock('./circular-carousel/CircularCarousel', () => ({
  default: ({ autoplay }: { autoplay: string }) => <div data-testid="ring" data-autoplay={autoplay} />,
}))

let reduce = false
beforeAll(() => {
  window.matchMedia = ((q: string) => ({ matches: reduce && q.includes('reduce'), media: q })) as unknown as typeof window.matchMedia
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})
afterEach(() => {
  reduce = false
})

const images: MediaImage[] = Array.from({ length: 17 }, (_, i) => {
  const id = `${String(i + 1).padStart(2, '0')}-p`
  return { id, order: i + 1, width: 1000, height: 1500, placeholder: '', srcset: { avif: '', webp: '' }, src: `/${id}.webp`, zoom: `/${id}-z.webp` }
})
const alt = Object.fromEntries(images.map((im) => [im.id, `Look ${im.order}`]))
const props = { images, alt, preset: 'cylinder' as const, autoplay: 'drift' as const, fadeColor: '#F2E8DA', label: 'Drift photographs' }

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed')
const tiles = () => within(screen.getByRole('list', { hidden: true })).getAllByRole('button', { hidden: true })

test('starts in ring view', () => {
  render(<ShootGallery {...props} />)
  expect(screen.getByTestId('ring')).toBeVisible()
  expect(pressed('Ring')).toBe('true')
})

test('starts in grid under reduced motion', () => {
  reduce = true
  render(<ShootGallery {...props} />)
  expect(pressed('Grid')).toBe('true')
  expect(screen.queryByTestId('ring')).toBeNull()
})

test('toggle switches to grid', async () => {
  render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  expect(pressed('Grid')).toBe('true')
  expect(screen.getByRole('list')).toBeVisible()
})

test('pause sets autoplay off', async () => {
  render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Pause' }))
  expect(screen.getByTestId('ring').dataset.autoplay).toBe('off')
})

test('grid tile opens viewer at that photo', async () => {
  render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  await userEvent.click(tiles()[2])
  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveProperty('open', true)
  expect(within(dialog).getByText('03 / 17')).toBeInTheDocument()
  expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/03-p-z.webp')
})

test('arrow keys move, Esc closes and restores focus', async () => {
  render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  const third = tiles()[2]
  await userEvent.click(third)
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByText('04 / 17')).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', false)
  expect(document.activeElement).toBe(third)
})

test('locks page scroll while open', async () => {
  render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  await userEvent.click(tiles()[0])
  expect(document.body.style.overflow).toBe('hidden')
  await userEvent.keyboard('{Escape}')
  expect(document.body.style.overflow).toBe('')
})
