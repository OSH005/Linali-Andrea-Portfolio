import site from '../../../content/site.json'
import { getBrand, getMedia } from '@/lib/media'
import { getCollection } from '@/lib/collections'
import styles from './sections.module.css'

export default function Hero() {
  const sketch = { collection: 'drift', page: '18' }
  const photo = { collection: 'drift', shoot: '13-MMS_8698' }
  const page = getMedia(sketch.collection).pages.find((p) => p.id === sketch.page)!
  const shot = getMedia(photo.collection).shoot.find((s) => s.id === photo.shoot)!
  const alt = getCollection(photo.collection)!.alt[photo.shoot]
  const mono = getBrand().monogram

  return (
    <section id="top" className={styles.hero}>
      <nav className={`wrap ${styles.nav}`} aria-label="Main">
        <a href="#top" className={styles.mono} aria-label={`${site.name}, home`}>
          <img src={mono.srcset.webp.split(' ')[0]} alt="" width={48} height={48} />
        </a>
        <ul>
          <li><a href="/collections/">Work</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      <div className={styles.heroArt} aria-hidden="true">
        <img className={styles.sketch} src={page.src} srcSet={page.srcset.webp} sizes="100vw" alt="" />
      </div>
      <figure className={styles.lens}>
        <img src={shot.src} srcSet={shot.srcset.webp} sizes="60vw" alt={alt} />
      </figure>
      <div className={`wrap ${styles.heroText}`}>
        <h1 className="display">{site.name}</h1>
        <p>{site.tagline}</p>
      </div>
    </section>
  )
}
