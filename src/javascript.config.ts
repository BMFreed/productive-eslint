import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'
import pluginUnusedImports from 'eslint-plugin-unused-imports'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

const shared = {
  plugins: {
    'prefer-arrow-functions': preferArrowFunctions,
    'unused-imports': pluginUnusedImports,
  },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'arrow-body-style': ['error', 'as-needed'],
  curly: ['error', 'all'],
  'dot-notation': 'off',
  'no-array-constructor': 'error',
  'no-extra-bind': 'error',
  'no-extra-boolean-cast': 'error',
  'no-regex-spaces': 'error',
  'no-restricted-syntax': 'off',
  'no-throw-literal': 'off',
  'no-undef-init': 'error',
  'no-unneeded-ternary': ['error', { defaultAssignment: false }],
  'no-useless-computed-key': 'error',
  'no-useless-rename': 'error',
  'no-useless-return': 'error',
  'no-var': 'error',
  'object-shorthand': [
    'error',
    'always',
    { avoidQuotes: true, ignoreConstructors: false },
  ],
  'one-var': ['error', { initialized: 'never' }],
  'operator-assignment': 'error',
  'prefer-arrow-callback': [
    'error',
    { allowNamedFunctions: false, allowUnboundThis: true },
  ],
  'prefer-exponentiation-operator': 'error',
  'prefer-object-spread': 'error',
  'prefer-promise-reject-errors': 'off',
  'prefer-template': 'error',
  'unicode-bom': ['error', 'never'],
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': 'off',
  yoda: ['error', 'never'],
}

/** Easy: remaining agent-friendly rules (no autofix). */
const easyRules: TFlatConfigItem['rules'] = {
  'accessor-pairs': [
    'error',
    { enforceForClassMembers: true, setWithoutGet: true },
  ],
  'array-callback-return': 'error',
  'block-scoped-var': 'error',
  'constructor-super': 'error',
  'default-case': 'error',
  'default-case-last': 'error',
  eqeqeq: ['error', 'smart'],
  'prefer-arrow-functions/prefer-arrow-functions': 'error',
  'grouped-accessor-pairs': 'error',
  'id-length': ['error', { exceptions: ['t'] }],
  'logical-assignment-operators': [
    'error',
    'always',
    { enforceForIfStatements: true },
  ],
  'no-alert': 'error',
  'no-async-promise-executor': 'error',
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': ['error', 'always'],
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'no-const-assign': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-empty-character-class': 'error',
  'no-empty-function': 'error',
  'no-empty-pattern': 'error',
  'no-empty-static-block': 'error',
  'no-eval': 'error',
  'no-ex-assign': 'error',
  'no-extend-native': 'error',
  'no-fallthrough': 'error',
  'no-func-assign': 'error',
  'no-global-assign': 'error',
  'no-implied-eval': 'error',
  'no-import-assign': 'error',
  'no-inner-declarations': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-iterator': 'error',
  'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  'no-lone-blocks': 'error',
  'no-loss-of-precision': 'error',
  'no-misleading-character-class': 'error',
  'no-multi-str': 'error',
  'no-new': 'error',
  'no-new-func': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-new-wrappers': 'error',
  'no-obj-calls': 'error',
  'no-object-constructor': 'error',
  'no-octal': 'error',
  'no-octal-escape': 'error',
  'no-proto': 'error',
  'no-prototype-builtins': 'error',
  'no-redeclare': ['error', { builtinGlobals: false }],
  'no-restricted-globals': [
    'error',
    { message: 'Use `globalThis` instead.', name: 'global' },
    { message: 'Use `globalThis` instead.', name: 'self' },
  ],
  'no-restricted-properties': [
    'error',
    {
      message:
        'Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.',
      property: '__proto__',
    },
    {
      message: 'Use `Object.defineProperty` instead.',
      property: '__defineGetter__',
    },
    {
      message: 'Use `Object.defineProperty` instead.',
      property: '__defineSetter__',
    },
    {
      message: 'Use `Object.getOwnPropertyDescriptor` instead.',
      property: '__lookupGetter__',
    },
    {
      message: 'Use `Object.getOwnPropertyDescriptor` instead.',
      property: '__lookupSetter__',
    },
  ],
  'no-self-assign': ['error', { props: true }],
  'no-self-compare': 'error',
  'no-shadow': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-template-curly-in-string': 'error',
  'no-this-before-super': 'error',
  'no-undef': 'error',
  'no-unexpected-multiline': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unreachable': 'error',
  'no-unreachable-loop': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'no-unused-expressions': [
    'error',
    {
      allowShortCircuit: true,
      allowTaggedTemplates: true,
      allowTernary: true,
    },
  ],
  'no-unused-private-class-members': 'error',
  'no-unused-vars': [
    'error',
    {
      args: 'none',
      caughtErrors: 'none',
      ignoreRestSiblings: true,
      vars: 'all',
    },
  ],
  'no-use-before-define': [
    'error',
    { classes: false, functions: false, variables: true },
  ],
  'no-useless-backreference': 'error',
  'no-useless-call': 'error',
  'no-useless-catch': 'error',
  'no-useless-concat': 'error',
  'no-useless-constructor': 'error',
  'no-useless-escape': 'error',
  'no-void': ['error', { allowAsStatement: true }],
  'no-with': 'error',
  'prefer-const': [
    'error',
    { destructuring: 'all', ignoreReadBeforeAssign: true },
  ],
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'symbol-description': 'error',
  'use-isnan': [
    'error',
    { enforceForIndexOf: true, enforceForSwitchCase: true },
  ],
  'valid-typeof': ['error', { requireStringLiterals: true }],
  'vars-on-top': 'error',
}

/** Medium: rest of current rules (not in easy, not in hard). */
const mediumRules: TFlatConfigItem['rules'] = {
  'consistent-this': 'error',
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
  'no-return-assign': 'error',
  'no-script-url': 'error',
  'no-sequences': 'error',
}

/** Hard: structural/architectural (complexity, depth, atomic updates). */
const hardRules: TFlatConfigItem['rules'] = {
  complexity: ['error', { max: 12 }],
  'max-depth': ['error', 2],
  'require-atomic-updates': 'error',
}

/** JavaScript rules by strictness preset. */
export const javascriptConfig: TStrictnessPresetMap = {
  [StrictnessPreset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [StrictnessPreset.EASY]: { rules: easyRules },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: { rules: mediumRules },
}
