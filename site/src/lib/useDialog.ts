'use client'
import { useEffect, useRef } from 'react'

// Opens/closes a native <dialog> as a modal, locks page scroll while open,
// and returns focus to whatever opened it.
export function useDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null
      d.showModal()
      if (!d.contains(document.activeElement)) d.focus()
      document.body.style.overflow = 'hidden'
    } else if (!open && d.open) {
      d.close()
      document.body.style.overflow = ''
      opener.current?.focus()
    }
  }, [open])

  useEffect(() => () => void (document.body.style.overflow = ''), [])
  return ref
}
