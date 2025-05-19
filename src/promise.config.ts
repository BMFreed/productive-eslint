import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import promise from 'eslint-plugin-promise'

export const promiseConfig: TypedFlatConfigItem = {
  name: 'promise',
  plugins: { promise },
  rules: {
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-multiple-resolved': 'error',
    'promise/no-nesting': 'error',
    'promise/no-new-statics': 'error',
    'promise/no-promise-in-callback': 'error',
    'promise/no-return-in-finally': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/prefer-await-to-then': 'error',
    'promise/valid-params': 'error',
  },
}
