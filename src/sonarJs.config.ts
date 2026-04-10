import sonarjs from 'eslint-plugin-sonarjs'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  name: 'sonarjs',
  plugins: { sonarjs },
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'sonarjs/prefer-immediate-return': 'error',
}

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'sonarjs/no-redundant-boolean': 'error',
  'sonarjs/no-redundant-jump': 'error',
  'sonarjs/non-existent-operator': 'error',
  'sonarjs/public-static-readonly': 'error',
}

/** SonarJS rules by preset. */
export const sonarJsConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
