'use client'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useMotion } from '@/lib/motion/useMotion'
import { Words } from '@/components/home/words'
import { useHeader } from '@/components/header/HeaderContext'
import type { IndexData } from './data'
import FocusRail from './FocusRail'
import FollowFrame from './FollowFrame'
import Seasons from './Seasons'
import s from './CollectionIndex.module.css'

const CHAPTERS = ['Collections', 'Seasons', '— Get in touch']
/** The desktop list (and follow frame) needs a mouse; touch screens of any width get the rail (the CSS uses the same query). */
const DESK = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
const onDesk = (f: () => void) => {
  const m = matchMedia(DESK)
  m.addEventListener('change', f)
  return () => m.removeEventListener('change', f)
}
const useDesk = () => useSyncExternalStore(onDesk, () => matchMedia(DESK).matches, () => true)

/**
 * /collections. Server HTML and motion off: the list (a 12-column grid on desktop, open rows on phones and tablets) and the seasons, laid flat.
 * Motion on: the rows rise in; desktop rows get the follow frame (fine pointers); below 1024 or on touch screens the list becomes the focus rail; the seasons thread sews.
 */
export default function CollectionIndex({ data }: { data: IndexData }) {
  const { on } = useMotion()
  const desk = useDesk()
  const { set } = useHeader()
  const page = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const entered = useRef(false)

  useEffect(() => {
    set({ chapters: CHAPTERS, chapter: 0, dock: 1, dark: false, x0: null })
    const marks = [...page.current!.querySelectorAll<HTMLElement>(':scope > section'), document.getElementById('contact')]
    const chapter = () => set({ chapter: Math.max(0, marks.filter((m) => m && m.getBoundingClientRect().top < innerHeight / 2).length - 1) })
    chapter()
    addEventListener('scroll', chapter, { passive: true })
    return () => {
      removeEventListener('scroll', chapter)
      set({ chapters: [''], chapter: 0 })
    }
  }, [set])

  // the entrance plays once, the first time motion is on
  useEffect(() => {
    if (!on || entered.current) return
    entered.current = true
    page.current!.setAttribute('data-enter', '')
  }, [on])

  const head = (
    <header className={s.head}>
      <p className="label">{data.label}</p>
      <h1 id="collections-title" className={s.h1}>
        <Words text={data.heading} on={on} />
      </h1>
    </header>
  )
  return (
    <div ref={page} className={s.index}>
      <FocusRail rows={data.rows} head={head} list={list} live={on && !desk} />
      {on && desk && <FollowFrame rows={data.rows} list={list} page={page} />}
      <Seasons data={data} />
    </div>
  )
}
