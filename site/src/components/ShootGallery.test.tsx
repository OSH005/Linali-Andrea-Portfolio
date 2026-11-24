import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShootGallery from './ShootGallery'
import type { MediaImage } from '@/lib/media'

// the stand-in ring: a click brings photo 3 to the front; it records horizontal wheel turns
vi.mock('./circular-carousel/CircularCarousel', () => ({
  default: ({ autoplay, onChange }: { autoplay: string; onChange?: (i: number) => void }) => (
    <div
      data-testid="ring"
      data-autoplay={autoplay}
      onClick={() => onChange?.(2)}
      ref={(el) => el?.addEventListener('wheel', (e) => (el.dataset.turn = String(+(el.dataset.turn ?? 0) + e.deltaX)))}
    />
  ),
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

test('a native close unlocks scroll and the viewer can reopen', async () => {
  render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  await userEvent.click(tiles()[0])
  const d = screen.getByRole('dialog') as HTMLDialogElement
  d.open = false
  fireEvent(d, new Event('close'))
  expect(document.body.style.overflow).toBe('')
  await userEvent.click(tiles()[1])
  expect(d).toHaveProperty('open', true)
})

test('no photos renders nothing (never the carousel demo images)', () => {
  const { container } = render(<ShootGallery {...props} images={[]} />)
  expect(container).toBeEmptyDOMElement()
})

test('initialView grid stays a grid after mount', () => {
  render(<ShootGallery {...props} initialView="grid" />)
  expect(pressed('Grid')).toBe('true')
})

test('caption describes the photo in front of the ring', async () => {
  render(<ShootGallery {...props} caption />)
  expect(screen.getByText('01 / 17').parentElement).toHaveTextContent('01 / 17 Look 1')
  await userEvent.click(screen.getByTestId('ring'))
  expect(screen.getByText('03 / 17').parentElement).toHaveTextContent('03 / 17 Look 3')
})

test('pinned: vertical scroll turns the ring; not pinned: it does not', () => {
  const scrollBy = (y: number) => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    fireEvent.scroll(window)
  }
  const { unmount } = render(<ShootGallery {...props} pinned />)
  scrollBy(200)
  expect(Number(screen.getByTestId('ring').dataset.turn)).toBeGreaterThan(0)
  unmount()
  scrollBy(0)
  render(<ShootGallery {...props} />)
  scrollBy(300)
  expect(screen.getByTestId('ring').dataset.turn).toBeUndefined()
})

test('the grid shows every photo uncropped with its alt text, and the gallery names its view', async () => {
  const { container } = render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  expect(container.firstElementChild).toHaveAttribute('data-view', 'grid')
  const imgs = screen.getByRole('list').querySelectorAll('img')
  expect([...imgs].map((i) => i.alt)).toEqual(images.map((im) => alt[im.id]))
  expect(imgs[0]).toHaveAttribute('width', '1000')
})

test('viewer: arrows and thumbnails move, the counter follows', async () => {
  render(<ShootGallery {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
  await userEvent.click(tiles()[0])
  const dialog = screen.getByRole('dialog')
  await userEvent.click(within(dialog).getByRole('button', { name: 'Previous photo' }))
  expect(within(dialog).getByText('17 / 17')).toBeInTheDocument()
  await userEvent.click(within(dialog).getByRole('button', { name: 'Photo 5' }))
  expect(within(dialog).getByText('05 / 17')).toBeInTheDocument()
  expect(within(dialog).getByText('Look 5', { selector: 'p' })).toBeInTheDocument()
})
