import mainConfig from './src/index'

export default mainConfig
  .override('antfu/typescript/rules', {
    languageOptions: { parserOptions: { projectService: true } },
  })
  .override('antfu/javascript/rules', {
    rules: { 'no-magic-numbers': 'off', 'no-template-curly-in-string': 'off' },
  })
  .override('antfu/imports/rules', {
    rules: { 'import/no-default-export': 'off' },
  })
  // Jiti пока не поддерживает алиасы путей,
  // из-за чего это правило невозможно использовать в данном репозитории
  // https://github.com/unjs/jiti/issues/373
  .remove('no-relative-import-paths')
