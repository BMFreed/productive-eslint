import pluginTs from '@typescript-eslint/eslint-plugin'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

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

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  '@typescript-eslint/class-literal-property-style': 'error',
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/default-param-last': 'error',
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
    {
      format: ['StrictPascalCase'],
      prefix: ['I'],
      selector: ['interface'],
    },
    {
      format: ['StrictPascalCase'],
      prefix: ['T'],
      selector: ['typeAlias'],
    },
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
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-object-type': [
    'error',
    { allowInterfaces: 'always' },
  ],
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-redeclare': ['error', { builtinGlobals: false }],
  '@typescript-eslint/no-redundant-type-constituents': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unnecessary-type-conversion': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  '@typescript-eslint/no-unsafe-function-type': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/only-throw-error': 'error',
  '@typescript-eslint/related-getter-setter-pairs': 'error',
  '@typescript-eslint/require-array-sort-compare': [
    'error',
    { ignoreStringArrays: false },
  ],
  '@typescript-eslint/unified-signatures': 'error',
}

/** TypeScript rules by preset. */
export const typescriptConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: { ...shared, rules: autoFixableRules },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
