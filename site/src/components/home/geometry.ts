// Home stage geometry, ported from the approved mockup (spec 6.1–6.3). Rects are percent of the stage: [x, y, w, h].
import { inOut, lerp, out3, seg } from '@/lib/motion/ease'
import { lum } from './timeline'

export type Rect = [x: number, y: number, w: number, h: number]

/** Mano Padana's window: A (small print beside her), B (centred), C (right of the text). Width keeps the photo's 2:3 on any aspect. */
export function windowRects(W: number, H: number, phone: boolean): { A: Rect; B: Rect; C: Rect } {
  // phone: 69.3% tall (390×844), less on short screens so the text column (≈255px) fits under it
  if (phone) {
    const h = Math.min(69.3, 100 - 25500 / H)
    return { A: [60, 62, 20, (13.9 * h) / 69.3], B: [0, 0, 100, h], C: [0, 0, 100, h] }
  }
  const w = ((86 * H) / W) * 0.667, a = ((30 * H) / W) * 0.667
  return { A: [66, 40, a, 30], B: [50 - w / 2, 7, w, 86], C: [Math.min(58, 96 - w), 7, w, 86] }
}

export const rlerp = (a: Rect, b: Rect, t: number) => a.map((v, i) => lerp(v, b[i], t)) as Rect

const r2 = (v: number) => Math.round(v * 100) / 100
/** The torn paper edge (mockup `tearEdge`): x every 2.5%, a jagged offset in % of the height. */
const TEAR_EDGE = Array.from({ length: 41 }, (_, i) => [i * 2.5, (i % 2 ? -1.6 : 1.2) + Math.sin(i * 1.9) * 1.4 + Math.sin(i * 0.37) * 1.2])

/** Clip for the Mano Padana layer: everything above a torn edge at y = lerp(103, −12, progress) %. */
export function tearPolygon(progress: number) {
  const ey = lerp(103, -12, progress)
  return `polygon(0 0, 100% 0, ${TEAR_EDGE.toReversed().map(([x, d]) => `${x}% ${r2(ey + d)}%`).join(', ')})`
}

/** Revive's torn board: a vertical jagged seam (mockup `jag`), the two halves either side, and a cross-stitch at each inner point. */
export function jagSplit() {
  const jag: [number, number][] = []
  for (let y = 0; y <= 100; y += 5) jag.push([r2(50 + Math.sin(y * 1.7) * 1.6 + Math.sin(y * 0.53) * 1.1), y])
  const seam = jag.map(([x, y]) => `${x}% ${y}%`).join(', ')
  return { left: `polygon(0 0, ${seam}, 0 100%)`, right: `polygon(100% 0, ${seam}, 100% 100%)`, stitches: jag.slice(1, -1) }
}

/** Text ink over a ground: brown on light (luminance > .3), cream on dark. */
export const inkFor = (rgb: number[]): '#3B2418' | '#F2E8DA' => (lum(rgb) > 0.3 ? '#3B2418' : '#F2E8DA')

/** The lit part of a moon of radius 9 in a 20-unit box at phase 0…1 (mockup `litPath`): the outer arc, then the terminator back. */
export const litPath = (phase: number) =>
  `M10 1 A9 9 0 0 1 10 19 A${Math.abs(9 * (1 - 2 * phase)).toFixed(2)} 9 0 0 ${phase < 0.5 ? 0 : 1} 10 1`

/** Lunelle's main photo. Desktop: on the right edge, as tall as the screen, keeping 2:3. Phone: full width on top, 64% tall (less on short screens, so 300px stay for the text and the contact sheet). */
export function lunelleMain(W: number, H: number, phone: boolean): Rect {
  if (phone) return [0, 0, 100, Math.min(64, 100 - 30000 / H)]
  const w = ((100 * H) / W) * 0.667
  return [100 - w, 0, w, 100]
}

/** The moon over the rise (0…1): its centre `y` (% of the photo frame) climbs 150 → 50, then its radius `r` (%) grows 17 → 120 to fill the frame. */
export const moonRise = (p: number) => ({ y: lerp(150, 50, out3(seg(p, 0.1, 0.65))), r: lerp(17, 120, inOut(seg(p, 0.6, 1))) })
