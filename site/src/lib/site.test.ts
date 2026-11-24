import { parseSite, getSite } from './site'

test('site.json is first person and complete', () => {
  const s = getSite()
  expect(s.role).toBe('Fashion designer')
  expect(s.bio.startsWith('I’m a fashion designer from Panadura, Sri Lanka')).toBe(true)
  expect(s.contact.closing).toBe('Let’s make something together.')
  expect(s.facts.map((f) => f.label)).toEqual(['Studying', 'Experience', 'Recognition'])
  expect(s.skills.map((g) => [g.name, g.piece, g.skills.length])).toEqual([['Craft', 'bodice', 4], ['Design', 'skirt', 4], ['Tools', 'sleeve', 4], ['People', 'pocket', 4]])
  expect(s.portrait).toEqual({ figure: 'her-flush', polaroids: ['mirror-graded', 'chair-graded', 'beach-graded'] })
})

test('rejects a bio in the third person and contact details', () => {
  const s = structuredClone(getSite())
  expect(() => parseSite({ ...s, bio: 'Linali Andrea is a designer.' })).toThrow('bio must be first person')
  expect(() => parseSite({ ...s, bio: s.bio + ' Call +94 76 903 6230.' })).toThrow('no phone numbers or emails')
})
