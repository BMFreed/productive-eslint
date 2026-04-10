# Permanent Rules Inventory

Working inventory for the AI-first permanent baseline.

The permanent baseline should be:

- always enabled at repository level;
- safe for AI agents to fix without designing code;
- limited to syntax, compile-time validity, local normalization, and trivial cleanup;
- free from migration, architecture, API design, broad type-safety, and business-logic decisions.

## Baseline Shape

The recommended permanent preset is:

1. Every rule that is currently in an `AUTO_FIXABLE` bucket.
2. The always-on data format rules from JSONC, YAML, and TOML configs, except the TOML order rules called out below.
3. The extra non-autofixable mechanical rules listed in this document.

This document intentionally lists only the extra non-autofixable candidates. It does not duplicate the existing `AUTO_FIXABLE` rule maps.

## Extra Non-Autofixable Rules

Unless a section says otherwise, these rules are currently taken from that
config file's `easyRules` bucket.

### JavaScript

From `src/javascript.config.ts`:

- `constructor-super` - class correctness; the fix is local to the constructor/super call.
- `no-case-declarations` - wrap `case` bodies in block scope.
- `no-class-assign` - invalid class reassignment.
- `no-compare-neg-zero` - replace the impossible `-0` comparison with the intended check.
- `no-const-assign` - invalid const reassignment.
- `no-control-regex` - remove or spell control characters explicitly.
- `no-debugger` - remove debugger statements.
- `no-delete-var` - remove invalid variable deletion.
- `no-dupe-args` - remove or rename duplicate parameters.
- `no-dupe-class-members` - remove or rename duplicate class members.
- `no-dupe-keys` - remove or rename duplicate object keys.
- `no-duplicate-case` - remove or merge duplicate switch cases.
- `no-empty-character-class` - fix an invalid regular expression character class.
- `no-empty-pattern` - remove empty destructuring patterns.
- `no-empty-static-block` - remove empty static blocks.
- `no-ex-assign` - stop reassigning catch bindings.
- `no-func-assign` - stop reassigning function declarations.
- `no-global-assign` - stop assigning to read-only globals.
- `no-import-assign` - stop assigning to imported bindings.
- `no-invalid-regexp` - fix invalid regular expressions.
- `no-irregular-whitespace` - remove invisible whitespace.
- `no-loss-of-precision` - rewrite numeric literals that lose precision.
- `no-misleading-character-class` - fix misleading unicode regex character classes.
- `no-multi-str` - replace escaped multiline strings with normal strings or template literals.
- `no-new-native-nonconstructor` - remove invalid `new` usage.
- `no-obj-calls` - remove invalid calls of global object constructors.
- `no-octal` - replace legacy octal literals.
- `no-octal-escape` - replace octal escape sequences.
- `no-proto` - replace `__proto__` usage with standard Object APIs.
- `no-redeclare` - remove or rename duplicate declarations.
- `no-restricted-globals` - replace configured globals with `globalThis`.
- `no-restricted-properties` - replace configured legacy properties with standard Object APIs.
- `no-self-compare` - remove impossible self-comparisons.
- `no-shadow-restricted-names` - rename variables that shadow restricted names.
- `no-sparse-arrays` - remove array holes.
- `no-template-curly-in-string` - convert mistaken interpolation strings to template literals.
- `no-this-before-super` - move `this` usage after `super()`.
- `no-unexpected-multiline` - make ASI-sensitive syntax explicit.
- `no-unreachable` - remove unreachable statements.
- `no-unsafe-negation` - parenthesize or rewrite unsafe negation.
- `no-useless-backreference` - remove useless regex backreferences.
- `no-useless-call` - remove redundant `.call()` or `.apply()`.
- `no-useless-catch` - remove catch blocks that only rethrow.
- `no-useless-concat` - merge static string concatenation.
- `no-useless-constructor` - remove constructors that do nothing.
- `no-useless-escape` - remove unnecessary escapes.
- `no-with` - remove `with`; it is invalid in strict/module code.
- `prefer-const` - replace `let` with `const` when there is no reassignment.
- `prefer-regex-literals` - use regex literals for static patterns.
- `prefer-rest-params` - replace `arguments` with rest parameters.
- `prefer-spread` - replace simple `.apply()` calls with spread syntax.
- `use-isnan` - replace invalid `NaN` checks with `Number.isNaN` or `isNaN`.
- `valid-typeof` - fix invalid `typeof` comparisons.

### TypeScript

From `src/typescript.config.ts`:

