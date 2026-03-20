import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['../tests/api/**/*.test.ts', '../tests/api/**/*.spec.ts'],
    exclude: ['../tests/tests/**', '**/node_modules/**', '**/.git/**'],
  },
})