import { Fragment } from 'react'
import type { HomeData } from '../data'
import { stepState, type Paint } from '../timeline'
import { LABELS, LN } from '../story'
import { clamp01, inOut, lerp, out3, seg } from '@/lib/motion/ease'
import { litPath, lunelleMain, moonRise } from '../geometry'
import { Words, rise, showStep } from '../words'
import Photo from '../Photo'
import s from '../HomeStory.module.css'
import m from './Lunelle.module.css'

/** Moon phase per step: desktop icons under the text, phone contact sheet (mockup `moonIcon` / `phasebar`). */
const PHASES = [0.12, 0.3, 0.5, 0.72, 0.999]
const SHEET = [0.18, 0.34, 0.5, 0.72, 0.999]
const BLUSH = '#E8C4C0'

/** Ref registry (see Opening.tsx). */
export const dom = {} as {
  root: HTMLElement | null; ground: HTMLElement; disc: HTMLElement; shade: SVGElement; text: HTMLElement; title: HTMLElement; steps: HTMLElement[]
  mains: HTMLElement[]; seconds: HTMLElement[]; ring: HTMLElement; circle: SVGElement; phases: HTMLElement[]; sheet: HTMLElement | null
}
const grab = (n: HTMLElement | null) => {
  dom.root = n
  if (!n) return
  const q = (c: string) => n.querySelector<HTMLElement>(`.${c}`)!
  const ring = q(m.ring)
  Object.assign(dom, {
    ground: q(m.ground), disc: q(m.disc), shade: n.querySelector<SVGElement>('mask circle:last-child')!, text: q(m.text), title: n.querySelector('h2')!, steps: [...q(s.steps).children],
    mains: [...n.querySelectorAll(`.${m.main}`)], seconds: [...n.querySelectorAll(`.${m.second}`)], ring, circle: ring.firstElementChild, phases: [...q(m.phases).children], sheet: null,
  })
}

