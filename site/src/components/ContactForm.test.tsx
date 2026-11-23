import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'

const fill = async () => {
  await userEvent.type(screen.getByLabelText('Name'), 'Ama')
  await userEvent.type(screen.getByLabelText('Email'), 'ama@example.com')
  await userEvent.type(screen.getByLabelText('Message'), 'Hello')
}
const send = () => userEvent.click(screen.getByRole('button', { name: 'Send message' }))

afterEach(() => vi.unstubAllGlobals())

test('requires name, email and message', async () => {
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  render(<ContactForm endpoint="https://form.example/x" />)
  await send()
  expect(fetch).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Name')).toBeInvalid()
})

test('posts and shows thanks', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true })
  vi.stubGlobal('fetch', fetch)
  render(<ContactForm endpoint="https://form.example/x" />)
  await fill()
  await send()
  expect(fetch).toHaveBeenCalledWith('https://form.example/x', expect.objectContaining({ method: 'POST' }))
  expect(await screen.findByText('Thank you. I’ll reply soon.')).toBeInTheDocument()
})

test('shows a retry message on failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  render(<ContactForm endpoint="https://form.example/x" />)
  await fill()
  await send()
  expect(await screen.findByRole('alert')).toHaveTextContent(/try again/)
})

test('no endpoint → not connected message, no fetch', async () => {
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  render(<ContactForm />)
  await fill()
  await send()
  expect(fetch).not.toHaveBeenCalled()
  expect(await screen.findByRole('alert')).toHaveTextContent('The contact form isn’t connected yet.')
})

test('honeypot filled → pretends success, no fetch', async () => {
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  const { container } = render(<ContactForm endpoint="https://form.example/x" />)
  await fill()
  ;(container.querySelector('input[name="_gotcha"]') as HTMLInputElement).value = 'spam'
  await send()
  expect(fetch).not.toHaveBeenCalled()
  expect(await screen.findByText('Thank you. I’ll reply soon.')).toBeInTheDocument()
})

test('without JavaScript the form posts to the endpoint, never a GET', () => {
  const { container } = render(<ContactForm endpoint="https://form.example/x" />)
  const form = container.querySelector('form')!
  expect(form.getAttribute('method')).toBe('post')
  expect(form.getAttribute('action')).toBe('https://form.example/x')
})
