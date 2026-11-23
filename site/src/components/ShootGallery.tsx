'use client'
import { useEffect, useState } from 'react'
import CircularCarousel from './circular-carousel/CircularCarousel'
import './circular-carousel/CircularCarousel.css'
import type { MediaImage } from '@/lib/media'
import { useDialog } from '@/lib/useDialog'
import styles from './ShootGallery.module.css'

type Props = {
  images: MediaImage[]
  alt: Record<string, string>
  preset: 'cylinder' | 'orbit'
  autoplay: 'drift' | 'step' | 'off'
  speed?: number
  fadeColor: string
  label: string
}

const two = (n: number) => String(n).padStart(2, '0')

export default function ShootGallery({ images, alt, preset, autoplay, speed, fadeColor, label }: Props) {
  // Server HTML shows the grid, so every photo is reachable without JavaScript.
  const [view, setView] = useState<'ring' | 'grid'>('grid')
  const [paused, setPaused] = useState(false)
  const [index, setIndex] = useState<number | null>(null)
  const dialog = useDialog(index !== null)

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setView('ring')
  }, [])

  const items = images.map((im) => ({ src: im.src, alt: alt[im.id] ?? '' }))
  const move = (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length))

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') move(1)
    else if (e.key === 'ArrowLeft') move(-1)
    else if (e.key === 'Escape') {
      e.preventDefault()
      setIndex(null)
    }
  }

  const current = index === null ? null : images[index]

  return (
    <div className={styles.gallery} aria-label={label} role="group">
      <div className={styles.controls}>
        <div className={styles.toggle}>
          {(['ring', 'grid'] as const).map((v) => (
            <button key={v} type="button" className={`label pressable ${styles.chip}`} aria-pressed={view === v} onClick={() => setView(v)}>
              {v === 'ring' ? 'Ring' : 'Grid'}
            </button>
          ))}
        </div>
        {view === 'ring' && autoplay !== 'off' && (
          <button type="button" className={`label pressable ${styles.chip}`} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
      </div>

      {view === 'ring' && (
        <div className={styles.stage}>
          <CircularCarousel
            items={items}
            preset={preset}
            autoplay={paused ? 'off' : autoplay}
            speed={speed}
            aspectRatio={2 / 3}
            cardWidth={240}
            fadeColor={fadeColor}
            captions={false}
            onItemClick={(_: unknown, i: number) => setIndex(i)}
          />
        </div>
      )}

      <ul className={styles.grid} hidden={view !== 'grid'}>
        {images.map((im, i) => (
          <li key={im.id}>
            <button type="button" className={styles.tile} onClick={() => setIndex(i)} aria-label={`Open photo ${i + 1}: ${alt[im.id] ?? ''}`}>
              <picture>
                <source type="image/avif" srcSet={im.srcset.avif} sizes="(min-width: 1024px) 25vw, 50vw" />
                <img src={im.src} srcSet={im.srcset.webp} sizes="(min-width: 1024px) 25vw, 50vw" alt="" loading="lazy" width={im.width} height={im.height} />
              </picture>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} tabIndex={-1} className={styles.viewer} onKeyDown={onKey} onCancel={(e) => (e.preventDefault(), setIndex(null))} aria-label={`${label}, photo viewer`}>
        {current && (
          <>
            <img src={current.zoom} alt={alt[current.id] ?? ''} className={styles.full} />
            <div className={styles.bar}>
              <button type="button" className="label pressable" onClick={() => move(-1)}>Previous</button>
              <span className="label">{two(index! + 1)} / {two(images.length)}</span>
              <button type="button" className="label pressable" onClick={() => move(1)}>Next</button>
              <button type="button" className="label pressable" onClick={() => setIndex(null)}>Close</button>
            </div>
          </>
        )}
      </dialog>
    </div>
  )
}
