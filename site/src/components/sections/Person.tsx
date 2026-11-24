import site from '../../../content/site.json'
import { getPersonal } from '@/lib/media'
import styles from './sections.module.css'

const alt = site.personalAlt as Record<string, string>

export default function Person() {
  const figure = getPersonal('balcony-sticker') // her-flush arrives with Task 2; this file is deleted in Task 14
  const [a, b] = site.portrait.polaroids.slice(0, 2).map((n) => ({ img: getPersonal(n), alt: alt[n] }))

  return (
    <section id="about" className={styles.person} aria-labelledby="about-title">
      <div className={`wrap ${styles.personText}`}>
        <h2 id="about-title" className="display">
          Behind the <em>work</em>, a slow hand.
        </h2>
        <p className={styles.bio}>{site.bio}</p>
        <ul className={styles.skills} aria-label="Skills">
          {site.skills.flatMap((g) => g.skills).map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
      <div className={styles.stage}>
        <figure className={`${styles.polaroid} ${styles.polaroidA}`}>
          <img src={a.img.src} srcSet={a.img.srcset.webp} sizes="320px" alt={a.alt} loading="lazy" />
        </figure>
        <figure className={`${styles.polaroid} ${styles.polaroidB}`}>
          <img src={b.img.src} srcSet={b.img.srcset.webp} sizes="240px" alt={b.alt} loading="lazy" />
        </figure>
        <img className={styles.figure} src={figure.src} srcSet={figure.srcset.webp} sizes="(min-width: 1024px) 40vw, 80vw" alt={alt['balcony-sticker']} loading="lazy" />
      </div>
    </section>
  )
}
