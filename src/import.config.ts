import importPlugin from 'eslint-plugin-import'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

const shared = {
  name: 'imports',
  plugins: { import: importPlugin },
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins' | 'settings'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'import/first': 'error',
  'import/newline-after-import': ['error', { count: 1 }],
  'import/no-empty-named-blocks': 'error',
}

/** Easy: remaining agent-friendly rules (no autofix). */
const easyRules: TFlatConfigItem['rules'] = {
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
  'import/no-commonjs': 'error',
  'import/no-duplicates': 'error',
  'import/no-mutable-exports': 'error',
  'import/no-named-default': 'error',
  'import/no-namespace': 'error',
  'import/no-relative-packages': 'error',
  'import/no-self-import': 'error',
  'import/no-useless-path-segments': 'error',
}

/** Medium: rest (not in easy). */
const mediumRules: TFlatConfigItem['rules'] = {
  'import/export': 'error',
  'import/no-cycle': 'error',
}

/** Import rules by strictness preset. */
export const importConfig: TStrictnessPresetMap = {
  [StrictnessPreset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [StrictnessPreset.EASY]: { rules: easyRules },
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: { rules: mediumRules },
}
