import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PortfolioReader, { counterLabel } from './PortfolioReader'
import type { MediaImage } from '@/lib/media'

// The deck is exercised in its own test; here it only needs to report an index.
vi.mock('./tumble-deck/TumbleDeck', () => ({
  default: ({ onIndexChange, cards }: { onIndexChange: (i: number) => void; cards: unknown[] }) => (
    <div data-testid="deck" data-count={cards.length}>
      <button type="button" onClick={() => onIndexChange(2)}>deck-to-3</button>
      <button type="button" onClick={() => onIndexChange(0)}>deck-to-1</button>
    </div>
  ),
}))

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})

const pages: MediaImage[] = Array.from({ length: 8 }, (_, i) => {
  const id = String(4 + i * 2).padStart(2, '0')
  return { id, order: 4 + i * 2, width: 2400, height: 848, placeholder: '', srcset: { avif: '', webp: '' }, src: `/${id}.webp`, zoom: `/${id}-z.webp` }
})
const props = { title: 'Drift', pages, pageText: { '08': 'Page eight text' }, background: '#F2E8DA' }
const open = () => userEvent.click(screen.getByRole('button', { name: /Open the Drift portfolio/ }))

test('counterLabel pads both numbers', () => {
  expect(counterLabel(0, 8)).toBe('01 / 08')
  expect(counterLabel(6, 16)).toBe('07 / 16')
})

test('opens from the stack and closes with Esc, restoring focus', async () => {
  render(<PortfolioReader {...props} />)
  const opener = screen.getByRole('button', { name: /Open the Drift portfolio/ })
  await open()
  expect(screen.getByRole('dialog')).toHaveProperty('open', true)
  expect(screen.getByTestId('deck').dataset.count).toBe('8')
  await userEvent.keyboard('{Escape}')
  expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', false)
  expect(document.activeElement).toBe(opener)
})

test('counter follows the deck', async () => {
  render(<PortfolioReader {...props} />)
  await open()
  await userEvent.click(screen.getByRole('button', { name: 'deck-to-3' }))
  expect(within(screen.getByRole('dialog')).getByText('03 / 08')).toBeInTheDocument()
})

test('zoom shows the current page at full size', async () => {
  render(<PortfolioReader {...props} />)
  await open()
  await userEvent.click(screen.getByRole('button', { name: 'deck-to-3' }))
  await userEvent.click(screen.getByRole('button', { name: 'Zoom' }))
  expect(screen.getByRole('img', { name: /Drift portfolio, spread 3 of 8/ })).toHaveAttribute('src', '/08-z.webp')
})

test('read-the-text only when the page has text', async () => {
  render(<PortfolioReader {...props} />)
  await open()
  expect(screen.queryByRole('button', { name: 'Read the text' })).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'deck-to-3' }))
  await userEvent.click(screen.getByRole('button', { name: 'Read the text' }))
  expect(screen.getByText('Page eight text')).toBeInTheDocument()
})

test('defaultOpen opens on mount', () => {
  render(<PortfolioReader {...props} defaultOpen />)
  expect(screen.getByRole('dialog')).toHaveProperty('open', true)
})
