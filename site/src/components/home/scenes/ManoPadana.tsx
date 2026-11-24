import type { HomeData } from '../data'
import type { Paint } from '../timeline'
import { LABELS, MP } from '../story'
import Photo from '../Photo'
import s from '../HomeStory.module.css'

/** Ref registry (see Opening.tsx). */
export const dom: { root: HTMLElement | null } = { root: null }

/** Mano Padana: label, title with මනෝ පාදන, four sentences, her four walking photos. */
export default function ManoPadana({ data }: { data: HomeData }) {
  return (
    <section id="mano-padana" ref={(n) => void (dom.root = n)} className={s.scene} aria-labelledby="home-mp">
      <div className={`wrap ${s.grid}`}>
        <div className={s.text}>
          <p className="label">{LABELS.mp}</p>
          <h2 id="home-mp" className="title-page">
            {data.mp.title} <span lang="si" className={s.sinh}>{data.mp.titleNative}</span>
          </h2>
          <div className={`body ${s.steps}`}>{MP.map((t) => <p key={t}>{t}</p>)}</div>
        </div>
        <div className={s.photos}>
          {data.mp.shots.map((p) => <Photo key={p.src} p={p} sizes="(min-width: 1024px) 25vw, 50vw" />)}
        </div>
      </div>
    </section>
  )
}

export const paint: Paint = () => {} // motion: Task 8
