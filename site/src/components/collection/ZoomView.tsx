'use client'
import { useEffect, useRef, useState } from 'react'
import { useDialog } from '@/lib/useDialog'
import { useMotion } from '@/lib/motion/useMotion'
import { zoomOffset, type ReaderPage } from './reader'
import s from './ZoomView.module.css'

type Props = {
  open: boolean
  page: ReaderPage
  /** The point opened on, as a fraction of the page (0…1). */
  at: { x: number; y: number }
  label: string
  onClose: () => void
  onTurn: (d: number) => void
}

const clampZ = (z: number) => Math.min(5, Math.max(1, z))

/**
 * Full-screen zoom for the small writing (spec 7.2 item 4): opens at 2.5× on the point clicked;
 * a mouse pans by moving, a finger by dragging; wheel or + − for 1–5×; ← → turn the pages; Esc closes.
 * The 4800px file loads only while it is open.
 */
export default function ZoomView({ open, page, at, label, onClose, onTurn }: Props) {
  const ref = useDialog(open, onClose)
  const { on } = useMotion()
  const [z, setZ] = useState(2.5)
  const [m, setM] = useState(at)
  const [vp, setVp] = useState({ W: 0, H: 0 })
  const [fine, setFine] = useState(false)
  const drag = useRef<{ x: number; y: number; mx: number; my: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!open) return
    setZ(2.5)
    setM(at)
    setFine(matchMedia('(hover: hover) and (pointer: fine)').matches)
    const size = () => setVp({ W: innerWidth, H: innerHeight })
    size()
    addEventListener('resize', size)
    return () => removeEventListener('resize', size)
  }, [open, at])

  // the page fitted to 92% × 80% of the screen, then scaled
  const { W, H } = vp
  let fw = W * 0.92, fh = fw / page.ar
  if (fh > H * 0.8) (fh = H * 0.8), (fw = fh * page.ar)
  const { x, y } = zoomOffset({ W, H, w: fw * z, h: fh * z, mx: m.x, my: m.y })

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') onTurn(e.key === 'ArrowRight' ? 1 : -1)
    else if (e.key === '+' || e.key === '=') setZ((v) => clampZ(v * 1.4))
    else if (e.key === '-') setZ((v) => clampZ(v / 1.4))
    else if (e.key === 'Escape') onClose()
    else return
    e.preventDefault()
  }
  const end = () => ((drag.current = null), setDragging(false))
  const half = page.half >= 0 ? page.half : undefined

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className={s.zoom}
      aria-label={`${label}, zoom`}
      data-still={!on || undefined}
      onKeyDown={onKey}
      onCancel={(e) => (e.preventDefault(), onClose())}
      onWheel={(e) => setZ((v) => clampZ(v * (e.deltaY < 0 ? 1.12 : 1 / 1.12)))}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' || (e.target as Element).closest('button')) return
        drag.current = { x: e.clientX, y: e.clientY, mx: m.x, my: m.y }
        setDragging(true)
        e.currentTarget.setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (e.pointerType === 'mouse') setM({ x: e.clientX / W, y: e.clientY / H })
        else if (d) setM({ x: Math.min(1, Math.max(0, d.mx - ((e.clientX - d.x) / W) * 1.2)), y: Math.min(1, Math.max(0, d.my - ((e.clientY - d.y) / H) * 1.2)) })
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {open && W > 0 && (
        <>
          <p className={`label ${s.hint}`}>{fine ? 'Move to explore · scroll or + − to zoom · Esc to close' : 'Drag to explore · + and − to zoom'}</p>
          <div
            className={s.page}
            data-half={half}
            data-drag={dragging || undefined}
            style={{
              width: fw,
              height: fh,
              transform: `translate(${x}px, ${y}px) scale(${z})`,
              backgroundImage: `url(${page.image.src})`, // the reader's file shows at once; the big one draws over it
              backgroundSize: half === undefined ? '100% 100%' : '200% 100%',
              backgroundPosition: half === 1 ? 'right' : 'left',
            }}
          >
            <img key={page.image.zoom} src={page.image.zoom} alt={label} draggable={false} />
          </div>
          <div className={s.bar}>
            <button type="button" aria-label="Zoom out" onClick={() => setZ((v) => clampZ(v / 1.4))}>−</button>
            <span className={s.v} aria-live="polite">{Math.round(z * 100)}%</span>
            <button type="button" aria-label="Zoom in" onClick={() => setZ((v) => clampZ(v * 1.4))}>+</button>
            <button type="button" aria-label="Previous page" onClick={() => onTurn(-1)}>←</button>
            <button type="button" aria-label="Next page" onClick={() => onTurn(1)}>→</button>
            <button type="button" className={s.k} onClick={onClose}>Close</button>
          </div>
        </>
      )}
    </dialog>
  )
}
