import reactHooksPlugin from 'eslint-plugin-react-hooks'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { 'react-hooks': reactHooksPlugin },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Recommended: optional React Compiler readiness checks. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'react-hooks/config': 'error',
  'react-hooks/error-boundaries': 'error',
  'react-hooks/gating': 'error',
  'react-hooks/incompatible-library': 'warn',
  'react-hooks/preserve-manual-memoization': 'error',
  'react-hooks/static-components': 'error',
  'react-hooks/unsupported-syntax': 'warn',
  'react-hooks/use-memo': 'error',
}

/** React Compiler rules by preset. */
export const reactCompilerConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
