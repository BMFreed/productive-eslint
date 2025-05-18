import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.config.ts'],
  shims: true,
  format: ['esm'],
})
