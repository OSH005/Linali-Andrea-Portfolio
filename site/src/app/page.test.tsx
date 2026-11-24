import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import Home from './page'

vi.mock('@/components/ShootGallery', () => ({ default: () => <div data-testid="gallery" /> }))
vi.mock('@/components/PortfolioReader', () => ({ default: () => <div data-testid="reader" /> }))
vi.mock('@/components/StudioTable', () => ({ default: () => <div data-testid="studio" /> }))

test('story order: hero, manifesto, 4 chapters, person, footer', () => {
  const { container } = render(<Home />)
  const ids = [...container.querySelectorAll('main > section, footer')].map((el) => el.id)
  expect(ids).toEqual(['top', 'manifesto', 'mano-padana', 'revive', 'lunelle', 'drift', 'about', 'contact'])
})

test('no element starts hidden by default (JS-off safety)', () => {
  const html = renderToStaticMarkup(<Home />)
  expect(html).not.toMatch(/opacity:\s*0[;"]/)
  expect(html).not.toMatch(/visibility:\s*hidden/)
})
