'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useMotion } from '@/lib/motion/useMotion'
import { lerp, out3 } from '@/lib/motion/ease'
import Photo from '@/components/home/Photo'
import type { Pic } from '@/components/home/data'
import { frameImage } from './frames'
import s from './AboutMe.module.css'

const FRAMES = 5 // CSS shows 2 on phones, 3 on tablets, 5 on desktop

/**
 * My inspiration (mockup `a-mood`): fixed frames that change photograph in turn, each new one wiping up from the bottom
 * (period 3.2s, staggered 0.6s). Nothing to measure and nothing slides in from off screen, so the frames always show.
 * Every frame holds every photo, stacked; frame f starts on photo 2f (first in its markup, on top without JS).
 */
export default function InspirationFrames({ images }: { images: Pic[] }) {
  const { on } = useMotion()
  const box = useRef<HTMLDivElement>(null)
  const n = images.length

  useEffect(() => {
    if (!on) return
    const el = box.current!, frames = [...el.children].map((fr) => [...fr.children] as HTMLElement[])
    const g = { top: 0, bottom: 0, H: 0, t0: -1, turn: frames.map(() => NaN) }
    const measure = () => {
      const r = el.getBoundingClientRect()
      Object.assign(g, { top: r.top + scrollY, bottom: r.bottom + scrollY, H: innerHeight })
    }
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    ro?.observe(document.body)
    measure()
    // the child that holds photo i in frame f (each frame's markup starts at its own first photo)
    const child = (f: number, i: number) => frames[f][(i - 2 * f + 2 * n) % n]
    const paint = (now: number) => {
      if (g.t0 < 0) g.t0 = now
      const y = scrollY
      if (y + g.H < g.top || y > g.bottom) return
      frames.forEach((_, f) => {
        // hold each frame on its first photo until its own first turn
        const { cur, prev, k } = frameImage(f, Math.max(now - g.t0, f * 0.6) + 0.9, n)
        const turn = cur * n + prev
        if (turn !== g.turn[f]) {
          g.turn[f] = turn
          frames[f].forEach((im) => Object.assign(im.style, { zIndex: '0', clipPath: '', transform: '' }))
          Object.assign(child(f, prev).style, { zIndex: '1', transform: 'scale(1.02)' })
          child(f, cur).style.zIndex = '2'
        }
        if (k >= 1 && child(f, cur).style.clipPath === 'none') return
        const kk = out3(k), c = child(f, cur).style
        c.clipPath = kk >= 1 ? 'none' : `inset(${((1 - kk) * 100).toFixed(2)}% 0 0 0)`
        c.transform = `scale(${lerp(1.12, 1.02, kk).toFixed(4)})`
      })
    }
    gsap.ticker.add(paint)
    return () => {
      gsap.ticker.remove(paint)
      ro?.disconnect()
      frames.flat().forEach((im) => Object.assign(im.style, { zIndex: '', clipPath: '', transform: '' }))
    }
  }, [on, n])

  return (
    <section className={s.mood} aria-labelledby="inspiration-title">
      <h2 id="inspiration-title" className="label">My inspiration</h2>
      <div ref={box} className={s.mf}>
        {Array.from({ length: FRAMES }, (_, f) => (
          // one frame speaks for all: the others repeat its photos
          <div key={f} className={s.fr} aria-hidden={f > 0 || undefined}>
            {images.map((_, j) => (
              <Photo key={j} p={images[(j + 2 * f) % n]} className={s.im} sizes="(min-width: 1024px) 18vw, (min-width: 600px) and (min-height: 600px) 30vw, 45vw" />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
