import type { HomeData } from '../data'
import type { Paint } from '../timeline'
import { LABELS, RV } from '../story'
import Photo from '../Photo'
import s from '../HomeStory.module.css'

/** Ref registry (see Opening.tsx). */
export const dom: { root: HTMLElement | null } = { root: null }

/** Revive: logo, label, three sentences, her torn board and the pile under it. */
export default function Revive({ data }: { data: HomeData }) {
  return (
    <section id="revive" ref={(n) => void (dom.root = n)} className={s.scene} aria-labelledby="home-rv">
      <div className={`wrap ${s.grid}`}>
        <div className={s.text}>
          <h2 id="home-rv" className={s.logoTitle}>
            <Photo p={data.rv.logo} sizes="200px" />
          </h2>
          <p className="label">{LABELS.rv}</p>
          <div className={`body ${s.steps}`}>{RV.map((t) => <p key={t}>{t}</p>)}</div>
        </div>
        <div className={s.boards}>
          <Photo p={data.rv.board} sizes="(min-width: 1024px) 55vw, 100vw" />
          <Photo p={data.rv.pile} sizes="(min-width: 1024px) 40vw, 80vw" className={s.pile} />
        </div>
      </div>
    </section>
  )
}

export const paint: Paint = () => {} // motion: Task 8
