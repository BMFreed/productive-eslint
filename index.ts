import type { ConfigNames, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { featureSliced } from './featureSliced'
import { javascript } from './javascript'

const config: FlatConfigComposer<TypedFlatConfigItem, ConfigNames> = antfu()
  .remove('antfu/perfectionist/setup')
  .remove('antfu/stylistic/rules')
  .override('antfu/javascript/rules', javascript)
  .append(cssPlugin.configs.recommended)
  .append(featureSliced)
  .append(eslintPluginPrettierRecommended)

export default config
