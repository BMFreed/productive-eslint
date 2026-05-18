import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { test } from 'node:test'

const collectNamedRules = (name: string, preset: string) => {
  const script = `
    const { createConfig, Preset } = await import('./dist/index.config.js')
    const configs = await createConfig({
      preset: Preset.${preset},
      rxjs: true,
      vue: true,
    }).toConfigs()
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
