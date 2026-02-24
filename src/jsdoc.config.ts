import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

/** All jsdoc rules apply for easy preset. */
const easyRules: TypedFlatConfigItem['rules'] = {
  'jsdoc/no-bad-blocks': 'error',
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
    files: ['./src/**/*'],
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: {},
}
