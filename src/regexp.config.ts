import regexp from 'eslint-plugin-regexp'

import type { TFlatConfigItem, TPresetMap } from './utils/presets'

import { Preset } from './utils/presets'

const shared = {
  plugins: { regexp },
} satisfies Pick<TFlatConfigItem, 'plugins'>

/** Auto-fixable: rules with ESLint autofix support. */
const autoFixableRules: TFlatConfigItem['rules'] = {
  'no-empty-character-class': 'off',
  'no-invalid-regexp': 'off',
  'no-regex-spaces': 'error',
  'no-useless-backreference': 'off',
  'regexp/control-character-escape': 'error',
  'regexp/match-any': 'error',
  'regexp/negation': 'error',
  'regexp/no-extra-lookaround-assertions': 'error',
  'regexp/no-invisible-character': 'error',
  'regexp/no-misleading-unicode-character': 'error',
  'regexp/no-missing-g-flag': 'error',
  'regexp/no-trivially-nested-assertion': 'error',
  'regexp/no-trivially-nested-quantifier': 'error',
  'regexp/no-useless-character-class': 'error',
  'regexp/no-useless-escape': 'error',
  'regexp/no-useless-flag': 'error',
  'regexp/no-useless-lazy': 'error',
  'regexp/no-useless-non-capturing-group': 'error',
  'regexp/no-useless-quantifier': 'error',
  'regexp/no-useless-range': 'error',
  'regexp/no-useless-set-operand': 'error',
  'regexp/no-useless-string-literal': 'error',
  'regexp/no-useless-two-nums-quantifier': 'error',
  'regexp/optimal-quantifier-concatenation': 'error',
  'regexp/prefer-character-class': 'error',
  'regexp/prefer-d': 'error',
  'regexp/prefer-plus-quantifier': 'error',
  'regexp/prefer-predefined-assertion': 'error',
  'regexp/prefer-question-quantifier': 'error',
  'regexp/prefer-range': 'error',
  'regexp/prefer-regexp-test': 'error',
  'regexp/prefer-set-operation': 'error',
  'regexp/prefer-star-quantifier': 'error',
  'regexp/prefer-unicode-codepoint-escapes': 'error',
  'regexp/prefer-w': 'error',
  'regexp/simplify-set-operations': 'error',
  'regexp/sort-flags': 'error',
  'regexp/strict': 'error',
  'regexp/use-ignore-case': 'error',
}

/** Recommended: mechanical non-autofixable rules for permanent analysis. */
const recommendedRules: TFlatConfigItem['rules'] = {
  'prefer-regex-literals': 'error',
  'regexp/no-dupe-characters-character-class': 'error',
  'regexp/no-empty-character-class': 'error',
  'regexp/no-empty-group': 'error',
  'regexp/no-empty-lookarounds-assertion': 'error',
  'regexp/no-empty-string-literal': 'error',
  'regexp/no-escape-backspace': 'error',
  'regexp/no-invalid-regexp': 'error',
  'regexp/no-non-standard-flag': 'error',
  'regexp/no-obscure-range': 'error',
  'regexp/no-useless-backreference': 'error',
  'regexp/no-useless-dollar-replacements': 'error',
  'regexp/no-zero-quantifier': 'error',
}

/** Regexp rules by preset. */
export const regexpConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [Preset.RECOMMENDED]: { rules: recommendedRules },
}
