import { parseCollection, getCollections, getFeatured } from './collections'
import { getMedia } from './media'

const valid = {
  slug: 'drift',
  title: 'Drift',
  season: 'SS27',
  year: 2026,
  order: 3,
  featured: true,
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
  expect(getFeatured().map((c) => c.slug)).toEqual(['mano-padana', 'lunelle', 'drift', 'revive'])
})

test('real content: every shoot image has alt', () => {
  for (const c of getCollections()) for (const s of getMedia(c.slug).shoot) expect(c.alt[s.id]).toBeTruthy()
})
