'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useMotion } from '@/lib/motion/useMotion'
import Photo from '@/components/home/Photo'
import type { CollectionData } from './data'
import s from './InMyWords.module.css'

/**
 * In my words (mockup `x-words`): short and still. Her concept as two paragraphs, the first as a lead; beside it
 * (phone: under it) a two-column film of her photographs rolls past, with time and with scroll. The text never moves.
 */
export default function InMyWords({ d }: { d: CollectionData }) {
  const { on } = useMotion()
  const sec = useRef<HTMLElement>(null)
  const film = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!on) return
    const el = sec.current!, cols = [...film.current!.children] as HTMLElement[]
    const g = { top: 0, h: 0, H: 0, half: 0, row: false }
    const measure = () => {
      g.row = getComputedStyle(film.current!).flexDirection === 'column' // phone: the columns are rows
      g.half = (g.row ? cols[0].scrollWidth : cols[0].scrollHeight) / 2
      g.top = el.getBoundingClientRect().top + scrollY
      g.h = el.offsetHeight
      g.H = innerHeight
    }
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    ro?.observe(el)
    addEventListener('resize', measure)
    measure()
    const paint = (t: number) => {
      const y = scrollY
      if (!g.half || y < g.top - g.H || y > g.top + g.h) return
      const dd = (((y - g.top) * 0.3 + t * 14) % g.half + g.half) % g.half
      cols.forEach((c, k) => {
        const o = (k ? -(g.half - dd) : -dd).toFixed(1)
        c.style.transform = g.row ? `translate3d(${o}px,0,0)` : `translate3d(0,${o}px,0)`
      })
    }
    gsap.ticker.add(paint)
    return () => {
      gsap.ticker.remove(paint)
      ro?.disconnect()
      removeEventListener('resize', measure)
      cols.forEach((c) => (c.style.transform = ''))
    }
  }, [on])

  const [lead, body] = d.concept
  return (
    <section ref={sec} id="words" className={s.words} aria-labelledby="words-title">
      <div className={s.grid}>
        <div className={s.l}>
          <h2 id="words-title" className="label">In my words</h2>
          <p className={`label ${s.ws}`}>
            {d.title} · {d.season}
          </p>
        </div>
        <div className={s.tx}>
          <p className="lead">{lead}</p>
          {body && <p className="body">{body}</p>}
        </div>
        <div ref={film} className={s.film} aria-hidden="true">
          {[0, 1].map((k) => {
            const col = d.film.filter((_, i) => i % 2 === k)
            // doubled, so the roll can loop
            return (
              <div key={k} className={s.col}>
                {[...col, ...col].map((p, i) => <Photo key={i} p={p} className={s.ph} sizes="(min-width: 1024px) 15vw, 30vw" />)}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
