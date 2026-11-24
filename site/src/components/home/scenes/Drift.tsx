import type { HomeData, Pic } from '../data'
import type { Paint } from '../timeline'
import { DESK_STRIP, LABELS, SP, type Ref } from '../story'
import Photo from '../Photo'
import s from '../HomeStory.module.css'

/** Ref registry (see Opening.tsx). */
export const dom: { root: HTMLElement | null } = { root: null }

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Drift: the logo, then the strip in order (photos, her four sentences, the six looks, the end panel). */
export default function Drift({ data }: { data: HomeData }) {
  const photo = (ref: Ref): Pic => (typeof ref === 'number' ? data.dr.shots[ref] : data.inspiration[+ref.slice(4)])
  return (
    <section id="drift" ref={(n) => void (dom.root = n)} className={s.scene} aria-labelledby="home-dr">
      <div className="wrap">
        <h2 id="home-dr" className={s.logoTitle}>
          <Photo p={data.dr.logoBrown} sizes="240px" />
        </h2>
        <p className="label">{LABELS.dr}</p>
        <ol className={s.strip}>
          {DESK_STRIP.map((it, i) => {
            if (it.kind === 'img')
              return (
                <li key={i} className={s.card}>
                  <Photo p={photo(it.ref)} sizes="(min-width: 1024px) 30vw, 90vw" />
                  {it.overlay != null && <p className="narr">{SP[it.overlay]}</p>}
                </li>
              )
            if (it.kind === 'text')
              return (
                <li key={i} className={s.panel}>
                  <p className="narr">{SP[it.sp]}</p>
                </li>
              )
            if (it.kind === 'look')
              return (
                <li key={i} className={s.panel}>
                  <span className={s.bignum} aria-hidden="true">{pad2(it.look + 1)}</span>
                  <p className="label">Look {pad2(it.look + 1)} / 06</p>
                  <h3 className="title-section">Look {pad2(it.look + 1)}</h3>
                  <p className="narr">{data.dr.looks[it.look]}</p>
                </li>
              )
            return (
              <li key={i} className={s.panel}>
                <p className="label">{LABELS.drift} · {LABELS.dr}</p>
                <h3 className="title-section">Six looks, six models.</h3>
                <a className={s.cta} href="/collections/drift/">Explore the collection →</a>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export const paint: Paint = () => {} // motion: Task 10
