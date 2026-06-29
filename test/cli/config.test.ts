import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'

import { fixturePath } from './helpers/fixture-path'

const DIST_CONFIG_URL = pathToFileURL(
  path.join(process.cwd(), 'dist', 'index.config.js'),
).href

interface IRuntimeSmokeResult {
  errorCount?: number
  message?: string
  ok: boolean
  ruleIds?: string[]
  warningCount?: number
}

interface ICapabilitySnapshot {
  architecture: {
    enabled: boolean
  }
  react: {
    compiler: boolean
    enabled: boolean
  }
  storybook: {
    enabled: boolean
  }
  rxjs: {
    enabled: boolean
  }
  tailwind:
    | {
        cssConfigPath: string
        enabled: true
        vueTemplates: boolean
      }
    | {
        enabled: false
        vueTemplates: boolean
      }
  vue: {
    enabled: boolean
  }
}

interface IAutofixAuditResult {
  errorCount: number
  outputChanged: boolean
  ruleIds: Array<string | null>
}

const runNodeJson = <T>(script: string): T =>
  JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd: process.cwd(),
      encoding: 'utf8',
    }),
  ) as T

const runLintSmoke = (
  cwd: string,
  file: string,
  optionsExpression: string,
): IRuntimeSmokeResult =>
  runNodeJson<IRuntimeSmokeResult>(`
    import process from 'node:process'
    import { ESLint } from 'eslint'

    const { createConfig } = await import(${JSON.stringify(DIST_CONFIG_URL)})

    process.chdir(${JSON.stringify(cwd)})

    try {
      const config = await createConfig(${optionsExpression}).toConfigs()
      const eslint = new ESLint({
        cwd: process.cwd(),
        errorOnUnmatchedPattern: false,
        ignore: true,
        overrideConfig: config,
        overrideConfigFile: true,
      })
      const results = await eslint.lintFiles([${JSON.stringify(file)}])
      const messages = results.flatMap((result) => result.messages)

      console.log(
        JSON.stringify({
          errorCount: results.reduce(
            (sum, result) => sum + result.errorCount,
            0,
          ),
          ok: true,
          ruleIds: [...new Set(messages.map((message) => message.ruleId).filter(Boolean))],
          warningCount: results.reduce(
            (sum, result) => sum + result.warningCount,
            0,
          ),
        }),
      )
    } catch (error) {
      console.log(
        JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          ok: false,
        }),
      )
    }
  `)

const runConfigSmoke = (
  cwd: string,
  optionsExpression: string,
): IRuntimeSmokeResult =>
  runNodeJson<IRuntimeSmokeResult>(`
    import process from 'node:process'

    const { createConfig } = await import(${JSON.stringify(DIST_CONFIG_URL)})

    process.chdir(${JSON.stringify(cwd)})

    try {
      await createConfig(${optionsExpression}).toConfigs()

      console.log(JSON.stringify({ ok: true }))
    } catch (error) {
      console.log(
        JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          ok: false,
        }),
      )
    }
  `)

const createTailwindMissingProject = (): string => {
  const projectDir = mkdtempSync(path.join(tmpdir(), 'productive-eslint-'))

  writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(
      {
        type: 'module',
      },
      null,
      2,
    ),
  )
  writeFileSync(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          jsx: 'preserve',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          target: 'ES2022',
        },
        include: ['src/**/*.tsx'],
      },
      null,
      2,
    ),
  )
  mkdirSync(path.join(projectDir, 'src'), { recursive: true })
  writeFileSync(
    path.join(projectDir, 'src', 'App.tsx'),
    'export const App = () => <main className="px-4 py-2 text-sm">ok</main>\n',
  )
  writeFileSync(
    path.join(projectDir, 'src', 'tailwind.css'),
    '@import "tailwindcss";\n',
  )

  return projectDir
}

