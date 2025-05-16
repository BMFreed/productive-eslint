import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import { javascript } from './javascript'

export default antfu({ plugins: { css: cssPlugin } }).override('antfu/javascript/rules', javascript)
