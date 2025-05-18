import type { TypedFlatConfigItem } from '@antfu/eslint-config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

export const importConfig: TypedFlatConfigItem = {
  settings: {
    'import-x/resolver-next': createTypeScriptImportResolver({
      alwaysTryTypes: true,
    }),
  },
  rules: {
    'import/export': 'error',
    'import/exports-last': 'error',
    'import/no-namespace': 'error',
    'import/no-commonjs': 'error',
    'import/no-relative-packages': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'error',
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-default-export': 'error',
    'import/order': [
      'error',
      {
        pathGroups: [
          { group: 'internal', position: 'after', pattern: '*/processes/**' },
          { group: 'internal', position: 'after', pattern: '*/pages/**' },
          { group: 'internal', position: 'after', pattern: '*/widgets/**' },
          { group: 'internal', position: 'after', pattern: '*/features/**' },
          { group: 'internal', position: 'after', pattern: '*/entities/**' },
          { group: 'internal', position: 'after', pattern: '*/shared/**' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
  },
}
