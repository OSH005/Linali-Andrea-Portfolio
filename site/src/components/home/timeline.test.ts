import { HOME_SCENES, homeHeader, remap, sceneRanges, stepState } from './timeline'

test('the approved pacing: 13 500 units at a 900px viewport', () => {
  const r = sceneRanges(900)
  expect(r.total).toBe(13500)
  expect(r.at.mp).toEqual([1500, 2880])
  expect(r.steps.ln).toHaveLength(5)
  for (const [a, b] of r.steps.ln!) expect(b - a).toBeCloseTo(336)
  expect(HOME_SCENES.map(([n]) => n)).toEqual(['op', 'manif', 'open', 'mp', 'tear', 'rv', 'rise', 'ln', 'foam', 'dIn', 'strip', 'foot'])
})

test('scene lengths scale with the viewport height', () => {
  const r = sceneRanges(1800)
  expect(r.at.strip[1] - r.at.strip[0]).toBe(10800)
  expect(r.total).toBe(27000)
})

test('stepState: which sentence, how far it has risen', () => {
  const mp = sceneRanges(900).steps.mp!
  expect(stepState(1500, mp)).toMatchObject({ index: 0, k: 0 })
  expect(stepState(1500 + 345 * 0.3, mp).k).toBe(1)
  expect(stepState(1500 + 345, mp)).toMatchObject({ index: 1, k: 0 })
  expect(stepState(99999, mp).index).toBe(3)
})

test('remap keeps the visitor in the same scene at the same fraction after a resize', () => {
  const a = sceneRanges(900), b = sceneRanges(1366)
  const y = a.steps.ln![2][0] + 100 // 100 units into Lunelle's third sentence
  const z = remap(y, a, b)
  expect(stepState(z, b.steps.ln!).index).toBe(2)
  expect((z - b.at.ln[0]) / (b.at.ln[1] - b.at.ln[0])).toBeCloseTo((y - a.at.ln[0]) / (a.at.ln[1] - a.at.ln[0]))
  expect(remap(0, a, b)).toBe(0)
  expect(remap(a.total + 50, a, b)).toBe(b.total + 50) // past the stage: same distance into the contact card
})

test('header: chapter per scene, docks over the window opening, night over dark grounds', () => {
  const r = sceneRanges(900)
  const ch = (y: number) => homeHeader(y, r).chapter
  expect([0, r.at.open[1] - 1, r.at.mp[0], r.at.tear[0], r.at.rv[1] - 1, r.at.rise[0], r.at.ln[1] - 1, r.at.foam[0], r.at.strip[1] - 1, r.at.foot[0]].map(ch)).toEqual([0, 0, 1, 2, 2, 3, 3, 4, 4, 5])
  expect(homeHeader(0, r).dock).toBe(0)
  expect(homeHeader(r.at.open[0] + 300, r).dock).toBe(1)
  const dark = (y: number) => homeHeader(y, r).dark
  expect(dark(0)).toBe(false) // cream landing
  expect(dark(r.at.mp[0] + 1)).toBe(true) // charcoal
  expect(dark(r.steps.mp![2][1] - 1)).toBe(false) // cream step
  expect(dark(r.steps.mp![3][1] - 1)).toBe(true) // brown step
  expect(dark(r.at.rv[0] + 1)).toBe(false) // Revive is cream
  expect(dark(r.at.ln[0] + 1)).toBe(true) // Lunelle's night
  expect(dark(r.at.strip[0] + 1)).toBe(false)
  expect(dark(r.at.foot[1] - 1)).toBe(true) // the brown contact card
})
