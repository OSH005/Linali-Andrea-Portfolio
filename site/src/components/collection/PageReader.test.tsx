import { act, render, screen, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import userEvent from '@testing-library/user-event'
import PageReader from './PageReader'
import type { MediaImage } from '@/lib/media'

beforeAll(() => {
  // motion on, a mouse
  window.matchMedia = ((q: string) => ({ matches: q.includes('hover'), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})

const spreads: MediaImage[] = Array.from({ length: 8 }, (_, i) => {
  const id = String(4 + i * 2).padStart(2, '0')
  const f = `/media/drift/pages/${id}`
  return { id, order: 4 + i * 2, width: 2828, height: 1000, placeholder: '', srcset: { avif: `${f}-640.avif 640w`, webp: `${f}-640.webp 640w, ${f}-2400.webp 2400w` }, src: `${f}-1280.webp`, zoom: `${f}-4800.webp` }
})
const singles: MediaImage[] = spreads.map((p) => ({ ...p, width: 1414, height: 1000 }))
const pageText = { '04': 'Drift SS27 · Concept\n\nThe second paragraph.' }
// animation frames run when the test says so; a flushed frame is past the end of any turn
let frames = new Map<number, FrameRequestCallback>(), id = 0
beforeEach(() => {
  frames = new Map()
  window.requestAnimationFrame = (cb) => (frames.set(++id, cb), id)
  window.cancelAnimationFrame = (k) => void frames.delete(k)
})
const land = () => act(() => {
  const f = [...frames.values()]
  frames.clear()
  f.forEach((cb) => cb(performance.now() + 1000))
})
const counter = () => document.querySelector('[data-counter]')!.textContent

test('desktop: a stack of spreads; Next tips the front page and the counter follows', async () => {
  const { container } = render(<PageReader title="Drift" pages={spreads} pageText={pageText} narrow={false} />)
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('8 spreads')
  expect(counter()).toBe('Spread 01 / 08')
  expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(container.querySelectorAll('[data-page]')[0]).toHaveClass('turning')
  expect(counter()).toBe('Spread 02 / 08')
  expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
})

test('phone: spreads become single pages', async () => {
  render(<PageReader title="Drift" pages={spreads} pageText={pageText} narrow />)
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('8 spreads · 16 pages')
  expect(counter()).toBe('Page 01 / 16')
  await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(counter()).toBe('Page 02 / 16')
})

test('Read the text: enabled only on a page with text, opens a drawer with it', async () => {
  render(<PageReader title="Drift" pages={spreads} pageText={pageText} narrow={false} />)
  const read = screen.getByRole('button', { name: 'Read the text' })
  expect(read).toBeEnabled()
  await userEvent.click(read)
  const drawer = screen.getByRole('dialog', { name: 'The text on this page' })
  expect(drawer).toHaveAttribute('open')
  expect(within(drawer).getByText('The second paragraph.')).toBeInTheDocument()
  await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }))
  expect(drawer).not.toHaveAttribute('open')
  await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(read).toBeDisabled()
})

test('no page text at all: no Read the text button; singles are never split', () => {
  render(<PageReader title="Lunelle" pages={singles} pageText={{}} narrow />)
  expect(screen.queryByRole('button', { name: 'Read the text' })).toBeNull()
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('8 pages')
  expect(counter()).toBe('Page 01 / 08')
})

test('zoom: Enter on the page opens at 250%, + and − step (floor 100%), arrows turn, Esc returns focus to the page', async () => {
  render(<PageReader title="Drift" pages={spreads} pageText={pageText} narrow={false} />)
  expect(document.querySelector('img[src$="-4800.webp"]')).toBeNull() // zoom files load only when zoom opens
  const page = screen.getByRole('button', { name: 'Zoom into spread 1 of 8' })
  page.focus()
  await userEvent.keyboard('{Enter}')
  const zoom = screen.getByRole('dialog', { name: /zoom/i })
  expect(zoom).toHaveAttribute('open')
  expect(zoom.querySelector('img[src$="04-4800.webp"]')).not.toBeNull()
  expect(within(zoom).getByText('250%')).toBeInTheDocument()
  await userEvent.click(within(zoom).getByRole('button', { name: 'Zoom in' }))
  expect(within(zoom).getByText('350%')).toBeInTheDocument()
  for (let i = 0; i < 6; i++) await userEvent.click(within(zoom).getByRole('button', { name: 'Zoom out' }))
  expect(within(zoom).getByText('100%')).toBeInTheDocument()
  await userEvent.keyboard('{ArrowRight}')
  expect(counter()).toBe('Spread 02 / 08')
  expect(zoom.querySelector('img[src$="06-4800.webp"]')).not.toBeNull()
  await userEvent.keyboard('{Escape}')
  expect(zoom).not.toHaveAttribute('open')
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Zoom into spread 2 of 8' }))
})

test('arrow keys turn the pages; focus moves to the page now in front (the old one goes inert)', async () => {
  render(<PageReader title="Drift" pages={spreads} pageText={pageText} narrow={false} />)
  screen.getByRole('button', { name: 'Zoom into spread 1 of 8' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(counter()).toBe('Spread 02 / 08')
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Zoom into spread 2 of 8' }))
  // a press during a turn waits for it to land, then turns again
  await userEvent.keyboard('{ArrowRight}')
  expect(counter()).toBe('Spread 02 / 08')
  land()
  expect(counter()).toBe('Spread 03 / 08')
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Zoom into spread 3 of 8' }))
  land()
  expect(document.querySelectorAll('.turning')).toHaveLength(0)
  await userEvent.keyboard('{ArrowLeft}')
  expect(counter()).toBe('Spread 02 / 08')
})

test('a turn in flight is never cut off: the next one waits until it lands', async () => {
  const { container } = render(<PageReader title="Drift" pages={spreads} pageText={pageText} narrow={false} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
  await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
  const first = container.querySelectorAll<HTMLElement>('[data-page]')[0]
  expect(first).toHaveClass('turning') // still falling, not popped out
  expect(first.style.display).toBe('')
  expect(counter()).toBe('Spread 02 / 08')
  land()
  expect(counter()).toBe('Spread 03 / 08')
})

test('zoom: Shift+arrows and Up/Down pan; the bar arrows are disabled at the ends', async () => {
  render(<PageReader title="Drift" pages={spreads.slice(0, 2)} pageText={pageText} narrow={false} />)
  screen.getByRole('button', { name: 'Zoom into spread 1 of 2' }).focus()
  await userEvent.keyboard('{Enter}')
  const zoom = screen.getByRole('dialog', { name: /zoom/i })
  const box = () => (zoom.querySelector('img')!.parentElement as HTMLElement).style.transform
  expect(within(zoom).getByRole('button', { name: 'Previous page' })).toBeDisabled()
  expect(within(zoom).getByRole('button', { name: 'Next page' })).toBeEnabled()
  const t0 = box()
  await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
  expect(counter()).toBe('Spread 01 / 02')
  const t1 = box()
  expect(t1).not.toBe(t0)
  await userEvent.keyboard('{ArrowDown}')
  expect(box()).not.toBe(t1)
  await userEvent.keyboard('{ArrowRight}')
  expect(counter()).toBe('Spread 02 / 02')
  expect(within(zoom).getByRole('button', { name: 'Next page' })).toBeDisabled()
})

test('zoom falls back to the largest file when a page has no zoom file', async () => {
  const pages = spreads.map((p) => ({ ...p, zoom: '' }))
  render(<PageReader title="Drift" pages={pages} pageText={pageText} narrow={false} />)
  screen.getByRole('button', { name: 'Zoom into spread 1 of 8' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('dialog', { name: /zoom/i }).querySelector('img')).toHaveAttribute('src', '/media/drift/pages/04-2400.webp')
})

test('without JS the server HTML lists every page image with its alt, nothing hidden', () => {
  const html = renderToStaticMarkup(<PageReader title="Drift" pages={spreads} pageText={pageText} />)
  for (let i = 1; i <= 8; i++) expect(html).toContain(`alt="Drift portfolio, spread ${i} of 8"`)
  expect(html).not.toMatch(/opacity:\s*0[;"]/)
  expect(html).not.toMatch(/visibility:\s*hidden/)
  expect(html).not.toContain('-4800.webp')
})
