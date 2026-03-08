import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

const shared = {
  plugins: { 'eslint-comments': eslintComments },
} satisfies Pick<TFlatConfigItem, 'plugins'>

const easyRules: TFlatConfigItem['rules'] = {
  'eslint-comments/no-aggregating-enable': 'error',
  'eslint-comments/no-duplicate-disable': 'error',
  'eslint-comments/no-unlimited-disable': 'error',
  'eslint-comments/no-unused-enable': 'error',
}

/** ESLint comments rules by strictness preset. */
export const eslintCommentsConfig: TStrictnessPresetMap = {
  [StrictnessPreset.AUTO_FIXABLE]: {
    ...shared,
  },
  [StrictnessPreset.EASY]: {
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: {},
}
