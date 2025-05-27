import type { TypedFlatConfigItem } from '@antfu/eslint-config'

/** Configuration for Nuxt */
export const nuxtDisablesConfig: TypedFlatConfigItem = {
  files: [
    '**/components/*',
    '**/composables/*',
    '**/content/*',
    '**/layouts/*',
    '**/middleware/*',
    '**/modules/*',
    '**/pages/*',
    '**/plugins/*',
    '**/public/*',
    '**/server/*',
    '**/shared/*',
    '**/utils/*',
    '**/.env',
    '**/.nuxtignore',
    '**/.nuxtrc',
    '**/app.vue',
    '**/app.config.ts',
    '**/error.vue',
    '**/nuxt.config.ts',
  ],
  ignores: ['.nuxt/**', '.output/**'],
  name: 'nuxt',
  rules: {
    'import/no-default-export': ['off'],
  },
}
