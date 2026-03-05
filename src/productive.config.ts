import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { productiveEslintPlugin } from './plugins/productive.plugin'
import { StrictnessPreset } from './utils/strictness'

const shared = {
  name: 'productive',
  plugins: {
    productive: productiveEslintPlugin,
  },
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins'>

/** Easy: productive rules excluded (research). */
const easyRules: TFlatConfigItem['rules'] = {}

/** Medium: empty (all productive rules are in hard). */
const mediumRules: TFlatConfigItem['rules'] = {}

/**
 * Hard: all productive rules (structural: nested if, no-else,
 * prefer-const-enum).
 */
const hardRules: TFlatConfigItem['rules'] = {
  'productive/no-abusive-nested-if': ['error', 2],
  'productive/no-else': 'error',
  'productive/prefer-const-enum': 'off',
}

/** Productive rules by strictness preset. */
export const productiveConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: {
    rules: mediumRules,
  },
}
