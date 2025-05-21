import type { TSESLint } from '@typescript-eslint/utils'

import { ESLintUtils } from '@typescript-eslint/utils'

const MIN_DEPTH = 2
const DEFAULT_DEPTH = 3

const nestedIfRule = ESLintUtils.RuleCreator.withoutDocs<
  [number],
  'tooManyNestedIfStatements'
>({
  create: (context) => ({
    IfStatement: (node) => {
      const depth = context.options[0] ?? DEFAULT_DEPTH

      if (depth < MIN_DEPTH) {
        throw new Error('Depth should be 2 or above')
      }

      let ifStatementsCount = 0
      let { parent: activeNode } = node

      while (
        activeNode.type === 'BlockStatement' &&
        activeNode.parent.type === 'IfStatement' &&
        ifStatementsCount !== depth - 1
      ) {
        ifStatementsCount += 1
        activeNode = activeNode.parent
      }

      if (ifStatementsCount === depth - 1) {
        context.report({
          data: { depth },
          messageId: 'tooManyNestedIfStatements',
          node,
        })
      }
    },
  }),
  defaultOptions: [DEFAULT_DEPTH],
  meta: {
    docs: {
      description: 'Prevent excessive use of nested if-statements',
    },
    messages: {
      tooManyNestedIfStatements:
        'Too many nested if-statements, maximum allowed is {{ depth }}',
    },
    schema: {
      description: 'Allowed number of nested if-statements',
      items: { type: 'integer' },
      type: 'array',
    },
    type: 'problem',
  },
})

export const nestedIfPlugin = {
  rules: {
    'no-abusive-nested-if': nestedIfRule,
  } satisfies Record<string, TSESLint.RuleModule<string, Array<unknown>>>,
}
