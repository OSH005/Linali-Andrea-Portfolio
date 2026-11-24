import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import gsap from 'gsap'
import SiteHeader from './SiteHeader'

const setOnSpy = vi.fn()
vi.mock('@/lib/motion/useMotion', () => ({
  useMotion: () => {
    const [on, set] = useState(true)
    return { on, setOn: (v: boolean) => (setOnSpy(v), set(v)) }
  },
}))

let phone = false
beforeAll(() => {
  window.matchMedia = ((q: string) => ({ matches: q.includes('min-width: 1024px') ? !phone : false, media: q })) as unknown as typeof window.matchMedia
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})
afterEach(() => {
  phone = false
  setOnSpy.mockClear()
})

const props = { mark: { src: '/m.webp', width: 748, height: 923 }, linkedin: 'https://www.linkedin.com/in/linali-andrea-831216363' }

test('links Collections, About and Contact; Contact jumps to the contact card', () => {
  render(<SiteHeader {...props} />)
  const nav = screen.getByRole('navigation', { name: 'Main' })
  expect(within(nav).getByRole('link', { name: 'Collections' })).toHaveAttribute('href', '/collections/')
  expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about/')
  expect(within(nav).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact')
  expect(within(nav).getByRole('link', { name: 'Linali Andrea, home' })).toHaveAttribute('href', '/')
})

test('the Motion button toggles aria-pressed and calls setOn', async () => {
  render(<SiteHeader {...props} />)
  const nav = screen.getByRole('navigation', { name: 'Main' })
  const motion = within(nav).getByRole('button', { name: 'Motion' })
  expect(motion).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(motion)
  expect(setOnSpy).toHaveBeenCalledWith(false)
  expect(motion).toHaveAttribute('aria-pressed', 'false')
})

test('on a phone the Menu opens a sheet; Esc closes it and focus returns to Menu', async () => {
  phone = true
  render(<SiteHeader {...props} />)
  const menu = screen.getByRole('button', { name: 'Menu' })
  await userEvent.click(menu)
  const sheet = screen.getByRole('dialog')
  expect(sheet).toHaveProperty('open', true)
  for (const name of ['Collections', 'About', 'Contact', 'LinkedIn']) expect(within(sheet).getByRole('link', { name })).toBeInTheDocument()
  expect(within(sheet).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', props.linkedin)
  expect(within(sheet).getByRole('button', { name: 'Motion' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.keyboard('{Escape}')
  expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', false)
  expect(document.activeElement).toBe(menu)
})

test('a link in the sheet closes it', async () => {
  phone = true
  render(<SiteHeader {...props} />)
  await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
  const sheet = screen.getByRole('dialog')
  within(sheet).getByRole('link', { name: 'Contact' }).addEventListener('click', (e) => e.preventDefault())
  await userEvent.click(within(sheet).getByRole('link', { name: 'Contact' }))
  expect(screen.getByRole('dialog', { hidden: true })).toHaveProperty('open', false)
})

test('motion off: fully sewn and static; over the contact card the pill turns night', async () => {
  render(
    <>
      <SiteHeader {...props} />
      <footer id="contact" />
    </>,
  )
  document.getElementById('contact')!.getBoundingClientRect = () => ({ top: -10 }) as DOMRect
  const bar = screen.getByRole('navigation', { name: 'Main' })
  await userEvent.click(within(bar).getByRole('button', { name: 'Motion' })) // off: every value snaps
  act(() => gsap.ticker.tick())
  expect(bar.style.getPropertyValue('--dk')).toBe('1.000')
  expect(bar.style.getPropertyValue('--dock')).toBe('1.000')
  expect(bar.querySelector('path[pathLength]')).toHaveAttribute('stroke-dasharray', '.5 .3333')
  expect(bar.style.transform).toBe('translate(0px)') // centred, never hidden
})
