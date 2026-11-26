import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import CollectionIndex from '@/components/collections/CollectionIndex'
import { indexData } from '@/components/collections/data'

export const metadata: Metadata = { title: 'Collections · Linali Andrea', description: 'Every collection by Linali Andrea, in the order of her journey.' }

export default function CollectionsIndex() {
  return (
    <>
      <main>
        <CollectionIndex data={indexData()} />
      </main>
      <Footer />
    </>
  )
}
