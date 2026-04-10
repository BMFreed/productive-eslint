import { defineConfig } from 'tsdown'

/**
 * Packages used by the productive plugin and shared with ESLint; keep external
 * to avoid bundling and version drift.
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
  deps: {
    neverBundle: externalDeps,
  },
  entry: {
    cli: './src/cli/index.ts',
    'index.config': './src/index.config.ts',
  },
  format: ['esm'],
  minify: true,
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.js',
  }),
  shims: false,
  target: 'node24',
})
