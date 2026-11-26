// reduced motion: the readable page (as without JS)
vi.hoisted(() => {
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

import { render, within } from '@testing-library/react'
import About from '@/app/about/page'
import { getSite } from '@/lib/site'
import { frameImage } from './frames'

test('frameImage: frame f starts on image 2f, stepping 3 each period, staggered 0.6s', () => {
  expect(frameImage(0, 0, 7).cur).toBe(0)
  expect(frameImage(1, 0.6, 7).cur).toBe(2)
  expect(frameImage(0, 3.2, 7)).toMatchObject({ cur: 3, prev: 0, k: 0 })
  expect(frameImage(0, 3.2 + 0.45, 7).k).toBeCloseTo(0.5)
  expect(frameImage(0, 5, 7).k).toBe(1)
  expect(frameImage(1, 0, 7).cur).toBe(6) // before its first turn: (2 − 3) mod 7
})

test('About: opening, about me, my inspiration; first person, no draft, no phone or email', () => {
  const site = getSite()
  const { container, getByRole } = render(<About />)
  const main = container.querySelector('main')!
  expect(getByRole('heading', { level: 1 })).toHaveTextContent('Linali Andrea')
  const text = main.textContent!
  for (const s of ['About', 'Fashion designer · Panadura, Sri Lanka', `“${site.manifesto}”`, site.bio, 'About me', 'My inspiration']) expect(text).toContain(s)
  for (const f of site.facts) for (const s of [f.label, f.title, f.detail]) expect(text).toContain(s)
  expect(main.querySelectorAll('dl dt')).toHaveLength(3)

  const li = getByRole('link', { name: /LinkedIn/ })
  expect(li).toHaveAttribute('href', site.links.linkedin)
  expect(li).toHaveAttribute('rel', 'noopener')
  expect(li).toHaveAttribute('target', '_blank')
  // the only outside link
  expect([...main.querySelectorAll('a')].filter((a) => /^https?:/.test(a.getAttribute('href')!))).toHaveLength(1)

  const insp = getByRole('region', { name: 'My inspiration' })
  const alts = new Set([...insp.querySelectorAll('img')].map((i) => i.alt))
  expect(alts.size).toBe(7)
  for (const a of alts) expect(a.length).toBeGreaterThan(10)
  expect(within(insp).getAllByRole('img').length).toBeGreaterThanOrEqual(7)

  // her cut-out loads first; the rest are lazy
  const imgs = [...main.querySelectorAll('img')]
  expect(imgs.filter((i) => i.getAttribute('loading') !== 'lazy').map((i) => i.alt)).toEqual([site.personalAlt[site.portrait.figure]])

  const all = container.textContent!
  expect(all).not.toMatch(/draft/i)
  expect(all).not.toMatch(/\+?\d[\d\s-]{7,}\d/)
  expect(all).not.toMatch(/\S+@\S+\.\S+/)
  expect(all).not.toMatch(/Junior/i)
  // nothing starts invisible in the HTML
  expect(main.innerHTML).not.toMatch(/opacity:\s*0[;"]/)
})
