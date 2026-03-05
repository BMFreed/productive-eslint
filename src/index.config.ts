import type { Linter } from 'eslint'

import cssPlugin from '@eslint/css'
import tsParser from '@typescript-eslint/parser'
import { FlatConfigComposer } from 'eslint-flat-config-utils'
import prettier from 'eslint-plugin-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import { isPackageExists } from 'local-pkg'
import vueParser from 'vue-eslint-parser'

import type { TFlatConfigItem } from './utils/strictness'

import { boundariesConfig } from './boundaries.config'
import { disablesConfigs } from './disables.config'
import { eslintCommentsConfig } from './eslintComments.config'
import { importConfig } from './import.config'
import { javascriptConfig } from './javascript.config'
import { jsdocConfig } from './jsdoc.config'
import { jsoncConfigs } from './jsonc.config'
import { markdownConfigs } from './markdown.config'
import { nodeConfig } from './node.config'
import { perfectionistConfig } from './perfectionist.config'
import { productiveConfig } from './productive.config'
import { promiseConfig } from './promise.config'
import { regexpConfig } from './regexp.config'
import { rxjsConfig } from './rxjs.config'
import { sonarJsConfig } from './sonarJs.config'
import { tomlConfigs } from './toml.config'
import { typescriptConfig } from './typescript.config'
import { unicornConfig } from './unicorn.config'
import {
  GLOB_EXCLUDE,
  GLOB_JSX,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
} from './utils/globs'
import { mergePresetConfigs, StrictnessPreset } from './utils/strictness'
import { vueConfig } from './vue.config'
import { yamlConfigs } from './yaml.config'

/** Options for the main config factory. */
export interface IOptions {
  /** Files to ignore. Defaults to empty array. */
  ignores?: string[]
  /** Enable RxJS rules. Auto-detected from installed packages when not set. */
  rxjs?: boolean
  /** Preset: easy, medium, or hard. Defaults to hard. */
  strictness?: StrictnessPreset
  /** Enable Vue rules. Auto-detected from installed packages when not set. */
  vue?: boolean
}

const buildVueConfigs = (strictness: StrictnessPreset): TFlatConfigItem[] => [
  {
    languageOptions: {
      globals: {
        computed: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        defineProps: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        reactive: 'readonly',
        ref: 'readonly',
        shallowReactive: 'readonly',
        shallowRef: 'readonly',
        toRef: 'readonly',
        toRefs: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
      },
    },
    name: 'vue/setup',
    plugins: { vue: pluginVue },
  },
  {
    files: [GLOB_VUE],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        extraFileExtensions: ['.vue'],
        parser: tsParser,
        sourceType: 'module',
      },
    },
    name: 'vue/rules',
    processor: pluginVue.processors['.vue'] as Linter.Processor,
    rules: mergePresetConfigs(vueConfig, strictness).rules ?? {},
  },
]

// TODO there was no-relative-import-paths plugin, but it's not compatible with eslint 10
// implement this rule manually in the productive plugin
/**
 * Main config factory.
 *
 * @param options The options for generating the ESLint configuration.
 * @param options.ignores Additional glob patterns to ignore.
 * @param options.rxjs Enable RxJS rules. Auto-detected when not set.
 * @param options.strictness Preset: easy (agent-friendly), medium (easy +
 *   rest), or hard (easy + medium + user rules). Defaults to hard.
 * @param options.vue Enable Vue rules. Auto-detected when not set.
 * @returns The generated ESLint configuration.
 */
