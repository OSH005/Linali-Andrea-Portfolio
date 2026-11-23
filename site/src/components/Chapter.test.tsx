import { render, screen } from '@testing-library/react'
import Chapter from './Chapter'
import StudioTable from './StudioTable'
import type { Collection, Moment } from '@/lib/collections'
import type { CollectionMedia, MediaImage } from '@/lib/media'

vi.mock('./ShootGallery', () => ({
  default: ({ preset, autoplay, initialView }: { preset: string; autoplay: string; initialView?: string }) => <div data-testid="gallery" data-preset={preset} data-autoplay={autoplay} data-view={initialView} />,
}))
vi.mock('./PortfolioReader', () => ({ default: () => <div data-testid="reader" /> }))
vi.mock('./glass-folder/GlassFolder', () => ({
  default: ({ label, files }: { label: string; files: unknown[] }) => <div data-testid="folder" data-label={label} data-files={files.length} />,
}))

const img = (id: string): MediaImage => ({ id, order: 1, width: 2400, height: 1697, placeholder: '', srcset: { avif: '', webp: '' }, src: `/${id}.webp`, zoom: `/${id}.webp` })
const media: CollectionMedia = { shoot: [img('01-a'), img('02-b')], pages: ['30', '32', '34', '36'].map(img) }
const base: Collection = {
  slug: 'x', title: 'X', season: 'SS27', year: 2026, order: 1, featured: true, concept: 'Concept.',
  palette: { ground: '#F2E8DA', ink: '#3B2418', accent: '#008794' }, moment: 'ring',
  carousel: { preset: 'cylinder', autoplay: 'drift' },
  studio: [{ label: 'Research', pages: ['30', '32'] }, { label: 'Fabric & detail', pages: ['34'] }, { label: 'Line-up', pages: ['36'] }],
  credits: {}, rights: { models: false, photographer: false, sensitive: 'none', confirmedBy: null },
  alt: { '01-a': 'A', '02-b': 'B' }, pageText: {}, pageOrder: 'confirmed',
}
const renderMoment = (moment: Moment, extra: Partial<Collection> = {}) =>
  render(<Chapter collection={{ ...base, moment, ...extra }} media={media} />)

test('ring renders the cylinder gallery', () => {
  renderMoment('ring')
  expect(screen.getByTestId('gallery').dataset.preset).toBe('cylinder')
})

test('orbit renders the orbit gallery', () => {
  renderMoment('orbit', { carousel: { preset: 'orbit', autoplay: 'drift' } })
  expect(screen.getByTestId('gallery').dataset.preset).toBe('orbit')
})

test('gallery renders a still grid', () => {
  renderMoment('gallery', { carousel: undefined })
  expect(screen.getByTestId('gallery').dataset.autoplay).toBe('off')
  expect(screen.getByTestId('gallery').dataset.view).toBe('grid')
})

test('walk renders every photo in order', () => {
  renderMoment('walk')
  expect(screen.getAllByRole('img').map((i) => i.getAttribute('alt'))).toEqual(['A', 'B'])
})

test('studio renders the table and says it is in progress', () => {
  renderMoment('studio')
  expect(screen.getAllByTestId('folder')).toHaveLength(3)
  expect(screen.getByText('In progress')).toBeInTheDocument()
})

test('Sinhala title is marked lang=si', () => {
  renderMoment('walk', { titleNative: 'මනෝ පාදන' })
  expect(screen.getByText('මනෝ පාදන')).toHaveAttribute('lang', 'si')
})

test('every chapter ends with the reader', () => {
  const { container } = renderMoment('ring')
  const section = container.querySelector('section')!
  expect(section.lastElementChild?.querySelector('[data-testid="reader"]')).not.toBeNull()
})

test('studio table makes one folder per group with its page count', () => {
  render(<StudioTable folders={base.studio!} pages={media.pages} palette={base.palette} />)
  const folders = screen.getAllByTestId('folder')
  expect(folders.map((f) => f.dataset.label)).toEqual(['Research', 'Fabric & detail', 'Line-up'])
  expect(folders[0].dataset.files).toBe('2')
})