- `@typescript-eslint/explicit-member-accessibility` - add explicit member visibility; this is type-only output.
- `@typescript-eslint/no-dupe-class-members` - remove or rename duplicate class members.
- `@typescript-eslint/no-misused-new` - fix constructor/new signature placement in types.
- `@typescript-eslint/no-non-null-asserted-nullish-coalescing` - remove useless non-null assertions before `??`.
- `@typescript-eslint/no-non-null-asserted-optional-chain` - remove unsafe non-null assertions after optional chains.
- `@typescript-eslint/no-redeclare` - remove or rename duplicate declarations.
- `@typescript-eslint/no-redundant-type-constituents` - remove redundant union/intersection members.
- `@typescript-eslint/no-unnecessary-type-constraint` - remove empty generic constraints such as `extends unknown`.
- `@typescript-eslint/no-useless-constructor` - remove constructors that do nothing.

### ESLint Comments

From `src/eslintComments.config.ts`:

- `eslint-comments/no-aggregating-enable` - replace broad enable comments with exact rule enables.
- `eslint-comments/no-duplicate-disable` - remove duplicate disable comments.
- `eslint-comments/no-unlimited-disable` - replace bare disables with rule-specific disables.
- `eslint-comments/no-unused-enable` - remove enable comments that do nothing.

### Node

From `src/node.config.ts`:

- `n/no-exports-assign` - replace invalid `exports = ...` assignments with `module.exports = ...`.
- `n/no-new-require` - split `new require(...)` into a require binding plus construction.
- `n/no-path-concat` - replace `__dirname` or `__filename` string concatenation with path helpers.
- `n/prefer-global/buffer` - enforce the configured Buffer access style.
- `n/prefer-global/process` - enforce the configured process access style.

### Imports

From `src/import.config.ts`:

- `import/consistent-type-specifier-style` - normalize type specifier placement.
- `import/extensions` - remove configured JS/TS extensions from local imports.
- `import/no-duplicates` - merge duplicate imports.
- `import/no-named-default` - replace named `default` imports with default imports.
- `import/no-self-import` - remove imports that point to the current module.
- `import/no-useless-path-segments` - simplify import paths.

### Vue

From `src/vue.config.ts`:

