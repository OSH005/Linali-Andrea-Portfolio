'use client'
import { useEffect, useState } from 'react'
import { useJump } from '@/lib/motion/useJump'
import s from './SectionSwitch.module.css'

/**
 * The floating Shoot | Portfolio switch (spec 7.2 item 6): bottom centre, from the shoot to the next-collection section;
 * a brown indicator slides under the section you're in. A JS-only aid, so it is not in the server HTML.
 */
export default function SectionSwitch() {
  const jump = useJump()
  const [ready, setReady] = useState(false)
  const [vis, setVis] = useState(false)
  const [cur, setCur] = useState<'shoot' | 'portfolio'>('shoot')

  useEffect(() => {
    setReady(true)
    const [shoot, port, next, contact] = ['shoot', 'portfolio', 'next', 'contact'].map((id) => document.getElementById(id))
    if (!shoot || !port || !next) return
    const update = () => {
      const H = innerHeight
      // never over the contact card (on short pages the next section and the card arrive together)
      setVis(shoot.getBoundingClientRect().top < H * 0.4 && next.getBoundingClientRect().top > H * 0.4 && (contact?.getBoundingClientRect().top ?? H) >= H * 0.9)
      setCur(port.getBoundingClientRect().top <= H * 0.5 ? 'portfolio' : 'shoot')
    }
    update()
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    return () => {
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
    }
  }, [])

  if (!ready) return null
  return (
    <nav className={s.fl} aria-label="Shoot or portfolio" data-on={vis || undefined} data-cur={cur} inert={!vis}>
      {(['shoot', 'portfolio'] as const).map((id) => (
        <a key={id} href={`#${id}`} onClick={jump} aria-current={cur === id ? 'location' : undefined}>
          {id === 'shoot' ? 'The shoot' : 'The portfolio'}
        </a>
      ))}
    </nav>
  )
}
