import pluginToml from 'eslint-plugin-toml'
import parserToml from 'toml-eslint-parser'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { GLOB_TOML } from './utils/globs'
import { Preset } from './utils/presets'

const shared = {
  files: [GLOB_TOML],
  languageOptions: { parser: parserToml },
  name: 'toml',
  plugins: { toml: pluginToml },
} satisfies Pick<
  TFlatConfigItem,
  'files' | 'languageOptions' | 'name' | 'plugins'
>

const autoFixableRules: TFlatConfigItem['rules'] = {
  'toml/array-bracket-newline': 'error',
  'toml/array-bracket-spacing': 'error',
  'toml/array-element-newline': 'error',
  'toml/comma-style': 'error',
  'toml/indent': ['error', 2],
  'toml/inline-table-curly-spacing': 'error',
  'toml/key-spacing': 'error',
  'toml/no-space-dots': 'error',
  'toml/padding-line-between-pairs': 'error',
  'toml/padding-line-between-tables': 'error',
  'toml/quoted-keys': 'error',
  'toml/table-bracket-spacing': 'error',
}

const recommendedRules: TFlatConfigItem['rules'] = {
  'toml/no-unreadable-number-separator': 'error',
  'toml/precision-of-fractional-seconds': 'error',
  'toml/precision-of-integer': 'error',
  'toml/vue-custom-block/no-parsing-error': 'error',
}

/** TOML rules by preset. */
export const tomlConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared, rules: autoFixableRules },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
