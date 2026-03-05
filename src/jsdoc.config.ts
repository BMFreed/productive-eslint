import pluginJsdoc from 'eslint-plugin-jsdoc'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

const shared = {
  files: ['./src/**/*'],
  plugins: { jsdoc: pluginJsdoc },
} satisfies Pick<TFlatConfigItem, 'files' | 'plugins'>

/** All jsdoc rules apply for easy preset. */
const easyRules: TFlatConfigItem['rules'] = {
  'jsdoc/require-jsdoc': [
    'error',
    {
      checkConstructors: false,
      contexts: [
        'TSPropertySignature',
        'TSMethodSignature',
        'TSTypeAliasDeclaration',
        'TSInterfaceDeclaration',
        'TSEnumDeclaration',
        'MethodDefinition',
        'ClassDeclaration',
        'ArrowFunctionExpression',
        'ObjectExpression',
        'PropertyDefinition',
      ],
      enableFixer: false,
      publicOnly: true,
    },
  ],
}

/** JSDoc rules by strictness preset. */
export const jsdocConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: {},
}
