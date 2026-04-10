import boundaries from 'eslint-plugin-boundaries'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  name: 'boundaries',
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { pattern: 'app', type: 'app' },
      { capture: ['page'], pattern: 'pages/*', type: 'pages' },
      { capture: ['widget'], pattern: 'widgets/*', type: 'widgets' },
      { capture: ['feature'], pattern: 'features/*', type: 'features' },
      { capture: ['entity'], pattern: 'entities/*', type: 'entities' },
      { capture: ['segment'], pattern: 'shared/*', type: 'shared' },
    ],
    'boundaries/include': ['src/**/*'],
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
    },
  },
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins' | 'settings'>

/** Boundaries setup by preset. Rules move to CLI architecture analysis. */
export const boundariesConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
  },
  [Preset.RECOMMENDED]: {},
}
