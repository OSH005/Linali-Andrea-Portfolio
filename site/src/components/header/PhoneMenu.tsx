'use client'
import { useState } from 'react'
import { useDialog } from '@/lib/useDialog'
import type { Active } from './HeaderContext'
import styles from './SiteHeader.module.css'

export const LINKS = [
  ['Collections', '/collections/'],
  ['About', '/about/'],
  ['Contact', '#contact'],
] as const

/** Below 1024px: "Menu" opens a paper sheet with the links, Motion on/off and LinkedIn. */
export default function PhoneMenu({ linkedin, active, on, setOn }: { linkedin: string; active?: Active; on: boolean; setOn: (v: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const ref = useDialog(open, close)
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return
    e.preventDefault()
    close()
  }

  return (
    <>
      <button type="button" className={styles.menu} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Menu
      </button>
      <dialog ref={ref} tabIndex={-1} className={`${styles.sheet} ${on ? styles.slide : ''}`} aria-label="Menu" onKeyDown={onKey}>
        <button type="button" className={`label ${styles.close}`} onClick={close}>
          Close
        </button>
        <ul>
          {LINKS.map(([label, href]) => (
            <li key={label}>
              <a href={href} className="title-section" aria-current={label === active ? 'page' : undefined} onClick={close}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.sheetFoot}>
          <button type="button" className="label" aria-label="Motion" aria-pressed={on} onClick={() => setOn(!on)}>
            Motion {on ? 'on' : 'off'}
          </button>
          <a href={linkedin} className="label" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </dialog>
    </>
  )
}