/** Lunelle: label, title, five sentences, the photo pair of each step. On the stage: the moon, the waxing disc and (phone) the lunar contact sheet. */
export default function Lunelle({ data, stage }: { data: HomeData; stage: boolean }) {
  const full = 'translate(10 10) scale(0.944) translate(-10 -10)' // the icon's moon is r 8.5, the lit path's r 9
  return (
    <section id="lunelle" ref={grab} className={`${s.scene} ${m.ln}`} aria-labelledby="home-ln">
      <div className={m.ground} aria-hidden="true" />
      <svg className={m.disc} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <mask id="ln-disc">
            <circle cx="50" cy="50" r="49" fill="#fff" />
            <circle cx="50" cy="50" r="50" fill="#000" />
          </mask>
        </defs>
        <circle cx="50" cy="50" r="49" fill="#2A1C14" />
        <circle cx="50" cy="50" r="49" fill={BLUSH} fillOpacity="0.16" mask="url(#ln-disc)" />
      </svg>
      <div className={`wrap ${s.grid}`}>
        <div className={`${s.text} ${s.chap} ${m.text}`}>
          <p className={`label ${s.first} ${m.label}`}>{LABELS.ln}</p>
          <h2 id="home-ln" className={`title-page ${s.chapTitle}`}><Words text={data.ln.title} on={stage} /></h2>
          <div className={`body ${s.steps}`}>{LN.map((t) => <p key={t}><Words text={t} on={stage} /></p>)}</div>
          <p className={m.phases} aria-hidden="true">
            {PHASES.map((ph) => (
              <span key={ph}>
                <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" /><path d={litPath(ph)} transform={full} fill="currentColor" /></svg>
              </span>
            ))}
          </p>
        </div>
        <div className={s.photos}>
          {data.ln.pairs.map(([a, b]) => (
            <Fragment key={a.src}>
              <Photo p={a} sizes="(min-width: 1024px) 67vh, 100vw" className={m.main} />
              <Photo p={b} sizes="(min-width: 1024px) 34vh, 60vw" className={`${m.second} ${b.width > b.height ? m.land : ''}`} />
            </Fragment>
          ))}
        </div>
      </div>
      <svg className={m.ring} aria-hidden="true"><circle /></svg>
      {/* client only: the contact sheet is decoration, and its thumbnails need not load for the stacked page */}
      {stage && (
        <div className={m.sheet} aria-hidden="true">
          {SHEET.map((ph, i) => (
            <span key={ph}>
              <svg viewBox="0 0 20 20">
                <defs><clipPath id={`ln-ph${i}`}><path d={litPath(ph)} /></clipPath></defs>
                <circle cx="10" cy="10" r="9" fill="#2A1C14" />
                <image href={data.ln.pairs[i][0].srcset.webp.split(' ')[0]} x="1" y="1" width="18" height="18" preserveAspectRatio="xMidYMid slice" clipPath={`url(#ln-ph${i})`} />
                <circle cx="10" cy="10" r="9.6" fill="none" stroke="currentColor" strokeWidth="0.45" />
              </svg>
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

const vis = (el: HTMLElement | SVGElement, on: boolean) => void (el.style.visibility = on ? '' : 'hidden')

/** Night falls and the moon rises with her first photo, growing to fill the frame; then each step opens a photo through a circle, a second photo rises beside it and the disc waxes (mockup "MOONRISE"). */
export const paint: Paint = (y, r, { phone, W, H }) => {
  const { root, ground, disc, shade, text, title, steps, mains, seconds, ring, circle, phases } = dom
  const ln = r.steps.ln!, inLn = y >= ln[0][0], mr = seg(y, ...r.at.rise), moon = moonRise(mr)
  ground.style.opacity = mr < 0.4 ? '0' : ''
  const st = stepState(Math.max(y, ln[0][0]), ln), li = st.index, k = inLn ? st.k : 0
  showStep(steps, null, li, k)

  mains.forEach((p, i) => {
    const im = p.querySelector('img')!
    if (!inLn) {
      vis(p, i === 0)
      p.style.clipPath = `circle(${moon.r}% at 50% ${moon.y}%)`
      im.style.transform = `scale(${lerp(1.3, 1, inOut(mr))})`
      return
    }
    const kk = i === 0 || li > i ? 1 : li === i ? inOut(k) : 0
    vis(p, i <= li && i >= li - 1)
    p.style.clipPath = i === 0 ? '' : `circle(${kk * 120}% at 50% 42%)`
    im.style.transform = `scale(${lerp(1.25, 1, kk) * (i < li ? 1.05 : 1)})`
  })
  seconds.forEach((p, i) => {
    const kk = li > i ? 1 : li === i ? inOut(clamp01(k * 1.2)) : 0
    vis(p, inLn && i === li)
    p.style.transform = `translateY(${(1 - out3(kk)) * 50 + lerp(6, -6, clamp01(st.within))}%)`
    p.style.clipPath = `inset(0 0 ${(1 - kk) * 100}% 0)`
  })

  // the blush ring around the moon, in px over the main photo (circle() radius % is of the frame's diagonal / √2)
  vis(ring, mr > 0 && mr < 1)
  if (mr > 0 && mr < 1) {
    const [mx, my, mw, mh] = lunelleMain(W, H, phone), bw = (mw / 100) * W, bh = (mh / 100) * H
    // SVG geometry attributes: no HTML layout
    circle.setAttribute('cx', String((mx / 100) * W + bw / 2))
    circle.setAttribute('cy', String((my / 100) * H + (moon.y / 100) * bh))
    circle.setAttribute('r', String(((moon.r / 100) * Math.hypot(bw, bh)) / Math.SQRT2 + 9))
    ring.style.opacity = String(1 - seg(mr, 0.55, 0.8))
  }

  text.style.opacity = String(seg(mr, 0.85, 1))
  rise(title, seg(mr, 0.8, 1))
  shade.setAttribute('cx', String(50 - lerp(0.1, 1, inOut(seg(y, r.at.rise[0], ln[4][0]))) * 100)) // the disc's lit part waxes
  disc.style.transform = `translateY(${lerp(30, 0, out3(mr))}%)`
  // colour: the current phase is lit in blush (spec 6.4)
  phases.forEach((sp, i) => void (sp.style.color = i === li ? BLUSH : 'rgb(242 232 218 / 0.35)'))
  if (phone) {
    if (!dom.sheet?.isConnected) dom.sheet = root!.querySelector<HTMLElement>(`.${m.sheet}`)
    const sheet = dom.sheet
    if (sheet) {
      sheet.style.opacity = String(seg(mr, 0.85, 1))
      ;[...sheet.children].forEach((el, i) => {
        const sp = el as HTMLElement
        sp.style.color = i === li ? BLUSH : 'rgb(242 232 218 / 0.38)' // colour: the current phase lit (spec 6.4)
        sp.style.transform = `scale(${i === li ? 1.14 : 1})`
        sp.style.opacity = i === li ? '' : '0.55'
      })
    }
  }

  // the foam washes in over it (Task 10 draws the foam): Lunelle sinks back
  const fo = seg(y, ...r.at.foam)
  root!.style.transform = fo > 0 ? `scale(${lerp(1, 0.93, inOut(seg(fo, 0, 0.5)))})` : ''
}
