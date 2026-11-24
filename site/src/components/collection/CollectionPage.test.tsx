// reduced motion: the readable stacked page (as without JS)
vi.hoisted(() => {
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

import { render, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import CollectionPage from '@/app/collections/[slug]/page'
import { getCollection } from '@/lib/collections'
import { getMedia } from '@/lib/media'
import { nextSlug, splitConcept } from './data'

const page = async (slug: string) => CollectionPage({ params: Promise.resolve({ slug }) } as never)
const drift = getCollection('drift')!

test('splitConcept: two paragraphs, nothing lost, the first gets the larger half', () => {
  const [a, b] = splitConcept(drift.concept)
  expect(`${a} ${b}`).toBe(drift.concept)
  expect(a.startsWith('Drift is a womenswear collection')).toBe(true)
  expect(b).toBe('My collection offers the feeling of a calming breath taken to escape the fast paced world.')
  // a sentence may start in Sinhala (Mano Padana's second)
  const mp = getCollection('mano-padana')!.concept, [c, d] = splitConcept(mp)
  expect(`${c} ${d}`).toBe(mp)
  expect(d.startsWith('Initially inspired')).toBe(true)
})

test('nextSlug follows the journey and wraps to the start', () => {
  expect(nextSlug('mano-padana')).toBe('revive')
  expect(nextSlug('lunelle')).toBe('drift')
  expect(nextSlug('drift')).toBe('mano-padana')
})

test('Drift: hero, words, shoot, portfolio, next; the hero buttons jump to the shoot and the portfolio', async () => {
  const { container, getByRole } = render(await page('drift'))
  expect([...container.querySelectorAll('main section[id]')].map((s) => s.id)).toEqual(['hero', 'words', 'shoot', 'portfolio', 'next'])
  expect(getByRole('heading', { level: 1 })).toHaveTextContent('Drift')
  const hero = container.querySelector('#hero')!
  expect(hero.textContent).toContain('Collection 04 / 04 · SS27')
  expect(within(hero as HTMLElement).getByRole('link', { name: 'The shoot · 17' })).toHaveAttribute('href', '#shoot')
  expect(within(hero as HTMLElement).getByRole('link', { name: 'The portfolio · 8' })).toHaveAttribute('href', '#portfolio')
  // the floating switch
  const sw = getByRole('navigation', { name: 'Shoot or portfolio' })
  expect(within(sw).getAllByRole('link').map((a) => a.textContent)).toEqual(['The shoot', 'The portfolio'])
})

test('the shoot shows every photograph, the hero one included, with its alt text', async () => {
  const { container } = render(await page('drift'))
  const shoot = container.querySelector('#shoot')!
  expect(shoot.querySelector('h2')).toHaveTextContent('17 photographs')
  const alts = [...shoot.querySelectorAll('img')].map((i) => i.alt).filter(Boolean)
  for (const im of getMedia('drift').shoot) expect(alts).toContain(drift.alt[im.id])
})

test('Revive (no shoot): no #shoot, no shoot button, no switch', async () => {
  const { container, queryByRole, getByRole } = render(await page('revive'))
  expect([...container.querySelectorAll('main section[id]')].map((s) => s.id)).toEqual(['hero', 'words', 'portfolio', 'next'])
  expect(queryByRole('link', { name: /The shoot/ })).toBeNull()
  expect(queryByRole('navigation', { name: 'Shoot or portfolio' })).toBeNull()
  expect(getByRole('link', { name: 'The portfolio · 4' })).toBeInTheDocument()
})

test('In my words is static text: her concept in two paragraphs, no word spans', async () => {
  const { container } = render(await page('drift'))
  const words = container.querySelector('#words')!
  expect(words.textContent).toContain('In my words')
  const ps = [...words.querySelectorAll('p')].map((p) => p.textContent)
  expect(ps).toEqual(expect.arrayContaining(splitConcept(drift.concept)))
  expect(words.querySelector('.w')).toBeNull()
  expect(words.querySelectorAll('span span')).toHaveLength(0)
})

test('next collection: after Drift back to the start, otherwise the next one', async () => {
  const a = render(await page('drift'))
  const next = a.container.querySelector('#next')!
  expect(next.textContent).toContain('Back to the start of the journey')
  expect(within(next as HTMLElement).getByRole('link')).toHaveAttribute('href', '/collections/mano-padana/')
  a.unmount()
  const b = render(await page('lunelle'))
  const n2 = b.container.querySelector('#next')!
  expect(n2.textContent).toContain('Next collection')
  expect(within(n2 as HTMLElement).getByRole('link', { name: /Drift/ })).toHaveAttribute('href', '/collections/drift/')
})

test('server HTML: nothing hidden, the hero photo carries the view-transition name, the contact card follows', async () => {
  for (const slug of ['drift', 'revive', 'lunelle', 'mano-padana']) {
    const html = renderToStaticMarkup(await page(slug))
    expect(html).not.toMatch(/opacity:\s*0[;"]/)
    expect(html).not.toMatch(/visibility:\s*hidden/)
    expect(html).toContain('id="contact"')
    const doc = document.createElement('div')
    doc.innerHTML = html
    expect(doc.querySelector('#hero .vt-photo img')).not.toBeNull()
    expect(doc.querySelector('#hero img')!.getAttribute('loading')).toBeNull()
  }
})
