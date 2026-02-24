import type { ConfigNames } from '@antfu/eslint-config'

import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import prettier from 'eslint-plugin-prettier'
import { isPackageExists } from 'local-pkg'

import { boundariesConfig } from './boundaries.config'
import { importConfig } from './import.config'
import { javascriptConfig } from './javascript.config'
import { jsdocConfig } from './jsdoc.config'
import { perfectionistConfig } from './perfectionist.config'
import { productiveConfig } from './productive.config'
import { promiseConfig } from './promise.config'
import { rxjsConfig } from './rxjs.config'
import { sonarJsConfig } from './sonarJs.config'
import { mergePresetConfigs, StrictnessPreset } from './strictness'
import { typescriptConfig } from './typescript.config'
import { unicornConfig } from './unicorn.config'
import { vueConfig } from './vue.config'

/** Options for the main config factory. */
export interface IOptions {
  /** Files to ignore. Defaults to empty array. */
  ignores?: string[]
  /** Preset: easy, medium, or hard. Defaults to hard. */
  strictness?: StrictnessPreset
}

// TODO there was no-relative-import-paths plugin, but it's not compatible with eslint 10
// implement this rule manually in the productive plugin
/**
 * Main config factory.
 *
 * @param options The options for generating the ESLint configuration.
 * @param options.strictness Preset: easy (agent-friendly), medium (easy +
 *   rest), or hard (easy + medium + user rules). Defaults to hard.
 * @returns The generated ESLint configuration.
 */
const createConfig = ({
  ignores = [],
  strictness = StrictnessPreset.HARD,
}: IOptions): ReturnType<typeof antfu> =>
  antfu({ ignores, imports: false })
    .remove('antfu/stylistic/rules')
    .override(
      'antfu/perfectionist/setup',
      mergePresetConfigs(perfectionistConfig, strictness),
    )
    .override(
      'antfu/javascript/rules',
      mergePresetConfigs(javascriptConfig, strictness),
    )
    .override(
      'antfu/typescript/rules',
      mergePresetConfigs(typescriptConfig, strictness),
    )
    .override('antfu/disables/config-files', {
      files: ['**/*.plugin.?([cm])[jt]s?(x)'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        'no-template-curly-in-string': 'off',
      },
    })
    .override('antfu/disables/dts', {
      rules: { 'import/no-default-export': 'off' },
    })
    .override(
      'antfu/unicorn/rules',
      mergePresetConfigs(unicornConfig, strictness),
    )
    .override('antfu/jsdoc/rules', (baseConfig) => ({
      ...baseConfig,
      ...mergePresetConfigs(jsdocConfig, strictness),
    }))
    .append(mergePresetConfigs(importConfig, strictness))
    .append({ ...cssPlugin.configs.recommended, name: 'css' })
    .append(mergePresetConfigs(boundariesConfig, strictness))
    .append({
      name: 'prettier',
      plugins: { prettier },
      rules: { 'prettier/prettier': 'error' },
    })
    .append(mergePresetConfigs(promiseConfig, strictness))
    .append(mergePresetConfigs(sonarJsConfig, strictness))
    .append(mergePresetConfigs(productiveConfig, strictness))
    .onResolved((configs) => {
      const baseVueConfig = configs.find(
        (config) => (config.name as ConfigNames) === 'antfu/vue/rules',
      )

      if (baseVueConfig) {
        const merged = mergePresetConfigs(vueConfig, strictness)
        baseVueConfig.rules = merged.rules ?? {}
      }

      if (isPackageExists('rxjs')) {
        configs.push(mergePresetConfigs(rxjsConfig, strictness))
      }
    })

export default createConfig
export { StrictnessPreset } from './strictness'
