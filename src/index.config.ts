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
  GLOB_CSS,
  GLOB_EXCLUDE,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_JSX,
  GLOB_SRC,
  GLOB_TOML,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
  GLOB_YAML,
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
    files: [GLOB_SRC, GLOB_VUE],
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
  const jsFiles = enableVue ? [GLOB_SRC, GLOB_VUE] : [GLOB_SRC]
  const configs: (TFlatConfigItem | TFlatConfigItem[])[] = [
    // --- Global ignores ---
    { ignores: [...GLOB_EXCLUDE, ...ignores], name: 'ignores' },

    // --- JavaScript setup ---
    {
      files: jsFiles,
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
      files: jsFiles,
      name: 'javascript/rules',
      ...mergePresetConfigs(javascriptConfig, strictness),
    },

    // --- ESLint comments ---
    {
      files: jsFiles,
      name: 'eslint-comments/rules',
      ...mergePresetConfigs(eslintCommentsConfig, strictness),
    },

    // --- Node ---
    {
      files: jsFiles,
      name: 'node/rules',
      ...mergePresetConfigs(nodeConfig, strictness),
    },

    // --- Perfectionist ---
    {
      files: jsFiles,
      name: 'perfectionist/rules',
      ...mergePresetConfigs(perfectionistConfig, strictness),
    },

    // --- JSDoc ---
    {
      files: jsFiles,
      name: 'jsdoc/rules',
      ...mergePresetConfigs(jsdocConfig, strictness),
    },

    // --- Unicorn ---
    {
      files: jsFiles,
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
      ...mergePresetConfigs(typescriptConfig, strictness),
    },

    // --- Regexp ---
    {
      files: jsFiles,
      name: 'regexp/rules',
      ...mergePresetConfigs(regexpConfig, strictness),
    },

    // --- Vue (conditional) ---
    ...(enableVue ? buildVueConfigs(strictness) : []),

    // --- Import ---
    {
      files: jsFiles,
      name: 'imports',
      ...mergePresetConfigs(importConfig, strictness),
    },

    // --- CSS ---
    {
      files: [GLOB_CSS],
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
      files: jsFiles,
      name: 'boundaries',
      ...mergePresetConfigs(boundariesConfig, strictness),
    },

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
      files: jsFiles,
      name: 'promise',
      ...mergePresetConfigs(promiseConfig, strictness),
    },

    // --- SonarJS ---
    {
      files: jsFiles,
      name: 'sonarjs',
      ...mergePresetConfigs(sonarJsConfig, strictness),
    },

    // --- Productive ---
    {
      files: jsFiles,
      name: 'productive',
      ...mergePresetConfigs(productiveConfig, strictness),
    },

    // --- Data formats ---
    jsoncConfigs,
    yamlConfigs,
    tomlConfigs,

    // --- Disables ---
    disablesConfigs,

    // --- RxJS (conditional) ---
    ...(enableRxjs ? [mergePresetConfigs(rxjsConfig, strictness)] : []),
  ]

  return new FlatConfigComposer<Linter.Config>(configs.flat() as Linter.Config)
}

export default createConfig
export { StrictnessPreset } from './utils/strictness'
