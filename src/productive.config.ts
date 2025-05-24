import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import { productiveEslintPlugin } from './plugins/productive.plugin'

/** Configuration for eslint-plugin-productive */
export const productiveConfig: TypedFlatConfigItem = {
  name: 'productive',
  plugins: {
    productive: productiveEslintPlugin,
  },
  rules: {
    'productive/no-abusive-nested-if': ['error', 2],
    'productive/no-else': 'error',
    'productive/prefer-const-enum': 'error',
  },
}
