import pluginNode from 'eslint-plugin-n'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { GLOB_SRC } from './utils/globs'
import { StrictnessPreset } from './utils/strictness'

const shared = {
  files: [GLOB_SRC],
  plugins: { n: pluginNode }, // eslint-disable-line id-length -- plugin namespace
} satisfies Pick<TFlatConfigItem, 'files' | 'plugins'>

const easyRules: TFlatConfigItem['rules'] = {
  'n/handle-callback-err': ['error', '^(err|error)$'],
  'n/no-deprecated-api': 'error',
  'n/no-exports-assign': 'error',
  'n/no-new-require': 'error',
  'n/no-path-concat': 'error',
  'n/prefer-global/buffer': ['error', 'never'],
  'n/prefer-global/process': ['error', 'never'],
  'n/process-exit-as-throw': 'error',
}

/** Node rules by strictness preset. */
export const nodeConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: {},
}
