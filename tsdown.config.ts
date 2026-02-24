import { defineConfig } from 'tsdown'

/**
 * Packages used by our plugin (productive) and by @antfu/eslint-config; keep
 * external to avoid bundling and version drift.
 */
const externalDeps = [
  '@eslint-community/eslint-utils',
  '@typescript-eslint/scope-manager',
  '@typescript-eslint/types',
  '@typescript-eslint/utils',
  '@typescript-eslint/visitor-keys',
  'eslint-visitor-keys',
]

export default defineConfig({
  cjsDefault: false,
  entry: ['./src/index.config.ts'],
  external: externalDeps,
  format: ['esm'],
  minify: true,
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.js',
  }),
  shims: false,
})
