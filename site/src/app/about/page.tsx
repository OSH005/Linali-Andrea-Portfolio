import type { Metadata } from 'next'
import Footer from '@/components/sections/Footer'
import { getSite } from '@/lib/site'

export const metadata: Metadata = { title: 'About · Linali Andrea', description: 'About Linali Andrea, fashion designer.' }

export default function About() {
  const site = getSite()
  return (
    <>
      <main className="wrap">
        <h1 className="display">{site.name}</h1>
        <p className="label">{site.role} · {site.location}</p>
      </main>
      <Footer />
    </>
  )
}
