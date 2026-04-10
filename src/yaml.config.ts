import pluginYaml from 'eslint-plugin-yml'
import parserYaml from 'yaml-eslint-parser'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { GLOB_YAML } from './utils/globs'
import { Preset } from './utils/presets'

const shared = {
  files: [GLOB_YAML],
  languageOptions: { parser: parserYaml },
  name: 'yaml',
  plugins: { yml: pluginYaml },
} satisfies Pick<
  TFlatConfigItem,
  'files' | 'languageOptions' | 'name' | 'plugins'
>

const autoFixableRules: TFlatConfigItem['rules'] = {
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
  'yml/plain-scalar': 'error',
  'yml/spaced-comment': 'error',
}

const recommendedRules: TFlatConfigItem['rules'] = {
  'yml/no-empty-key': 'error',
  'yml/no-empty-sequence-entry': 'error',
  'yml/no-irregular-whitespace': 'error',
  'yml/no-tab-indent': 'error',
  'yml/vue-custom-block/no-parsing-error': 'error',
}

/** YAML rules by preset. */
export const yamlConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared, rules: autoFixableRules },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
