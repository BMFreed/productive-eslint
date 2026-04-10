import cssPlugin from '@eslint/css'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { css: cssPlugin },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Recommended: mechanical CSS validity rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'css/no-duplicate-imports': 'error',
  'css/no-duplicate-keyframe-selectors': 'error',
  'css/no-empty-blocks': 'error',
  'css/no-invalid-at-rule-placement': 'error',
  'css/no-invalid-at-rules': 'error',
  'css/no-invalid-named-grid-areas': 'error',
  'css/no-invalid-properties': 'error',
}

/** CSS rules by preset. */
export const cssConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
  },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
