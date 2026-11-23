// Server-only: reads content/collections/*.json at build time.
import fs from 'node:fs'
import path from 'node:path'
import { contrastRatio } from './contrast'

export type Moment = 'ring' | 'orbit' | 'walk' | 'studio' | 'gallery'
const MOMENTS: Moment[] = ['ring', 'orbit', 'walk', 'studio', 'gallery']

export interface Collection {
  slug: string
  title: string
  titleNative?: string
  season: string
  year: number
  order: number
  featured: boolean
  concept: string
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

export function parseCollection(raw: unknown, file: string): Collection {
  const c = raw as Record<string, unknown>
  const fail = (msg: string): never => {
    throw new Error(`${file}: ${msg}`)
  }
  const need = (key: string, type: string) => {
    if (typeof c?.[key] !== type) fail(`${key} must be a ${type}`)
  }
  for (const k of ['slug', 'title', 'season', 'concept']) need(k, 'string')
  for (const k of ['year', 'order']) need(k, 'number')
  need('featured', 'boolean')
  for (const k of ['palette', 'credits', 'rights', 'alt', 'pageText']) need(k, 'object')

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
    .map((f) => parseCollection(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')), f))
    .sort((a, b) => a.order - b.order)
  return cache
}

export function getFeatured(): Collection[] {
  const featured = getCollections().filter((c) => c.featured)
  if (featured.length > 4) throw new Error('More than 4 featured collections')
  return featured
}

export const getCollection = (slug: string) => getCollections().find((c) => c.slug === slug)
