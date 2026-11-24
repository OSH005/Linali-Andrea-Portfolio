// Pure pieces of the header: the fabric outline, headroom and the sewing stitch.

/** A pill whose long edges ripple like fabric; `inset` insets it (the stitch runs 4px inside the edge). */
export function fabricPath(w: number, h: number, inset: number, amp: number, phase: number): string {
  const r = h / 2 - inset
  const n = Math.max(8, Math.round(w / 12))
  const ed = (i: number, bot = false) => {
    const t = i / n
    const env = Math.sin(Math.PI * t)
    return `${(h / 2 + (w - h) * t).toFixed(1)} ${((bot ? h - inset : inset) + amp * env * Math.sin(t * 8.5 + phase + (bot ? 1.3 : 0))).toFixed(2)}`
  }
  let d = `M${ed(0)}`
  for (let i = 1; i <= n; i++) d += ` L${ed(i)}`
  d += ` A${r} ${r} 0 0 1 ${ed(n, true)}`
  for (let i = n - 1; i >= 0; i--) d += ` L${ed(i, true)}`
  return d + ` A${r} ${r} 0 0 1 ${ed(0)} Z`
}

/** Headroom: hides while scrolling down past the landing, returns on any scroll up or near the top. */
export function nextHidden(prev: boolean, s: { y: number; v: number; docked: boolean; keep?: number }): boolean {
  if (!s.docked || s.y < (s.keep ?? 160)) return false
  if (s.v > 140) return true
  if (s.v < -50) return false
  return prev
}

/** Dash array for a path with pathLength 100: `sewn` (0–1) of `n` stitches drawn, the rest a gap. */
export function stitchDash(sewn: number, n = 120): string {
  const k = Math.round(sewn * n)
  if (k >= n) return '.5 .3333'
  return k ? Array(k).fill('.5 .3333').join(' ') + ' 0 100' : '0 100'
}
