import type { TFlatConfigItem } from '../utils/presets'

import { jsxA11yConfig } from '../jsxA11y.config'
import { reactCompilerConfig } from '../reactCompiler.config'
import { reactConfig } from '../react.config'
import { reactHooksConfig } from '../reactHooks.config'
import { GLOB_TS, GLOB_TSX } from '../utils/globs'
import { hasRuleEntries, mergePresetConfigs, Preset } from '../utils/presets'

export interface IBuildReactConfigsOptions {
  enableReactCompiler: boolean
  preset: Preset
  reactVersion: string
}

export const buildReactConfigs = ({
  enableReactCompiler,
  preset,
  reactVersion,
}: IBuildReactConfigsOptions): TFlatConfigItem[] => {
  const reactRules = mergePresetConfigs(reactConfig, preset)
  const reactCompilerRules = enableReactCompiler
    ? mergePresetConfigs(reactCompilerConfig, preset)
    : {}
  const reactHooksRules = mergePresetConfigs(reactHooksConfig, preset)
  const jsxA11yRules = mergePresetConfigs(jsxA11yConfig, preset)

  return [
    {
      files: [GLOB_TSX],
      name: 'react/rules',
      settings: {
        react: {
          version: reactVersion,
        },
      },
      ...reactRules,
    },
    ...(hasRuleEntries(reactHooksRules)
      ? [
          {
            files: [GLOB_TS, GLOB_TSX],
            name: 'react-hooks/rules',
            ...reactHooksRules,
          },
        ]
      : []),
    ...(hasRuleEntries(reactCompilerRules)
      ? [
          {
            files: [GLOB_TS, GLOB_TSX],
            name: 'react-compiler/rules',
            ...reactCompilerRules,
          },
        ]
      : []),
    ...(hasRuleEntries(jsxA11yRules)
      ? [
          {
            files: [GLOB_TSX],
            name: 'jsx-a11y/rules',
            ...jsxA11yRules,
          },
        ]
      : []),
  ]
}
