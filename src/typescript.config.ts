import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

//TODO add dot-notation rule to the easy rules
/** Easy: core + optional (agent-friendly). */
const easyRules: TypedFlatConfigItem['rules'] = {
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/class-literal-property-style': 'error',
  '@typescript-eslint/consistent-generic-constructors': 'error',
  '@typescript-eslint/consistent-indexed-object-style': 'error',
  '@typescript-eslint/consistent-type-assertions': 'error',
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/explicit-function-return-type': [
    'error',
    { allowExpressions: true },
  ],
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    { overrides: { constructors: 'no-public' } },
  ],
  '@typescript-eslint/naming-convention': [
    'error',
    { format: null, selector: ['objectLiteralProperty'] },
    { format: null, selector: 'import' },
    { format: ['StrictPascalCase'], selector: ['enum', 'class'] },
    { format: ['UPPER_CASE'], selector: ['enumMember'] },
    { format: ['StrictPascalCase'], prefix: ['I'], selector: ['interface'] },
    { format: ['StrictPascalCase'], prefix: ['T'], selector: ['typeAlias'] },
    { format: ['StrictPascalCase'], selector: ['typeParameter'] },
    {
      format: ['strictCamelCase', 'UPPER_CASE'],
      modifiers: ['const'],
      selector: 'variable',
    },
    {
      format: ['camelCase'],
      leadingUnderscore: 'allow',
      modifiers: ['unused'],
      selector: 'parameter',
    },
  ],
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-confusing-void-expression': 'error',
  '@typescript-eslint/no-duplicate-type-constituents': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-object-type': [
    'error',
    { allowInterfaces: 'always' },
  ],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-magic-numbers': [
    'error',
    {
      enforceConst: true,
      ignore: [0, 1, 100, -1],
      ignoreClassFieldInitialValues: true,
      ignoreDefaultValues: true,
      ignoreEnums: true,
    },
  ],
  '@typescript-eslint/no-meaningless-void-operator': 'error',
  '@typescript-eslint/no-redundant-type-constituents': 'error',
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-template-expression': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unnecessary-type-conversion': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-enum-comparison': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unsafe-unary-minus': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/only-throw-error': 'error',
  '@typescript-eslint/prefer-destructuring': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/related-getter-setter-pairs': 'error',
  '@typescript-eslint/require-array-sort-compare': [
    'error',
    { ignoreStringArrays: false },
  ],
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/return-await': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/unbound-method': 'error',
  '@typescript-eslint/unified-signatures': 'error',
}

/** Medium: rest of current rules (not in easy, not in hard). */
const mediumRules: TypedFlatConfigItem['rules'] = {
  '@typescript-eslint/class-methods-use-this': 'error',
  '@typescript-eslint/init-declarations': 'error',
  '@typescript-eslint/max-params': ['error', { max: 3 }],
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/no-misused-spread': 'error',
  '@typescript-eslint/no-mixed-enums': 'error',
  '@typescript-eslint/parameter-properties': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-promise-reject-errors': 'error',
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/restrict-template-expressions': 'error',
}

/** Hard: structural/type-safety (non-null assertion, readonly). */
const hardRules: TypedFlatConfigItem['rules'] = {
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
}

/** TypeScript rules by strictness preset. */
export const typescriptConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: { rules: easyRules },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: { rules: mediumRules },
}
