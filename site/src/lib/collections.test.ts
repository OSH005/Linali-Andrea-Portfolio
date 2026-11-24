import { parseCollection, getCollection, getCollections, getFeatured } from './collections'
import { getMedia } from './media'

const valid = {
  slug: 'drift',
  title: 'Drift',
  season: 'SS27',
  year: 2026,
  order: 3,
  featured: true,
  line: 'A line.',
  theme: 'Nature',
  lead: { from: 'shoot', desktop: [1], phone: 1 },
  concept: 'A collection.',
  palette: { ground: '#F2E8DA', ink: '#3B2418', accent: '#008794' },
  moment: 'ring',
  carousel: { preset: 'cylinder', autoplay: 'drift', speed: 8 },
  credits: {},
  rights: { models: false, photographer: false, sensitive: 'none', confirmedBy: null },
  alt: {},
  pageText: {},
  pageOrder: 'confirmed',
}

test('parses a valid collection', () => {
  expect(parseCollection(valid, 'v.json').slug).toBe('drift')
})

test('names the missing field', () => {
  expect(() => parseCollection({ ...valid, title: undefined }, 'v.json')).toThrow('v.json: title')
})

test('rejects unreadable palette', () => {
  expect(() =>
    parseCollection({ ...valid, palette: { ground: '#F2E8DA', ink: '#008794', accent: '#000000' } }, 'v.json'),
  ).toThrow('contrast')
})

test('ring needs carousel settings', () => {
  expect(() => parseCollection({ ...valid, carousel: undefined }, 'v.json')).toThrow('carousel')
})

test('studio needs folders', () => {
  expect(() => parseCollection({ ...valid, moment: 'studio', studio: undefined }, 'v.json')).toThrow('studio')
})

test('real content: four featured, in story order', () => {
  expect(getFeatured().map((c) => c.slug)).toEqual(['mano-padana', 'revive', 'lunelle', 'drift'])
})

test('journey order, lines, themes, leads', () => {
  expect(getCollections().map((c) => [c.slug, c.theme])).toEqual([['mano-padana', 'Mind'], ['revive', 'Renewal'], ['lunelle', 'Body'], ['drift', 'Nature']])
  expect(getCollection('drift')!.lead).toEqual({ from: 'shoot', desktop: [13, 14, 7, 3], phone: 17 })
  expect(getCollection('revive')!.lead).toEqual({ from: 'pages', desktop: [30], phone: 34 })
  expect(getCollection('drift')!.looks!.map((l) => l.shots)).toEqual([[7, 8], [3, 4], [11, 12], [1, 2], [6, 5], [9, 10]])
  expect(getCollections().every((c) => c.rights.models && c.rights.confirmedBy === 'user, 2026-11-24, chat')).toBe(true)
})

test('a lead number must exist in the collection media', () => {
  expect(() => parseCollection({ ...valid, lead: { from: 'shoot', desktop: [99], phone: 1 } }, 'x.json', { shoot: [1, 2], pages: [] })).toThrow('lead 99 is not in shoot')
})

test('rejects a bad theme', () => {
  expect(() => parseCollection({ ...valid, theme: 'Sky' }, 'x.json')).toThrow('theme')
})

test('real content: every shoot image has alt', () => {
  for (const c of getCollections()) for (const s of getMedia(c.slug).shoot) expect(c.alt[s.id]).toBeTruthy()
})
