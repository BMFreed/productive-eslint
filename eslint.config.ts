import createConfig from './src/index.config'

export default createConfig({ ignores: ['**/*.md'] })
  .override('antfu/typescript/rules', {
    languageOptions: { parserOptions: { projectService: true } },
  })
  // At the moment, Jiti does not support typescript path aliases,
  // which makes this config unusable inside this repo.
  // https://github.com/unjs/jiti/issues/373
  .remove('no-relative-import-paths')
  .append({
    files: ['scripts/**'],
    rules: {
      'max-depth': 'off',
      'productive/no-abusive-nested-if': 'off',
      'productive/no-else': 'off',
      'promise/no-multiple-resolved': 'off',
      'promise/prefer-await-to-then': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  })
