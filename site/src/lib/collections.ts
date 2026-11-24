// Server-only: reads content/collections/*.json at build time.
import fs from 'node:fs'
import path from 'node:path'
import { contrastRatio } from './contrast'
import { getMedia } from './media'

export type Moment = 'ring' | 'orbit' | 'walk' | 'studio' | 'gallery'
const MOMENTS: Moment[] = ['ring', 'orbit', 'walk', 'studio', 'gallery']

export type Theme = 'Mind' | 'Renewal' | 'Body' | 'Nature'
const THEMES: Theme[] = ['Mind', 'Renewal', 'Body', 'Nature']

/** Media `order` numbers available per kind; used to check `lead` and `looks`. */
export interface MediaOrders {
  shoot: number[]
  pages: number[]
}

export interface Collection {
  slug: string
  title: string
  titleNative?: string
  season: string
  year: number
  order: number
  featured: boolean
  concept: string
  line: string
  theme: Theme
  lead: { from: 'shoot' | 'pages'; desktop: number[]; phone: number }
  looks?: { n: number; shots: [number, number]; text: string }[]
  palette: { ground: string; ink: string; accent: string }
  moment: Moment
  carousel?: { preset: 'cylinder' | 'orbit' | 'wheel' | 'panorama'; autoplay: 'drift' | 'step' | 'off'; speed?: number }
  studio?: { label: string; pages: string[] }[]
  credits: { photographer?: string; models?: string[]; collaboration?: string | null }
  rights: { models: boolean; photographer: boolean; sensitive: string; confirmedBy: string | null }
  alt: Record<string, string>
  pageText: Record<string, string>
  pageOrder: 'confirmed' | 'provisional'
}

const HEX = /^#[0-9a-f]{6}$/i

export function parseCollection(raw: unknown, file: string, mediaOrders?: MediaOrders): Collection {
  const c = raw as Record<string, unknown>
  const fail = (msg: string): never => {
    throw new Error(`${file}: ${msg}`)
  }
  const need = (key: string, type: string) => {
    if (typeof c?.[key] !== type) fail(`${key} must be a ${type}`)
  }
  for (const k of ['slug', 'title', 'season', 'concept', 'line']) need(k, 'string')
  for (const k of ['year', 'order']) need(k, 'number')
  need('featured', 'boolean')
  for (const k of ['palette', 'credits', 'rights', 'alt', 'pageText']) need(k, 'object')

  if (!THEMES.includes(c.theme as Theme)) fail(`theme must be one of ${THEMES.join(', ')}`)
  const lead = c.lead as Collection['lead'] | undefined
  if (!lead || (lead.from !== 'shoot' && lead.from !== 'pages') || !Array.isArray(lead.desktop) || typeof lead.phone !== 'number')
    fail('lead must be { from: shoot|pages, desktop: number[], phone: number }')
  else if (mediaOrders) {
    for (const n of [...lead.desktop, lead.phone])
      if (!mediaOrders[lead.from].includes(n)) fail(`lead ${n} is not in ${lead.from}`)
  }
  if (c.looks !== undefined && !Array.isArray(c.looks)) fail('looks must be an array')

  const p = c.palette as Collection['palette']
  for (const k of ['ground', 'ink', 'accent'] as const) if (!HEX.test(p?.[k] ?? '')) fail(`palette.${k} must be #RRGGBB`)
  const ratio = contrastRatio(p.ink, p.ground)
  if (ratio < 4.5) fail(`palette ink/ground contrast ${ratio.toFixed(2)} is below 4.5`)

  if (!MOMENTS.includes(c.moment as Moment)) fail(`moment must be one of ${MOMENTS.join(', ')}`)
  if ((c.moment === 'ring' || c.moment === 'orbit') && !c.carousel) fail(`moment ${c.moment} needs carousel settings`)
  if (c.moment === 'studio' && !Array.isArray(c.studio)) fail('moment studio needs studio folders')
  if (c.pageOrder !== 'confirmed' && c.pageOrder !== 'provisional') fail('pageOrder must be confirmed or provisional')
  return c as unknown as Collection
}

const DIR = path.join(process.cwd(), 'content/collections')

let cache: Collection[] | undefined
export function getCollections(): Collection[] {
  cache ??= fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))
      const m = getMedia(raw.slug)
      return parseCollection(raw, f, { shoot: m.shoot.map((i) => i.order), pages: m.pages.map((i) => i.order) })
    })
    .sort((a, b) => a.order - b.order)
  return cache
}

export function getFeatured(): Collection[] {
  const featured = getCollections().filter((c) => c.featured)
  if (featured.length > 4) throw new Error('More than 4 featured collections')
  return featured
}

export const getCollection = (slug: string) => getCollections().find((c) => c.slug === slug)
