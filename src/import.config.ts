import importPlugin from 'eslint-plugin-import'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

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

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
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
  'import/no-duplicates': 'error',
  'import/no-named-default': 'error',
  'import/no-self-import': 'error',
  'import/no-useless-path-segments': 'error',
}

/** Import rules by preset. */
export const importConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
