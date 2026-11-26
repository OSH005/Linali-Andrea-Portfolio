'use client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { fallAngle } from '@/components/tumble-deck/TumbleDeck'
import { useNarrow } from '@/components/home/useNarrow'
import type { MediaImage } from '@/lib/media'
import { useDialog } from '@/lib/useDialog'
import { useMotion } from '@/lib/motion/useMotion'
import { clamp01, inOut, seg } from '@/lib/motion/ease'
import { loupeStyle, readerPages } from './reader'
import ZoomView from './ZoomView'
import s from './PageReader.module.css'

type Props = {
  title: string
  pages: MediaImage[]
  pageText: Record<string, string>
  /** Below 1024 wide (spreads split into pages). Defaults to the screen. */
  narrow?: boolean
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const noop = () => () => {}
const TURN = 750 // ms
const stack = (d: number) => `translateY(${-d * 3.2}%) scale(${1 - d * 0.035})`
const largest = (im: MediaImage) => im.srcset.webp.split(', ').pop()!.split(' ')[0]
type Turn = { from: number; to: number; dir: number }

/**
 * The portfolio (spec 7.2 item 4): pages stand in a stack (each behind at −3.2% and 0.965), Next tips the front one
 * forward about its bottom edge until it lands flat (the Tumble Deck's fall, to −88°, 0.75s), Previous stands it back up.
 * Without JavaScript it is a plain list of every page.
 */
export default function PageReader({ title, pages: images, pageText, narrow: forced }: Props) {
  const auto = useNarrow()
  const narrow = forced ?? auto
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const { on } = useMotion()
  const pages = useMemo(() => readerPages(images, narrow), [images, narrow])
  const n = pages.length
  const [pi, setPi] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [reading, setReading] = useState(false)
  const drawer = useDialog(reading, () => setReading(false))
  const list = useRef<HTMLOListElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const loupe = useRef<HTMLDivElement>(null)
  const turn = useRef<Turn | null>(null)
  const turning = useRef(false)
  const swipe = useRef<number | null>(null)
  const swiped = useRef(false)
  const shown = useRef(pages)

  const unit = images.length && images.every((im) => im.width / im.height > 2) ? 'spread' : 'page'
  const word = unit === 'spread' && n === images.length ? 'Spread' : 'Page'
  const heading = `${images.length} ${unit}${images.length === 1 ? '' : 's'}${n !== images.length ? ` · ${n} pages` : ''}`
  const name = (i: number) => `${word.toLowerCase()} ${i + 1} of ${n}`
  const page = pages[Math.min(pi, n - 1)]
  const text = page && pageText[page.image.id]
  const hasText = images.some((im) => pageText[im.id])

  // spreads split or joined (a tablet turned): stay on the same sheet
  useEffect(() => {
    const old = shown.current[pi]
    shown.current = pages
    turn.current = null
    if (old) setPi(Math.max(0, pages.findIndex((p) => p.image === old.image)))
  }, [pages])

  const go = (to: number) => {
    to = Math.max(0, Math.min(n - 1, to))
    if (to === pi) return
    turn.current = { from: pi, to, dir: Math.sign(to - pi) }
    setPi(to)
  }

  // paint the stack; a turn runs frame by frame (motion off: it simply changes)
  useLayoutEffect(() => {
    const ol = list.current
    if (!ol || !mounted) return
    const lis = [...ol.children] as HTMLElement[]
    const tr = on ? turn.current : null
    turn.current = null
    const paint = (tk: number) => {
      const t = tk < 1 ? tr : null
      turning.current = !!t
      if (t && loupe.current) loupe.current.style.display = 'none'
      const e = inOut(tk), a = (k: number) => (fallAngle(k) * 88) / 90
      lis.forEach((li, i) => {
        const d = i - pi
        let tf = '', o = 1, z = 100 - Math.abs(d), show = d >= 0 && d <= 2
        if (d >= 0) (tf = stack(d)), (o = d === 0 ? 1 : 0.85 - d * 0.2)
        if (t && t.dir > 0) {
          if (i === t.from) (show = true), (z = 200), (tf = `translateY(${e * 12}%) rotateX(${a(tk)}deg)`), (o = 1 - seg(tk, 0.55, 1))
          if (d >= 0 && d <= 2) tf = stack(d + 1 - e)
        } else if (t) {
          if (i === t.to) (z = 200), (tf = `translateY(${(1 - e) * 12}%) rotateX(${a(1 - tk)}deg)`), (o = seg(tk, 0, 0.45))
          if (d > 0 && d <= 3) (show = true), (tf = stack(d - 1 + e)), (o = d === 3 ? 0.45 * (1 - e) : 0.85 - (d - 1 + e) * 0.2)
        }
        li.classList.toggle('turning', !!t && i === (t.dir > 0 ? t.from : t.to))
        li.style.display = show ? '' : 'none'
        li.style.transform = tf
        li.style.opacity = String(o)
        li.style.zIndex = String(z)
      })
    }
    if (!tr) return paint(1)
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const tk = clamp01((now - t0) / TURN)
      paint(tk)
      if (tk < 1) raf = requestAnimationFrame(step)
    }
    paint(0)
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [pi, pages, mounted, on])

  // the rail keeps the current page in the middle
  useEffect(() => {
    const r = rail.current, b = r?.children[pi] as HTMLElement | undefined
    if (r && b) r.scrollTo?.({ left: b.offsetLeft - r.clientWidth / 2 + b.offsetWidth / 2, behavior: on ? 'smooth' : 'instant' })
  }, [pi, on, mounted])

  // zoom closed after turning inside it: the page that opened it is no longer in front, so focus the one that is
  const zoomed = useRef(false)
  useEffect(() => {
    if (zoom) return void (zoomed.current = true)
    if (!zoomed.current) return
    zoomed.current = false
    const a = document.activeElement as HTMLElement | null
    if (!a || a === document.body || a.closest('[inert]')) list.current?.children[pi]?.querySelector('button')?.focus()
  }, [zoom])

  // the drawer opens at the top of the text (the browser focuses Close, at the bottom)
  useEffect(() => {
    const d = drawer.current
    if (reading && d) (d.focus({ preventScroll: true }), (d.scrollTop = 0))
  }, [reading, drawer])

  // the loupe (fine pointers): the small writing, magnified 3× under the cursor
  const moveLoupe = (e: React.PointerEvent<HTMLDivElement>) => {
    const lp = loupe.current, li = list.current?.children[pi] as HTMLElement | undefined
    if (!lp || !li || e.pointerType !== 'mouse') return
    const b = li.getBoundingClientRect(), st = e.currentTarget.getBoundingClientRect()
    const rx = (e.clientX - b.left) / b.width, ry = (e.clientY - b.top) / b.height
    const inside = !turning.current && !zoom && rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1 && matchMedia('(hover: hover) and (pointer: fine)').matches
    lp.style.display = inside ? 'block' : 'none'
    if (!inside) return
    const half = page.half, w = half >= 0 ? b.width * 2 : b.width
    Object.assign(lp.style, {
      left: `${e.clientX - st.left}px`,
      top: `${e.clientY - st.top}px`,
      backgroundImage: `url(${largest(page.image)})`,
      ...loupeStyle(half >= 0 ? (half + rx) / 2 : rx, ry, w, b.height),
    })
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    go(pi + (e.key === 'ArrowRight' ? 1 : -1))
  }

  const counter = (
    <span className="label" data-counter>
      {word} {pad2(pi + 1)} / {pad2(n)}
    </span>
  )

  if (!n) return null
  return (
    <div className={s.reader}>
      <div className={s.head}>
        <div>
          <p className="label">The portfolio</p>
          <h2 id="portfolio-title" className={`title-section ${s.h2}`}>
            {heading}
          </h2>
          {mounted && (
            <p className={s.hint}>
              <span className={s.fine}>Hover to magnify. Click to zoom.</span>
              <span className={s.coarse}>Tap a page to zoom. Swipe to turn.</span>
              {!narrow && counter}
            </p>
          )}
        </div>
        {mounted && (
          <div className={s.tools}>
            <button type="button" className={`pressable ${s.btn}`} onClick={() => setZoom({ x: 0.5, y: 0.5 })}>
              Zoom
            </button>
            {hasText && (
              <button type="button" className={`pressable ${s.btn}`} disabled={!text} onClick={() => setReading(true)}>
                Read the text
              </button>
            )}
          </div>
        )}
      </div>

      <div className={s.body} onKeyDown={onKey}>
        <div className={s.stage} onPointerMove={moveLoupe} onPointerLeave={() => loupe.current && (loupe.current.style.display = 'none')}>
          <ol
            ref={list}
            className={s.read}
            data-stack={mounted || undefined}
            onPointerDown={(e) => {
              swiped.current = false
              swipe.current = e.pointerType === 'mouse' ? null : e.clientX
            }}
            onPointerUp={(e) => {
              const x0 = swipe.current
              swipe.current = null
              if (x0 === null || Math.abs(e.clientX - x0) <= 40) return
              swiped.current = true
              go(pi + (e.clientX < x0 ? 1 : -1))
            }}
            onPointerCancel={() => (swipe.current = null)}
          >
            {pages.map((p, i) => (
              <li key={`${p.image.id}-${p.half}`} data-page style={{ '--ar': p.ar } as React.CSSProperties} inert={mounted && i !== pi}>
                <button
                  type="button"
                  className={s.pg}
                  data-half={p.half >= 0 ? p.half : undefined}
                  aria-label={`Zoom into ${name(i)}`}
                  onClick={(e) => {
                    if (swiped.current) return void (swiped.current = false)
                    const r = e.currentTarget.getBoundingClientRect()
                    setZoom(e.detail && r.width ? { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } : { x: 0.5, y: 0.5 })
                  }}
                >
                  <picture>
                    <source type="image/avif" srcSet={p.image.srcset.avif} sizes={p.half >= 0 ? '200vw' : '(min-width: 1024px) 70vw, 100vw'} />
                    <img
                      src={p.image.src}
                      srcSet={p.image.srcset.webp}
                      sizes={p.half >= 0 ? '200vw' : '(min-width: 1024px) 70vw, 100vw'}
                      alt={`${title} portfolio, ${name(i)}`}
                      loading={i === 0 ? undefined : 'lazy'}
                      width={p.image.width}
                      height={p.image.height}
                      draggable={false}
                    />
                  </picture>
                </button>
              </li>
            ))}
          </ol>
          {mounted && <div ref={loupe} className={s.loupe} aria-hidden="true" />}
          {mounted && (
            <div className={s.ctl}>
              <button type="button" className={`pressable ${s.btn} ${s.arrow}`} aria-label="Previous page" disabled={pi === 0} onClick={() => go(pi - 1)}>
                {narrow ? '← Previous' : '←'}
              </button>
              {narrow && counter}
              <button type="button" className={`pressable ${s.btn} ${s.arrow}`} aria-label="Next page" disabled={pi === n - 1} onClick={() => go(pi + 1)}>
                {narrow ? 'Next →' : '→'}
              </button>
            </div>
          )}
        </div>

        {mounted && (
          <div ref={rail} className={s.rail} data-lenis-prevent>
            {pages.map((p, i) => (
              <button key={`${p.image.id}-${p.half}`} type="button" aria-label={`Go to ${name(i)}`} aria-current={i === pi || undefined} onClick={() => go(i)}>
                <img
                  src={p.image.srcset.webp.split(' ')[0]}
                  alt=""
                  loading="lazy"
                  style={{ aspectRatio: p.ar, objectPosition: p.half === 1 ? 'right' : 'left' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {mounted && (
        <ZoomView open={!!zoom} page={page} at={zoom ?? CENTRE} label={`${title} portfolio, ${name(pi)}`} onClose={() => setZoom(null)} onTurn={(d) => go(pi + d)} />
      )}

      <dialog ref={drawer} tabIndex={-1} className={s.drawer} aria-label="The text on this page" data-still={!on || undefined} onCancel={(e) => (e.preventDefault(), setReading(false))} data-lenis-prevent>
        {reading && text && (
          <>
            <p className="label">The text on this page</p>
            {text.split('\n\n').map((t, i) => (
              <p key={i} className="body">
                {t}
              </p>
            ))}
            <button type="button" className={`pressable ${s.btn}`} onClick={() => setReading(false)}>
              Close
            </button>
          </>
        )}
      </dialog>
    </div>
  )
}

const CENTRE = { x: 0.5, y: 0.5 }
