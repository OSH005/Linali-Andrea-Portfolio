import type { Metadata } from 'next'
import Chapter from '@/components/Chapter'
import Footer from '@/components/sections/Footer'
import { getCollection, getCollections } from '@/lib/collections'
import { getMedia } from '@/lib/media'
import styles from '../work.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(props: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const c = getCollection((await props.params).slug)!
  return { title: `${c.title} ${c.season} · Linali Andrea`, description: c.concept.split('. ')[0] + '.' }
}

export default async function CollectionPage(props: PageProps<'/work/[slug]'>) {
  const c = getCollection((await props.params).slug)!
  return (
    <>
      <main>
        <nav className={`wrap ${styles.back}`} aria-label="Breadcrumb">
          <a href="/work/">All work</a>
        </nav>
        <Chapter collection={c} media={getMedia(c.slug)} defaultOpen />
      </main>
      <Footer />
    </>
  )
}
