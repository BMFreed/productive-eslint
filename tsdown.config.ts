import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.config.ts'],
  format: ['esm'],
  minify: true,
  shims: true,
})
