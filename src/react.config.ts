import type { Linter } from 'eslint'

import reactPlugin from 'eslint-plugin-react'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { react: reactPlugin },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'react/jsx-boolean-value': ['error', 'never'],
  'react/jsx-curly-brace-presence': [
    'error',
    {
      children: 'never',
      props: 'never',
    },
  ],
  'react/jsx-fragments': ['error', 'syntax'],
  'react/jsx-no-target-blank': 'error',
  'react/self-closing-comp': 'error',
}

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'react/button-has-type': 'error',
  'react/iframe-missing-sandbox': 'error',
  'react/jsx-key': 'error',
  'react/jsx-no-comment-textnodes': 'error',
  'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],
  'react/jsx-no-target-blank': 'error',
  'react/jsx-pascal-case': 'error',
  'react/no-children-prop': 'error',
  'react/no-danger-with-children': 'error',
  'react/no-deprecated': 'error',
  'react/no-invalid-html-attribute': 'error',
  'react/style-prop-object': 'error',
  'react/void-dom-elements-no-children': 'error',
}

/** CLI: stronger React review rules for `productive-eslint analyze react`. */
export const reactCliRules = {
  'react/jsx-no-script-url': 'error',
  'react/no-array-index-key': 'error',
  'react/no-adjacent-inline-elements': 'error',
  'react/no-danger': 'error',
} as const satisfies Linter.RulesRecord

/** React rules by preset. */
export const reactConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared, rules: autoFixableRules },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