const createConfig = ({
  ignores = [],
  rxjs,
  strictness = StrictnessPreset.HARD,
  vue,
}: IOptions): FlatConfigComposer<Linter.Config> => {
  const enableVue = vue ?? (isPackageExists('vue') || isPackageExists('nuxt'))
  const enableRxjs = rxjs ?? isPackageExists('rxjs')
  const configs: (TFlatConfigItem | TFlatConfigItem[])[] = [
    // --- Global ignores ---
    { ignores: [...GLOB_EXCLUDE, ...ignores], name: 'ignores' },

    // --- JavaScript setup ---
    {
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
      name: 'javascript/setup',
    },

    // --- JavaScript rules ---
    {
      name: 'javascript/rules',
      ...mergePresetConfigs(javascriptConfig, strictness),
    },

    // --- ESLint comments ---
    {
      name: 'eslint-comments/rules',
      ...mergePresetConfigs(eslintCommentsConfig, strictness),
    },

    // --- Node ---
    {
      name: 'node/rules',
      ...mergePresetConfigs(nodeConfig, strictness),
    },

    // --- Perfectionist ---
    {
      name: 'perfectionist/rules',
      ...mergePresetConfigs(perfectionistConfig, strictness),
    },

    // --- JSDoc ---
    {
      name: 'jsdoc/rules',
      ...mergePresetConfigs(jsdocConfig, strictness),
    },

    // --- Unicorn ---
    {
      name: 'unicorn/rules',
      ...mergePresetConfigs(unicornConfig, strictness),
    },

    // --- JSX setup ---
    {
      files: [GLOB_JSX, GLOB_TSX],
      languageOptions: {
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      name: 'jsx/setup',
    },

    // --- TypeScript parser ---
    {
      files: [GLOB_TS, GLOB_TSX],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          extraFileExtensions: ['.vue'],
          sourceType: 'module',
        },
      },
      name: 'typescript/parser',
    },

    // --- TypeScript rules ---
    {
      files: [GLOB_TS, GLOB_TSX],
      name: 'typescript/rules',
      ...mergePresetConfigs(typescriptConfig, strictness),
    },

    // --- Regexp ---
    {
      name: 'regexp/rules',
      ...mergePresetConfigs(regexpConfig, strictness),
    },

    // --- Vue (conditional) ---
    ...(enableVue ? buildVueConfigs(strictness) : []),

    // --- Import ---
    {
      name: 'imports',
      ...mergePresetConfigs(importConfig, strictness),
    },

    // --- CSS ---
    {
      name: 'css',
      plugins: { css: cssPlugin },
      rules: {
        'css/font-family-fallbacks': 'error',
        'css/no-duplicate-imports': 'error',
        'css/no-duplicate-keyframe-selectors': 'error',
        'css/no-empty-blocks': 'error',
        'css/no-important': 'error',
        'css/no-invalid-at-rule-placement': 'error',
        'css/no-invalid-at-rules': 'error',
        'css/no-invalid-named-grid-areas': 'error',
        'css/no-invalid-properties': 'error',
        'css/no-unmatchable-selectors': 'error',
        'css/use-baseline': 'error',
      },
    },

    // --- Boundaries ---
    {
      name: 'boundaries',
      ...mergePresetConfigs(boundariesConfig, strictness),
    },

    // --- Prettier ---
    {
      name: 'prettier',
      plugins: { prettier },
      rules: { 'prettier/prettier': 'error' },
    },

    // --- Promise ---
    {
      name: 'promise',
      ...mergePresetConfigs(promiseConfig, strictness),
    },

    // --- SonarJS ---
    {
      name: 'sonarjs',
      ...mergePresetConfigs(sonarJsConfig, strictness),
    },

    // --- Productive ---
    {
      name: 'productive',
      ...mergePresetConfigs(productiveConfig, strictness),
    },

    // --- Data formats ---
    jsoncConfigs,
    yamlConfigs,
    tomlConfigs,
    markdownConfigs,

    // --- Disables ---
    disablesConfigs,

    // --- RxJS (conditional) ---
    ...(enableRxjs ? [mergePresetConfigs(rxjsConfig, strictness)] : []),
  ]

  return new FlatConfigComposer<Linter.Config>(configs.flat() as Linter.Config)
}

export default createConfig
export { StrictnessPreset } from './utils/strictness'
