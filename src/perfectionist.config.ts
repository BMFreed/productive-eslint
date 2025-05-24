import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import perfectionist from 'eslint-plugin-perfectionist'

/** Configuration overrides for eslint-plugin-perfectionist. */
export const perfectionistConfig: TypedFlatConfigItem = {
  rules: {
    ...perfectionist.configs['recommended-natural'].rules,
    'perfectionist/sort-exports': [
      'error',
      {
        customGroups: [
          {
            elementNamePattern: '/lib/',
            groupName: 'lib',
          },
          {
            elementNamePattern: '/model/',
            groupName: 'model',
          },
          {
            elementNamePattern: '/ui/',
            groupName: 'ui',
          },
        ],
        groups: ['lib', 'model', 'ui'],
        type: 'natural',
      },
    ],
    'perfectionist/sort-imports': [
      'error',
      {
        customGroups: [
          {
            elementNamePattern: '/shared/',
            groupName: 'shared',
          },
          {
            elementNamePattern: '/entities/',
            groupName: 'entities',
          },
          {
            elementNamePattern: '/features/',
            groupName: 'features',
          },
          {
            elementNamePattern: '/widgets/',
            groupName: 'widgets',
          },
          {
            elementNamePattern: '/pages/',
            groupName: 'pages',
          },
        ],
        groups: [
          'shared',
          'entities',
          'features',
          'widgets',
          'pages',
          'type-import',
          ['value-builtin', 'value-external'],
          'type-internal',
          'value-internal',
          ['type-parent', 'type-sibling', 'type-index'],
          ['value-parent', 'value-sibling', 'value-index'],
          'ts-equals-import',
          'unknown',
        ],
        type: 'natural',
      },
    ],
  },
}