const auditStorybookAutofixes = (): Record<string, IAutofixAuditResult> =>
  runNodeJson<Record<string, IAutofixAuditResult>>(`
    import { ESLint } from 'eslint'
    import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
    import { tmpdir } from 'node:os'
    import path from 'node:path'

    const { createConfig, Preset } = await import(${JSON.stringify(DIST_CONFIG_URL)})

    const projectDir = mkdtempSync(path.join(tmpdir(), 'productive-eslint-storybook-'))

    writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(
        {
          devDependencies: {
            storybook: '^10.4.6',
          },
          type: 'module',
        },
        null,
        2,
      ),
    )
    writeFileSync(
      path.join(projectDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            jsx: 'react-jsx',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            target: 'ES2022',
            types: ['react'],
          },
          include: ['src/**/*.ts', 'src/**/*.tsx'],
        },
        null,
        2,
      ),
    )
    mkdirSync(path.join(projectDir, 'src'), { recursive: true })

    const cases = {
      defaultExports: {
        file: 'defaultExports.stories.tsx',
        source: 'export const Primary = {}\\n',
      },
      hierarchySeparator: {
        file: 'hierarchySeparator.stories.tsx',
        source:
          'import type { Meta } from \\'@storybook/react-vite\\'\\nconst Button = () => null\\nexport default { title: \\'Atoms|Button\\', component: Button } satisfies Meta<typeof Button>\\n',
      },
      useStorybookTestingLibrary: {
        file: 'useStorybookTestingLibrary.stories.tsx',
        source:
          'import type { Meta, StoryObj } from \\'@storybook/react-vite\\'\\nimport { within } from \\'@testing-library/dom\\'\\nconst Button = () => null\\nconst meta = { component: Button } satisfies Meta<typeof Button>\\nexport default meta\\ntype Story = StoryObj<typeof meta>\\nexport const Primary: Story = { async play({ canvasElement }) { within(canvasElement) } }\\n',
      },
      metaSatisfiesType: {
        file: 'metaSatisfiesType.stories.tsx',
        source:
          'const Button = () => null\\nexport default { component: Button }\\nexport const Primary = {}\\n',
      },
      noRedundantStoryName: {
        file: 'noRedundantStoryName.stories.tsx',
        source:
          'import type { Meta, StoryObj } from \\'@storybook/react-vite\\'\\nconst Button = () => null\\nconst meta = { component: Button } satisfies Meta<typeof Button>\\nexport default meta\\ntype Story = StoryObj<typeof meta>\\nexport const Primary: Story = { name: \\'Primary\\' }\\n',
      },
      noTitlePropertyInMeta: {
        file: 'noTitlePropertyInMeta.stories.tsx',
        source:
          'import type { Meta } from \\'@storybook/react-vite\\'\\nconst Button = () => null\\nexport default { title: \\'Atoms/Button\\', component: Button } satisfies Meta<typeof Button>\\nexport const Primary = {}\\n',
      },
      preferPascalCase: {
        file: 'preferPascalCase.stories.tsx',
        source:
          'import type { Meta, StoryObj } from \\'@storybook/react-vite\\'\\nconst Button = () => null\\nconst meta = { component: Button } satisfies Meta<typeof Button>\\nexport default meta\\ntype Story = StoryObj<typeof meta>\\nexport const primary: Story = {}\\n',
      },
      useStorybookExpect: {
        file: 'useStorybookExpect.stories.tsx',
        source:
          'import type { Meta, StoryObj } from \\'@storybook/react-vite\\'\\nimport { expect } from \\'vitest\\'\\nconst Button = () => null\\nconst meta = { component: Button } satisfies Meta<typeof Button>\\nexport default meta\\ntype Story = StoryObj<typeof meta>\\nexport const Primary: Story = { async play() { expect(true).toBe(true) } }\\n',
      },
    }

    const config = await createConfig({
      preset: Preset.AUTO_FIXABLE,
      react: true,
      rxjs: false,
      storybook: true,
      vue: false,
    }).toConfigs()
    const eslint = new ESLint({
      cwd: projectDir,
      errorOnUnmatchedPattern: false,
      fix: true,
      ignore: true,
      overrideConfig: config,
      overrideConfigFile: true,
    })

    const results = {}

    for (const [caseName, { file, source }] of Object.entries(cases)) {
      const filePath = path.join(projectDir, 'src', file)
      writeFileSync(filePath, source)
      const [result] = await eslint.lintFiles([filePath])

      results[caseName] = {
        errorCount: result.errorCount,
        outputChanged:
          typeof result.output === 'string' && result.output !== source,
        ruleIds: [...new Set(result.messages.map((message) => message.ruleId ?? null))],
      }
    }

    rmSync(projectDir, { force: true, recursive: true })

    console.log(JSON.stringify(results))
  `)

