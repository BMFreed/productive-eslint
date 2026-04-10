import pluginNode from 'eslint-plugin-n'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { GLOB_SRC } from './utils/globs'
import { Preset } from './utils/presets'

const shared = {
  files: [GLOB_SRC],
  plugins: { n: pluginNode },
} satisfies Pick<TFlatConfigItem, 'files' | 'plugins'>

const recommendedRules: TFlatConfigItem['rules'] = {
  'n/no-exports-assign': 'error',
  'n/no-new-require': 'error',
  'n/no-path-concat': 'error',
  'n/prefer-global/buffer': ['error', 'never'],
  'n/prefer-global/process': ['error', 'never'],
}

/** Node rules by preset. */
export const nodeConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
  },
  [Preset.RECOMMENDED]: {
    rules: recommendedRules,
  },
}
