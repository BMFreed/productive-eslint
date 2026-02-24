import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import rxjs from '@smarttools/eslint-plugin-rxjs'

import type { TStrictnessPresetMap } from './strictness'

import { StrictnessPreset } from './strictness'

const shared = {
  files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
  name: 'rxjs',
  plugins: { rxjs },
} satisfies Pick<TypedFlatConfigItem, 'files' | 'name' | 'plugins'>

/** Easy: core + optional. */
const easyRules: TypedFlatConfigItem['rules'] = {
  'rxjs/no-compat': 'error',
  'rxjs/no-create': 'error',
  'rxjs/no-ignored-error': 'error',
  'rxjs/no-ignored-observable': 'error',
  'rxjs/no-ignored-replay-buffer': 'error',
  'rxjs/no-ignored-subscribe': 'error',
  'rxjs/no-ignored-subscription': 'error',
  'rxjs/no-implicit-any-catch': 'error',
  'rxjs/no-index': 'error',
  'rxjs/no-internal': 'error',
  'rxjs/no-topromise': 'error',
  'rxjs/no-unbound-methods': 'error',
  'rxjs/prefer-observer': 'error',
}

/** Medium: rest. */
const mediumRules: TypedFlatConfigItem['rules'] = {
  'rxjs/finnish': 'error',
  'rxjs/no-async-subscribe': 'error',
  'rxjs/no-cyclic-action': 'error',
  'rxjs/no-exposed-subjects': 'error',
  'rxjs/no-ignored-notifier': 'error',
  'rxjs/no-ignored-takewhile-value': 'error',
  'rxjs/no-redundant-notify': 'error',
  'rxjs/no-subclass': 'error',
  'rxjs/no-subject-unsubscribe': 'error',
  'rxjs/no-subject-value': 'error',
  'rxjs/no-unsafe-catch': 'error',
  'rxjs/no-unsafe-first': 'error',
  'rxjs/no-unsafe-subject-next': 'error',
  'rxjs/no-unsafe-takeuntil': 'error',
  'rxjs/suffix-subjects': 'error',
  'rxjs/throw-error': 'error',
}

/**
 * Hard: structural reactive flow (nested subscribe, connectable, shareReplay,
 * switchMap).
 */
const hardRules: TypedFlatConfigItem['rules'] = {
  'rxjs/no-connectable': 'error',
  'rxjs/no-nested-subscribe': 'error',
  'rxjs/no-sharereplay': 'error',
  'rxjs/no-subscribe-handlers': 'error',
  'rxjs/no-unsafe-switchmap': 'error',
}

/** RxJS rules by strictness preset. */
export const rxjsConfig: TStrictnessPresetMap = {
  [StrictnessPreset.EASY]: {
    ...shared,
    rules: easyRules,
  },
  [StrictnessPreset.HARD]: { rules: hardRules },
  [StrictnessPreset.MEDIUM]: {
    rules: mediumRules,
  },
}