- `vue/block-lang` - require `lang="ts"` on script blocks.
- `vue/comment-directive` - remove unused ESLint directive comments in Vue files.
- `vue/define-macros-order` - normalize compiler macro order.
- `vue/define-props-declaration` - enforce the chosen `defineProps` declaration style.
- `vue/define-props-destructuring` - enforce props destructuring for projects that target Vue 3.5+ reactive props destructure.
- `vue/html-comment-content-spacing` - normalize Vue HTML comment spacing.
- `vue/jsx-uses-vars` - support JSX variable usage detection.
- `vue/no-deprecated-delete-set` - remove deprecated Vue API usage.
- `vue/no-deprecated-dollar-listeners-api` - remove deprecated Vue API usage.
- `vue/no-deprecated-events-api` - remove deprecated Vue API usage.
- `vue/no-deprecated-filter` - remove deprecated Vue API usage.
- `vue/no-deprecated-functional-template` - remove deprecated Vue API usage.
- `vue/no-deprecated-html-element-is` - remove deprecated Vue API usage.
- `vue/no-deprecated-inline-template` - remove deprecated Vue API usage.
- `vue/no-deprecated-model-definition` - remove deprecated Vue API usage.
- `vue/no-deprecated-props-default-this` - remove deprecated Vue API usage.
- `vue/no-deprecated-router-link-tag-prop` - remove deprecated Vue API usage.
- `vue/no-deprecated-v-is` - remove deprecated Vue API usage.
- `vue/no-deprecated-v-on-native-modifier` - remove deprecated Vue API usage.
- `vue/no-deprecated-vue-config-keycodes` - remove deprecated Vue API usage.
- `vue/no-dupe-keys` - remove or rename duplicate component keys.
- `vue/no-dupe-v-else-if` - remove duplicate `v-else-if` conditions.
- `vue/no-duplicate-attributes` - remove duplicate attributes.
- `vue/no-empty-pattern` - remove empty destructuring patterns.
- `vue/no-export-in-script-setup` - remove exports from `<script setup>`.
- `vue/no-irregular-whitespace` - remove invisible whitespace.
- `vue/no-lone-template` - remove useless `<template>` wrappers.
- `vue/no-loss-of-precision` - rewrite numeric literals that lose precision.
- `vue/no-multiple-objects-in-class` - normalize class bindings.
- `vue/no-multiple-slot-args` - fix invalid slot argument usage.
- `vue/no-parsing-error` - keep templates syntactically valid.
- `vue/no-reserved-component-names` - rename reserved component names.
- `vue/no-reserved-keys` - rename reserved keys.
- `vue/no-reserved-props` - rename reserved props.
- `vue/no-restricted-v-bind` - prevent binding directive-looking attributes.
- `vue/no-template-key` - remove obsolete template keys.
- `vue/no-textarea-mustache` - replace textarea mustaches with binding or `v-model`.
- `vue/no-useless-template-attributes` - remove useless template attributes.
- `vue/no-v-for-template-key-on-child` - move `key` to `<template v-for>`.
- `vue/prefer-true-attribute-shorthand` - normalize boolean attributes.
- `vue/require-component-is` - enforce valid dynamic component syntax.
- `vue/require-macro-variable-name` - enforce macro result variable names.
- `vue/require-render-return` - require render functions to return.
- `vue/require-slots-as-functions` - call slots as functions.
- `vue/require-toggle-inside-transition` - enforce valid transition toggle placement.
- `vue/return-in-computed-property` - require computed getters to return.
- `vue/return-in-emits-validator` - require emits validators to return.
- `vue/valid-attribute-name` - keep attribute names valid.
- `vue/valid-define-emits` - keep `defineEmits` usage valid.
- `vue/valid-define-options` - keep `defineOptions` usage valid.
- `vue/valid-define-props` - keep `defineProps` usage valid.
- `vue/valid-template-root` - keep template roots valid.
- `vue/valid-v-bind` - keep `v-bind` usage valid.
- `vue/valid-v-cloak` - keep `v-cloak` usage valid.
- `vue/valid-v-else` - keep `v-else` usage valid.
- `vue/valid-v-else-if` - keep `v-else-if` usage valid.
- `vue/valid-v-for` - keep `v-for` usage valid.
- `vue/valid-v-html` - keep `v-html` usage valid.
- `vue/valid-v-if` - keep `v-if` usage valid.
- `vue/valid-v-is` - keep `v-is` usage valid.
- `vue/valid-v-memo` - keep `v-memo` usage valid.
- `vue/valid-v-model` - keep `v-model` usage valid.
- `vue/valid-v-on` - keep `v-on` usage valid.
- `vue/valid-v-once` - keep `v-once` usage valid.
- `vue/valid-v-pre` - keep `v-pre` usage valid.
- `vue/valid-v-show` - keep `v-show` usage valid.
- `vue/valid-v-slot` - keep `v-slot` usage valid.
- `vue/valid-v-text` - keep `v-text` usage valid.

### CSS

From `src/css.config.ts` `mediumRules`:

- `css/no-duplicate-imports` - remove duplicate CSS imports.
- `css/no-duplicate-keyframe-selectors` - remove or merge duplicate keyframe selectors.
- `css/no-empty-blocks` - remove empty CSS blocks.
- `css/no-invalid-at-rule-placement` - keep at-rule placement valid.
- `css/no-invalid-at-rules` - keep at-rules valid.
- `css/no-invalid-named-grid-areas` - keep named grid areas valid.
- `css/no-invalid-properties` - keep CSS properties valid.

### Unicorn

From `src/unicorn.config.ts`:

- `unicorn/no-useless-undefined` - remove redundant explicit `undefined`.
- `unicorn/prefer-array-some` - replace existence checks with `.some()`.
- `unicorn/prefer-set-has` - replace Set lookup patterns with `.has()`.
- `unicorn/prefer-spread` - replace simple `.apply()` calls with spread syntax.
- `unicorn/prefer-string-slice` - replace simple `substr` or `substring` usage with `slice`.

### SonarJS

From `src/sonarJs.config.ts`:

- `sonarjs/no-redundant-boolean` - simplify redundant boolean expressions.
- `sonarjs/no-redundant-jump` - remove redundant terminal jumps.
- `sonarjs/non-existent-operator` - fix typo-like operator mistakes.
- `sonarjs/public-static-readonly` - add TypeScript-only `readonly` to public static fields where applicable.

### Promise

From `src/promise.config.ts`:

- `promise/no-return-wrap` - remove redundant `Promise.resolve` or `Promise.reject` wrapping in chains.
- `promise/param-names` - normalize Promise executor parameter names.
- `promise/valid-params` - keep Promise API calls structurally valid.

