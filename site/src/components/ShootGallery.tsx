'use client'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import CircularCarousel from './circular-carousel/CircularCarousel'
import './circular-carousel/CircularCarousel.css'
import type { MediaImage } from '@/lib/media'
import { useDialog } from '@/lib/useDialog'
import { useMotion } from '@/lib/motion/useMotion'
import styles from './ShootGallery.module.css'

type Props = {
  images: MediaImage[]
  alt: Record<string, string>
  preset: 'cylinder' | 'orbit'
  autoplay: 'drift' | 'step' | 'off'
  speed?: number
  fadeColor: string
  label: string
  /** 'grid' keeps the still grid after mount (the gallery moment). */
  initialView?: 'ring' | 'grid'
  /** Describe the photo in front of the ring ("03 / 17" and its alt text). */
  caption?: boolean
  /** The section holding the ring is pinned: vertical scroll turns the ring. */
  pinned?: boolean
  /** The section heading, laid out beside the controls. */
  head?: ReactNode
}

const two = (n: number) => String(n).padStart(2, '0')
const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'

export default function ShootGallery({ images, alt, preset, autoplay, speed, fadeColor, label, initialView = 'ring', caption, pinned, head }: Props) {
  const { on } = useMotion()
  // Server HTML (and motion off) shows the grid, so every photo is reachable without JavaScript.
  const [view, setView] = useState<'ring' | 'grid'>('grid')
  const [paused, setPaused] = useState(false)
  const [front, setFront] = useState(0)
  const [index, setIndex] = useState<number | null>(null)
  const dialog = useDialog(index !== null, () => setIndex(null))
  const stage = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLUListElement>(null)
  const full = useRef<HTMLImageElement>(null)
  const from = useRef<DOMRect | null>(null) // where the viewer opens from
  const dir = useRef(0)
  const swipe = useRef<number | null>(null)

  useEffect(() => setView(on && initialView === 'ring' ? 'ring' : 'grid'), [on, initialView])

  // Ring cards are 240px wide (each drawn as several slices), so the 640px file is plenty. Stable, or the ring restarts.
  const items = useMemo(() => images.map((im) => ({ src: im.srcset.webp.split(' ')[0], alt: alt[im.id] ?? '' })), [images, alt])

  // pinned: scroll turns the ring. The vendored carousel turns on horizontal wheel deltas, so scroll is fed to it as one.
  useEffect(() => {
    if (!pinned || view !== 'ring') return
    let last = scrollY
    const turn = () => {
      const dy = scrollY - last, root = stage.current?.firstElementChild, r = stage.current?.getBoundingClientRect()
      last = scrollY
      if (!dy || !root || !r || r.top > innerHeight || r.bottom < 0) return
      root.dispatchEvent(new WheelEvent('wheel', { deltaX: dy * 0.5, cancelable: true }))
    }
    addEventListener('scroll', turn, { passive: true })
    return () => removeEventListener('scroll', turn)
  }, [pinned, view])

  // grid (motion on): each photo is uncovered from the bottom as it comes into view
  useEffect(() => {
    const ul = grid.current
    if (!on || view !== 'grid' || !ul || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.setAttribute('data-in', ''), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' })
    ul.setAttribute('data-reveal', '')
    for (const li of ul.children) io.observe(li)
    return () => {
      io.disconnect()
      ul.removeAttribute('data-reveal')
      for (const li of ul.children) li.removeAttribute('data-in')
    }
  }, [on, view])

  const open = (i: number, el: Element | null | undefined) => {
    from.current = el?.getBoundingClientRect() ?? null
    dir.current = 0
    setIndex(i)
  }
  const move = (d: number) => {
    from.current = null
    dir.current = Math.sign(d)
    setIndex((i) => (i === null ? i : (i + d + images.length) % images.length))
  }

  // the viewer: the photo grows from where it sat (expo-out 0.6s); stepping slides the next one in
  useEffect(() => {
    const img = full.current, f = from.current
    from.current = null
    if (index === null || !img || !on || !img.animate) return
    const t = img.getBoundingClientRect()
    if (f && t.width) {
      const k = `translate(${f.left - t.left}px, ${f.top - t.top}px) scale(${f.width / t.width}, ${f.height / t.height})`
      img.animate([{ transform: k }, { transform: 'none' }], { duration: 600, easing: EXPO })
    } else if (dir.current) img.animate([{ transform: `translateX(${dir.current * 6}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: EXPO })
  }, [index, on])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') move(1)
    else if (e.key === 'ArrowLeft') move(-1)
    else if (e.key === 'Escape') {
      e.preventDefault()
      setIndex(null)
    }
  }

  const current = index === null ? null : images[index]
  // Never let the vendored carousel fall back to its demo photos.
  if (!images.length) return null

  return (
    <div className={styles.gallery} aria-label={label} role="group" data-view={view}>
      {head && <div className={styles.head}>{head}</div>}
      <div className={styles.tools}>
        <div className={styles.seg} role="group" aria-label="View">
          {(['ring', 'grid'] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {v === 'ring' ? 'Ring' : 'Grid'}
            </button>
          ))}
        </div>
        {view === 'ring' && on && autoplay !== 'off' && (
          <button type="button" className={`pressable ${styles.btn}`} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
      </div>

      {view === 'ring' && (
        <>
          <div ref={stage} className={styles.stage}>
            <CircularCarousel
              items={items}
              preset={preset}
              autoplay={paused || !on ? 'off' : autoplay}
              speed={speed}
              aspectRatio={2 / 3}
              cardWidth={240}
              fadeColor={fadeColor}
              captions={false}
              onChange={setFront}
              onItemClick={(_: unknown, i: number) => open(i, stage.current?.querySelector(`[data-cc-index="${i}"]`))}
            />
          </div>
          {caption && (
            <p className={styles.cap}>
              <span className="label">
                {two(front + 1)} / {two(images.length)}
              </span>{' '}
              {alt[images[front].id] ?? ''}
            </p>
          )}
        </>
      )}

      <ul ref={grid} className={styles.grid} hidden={view !== 'grid'}>
        {images.map((im, i) => (
          <li key={im.id}>
            <button type="button" className={styles.tile} onClick={(e) => open(i, e.currentTarget)} aria-label={`Open photo ${i + 1}: ${alt[im.id] ?? ''}`}>
              <picture>
                <source type="image/avif" srcSet={im.srcset.avif} sizes="(min-width: 1024px) 30vw, (min-width: 600px) 31vw, 47vw" />
                <img src={im.src} srcSet={im.srcset.webp} sizes="(min-width: 1024px) 30vw, (min-width: 600px) 31vw, 47vw" alt={alt[im.id] ?? ''} loading="lazy" width={im.width} height={im.height} />
              </picture>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        tabIndex={-1}
        className={styles.viewer}
        onKeyDown={onKey}
        onCancel={(e) => (e.preventDefault(), setIndex(null))}
        onPointerDown={(e) => (swipe.current = e.clientX)}
        onPointerUp={(e) => {
          const x0 = swipe.current
          swipe.current = null
          if (x0 !== null && Math.abs(e.clientX - x0) > 50) move(e.clientX < x0 ? 1 : -1)
        }}
        aria-label={`${label}, photo viewer`}
      >
        {current && (
          <>
            <div className={styles.vtop}>
              <span className="label">
                {two(index! + 1)} / {two(images.length)}
              </span>
              <button type="button" className={`pressable ${styles.round}`} aria-label="Close" onClick={() => setIndex(null)}>
                ✕
              </button>
            </div>
            <div className={styles.frame}>
              <img ref={full} src={current.zoom} alt={alt[current.id] ?? ''} width={current.width} height={current.height} className={styles.full} draggable={false} />
            </div>
            <button type="button" className={`pressable ${styles.round} ${styles.prev}`} aria-label="Previous photo" onClick={() => move(-1)}>
              ←
            </button>
            <button type="button" className={`pressable ${styles.round} ${styles.next}`} aria-label="Next photo" onClick={() => move(1)}>
              →
            </button>
            <p className={styles.vcap}>{alt[current.id] ?? ''}</p>
            <div className={styles.thumbs}>
              {images.map((im, i) => (
                <button key={im.id} type="button" aria-label={`Photo ${i + 1}`} aria-current={i === index || undefined} onClick={() => move(i - index!)}>
                  <img src={im.srcset.webp.split(' ')[0]} alt="" loading="lazy" width={im.width} height={im.height} />
                </button>
              ))}
            </div>
          </>
        )}
      </dialog>
    </div>
  )
}
