'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotion } from '@/lib/motion/useMotion'
import { useLenis } from '@/lib/motion/lenisContext'
import { useHeader } from '@/components/header/HeaderContext'
import type { HomeData } from './data'
import { HOME_CHAPTERS, homeHeader, remap, sceneRanges, type Paint } from './timeline'
import Opening, { paint as pOpening } from './scenes/Opening'
import ManoPadana, { paint as pMano } from './scenes/ManoPadana'
import Revive, { paint as pRevive } from './scenes/Revive'
import Lunelle, { paint as pLunelle } from './scenes/Lunelle'
import Drift, { paint as pDrift } from './scenes/Drift'
import s from './HomeStory.module.css'

gsap.registerPlugin(ScrollTrigger)
const PAINTS: Paint[] = [pOpening, pMano, pRevive, pLunelle, pDrift]

/**
 * The home story. Server HTML and motion off: the scenes as stacked sections (the readable page).
 * Motion on: `data-stage` on the root, pinned for the whole timeline; one ScrollTrigger update paints every scene.
 */
export default function HomeStory({ data }: { data: HomeData }) {
  const root = useRef<HTMLDivElement>(null)
  const { on } = useMotion()
  const { set } = useHeader()
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => void (lenisRef.current = lenis), [lenis])

  useEffect(() => {
    set({ chapters: HOME_CHAPTERS })
    return () => set({ chapters: [''], chapter: 0, dock: 1, dark: false, x0: null })
  }, [set])

  useEffect(() => {
    const el = root.current!
    const marks = [...el.querySelectorAll<HTMLElement>(':scope > section'), document.getElementById('contact')]

    if (!on) {
      // stacked page: the chapter roll follows the section at mid-screen
      set({ dock: 1, dark: false, x0: null })
      const chapter = () => set({ chapter: Math.max(0, marks.filter((m) => m && m.getBoundingClientRect().top < innerHeight / 2).length - 1) })
      chapter()
      addEventListener('scroll', chapter, { passive: true })
      return () => removeEventListener('scroll', chapter)
    }

    el.setAttribute('data-stage', '')
    let r = sceneRanges(innerHeight), from = r, y0 = 0, last = gsap.ticker.time
    const desk = matchMedia('(min-width: 1024px)')
    const frame = (y: number) => {
      const now = gsap.ticker.time, phone = !desk.matches, W = innerWidth
      const ctx = { phone, W, H: innerHeight, dt: now - last, now }
      last = now
      for (const p of PAINTS) p(y, r, ctx)
      const h = homeHeader(y, r)
      el.dataset.chapter = String(Math.min(4, h.chapter))
      set({ ...h, x0: phone ? 8 : W * 0.045 - 8 })
    }
    const st = ScrollTrigger.create({
      trigger: el,
      pin: true,
      start: 'top top',
      end: () => `+=${r.total}`,
      onUpdate: (self) => frame(self.scroll() - self.start),
    })
    // resize/rotate: ScrollTrigger refreshes; new scene lengths, then back to the same fraction of the same scene
    const init = () => void ((y0 = st.scroll() - st.start), (from = r), (r = sceneRanges(innerHeight)))
    const done = () => {
      if (r.total === from.total) return
      const top = st.start + remap(y0, from, r)
      if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true, force: true })
      else window.scrollTo({ top, behavior: 'instant' })
    }
    ScrollTrigger.addEventListener('refreshInit', init)
    ScrollTrigger.addEventListener('refresh', done)
    frame(st.scroll() - st.start)

    return () => {
      // motion off mid-visit (or leaving): unpin, back to the stacked page at the section being watched
      const i = homeHeader(st.scroll() - st.start, r).chapter
      ScrollTrigger.removeEventListener('refreshInit', init)
      ScrollTrigger.removeEventListener('refresh', done)
      st.kill()
      el.removeAttribute('data-stage')
      delete el.dataset.chapter
      if (el.isConnected) window.scrollTo({ top: i === 0 ? 0 : (marks[i]?.getBoundingClientRect().top ?? 0) + scrollY, behavior: 'instant' })
    }
  }, [on, set])

  return (
    <div ref={root} className={s.story}>
      <Opening data={data} />
      <ManoPadana data={data} />
      <Revive data={data} />
      <Lunelle data={data} />
      <Drift data={data} />
    </div>
  )
}
