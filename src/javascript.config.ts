import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'

/** Adds and overrides JavaScript rules defined in @antfu/eslint-config */
export const javascriptConfig: TypedFlatConfigItem = {
  plugins: {
    'prefer-arrow-functions': preferArrowFunctions,
  },
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    complexity: ['error', { max: 12 }],
    'consistent-this': 'error',
    curly: ['error', 'all'],
    'default-case': 'error',
    // Replaced by an identical rule in typescript-eslint
    'dot-notation': 'off',
    'for-direction': 'error',
    'grouped-accessor-pairs': 'error',
    'id-length': ['error', { exceptions: ['t'] }],
    'logical-assignment-operators': [
      'error',
      'always',
      { enforceForIfStatements: true },
    ],
    'max-depth': ['error', 2],
    'max-lines': 'error',
    'new-cap': ['error', { capIsNew: false, newIsCap: true, properties: true }],
    'no-bitwise': 'error',
    'no-constant-binary-expression': 'error',
    'no-constant-condition': 'error',
    'no-constructor-return': 'error',
    'no-empty-function': 'error',
    'no-empty-static-block': 'error',
    'no-implicit-coercion': ['error', { disallowTemplateShorthand: true }],
    'no-inner-declarations': 'error',
    'no-invalid-this': 'error',
    'no-object-constructor': 'error',
    'no-param-reassign': [
      'error',
      {
        ignorePropertyModificationsFor: [
          'accumulator',
          'ctx',
          'context',
          'req',
          'request',
          'res',
          'response',
          '$scope',
          'staticContext',
          'ref',
          'model',
        ],
        ignorePropertyModificationsForRegex: ['^.*(?:Ref|Model)$'],
        props: true,
      },
    ],
    'no-plusplus': 'error',
    'no-promise-executor-return': 'error',
    // The default value forbids const enums, which contradicts this config's philosophy
    'no-restricted-syntax': 'off',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-sequences': 'error',
    'no-shadow': 'error',
    // Replaced by an identical rule in typescript-eslint
    'no-throw-literal': 'off',
    'no-unused-private-class-members': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-void': ['error', { allowAsStatement: true }],
    'operator-assignment': 'error',
    'prefer-arrow-functions/prefer-arrow-functions': 'error',
    'prefer-object-spread': 'error',
    // Replaced by an identical rule in typescript-eslint
    'prefer-promise-reject-errors': 'off',
    'require-atomic-updates': 'error',
    // Is replaced by 'unusedLocals' in tsconfig
    'unused-imports/no-unused-vars': 'off',
  },
}
