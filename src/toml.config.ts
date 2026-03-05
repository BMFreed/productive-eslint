import pluginToml from 'eslint-plugin-toml'
import parserToml from 'toml-eslint-parser'

import type { TFlatConfigItem } from './utils/strictness'

import { GLOB_TOML } from './utils/globs'

/** TOML config objects (not strictness-mapped, always active). */
export const tomlConfigs: TFlatConfigItem[] = [
  {
    name: 'toml/setup',
    plugins: { toml: pluginToml },
  },
  {
    files: [GLOB_TOML],
    languageOptions: { parser: parserToml },
    name: 'toml/rules',
    rules: {
      'toml/array-bracket-newline': 'error',
      'toml/array-bracket-spacing': 'error',
      'toml/array-element-newline': 'error',
      'toml/comma-style': 'error',
      'toml/indent': ['error', 2],
      'toml/inline-table-curly-spacing': 'error',
      'toml/key-spacing': 'error',
      'toml/keys-order': 'error',
      'toml/no-space-dots': 'error',
      'toml/no-unreadable-number-separator': 'error',
      'toml/padding-line-between-pairs': 'error',
      'toml/padding-line-between-tables': 'error',
      'toml/precision-of-fractional-seconds': 'error',
      'toml/precision-of-integer': 'error',
      'toml/quoted-keys': 'error',
      'toml/table-bracket-spacing': 'error',
      'toml/tables-order': 'error',
      'toml/vue-custom-block/no-parsing-error': 'error',
    },
  },
]
