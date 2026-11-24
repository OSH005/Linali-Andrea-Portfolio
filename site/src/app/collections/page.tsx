import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import { getCollections } from '@/lib/collections'
import { getMedia } from '@/lib/media'
import styles from './collections.module.css'

export const metadata: Metadata = { title: 'Collections · Linali Andrea', description: 'Every collection by Linali Andrea.' }

export default function CollectionsIndex() {
  return (
    <>
      <main className={`wrap ${styles.index}`}>
        <nav className={styles.back} aria-label="Breadcrumb">
          <a href="/">Linali Andrea</a>
        </nav>
        <h1 className="display">Collections</h1>
        <ul className={styles.list}>
          {getCollections().map((c) => {
            const m = getMedia(c.slug)
            // No shoot yet: show the collection's mark on paper rather than a crop of a board.
            const img = m.shoot[0] ?? m.logo ?? m.cover ?? m.pages[0]
            const isMark = !m.shoot[0]
            return (
              <li key={c.slug}>
                <a href={`/collections/${c.slug}/`} className={styles.card}>
                  <img className={isMark ? styles.mark : undefined} src={img.src} srcSet={img.srcset.webp} sizes="(min-width: 1024px) 25vw, 50vw" alt="" loading="lazy" />
                  <span className={styles.cardTitle}>{c.title}</span>
                  <span className="label">{c.season}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </main>
      <Footer variant="flow" />
    </>
  )
}
