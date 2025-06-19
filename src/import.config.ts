import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

/** Configuration overrides for eslint-plugin-import */
export const importConfig: TypedFlatConfigItem = {
  rules: {
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
