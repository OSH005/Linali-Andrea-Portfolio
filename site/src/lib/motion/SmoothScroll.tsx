'use client'
import { useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotion } from './useMotion'
import { LenisContext } from './lenisContext'

export { useLenis } from './lenisContext'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const { on } = useMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (!on) return
    const l = new Lenis({ lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075, autoRaf: false, respectReducedMotion: false })
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
