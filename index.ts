import antfu from '@antfu/eslint-config'
import cssPlugin from '@eslint/css'
import { feautureSlice } from './feautureSlice'
import { javascript } from './javascript'

export default antfu({ plugins: { css: cssPlugin } }, feautureSlice)
  .override('antfu/javascript/rules', javascript)
