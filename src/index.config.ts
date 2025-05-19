import type { ConfigNames, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import prettier from 'eslint-plugin-prettier'

import { boundariesConfig } from './boundaries.config'
import { importConfig } from './import.config'
import { javascriptConfig } from './javascript.config'
import { perfectionistConfig } from './perfectionist.config'
import { promiseConfig } from './promise.config'
import { sonarJsConfig } from './sonarJs.config'
import { unicornConfig } from './unicorn.config'

const config: FlatConfigComposer<TypedFlatConfigItem, ConfigNames> = antfu()
  .remove('antfu/stylistic/rules')
  .override('antfu/perfectionist/setup', perfectionistConfig)
  .override('antfu/javascript/rules', javascriptConfig)
  .override('antfu/typescript/rules', { rules: { 'no-unreachable': 'error' } })
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
  .override('antfu/unicorn/rules', unicornConfig)
  .append({ ...cssPlugin.configs.recommended, name: 'css' })
  .append(boundariesConfig)
  .append({
    name: 'prettier',
    plugins: { prettier },
    rules: { 'prettier/prettier': 'error' },
  })
  .append(promiseConfig)
  .append({
    name: 'no-relative-import-paths',
    plugins: { 'no-relative-import-paths': noRelativeImportPaths },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': 'error',
    },
  })
  .append(sonarJsConfig)

export default config