const buildOptionsExpression = (
  preset: string,
  optionsExpression?: string,
) =>
  optionsExpression ??
  `{
    preset: Preset.${preset},
    react: false,
    rxjs: false,
    vue: false,
  }`

const collectNamedRules = (
  name: string,
  preset: string,
  optionsExpression?: string,
) => {
  const script = `
    const { createConfig, Preset } = await import('./dist/index.config.js')
    const configs = await createConfig(${buildOptionsExpression(
      preset,
      optionsExpression,
    )}).toConfigs()
    const config = configs.find((item) => item.name === ${JSON.stringify(name)})
    console.log(JSON.stringify(config?.rules ?? null))
  `
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  )

  return JSON.parse(output) as Record<string, unknown> | null
}

const collectNamedFiles = (
  name: string,
  preset: string,
  optionsExpression?: string,
) => {
  const script = `
    const { createConfig, Preset } = await import('./dist/index.config.js')
    const configs = await createConfig(${buildOptionsExpression(
      preset,
      optionsExpression,
    )}).toConfigs()
    const config = configs.find((item) => item.name === ${JSON.stringify(name)})
    console.log(JSON.stringify(config?.files ?? null))
  `
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  )

  return JSON.parse(output) as string[] | null
}

const hasNamedConfig = (
  name: string,
  optionsExpression?: string,
  cwd = process.cwd(),
) => {
  const script = `
    const { createConfig, Preset } = await import('./dist/index.config.js')
    const configs = await createConfig(${buildOptionsExpression(
      'RECOMMENDED',
      optionsExpression,
    )}).toConfigs()
    console.log(JSON.stringify(configs.some((item) => item.name === ${JSON.stringify(name)})))
  `
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd,
      encoding: 'utf8',
    },
  )

  return JSON.parse(output) as boolean
}

const collectCapabilities = (
  optionsExpression?: string,
  cwd = process.cwd(),
) =>
  runNodeJson<ICapabilitySnapshot>(`
    import process from 'node:process'
    const { createConfig, Preset } = await import('./dist/index.config.js')

    process.chdir(${JSON.stringify(cwd)})

    const composer = createConfig(${buildOptionsExpression(
      'RECOMMENDED',
      optionsExpression,
    )})
    const symbols = Object.getOwnPropertySymbols(composer)
    const capabilities = symbols
      .map((symbol) => composer[symbol])
      .find(
        (value) =>
          value &&
          typeof value === 'object' &&
          'architecture' in value &&
          'react' in value &&
          'storybook' in value &&
          'tailwind' in value &&
          'vue' in value &&
          'rxjs' in value,
      )

    if (!capabilities) {
      throw new Error('productive-eslint capabilities were not attached to the composer')
    }

    console.log(JSON.stringify(capabilities))
  `)

