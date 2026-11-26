// Server-only: reads content/site.json at build time.
import fs from 'node:fs'
import path from 'node:path'

export interface Site {
  name: string
  role: 'Fashion designer'
  location: 'Panadura, Sri Lanka'
  tagline: string
  manifesto: string
  bio: string
  facts: { label: string; title: string; detail: string }[]
  links: { linkedin: string }
  skills: { name: 'Craft' | 'Design' | 'Tools' | 'People'; piece: 'bodice' | 'skirt' | 'sleeve' | 'pocket'; cut: string; skills: string[] }[]
  portrait: { figure: string; polaroids: string[] }
  personalAlt: Record<string, string>
  /** Alt text for the inspiration photos, in their order (1…7). */
  inspirationAlt: string[]
  contact: { endpointEnv: string; closing: string }
}

const CONTACT = /\+?\d[\d\s-]{7,}|@/

export function parseSite(raw: unknown, file = 'site.json'): Site {
  const s = raw as Record<string, any>
  const fail = (msg: string): never => {
    throw new Error(`${file}: ${msg}`)
  }
  for (const k of ['name', 'role', 'location', 'tagline', 'manifesto', 'bio']) if (typeof s?.[k] !== 'string') fail(`${k} must be a string`)
  for (const k of ['facts', 'skills', 'inspirationAlt']) if (!Array.isArray(s[k])) fail(`${k} must be an array`)
  for (const k of ['links', 'portrait', 'personalAlt', 'contact']) if (typeof s[k] !== 'object' || !s[k]) fail(`${k} must be an object`)
  if (s.role !== 'Fashion designer') fail('role must be Fashion designer')
  if (!/^I\b/.test(s.bio) || /Linali Andrea is| she /.test(s.bio)) fail('bio must be first person')
  if (CONTACT.test(s.bio) || s.facts.some((f: object) => CONTACT.test(Object.values(f).join(' ')))) fail('no phone numbers or emails in bio or facts')
  if (!Array.isArray(s.portrait.polaroids)) fail('portrait.polaroids must be an array')
  for (const n of [s.portrait.figure, ...s.portrait.polaroids]) if (!s.personalAlt[n]) fail(`personalAlt is missing "${n}"`)
  return s as Site
}

let cache: Site | undefined
export function getSite(): Site {
  cache ??= parseSite(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/site.json'), 'utf8')))
  return cache
}
