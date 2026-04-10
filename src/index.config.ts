import type { Linter } from 'eslint'

import tsParser from '@typescript-eslint/parser'
import { FlatConfigComposer } from 'eslint-flat-config-utils'
import prettier from 'eslint-plugin-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import { isPackageExists } from 'local-pkg'
import vueParser from 'vue-eslint-parser'

import type { TFlatConfigItem } from './utils/presets'

import { boundariesConfig } from './boundaries.config'
import { cssConfig } from './css.config'
import { disablesConfigs } from './disables.config'
import { eslintCommentsConfig } from './eslintComments.config'
import { importConfig } from './import.config'
import { javascriptConfig } from './javascript.config'
import { jsdocConfig } from './jsdoc.config'
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
  GLOB_JSX,
  GLOB_SRC,
  GLOB_TOML,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
  GLOB_YAML,
} from './utils/globs'
import { mergePresetConfigs, Preset } from './utils/presets'
import { vueConfig } from './vue.config'
import { yamlConfig } from './yaml.config'

/** Options for the main config factory. */
export interface IOptions {
  /** Files to ignore. Defaults to empty array. */
  ignores?: string[]
  /** Preset: autoFixable or recommended. Defaults to recommended. */
  preset?: Preset
  /** Enable RxJS rules. Auto-detected from installed packages when not set. */
  rxjs?: boolean
  /** Enable Vue rules. Auto-detected from installed packages when not set. */
  vue?: boolean
}

const buildVueConfigs = (preset: Preset): TFlatConfigItem[] => [
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
    rules: mergePresetConfigs(vueConfig, preset).rules ?? {},
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
 * @param options.preset Preset: autoFixable (only auto-fixable rules) or
 *   recommended (permanent mechanical baseline). Defaults to recommended.
 * @param options.vue Enable Vue rules. Auto-detected when not set.
 * @returns The generated ESLint configuration.
 */
const createConfig = ({
  ignores = [],
  preset = Preset.RECOMMENDED,
  rxjs,
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
      ...mergePresetConfigs(javascriptConfig, preset),
    },

    // --- ESLint comments ---
    {
      files: jsFiles,
      name: 'eslint-comments/rules',
      ...mergePresetConfigs(eslintCommentsConfig, preset),
    },

    // --- Node ---
    {
      files: jsFiles,
      name: 'node/rules',
      ...mergePresetConfigs(nodeConfig, preset),
    },

    // --- Perfectionist ---
    {
      files: jsFiles,
      name: 'perfectionist/rules',
      ...mergePresetConfigs(perfectionistConfig, preset),
    },

    // --- JSDoc ---
    {
      files: jsFiles,
      name: 'jsdoc/rules',
      ...mergePresetConfigs(jsdocConfig, preset),
    },

    // --- Unicorn ---
    {
      files: jsFiles,
      name: 'unicorn/rules',
      ...mergePresetConfigs(unicornConfig, preset),
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
      ...mergePresetConfigs(typescriptConfig, preset),
    },

    // --- Regexp ---
    {
      files: jsFiles,
      name: 'regexp/rules',
      ...mergePresetConfigs(regexpConfig, preset),
    },

    // --- Vue (conditional) ---
    ...(enableVue ? buildVueConfigs(preset) : []),

    // --- Import ---
    {
      files: jsFiles,
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
    {
      files: jsFiles,
      name: 'boundaries',
      ...mergePresetConfigs(boundariesConfig, preset),
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
      ...mergePresetConfigs(promiseConfig, preset),
    },

    // --- SonarJS ---
    {
      files: jsFiles,
      name: 'sonarjs',
      ...mergePresetConfigs(sonarJsConfig, preset),
    },

    // --- Productive ---
    {
      files: jsFiles,
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
    ...(enableRxjs ? [mergePresetConfigs(rxjsConfig, preset)] : []),
  ]

  return new FlatConfigComposer<Linter.Config>(configs.flat() as Linter.Config)
}

export default createConfig
export { Preset } from './utils/presets'
