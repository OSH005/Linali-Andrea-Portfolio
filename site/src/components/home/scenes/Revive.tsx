import type { HomeData } from '../data'
import { stepState, type Paint } from '../timeline'
import { LABELS, RV } from '../story'
import { clamp01, inOut, lerp, out3, seg } from '@/lib/motion/ease'
import { jagSplit } from '../geometry'
import { Words, showStep } from '../words'
import Photo from '../Photo'
import s from '../HomeStory.module.css'
import m from './Revive.module.css'

const JAG = jagSplit()

/** Ref registry (see Opening.tsx). */
export const dom = {} as { root: HTMLElement | null; shadow: HTMLElement; night: HTMLElement; steps: HTMLElement[]; count: HTMLElement; board: HTMLElement; halves: HTMLElement[]; stitches: SVGElement[]; pile: HTMLElement }
const grab = (n: HTMLElement | null) => {
  dom.root = n
  if (!n) return
  const q = (c: string) => n.querySelector<HTMLElement>(`.${c}`)!
  Object.assign(dom, {
    shadow: q(m.shadow), night: q(m.night), steps: [...q(s.steps).children], count: q(s.count), board: q(m.board), pile: q(m.pile),
    halves: [...n.querySelectorAll(`.${m.half}`)], stitches: [...q(m.seam).children],
  })
}

/** Revive: logo, label, three sentences, her torn board (stitched shut on the stage) and the pile under it. */
export default function Revive({ data, stage }: { data: HomeData; stage: boolean }) {
  const half = { ...data.rv.board, alt: '' }
  return (
    <section id="revive" ref={grab} className={`${s.scene} ${m.rv}`} aria-labelledby="home-rv">
      <div className={m.shadow} aria-hidden="true" />
      <div className={`wrap ${s.grid}`}>
        <div className={`${s.text} ${s.chap} ${m.text}`}>
          <h2 id="home-rv" className={`${s.logoTitle} ${m.logo}`}>
            <Photo p={data.rv.logo} sizes="(min-width: 1024px) 22vw, 220px" />
          </h2>
          <p className="label">{LABELS.rv}</p>
          <div className={`body ${s.steps}`}>{RV.map((t) => <p key={t}><Words text={t} on={stage} /></p>)}</div>
          <p className={`label ${s.count}`} aria-hidden="true" />
        </div>
        <div className={s.boards}>
          <div className={m.board}>
            <Photo p={data.rv.board} sizes="(min-width: 1024px) 55vw, 130vh" />
            <Photo p={half} sizes="(min-width: 1024px) 55vw, 130vh" className={m.half} />
            <Photo p={half} sizes="(min-width: 1024px) 55vw, 130vh" className={m.half} />
            <svg className={m.seam} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {JAG.stitches.map(([x, y]) => (
                <path key={y} d={`M${x - 2.4} ${y - 1.6} L${x + 2.4} ${y + 1.6} M${x + 2.4} ${y - 1.6} L${x - 2.4} ${y + 1.6}`} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
          <Photo p={data.rv.pile} sizes="(min-width: 1024px) 40vw, 80vw" className={`${s.pile} ${m.pile}`} />
        </div>
      </div>
      <div className={m.night} aria-hidden="true" />
    </section>
  )
}

/** Revive settles in under the tear (1.08 → 1); the two halves of her board drift together as cross-stitches close the seam (mockup "TEAR"); then night falls and it recedes as the moon rises (mockup "MOONRISE"). */
export const paint: Paint = (y, r, { phone, W, H }) => {
  const { root, shadow, night, steps, count, board, halves, stitches, pile } = dom
  const u = r.unit, rv = r.steps.rv!, tear = inOut(seg(y, ...r.at.tear)), sc = lerp(1.08, 1, out3(tear))
  const rise = seg(y, ...r.at.rise)
  root!.style.transform = rise > 0 ? `scale(${lerp(1, 0.9, inOut(rise))}) translateY(${-rise * 4}%)` : `scale(${sc})`
  night.style.opacity = String(inOut(seg(rise, 0, 0.45)))
  // the tear's shadow sits just under the torn edge (screen %), drawn inside this layer, which is scaled about its centre
  const edge = lerp(103, -12, tear) - 2 - tear * 8
  shadow.style.opacity = tear > 0 && tear < 1 ? '' : '0'
  shadow.style.transform = `translateY(${((50 + (edge - 50) / sc) * H) / 100}px)`

  const st = stepState(y, rv)
  showStep(steps, count, st.index, st.k)
  const join = inOut(seg(y, rv[0][0], rv[2][0] + (rv[2][1] - rv[2][0]) * 0.5)), j = 1 - join
  halves[0].style.clipPath = JAG.left
  halves[1].style.clipPath = JAG.right
  halves[0].style.transform = `translate(${-j * 7}%, ${j * 3}%) rotate(${-j * 4}deg)`
  halves[1].style.transform = `translate(${j * 7}%, ${-j * 2}%) rotate(${j * 3}deg)`
  const sewn = seg(y, rv[0][0] + 250 * u, r.at.rv[1] - 150 * u) * stitches.length
  stitches.forEach((p, i) => void (p.style.opacity = String(clamp01(sewn - i))))
  pile.style.transform = phone
    ? `translate(${j * 10 - join * 6}%, ${j * 40}%) rotate(${-4 + join * 1.5}deg)`
    : `translate(${j * 4}%, ${j * 10}%) rotate(${3 - join * 1.5}deg)`
  // phone: the board is 42.7% of the screen tall (less on short screens, as in the CSS) and wider than it, so it pans across
  const bw = Math.max(120, Math.min(H * 0.427, H - 460)) * 2.83, pan = inOut(seg(y, r.at.tear[0] + 150 * u, r.at.rv[1]))
  board.style.transform = phone ? `translateX(${lerp(24, W - bw - 24, pan)}px)` : ''
}
