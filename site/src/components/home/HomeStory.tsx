'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotion } from '@/lib/motion/useMotion'
import { useLenis } from '@/lib/motion/lenisContext'
import { useHeader } from '@/components/header/HeaderContext'
import type { HomeData } from './data'
import { HOME_CHAPTERS, homeHeader, remap, sceneRanges, type Paint, type Ranges } from './timeline'
import Opening, * as op from './scenes/Opening'
import ManoPadana, * as mp from './scenes/ManoPadana'
import Revive, * as rv from './scenes/Revive'
import Lunelle, * as ln from './scenes/Lunelle'
import Drift, * as dr from './scenes/Drift'
import s from './HomeStory.module.css'

gsap.registerPlugin(ScrollTrigger)
/** Each scene paints only while the timeline is inside its range; outside it, its layer is hidden (visibility: nothing off screen can take focus). */
const SCENES: { paint: Paint; dom: { root: HTMLElement | null }; live: (r: Ranges) => [number, number] }[] = [
  { ...op, live: (r) => [0, r.at.open[1]] },
  { ...mp, live: (r) => [0, r.at.tear[1]] },
  { ...rv, live: (r) => [r.at.tear[0], r.at.rise[1]] },
  { ...ln, live: (r) => [r.at.rise[0], r.at.foam[1]] },
  { ...dr, live: (r) => [r.at.foam[0], Infinity] },
]

/**
 * The home story. Server HTML and motion off: the scenes as stacked sections (the readable page).
 * Motion on: `data-stage` on the root, pinned for the whole timeline by ScrollTrigger; one gsap.ticker callback paints the scenes
 * every frame (time-based motion runs while the visitor is still).
 */
export default function HomeStory({ data }: { data: HomeData }) {
  const root = useRef<HTMLDivElement>(null)
  const { on } = useMotion()
  const { set } = useHeader()
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => void (lenisRef.current = lenis), [lenis])
  const frameRef = useRef<(() => void) | null>(null)

  // added after SmoothScroll's Lenis tick (it re-runs once Lenis exists), so each frame paints the scroll Lenis just set
  useEffect(() => {
    if (!on) return
    const f = () => frameRef.current?.()
    gsap.ticker.add(f)
    return () => gsap.ticker.remove(f)
  }, [on, lenis])

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
    // inline styles React set before the first paint: motion off restores these and drops everything paint wrote
    const own = new Map([...el.querySelectorAll('[style]')].map((n) => [n, n.getAttribute('style')!]))
    let r = sceneRanges(innerHeight), from = r, y0 = 0, W = 0, H = 0
    const t0 = gsap.ticker.time, shown: boolean[] = []
    let last = 0
    const desk = matchMedia('(min-width: 1024px)')
    const measure = () => void ((W = el.clientWidth || innerWidth), (H = el.clientHeight || innerHeight))
    const frame = () => {
      const y = scrollY - st.start, now = gsap.ticker.time - t0, phone = !desk.matches
      const ctx = { phone, W, H, dt: Math.min(0.05, now - last), now }
      last = now
      SCENES.forEach(({ paint, dom, live }, i) => {
        const [a, b] = live(r), on = y >= a && y <= b
        if (on) paint(y, r, ctx)
        if (on !== shown[i] && dom.root) {
          shown[i] = on
          dom.root.style.visibility = on ? '' : 'hidden'
        }
      })
      const h = homeHeader(y, r)
      el.dataset.chapter = String(Math.min(4, h.chapter))
      set({ ...h, x0: phone ? 8 : W * 0.045 - 8 })
    }
    const st = ScrollTrigger.create({
      trigger: el,
      pin: true,
      start: 'top top',
      end: () => `+=${r.total}`,
    })
    measure()
    // resize/rotate: ScrollTrigger refreshes; new scene lengths, then back to the same fraction of the same scene
    const init = () => void ((y0 = st.scroll() - st.start), (from = r), (r = sceneRanges(innerHeight)))
    const done = () => {
      measure()
      shown.length = 0
      if (r.total === from.total) return
      const top = st.start + remap(y0, from, r)
      if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true, force: true })
      else window.scrollTo({ top, behavior: 'instant' })
    }
    ScrollTrigger.addEventListener('refreshInit', init)
    ScrollTrigger.addEventListener('refresh', done)
    frameRef.current = frame
    frame()

    return () => {
      // motion off mid-visit (or leaving): unpin, back to the stacked page at the section being watched
      const i = homeHeader(st.scroll() - st.start, r).chapter
      ScrollTrigger.removeEventListener('refreshInit', init)
      ScrollTrigger.removeEventListener('refresh', done)
      frameRef.current = null
      st.kill()
      el.removeAttribute('data-stage')
      // the stacked page carries none of the stage's inline styles
      el.querySelectorAll('[style]').forEach((n) => (own.has(n) ? n.setAttribute('style', own.get(n)!) : n.removeAttribute('style')))
      delete el.dataset.chapter
      if (el.isConnected) window.scrollTo({ top: i === 0 ? 0 : (marks[i]?.getBoundingClientRect().top ?? 0) + scrollY, behavior: 'instant' })
    }
  }, [on, set])

  return (
    <div ref={root} className={s.story}>
      <Opening data={data} stage={on} />
      <ManoPadana data={data} stage={on} />
      <Revive data={data} stage={on} />
      <Lunelle data={data} stage={on} />
      <Drift data={data} />
    </div>
  )
}
