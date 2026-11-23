'use client'
import { useEffect, useRef } from 'react'

// Opens/closes a native <dialog> as a modal, locks page scroll while open,
// and returns focus to whatever opened it. A close the browser makes on its
// own (e.g. Android back via close watchers) is reported through onClose.
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const active = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const release = () => {
    if (!active.current) return
    active.current = false
    document.body.style.overflow = ''
    opener.current?.focus()
  }

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !active.current) {
      opener.current = document.activeElement as HTMLElement | null
      if (!d.open) d.showModal()
      if (!d.contains(document.activeElement)) d.focus()
      document.body.style.overflow = 'hidden'
      active.current = true
    } else if (!open && active.current) {
      if (d.open) d.close()
      release()
    }
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onNativeClose = () => {
      if (!active.current) return
      release()
      onCloseRef.current()
    }
    d.addEventListener('close', onNativeClose)
    return () => d.removeEventListener('close', onNativeClose)
  }, [])

  useEffect(() => () => void (active.current && (document.body.style.overflow = '')), [])
  return ref
}
