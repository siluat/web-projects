import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['src/features/**/*.ts'],
    },
    environment: 'happy-dom',
    globals: true,
  },
})
