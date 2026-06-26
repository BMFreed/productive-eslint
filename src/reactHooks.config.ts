import type { Linter } from 'eslint'

import reactHooksPlugin from 'eslint-plugin-react-hooks'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { 'react-hooks': reactHooksPlugin },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'react-hooks/rules-of-hooks': 'error',
}

/** CLI: dependency drift review rules for `productive-eslint analyze react`. */
export const reactHooksCliRules = {
  'react-hooks/exhaustive-deps': 'error',
  'react-hooks/globals': 'error',
  'react-hooks/immutability': 'error',
  'react-hooks/purity': 'error',
  'react-hooks/refs': 'error',
  'react-hooks/set-state-in-effect': 'error',
  'react-hooks/set-state-in-render': 'error',
  'react-hooks/void-use-memo': 'error',
} as const satisfies Linter.RulesRecord

/** React Hooks rules by preset. */
export const reactHooksConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
