export const GLOB_SRC_EXT = '@(ts|tsx|mts)'
export const GLOB_SRC = `**/*.${GLOB_SRC_EXT}`
export const GLOB_TS = '**/*.@(ts|mts)'
export const GLOB_TSX = '**/*.tsx'
export const GLOB_VUE = '**/*.vue'

export const GLOB_JSON = '**/*.json'
export const GLOB_JSON5 = '**/*.json5'
export const GLOB_JSONC = '**/*.jsonc'
export const GLOB_YAML = '**/*.y?(a)ml'
export const GLOB_TOML = '**/*.toml'
export const GLOB_CSS = '**/*.css'

export const GLOB_TESTS = [
  `**/__tests__/**/*.${GLOB_SRC_EXT}`,
  `**/*.spec.${GLOB_SRC_EXT}`,
  `**/*.test.${GLOB_SRC_EXT}`,
  `**/*.bench.${GLOB_SRC_EXT}`,
  `**/*.benchmark.${GLOB_SRC_EXT}`,
]

export const GLOB_EXCLUDE = [
  '**/node_modules',
  '**/dist',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/bun.lockb',
  '**/output',
  '**/coverage',
  '**/temp',
  '**/tmp',
  '**/.temp',
  '**/.tmp',
  '**/.history',
  '**/.vitepress/cache',
  '**/.nuxt',
  '**/.next',
  '**/.svelte-kit',
  '**/.vercel',
  '**/.changeset',
  '**/.idea',
  '**/.cache',
  '**/.output',
  '**/.vite-inspect',
  '**/.yarn',
  '**/*.min.*',
  '**/LICENSE*',
  '**/__snapshots__',
  '**/auto-import?(s).d.ts',
  '**/components.d.ts',
  //https://github.com/typescript-eslint/typescript-eslint/issues/1350
  '**/*.d.ts',
]
