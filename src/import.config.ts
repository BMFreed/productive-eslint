import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

export const importConfig: TypedFlatConfigItem = {
  rules: {
    'import/export': 'error',
    'import/exports-last': 'error',
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
    'import/no-commonjs': 'error',
    'import/no-cycle': 'error',
    'import/no-default-export': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-namespace': 'error',
    'import/no-relative-packages': 'error',
    'import/no-useless-path-segments': 'error',
  },
  settings: {
    'import-x/resolver-next': createTypeScriptImportResolver({
      alwaysTryTypes: true,
    }),
  },
}
