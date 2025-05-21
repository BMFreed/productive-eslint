import type { TSESLint } from '@typescript-eslint/utils'

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'

const MIN_DEPTH = 2
const DEFAULT_DEPTH = 3

const nestedIfRule = ESLintUtils.RuleCreator.withoutDocs<
  [number],
  'tooManyNestedIfStatements'
>({
  create: (context) => ({
    IfStatement: (node) => {
      const {
        options: [depth],
      } = context

      if (depth < MIN_DEPTH) {
        throw new Error('Depth should be 2 or above')
      }

      let ifStatementsCount = 0
      let { parent: activeNode } = node

      while (
        activeNode.type === AST_NODE_TYPES.BlockStatement &&
        activeNode.parent.type === AST_NODE_TYPES.IfStatement &&
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
      description: 'Prevent excessive use of nested if statements',
    },
    messages: {
      tooManyNestedIfStatements:
        'Too many nested if statements, maximum allowed is {{ depth }}',
    },
    schema: {
      description: 'Allowed number of nested if statements',
      items: { type: 'integer' },
      type: 'array',
    },
    type: 'problem',
  },
})

const noElseRule = ESLintUtils.RuleCreator.withoutDocs<[], 'noElse'>({
  create: (context) => ({
    IfStatement: (node) => {
      if (node.alternate) {
        context.report({
          messageId: 'noElse',
          node: node.alternate,
        })
      }
    },
  }),
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Prevent use of else statements',
    },
    messages: {
      noElse:
        'else/elseIf statements make code harder to read and are better replaced with an early return or omitting the else block entirely',
    },
    schema: [],
    type: 'problem',
  },
})

const preferConstEnumRule = ESLintUtils.RuleCreator.withoutDocs<
  [],
  'preferConstEnum'
>({
  create: (context) => ({
    TSEnumDeclaration: (node) => {
      if (!node.const) {
        context.report({
          messageId: 'preferConstEnum',
          node,
        })
      }
    },
  }),
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Prefer const enums over regular ones',
    },
    messages: {
      preferConstEnum:
        'Regular enums are compiled into functions, which is a redundant runtime overhead. ' +
        'Use const enums, as they are ignored during compilation, ' +
        'and their member accesses are compiled into plain strings',
    },
    schema: [],
    type: 'problem',
  },
})

export const productiveEslintPlugin = {
  rules: {
    'no-abusive-nested-if': nestedIfRule,
    'no-else': noElseRule,
    'prefer-const-enum': preferConstEnumRule,
  } satisfies Record<string, TSESLint.RuleModule<string, unknown[]>>,
}
