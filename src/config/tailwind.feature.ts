import type { Linter } from 'eslint'

import tailwindcssPlugin from 'eslint-plugin-tailwindcss'
import path from 'node:path'

import type { ITailwindOptions } from './types'
import type { TFlatConfigItem, TPresetMap } from '../utils/presets'

import { GLOB_TSX, GLOB_VUE } from '../utils/globs'
import { mergePresetConfigs, Preset } from '../utils/presets'

const TAILWIND_FUNCTIONS = [
  'classnames',
  'clsx',
  'ctl',
  'cva',
  'tv',
  'tw',
  'cn',
] as const

export const createTailwindSettings = (
  tailwindSettings: ITailwindOptions,
): NonNullable<TFlatConfigItem['settings']> => ({
  tailwindcss: {
    attributes: ['class', 'className'],
    callees: [...TAILWIND_FUNCTIONS],
    classRegex: '^class(Name)?$',
    config: path.resolve(process.cwd(), tailwindSettings.cssConfigPath),
    cssConfigPath: path.resolve(process.cwd(), tailwindSettings.cssConfigPath),
    functions: [...TAILWIND_FUNCTIONS],
  },
})

/** Tailwind rules by preset. */
export const createTailwindConfig = (
  tailwindSettings: ITailwindOptions,
): TPresetMap => {
  const shared = {
    plugins: { tailwindcss: tailwindcssPlugin },
    settings: createTailwindSettings(tailwindSettings),
  } satisfies Pick<TFlatConfigItem, 'plugins' | 'settings'>

  /** Auto-fixable: rules with ESLint autofix support. */
  const autoFixableRules: TFlatConfigItem['rules'] = {
    'tailwindcss/classnames-order': ['error', { config: {} }],
    'tailwindcss/enforces-shorthand': ['error', { config: {} }],
  }

  /** Recommended: keep semantic Tailwind review in the dedicated CLI analyzer. */
  const recommendedRules: TFlatConfigItem['rules'] = {}

  return {
    [Preset.AUTO_FIXABLE]: { ...shared, rules: autoFixableRules },
    [Preset.RECOMMENDED]: { rules: recommendedRules },
  }
}

export interface IBuildTailwindConfigsOptions {
  enableVue: boolean
  preset: Preset
  tailwind: ITailwindOptions
}

export const buildTailwindConfigs = ({
  enableVue,
  preset,
  tailwind,
}: IBuildTailwindConfigsOptions): TFlatConfigItem[] => [
  {
    files: enableVue ? [GLOB_TSX, GLOB_VUE] : [GLOB_TSX],
    name: 'tailwind/rules',
    ...mergePresetConfigs(createTailwindConfig(tailwind), preset),
  },
]

/** CLI: semantic Tailwind review rules for `productive-eslint analyze tailwind`. */
export const tailwindCliRules = {
  'tailwindcss/no-contradicting-classname': 'error',
  'tailwindcss/no-custom-classname': 'error',
  'tailwindcss/no-unnecessary-arbitrary-value': 'error',
} as const satisfies Linter.RulesRecord
