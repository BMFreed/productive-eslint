import pluginTs from '@typescript-eslint/eslint-plugin'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

const shared = {
  plugins: {
    '@typescript-eslint': pluginTs,
  },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/consistent-generic-constructors': 'error',
  '@typescript-eslint/consistent-indexed-object-style': 'error',
  '@typescript-eslint/consistent-type-assertions': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      disallowTypeAnnotations: false,
      fixStyle: 'separate-type-imports',
      prefer: 'type-imports',
    },
  ],
  '@typescript-eslint/dot-notation': [
    'error',
    { allowIndexSignaturePropertyAccess: true },
  ],
  '@typescript-eslint/method-signature-style': ['error', 'property'],
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-duplicate-type-constituents': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-import-type-side-effects': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/no-meaningless-void-operator': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-template-expression': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/no-wrapper-object-types': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  'constructor-super': 'off',
  'getter-return': 'off',
  'no-array-constructor': 'off',
  'no-class-assign': 'off',
  'no-const-assign': 'off',
  'no-dupe-args': 'off',
  'no-dupe-class-members': 'off',
  'no-dupe-keys': 'off',
  'no-func-assign': 'off',
  'no-import-assign': 'off',
  'no-new-native-nonconstructor': 'off',
  'no-new-symbol': 'off',
  'no-obj-calls': 'off',
  'no-redeclare': 'off',
  'no-setter-return': 'off',
  'no-this-before-super': 'off',
  'no-undef': 'off',
  'no-unreachable': 'off',
  'no-unsafe-negation': 'off',
  'no-unused-expressions': 'off',
  'no-unused-vars': 'off',
  'no-use-before-define': 'off',
  'no-useless-constructor': 'off',
  'no-with': 'off',
  'unused-imports/no-unused-vars': 'off',
}

/** Easy: remaining agent-friendly rules (no autofix). */
const easyRules: TFlatConfigItem['rules'] = {
  '@typescript-eslint/ban-ts-comment': [
    'error',
    { 'ts-expect-error': 'allow-with-description' },
  ],

  '@typescript-eslint/class-literal-property-style': 'error',
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

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

  // strict config rules
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-confusing-void-expression': 'error',
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-object-type': [
    'error',
    { allowInterfaces: 'always' },
  ],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
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
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-redeclare': ['error', { builtinGlobals: false }],
  '@typescript-eslint/no-redundant-type-constituents': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unnecessary-type-conversion': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  '@typescript-eslint/no-unsafe-enum-comparison': 'error',
  '@typescript-eslint/no-unsafe-function-type': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unsafe-unary-minus': 'error',
  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: true,
      allowTaggedTemplates: true,
      allowTernary: true,
    },
  ],
  '@typescript-eslint/no-use-before-define': [
    'error',
    { classes: false, functions: false, variables: true },
  ],
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/only-throw-error': 'error',
  '@typescript-eslint/prefer-destructuring': 'error',
  '@typescript-eslint/prefer-literal-enum-member': 'error',
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
  '@typescript-eslint/triple-slash-reference': 'off',
  '@typescript-eslint/unbound-method': 'error',
  '@typescript-eslint/unified-signatures': 'error',
}

/** Medium: rest of current rules (not in easy, not in hard). */
const mediumRules: TFlatConfigItem['rules'] = {
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
const hardRules: TFlatConfigItem['rules'] = {
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
}

/** TypeScript rules by strictness preset. */
export const typescriptConfig: TStrictnessPresetMap = {
  [StrictnessPreset.AUTO_FIXABLE]: { ...shared, rules: autoFixableRules },
  [StrictnessPreset.EASY]: { rules: easyRules },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: { rules: mediumRules },
}
