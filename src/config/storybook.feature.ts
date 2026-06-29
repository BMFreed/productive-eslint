import type { TFlatConfigItem } from '../utils/presets'

import { storybookConfig } from '../storybook.config'
import {
  GLOB_STORYBOOK_CONFIG,
  GLOB_STORYBOOK_STORY_FILES,
} from '../utils/globs'
import { mergePresetConfigs, Preset } from '../utils/presets'

const STORYBOOK_CONFIG_RULES = {
  'storybook/no-uninstalled-addons': 'error',
} as const satisfies NonNullable<TFlatConfigItem['rules']>

export const buildStorybookConfigs = (preset: Preset): TFlatConfigItem[] => {
  const storyRulesConfig = mergePresetConfigs(storybookConfig, preset)
  const { plugins } = storyRulesConfig

  if (!plugins) {
    throw new Error('Storybook config must register the Storybook ESLint plugin.')
  }

  return [
    {
      files: [...GLOB_STORYBOOK_STORY_FILES],
      name: 'storybook/rules',
      ...storyRulesConfig,
    },
    {
      files: [GLOB_STORYBOOK_CONFIG],
      name: 'storybook/config-rules',
      plugins,
      rules: STORYBOOK_CONFIG_RULES,
    },
  ]
}
