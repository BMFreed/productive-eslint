import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { productiveEslintPlugin } from './plugins/productive.plugin'
import { Preset } from './utils/presets'

const shared = {
  name: 'productive',
  plugins: {
    productive: productiveEslintPlugin,
  },
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins'>

/** Productive setup by preset. Structural rules move to CLI analysis. */
export const productiveConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
  },
  [Preset.RECOMMENDED]: {},
}
