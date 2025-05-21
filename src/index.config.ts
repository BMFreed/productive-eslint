import antfu, { isPackageInScope } from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import prettier from 'eslint-plugin-prettier'

import { boundariesConfig } from './boundaries.config'
import { importConfig } from './import.config'
import { javascriptConfig } from './javascript.config'
import { perfectionistConfig } from './perfectionist.config'
import { productiveConfig } from './productive.config'
import { promiseConfig } from './promise.config'
import { sonarJsConfig } from './sonarJs.config'
import { typescriptConfig } from './typescript.config'
import { unicornConfig } from './unicorn.config'
import { vueConfig } from './vue.config'

// No other way to conditionally enable Vue overrides without access to source code
const configOptions = isPackageInScope('vue')
  ? { vue: { overrides: vueConfig.rules } }
  : undefined

const config = antfu(configOptions)
  .remove('antfu/stylistic/rules')
  .override('antfu/perfectionist/setup', perfectionistConfig)
  .override('antfu/javascript/rules', javascriptConfig)
  .override('antfu/typescript/rules', typescriptConfig)
  .override('antfu/imports/rules', importConfig)
  .override('antfu/disables/config-files', {
    files: ['**/*.plugin.?([cm])[jt]s?(x)'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'import/no-default-export': 'off',
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
  .append(productiveConfig)

export default config
