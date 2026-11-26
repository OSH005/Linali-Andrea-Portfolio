'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useMotion } from '@/lib/motion/useMotion'
import { clamp01, lerp, out3, spring } from '@/lib/motion/ease'
import { useHeader } from '@/components/header/HeaderContext'
import Photo from '@/components/home/Photo'
import { useJump } from '@/lib/motion/useJump'
import type { Pic } from '@/components/home/data'
import s from './AboutOpening.module.css'

/** Depth of each layer (mockup `INSP`, `POLA`, `.a-fig`): how far it floats with the pointer and lifts with scroll. */
const SMALL_Z = [0.35, 0.3], HER_Z = 0.15, POLA_Z = [1, 0.75, 0.9]

/**
 * The About opening (mockup `a-hero`): cream, her cut-out flush with the bottom edge, three taped polaroids, two small
 * inspiration photos at the back (desktop). With motion the polaroids drop in on a damped spring, the layers float at
 * their depth with the pointer (touch: drifting on their own) and lift away at their depth as you scroll. The text never moves.
 * Also keeps the header's chapter: every `main > section[data-chapter]`, then the contact card.
 */
export default function AboutOpening(p: { name: string; role: string; manifesto: string; her: Pic; polaroids: Pic[]; small: Pic[] }) {
  const { on } = useMotion()
  const { set } = useHeader()
  const jump = useJump()
  const sec = useRef<HTMLElement>(null)

  useEffect(() => {
    const marks = [...document.querySelectorAll<HTMLElement>('main > section[data-chapter]'), document.getElementById('contact')]
    set({ chapters: [...marks.slice(0, -1).map((m) => m!.dataset.chapter!), '— Get in touch'], chapter: 0, dock: 1, dark: false, x0: null })
    const chapter = () => set({ chapter: Math.max(0, marks.filter((m) => m && m.getBoundingClientRect().top < innerHeight / 2).length - 1) })
    chapter()
    addEventListener('scroll', chapter, { passive: true })
    return () => {
      removeEventListener('scroll', chapter)
      set({ chapters: [''], chapter: 0 })
    }
  }, [set])

  useEffect(() => {
    if (!on) return
    const layers = [...sec.current!.querySelectorAll<HTMLElement>('[data-z]')]
    const fine = matchMedia('(hover: hover) and (pointer: fine)')
    const g = { W: innerWidth, H: innerHeight, mx: 0.5, my: 0.5, mIn: false, sx: 0, sy: 0, t0: -1 }
    const resize = () => Object.assign(g, { W: innerWidth, H: innerHeight })
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      Object.assign(g, { mx: e.clientX / g.W, my: e.clientY / g.H, mIn: true })
    }
    const leave = () => void (g.mIn = false)
    addEventListener('resize', resize)
    addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    const paint = (now: number) => {
      if (g.t0 < 0) g.t0 = now
      const t = now - g.t0, y = scrollY, { W, H } = g
      // a fine pointer leads; touch screens drift on their own
      const drift = !fine.matches
      const tx = drift ? 0.5 * Math.sin(t * 0.45) : g.mIn ? g.mx - 0.5 : 0
      const ty = drift ? 0.5 * Math.cos(t * 0.37) : g.mIn ? g.my - 0.5 : 0
      g.sx = lerp(g.sx, tx, 0.06)
      g.sy = lerp(g.sy, ty, 0.06)
      if (y > H * 1.2 && t > 2) return
      layers.forEach((d, i) => {
        const z = +d.dataset.z!, pola = 'pola' in d.dataset, k = clamp01((t - 0.45 - i * 0.14) / 1.1), sp = spring(k)
        const px = -g.sx * W * 0.03 * z, py = -g.sy * H * 0.03 * z - y * 0.45 * z
        d.style.transform = pola
          ? `translate3d(${px.toFixed(1)}px,${(py - (1 - sp) * H * 0.35).toFixed(1)}px,0) rotate(${((1 - sp) * 14).toFixed(2)}deg)`
          : `translate3d(${px.toFixed(1)}px,${(py + (1 - out3(k)) * H * 0.04).toFixed(1)}px,0)`
      })
    }
    gsap.ticker.add(paint)
    return () => {
      gsap.ticker.remove(paint)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      layers.forEach((d) => (d.style.transform = ''))
    }
  }, [on])

  return (
    <section ref={sec} id="intro" data-chapter="About" className={s.hero} aria-labelledby="about-name">
      {p.small.map((im, i) => (
        <div key={i} className={`${s.d} ${s.small} ${s[`s${i}`]}`} data-z={SMALL_Z[i]} aria-hidden="true">
          <Photo p={im} sizes="(min-width: 1024px) 9vw, 1px" />
        </div>
      ))}
      <div className={s.txt}>
        <p className="label">About</p>
        <h1 id="about-name" className={`title-page ${s.name}`}>{p.name}</h1>
        <p className={`label ${s.role}`}>{p.role}</p>
        <p className={s.quote}>“{p.manifesto}”</p>
        <a href="#contact" onClick={jump} className={s.go}>Get in touch →</a>
      </div>
      <div className={`${s.d} ${s.fig}`} data-z={HER_Z}>
        <Photo p={p.her} sizes="(min-width: 1024px) 50vw, 60vw" eager />
      </div>
      {p.polaroids.map((im, i) => (
        <div key={i} className={`${s.d} ${s.pola} ${s[`p${i}`]}`} data-z={POLA_Z[i]} data-pola="">
          <span className={s.tape} aria-hidden="true" />
          <Photo p={im} sizes="(min-width: 1024px) 14vw, 36vw" />
        </div>
      ))}
    </section>
  )
}
