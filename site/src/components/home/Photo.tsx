import type { Pic } from './data'

/** One manifest photo: AVIF with a WebP fallback, sized to the slot. */
export default function Photo({ p, sizes, className, eager }: { p: Pic; sizes: string; className?: string; eager?: boolean }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={p.srcset.avif} sizes={sizes} />
      <img src={p.src} srcSet={p.srcset.webp} sizes={sizes} alt={p.alt} width={p.width} height={p.height} loading={eager ? undefined : 'lazy'} />
    </picture>
  )
}
