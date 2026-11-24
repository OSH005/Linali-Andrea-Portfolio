'use client'
import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { clamp01, lerp, out3 } from '@/lib/motion/ease'
import Photo from '@/components/home/Photo'
import type { Row } from './data'
import s from './CollectionIndex.module.css'

const FINE = '(hover: hover) and (pointer: fine)'
const lim = (v: number, m: number) => Math.max(-m, Math.min(m, v))

/**
 * Desktop, fine pointers, motion on: the page takes the hovered collection's tint, and a 17vw photo frame follows the cursor
 * (lerp .12, tilting ≤ 7° and skewing ≤ 5° with speed), cycling three of that collection's photos (clip wipe every 1.15s);
 * moving between rows rolls the frame to the next collection like film. Clicking a row hands the frame to the
 * collection page's hero (cross-document View Transition). Mounted on the first hover, so its photos load only then.
 */
export default function FollowFrame({ rows, list, page }: { rows: Row[]; list: RefObject<HTMLOListElement | null>; page: RefObject<HTMLDivElement | null> }) {
  const [armed, setArmed] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const p = useRef({ mx: 0, my: 0, act: -1, leaving: false })

  useEffect(() => {
    if (!matchMedia(FINE).matches) return
    const ol = list.current!, pg = page.current!, st = p.current
    const tint = () => (pg.style.backgroundColor = st.act >= 0 ? rows[st.act].tint : '')
    const move = (e: PointerEvent) => void ((st.mx = e.clientX), (st.my = e.clientY))
    const over = (e: PointerEvent) => {
      const a = (e.target as Element).closest<HTMLElement>('a[data-i]')
      st.act = a ? +a.dataset.i! : -1
      tint()
      setArmed(true)
    }
    const out = () => void ((st.act = -1), tint())
    const click = (e: MouseEvent) => {
      if (!(e.target as Element).closest('a[data-i]') || !frame.current) return
      st.leaving = true // hold the frame still while the next page loads; it becomes that page's hero
      frame.current.style.viewTransitionName = 'collection-photo'
    }
    const back = () => {
      st.leaving = false
      if (frame.current) frame.current.style.viewTransitionName = ''
    }
    ol.addEventListener('pointermove', move)
    ol.addEventListener('pointerover', over)
    ol.addEventListener('pointerleave', out)
    ol.addEventListener('click', click)
    addEventListener('pageshow', back)
    return () => {
      ol.removeEventListener('pointermove', move)
      ol.removeEventListener('pointerover', over)
      ol.removeEventListener('pointerleave', out)
      ol.removeEventListener('click', click)
      removeEventListener('pageshow', back)
      st.act = -1
      pg.style.backgroundColor = ''
    }
  }, [list, page, rows])

  useEffect(() => {
    if (!armed) return
    const fm = frame.current!, st = p.current
    const sets = [...fm.children] as HTMLElement[], imgs = sets.map((set) => [...set.children] as HTMLElement[])
    const f = { x: st.mx, y: st.my, v: 0, pos: Math.max(0, st.act), cur: Math.max(0, st.act), W: innerWidth, hid: true }
    const resize = () => void (f.W = innerWidth)
    const paint = () => {
      if (st.leaving) return
      const now = gsap.ticker.time, act = st.act
      if (act < 0 && f.v < 0.002) {
        if (!f.hid) fm.style.visibility = 'hidden'
        f.hid = true
        return
      }
      if (f.hid) fm.style.visibility = ''
      f.hid = false
      const fw = f.W * 0.17, fh = fw * 1.25, px = f.x
      f.x = lerp(f.x, st.mx, 0.12)
      f.y = lerp(f.y, st.my, 0.12)
      const vx = f.x - px
      f.v = lerp(f.v, act >= 0 ? 1 : 0, act >= 0 ? 0.12 : 0.18)
      if (act >= 0) f.cur = act
      f.pos = lerp(f.pos, f.cur, 0.11)
      const e = out3(f.v)
      fm.style.transform = `translate(${(f.x + fw * 0.25).toFixed(1)}px, ${(f.y - fh / 2).toFixed(1)}px) rotate(${lim(vx * 0.35, 7).toFixed(2)}deg) skewX(${lim(-vx * 0.18, 5).toFixed(2)}deg) scale(${lerp(0.7, 1, e).toFixed(3)})`
      fm.style.clipPath = `inset(${((1 - e) * 50).toFixed(2)}% round 3px)`
      const c = Math.floor(now / 1.15) % 3, prev = (c + 2) % 3, kk = out3(clamp01((now % 1.15) / 0.6)), par = `translateX(${(-vx * 0.4).toFixed(1)}px) scale(1.12)`
      sets.forEach((set, j) => {
        set.style.transform = `translateY(${((j - f.pos) * 100).toFixed(2)}%)`
        imgs[j].forEach((im, m) => {
          const live = j === f.cur, show = live ? m === c || m === prev : m === 0
          if (im.style.visibility !== (show ? '' : 'hidden')) im.style.visibility = show ? '' : 'hidden'
          im.style.zIndex = live && m === c ? '2' : '1'
          im.style.clipPath = live && m === c ? `inset(0 0 0 ${((1 - kk) * 100).toFixed(1)}%)` : 'none'
          im.style.transform = live && m === c ? `translateX(${(-vx * 0.4).toFixed(1)}px) scale(${lerp(1.2, 1.12, kk).toFixed(3)})` : par
        })
      })
    }
    addEventListener('resize', resize)
    gsap.ticker.add(paint)
    return () => {
      gsap.ticker.remove(paint)
      removeEventListener('resize', resize)
    }
  }, [armed])

  if (!armed) return null
  return (
    <div ref={frame} className={s.frame} aria-hidden="true" style={{ visibility: 'hidden' }}>
      {rows.map((r) => (
        <div key={r.slug} className={s.set}>
          {r.pics.map((pic, m) => (
            <Photo key={m} p={pic} className={s.pic} sizes="17vw" />
          ))}
        </div>
      ))}
    </div>
  )
}
