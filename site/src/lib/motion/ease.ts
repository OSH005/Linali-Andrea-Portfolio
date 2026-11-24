export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const out3 = (t: number) => 1 - (1 - t) ** 3
export const out4 = (t: number) => 1 - (1 - t) ** 4
export const inOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
export const back = (t: number, c = 1.4) => 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
export const spring = (t: number) => (t <= 0 ? 0 : 1 - Math.exp(-5.5 * t) * Math.cos(9 * t))
export const outExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
