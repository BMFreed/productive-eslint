import type { TypedFlatConfigItem } from '@antfu/eslint-config'
import type { Config } from 'eslint/config'

import perfectionist from 'eslint-plugin-perfectionist'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

/** All perfectionist rules are easy (autofix sort). */
const rules: TypedFlatConfigItem['rules'] = {
  // eslint-disable-next-line ts/no-unnecessary-condition -- plugin types may omit configs
  ...(perfectionist.configs?.['recommended-natural'] as Config).rules,
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
  'perfectionist/sort-modules': [
    'error',
    {
      groups: [
        'declare-enum',
        'enum',
        ['declare-interface', 'declare-type'],
        ['interface', 'type'],
        'declare-class',
        'class',
        'declare-function',
        'function',
        'export-enum',
        ['export-interface', 'export-type'],
        'export-class',
        'export-function',
      ],
    },
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
}

/** Perfectionist sort rules by strictness preset. */
export const perfectionistConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    plugins: { perfectionist },
    rules,
  },
  [StrictnessPreset.HARD]: {},
  [StrictnessPreset.MEDIUM]: {},
}