test('recommended preset includes restored mechanical TypeScript rules', () => {
  const typeScriptRules = collectNamedRules('typescript/rules', 'RECOMMENDED')
  const javaScriptRules = collectNamedRules('base/rules', 'RECOMMENDED')
  const importRules = collectNamedRules('imports', 'RECOMMENDED')

  assert.ok(typeScriptRules)
  assert.ok(javaScriptRules)
  assert.ok(importRules)
  assert.deepEqual(typeScriptRules['@typescript-eslint/naming-convention'], [
    'error',
    { format: null, selector: ['objectLiteralProperty'] },
    { format: null, selector: 'import' },
    { format: ['StrictPascalCase'], selector: ['enum', 'class'] },
    { format: ['UPPER_CASE'], selector: ['enumMember'] },
    {
      format: ['StrictPascalCase'],
      prefix: ['I'],
      selector: ['interface'],
    },
    {
      format: ['StrictPascalCase'],
      prefix: ['T'],
      selector: ['typeAlias'],
    },
    { format: ['StrictPascalCase'], selector: ['typeParameter'] },
    {
      format: ['strictCamelCase', 'UPPER_CASE'],
      modifiers: ['const'],
      selector: 'variable',
    },
    {
      format: ['camelCase'],
      leadingUnderscore: 'allow',
      modifiers: ['unused'],
      selector: 'parameter',
    },
  ])
  assert.equal(
    typeScriptRules['@typescript-eslint/no-unsafe-declaration-merging'],
    'error',
  )
  assert.equal(typeScriptRules['@typescript-eslint/only-throw-error'], 'error')
  assert.equal(javaScriptRules['array-callback-return'], 'error')
  assert.equal(importRules['import/no-commonjs'], 'error')
})

test('auto-fixable preset includes restored TOML ordering rules', () => {
  const rules = collectNamedRules('toml', 'AUTO_FIXABLE')

  assert.ok(rules)
  assert.equal(rules['toml/keys-order'], 'error')
  assert.equal(rules['toml/tables-order'], 'error')
})

test('react and tailwind rule blocks are exposed when explicitly enabled', () => {
  const reactAutoRules = collectNamedRules(
    'react/rules',
    'AUTO_FIXABLE',
    '{ react: true }',
  )
  const reactRules = collectNamedRules(
    'react/rules',
    'RECOMMENDED',
    '{ react: true }',
  )
  const reactHooksRules = collectNamedRules(
    'react-hooks/rules',
    'RECOMMENDED',
    '{ react: true }',
  )
  const reactCompilerRules = collectNamedRules(
    'react-compiler/rules',
    'RECOMMENDED',
    '{ react: { compiler: true } }',
  )
  const jsxA11yRules = collectNamedRules(
    'jsx-a11y/rules',
    'RECOMMENDED',
    '{ react: true }',
  )
  const tailwindAutoRules = collectNamedRules(
    'tailwind/rules',
    'AUTO_FIXABLE',
    '{ react: false, tailwind: { cssConfigPath: "scripts/rules-snapshot/tailwind.css" } }',
  )
  const tailwindRecommendedRules = collectNamedRules(
    'tailwind/rules',
    'RECOMMENDED',
    '{ react: false, tailwind: { cssConfigPath: "scripts/rules-snapshot/tailwind.css" } }',
  )

  assert.ok(reactAutoRules)
  assert.ok(reactRules)
  assert.ok(reactHooksRules)
  assert.equal(reactAutoRules['react/self-closing-comp'], 'error')
  assert.equal(reactRules['react/jsx-key'], 'error')
  assert.equal(reactRules['react/jsx-pascal-case'], 'error')
  assert.equal(reactRules['react/no-invalid-html-attribute'], 'error')
  assert.equal(reactRules['react/style-prop-object'], 'error')
  assert.equal(reactRules['react/no-danger'], undefined)
  assert.equal(reactRules['react/no-unknown-property'], undefined)
  assert.equal(reactRules['react/forward-ref-uses-ref'], undefined)
  assert.equal(reactRules['react/jsx-no-leaked-render'], undefined)
  assert.equal(reactHooksRules['react-hooks/rules-of-hooks'], 'error')
  assert.equal(reactHooksRules['react-hooks/exhaustive-deps'], undefined)
  assert.ok(reactCompilerRules)
  assert.equal(reactCompilerRules['react-hooks/static-components'], 'error')
  assert.equal(reactCompilerRules['react-hooks/use-memo'], 'error')
  assert.ok(jsxA11yRules)
  assert.equal(jsxA11yRules['jsx-a11y/aria-role'], 'error')
  assert.equal(jsxA11yRules['jsx-a11y/alt-text'], 'error')
  assert.ok(tailwindAutoRules)
  assert.deepEqual(tailwindAutoRules['tailwindcss/classnames-order'], [
    'error',
    { config: {} },
  ])
  assert.deepEqual(tailwindAutoRules['tailwindcss/enforces-shorthand'], [
    'error',
    { config: {} },
  ])
  assert.ok(tailwindRecommendedRules)
  assert.deepEqual(
    tailwindRecommendedRules['tailwindcss/classnames-order'],
    ['error', { config: {} }],
  )
  assert.equal(
    tailwindRecommendedRules['tailwindcss/no-contradicting-classname'],
    undefined,
  )
})

