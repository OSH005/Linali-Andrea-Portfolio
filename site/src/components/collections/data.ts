// Server-only: the collections index rows (text from content/, photos and counts from the media manifest).
import { getCollections } from '@/lib/collections'
import { getMedia, type CollectionMedia, type MediaImage } from '@/lib/media'
import type { Pic } from '@/components/home/data'

/** The three photographs each collection shows in the follow frame and the rail (mockup `COLS.imgs`); others: their first three. */
const PICKS: Record<string, number[]> = { 'mano-padana': [1, 3, 4], revive: [34, 32, 30], lunelle: [1, 5, 10], drift: [7, 3, 6] }
/** Hover tints (spec 5.2); a new collection keeps the cream ground until it gets one. */
const TINTS: Record<string, string> = { 'mano-padana': 'rgb(233 226 216)', revive: 'rgb(226 230 233)', lunelle: 'rgb(241 225 220)', drift: 'rgb(223 233 235)' }

const pad2 = (n: number) => String(n).padStart(2, '0')
const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
const word = (n: number) => NUM[n] ?? String(n)
const isSpread = (m: { width: number; height: number }) => m.width / m.height > 2

/** "17 photographs · 8 spreads", or "Portfolio · 4 spreads" without a shoot; double-page images count as spreads. */
const many = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`
export function countText({ shoot, pages }: CollectionMedia) {
  const book = many(pages.length, pages.length && pages.every(isSpread) ? 'spread' : 'page')
  return shoot.length ? `${many(shoot.length, 'photograph')} · ${book}` : `Portfolio · ${book}`
}

/** SS25 < AW26 < SS27 */
const seasonKey = (s: string) => { const m = /^(SS|AW)(\d+)$/.exec(s); return m ? +m[2] * 2 + (m[1] === 'AW' ? 1 : 0) : Infinity }

export function indexData() {
  const rows = getCollections().map((c, i) => {
    const m = getMedia(c.slug), list = m.shoot.length ? m.shoot : m.pages
    const pick = (n: number) => list.find((im) => im.order === n)
    const pics = (PICKS[c.slug]?.map(pick).filter((x): x is MediaImage => !!x) ?? list).slice(0, 3)
    return {
      slug: c.slug,
      n: pad2(i + 1),
      title: c.title,
      titleNative: c.titleNative,
      meta: `${c.season} · ${c.theme}`,
      season: c.season,
      line: c.line,
      count: countText(m),
      tint: TINTS[c.slug] ?? 'var(--cream)',
      // decorative here: the link's own text names the collection
      pics: pics.map((im): Pic => ({ src: im.src, srcset: im.srcset, width: im.width, height: im.height, alt: '' })),
    }
  })
  const seasons = [...new Set(rows.map((r) => r.season))].sort((a, b) => seasonKey(a) - seasonKey(b))
  return {
    label: `Collections · ${pad2(rows.length)}`,
    heading: `${word(rows.length)} collections, in the order of my journey.`,
    seasonsHeading: `${word(seasons.length)} seasons, ${word(rows.length).toLowerCase()} collections.`,
    rows, seasons: seasons.map((s) => ({ season: s, rows: rows.filter((r) => r.season === s).map((r) => r.slug) })) }
}

export type IndexData = ReturnType<typeof indexData>
export type Row = IndexData['rows'][number]
