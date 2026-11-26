'use client'
import type { MouseEvent } from 'react'
import { useLenis } from './lenisContext'

/** A same-page jump that goes through Lenis when it runs (a plain anchor jump otherwise). */
export function useJump() {
  const lenis = useLenis()
  return (e: MouseEvent<HTMLAnchorElement>) => {
    const id = e.currentTarget.hash
    if (!lenis || !id) return
    e.preventDefault()
    lenis.scrollTo(id)
  }
}
