import pluginYaml from 'eslint-plugin-yml'
import parserYaml from 'yaml-eslint-parser'

import type { TFlatConfigItem } from './utils/strictness'

import { GLOB_YAML } from './utils/globs'

/** YAML config objects (not strictness-mapped, always active). */
export const yamlConfigs: TFlatConfigItem[] = [
  {
    name: 'yaml/setup',
    plugins: { yml: pluginYaml },
  },
  {
    files: [GLOB_YAML],
    languageOptions: { parser: parserYaml },
    name: 'yaml/rules',
    rules: {
      'yml/block-mapping': 'error',
      'yml/block-mapping-colon-indicator-newline': 'error',
      'yml/block-mapping-question-indicator-newline': 'error',
      'yml/block-sequence': 'error',
      'yml/block-sequence-hyphen-indicator-newline': 'error',
      'yml/flow-mapping-curly-newline': 'error',
      'yml/flow-mapping-curly-spacing': 'error',
      'yml/flow-sequence-bracket-newline': 'error',
      'yml/flow-sequence-bracket-spacing': 'error',
      'yml/indent': ['error', 2],
      'yml/key-spacing': 'error',
      'yml/no-empty-key': 'error',
      'yml/no-empty-sequence-entry': 'error',
      'yml/no-irregular-whitespace': 'error',
      'yml/no-tab-indent': 'error',
      'yml/plain-scalar': 'error',
      'yml/spaced-comment': 'error',
      'yml/vue-custom-block/no-parsing-error': 'error',
    },
  },
]
