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
        test: { name: 'node', environment: 'node', include: ['scripts/**/*.test.mjs'], testTimeout: 60_000 },
      },
    ],
  },
})
