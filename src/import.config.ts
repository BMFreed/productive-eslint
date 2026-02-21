import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import importPlugin from 'eslint-plugin-import'

/** Configuration overrides for eslint-plugin-import */
export const importConfig: TypedFlatConfigItem = {
  name: 'imports',
  plugins: { import: importPlugin },
  rules: {
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/export': 'error',
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
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-default': 'error',
    'import/no-namespace': 'error',
    'import/no-relative-packages': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
}
