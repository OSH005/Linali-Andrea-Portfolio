/** The largest type size (stepping down from `start`) at which nothing overflows; never below `min`. */
export function fitFontSize(overflows: (px: number) => boolean, start = 15, min = 12, step = 0.5): number {
  let px = start
  while (px > min && overflows(px)) px -= step
  return px
}
