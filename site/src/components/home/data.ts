// Server-only: gathers what the home story shows (text from content/, photos from the media manifest).
import { getCollection } from '@/lib/collections'
import { getBrand, getInspiration, getMedia, getPersonal, type MediaImage } from '@/lib/media'
import { getSite } from '@/lib/site'
import { LN_PAIRS, MP_SHOTS, RV_BOARD, RV_PILE } from './story'

export interface Pic {
  src: string
  srcset: { avif: string; webp: string }
  width: number
  height: number
  alt: string
}

const pic = (m: MediaImage, alt = ''): Pic => ({ src: m.src, srcset: m.srcset, width: m.width, height: m.height, alt })

function collection(slug: string) {
  const c = getCollection(slug)!, m = getMedia(slug)
  const find = (list: MediaImage[], n: number) => list.find((i) => i.order === n) ?? fail(`${slug} has no image ${n}`)
  const shot = (n: number) => { const im = find(m.shoot, n); return pic(im, c.alt[im.id] ?? '') }
  const page = (n: number) => { const im = find(m.pages, n); return pic(im, c.alt[im.id] ?? `${c.title} portfolio, page ${n}`) }
  return { c, m, shot, page }
}
const fail = (msg: string): never => { throw new Error(msg) }

export function homeData() {
  const site = getSite(), brand = getBrand()
  const mp = collection('mano-padana'), rv = collection('revive'), ln = collection('lunelle'), dr = collection('drift')
  return {
    name: site.name,
    tagline: site.tagline,
    her: pic(getPersonal(site.portrait.figure), site.personalAlt[site.portrait.figure]),
    // moodboard and foam: her inspiration photos, decorative (no alt)
    inspiration: Object.fromEntries(getInspiration().map((i) => [i.order, pic(i)])) as Record<number, Pic>,
    mp: { title: mp.c.title, titleNative: mp.c.titleNative ?? '', shots: MP_SHOTS.map(mp.shot) },
    rv: { title: rv.c.title, logo: pic(rv.m.logo ?? fail('revive has no logo'), `${rv.c.title} ${rv.c.season}`), board: rv.page(RV_BOARD), pile: rv.page(RV_PILE) },
    ln: { title: ln.c.title, pairs: LN_PAIRS.map(([a, b]) => [ln.shot(a), ln.shot(b)] as [Pic, Pic]) },
    dr: {
      title: dr.c.title,
      season: dr.c.season,
      shots: Object.fromEntries(dr.m.shoot.map((i) => [i.order, dr.shot(i.order)])) as Record<number, Pic>,
      looks: (dr.c.looks ?? []).map((l) => l.text),
      logoBrown: pic(brand.driftLogoBrown, dr.c.title),
      logoCream: pic(brand.driftLogoCream, dr.c.title),
    },
  }
}

export type HomeData = ReturnType<typeof homeData>
