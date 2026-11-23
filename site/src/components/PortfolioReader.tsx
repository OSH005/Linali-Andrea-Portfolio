'use client'
import { useEffect, useState } from 'react'
import TumbleDeck from './tumble-deck/TumbleDeck'
import type { MediaImage } from '@/lib/media'
import { useDialog } from '@/lib/useDialog'
import styles from './PortfolioReader.module.css'

type Props = {
  title: string
  pages: MediaImage[]
  pageText: Record<string, string>
  background: string
  defaultOpen?: boolean
}

const two = (n: number) => String(n).padStart(2, '0')
export const counterLabel = (index: number, count: number) => `${two(index + 1)} / ${two(count)}`

export default function PortfolioReader({ title, pages, pageText, background, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [panel, setPanel] = useState<'zoom' | 'text' | null>(null)
  const dialog = useDialog(open)

  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])

  // Warm the next three pages so they never land blank.
  useEffect(() => {
    if (!open) return
    for (let k = 1; k <= 3; k++) new Image().src = pages[(index + k) % pages.length].src
  }, [open, index, pages])

  if (!pages.length) return null
  const page = pages[index]
  const text = pageText[page.id]
  const label = `${title} portfolio, spread ${index + 1} of ${pages.length}`
  const aspect = pages[0].width / pages[0].height

  const close = () => {
    setPanel(null)
    setOpen(false)
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return
    e.preventDefault()
    if (panel) setPanel(null)
    else close()
  }

  return (
    <div className={styles.reader}>
      <button type="button" className={`pressable ${styles.stack}`} onClick={() => setOpen(true)} aria-label={`Open the ${title} portfolio, ${pages.length} spreads`}>
        <span className={styles.sheets} aria-hidden="true">
          {pages.slice(0, 3).reverse().map((p, i) => (
            <img key={p.id} src={p.srcset.webp.split(' ')[0]} alt="" loading="lazy" style={{ aspectRatio: aspect, '--i': 2 - i } as React.CSSProperties} />
          ))}
        </span>
        <span className="label">Open the portfolio</span>
      </button>

      <dialog ref={dialog} tabIndex={-1} className={styles.dialog} onKeyDown={onKey} onCancel={(e) => (e.preventDefault(), close())} aria-label={`${title} portfolio`} style={{ background }}>
        {open && (
          <>
            <TumbleDeck
              cards={pages.map((p, i) => ({ src: p.src, alt: `${title} portfolio, spread ${i + 1} of ${pages.length}` }))}
              aspect={aspect}
              depth={4}
              height="100svh"
              background={background}
              ariaLabel={`${title} portfolio`}
              onIndexChange={(i) => {
                setIndex(i)
                setPanel(null)
              }}
            />
            <div className={styles.bar}>
              <span className="label">{counterLabel(index, pages.length)}</span>
              <button type="button" className="label pressable" onClick={() => setPanel('zoom')}>Zoom</button>
              {text && (
                <button type="button" className="label pressable" onClick={() => setPanel('text')}>Read the text</button>
              )}
              <button type="button" className="label pressable" onClick={close}>Close</button>
            </div>
            {panel === 'zoom' && (
              <div className={styles.zoom} onClick={() => setPanel(null)}>
                <img src={page.zoom} alt={label} />
              </div>
            )}
            {panel === 'text' && text && (
              <div className={styles.text} role="document">
                <button type="button" className="label pressable" onClick={() => setPanel(null)}>Back to the pages</button>
                {text.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
            )}
          </>
        )}
      </dialog>
    </div>
  )
}
