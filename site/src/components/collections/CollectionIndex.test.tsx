// reduced motion: the readable stacked page (as without JS)
vi.hoisted(() => {
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

import { render, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import CollectionsIndex from '@/app/collections/page'
import { countText } from './data'

test('four rows in journey order, each a link with number, name, meta, her line and what is inside', () => {
  const { container, getByRole } = render(<CollectionsIndex />)
  expect(getByRole('heading', { level: 1 })).toHaveTextContent('Four collections, in the order of my journey.')
  expect(container.textContent).toContain('Collections · 04')
  const rows = [...container.querySelectorAll<HTMLAnchorElement>('ol[aria-label="Collections"] > li > a')]
  expect(rows.map((a) => a.getAttribute('href'))).toEqual(['/collections/mano-padana/', '/collections/revive/', '/collections/lunelle/', '/collections/drift/'])
  const want = [
    ['01', 'Mano Padana', 'SS25 · Mind · මනෝ පාදන', 'A mental healing journey through cultural aspects.', '6 photographs · 10 pages'],
    ['02', 'Revive', 'SS27 · Renewal', 'Discarded denim jeans have more life left in them.', 'Portfolio · 4 spreads'],
    ['03', 'Lunelle', 'AW26 · Body', 'A tribute to all the unstoppable mothers.', '10 photographs · 22 pages'],
    ['04', 'Drift', 'SS27 · Nature', 'A calming breath taken to escape the fast paced world.', '17 photographs · 8 spreads'],
  ]
  rows.forEach((a, i) => {
    for (const t of want[i]) expect(a.textContent).toContain(t)
    expect(within(a).getByRole('heading', { level: 2 })).toHaveTextContent(want[i][1])
  })
})

test('counts come from the manifest: photographs, then pages or (double) spreads', () => {
  const page = { width: 1414, height: 1000 }, spread = { width: 2830, height: 1000 }
  expect(countText({ shoot: [page, page], pages: [page] } as never)).toBe('2 photographs · 1 pages')
  expect(countText({ shoot: [], pages: [spread, spread] } as never)).toBe('Portfolio · 2 spreads')
})

test('seasons in order, Revive and Drift together at SS27', () => {
  const { getByRole } = render(<CollectionsIndex />)
  const seasons = getByRole('list', { name: 'Seasons' })
  const items = [...seasons.querySelectorAll(':scope > li')].map((li) => [li.querySelector('h3')!.textContent, ...[...li.querySelectorAll('li')].map((t) => t.textContent)])
  expect(items).toEqual([['SS25', 'Mano Padana'], ['AW26', 'Lunelle'], ['SS27', 'Revive', 'Drift']])
  expect(getByRole('heading', { name: 'Three seasons, four collections.' })).toBeInTheDocument()
})

test('server HTML: nothing hidden, images lazy, one contact card', () => {
  const html = renderToStaticMarkup(<CollectionsIndex />)
  expect(html).not.toMatch(/style="[^"]*(opacity:\s*0[;"]|visibility:\s*hidden)/)
  for (const img of html.match(/<img[^>]*>/g)!) expect(img).toContain('loading="lazy"')
  expect(html.match(/id="contact"/g)).toHaveLength(1)
  expect(html).not.toMatch(/mailto:|tel:/)
})
