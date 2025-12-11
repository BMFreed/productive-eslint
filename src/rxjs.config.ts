import type { TypedFlatConfigItem } from '@antfu/eslint-config'

import rxjs from '@smarttools/eslint-plugin-rxjs'

/** Configuration for eslint-plugin-rxjs */
export const rxjsConfig: TypedFlatConfigItem = {
  name: 'rxjs',
  plugins: { rxjs },
  rules: {
    'rxjs/finnish': 'error',
    // Critical rules
    'rxjs/no-async-subscribe': 'error',
    'rxjs/no-compat': 'error',
    'rxjs/no-connectable': 'error',
    'rxjs/no-create': 'error',
    // Useful rules
    'rxjs/no-cyclic-action': 'error',

    'rxjs/no-explicit-generics': 'error',
    'rxjs/no-exposed-subjects': 'error',
    // Recommended rules
    'rxjs/no-ignored-error': 'error',
    'rxjs/no-ignored-notifier': 'error',
    'rxjs/no-ignored-observable': 'error',
    'rxjs/no-ignored-replay-buffer': 'error',
    'rxjs/no-ignored-subscribe': 'error',
    'rxjs/no-ignored-subscription': 'error',
    'rxjs/no-ignored-takewhile-value': 'error',
    'rxjs/no-implicit-any-catch': 'error',
    'rxjs/no-index': 'error',

    'rxjs/no-internal': 'error',
    'rxjs/no-nested-subscribe': 'error',
    'rxjs/no-redundant-notify': 'error',
    'rxjs/no-sharereplay': 'error',
    'rxjs/no-subclass': 'error',
    'rxjs/no-subject-unsubscribe': 'error',
    'rxjs/no-subject-value': 'error',
    'rxjs/no-subscribe-handlers': 'error',
    'rxjs/no-topromise': 'error',
    'rxjs/no-unbound-methods': 'error',

    'rxjs/no-unsafe-catch': 'error',
    'rxjs/no-unsafe-first': 'error',
    'rxjs/no-unsafe-subject-next': 'error',
    'rxjs/no-unsafe-switchmap': 'error',
    'rxjs/no-unsafe-takeuntil': 'error',
    // Stylistic rules
    'rxjs/prefer-observer': 'error',
    'rxjs/suffix-subjects': 'error',
    'rxjs/throw-error': 'error',

    // Excluded rules:
    // - 'rxjs/just': excluded (not recommended for RxJS)
    // - 'rxjs/ban-observables': excluded (user should configure manually)
    // - 'rxjs/ban-operators': excluded (user should configure manually)
  },
}
