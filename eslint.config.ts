import mainConfig from './src/index.config'

export default mainConfig
  .override('antfu/typescript/rules', {
    languageOptions: { parserOptions: { projectService: true } },
  })
  // Jiti пока не поддерживает алиасы путей,
  // из-за чего это правило невозможно использовать в данном репозитории
  // https://github.com/unjs/jiti/issues/373
  .remove('no-relative-import-paths')
