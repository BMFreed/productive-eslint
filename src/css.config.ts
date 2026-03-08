import cssPlugin from '@eslint/css'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

const shared = {
  plugins: { css: cssPlugin },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Medium: all CSS rules. */
const mediumRules: TFlatConfigItem['rules'] = {
  'css/font-family-fallbacks': 'error',
  'css/no-duplicate-imports': 'error',
  'css/no-duplicate-keyframe-selectors': 'error',
  'css/no-empty-blocks': 'error',
  'css/no-important': 'error',
  'css/no-invalid-at-rule-placement': 'error',
  'css/no-invalid-at-rules': 'error',
  'css/no-invalid-named-grid-areas': 'error',
  'css/no-invalid-properties': 'error',
  'css/no-unmatchable-selectors': 'error',
  'css/use-baseline': 'error',
}

/** CSS rules by strictness preset. */
export const cssConfig: TStrictnessPresetMap = {
  [StrictnessPreset.AUTO_FIXABLE]: {
    ...shared,
  },
  [StrictnessPreset.EASY]: {},
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: { rules: mediumRules },
}
