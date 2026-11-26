import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import AboutOpening from '@/components/about/AboutOpening'
import AboutMe from '@/components/about/AboutMe'
import type { Pic } from '@/components/home/data'
import { getInspiration, getPersonal, type MediaImage } from '@/lib/media'
import { getSite } from '@/lib/site'

export const metadata: Metadata = { title: 'About · Linali Andrea', description: 'About Linali Andrea, fashion designer from Panadura, Sri Lanka.' }

const pic = (m: MediaImage, alt: string): Pic => ({ src: m.src, srcset: m.srcset, width: m.width, height: m.height, alt })
/** Her inspiration photos in the frames' order (mockup `MOOD`). */
const MOOD = [1, 3, 4, 5, 6, 7, 2]

/** About (spec 8): the opening collage, about me with my inspiration, then the contact card as the next block. */
export default function About() {
  const site = getSite()
  const insp = (n: number, alt = site.inspirationAlt[n - 1]) => pic(getInspiration().find((i) => i.order === n)!, alt)
  const personal = (n: string) => pic(getPersonal(n), site.personalAlt[n])
  return (
    <>
      <main>
        <AboutOpening
          name={site.name}
          role={`${site.role} · ${site.location}`}
          manifesto={site.manifesto}
          her={personal(site.portrait.figure)}
          polaroids={site.portrait.polaroids.map(personal)}
          // decorative: the same photos are in "My inspiration" with their alt text
          small={[insp(2, ''), insp(7, '')]}
        />
        <AboutMe bio={site.bio} facts={site.facts} linkedin={site.links.linkedin} inspiration={MOOD.map((n) => insp(n))} />
        {/* Task 15: the skills mat (a <section data-chapter="Skills">) goes here */}
      </main>
      <Footer variant="flow" />
    </>
  )
}
