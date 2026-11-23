import Hero from '@/components/sections/Hero'
import Manifesto from '@/components/sections/Manifesto'
import Person from '@/components/sections/Person'
import Footer from '@/components/sections/Footer'
import Chapter from '@/components/Chapter'
import { getFeatured } from '@/lib/collections'
import { getMedia } from '@/lib/media'

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        {getFeatured().map((c) => (
          <Chapter key={c.slug} collection={c} media={getMedia(c.slug)} />
        ))}
        <Person />
      </main>
      <Footer />
    </>
  )
}
