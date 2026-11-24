// Runs against the static export: npm run test:build (builds first).
import fs from 'node:fs'
import path from 'node:path'

const out = path.resolve(import.meta.dirname, '../../out')
const pages = ['index.html', 'collections/index.html', ...['drift', 'lunelle', 'mano-padana', 'revive'].map((s) => `collections/${s}/index.html`), 'about/index.html']

test.each(pages)('%s exists', (p) => {
  expect(fs.existsSync(path.join(out, p))).toBe(true)
})

test.each(pages)('%s has no undefined class names (CSS modules compiled)', (p) => {
  const html = fs.readFileSync(path.join(out, p), 'utf8')
  expect(html).not.toMatch(/class="[^"]*\bundefined\b/)
})

test('/work redirects to /collections and no page links to /work', () => {
  expect(fs.readFileSync(path.join(out, '_redirects'), 'utf8')).toBe('/work/* /collections/:splat 301\n')
  for (const p of pages) expect(fs.readFileSync(path.join(out, p), 'utf8')).not.toContain('href="/work')
})

test('every image URL in the manifest exists in the export', () => {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../../src/generated/media-manifest.json'), 'utf8'))
  const urls = JSON.stringify(manifest).match(/\/media\/[^"\s,]+\.(?:webp|avif)/g)
  expect(urls.length).toBeGreaterThan(100)
  const missing = [...new Set(urls)].filter((u) => !fs.existsSync(path.join(out, u)))
  expect(missing).toEqual([])
})

test('index.html and its CSS carry the Phase 2 fonts and no Bodoni', () => {
  const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8')
  const css = fs.readdirSync(path.join(out, '_next/static'), { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith('.css'))
    .map((f) => fs.readFileSync(path.join(f.parentPath, f.name), 'utf8')).join('\n')
  for (const v of ['gloock', 'hanken', 'dm-mono', 'special-elite', 'noto-sinhala']) expect((html + css).includes(`--font-${v}`)).toBe(true)
  expect(/Bodoni/i.test(html + css)).toBe(false)
})

test.each(pages)('%s has the header pill and the contact card, nothing hidden inline', (p) => {
  const html = fs.readFileSync(path.join(out, p), 'utf8')
  expect(html).toMatch(/<nav[^>]*aria-label="Main"/)
  expect(html).toContain('href="#contact"')
  expect(html.match(/<footer[^>]*id="contact"/g)).toHaveLength(1)
  expect(html).not.toMatch(/style="[^"]*(opacity:\s*0[;"]|visibility:\s*hidden)/)
})
