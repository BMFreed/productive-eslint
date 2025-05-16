import mainConfig from './index'

export default mainConfig
  .override('antfu/typescript/rules', { languageOptions: { parserOptions: { projectService: true } } })
  .override('antfu/javascript/rules', { rules: { 'no-magic-numbers': 'off' } })
