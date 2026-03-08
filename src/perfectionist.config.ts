import perfectionist from 'eslint-plugin-perfectionist'

import type { TFlatConfigItem, TStrictnessPresetMap } from './utils/strictness'

import { StrictnessPreset } from './utils/strictness'

/** All perfectionist rules are auto-fixable (autofix sort). */
const rules: TFlatConfigItem['rules'] = {
  'perfectionist/sort-array-includes': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-classes': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-decorators': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-export-attributes': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-exports': [
    'error',
    {
      customGroups: [
        { elementNamePattern: '/lib/', groupName: 'lib' },
        { elementNamePattern: '/model/', groupName: 'model' },
        { elementNamePattern: '/ui/', groupName: 'ui' },
      ],
      groups: ['lib', 'model', 'ui'],
      type: 'natural',
    },
  ],
  'perfectionist/sort-heritage-clauses': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-import-attributes': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-imports': [
    'error',
    {
      customGroups: [
        { elementNamePattern: '/shared/', groupName: 'shared' },
        { elementNamePattern: '/entities/', groupName: 'entities' },
        { elementNamePattern: '/features/', groupName: 'features' },
        { elementNamePattern: '/widgets/', groupName: 'widgets' },
        { elementNamePattern: '/pages/', groupName: 'pages' },
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
  'perfectionist/sort-interfaces': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-intersection-types': [
    'error',
    {
      groups: [
        'conditional',
        'function',
        'import',
        'intersection',
        'keyword',
        'literal',
        'named',
        'object',
        'operator',
        'tuple',
        'union',
        'nullish',
      ],
    },
  ],
  'perfectionist/sort-jsx-props': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-maps': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-modules': [
    'error',
    {
      type: 'unsorted',
    },
  ],
  'perfectionist/sort-named-exports': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-named-imports': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-object-types': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-sets': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-switch-case': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
  'perfectionist/sort-union-types': [
    'error',
    {
      groups: [
        'conditional',
        'function',
        'import',
        'intersection',
        'keyword',
        'literal',
        'named',
        'object',
        'operator',
        'tuple',
        'union',
        'nullish',
      ],
    },
  ],
  'perfectionist/sort-variable-declarations': [
    'error',
    { order: 'asc', type: 'natural' },
  ],
}

/** Perfectionist sort rules by strictness preset. */
export const perfectionistConfig: TStrictnessPresetMap = {
  [StrictnessPreset.AUTO_FIXABLE]: {
    plugins: { perfectionist },
    rules,
  },
  [StrictnessPreset.EASY]: {},
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: {},
}
