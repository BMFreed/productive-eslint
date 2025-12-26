import { defineConfig } from 'tsdown'

export default defineConfig({
  cjsDefault: false,
  entry: ['./src/index.config.ts'],
  format: ['esm'],
  minify: true,
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.js',
  }),
  shims: false,
})
