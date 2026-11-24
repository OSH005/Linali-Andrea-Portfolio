import { clamp01, inOut } from '@/lib/motion/ease'

/** Phone focus rail: scroll before the rail moves, and per step between rows (mockup `colPaint`). */
export const RAIL_LEAD = 120
export const RAIL_STEP = 470

/** Rows stacked from `top`; the row at `u` is open (`f` 1), its neighbours fold back. The rail rises one compact row per step. */
export function railLayout(u: number, n: number, compact: number, expanded: number, top: number) {
  let acc = top - compact * u
  return Array.from({ length: n }, (_, i) => {
    const f = inOut(clamp01(1 - Math.abs(u - i))), height = compact + (expanded - compact) * f
    const row = { top: acc, height, f }
    acc += height
    return row
  })
}

/** Damped swing of a tag on the seasons thread, in degrees, t seconds after the needle passes. */
export const swing = (t: number) => (t < 0 ? 0 : 16 * Math.exp(-2.6 * t) * Math.cos(7 * t))

/** A w×h thumbnail of an iw×ih photo box using only transforms: scale by k from the top left, clip x/y (unscaled px) off each side. */
export function morph(w: number, h: number, iw: number, ih: number) {
  const k = Math.max(w / iw, h / ih)
  return { k, x: (iw - w / k) / 2, y: (ih - h / k) / 2 }
}

/** Scroll into the rail section that puts row `i` (of n) in focus: inverse of u = (n − 1)·inOut((y − lead) / ((n − 1)·step)). */
export function railScroll(i: number, n: number) {
  if (n < 2) return RAIL_LEAD
  const v = clamp01(i / (n - 1)), p = v < 0.5 ? Math.cbrt(v / 4) : 1 - Math.cbrt(2 * (1 - v)) / 2
  return RAIL_LEAD + p * (n - 1) * RAIL_STEP
}
