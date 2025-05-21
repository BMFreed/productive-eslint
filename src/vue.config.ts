import type { Rules, TypedFlatConfigItem } from '@antfu/eslint-config'

const coveredByPrettier: Rules = {
  'vue/array-bracket-spacing': 'off',
  'vue/arrow-spacing': 'off',
  'vue/block-spacing': 'off',
  'vue/block-tag-newline': 'off',
  'vue/brace-style': 'off',
  'vue/comma-dangle': 'off',
  'vue/comma-spacing': 'off',
  'vue/comma-style': 'off',
  'vue/dot-location': 'off',
  'vue/first-attribute-linebreak': 'off',
  'vue/html-closing-bracket-newline': 'off',
  'vue/html-closing-bracket-spacing': 'off',
  'vue/html-indent': 'off',
  'vue/html-quotes': 'off',
  'vue/key-spacing': 'off',
  'vue/keyword-spacing': 'off',
  'vue/multiline-html-element-content-newline': 'off',
  'vue/mustache-interpolation-spacing': 'off',
  'vue/no-multi-spaces': 'off',
  'vue/no-spaces-around-equal-signs-in-attribute': 'off',
  'vue/object-curly-spacing': 'off',
  'vue/object-property-newline': 'off',
  'vue/operator-linebreak': 'off',
  'vue/quote-props': 'off',
  'vue/singleline-html-element-content-newline': 'off',
  'vue/space-in-parens': 'off',
  'vue/space-infix-ops': 'off',
  'vue/space-unary-ops': 'off',
  'vue/template-curly-spacing': 'off',
}

// Rules below are not needed for Vue 3
const old: Rules = {
  'vue/no-computed-properties-in-data': 'off',
  'vue/no-deprecated-data-object-declaration': 'off',
  'vue/no-shared-component-data': 'off',
}

// Rules below are not needed with TypeScript
const coveredByTypescript: Rules = {
  'vue/no-use-computed-property-like-method': 'off',
  'vue/require-prop-type-constructor': 'off',
  'vue/require-slots-as-functions': 'off',
  'vue/require-valid-default-prop': 'off',
  'vue/return-in-computed-property': 'off',
  'vue/return-in-emits-validator': 'off',
}

export const vueConfig: TypedFlatConfigItem = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        message: `Emits aren't guaranteed to have listeners attached to them. 
          Better pass event handlers as props with the "on" prefix instead`,
        selector: "CallExpression[callee.name='defineEmits']",
      },
      {
        message: 'Use ref instead of reactive for code consistency',
        selector: 'CallExpression[callee.name="reactive"]',
      },
      {
        message:
          'Use the @ (v-on) directive instead and pass the event handler without the "on" prefix',
        selector: 'VDirectiveKey[argument.rawName=/^on.*/]',
      },
    ],

    'vue/attribute-hyphenation': ['error', 'never'],
    'vue/attributes-order': ['error', { alphabetical: true }],
    'vue/block-lang': ['error', { script: { lang: 'ts' } }],
    'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    'vue/comment-directive': [
      'error',
      {
        reportUnusedDisableDirectives: true,
      },
    ],
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/define-macros-order': [
      'error',
      {
        defineExposeLast: true,
        order: [
          'defineOptions',
          'defineModel',
          'defineProps',
          'defineEmits',
          'defineSlots',
        ],
      },
    ],
    'vue/define-props-declaration': 'error',
    'vue/define-props-destructuring': 'error',
    'vue/enforce-style-attribute': ['error', { allow: ['module'] }],
    'vue/html-button-has-type': 'error',
    //Covered by vue/html-self-closing
    'vue/html-end-tags': 'off',
    'vue/html-self-closing': ['error', { html: { void: 'always' } }],
    'vue/no-console': 'error',
    'vue/no-constant-condition': 'error',
    'vue/no-duplicate-attr-inheritance': 'error',
    'vue/no-empty-component-block': 'error',
    'vue/no-implicit-coercion': 'error',
    'vue/no-import-compiler-macros': 'error',
    'vue/no-lone-template': 'error',
    'vue/no-multiple-objects-in-class': 'error',
    'vue/no-multiple-slot-args': 'error',
    'vue/no-ref-object-reactivity-loss': 'error',
    'vue/no-required-prop-with-default': 'error',
    'vue/no-restricted-block': 'error',
    'vue/no-root-v-if': 'error',
    'vue/no-static-inline-styles': 'error',
    'vue/no-template-shadow': 'error',
    'vue/no-template-target-blank': 'error',
    'vue/no-undef-components': 'error',
    'vue/no-unused-refs': 'error',
    'vue/no-use-v-else-with-v-for': 'error',
    'vue/no-useless-mustaches': 'error',
    'vue/no-v-html': 'error',
    'vue/no-v-text': 'error',
    'vue/order-in-components': 'error',
    'vue/prefer-true-attribute-shorthand': 'error',
    'vue/prefer-use-template-ref': 'error',
    'vue/require-explicit-emits': 'error',
    'vue/require-macro-variable-name': 'error',
    'vue/require-typed-ref': 'error',
    'vue/script-indent': 'error',
    'vue/slot-name-casing': 'error',
    'vue/this-in-template': 'error',
    'vue/v-bind-style': ['error', 'shorthand', { sameNameShorthand: 'always' }],
    'vue/v-for-delimiter-style': ['error', 'of'],
    'vue/v-if-else-key': 'error',
    'vue/v-on-event-hyphenation': ['error', 'never', { autofix: true }],
    'vue/v-on-handler-style': ['error', 'inline'],
    'vue/v-on-style': 'error',
    'vue/v-slot-style': [
      'error',
      {
        atComponent: 'v-slot',
        default: 'v-slot',
        named: 'longform',
      },
    ],
    ...coveredByPrettier,
    ...old,
    ...coveredByTypescript,
  },
}