test('react config normalization preserves boolean compatibility and nests compiler support', () => {
  assert.equal(hasNamedConfig('react/rules', '{}'), true)
  assert.equal(hasNamedConfig('react/rules', '{ react: true }'), true)
  assert.equal(hasNamedConfig('react/rules', '{ react: false }'), false)
  assert.equal(
    hasNamedConfig('react/rules', '{ react: { enabled: true } }'),
    true,
  )
  assert.equal(
    hasNamedConfig('react-compiler/rules', '{ react: true }'),
    false,
  )
  assert.equal(
    hasNamedConfig('react-compiler/rules', '{ react: { compiler: true } }'),
    true,
  )
})

test('react config keeps JSX rules on TSX and hook or compiler layers on TS plus TSX', () => {
  const reactFiles = collectNamedFiles(
    'react/rules',
    'RECOMMENDED',
    '{ react: true }',
  )
  const reactHooksFiles = collectNamedFiles(
    'react-hooks/rules',
    'RECOMMENDED',
    '{ react: true }',
  )
  const reactCompilerFiles = collectNamedFiles(
    'react-compiler/rules',
    'RECOMMENDED',
    '{ react: { compiler: true } }',
  )

  assert.deepEqual(reactFiles, ['**/*.tsx'])
  assert.deepEqual(reactHooksFiles, ['**/*.@(ts|mts)', '**/*.tsx'])
  assert.deepEqual(reactCompilerFiles, ['**/*.@(ts|mts)', '**/*.tsx'])
})

test('runtime marker capabilities reflect enabled features without config-shape inspection', () => {
  const minimal = collectCapabilities()
  const ui = collectCapabilities(
    `{
      fsd: false,
      react: { compiler: true },
      rxjs: true,
      tailwind: { cssConfigPath: 'scripts/rules-snapshot/tailwind.css' },
      vue: true,
    }`,
  )

  assert.deepEqual(minimal, {
    architecture: { enabled: true },
    react: { compiler: false, enabled: false },
    storybook: { enabled: false },
    rxjs: { enabled: false },
    tailwind: { enabled: false, vueTemplates: false },
    vue: { enabled: false },
  })
  assert.deepEqual(ui, {
    architecture: { enabled: false },
    react: { compiler: true, enabled: true },
    storybook: { enabled: false },
    rxjs: { enabled: true },
    tailwind: {
      cssConfigPath: 'scripts/rules-snapshot/tailwind.css',
      enabled: true,
      vueTemplates: true,
    },
    vue: { enabled: true },
  })
})

