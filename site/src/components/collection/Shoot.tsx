'use client'
import { useEffect, useRef, useState } from 'react'
import ShootGallery from '@/components/ShootGallery'
import { useMotion } from '@/lib/motion/useMotion'
import type { CollectionData } from './data'
import s from './Shoot.module.css'

/**
 * The shoot (spec 7.2 item 3): every photograph, as the ring (default with motion) or the grid.
 * Motion on and the ring fits the screen: the section pins for 1.1 screens while scroll turns the ring.
 * Motion off: no pin and the grid (the ring is a button away, standing still).
 */
export default function Shoot({ d }: { d: CollectionData }) {
  const { on } = useMotion()
  const pin = useRef<HTMLDivElement>(null)
  const [fits, setFits] = useState(false)

  useEffect(() => {
    if (!on) return
    const el = pin.current!
    const check = () => setFits(el.offsetHeight <= innerHeight)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(check)
    ro?.observe(el)
    addEventListener('resize', check)
    check()
    return () => {
      ro?.disconnect()
      removeEventListener('resize', check)
    }
  }, [on])

  const pinned = on && fits
  return (
    <section id="shoot" className={s.shoot} aria-labelledby="shoot-title" data-pin={pinned || undefined}>
      <div ref={pin} className={s.pin}>
        <ShootGallery
          images={d.shoot}
          alt={d.alt}
          preset="cylinder"
          autoplay="drift"
          speed={7}
          fadeColor="#FBF8F3"
          label={`${d.title} photographs`}
          caption
          pinned={pinned}
          head={
            <>
              <p className="label">The shoot</p>
              <h2 id="shoot-title" className={`title-section ${s.h2}`}>
                {d.shoot.length} photographs
              </h2>
            </>
          }
        />
      </div>
      <div className={s.spacer} />
    </section>
  )
}
