import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import boundaries from 'eslint-plugin-boundaries'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

const shared = {
  name: 'boundaries',
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { pattern: 'app', type: 'app' },
      { capture: ['page'], pattern: 'pages/*', type: 'pages' },
      { capture: ['widget'], pattern: 'widgets/*', type: 'widgets' },
      { capture: ['feature'], pattern: 'features/*', type: 'features' },
      { capture: ['entity'], pattern: 'entities/*', type: 'entities' },
      { capture: ['segment'], pattern: 'shared/*', type: 'shared' },
    ],
    'boundaries/include': ['src/**/*'],
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
    },
  },
} satisfies Pick<TypedFlatConfigItem, 'name' | 'plugins' | 'settings'>

/** Easy: boundaries excluded (research). */
const easyRules: TypedFlatConfigItem['rules'] = {}

/** Medium: empty (boundaries rules are in hard). */
const mediumRules: TypedFlatConfigItem['rules'] = {}

/** Hard: FSD/architecture (element-types, entry-point). */
const hardRules: TypedFlatConfigItem['rules'] = {
  'boundaries/element-types': [
    'error',
    {
      default: 'allow',
      message: '${file.type} is not allowed to import (${dependency.type})',
      rules: [
        {
          disallow: ['app', 'pages', 'widgets', 'features', 'entities'],
          from: ['shared'],
          message:
            'Shared module must not import upper layers (${dependency.type})',
        },
        {
          disallow: ['app', 'pages', 'widgets', 'features'],
          from: ['entities'],
          message: 'Entity must not import upper layers (${dependency.type})',
        },
        {
          disallow: [['entities', { entity: '!${entity}' }]],
          from: ['entities'],
          message: 'Entity must not import other entity',
        },
        {
          disallow: ['app', 'pages', 'widgets'],
          from: ['features'],
          message: 'Feature must not import upper layers (${dependency.type})',
        },
        {
          disallow: [['features', { feature: '!${feature}' }]],
          from: ['features'],
          message: 'Feature must not import other feature',
        },
        {
          disallow: ['app', 'pages'],
          from: ['widgets'],
          message: 'Feature must not import upper layers (${dependency.type})',
        },
        {
          disallow: [['widgets', { widget: '!${widget}' }]],
          from: ['widgets'],
          message: 'Widget must not import other widget',
        },
        {
          disallow: ['app'],
          from: ['pages'],
          message: 'Page must not import upper layers (${dependency.type})',
        },
        {
          disallow: [['pages', { page: '!${page}' }]],
          from: ['pages'],
          message: 'Page must not import other page',
        },
      ],
    },
  ],
  'boundaries/entry-point': [
    'error',
    {
      default: 'disallow',
      rules: [
        { allow: '**', target: ['shared'] },
        {
          allow: 'index.{ts,vue}',
          target: ['app', 'pages', 'widgets', 'features', 'entities'],
        },
      ],
    },
  ],
}

/** Boundaries rules by strictness preset. */
export const boundariesConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: {
    rules: mediumRules,
  },
}
