import site from '../../../content/site.json'
import styles from './sections.module.css'

export default function Manifesto() {
  return (
    <section id="manifesto" className={`wrap ${styles.manifesto}`} aria-label="Statement">
      <blockquote>
        <p className="display">{site.manifesto}</p>
      </blockquote>
      <p className={styles.themes}>{site.themes.join(' · ')}</p>
    </section>
  )
}
