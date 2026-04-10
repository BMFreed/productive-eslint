import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { architectureSetupConfig } from './architecture/model'
import { Preset } from './utils/presets'

const shared = architectureSetupConfig satisfies Pick<
  TFlatConfigItem,
  'name' | 'plugins' | 'settings'
>

/** Boundaries setup by preset. Rules move to CLI architecture analysis. */
export const boundariesConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
  },
  [Preset.RECOMMENDED]: {},
}
