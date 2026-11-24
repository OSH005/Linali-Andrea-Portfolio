import { Fragment } from 'react'
import { clamp01, out4 } from '@/lib/motion/ease'
import s from './HomeStory.module.css'

/** A sentence as word masks on the stage (client only); the plain sentence otherwise, as the server sends it. */
export function Words({ text, on }: { text: string; on: boolean }) {
  if (!on) return text
  return text.split(' ').map((t, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className={s.w}><span>{t}</span></span>
    </Fragment>
  ))
}

const cache = new WeakMap<Element, HTMLElement[]>()
/** Rises the words of `el` through their masks, k 0 → 1 with a stagger of `st` per word (mockup `rise`). */
export function rise(el: Element, k: number, st = 0.03) {
  let ws = cache.get(el)
  if (!ws?.[0]?.isConnected) cache.set(el, (ws = [...el.querySelectorAll<HTMLElement>(`.${s.w} > span`)]))
  ws.forEach((w, j) => void (w.style.transform = `translateY(${(1 - out4(clamp01(k * (1 + ws.length * st) - j * st))) * 110}%)`))
}

const pad2 = (n: number) => String(n).padStart(2, '0')
/** Sentence steps: only the current sentence shows (the others stay in the accessibility tree), rising for `k`; counter `NN / NN`. */
export function showStep(ps: HTMLElement[], count: HTMLElement, i: number, k: number) {
  ps.forEach((p, j) => void (p.style.opacity = j === i ? '' : '0'))
  rise(ps[i], k, 0.018)
  const t = `${pad2(i + 1)} / ${pad2(ps.length)}`
  if (count.textContent !== t) count.textContent = t
}
