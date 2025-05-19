import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.config.ts'],
  format: ['esm'],
  shims: true,
})
