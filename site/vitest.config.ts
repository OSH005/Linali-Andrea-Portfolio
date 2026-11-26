import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: { name: 'ui', environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'], setupFiles: ['./vitest.setup.ts'] },
      },
      {
        extends: true,
        test: { name: 'node', environment: 'node', include: ['scripts/media/**/*.test.mjs'], testTimeout: 60_000 },
      },
      {
        extends: true,
        test: { name: 'build', environment: 'node', include: ['scripts/build/**/*.test.mjs'] },
      },
      {
        extends: true,
        test: { name: 'browser', environment: 'node', include: ['scripts/browser/**/*.test.mjs'], testTimeout: 120_000, hookTimeout: 120_000 },
      },
    ],
  },
})
