import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import importPlugin from 'eslint-plugin-import'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

const shared = {
  name: 'imports',
  plugins: { import: importPlugin },
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
} satisfies Pick<TypedFlatConfigItem, 'name' | 'plugins' | 'settings'>

/** Easy: core + optional. */
const easyRules: TypedFlatConfigItem['rules'] = {
  'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  'import/extensions': [
    'error',
    'ignorePackages',
    {
      js: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
    },
  ],
  'import/first': 'error',
  'import/newline-after-import': ['error', { count: 1 }],
  'import/no-commonjs': 'error',
  'import/no-duplicates': 'error',
  'import/no-empty-named-blocks': 'error',
  'import/no-mutable-exports': 'error',
  'import/no-named-default': 'error',
  'import/no-namespace': 'error',
  'import/no-relative-packages': 'error',
  'import/no-self-import': 'error',
  'import/no-useless-path-segments': 'error',
}

/** Medium: rest (not in easy). */
const mediumRules: TypedFlatConfigItem['rules'] = {
  'import/export': 'error',
  'import/no-cycle': 'error',
}

/** Import rules by strictness preset. */
export const importConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: {
    rules: mediumRules,
  },
}
