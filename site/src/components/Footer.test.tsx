import { render, screen } from '@testing-library/react'
import Footer from './Footer'

test('contact card: closing line and the form', () => {
  const { container } = render(<Footer variant="flow" />)
  expect(screen.getByRole('heading', { name: 'Let’s make something together.' })).toBeInTheDocument()
  for (const f of ['Name', 'Email', 'Message']) expect(screen.getByLabelText(f)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument()
  expect(container.querySelector('footer')).toHaveAttribute('id', 'contact')
})
