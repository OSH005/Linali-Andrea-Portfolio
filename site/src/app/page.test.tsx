// gsap's ScrollTrigger calls matchMedia while the module loads; reduced motion keeps the stacked page
vi.hoisted(() => {
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import Home from './page'
import { LN, MANIFEST, MP, RV, SP, DESK_STRIP } from '@/components/home/story'
import { getCollection } from '@/lib/collections'

const drift = getCollection('drift')!

test('story order: opening, four collections, contact', () => {
  const { container } = render(<Home />)
  const ids = [...container.querySelectorAll('section[id], footer')].map((el) => el.id)
  expect(ids).toEqual(['top', 'mano-padana', 'revive', 'lunelle', 'drift', 'contact'])
})

test('every sentence and every look is in the static HTML', () => {
  const doc = document.createElement('div')
  doc.innerHTML = renderToStaticMarkup(<Home />)
  const text = doc.textContent!.replace(/\s+/g, ' ')
  for (const s of [MANIFEST, 'Linali Andrea', 'Fashion designer · Sri Lanka', ...MP, ...RV, ...LN, ...SP, ...drift.looks!.map((l) => l.text), 'Six looks, six models.', 'Explore the collection →'])
    expect(text).toContain(s)
  for (let n = 1; n <= 6; n++) expect(text).toContain(`Look 0${n} / 06`)
})

test('every photo has its alt text from the collection JSON', () => {
  const { container } = render(<Home />)
  const alts = [...container.querySelectorAll('img')].map((i) => i.alt)
  for (const id of ['01-IMG-20250506-WA0022', '04-IMG-20250506-WA0031']) expect(alts).toContain(getCollection('mano-padana')!.alt[id])
  for (const id of ['01-MMS_5485-3', '06-MMS_5601-12']) expect(alts).toContain(getCollection('lunelle')!.alt[id])
  for (const id of ['13-MMS_8698', '07-MMS_8542']) expect(alts).toContain(drift.alt[id])
})

test('the strip shows each look with the photos drift.json gives it', () => {
  const looks = DESK_STRIP.flatMap((it, i) => (it.kind === 'look' ? [[DESK_STRIP[i + 1], DESK_STRIP[i + 2]].map((p) => (p.kind === 'img' ? p.ref : null))] : []))
  expect(looks).toEqual(drift.looks!.map((l) => l.shots))
})

test('no element starts hidden by default (JS-off safety)', () => {
  const html = renderToStaticMarkup(<Home />)
  expect(html).not.toMatch(/opacity:\s*0[;"]/)
  expect(html).not.toMatch(/visibility:\s*hidden/)
  expect(html).not.toContain('data-stage')
})
