import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import type { TStrictnessPresetMap } from './strictness'

import { productiveEslintPlugin } from './plugins/productive.plugin'
import { StrictnessPreset } from './strictness'

const shared = {
  name: 'productive',
  plugins: {
    productive: productiveEslintPlugin,
  },
} satisfies Pick<TypedFlatConfigItem, 'name' | 'plugins'>

/** Easy: productive rules excluded (research). */
const easyRules: TypedFlatConfigItem['rules'] = {}

/** Medium: empty (all productive rules are in hard). */
const mediumRules: TypedFlatConfigItem['rules'] = {}

/**
 * Hard: all productive rules (structural: nested if, no-else,
 * prefer-const-enum).
 */
const hardRules: TypedFlatConfigItem['rules'] = {
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
