import type { ConfigNames, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import { boundaries } from './boundaries'
import { javascriptAdditions } from './javascriptAdditions'
import { promise } from './promise'
import { importAdditions } from './importAdditions'

const config: FlatConfigComposer<TypedFlatConfigItem, ConfigNames> = antfu()
  .remove('antfu/perfectionist/setup')
  .remove('antfu/stylistic/rules')
  .override('antfu/javascript/rules', javascriptAdditions)
  .override('antfu/imports/rules', importAdditions)
  .append({ ...cssPlugin.configs.recommended, name: 'css' })
  .append(boundaries)
  .append({ ...eslintPluginPrettierRecommended, name: 'prettier' })
  .append(promise)
  .append({
    name: 'no-relative-import-paths',
    plugins: { 'no-relative-import-paths': noRelativeImportPaths },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': 'error',
    },
  })

export default config
