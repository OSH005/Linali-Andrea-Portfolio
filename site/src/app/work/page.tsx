import type { Metadata } from 'next'
import Footer from '@/components/sections/Footer'
import { getCollections } from '@/lib/collections'
import { getMedia } from '@/lib/media'
import styles from './work.module.css'

export const metadata: Metadata = { title: 'Work · Linali Andrea', description: 'Every collection by Linali Andrea.' }

export default function WorkIndex() {
  return (
    <>
      <main className={`wrap ${styles.index}`}>
        <nav className={styles.back} aria-label="Breadcrumb">
          <a href="/">Linali Andrea</a>
        </nav>
        <h1 className="display">Work</h1>
        <ul className={styles.list}>
          {getCollections().map((c) => {
            const m = getMedia(c.slug)
            const img = m.shoot[0] ?? m.cover ?? m.pages[0]
            return (
              <li key={c.slug}>
                <a href={`/work/${c.slug}/`} className={styles.card}>
                  <img src={img.src} srcSet={img.srcset.webp} sizes="(min-width: 1024px) 25vw, 50vw" alt="" loading="lazy" />
                  <span className={styles.cardTitle}>{c.title}</span>
                  <span className="label">{c.season}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </main>
      <Footer />
    </>
  )
}
