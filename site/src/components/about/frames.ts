import { clamp01 } from '@/lib/motion/ease'

/**
 * Which image frame `f` shows at time `t` (seconds) out of `n`: it turns every `period`, frames staggered by `stagger`,
 * stepping 3 images each turn from 2f. `k` is the wipe's progress (0 → 1 over the first 0.9s of the turn).
 */
export function frameImage(f: number, t: number, n: number, period = 3.2, stagger = 0.6) {
  const u = t - f * stagger, turn = Math.floor(u / period), mod = (i: number) => ((i % n) + n) % n
  return { cur: mod(2 * f + 3 * turn), prev: mod(2 * f + 3 * (turn - 1)), k: clamp01((u - turn * period) / 0.9) }
}