test('storybook rule blocks are exposed when explicitly enabled', () => {
  const storybookAutoRules = collectNamedRules(
    'storybook/rules',
    'AUTO_FIXABLE',
    '{ preset: Preset.AUTO_FIXABLE, storybook: true }',
  )
  const storybookRecommendedRules = collectNamedRules(
    'storybook/rules',
    'RECOMMENDED',
    '{ preset: Preset.RECOMMENDED, storybook: true }',
  )
  const storybookConfigRules = collectNamedRules(
    'storybook/config-rules',
    'RECOMMENDED',
    '{ preset: Preset.RECOMMENDED, storybook: true }',
  )

  assert.ok(storybookAutoRules)
  assert.ok(storybookRecommendedRules)
  assert.ok(storybookConfigRules)
  assert.equal(storybookAutoRules['storybook/default-exports'], 'error')
  assert.equal(storybookAutoRules['storybook/hierarchy-separator'], 'error')
  assert.equal(
    storybookAutoRules['storybook/use-storybook-testing-library'],
    'error',
  )
  assert.equal(storybookAutoRules['storybook/await-interactions'], undefined)
  assert.equal(
    storybookAutoRules['storybook/meta-satisfies-type'],
    undefined,
  )
  assert.equal(
    storybookRecommendedRules['storybook/meta-satisfies-type'],
    'error',
  )
  assert.equal(
    storybookRecommendedRules['storybook/use-storybook-expect'],
    'error',
  )
  assert.equal(
    storybookRecommendedRules['storybook/no-uninstalled-addons'],
    'error',
  )
  assert.equal(
    storybookConfigRules['storybook/no-uninstalled-addons'],
    'error',
  )
})

test('storybook config normalization keeps support opt-in', () => {
  assert.equal(hasNamedConfig('storybook/rules', '{}'), false)
  assert.equal(hasNamedConfig('storybook/rules', '{ storybook: true }'), true)
  assert.equal(
    hasNamedConfig('storybook/config-rules', '{ storybook: true }'),
    true,
  )
})

test('storybook config keeps story and .storybook globs separated', () => {
  const storybookStoryFiles = collectNamedFiles(
    'storybook/rules',
    'RECOMMENDED',
    '{ storybook: true }',
  )
  const storybookConfigFiles = collectNamedFiles(
    'storybook/config-rules',
    'RECOMMENDED',
    '{ storybook: true }',
  )

  assert.deepEqual(storybookStoryFiles, [
    '**/*.stories.@(ts|tsx|mts)',
    '**/*.story.@(ts|tsx|mts)',
  ])
  assert.deepEqual(storybookConfigFiles, ['.storybook/**/*.@(ts|mts)'])
})

test('runtime marker capabilities include storybook support', () => {
  const withStorybook = collectCapabilities(
    '{ react: false, rxjs: false, storybook: true }',
  )

  assert.deepEqual(withStorybook, {
    architecture: { enabled: true },
    react: { compiler: false, enabled: false },
    storybook: { enabled: true },
    rxjs: { enabled: false },
    tailwind: { enabled: false, vueTemplates: false },
    vue: { enabled: false },
  })
})

test('storybook auto-fixable preset contains only empirically confirmed autofixes', () => {
  const audit = auditStorybookAutofixes()

  assert.deepEqual(audit.defaultExports, {
    errorCount: 0,
    outputChanged: true,
    ruleIds: [],
  })
  assert.deepEqual(audit.hierarchySeparator, {
    errorCount: 0,
    outputChanged: true,
    ruleIds: [],
  })
  assert.deepEqual(audit.useStorybookTestingLibrary, {
    errorCount: 0,
    outputChanged: true,
    ruleIds: [],
  })
  assert.equal(audit.metaSatisfiesType.errorCount, 0)
  assert.deepEqual(audit.metaSatisfiesType.ruleIds, [])
  assert.equal(audit.noRedundantStoryName.errorCount, 0)
  assert.deepEqual(audit.noRedundantStoryName.ruleIds, [])
  assert.equal(audit.noTitlePropertyInMeta.errorCount, 0)
  assert.deepEqual(audit.noTitlePropertyInMeta.ruleIds, [])
  assert.equal(audit.preferPascalCase.errorCount, 0)
  assert.deepEqual(audit.preferPascalCase.ruleIds, [])
  assert.equal(audit.useStorybookExpect.errorCount, 0)
  assert.deepEqual(audit.useStorybookExpect.ruleIds, [])
})

