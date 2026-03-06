import type { TFlatConfigItem } from './utils/strictness'

import { GLOB_MARKDOWN } from './utils/globs'

/** Markdown: only prettier formatting, no code block analysis. */
export const markdownConfigs: TFlatConfigItem[] = [
  {
    files: [GLOB_MARKDOWN],
    name: 'markdown/formatting',
    rules: { 'prettier/prettier': 'error' },
  },
]
