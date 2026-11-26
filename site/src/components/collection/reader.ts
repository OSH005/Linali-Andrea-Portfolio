import type { MediaImage } from '@/lib/media'

export type ReaderPage = { image: MediaImage; half: -1 | 0 | 1; ar: number }

/** The pages as the reader shows them: below 1024 wide a double spread (w/h > 2) becomes its left and right pages. */
export function readerPages(pages: MediaImage[], narrow: boolean): ReaderPage[] {
  return pages.flatMap((image): ReaderPage[] => {
    const ar = image.width / image.height
    return narrow && ar > 2
      ? [{ image, half: 0, ar: ar / 2 }, { image, half: 1, ar: ar / 2 }]
      : [{ image, half: -1, ar }]
  })
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Where the zoomed page (w × h) sits in the screen (W × H): centred on an axis it fits, else panned by mx/my (0…1). */
export function zoomOffset({ W, H, w, h, mx, my }: { W: number; H: number; w: number; h: number; mx: number; my: number }) {
  // `|| 0`: no -0 at the left/top edge
  return { x: w > W ? (W - w) * clamp01(mx) || 0 : (W - w) / 2, y: h > H ? (H - h) * clamp01(my) || 0 : (H - h) / 2 }
}

/** The loupe's background: the page (w × h) magnified `zoom` times, with the point (rx, ry) in the middle of the circle. */
export function loupeStyle(rx: number, ry: number, w: number, h: number, zoom = 3, size = 220) {
  return {
    backgroundSize: `${w * zoom}px ${h * zoom}px`,
    backgroundPosition: `${size / 2 - rx * w * zoom}px ${size / 2 - ry * h * zoom}px`,
  }
}

/** The largest webp in an image's srcset (the loupe's file; zoom's fallback). */
export const largest = (im: MediaImage) => im.srcset.webp.split(', ').pop()!.split(' ')[0]
