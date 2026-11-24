'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { clamp01, out3 } from '@/lib/motion/ease'
import { useMotion } from '@/lib/motion/useMotion'
import Photo from '@/components/home/Photo'
import type { IndexData } from './data'
import { swing } from './rail'
import s from './Seasons.module.css'

/** Where each season sits on the thread (mockup SEAS: .16, .44, .77 for three). */
const at = (i: number, n: number) => (n < 2 ? 0.5 : 0.16 + (i * 0.61) / (n - 1))

/**
 * Seasons: a teal thread across the screen with a node per season, its collections hanging from it as polaroid tags.
 * Without motion it is laid flat. Motion on: the section pins briefly while the thread sews across; at each season the
 * year rises and that season's tags swing in (a damped swing), timed from the moment the needle passes, never scrubbed.
 */
export default function Seasons({ data }: { data: IndexData }) {
  const { on } = useMotion()
  const sec = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!on) return
    const el = sec.current!
    const thread = el.querySelector<SVGElement>('svg')!
    const seasons = [...el.querySelectorAll<HTMLElement>('[data-x]')].map((li) => ({
      x: +li.dataset.x!,
      yr: li.querySelector<HTMLElement>('h3 > span')!,
      tags: [...li.querySelectorAll<HTMLElement>('li')],
      at: -1, // when the needle passed (ticker seconds), -1 before
    }))
    const own = new Map([el, thread, ...seasons.flatMap((x) => [x.yr, ...x.tags])].map((x) => [x, x.getAttribute('style')]))
    el.setAttribute('data-live', '')
    let top0 = 0, H = 0, inn = false
    const measure = () => void ((H = innerHeight), (top0 = el.getBoundingClientRect().top + scrollY))
    const paint = () => {
      const now = gsap.ticker.time, sp = clamp01((scrollY - top0 + H * 0.45) / (H * 0.85))
      // the heading comes up as the section enters from below (out of sight until then)
      if (!inn && scrollY + H > top0) el.setAttribute('data-in', '')
      inn ||= scrollY + H > top0
      thread.style.clipPath = `inset(-20px ${((1 - sp) * 100).toFixed(2)}% -20px 0)`
      for (const z of seasons) {
        if (sp > z.x - 0.04 && z.at < 0) z.at = now
        if (sp <= z.x - 0.04) z.at = -1
        const t = z.at < 0 ? -1 : now - z.at
        z.yr.style.transform = `translateY(${((1 - out3(clamp01(t / 0.7))) * 110).toFixed(1)}%)`
        z.tags.forEach((tag) => {
          const tt = t - 0.1 // the tag follows its year
          tag.style.transform = `translateY(${tt < 0 ? -12 : 0}px) rotate(${swing(tt).toFixed(2)}deg)`
          tag.style.opacity = tt < 0 ? '0' : clamp01(tt * 4).toFixed(3)
        })
      }
    }
    measure()
    paint()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    ro?.observe(document.body)
    addEventListener('resize', measure)
    gsap.ticker.add(paint)
    return () => {
      gsap.ticker.remove(paint)
      ro?.disconnect()
      removeEventListener('resize', measure)
      el.removeAttribute('data-live')
      el.removeAttribute('data-in')
      own.forEach((v, x) => (v == null ? x.removeAttribute('style') : x.setAttribute('style', v)))
    }
  }, [on])

  const byslug = Object.fromEntries(data.rows.map((r) => [r.slug, r]))
  const n = data.seasons.length
  return (
    <section ref={sec} className={s.sea} aria-labelledby="seasons-title">
      <div className={s.pin}>
        <p className="label">Seasons</p>
        <h2 id="seasons-title" className={`title-section ${s.title}`}>
          {data.seasonsHeading}
        </h2>
        <div className={s.stage}>
          <svg className={s.thread} aria-hidden="true" preserveAspectRatio="none">
            <line x1="0" y1="1.5" x2="100%" y2="1.5" stroke="#008794" strokeWidth="2.5" strokeDasharray="14 10" />
          </svg>
          <ol className={s.list} aria-label="Seasons">
            {data.seasons.map((z, i) => (
              <li key={z.season} data-x={at(i, n)} style={{ '--x': at(i, n) } as CSSProperties}>
                <h3 className={s.yr}>
                  <span>{z.season}</span>
                </h3>
                <span className={s.node} aria-hidden="true" />
                <ul className={s.tags}>
                  {z.rows.map((slug, j) => (
                    <li key={slug} className={s.tag} style={{ '--o': z.rows.length > 1 ? j * 2 - 1 : 0 } as CSSProperties}>
                      <span className={s.str} aria-hidden="true" />
                      <span className={s.pol}>
                        <Photo p={byslug[slug].pics[0]} sizes="(min-width: 1024px) 12vw, 130px" />
                        <span className={`label ${s.name}`}>{byslug[slug].title}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
