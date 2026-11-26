// reduced motion: the pieces laid out as without JS
vi.hoisted(() => {
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

import { render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import PatternMat from './PatternMat'
import { getSite } from '@/lib/site'

const SPEC = [
  ['Craft', 'Cut 1 on fold', ['Dumbara weaving', 'Crochet & macramé', 'Hand embroidery', 'Denim reconstruction']],
  ['Design', 'Cut 2', ['Fashion design', 'Draping', 'Garment construction', 'Sustainable design']],
  ['Tools', 'Cut 2 · mirror', ['Adobe Photoshop', 'Adobe Illustrator', 'Technical drawing', 'Fashion illustration']],
  ['People', 'Cut 1 · fold at top', ['Leadership', 'Team building', 'Public speaking', 'Time management']],
] as const

test('PatternMat: four pieces in order, their skills one per line, centred, nothing invisible', () => {
  const { container, getByRole } = render(<PatternMat skills={getSite().skills} />)
  const sec = container.querySelector('section[data-chapter="Skills"]')!
  expect(sec).toBeTruthy()
  expect(getByRole('heading', { level: 2 })).toHaveTextContent('What I work with')
  expect(sec.textContent).toContain('Laid out like pattern pieces on my cutting mat.')
  const figs = [...sec.querySelectorAll('figure')]
  expect(figs).toHaveLength(4)
  figs.forEach((f, i) => {
    const [name, cut, skills] = SPEC[i]
    expect(f.querySelector('h3')).toHaveTextContent(name)
    expect(f.textContent).toContain(cut)
    expect([...f.querySelectorAll('li')].map((l) => l.textContent)).toEqual(skills)
  })
  expect(sec.textContent).toMatch(/16 skills/i)
  expect(sec.innerHTML).not.toMatch(/opacity:\s*0[;"]/)
  // every line on a piece sits on its centre line
  const css = readFileSync('src/components/about/PatternMat.module.css', 'utf8')
  expect(css).toMatch(/\.pc\s*\{[^}]*text-align:\s*center/)
})
