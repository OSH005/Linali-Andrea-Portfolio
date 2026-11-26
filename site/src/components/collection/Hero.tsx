'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useMotion } from '@/lib/motion/useMotion'
import { useJump } from '@/lib/motion/useJump'
import { useHeader } from '@/components/header/HeaderContext'
import Photo from '@/components/home/Photo'
import type { CollectionData } from './data'
import s from './Hero.module.css'

/**
 * The collection's opening (mockup `x-hero`). Desktop: her first photographs side by side at full height, uncropped,
 * drifting slowly left under a dark radial shade, the text bottom-left. Tablets: the same strip, shorter, the text under it.
 * Phones: one photograph (66% of the screen) with the text under it. Also keeps the header's chapter and day/night.
 */
export default function Hero({ d }: { d: CollectionData }) {
  const { on } = useMotion()
  const { set } = useHeader()
  const jump = useJump()
  const sec = useRef<HTMLElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const one = useRef<HTMLDivElement>(null)
  const [loop, setLoop] = useState(false)
  const hasShoot = d.shoot.length > 0

  // the header: the chapter you're in, and night over the dark hero on desktop
  useEffect(() => {
    const chapters = [d.title, ...(hasShoot ? ['The shoot'] : []), 'The portfolio', 'Next', '— Get in touch']
    const marks = ['hero', ...(hasShoot ? ['shoot'] : []), 'portfolio', 'next', 'contact'].map((id) => document.getElementById(id))
    const desk = matchMedia('(min-width: 1024px)')
    set({ chapters, chapter: 0, dock: 1, dark: false, x0: null })
    const update = () =>
      set({
        chapter: Math.max(0, marks.filter((m) => m && m.getBoundingClientRect().top < innerHeight / 2).length - 1),
        dark: desk.matches && scrollY < innerHeight * 0.7,
      })
    update()
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    return () => {
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
      set({ chapters: [''], chapter: 0, dark: false })
    }
  }, [set, d.title, hasShoot])

  // motion: the strip drifts left (and with scroll), looping on a second copy; the phone photo has a slow parallax
  useEffect(() => {
    if (!on) return
    setLoop(true)
    const st = strip.current!, ph = one.current!
    let half = 0
    const measure = () => void (half = st.scrollWidth / 2)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    ro?.observe(st)
    measure()
    const paint = (t: number) => {
      const y = scrollY
      if (half) st.style.transform = `translate3d(${(-((y * 0.35 + t * 6) % half)).toFixed(1)}px,0,0)`
      ph.style.transform = `translate3d(0,${(y * 0.3).toFixed(1)}px,0) scale(1.05)`
    }
    gsap.ticker.add(paint)
    return () => {
      gsap.ticker.remove(paint)
      ro?.disconnect()
      st.style.transform = ph.style.transform = ''
      setLoop(false)
    }
  }, [on])

  // each photo is as wide as the screen is tall times its ratio (desktop 100%, tablet 62% of the height)
  const sizes = (p: { width: number; height: number }) => {
    const ar = p.width / p.height
    return `(min-width: 1024px) ${Math.round(ar * 100)}vh, (min-width: 600px) and (min-height: 600px) ${Math.round(ar * 62)}vh, 1px`
  }
  return (
    <section ref={sec} id="hero" className={s.hero} aria-labelledby="collection-title">
      <div ref={strip} className={s.strip}>
        {d.hero.desktop.map((p, i) => (
          // the first photo carries the view-transition name (the index's frame morphs into it)
          <Photo key={i} p={p} className={i === 0 ? `${s.ph} vt-photo` : s.ph} sizes={sizes(p)} eager={i === 0} />
        ))}
        {loop && (
          <span className={s.copy} aria-hidden="true">
            {d.hero.desktop.map((p, i) => <Photo key={i} p={{ ...p, alt: '' }} className={s.ph} sizes={sizes(p)} />)}
          </span>
        )}
      </div>
      <div className={s.oneWrap}>
        <div ref={one} className={s.one}>
          <Photo p={d.hero.phone} className="vt-photo" sizes="(min-width: 1024px) 1px, (min-width: 600px) and (min-height: 600px) 1px, 100vw" eager />
        </div>
      </div>
      <div className={s.shade} aria-hidden="true" />
      <div className={s.text}>
        <p className="label">{d.label}</p>
        <h1 id="collection-title" className={`title-page ${s.title}`}>
          {d.title}
          {d.titleNative && (
            <span lang="si" className={s.si}>
              {d.titleNative}
            </span>
          )}
        </h1>
        <p className={`lead ${s.first}`}>{d.first}</p>
        <div className={s.jump}>
          {hasShoot && (
            <a href="#shoot" onClick={jump} className="pressable">
              The shoot · {d.shoot.length}
            </a>
          )}
          <a href="#portfolio" onClick={jump} className="pressable">
            The portfolio · {d.pages.length}
          </a>
        </div>
      </div>
    </section>
  )
}
