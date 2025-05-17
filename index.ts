import type { ConfigNames, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import { featureSliced } from './featureSliced'
import { javascript } from './javascript'

const config: FlatConfigComposer<TypedFlatConfigItem, ConfigNames> = antfu().append({ name: 'css-plugin', plugins: { css: cssPlugin } }).append(featureSliced).override('antfu/javascript/rules', javascript).remove('antfu/perfectionist/setup')

export default config