### RxJS

From `src/rxjs.config.ts`:

- `rxjs/no-compat` - prevent legacy compat imports.
- `rxjs/no-create` - replace deprecated `Observable.create`.
- `rxjs/no-index` - avoid RxJS index imports when the rule can point to a concrete path.

### RegExp

From `src/regexp.config.ts`:

- `regexp/no-dupe-characters-character-class` - remove duplicate character class members.
- `regexp/no-empty-character-class` - fix empty character classes.
- `regexp/no-empty-group` - remove empty groups.
- `regexp/no-empty-lookarounds-assertion` - remove empty lookaround assertions.
- `regexp/no-empty-string-literal` - remove empty string literals in regex construction.
- `regexp/no-escape-backspace` - spell backspace escapes explicitly.
- `regexp/no-invalid-regexp` - keep regular expressions valid.
- `regexp/no-non-standard-flag` - remove non-standard flags.
- `regexp/no-obscure-range` - make character ranges explicit.
- `regexp/no-useless-backreference` - remove useless backreferences.
- `regexp/no-useless-dollar-replacements` - remove useless replacement placeholders.
- `regexp/no-zero-quantifier` - remove zero-quantified patterns.
- `regexp/prefer-regex-literals` - use regex literals for static patterns.

## Always-On Data Format Rules

The JSONC, YAML, and TOML configs are already always active and mostly match the permanent baseline philosophy.

Keep:

- all current `jsonc/*` rules;
- all current `yml/*` rules;
- all current `toml/*` rules except the TOML ordering rules below.

Review before keeping in the permanent baseline:

- `toml/keys-order`
- `toml/tables-order`

TOML ordering is mechanically fixable, but humans often use table/key order as documentation structure.

## Keep Out Of The Permanent Baseline

These rules are useful, but they should become agent-invoked analysis handles or stricter opt-in presets instead of always-on repository noise.

### Migration And Type-Safety Debt

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unsafe-argument`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/switch-exhaustiveness-check`
- `@typescript-eslint/no-non-null-assertion`
- `@typescript-eslint/prefer-readonly`

### API Or Public Contract Decisions

- `@typescript-eslint/explicit-function-return-type`
- `@typescript-eslint/consistent-type-definitions`
- `@typescript-eslint/naming-convention`
- `@typescript-eslint/unified-signatures`
- `import/no-commonjs`
- `import/no-mutable-exports`
- `import/no-namespace`
- `import/no-relative-packages`
- `vue/component-api-style`
- `vue/custom-event-name-casing`
- `vue/prop-name-casing`
- `vue/require-explicit-emits`
- `vue/slot-name-casing`

### Runtime Or Architecture Decisions

- `boundaries/*`
- `productive/no-abusive-nested-if`
- `productive/no-else`
- `complexity`
- `max-depth`
- `require-atomic-updates`
- `promise/always-return`
- `promise/catch-or-return`
- `promise/no-return-in-finally`
- `rxjs/no-ignored-observable`
- `rxjs/no-ignored-subscribe`
- `rxjs/no-ignored-subscription`
- `rxjs/no-nested-subscribe`
- `sonarjs/expression-complexity`
- `sonarjs/no-identical-functions`
- `unicorn/no-document-cookie`
- `unicorn/no-invalid-remove-event-listener`

### "Looks Mechanical, But Has Edge Semantics"

- `default-case-last` - moving `default` can affect fallthrough behavior.
- `no-lone-blocks` - removing blocks can change lexical scope.
- `no-new-wrappers` - wrapper objects and primitives differ at runtime.
- `no-self-assign` - property self-assignment can trigger setters.
- `@typescript-eslint/return-await` - stack trace and Promise behavior policy.
- `@typescript-eslint/no-duplicate-enum-values` - duplicate enum values can be intentional aliases.
- `css/font-family-fallbacks` - design and font availability.
- `css/no-important` - design-system policy.
- `css/no-unmatchable-selectors` - can depend on runtime DOM.
- `css/use-baseline` - browser support policy.
- `unicorn/prefer-dom-node-text-content` - `innerText` and `textContent` are not equivalent.
- `unicorn/prefer-number-properties` - global and `Number.*` functions differ for coercion.
- `unicorn/prefer-math-trunc` - truncation idioms can differ for 32-bit edge cases.
- `unicorn/prefer-top-level-await` - module loading and platform policy.
- most `regexp/no-super-linear-*` or ambiguity rules - often require domain knowledge of the accepted language.
