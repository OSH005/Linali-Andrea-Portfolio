import type { HomeData } from '../data'
import { mpGroundAt, stepState, type Paint } from '../timeline'
import { LABELS, MP } from '../story'
import { inOut, lerp, seg } from '@/lib/motion/ease'
import { inkFor, rlerp, tearPolygon, windowRects } from '../geometry'
import { Words, showStep } from '../words'
import Photo from '../Photo'
import s from '../HomeStory.module.css'
import m from './ManoPadana.module.css'

/** Ref registry (see Opening.tsx). */
export const dom = {} as { root: HTMLElement | null; ground: HTMLElement; text: HTMLElement; steps: HTMLElement[]; count: HTMLElement; print: HTMLElement; shots: HTMLElement[] }
const grab = (n: HTMLElement | null) => {
  dom.root = n
  if (!n) return
  const q = (c: string) => n.querySelector<HTMLElement>(`.${c}`)!
  Object.assign(dom, { ground: q(m.ground), text: q(s.chap), steps: [...q(s.steps).children], count: q(s.count), print: q(m.print), shots: [...q(m.print).children] })
}

/** Mano Padana: label, title with මනෝ පාදන, four sentences, her four walking photos (the window that opens behind her). */
export default function ManoPadana({ data, stage }: { data: HomeData; stage: boolean }) {
  return (
    <section id="mano-padana" ref={grab} className={`${s.scene} ${m.mp}`} aria-labelledby="home-mp">
      <div className={m.ground} aria-hidden="true" />
      <div className={`wrap ${s.grid}`}>
        <div className={`${s.text} ${s.chap}`}>
          <p className={`label ${s.first}`}>{LABELS.mp}</p>
          <h2 id="home-mp" className={`title-page ${s.chapTitle}`}>
            {data.mp.title} <span lang="si" className={s.sinh}>{data.mp.titleNative}</span>
          </h2>
          <div className={`body ${s.steps}`}>{MP.map((t) => <p key={t}><Words text={t} on={stage} /></p>)}</div>
          <p className={`label ${s.count}`} aria-hidden="true" />
        </div>
        <div className={`${s.photos} ${m.print}`}>
          {data.mp.shots.map((p) => <Photo key={p.src} p={p} sizes="(min-width: 1024px) 25vw, 50vw" />)}
        </div>
      </div>
    </section>
  )
}

let placed = ''
/** Ground floods to her board colours, the window grows A → B → C, each step reveals the next photo; then the page tears away (mockup "OPENING" + "TEAR"). */
export const paint: Paint = (y, r, { phone, W, H }) => {
  const { root, ground, text, steps, count, print, shots } = dom
  const open = seg(y, ...r.at.open), opn = inOut(seg(open, 0, 0.65)), split = inOut(seg(open, 0.65, 1))
  const st = stepState(Math.max(y, r.at.mp[0]), r.steps.mp!), si = st.index, k = y < r.at.mp[0] ? 0 : st.k
  showStep(steps, count, si, k)
  const g = mpGroundAt(y, r)
  ground.style.background = `rgb(${g})`
  text.style.color = inkFor(g)
  text.style.opacity = String(seg(open, 0.8, 1))

  // the window: laid out once at B (layout only on resize), moved and scaled from there
  const { A, B, C } = windowRects(W, H, phone), [x, yy, w, h] = rlerp(rlerp(A, B, opn), C, split)
  if (placed !== B.join() || !print.style.width) {
    Object.assign(print.style, { left: `${B[0]}%`, top: `${B[1]}%`, width: `${B[2]}%`, height: `${B[3]}%` })
    placed = B.join()
  }
  print.style.transform = `translate(${((x - B[0]) * W) / 100}px, ${((yy - B[1]) * H) / 100}px) scale(${w / B[2]}, ${h / B[3]})`
  print.style.opacity = String(seg(open, 0.02, 0.1))
  shots.forEach((im, i) => {
    const kk = i === 0 ? 1 : si > i ? 1 : si === i ? inOut(k) : 0, next = si > i ? 1 : si === i + 1 ? inOut(k) : 0
    // phone: the photo slides up over the last, which shrinks; desktop: clipped up from the bottom with an inner scale
    im.style.clipPath = phone ? '' : `inset(${(1 - kk) * 100}% 0 0 0)`
    im.style.transform = phone ? `translateY(${(1 - kk) * 100}%) scale(${lerp(1.1, 1, kk) * lerp(1, 0.9, next)})` : `scale(${lerp(1.15, 1, kk)})`
  })

  // the tear: clipped along a jagged edge sweeping up while the page lifts away
  const tear = inOut(seg(y, ...r.at.tear))
  root!.style.clipPath = tear > 0 ? tearPolygon(tear) : ''
  root!.style.transform = tear > 0 ? `translateY(${-tear * 8}%) rotate(${-tear * 1.6}deg)` : ''
}
