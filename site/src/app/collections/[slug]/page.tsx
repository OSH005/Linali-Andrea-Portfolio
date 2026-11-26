import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Hero from '@/components/collection/Hero'
import InMyWords from '@/components/collection/InMyWords'
import Shoot from '@/components/collection/Shoot'
import PageReader from '@/components/collection/PageReader'
import SectionSwitch from '@/components/collection/SectionSwitch'
import NextCollection from '@/components/collection/NextCollection'
import { collectionData } from '@/components/collection/data'
import { getCollection, getCollections } from '@/lib/collections'
import styles from '../collections.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(props: PageProps<'/collections/[slug]'>): Promise<Metadata> {
  const c = getCollection((await props.params).slug)!
  return { title: `${c.title} ${c.season} · Linali Andrea`, description: c.concept.split('. ')[0] + '.' }
}

/** One template for every collection (spec 7.2): hero, in my words, the shoot (if any), the portfolio, the next one, contact. */
export default async function CollectionPage(props: PageProps<'/collections/[slug]'>) {
  const d = collectionData((await props.params).slug)
  return (
    <>
      <main>
        <Hero d={d} />
        <InMyWords d={d} />
        {d.shoot.length > 0 && <Shoot d={d} />}
        <section id="portfolio" className={styles.port} aria-labelledby="portfolio-title">
          <PageReader title={d.title} pages={d.pages} pageText={d.pageText} />
        </section>
        <NextCollection next={d.next} />
        {d.shoot.length > 0 && <SectionSwitch />}
      </main>
      <Footer variant="flow" />
    </>
  )
}
