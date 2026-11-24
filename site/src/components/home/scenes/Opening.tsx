import type { HomeData } from '../data'
import type { Paint } from '../timeline'
import { MANIFEST, MOOD_COLUMNS } from '../story'
import Photo from '../Photo'
import s from '../HomeStory.module.css'

/**
 * Ref registry: the elements this scene's paint() drives, set by ref callbacks (one home page at a time).
 * Each scene file follows the same pattern; Tasks 8–10 add the elements they animate.
 */
export const dom: { root: HTMLElement | null } = { root: null }

/** Her: name, title, manifesto, the flush cut-out and the moodboard columns. */
export default function Opening({ data }: { data: HomeData }) {
  return (
    <section id="top" ref={(n) => void (dom.root = n)} className={`${s.scene} ${s.opening}`} aria-labelledby="home-name">
      <div className={`wrap ${s.grid}`}>
        <div className={s.text}>
          <h1 id="home-name" className="display">{data.name}</h1>
          <p className="label">{data.tagline}</p>
          <p className={`lead ${s.manif}`}>{MANIFEST}</p>
        </div>
        <Photo p={data.her} sizes="(min-width: 1024px) 40vw, 80vw" className={s.her} eager />
        <div className={s.mood} aria-hidden="true">
          {MOOD_COLUMNS.map((col, i) => (
            <div key={i} className={s.col}>
              {col.map((n, j) => <Photo key={j} p={data.inspiration[n]} sizes="(min-width: 1024px) 15vw, 30vw" />)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const paint: Paint = () => {} // motion: Task 8
