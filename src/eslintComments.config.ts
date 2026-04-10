import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { 'eslint-comments': eslintComments },
} satisfies Pick<TFlatConfigItem, 'plugins'>

const recommendedRules: TFlatConfigItem['rules'] = {
  'eslint-comments/no-aggregating-enable': 'error',
  'eslint-comments/no-duplicate-disable': 'error',
  'eslint-comments/no-unlimited-disable': 'error',
  'eslint-comments/no-unused-enable': 'error',
}

/** ESLint comments rules by preset. */
export const eslintCommentsConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
  },
  [Preset.RECOMMENDED]: {
    rules: recommendedRules,
  },
}
