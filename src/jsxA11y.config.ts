import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { 'jsx-a11y': jsxA11yPlugin },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Recommended: local JSX accessibility correctness rules. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-has-content': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-role': 'error',
  'jsx-a11y/role-has-required-aria-props': 'error',
  'jsx-a11y/role-supports-aria-props': 'error',
}

/** JSX a11y rules by preset. */
export const jsxA11yConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
