import type { Linter } from 'eslint'

import tsParser from '@typescript-eslint/parser'
import { FlatConfigComposer } from 'eslint-flat-config-utils'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'

import type { TFlatConfigItem } from './utils/presets'

import { boundariesConfig } from './boundaries.config'
import { buildReactConfigs } from './config/react.feature'
import { resolveNormalizedOptions } from './config/runtime'
import { buildStorybookConfigs } from './config/storybook.feature'
import { buildTailwindConfigs } from './config/tailwind.feature'
import type { IOptions, IReactOptions, ITailwindOptions } from './config/types'
import { buildVueConfigs } from './config/vue.feature'
import { cssConfig } from './css.config'
import { disablesConfigs } from './disables.config'
import { eslintCommentsConfig } from './eslintComments.config'
import { importConfig } from './import.config'
import { javascriptConfig } from './javascript.config'
import { jsoncConfig } from './jsonc.config'
import { nodeConfig } from './node.config'
import { perfectionistConfig } from './perfectionist.config'
import { productiveConfig } from './productive.config'
import { promiseConfig } from './promise.config'
import { regexpConfig } from './regexp.config'
import { rxjsConfig } from './rxjs.config'
import { sonarJsConfig } from './sonarJs.config'
import { tomlConfig } from './toml.config'
import { typescriptConfig } from './typescript.config'
import { unicornConfig } from './unicorn.config'
import {
  GLOB_CSS,
  GLOB_EXCLUDE,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_SRC,
  GLOB_TOML,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
  GLOB_YAML,
} from './utils/globs'
import { markProductiveComposer } from './utils/marker'
import { mergePresetConfigs, Preset } from './utils/presets'
import { yamlConfig } from './yaml.config'

// TODO there was no-relative-import-paths plugin, but it's not compatible with eslint 10
// implement this rule manually in the productive plugin
/**
 * Main config factory.
 *
 * @param options The options for generating the ESLint configuration.
 * @param options.fsd Enable FSD architecture boundaries setup. Defaults to
 *   true.
 * @param options.ignores Additional glob patterns to ignore.
 * @param options.react Enable React rules or configure compiler checks.
 * @param options.storybook Enable Storybook rules for stories and `.storybook`
 *   config files.
 * @param options.rxjs Enable RxJS rules. Auto-detected when not set.
 * @param options.preset Preset: autoFixable (only auto-fixable rules) or
 *   recommended (permanent mechanical baseline). Defaults to recommended.
 * @param options.tailwind Enable Tailwind rules with explicit CSS config path.
 * @param options.vue Enable Vue rules. Auto-detected when not set.
 * @returns The generated ESLint configuration.
 */
