import type { Metadata } from 'next'
import Chapter from '@/components/Chapter'
import Footer from '@/components/Footer'
import { getCollection, getCollections } from '@/lib/collections'
import { getMedia } from '@/lib/media'
import Photo from '@/components/home/Photo'
import styles from '../collections.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(props: PageProps<'/collections/[slug]'>): Promise<Metadata> {
  const c = getCollection((await props.params).slug)!
  return { title: `${c.title} ${c.season} · Linali Andrea`, description: c.concept.split('. ')[0] + '.' }
}

export default async function CollectionPage(props: PageProps<'/collections/[slug]'>) {
  const c = getCollection((await props.params).slug)!
  const m = getMedia(c.slug), hero = m[c.lead.from].find((i) => i.order === c.lead.desktop[0])!
  return (
    <>
      <main>
        <nav className={`wrap ${styles.back}`} aria-label="Breadcrumb">
          <a href="/collections/">All collections</a>
        </nav>
        {/* the index's follow frame lands here (view-transition-name: collection-photo); Task 12's hero keeps the name */}
        <Photo p={{ ...hero, alt: c.alt[hero.id] ?? '' }} className={`${styles.hero} vt-photo`} sizes="100vw" eager />
        <Chapter collection={c} media={m} defaultOpen />
      </main>
      <Footer variant="flow" />
    </>
  )
}
