import type { TypedFlatConfigItem } from '@antfu/eslint-config'

/** Configuration overrides for eslint-plugin-jsdoc */
export const jsdocConfig: TypedFlatConfigItem = {
  files: ['./src/**/*'],
  rules: {
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
  },
}
