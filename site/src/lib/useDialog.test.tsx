import { render } from '@testing-library/react'
import { useDialog } from './useDialog'
import { LenisContext } from './motion/lenisContext'
import type Lenis from 'lenis'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    this.open = false
  }
})

function D({ open }: { open: boolean }) {
  const ref = useDialog(open, () => {})
  return <dialog ref={ref} />
}

test('an open dialog stops Lenis; closing starts it again', () => {
  const lenis = { stop: vi.fn(), start: vi.fn() } as unknown as Lenis
  const ui = (open: boolean) => (
    <LenisContext.Provider value={lenis}>
      <D open={open} />
    </LenisContext.Provider>
  )
  const { rerender } = render(ui(false))
  expect(lenis.stop).not.toHaveBeenCalled()
  rerender(ui(true))
  expect(lenis.stop).toHaveBeenCalledTimes(1)
  expect(lenis.start).not.toHaveBeenCalled()
  rerender(ui(false))
  expect(lenis.start).toHaveBeenCalledTimes(1)
})

test('works without Lenis (motion off)', () => {
  const { rerender } = render(<D open={false} />)
  rerender(<D open />)
  rerender(<D open={false} />)
})
