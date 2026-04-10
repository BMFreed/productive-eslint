import type { TFlatConfigItem } from './utils/presets'

import { GLOB_SRC, GLOB_SRC_EXT } from './utils/globs'

/** File-pattern disable configs. */
export const disablesConfigs: TFlatConfigItem[] = [
  {
    files: [`**/scripts/${GLOB_SRC}`],
    name: 'disables/scripts',
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },
  {
    files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
    name: 'disables/cli',
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.d.?([cm])ts'],
    name: 'disables/dts',
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
      'import/no-default-export': 'off',
      'no-restricted-syntax': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    name: 'disables/cjs',
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: [
      `**/*.config.${GLOB_SRC_EXT}`,
      `**/*.config.*.${GLOB_SRC_EXT}`,
      `**/*.plugin.${GLOB_SRC_EXT}`,
    ],
    name: 'disables/config-files',
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'no-console': 'off',
      'no-template-curly-in-string': 'off',
    },
  },
]
