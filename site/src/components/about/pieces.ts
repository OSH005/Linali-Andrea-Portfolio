import type { CSSProperties } from 'react'

export type PieceName = 'bodice' | 'skirt' | 'sleeve' | 'pocket'

/**
 * Her skills' pattern pieces (mockup `PIECES`), in a 0–100 viewBox. `cap`: caption [left, top] %; `box`: the content's
 * left/right insets in % (the bodice's centre line sits left: fold left, armhole right); `cutAt`: where the cut marking
 * sits vertically (centred in `box` like everything else; raised from the mockup's so it sits inside the seam allowance, not on
 * it); `height` in px.
 */
export const PIECES: Record<PieceName, { d: string; fold?: string; cap: [number, number]; box: [number, number]; cutAt: CSSProperties; height: number }> = {
  bodice: { d: 'M3 17 Q15 19 21 3 L58 9 Q60 30 79 35 L86 98 L3 98 Z', fold: 'M6 22 L6 95', cap: [12, 26], box: [6, 26], cutAt: { bottom: '10%' }, height: 290 },
  skirt: { d: 'M27 2 Q50 7 73 2 L98 95 Q50 100 2 95 Z', cap: [28, 13], box: [20, 20], cutAt: { bottom: '12%' }, height: 300 },
  sleeve: { d: 'M2 45 Q18 41 28 19 Q50 1 72 19 Q82 41 98 45 L86 98 L14 98 Z', cap: [30, 24], box: [16, 16], cutAt: { bottom: '9%' }, height: 270 },
  pocket: { d: 'M4 4 L96 4 L96 72 Q96 96 72 96 L28 96 Q4 96 4 72 Z', fold: 'M4 20 L96 20', cap: [10, 24], box: [10, 10], cutAt: { top: '11%' }, height: 230 },
}

/** Laid by hand: tilt (deg) and drop below the row (px) per piece, desktop values. */
export const TILT = [-2.2, 1.6, -1.2, 2]
export const OFFSET = [0, 22, 8, 30]
