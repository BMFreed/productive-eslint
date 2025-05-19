import type { ConfigNames, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

import { boundariesConfig } from './boundaries.config'
import { importConfig } from './import.config'
import { javascriptConfig } from './javascript.config'
import { perfectionistConfig } from './perfectionist.config'
import { promiseConfig } from './promise.config'

const config: FlatConfigComposer<TypedFlatConfigItem, ConfigNames> = antfu()
  .remove('antfu/stylistic/rules')
  .override('antfu/perfectionist/setup', perfectionistConfig)
  .override('antfu/javascript/rules', javascriptConfig)
  .override('antfu/imports/rules', importConfig)
  .override('antfu/disables/config-files', {
    rules: {
      'import/no-default-export': 'off',
      'no-magic-numbers': 'off',
      'no-template-curly-in-string': 'off',
    },
  })
  .override('antfu/disables/dts', {
    rules: { 'import/no-default-export': 'off' },
  })
  .append({ ...cssPlugin.configs.recommended, name: 'css' })
  .append(boundariesConfig)
  .append({ ...eslintPluginPrettierRecommended, name: 'prettier' })
  .append(promiseConfig)
  .append({
    name: 'no-relative-import-paths',
    plugins: { 'no-relative-import-paths': noRelativeImportPaths },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': 'error',
    },
  })

export default config
