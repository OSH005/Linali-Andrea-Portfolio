// Usage: npm run media -- <slug> | --all
// Reads media-src/, writes public/media/ and src/generated/media-manifest.json.
// MEDIA_BASE_URL (e.g. https://media.example.com) prefixes every URL; default is same-origin.
import fs from 'node:fs'
import path from 'node:path'
import { buildCollection, buildPersonal, buildImage } from './lib.mjs'

const site = path.resolve(import.meta.dirname, '../..')
const mediaSrc = path.resolve(site, '../media-src')
const outRoot = path.join(site, 'public')
const manifestPath = path.join(site, 'src/generated/media-manifest.json')
const urlPrefix = process.env.MEDIA_BASE_URL ?? ''

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: npm run media -- <slug> | --all')
  process.exit(1)
}

const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : { collections: {}, personal: {}, brand: {} }

const slugs = arg === '--all' ? fs.readdirSync(path.join(mediaSrc, 'collections')) : [arg]
for (const slug of slugs) {
  const json = path.join(site, 'content/collections', `${slug}.json`)
  if (!fs.existsSync(json)) throw new Error(`No collection file: content/collections/${slug}.json`)
  const { alt } = JSON.parse(fs.readFileSync(json, 'utf8'))
  fs.rmSync(path.join(outRoot, 'media', slug), { recursive: true, force: true })
  const m = await buildCollection(slug, { srcRoot: path.join(mediaSrc, 'collections'), outRoot, urlPrefix, alt })
  manifest.collections[slug] = m
  console.log(`${slug}: ${m.shoot.length} photos, ${m.pages.length} pages${m.cover ? ', cover' : ''}${m.logo ? ', logo' : ''}`)
}

if (arg === '--all') {
  for (const dir of ['personal', 'brand']) fs.rmSync(path.join(outRoot, 'media', dir), { recursive: true, force: true })
  manifest.personal = await buildPersonal({ srcRoot: mediaSrc, outRoot, urlPrefix })
  manifest.brand = {
    monogram: await buildImage(path.join(mediaSrc, 'brand/monogram.png'), { outRoot, urlPrefix, folder: 'brand', id: 'monogram', order: 0 }),
  }
  console.log(`personal: ${Object.keys(manifest.personal).length} images, brand: monogram`)
}

fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
