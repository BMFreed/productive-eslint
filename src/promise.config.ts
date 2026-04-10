import promise from 'eslint-plugin-promise'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  name: 'promise',
  plugins: { promise },
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'promise/no-new-statics': 'error',
}

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'promise/no-return-wrap': 'error',
  'promise/param-names': 'error',
  'promise/valid-params': 'error',
}

/** Promise rules by preset. */
export const promiseConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
