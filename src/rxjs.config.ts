import rxjs from '@smarttools/eslint-plugin-rxjs'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { GLOB_SRC } from './utils/globs'
import { Preset } from './utils/presets'

const shared = {
  files: [GLOB_SRC],
  name: 'rxjs',
  plugins: { rxjs },
} satisfies Pick<TFlatConfigItem, 'files' | 'name' | 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'rxjs/no-implicit-any-catch': 'error',
  'rxjs/no-internal': 'error',
  'rxjs/prefer-observer': 'error',
}

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'rxjs/no-compat': 'error',
  'rxjs/no-create': 'error',
  'rxjs/no-index': 'error',
}

/** RxJS rules by preset. */
export const rxjsConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
