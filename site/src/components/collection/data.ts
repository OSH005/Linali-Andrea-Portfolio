// Server-only: what a collection page shows (text from content/, photos from the media manifest).
import { getCollection, getCollections } from '@/lib/collections'
import { getMedia, type MediaImage } from '@/lib/media'
import type { Pic } from '@/components/home/data'

const pad2 = (n: number) => String(n).padStart(2, '0')

/** A sentence ends at . ! ? before a capital, an opening quote or Sinhala. */
const sentences = (text: string) => text.split(/(?<=[.!?”])\s+(?=[A-Z“\u0D80-\u0DFF])/)
/** Her concept as two paragraphs; the first gets ⌈n/2⌉ sentences. */
export function splitConcept(text: string): [string, string] {
  const s = sentences(text)
  const k = Math.ceil(s.length / 2)
  return [s.slice(0, k).join(' '), s.slice(k).join(' ')]
}

/** The next collection in the journey; after the last, back to the first. */
export function nextSlug(slug: string): string {
  const all = getCollections(), i = all.findIndex((c) => c.slug === slug)
  return all[(i + 1) % all.length].slug
}

const isSpread = (m: MediaImage) => m.width / m.height > 2

export function collectionData(slug: string) {
  const all = getCollections(), c = getCollection(slug)!, m = getMedia(slug), i = all.indexOf(c)
  const pic = (im: MediaImage, alt = c.alt[im.id] ?? ''): Pic => ({ src: im.src, srcset: im.srcset, width: im.width, height: im.height, alt })
  const lead = (n: number) => m[c.lead.from].find((im) => im.order === n)!
  const leadAlt = (im: MediaImage) => c.alt[im.id] ?? `${c.title} portfolio, page ${im.order}`
  const nx = getCollection(nextSlug(slug))!, nm = getMedia(nx.slug), np = nm[nx.lead.from].find((im) => im.order === nx.lead.phone)!
  const unit = m.pages.length && m.pages.every(isSpread) ? 'spread' : 'page'
  return {
    slug: c.slug,
    title: c.title,
    titleNative: c.titleNative,
    season: c.season,
    label: `Collection ${pad2(i + 1)} / ${pad2(all.length)} · ${c.season}`,
    first: sentences(c.concept)[0],
    concept: splitConcept(c.concept),
    hero: { desktop: c.lead.desktop.map((n) => pic(lead(n), leadAlt(lead(n)))), phone: pic(lead(c.lead.phone), leadAlt(lead(c.lead.phone))) },
    // the rolling film beside her words: her photographs (Revive: her boards), decorative
    film: (m.shoot.length ? m.shoot : m.pages).map((im) => pic(im, '')),
    shoot: m.shoot,
    alt: c.alt,
    pages: m.pages,
    pageText: c.pageText,
    pagesHeading: `${m.pages.length} ${unit}${m.pages.length === 1 ? '' : 's'}`,
    next: {
      slug: nx.slug,
      title: nx.title,
      label: all.indexOf(nx) === 0 ? 'Back to the start of the journey' : 'Next collection',
      meta: `${nx.season} · ${pad2(all.indexOf(nx) + 1)} / ${pad2(all.length)}`,
      pic: pic(np, ''),
    },
  }
}

export type CollectionData = ReturnType<typeof collectionData>
