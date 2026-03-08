import promise from 'eslint-plugin-promise'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

const shared = {
  name: 'promise',
  plugins: { promise },
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'promise/no-new-statics': 'error',
}

/** Easy: remaining agent-friendly rules (no autofix). */
const easyRules: TFlatConfigItem['rules'] = {
  'promise/always-return': 'error',
  'promise/catch-or-return': 'error',
  'promise/no-multiple-resolved': 'error',
  'promise/no-return-in-finally': 'error',
  'promise/no-return-wrap': 'error',
  'promise/param-names': 'error',
  'promise/valid-params': 'error',
}

/** Medium: rest. */
const mediumRules: TFlatConfigItem['rules'] = {
  'promise/prefer-await-to-then': 'error',
}

/** Hard: structural promise flow. */
const hardRules: TFlatConfigItem['rules'] = {
  'promise/no-nesting': 'error',
  'promise/no-promise-in-callback': 'error',
}

/** Promise rules by strictness preset. */
export const promiseConfig: TStrictnessPresetMap = {
  [StrictnessPreset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [StrictnessPreset.EASY]: { rules: easyRules },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: {
    rules: mediumRules,
  },
}
