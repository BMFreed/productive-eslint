import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.config.ts'],
  format: ['esm'],
  minify: true,
  shims: false,
  cjsDefault: false,
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
})
