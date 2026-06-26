import { createConfig } from '../../../../../dist/index.config.js'

export default createConfig({
  react: true,
  tailwind: {
    cssConfigPath: 'src/tailwind.css',
  },
})
