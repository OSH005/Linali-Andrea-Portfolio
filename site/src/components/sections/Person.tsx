import site from '../../../content/site.json'
import { getPersonal } from '@/lib/media'
import styles from './sections.module.css'

const alt = site.personalAlt as Record<string, string>

export default function Person() {
  const figure = getPersonal(site.person.figure)
  const [a, b] = site.person.polaroids.map((n) => ({ img: getPersonal(n), alt: alt[n] }))
  const showDraft = site.bio.draft && process.env.NODE_ENV !== 'production'

  return (
    <section id="about" className={styles.person} aria-labelledby="about-title">
      <div className={`wrap ${styles.personText}`}>
        <h2 id="about-title" className="display">
          Behind the <em>work</em>, a slow hand.
        </h2>
        <p className={styles.bio}>
          {showDraft && <mark className="label">Draft</mark>} {site.bio.text}
        </p>
        <ul className={styles.skills} aria-label="Skills">
          {site.skills.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
      <div className={styles.stage}>
        <figure className={`${styles.polaroid} ${styles.polaroidA}`}>
          <img src={a.img.src} srcSet={a.img.srcset.webp} sizes="320px" alt={a.alt} loading="lazy" />
        </figure>
        <figure className={`${styles.polaroid} ${styles.polaroidB}`}>
          <img src={b.img.src} srcSet={b.img.srcset.webp} sizes="240px" alt={b.alt} loading="lazy" />
        </figure>
        <img className={styles.figure} src={figure.src} srcSet={figure.srcset.webp} sizes="(min-width: 1024px) 40vw, 80vw" alt={alt[site.person.figure]} loading="lazy" />
      </div>
    </section>
  )
}
