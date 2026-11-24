'use client'
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'
import gsap from 'gsap'
import { clamp01, inOut, lerp, out3, seg } from '@/lib/motion/ease'
import { useLenis } from '@/lib/motion/lenisContext'
import Photo from '@/components/home/Photo'
import type { Row } from './data'
import { morph, RAIL_LEAD, RAIL_STEP, railLayout, railScroll } from './rail'
import s from './CollectionIndex.module.css'

const CH = 92 // a compact row: 56×68 thumbnail, number · season · theme, name

/**
 * The collection list. On its own: real links in a 12-column grid (desktop) or open rows (below 1024).
 * `live` (motion on, below 1024): the section pins while the row in focus grows its thumbnail into the photo
 * (the same element, scaled and clipped) with its line, count and "Open →"; the others fold back (mockup `colPaint`, phone).
 */
export default function FocusRail({ rows, head, list, live }: { rows: Row[]; head: ReactNode; list: RefObject<HTMLOListElement | null>; live: boolean }) {
  const sec = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => void (lenisRef.current = lenis), [lenis])

  useEffect(() => {
    if (!live) return
    const el = sec.current!, hd = el.querySelector('header')!, ol = list.current!, n = rows.length
    const q = (li: Element, k: string) => li.querySelector<HTMLElement>(`[data-k="${k}"]`)!
    const items = [...ol.children].map((li) => {
      const pics = q(li, 'pics')
      return { li: li as HTMLElement, a: li.firstElementChild as HTMLElement, pics, imgs: [...pics.children] as HTMLElement[], meta: q(li, 'meta'), t: q(li, 't'), txt: ['line', 'cnt', 'open'].map((k) => q(li, k)) }
    })
    // motion off restores exactly what React rendered
    const own = new Map([el, hd, ...items.flatMap((it) => [it.li, it.pics, ...it.imgs, it.meta, it.t, ...it.txt])].map((x) => [x, x.getAttribute('style')]))
    el.setAttribute('data-live', '')
    const g = { top0: 0, hb: 0, iw: 0, ih: 0, ex: 0, tx: 0, by: 0, side: false }

    const measure = () => {
      const W = document.documentElement.clientWidth, H = innerHeight, side = W >= 600 && H >= 600
      g.hb = hd.offsetTop + hd.offsetHeight
      const railTop = g.hb + 22 - RAIL_LEAD * 1.05, below = side ? 40 : 166
      // a short screen (a phone turned sideways): the open row still fits under the header
      let iw = side ? Math.round((W - 48) * 0.46) : W - 48
      const ih = Math.max(80, Math.round(Math.min(side ? iw * 1.3 : iw * 1.12, H * (side ? 0.56 : 0.52), H - railTop - below - 14)))
      if (!side) iw = Math.min(iw, Math.round(ih * 1.25))
      Object.assign(g, { iw, ih, side, ex: ih + below, tx: side ? iw + 28 : 0, by: side ? ih - 210 : ih })
      const vars = { len: RAIL_LEAD + (n - 1) * RAIL_STEP, iw, ih, ex: g.ex, tx: g.tx, lt: side ? ih - 110 : ih + 96, ct: side ? ih - 30 : ih + 146, ot: side ? ih - 30 : ih + 58 }
      for (const [k, v] of Object.entries(vars)) el.style.setProperty(`--${k}`, `${v}px`)
      g.top0 = el.getBoundingClientRect().top + scrollY
    }

    const paint = () => {
      const now = gsap.ticker.time, y = scrollY - g.top0, yc = Math.min(RAIL_LEAD, Math.max(0, y))
      hd.style.transform = `translateY(${(-yc * 1.1).toFixed(1)}px)`
      hd.style.opacity = (1 - seg(y, 40, 140)).toFixed(3)
      const u = (n - 1) * inOut(clamp01((y - RAIL_LEAD) / ((n - 1) * RAIL_STEP)))
      const L = railLayout(u, n, CH, g.ex, g.hb + 22 - yc * 1.05)
      const c = Math.floor(now / 1.6) % 3, prev = (c + 2) % 3, kk = out3(clamp01((now % 1.6) / 0.7))
      items.forEach((it, i) => {
        const { top, f } = L[i], { k, x, y: cy } = morph(lerp(56, g.iw, f), lerp(68, g.ih, f), g.iw, g.ih)
        it.li.style.transform = `translateY(${top.toFixed(1)}px)`
        it.pics.style.transform = `translate(${(-x * k).toFixed(1)}px, ${(-cy * k).toFixed(1)}px) scale(${k.toFixed(4)})`
        it.pics.style.clipPath = `inset(${cy.toFixed(1)}px ${x.toFixed(1)}px round ${(2 / k).toFixed(1)}px)`
        const dx = lerp(0, g.tx - 72, f).toFixed(1)
        it.meta.style.transform = `translate(${dx}px, ${lerp(0, g.by + 6, f).toFixed(1)}px)`
        it.t.style.transform = `translate(${dx}px, ${lerp(0, g.by + 10, f).toFixed(1)}px) scale(${lerp(1, g.side ? 1.6 : 1.27, f).toFixed(3)})`
        it.txt.forEach((t) => {
          t.style.opacity = seg(f, 0.75, 1).toFixed(3)
          t.style.transform = `translateY(${((1 - seg(f, 0.6, 1)) * 14).toFixed(1)}px)`
        })
        // the open row's photo changes every 1.6s (a wipe from below); a folded row shows its first
        const open = f >= 0.5
        it.imgs.forEach((im, m) => {
          const show = open ? m === c || m === prev : m === 0
          if (im.style.visibility !== (show ? '' : 'hidden')) im.style.visibility = show ? '' : 'hidden'
          im.style.zIndex = open && m === c ? '2' : '1'
          im.style.clipPath = open && m === c ? `inset(${((1 - kk) * 100).toFixed(1)}% 0 0 0)` : 'none'
          im.style.transform = open ? `translateY(${((u - i) * -6).toFixed(2)}%) scale(${m === c ? lerp(1.18, 1.1, kk).toFixed(3) : 1.1})` : 'scale(1.06)'
        })
      })
    }

    // keyboard: the focused row comes into focus on the rail
    const focus = (e: FocusEvent) => {
      const i = items.findIndex((it) => it.a === e.target)
      if (i < 0 || !(e.target as HTMLElement).matches(':focus-visible')) return
      const top = g.top0 + railScroll(i, n)
      if (lenisRef.current) lenisRef.current.scrollTo(top)
      else window.scrollTo({ top, behavior: 'instant' })
    }
    // the open photo carries over to the collection page (cross-document View Transition; ignored where unsupported)
    const click = (e: MouseEvent) => {
      const it = items.find((x) => x.a.contains(e.target as Node))
      if (it) it.pics.style.viewTransitionName = 'collection-photo'
    }
    const back = () => items.forEach((it) => (it.pics.style.viewTransitionName = ''))

    measure()
    paint()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    ro?.observe(document.body)
    addEventListener('resize', measure)
    addEventListener('pageshow', back)
    document.fonts?.ready.then(() => el.isConnected && measure())
    ol.addEventListener('focusin', focus)
    ol.addEventListener('click', click)
    gsap.ticker.add(paint)
    return () => {
      gsap.ticker.remove(paint)
      ro?.disconnect()
      removeEventListener('resize', measure)
      removeEventListener('pageshow', back)
      ol.removeEventListener('focusin', focus)
      ol.removeEventListener('click', click)
      el.removeAttribute('data-live')
      own.forEach((v, x) => (v == null ? x.removeAttribute('style') : x.setAttribute('style', v)))
    }
  }, [live, rows.length, list])

  return (
    <section ref={sec} className={s.top} aria-labelledby="collections-title">
      <div className={s.pin}>
        {head}
        <ol ref={list} className={s.list} aria-label="Collections">
          {rows.map((r, i) => (
            <li key={r.slug} className={s.row} style={{ '--i': i } as CSSProperties}>
              <a className={s.link} href={`/collections/${r.slug}/`} data-i={i}>
                <span className={s.pics} data-k="pics" aria-hidden="true">
                  {r.pics.map((p, m) => (
                    <Photo key={m} p={p} className={s.pic} sizes="(min-width: 600px) 46vw, 92vw" />
                  ))}
                </span>
                <span className={s.n} aria-hidden="true">{r.n}</span>
                <div className={s.tw}>
                  <h2 className={s.t} data-k="t">{r.title}</h2>
                  <p className={`label ${s.meta}`} data-k="meta">
                    <span className={s.pn}>{r.n} · </span>
                    {r.meta}
                    {r.titleNative && (
                      <>
                        {' · '}
                        <span lang="si" className={s.si}>{r.titleNative}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className={s.lw}>
                  <p className={s.line} data-k="line">{r.line}</p>
                  <p className={`label ${s.cnt}`} data-k="cnt">{r.count}</p>
                </div>
                <span className={s.go} aria-hidden="true">→</span>
                <span className={s.open} data-k="open" aria-hidden="true">Open →</span>
                <span className={s.sew} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
