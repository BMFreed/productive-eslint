import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import sonarjs from 'eslint-plugin-sonarjs'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

const shared = {
  name: 'sonarjs',
  plugins: { sonarjs },
} satisfies Pick<TypedFlatConfigItem, 'name' | 'plugins'>

/** Easy: core + optional. */
const easyRules: TypedFlatConfigItem['rules'] = {
  'sonarjs/no-fallthrough': 'error',
  'sonarjs/no-redundant-boolean': 'error',
  'sonarjs/no-redundant-jump': 'error',
  'sonarjs/non-existent-operator': 'error',
  'sonarjs/prefer-immediate-return': 'error',
  'sonarjs/public-static-readonly': 'error',
}

/** Medium: rest. */
const mediumRules: TypedFlatConfigItem['rules'] = {
  'sonarjs/bool-param-default': 'error',
  'sonarjs/comma-or-logical-or-case': 'error',
  'sonarjs/future-reserved-words': 'error',
  'sonarjs/index-of-compare-to-positive-number': 'error',
  'sonarjs/link-with-target-blank': 'error',
  'sonarjs/no-array-delete': 'error',
  'sonarjs/no-duplicate-in-composite': 'error',
  'sonarjs/no-for-in-iterable': 'error',
  'sonarjs/no-function-declaration-in-block': 'error',
  'sonarjs/no-global-this': 'error',
  'sonarjs/no-globals-shadowing': 'error',
  'sonarjs/no-identical-conditions': 'error',
  'sonarjs/no-identical-expressions': 'error',
  'sonarjs/no-identical-functions': 'error',
  'sonarjs/no-ignored-return': 'error',
  'sonarjs/no-in-misuse': 'error',
  'sonarjs/no-incorrect-string-concat': 'error',
  'sonarjs/no-internal-api-use': 'error',
  'sonarjs/no-misleading-array-reverse': 'error',
  'sonarjs/no-nested-template-literals': 'error',
  'sonarjs/no-redundant-assignments': 'error',
  'sonarjs/no-redundant-optional': 'error',
  'sonarjs/no-selector-parameter': 'error',
  'sonarjs/no-small-switch': 'error',
  'sonarjs/no-try-promise': 'error',
  'sonarjs/no-undefined-assignment': 'error',
  'sonarjs/no-unthrown-error': 'error',
  'sonarjs/no-unused-collection': 'error',
  'sonarjs/no-unused-function-argument': 'error',
  'sonarjs/no-use-of-empty-return-value': 'error',
  'sonarjs/no-useless-intersection': 'error',
  'sonarjs/object-alt-content': 'error',
  'sonarjs/post-message': 'error',
  'sonarjs/prefer-promise-shorthand': 'error',
  'sonarjs/reduce-initial-value': 'error',
  'sonarjs/strings-comparison': 'error',
  'sonarjs/table-header': 'error',
  'sonarjs/table-header-reference': 'error',
}

/**
 * Hard: structural (expression complexity, duplicated branches, nested switch,
 * loop control, async constructor, invariant returns).
 */
const hardRules: TypedFlatConfigItem['rules'] = {
  'sonarjs/expression-complexity': ['error', { max: 2 }],
  'sonarjs/no-all-duplicated-branches': 'error',
  'sonarjs/no-async-constructor': 'error',
  'sonarjs/no-invariant-returns': 'error',
  'sonarjs/no-nested-switch': 'error',
  'sonarjs/too-many-break-or-continue-in-loop': 'error',
}

/** SonarJS rules by strictness preset. */
export const sonarJsConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: {
    rules: mediumRules,
  },
}
