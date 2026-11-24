// Home copy excerpts and photo picks, verbatim from the approved mockup (spec 6, 11). Photos are media `order` numbers.

export const MANIFEST = 'I strongly believe that fashion is the best form of self expression.'
export const MP = ['Growing up in a society where mental health was an avoided subject, I realized the importance of communicating emotions.', 'මනෝ පාදන, “The Mind’s Steps”, portrays a mental healing journey through cultural aspects.', 'Initially inspired by the traditional art of Kandyan dance, I reflect my culture through design details.', 'Hand-crafted Dumbara fabrics have been utilized to add textural and cultural value to my collection.']
export const RV = ['Denim is one of the most wasted materials in fashion; worn, torn, and thrown away before its potential runs out.', 'This project asks what happens if we treat it the way SPAB treats old buildings: not restored to look new, but repaired and given new life.', 'Revive takes that same idea into denim reconstruction, to prove that discarded denim jeans have more life left in them.']
export const LN = ['Lunelle is a maternity collection based on functionality and empowerment, designed for the contemporary woman balancing work, life and motherhood.', 'My collection was inspired by the timeless beauty of the moon, the protection of Artemis: the Greek goddess of childbirth,', 'mother and child sculptures of Henry Moore and the curves of the pregnant body.', 'The stretch marks of her body are compared to the craters of the moon, which are considered symbols of imperfect beauty.', 'Lunelle is a tribute to all the unstoppable mothers!']
export const SP = ['Drift is a womenswear collection exploring the act of stepping away from social acceleration, the relentless pace that overwhelms people.', 'The concept was born from a personal experience, watching fabric move naturally in coastal wind,', 'and seeing in that movement the breath the body takes when it finally stops rushing.', 'My collection offers the feeling of a calming breath taken to escape the fast paced world.']

export const LABELS = { mp: 'SS25 · The Mind’s Steps', rv: 'SS27 · Denim reconstruction', ln: 'AW26 · Maternity', dr: 'Graduate collection', drift: 'Drift · SS27' }

/** Opening: three moodboard columns of inspiration photos (mockup `colSets`). */
export const MOOD_COLUMNS = [[1, 4, 6, 3], [5, 7, 1, 6], [3, 6, 4, 7]]
/** Mano Padana's window: shoot 1–4. */
export const MP_SHOTS = [1, 2, 3, 4]
/** Revive portfolio pages: the torn board and the pile under it. */
export const RV_BOARD = 30
export const RV_PILE = 34
/** Lunelle per step: [main photo, second photo] (shoot orders). */
export const LN_PAIRS: [number, number][] = [[1, 2], [9, 8], [4, 3], [5, 7], [10, 6]]
/** The foam that washes into Drift: inspiration 5. */
export const FOAM = 5
/** Drift looks in the client's order: the two shoot photos of each (= drift.json `looks[].shots`). */
export const LOOK_SHOTS: [number, number][] = [[7, 8], [3, 4], [11, 12], [1, 2], [6, 5], [9, 10]]

/** A photo: a Drift shoot order, or an inspiration photo. */
export type Ref = number | `insp${number}`
export type DeskItem =
  | { kind: 'img'; ref: Ref; id?: string; overlay?: number } // `overlay`: the SP sentence laid over the photo
  | { kind: 'text'; sp: number; id: string }
  | { kind: 'look'; look: number; id: string }
  | { kind: 'end'; id: 'end' }

/** Desktop strip (mockup `DSTRIP`): photos and text panels. Also the stacked (no-JS) order of Drift. */
export const DESK_STRIP: DeskItem[] = [
  { kind: 'img', ref: 13 },
  { kind: 'text', sp: 0, id: 'sp0' },
  { kind: 'img', ref: 14 },
  { kind: 'img', ref: 'insp6', id: 'sp1', overlay: 1 },
  { kind: 'img', ref: 5, id: 'sp2', overlay: 2 },
  { kind: 'text', sp: 3, id: 'sp3' },
  ...LOOK_SHOTS.flatMap(([a, b], i): DeskItem[] => [{ kind: 'look', look: i, id: `look${i}` }, { kind: 'img', ref: a }, { kind: 'img', ref: b }]),
  { kind: 'img', ref: 16 },
  { kind: 'img', ref: 17 },
  { kind: 'img', ref: 15 },
  { kind: 'end', id: 'end' },
]

/** Phone strip (mockup `PSTRIP`): photos only, each with the caption shown under the strip. */
export const PHONE_STRIP: [ref: Ref, caption: string][] = [
  [17, 'lead'], [14, 'sp0'], ['insp6', 'sp1'], [5, 'sp2'], [6, 'sp3'],
  ...LOOK_SHOTS.flatMap(([a, b], i): [Ref, string][] => [[a, `look${i}`], [b, `look${i}`]]),
  [16, 'end'], [13, 'end'], [15, 'end'],
]
