// The home timeline: one table of scenes in scroll units (1 unit ≈ 1px of wheel on a 900px-tall screen, spec 6).
import { clamp01, inOut, lerp, seg } from '@/lib/motion/ease'

export type SceneName = 'op' | 'manif' | 'open' | 'mp' | 'tear' | 'rv' | 'rise' | 'ln' | 'foam' | 'dIn' | 'strip' | 'foot'
type Seg = [number, number]

/** [scene, units, sentence steps]. The approved pacing (~13 500 units); not derived from word counts. */
export const HOME_SCENES: readonly (readonly [name: SceneName, units: number, steps?: number])[] = [
  ['op', 300], ['manif', 500], ['open', 700], ['mp', 1380, 4], ['tear', 420], ['rv', 1020, 3],
  ['rise', 600], ['ln', 1680, 5], ['foam', 420], ['dIn', 480], ['strip', 5400], ['foot', 600],
]

/** Header chapter roll labels; the index is `homeHeader().chapter`. */
export const HOME_CHAPTERS = ['00 Linali Andrea', '01 Mano Padana', '02 Revive', '03 Lunelle', '04 Drift', '— Get in touch']
const CHAPTER: Record<SceneName, number> = { op: 0, manif: 0, open: 0, mp: 1, tear: 2, rv: 2, rise: 3, ln: 3, foam: 4, dIn: 4, strip: 4, foot: 5 }

export type Ranges = ReturnType<typeof sceneRanges>

/** Scene ranges in px of scroll for a viewport `viewportH` tall; `unit` is px per scroll unit. */
export function sceneRanges(viewportH: number) {
  const unit = viewportH / 900
  const at = {} as Record<SceneName, Seg>, steps: Partial<Record<SceneName, Seg[]>> = {}
  let y = 0
  for (const [name, units, n] of HOME_SCENES) {
    const len = units * unit
    at[name] = [y, y + len]
    if (n) steps[name] = Array.from({ length: n }, (_, i): Seg => [y + (i * len) / n, y + ((i + 1) * len) / n])
    y += len
  }
  return { total: y, at, steps, unit }
}

/** Current sentence step: `k` is how far it has risen (first 30% of its step); after the last step, the last index. */
export function stepState(y: number, segs: Seg[]) {
  let index = segs.findIndex(([, b]) => y < b)
  if (index < 0) index = segs.length - 1
  const [a, b] = segs[index]
  return { index, k: clamp01((y - a) / ((b - a) * 0.3)), within: (y - a) / (b - a) }
}

/** The scene containing `y` (before the stage: the first; after it: the last). */
export function sceneAt(y: number, r: Ranges): SceneName {
  return HOME_SCENES.find(([n]) => y < r.at[n][1])?.[0] ?? 'foot'
}

/** Maps a position to the same fraction of the same scene in other ranges (resize, rotation). Past the stage, the same distance past it. */
export function remap(y: number, from: Ranges, to: Ranges): number {
  if (y >= from.total) return to.total + (y - from.total)
  const n = sceneAt(y, from), [a, b] = from.at[n], [c, d] = to.at[n]
  return c + ((y - a) / (b - a)) * (d - c)
}

const MPG: [number, number, number][] = [[31, 30, 28], [94, 89, 83], [242, 232, 218], [59, 36, 24]]
const CREAM: [number, number, number] = [242, 232, 218]
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(lerp(v, b[i], t)))
/** WCAG relative luminance of an [r, g, b] colour. */
export const lum = (rgb: number[]) => {
  const [r, g, b] = rgb.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** Mano Padana's ground per step, after her colour board: charcoal → grey → cream → brown (step `k` blends from the previous). */
export const mpGround = (step: number, k: number) => (step === 0 ? MPG[0] : mix(MPG[step - 1], MPG[step], inOut(k)))

/** Header state on the home timeline: chapter, dock (bare on the landing → pill), night over dark grounds (spec 5.3). */
export function homeHeader(y: number, r: Ranges) {
  const { at, unit: s } = r
  const dock = inOut(seg(y, at.open[0] - 100 * s, at.open[0] + 300 * s))
  let dark: boolean
  if (y < at.tear[0]) {
    const st = stepState(Math.max(y, at.mp[0]), r.steps.mp!), k = y < at.mp[0] ? 0 : st.k
    const ground = mix(CREAM, mpGround(st.index, k), inOut(seg(y, at.open[0] + 70 * s, at.open[0] + 420 * s)))
    dark = lum(ground) < 0.3
  } else dark = (y > at.rise[0] + 250 * s && y < at.foam[1]) || y > at.foot[0] + 360 * s
  return { chapter: CHAPTER[sceneAt(y, r)], dock, dark }
}

/** What every scene's `paint` gets besides the position: screen, frame time step and clock (s). */
export interface PaintCtx { phone: boolean; W: number; H: number; dt: number; now: number }
/** A scene's per-frame painter: `y` is px into the stage. Scenes keep their own DOM refs (see scenes/*.tsx). */
export type Paint = (y: number, r: Ranges, ctx: PaintCtx) => void
