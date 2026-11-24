import { Fragment } from 'react'
import type { HomeData } from '../data'
import type { Paint } from '../timeline'
import { MANIFEST, MOOD_COLUMNS } from '../story'
import { clamp01, inOut, lerp, out3, seg } from '@/lib/motion/ease'
import { Words, rise } from '../words'
import Photo from '../Photo'
import s from '../HomeStory.module.css'
import o from './Opening.module.css'

/**
 * Ref registry: the elements this scene's paint() drives, set by the section's ref callback (one home page at a time).
 */
export const dom = {} as { root: HTMLElement | null; hero: HTMLElement; name: HTMLElement; manif: HTMLElement; her: HTMLElement; mood: HTMLElement; cols: HTMLElement[] }
const grab = (n: HTMLElement | null) => {
  dom.root = n
  if (!n) return
  const q = (c: string) => n.querySelector<HTMLElement>(`.${c}`)!
  Object.assign(dom, { hero: q(o.hero), name: q(o.name), manif: q(o.manif), her: q(o.her), mood: q(o.cols), cols: [...q(o.cols).children] })
}

/** Her: name, title, manifesto, the flush cut-out and the moodboard columns. `stage`: split words for the motion (client only). */
export default function Opening({ data, stage }: { data: HomeData; stage: boolean }) {
  return (
    <section id="top" ref={grab} className={`${s.scene} ${s.opening} ${o.op}`} aria-labelledby="home-name">
      <div className={`wrap ${s.grid}`}>
        <div className={`${s.text} ${o.hero}`}>
          <h1 id="home-name" className={`display ${o.name}`}><Words text={data.name} on={stage} /></h1>
          <p className={`label ${o.label}`}>{data.tagline}</p>
          <p className={`lead ${s.manif} ${o.manif}`}>
            {stage ? MANIFEST.split(' ').map((w, i) => <Fragment key={i}>{i > 0 && ' '}<span>{w}</span></Fragment>) : MANIFEST}
          </p>
        </div>
        <Photo p={data.her} sizes="(min-width: 1024px) 40vw, 80vw" className={`${s.her} ${o.her}`} eager />
        <div className={`${s.mood} ${o.cols}`} aria-hidden="true">
          {MOOD_COLUMNS.map((col, i) => (
            <div key={i} className={`${s.col} ${o.col}`}>
              {[...col, ...col].map((n, j) => (
                <Photo key={j} p={data.inspiration[n]} sizes="(min-width: 1024px) 15vw, 30vw" className={`${n === 6 ? o.wide : ''} ${j >= col.length ? o.dup : ''}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const off = [0, 0, 0] // moodboard column offsets, % of a column (it holds its photos twice, so 50% loops)

/** Name rises on load; manifesto fills 18% → 100% ink over manif[0]…+350; moodboard drifts; the window opening lifts her away (mockup "OPENING"). */
export const paint: Paint = (y, r, { dt, now }) => {
  const { hero, name, manif, her, mood, cols } = dom, words = manif.children as HTMLCollectionOf<HTMLElement> // live: the word spans appear after hydration
  const open = seg(y, ...r.at.open), opn = inOut(seg(open, 0, 0.65)), intro = out3(clamp01(now / 1.3))
  rise(name, clamp01(now / 1.1), 0.08)
  hero.style.opacity = String(1 - seg(open, 0.05, 0.3))
  hero.style.transform = `translateY(${-out3(seg(open, 0, 0.4)) * 50}px)`
  const fill = seg(y, r.at.manif[0], r.at.manif[0] + 350 * r.unit) * words.length
  for (let i = 0; i < words.length; i++) words[i].style.color = `rgb(59 36 24 / ${0.18 + 0.82 * clamp01(fill - i)})`
  her.style.transform = `translateY(${(1 - intro) * 24}px) scale(${lerp(1, 0.86, opn)})`
  her.style.opacity = String(1 - seg(open, 0.25, 0.55))
  const away = inOut(seg(open, 0, 0.45))
  cols.forEach((c, i) => {
    const dir = i % 2 ? 1 : -1
    off[i] = (off[i] + dir * (1.2 + i * 0.4) * dt) % 50
    c.style.transform = `translateY(${(dir < 0 ? off[i] : off[i] - 50) - away * (40 + i * 12)}%)`
  })
  mood.style.opacity = String(1 - seg(open, 0.3, 0.5))
  mood.style.transform = `translateY(${(1 - intro) * 40}px)`
}
