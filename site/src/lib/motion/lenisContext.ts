'use client'
import { createContext, useContext } from 'react'
import type Lenis from 'lenis'

// Kept apart from SmoothScroll so consumers (dialogs) don't load gsap.
export const LenisContext = createContext<Lenis | null>(null)

/** The running Lenis, or null while motion is off or before mount. Scenes may tweak `options` temporarily. */
export const useLenis = () => useContext(LenisContext)
