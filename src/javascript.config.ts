import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

const shared = {
  plugins: {
    'prefer-arrow-functions': preferArrowFunctions,
  },
} satisfies Pick<TypedFlatConfigItem, 'plugins'>

/** Easy: core + optional (agent-friendly). */
const easyRules: TypedFlatConfigItem['rules'] = {
  'antfu/no-top-level-await': 'off',
  'arrow-body-style': ['error', 'as-needed'],
  curly: ['error', 'all'],
  'default-case': 'error',
  'grouped-accessor-pairs': 'error',
  'id-length': ['error', { exceptions: ['t'] }],
  'logical-assignment-operators': [
    'error',
    'always',
    { enforceForIfStatements: true },
  ],
  'no-empty-function': 'error',
  'no-empty-static-block': 'error',
  'no-inner-declarations': 'error',
  'no-object-constructor': 'error',
  'no-shadow': 'error',
  'no-throw-literal': 'off',
  'no-unused-private-class-members': 'error',
  'no-useless-concat': 'error',
  'no-useless-escape': 'error',
  'no-void': ['error', { allowAsStatement: true }],
  'operator-assignment': 'error',
  'prefer-arrow-functions/prefer-arrow-functions': 'error',
  'prefer-object-spread': 'error',
  'unused-imports/no-unused-vars': 'off',
}

/** Medium: rest of current rules (not in easy, not in hard). */
const mediumRules: TypedFlatConfigItem['rules'] = {
  'consistent-this': 'error',
  'dot-notation': 'off',
  'for-direction': 'error',
  'new-cap': ['error', { capIsNew: false, newIsCap: true, properties: true }],
  'no-bitwise': 'error',
  'no-constant-binary-expression': 'error',
  'no-constant-condition': 'error',
  'no-constructor-return': 'error',
  'no-implicit-coercion': ['error', { disallowTemplateShorthand: true }],
  'no-invalid-this': 'error',
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
  'no-promise-executor-return': 'error',
  'no-restricted-syntax': 'off',
  'no-return-assign': 'error',
  'no-script-url': 'error',
  'no-sequences': 'error',
  'prefer-promise-reject-errors': 'off',
}

/** Hard: structural/architectural (complexity, depth, atomic updates). */
const hardRules: TypedFlatConfigItem['rules'] = {
  complexity: ['error', { max: 12 }],
  'max-depth': ['error', 2],
  'require-atomic-updates': 'error',
}

/** JavaScript rules by strictness preset. */
export const javascriptConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: {
    rules: mediumRules,
  },
}
