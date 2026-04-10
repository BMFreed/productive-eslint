import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'
import pluginUnusedImports from 'eslint-plugin-unused-imports'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

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

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'constructor-super': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-const-assign': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty-character-class': 'error',
  'no-empty-pattern': 'error',
  'no-empty-static-block': 'error',
  'no-ex-assign': 'error',
  'no-func-assign': 'error',
  'no-global-assign': 'error',
  'no-import-assign': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-loss-of-precision': 'error',
  'no-misleading-character-class': 'error',
  'no-multi-str': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-obj-calls': 'error',
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
  'no-self-compare': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-template-curly-in-string': 'error',
  'no-this-before-super': 'error',
  'no-unexpected-multiline': 'error',
  'no-unreachable': 'error',
  'no-unsafe-negation': 'error',
  'no-useless-backreference': 'error',
  'no-useless-call': 'error',
  'no-useless-catch': 'error',
  'no-useless-concat': 'error',
  'no-useless-constructor': 'error',
  'no-useless-escape': 'error',
  'no-with': 'error',
  'prefer-const': [
    'error',
    { destructuring: 'all', ignoreReadBeforeAssign: true },
  ],
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'use-isnan': [
    'error',
    { enforceForIndexOf: true, enforceForSwitchCase: true },
  ],
  'valid-typeof': ['error', { requireStringLiterals: true }],
}

/** JavaScript rules by preset. */
export const javascriptConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
