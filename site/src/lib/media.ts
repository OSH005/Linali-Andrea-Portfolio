import manifest from '@/generated/media-manifest.json'

export interface MediaImage {
  id: string
  order: number
  width: number
  height: number
  placeholder: string
  srcset: { avif: string; webp: string }
  src: string
  zoom: string
}

export interface CollectionMedia {
  shoot: MediaImage[]
  pages: MediaImage[]
  cover?: MediaImage
  logo?: MediaImage
}

interface Manifest {
  collections: Record<string, CollectionMedia>
  personal: Record<string, MediaImage>
  brand: { monogram: MediaImage }
}

const m = manifest as Manifest

export function getMedia(slug: string): CollectionMedia {
  const c = m.collections[slug]
  if (!c) throw new Error(`No media for "${slug}". Run: npm run media -- ${slug}`)
  return c
}

export function getPersonal(name: string): MediaImage {
  const p = m.personal[name]
  if (!p) throw new Error(`No personal image "${name}". Run: npm run media -- --all`)
  return p
}

export const getBrand = () => m.brand
