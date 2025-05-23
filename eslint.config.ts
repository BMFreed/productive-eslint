import createConfig from './src/index.config'

export default createConfig()
  .override('antfu/typescript/rules', {
    languageOptions: { parserOptions: { projectService: true } },
  })
  // At the moment, Jiti does not support typescript path aliases,
  // which makes this config unusable inside this repo.
  // https://github.com/unjs/jiti/issues/373
  .remove('no-relative-import-paths')
