'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotion } from './useMotion'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext<Lenis | null>(null)

/** The running Lenis, or null while motion is off or before mount. Scenes may tweak `options` temporarily. */
export const useLenis = () => useContext(LenisContext)

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const { on } = useMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (!on) return
    const l = new Lenis({ lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075, autoRaf: false })
    const tick = (time: number) => l.raf(time * 1000)
    l.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)
    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      l.destroy()
      setLenis(null)
    }
  }, [on])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