test('react default preset lints TSX fixtures without runtime rule crashes', () => {
  const result = runLintSmoke(
    fixturePath('react', 'semantic'),
    'src/App.tsx',
    '{ react: true }',
  )

  assert.equal(result.ok, true)
})

test('react default preset lints custom hook TS fixtures without runtime rule crashes', () => {
  const result = runLintSmoke(
    fixturePath('react', 'semantic'),
    'src/useRiskyCounter.ts',
    '{ react: true }',
  )

  assert.equal(result.ok, true)
})

test('react compiler option exposes compiler-only rules without crashing', () => {
  const result = runLintSmoke(
    fixturePath('react', 'semantic'),
    'src/App.tsx',
    '{ react: { compiler: true } }',
  )

  assert.equal(result.ok, true)
})

test('react compiler cannot be enabled when react is disabled explicitly', () => {
  const result = runConfigSmoke(
    process.cwd(),
    '{ react: { enabled: false, compiler: true } }',
  )

  assert.equal(result.ok, false)
  assert.match(result.message ?? '', /react\.compiler.*react\.enabled/u)
})

test('react auto-fixable preset lints TSX fixtures without runtime rule crashes', () => {
  const result = runLintSmoke(
    fixturePath('react', 'semantic'),
    'src/App.tsx',
    '{ preset: "autoFixable", react: true }',
  )

  assert.equal(result.ok, true)
})

test('tailwind lint smoke passes when tailwindcss is installed in the target project', () => {
  const result = runLintSmoke(
    process.cwd(),
    'scripts/rules-snapshot/TailwindSample.tsx',
    '{ react: false, tailwind: { cssConfigPath: "scripts/rules-snapshot/tailwind.css" } }',
  )

  assert.equal(result.ok, true)
})

test('tailwind support fails early with a clear install hint when missing', () => {
  const projectDir = createTailwindMissingProject()

  try {
    const result = runConfigSmoke(
      projectDir,
      '{ react: false, tailwind: { cssConfigPath: "src/tailwind.css" } }',
    )

    assert.equal(result.ok, false)
    assert.match(result.message ?? '', /tailwindcss/u)
    assert.match(
      result.message ?? '',
      /tailwind: \{ cssConfigPath \}/u,
    )
  } finally {
    rmSync(projectDir, { force: true, recursive: true })
  }
})

test('storybook default preset lints story fixtures and triggers storybook rules', () => {
  const result = runLintSmoke(
    fixturePath('storybook', 'semantic'),
    'src/Button.stories.tsx',
    '{ storybook: true }',
  )

  assert.equal(result.ok, true)
  assert.ok(result.ruleIds?.includes('storybook/no-title-property-in-meta'))
})

test('storybook config files are linted and validate addon names', () => {
  const result = runLintSmoke(
    fixturePath('storybook', 'semantic'),
    '.storybook/main.ts',
    '{ storybook: true }',
  )

  assert.equal(result.ok, true)
  assert.ok(result.ruleIds?.includes('storybook/no-uninstalled-addons'))
})

test('fsd false removes boundaries setup from generated config', () => {
  assert.equal(hasNamedConfig('boundaries', '{ fsd: true }'), true)
  assert.equal(hasNamedConfig('boundaries', '{ fsd: false }'), false)
})

test('rules dump targets include representative TSX and Vue samples', () => {
  const source = readFileSync('scripts/dump-eslint-rules.ts', 'utf8')

  assert.match(source, /scripts\/rules-snapshot\/ReactSample\.tsx/u)
  assert.match(source, /scripts\/rules-snapshot\/TailwindSample\.tsx/u)
  assert.match(source, /scripts\/rules-snapshot\/Sample\.vue/u)
})
