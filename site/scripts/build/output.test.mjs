// Runs against the static export: npm run test:build (builds first).
import fs from 'node:fs'
import path from 'node:path'

const out = path.resolve(import.meta.dirname, '../../out')
const pages = ['index.html', 'work/index.html', 'work/drift/index.html', 'work/lunelle/index.html', 'work/mano-padana/index.html', 'work/revive/index.html']

test.each(pages)('%s exists', (p) => {
  expect(fs.existsSync(path.join(out, p))).toBe(true)
})

test.each(pages)('%s has no undefined class names (CSS modules compiled)', (p) => {
  const html = fs.readFileSync(path.join(out, p), 'utf8')
  expect(html).not.toMatch(/class="[^"]*\bundefined\b/)
})
