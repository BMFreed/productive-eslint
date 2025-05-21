import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import { productiveEslintPlugin } from './plugins/productive.plugin'

export const productiveConfig: TypedFlatConfigItem = {
  name: 'productive',
  plugins: {
    'productive-eslint': productiveEslintPlugin,
  },
  rules: {
    'productive-eslint/no-abusive-nested-if': ['error', 2],
    'productive-eslint/no-else': 'error',
    'productive-eslint/prefer-const-enum': 'error',
  },
}
