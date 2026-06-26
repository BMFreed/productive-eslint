import storybookPlugin from 'eslint-plugin-storybook'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { storybook: storybookPlugin },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Auto-fixable: Storybook rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'storybook/default-exports': 'error',
  'storybook/hierarchy-separator': 'error',
  'storybook/use-storybook-testing-library': 'error',
}

/** Recommended: non-autofixable Storybook structural checks. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'storybook/await-interactions': 'error',
  'storybook/context-in-play-function': 'error',
  'storybook/csf-component': 'error',
  'storybook/meta-inline-properties': 'error',
  'storybook/meta-satisfies-type': 'error',
  'storybook/no-redundant-story-name': 'error',
  'storybook/no-stories-of': 'error',
  'storybook/no-title-property-in-meta': 'error',
  'storybook/no-uninstalled-addons': 'error',
  'storybook/prefer-pascal-case': 'error',
  'storybook/story-exports': 'error',
  'storybook/use-storybook-expect': 'error',
}

/** Storybook rules by preset. */
export const storybookConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared, rules: autoFixableRules },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
