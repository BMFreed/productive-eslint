import type { Linter } from 'eslint'

import tsParser from '@typescript-eslint/parser'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

import type { TFlatConfigItem } from '../utils/presets'

import { GLOB_SRC, GLOB_VUE } from '../utils/globs'
import { mergePresetConfigs, Preset } from '../utils/presets'
import { vueConfig } from '../vue.config'

export const buildVueConfigs = (preset: Preset): TFlatConfigItem[] => [
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
