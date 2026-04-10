import pluginJsdoc from 'eslint-plugin-jsdoc'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  files: ['./src/**/*'],
  plugins: { jsdoc: pluginJsdoc },
} satisfies Pick<TFlatConfigItem, 'files' | 'plugins'>

/** JSDoc rules by preset. */
export const jsdocConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
  },
  [Preset.RECOMMENDED]: {},
}
