import type { HomeData } from '../data'
import type { Paint } from '../timeline'
import { LABELS, LN } from '../story'
import Photo from '../Photo'
import s from '../HomeStory.module.css'

/** Ref registry (see Opening.tsx). */
export const dom: { root: HTMLElement | null } = { root: null }

/** Lunelle: label, title, five sentences, the photo pair of each step. */
export default function Lunelle({ data }: { data: HomeData }) {
  return (
    <section id="lunelle" ref={(n) => void (dom.root = n)} className={s.scene} aria-labelledby="home-ln">
      <div className={`wrap ${s.grid}`}>
        <div className={s.text}>
          <p className="label">{LABELS.ln}</p>
          <h2 id="home-ln" className="title-page">{data.ln.title}</h2>
          <div className={`body ${s.steps}`}>{LN.map((t) => <p key={t}>{t}</p>)}</div>
        </div>
        <div className={s.photos}>
          {data.ln.pairs.flat().map((p) => <Photo key={p.src} p={p} sizes="(min-width: 1024px) 25vw, 50vw" />)}
        </div>
      </div>
    </section>
  )
}

export const paint: Paint = () => {} // motion: Task 9