const createConfig = (options: IOptions = {}): FlatConfigComposer<Linter.Config> => {
  const normalizedOptions = resolveNormalizedOptions(options)
  const {
    capabilities,
    fsd,
    ignores,
    preset,
    react,
    rxjs,
    storybook,
    tailwind,
    vue,
  } = normalizedOptions
  const sourceFiles = vue.enabled ? [GLOB_SRC, GLOB_VUE] : [GLOB_SRC]
  const configs: (TFlatConfigItem | TFlatConfigItem[])[] = [
    // --- Global ignores ---
    {
      ignores: storybook.enabled
        ? [...GLOB_EXCLUDE, ...ignores, '!.storybook']
        : [...GLOB_EXCLUDE, ...ignores],
      name: 'ignores',
    },

    // --- Base setup ---
    {
      files: sourceFiles,
      languageOptions: {
        ecmaVersion: 'latest',
        globals: {
          ...globals.browser,
          ...globals.es2025,
          ...globals.node,
        },
        parserOptions: {
          ecmaFeatures: { jsx: true },
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        sourceType: 'module',
      },
      linterOptions: { reportUnusedDisableDirectives: true },
      name: 'base/setup',
    },

    // --- Base rules ---
    {
      files: sourceFiles,
      name: 'base/rules',
      ...mergePresetConfigs(javascriptConfig, preset),
    },

    // --- ESLint comments ---
    {
      files: sourceFiles,
      name: 'eslint-comments/rules',
      ...mergePresetConfigs(eslintCommentsConfig, preset),
    },

    // --- Node ---
    {
      files: sourceFiles,
      name: 'node/rules',
      ...mergePresetConfigs(nodeConfig, preset),
    },

    // --- Perfectionist ---
    {
      files: sourceFiles,
      name: 'perfectionist/rules',
      ...mergePresetConfigs(perfectionistConfig, preset),
    },

    // --- Unicorn ---
    {
      files: sourceFiles,
      name: 'unicorn/rules',
      ...mergePresetConfigs(unicornConfig, preset),
    },

    // --- TSX setup ---
    {
      files: [GLOB_TSX],
      languageOptions: {
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      name: 'tsx/setup',
    },

    // --- TypeScript parser ---
    {
      files: [GLOB_TS, GLOB_TSX],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          extraFileExtensions: ['.vue'],
          projectService: true,
          sourceType: 'module',
        },
      },
      name: 'typescript/parser',
    },

    // --- TypeScript rules ---
    {
      files: [GLOB_TS, GLOB_TSX],
      name: 'typescript/rules',
      ...mergePresetConfigs(typescriptConfig, preset),
    },

    // --- Regexp ---
    {
      files: sourceFiles,
      name: 'regexp/rules',
      ...mergePresetConfigs(regexpConfig, preset),
    },

    // --- React (conditional) ---
    ...(react.enabled
      ? buildReactConfigs({
          enableReactCompiler: react.compiler,
          preset,
          reactVersion: react.version,
        })
      : []),

    // --- Vue (conditional) ---
    ...(vue.enabled ? buildVueConfigs(preset) : []),

    // --- Storybook (conditional) ---
    ...(storybook.enabled ? buildStorybookConfigs(preset) : []),

    // --- Tailwind (conditional) ---
    ...(tailwind.enabled
      ? buildTailwindConfigs({
          enableVue: vue.enabled,
          preset,
          tailwind: { cssConfigPath: tailwind.cssConfigPath },
        })
      : []),

    // --- Import ---
    {
      files: sourceFiles,
      name: 'imports',
      ...mergePresetConfigs(importConfig, preset),
    },

    // --- CSS ---
    {
      files: [GLOB_CSS],
      language: 'css/css',
      name: 'css',
      ...mergePresetConfigs(cssConfig, preset),
    },

    // --- Boundaries ---
    ...(fsd
      ? [
          {
            files: sourceFiles,
            name: 'boundaries',
            ...mergePresetConfigs(boundariesConfig, preset),
          },
        ]
      : []),

    // --- Prettier ---
    {
      files: [
        GLOB_SRC,
        GLOB_VUE,
        GLOB_CSS,
        GLOB_JSON,
        GLOB_JSON5,
        GLOB_JSONC,
        GLOB_YAML,
        GLOB_TOML,
      ],
      name: 'prettier',
      plugins: { prettier },
      rules: { 'prettier/prettier': 'error' },
    },

    // --- Promise ---
    {
      files: sourceFiles,
      name: 'promise',
      ...mergePresetConfigs(promiseConfig, preset),
    },

    // --- SonarJS ---
    {
      files: sourceFiles,
      name: 'sonarjs',
      ...mergePresetConfigs(sonarJsConfig, preset),
    },

    // --- Productive ---
    {
      files: sourceFiles,
      name: 'productive',
      ...mergePresetConfigs(productiveConfig, preset),
    },

    // --- Data formats ---
    mergePresetConfigs(jsoncConfig, preset),
    mergePresetConfigs(yamlConfig, preset),
    mergePresetConfigs(tomlConfig, preset),

    // --- Disables ---
    disablesConfigs,

    // --- RxJS (conditional) ---
    ...(rxjs.enabled ? [mergePresetConfigs(rxjsConfig, preset)] : []),
  ]

  return markProductiveComposer(
    new FlatConfigComposer<Linter.Config>(configs.flat() as Linter.Config),
    capabilities,
  )
}

export { createConfig }
export type { IOptions, IReactOptions, ITailwindOptions } from './config/types'
export { Preset } from './utils/presets'
