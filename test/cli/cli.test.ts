import assert from 'node:assert/strict'
import { test } from 'node:test'

import { fixturePath } from './helpers/fixture-path'
import { runCli } from './helpers/run-cli'

const analyze = (topic: string, fixture: string[], extraArgs: string[] = []) =>
  runCli({
    args: [topic, '--cwd', fixturePath(...fixture), ...extraArgs],
  })

test('types analyzer reports exported any hotspots', async () => {
  const result = await analyze('types', ['types', 'explicit-any'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Types Analysis/u)
  assert.match(result.stdout, /Findings: `2`/u)
  assert.match(result.stdout, /Exported or public-surface findings: `1`/u)
  assert.match(result.stdout, /src\/public-api\.ts/u)
  assert.match(result.stdout, /exported-api/u)
})

test('types analyzer reports Vue component contract hotspots', async () => {
  const result = await analyze('types', ['types', 'vue-contract'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Types Analysis/u)
  assert.match(result.stdout, /Vue component contract findings: `1`/u)
  assert.match(result.stdout, /src\/components\/UserBadge\.vue/u)
  assert.match(result.stdout, /vue-component-contract/u)
})

test('types analyzer reports unnecessary condition control-flow signals', async () => {
  const result = await analyze('types', ['types', 'unnecessary-condition'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Types Analysis/u)
  assert.match(result.stdout, /Findings: `1`/u)
  assert.match(result.stdout, /Control-flow signal findings: `1`/u)
  assert.match(result.stdout, /src\/index\.ts/u)
  assert.match(result.stdout, /control-flow-signal/u)
  assert.match(result.stdout, /@typescript-eslint\/no-unnecessary-condition/u)
})

test('types analyzer reports unsafe type boundary signals', async () => {
  const result = await analyze('types', ['types', 'type-safety-signals'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Types Analysis/u)
  assert.match(result.stdout, /@typescript-eslint\/no-unsafe-argument/u)
  assert.match(result.stdout, /@typescript-eslint\/no-unsafe-enum-comparison/u)
  assert.match(result.stdout, /@typescript-eslint\/no-unsafe-unary-minus/u)
  assert.match(result.stdout, /@typescript-eslint\/no-base-to-string/u)
})

test('architecture analyzer reports forbidden dependency direction', async () => {
  const result = await analyze('architecture', [
    'architecture',
    'layer-violation',
  ])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Architecture Analysis/u)
  assert.match(result.stdout, /Findings: `1`/u)
  assert.match(result.stdout, /Layer-direction violations: `1`/u)
  assert.match(result.stdout, /shared -> features/u)
})

test('architecture analyzer reports private entry imports', async () => {
  const result = await analyze('architecture', [
    'architecture',
    'private-entry',
  ])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Architecture Analysis/u)
  assert.match(result.stdout, /Private-entry violations: `1`/u)
  assert.match(result.stdout, /private-entry/u)
  assert.match(result.stdout, /src\/shared\/api\/use-private-entry\.ts/u)
})

test('complexity analyzer reports function-level hotspot', async () => {
  const result = await analyze('complexity', ['complexity', 'risky-hotspot'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Complexity Analysis/u)
  assert.match(result.stdout, /High-risk hotspots: `1`/u)
  assert.match(result.stdout, /function:riskyHotspot/u)
  assert.match(result.stdout, /src\/index\.ts :: riskyHotspot/u)
  assert.match(result.stdout, /1\. `src\/index\.ts :: riskyHotspot`/u)
  assert.match(result.stdout, /Nested branch depth/u)
})

test('async analyzer reports floating promise findings', async () => {
  const result = await analyze('async', ['async', 'floating-promise'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Async Analysis/u)
  assert.match(result.stdout, /Findings: `1`/u)
  assert.match(result.stdout, /Likely bug findings: `1`/u)
  assert.match(result.stdout, /floating-promise/u)
})

test('async analyzer reports misused promise findings', async () => {
  const result = await analyze('async', ['async', 'misused-promise'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Async Analysis/u)
  assert.match(result.stdout, /Likely bug findings: `1`/u)
  assert.match(result.stdout, /misused-promise/u)
})

test('async analyzer reports additional async correctness signals', async () => {
  const result = await analyze('async', ['async', 'additional-signals'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Async Analysis/u)
  assert.match(result.stdout, /@typescript-eslint\/await-thenable/u)
  assert.match(result.stdout, /@typescript-eslint\/require-await/u)
  assert.match(result.stdout, /@typescript-eslint\/return-await/u)
  assert.match(result.stdout, /promise\/valid-params/u)
})

test('suppressions analyzer reports stale eslint disable directives', async () => {
  const result = await analyze('suppressions', [
    'suppressions',
    'stale-disable',
  ])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Suppressions Analysis/u)
  assert.match(result.stdout, /Unused directive findings: `1`/u)
  assert.match(result.stdout, /stale-suppression/u)
})

test('suppressions analyzer reports broad disable directives', async () => {
  const result = await analyze('suppressions', [
    'suppressions',
    'broad-disable',
  ])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Suppressions Analysis/u)
  assert.match(result.stdout, /Broad disable findings: `1`/u)
  assert.match(result.stdout, /broad-disable/u)
})

test('suppressions analyzer reports ts-ignore directives', async () => {
  const result = await analyze('suppressions', ['suppressions', 'ts-ignore'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Suppressions Analysis/u)
  assert.match(result.stdout, /TypeScript directive findings: `1`/u)
  assert.match(result.stdout, /ts-ignore/u)
})

test('dead-code analyzer reports safe deletion hotspots', async () => {
  const result = await analyze('dead-code', ['dead-code', 'basic'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Dead Code Analysis/u)
  assert.match(result.stdout, /Safe-delete candidates: `1`/u)
  assert.match(result.stdout, /likely-bug-or-delete/u)
  assert.match(result.stdout, /src\/index\.ts/u)
  assert.match(result.stdout, /no-unreachable/u)
})

test('imports analyzer reports dependency-shape hotspots', async () => {
  const result = await analyze('imports', ['imports', 'basic'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Imports Analysis/u)
  assert.match(result.stdout, /dependency-shape/u)
  assert.match(result.stdout, /Mechanical import fixes: `2`/u)
  assert.match(result.stdout, /import\/no-namespace/u)
  assert.match(result.stdout, /import\/no-duplicates/u)
})

test('api analyzer reports public contract hotspots', async () => {
  const result = await analyze('api', ['api', 'public-contract'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# API Analysis/u)
  assert.match(result.stdout, /Public type-safety findings: `2`/u)
  assert.match(result.stdout, /Public signature findings: `3`/u)
  assert.match(result.stdout, /Export policy findings: `1`/u)
  assert.match(result.stdout, /src\/index\.ts/u)
})

test('vue analyzer reports component semantic hotspots', async () => {
  const result = await analyze('vue', ['vue', 'semantic'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Vue Analysis/u)
  assert.match(result.stdout, /Component contract findings:/u)
  assert.match(result.stdout, /Reactivity hazard findings:/u)
  assert.match(result.stdout, /Lifecycle hazard findings:/u)
  assert.match(result.stdout, /Security findings:/u)
  assert.match(result.stdout, /src\/components\/RiskyPanel\.vue/u)
  assert.match(result.stdout, /vue\/no-expose-after-await/u)
  assert.match(result.stdout, /vue\/no-v-html/u)
})

test('rxjs analyzer reports reactive flow hotspots', async () => {
  const result = await analyze('rxjs', ['rxjs', 'flow'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# RxJS Analysis/u)
  assert.match(result.stdout, /Subscription lifecycle findings:/u)
  assert.match(result.stdout, /Reactive flow findings:/u)
  assert.match(result.stdout, /Error handling findings:/u)
  assert.match(result.stdout, /src\/index\.ts/u)
  assert.match(result.stdout, /rxjs\/no-unsafe-takeuntil/u)
  assert.match(result.stdout, /deprecated-api/u)
})

test('migrations analyzer reports deprecated API hotspots', async () => {
  const result = await analyze('migrations', ['migrations', 'deprecated'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Migrations Analysis/u)
  assert.match(result.stdout, /Vue migration findings:/u)
  assert.match(result.stdout, /RxJS migration findings:/u)
  assert.match(result.stdout, /TypeScript migration findings:/u)
  assert.match(result.stdout, /deprecated-api/u)
})

test('risk analyzer aggregates universal analyzer hotspots', async () => {
  const result = await analyze('risk', ['api', 'public-contract'])

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /# Risk Analysis/u)
  assert.match(result.stdout, /API findings:/u)
  assert.match(result.stdout, /Types findings:/u)
  assert.match(result.stdout, /risk:api/u)
  assert.match(result.stdout, /src\/index\.ts/u)
})

test('include and exclude filters apply together', async () => {
  const result = await analyze(
    'types',
    ['substrate', 'include-exclude'],
    ['--include', 'src/**/*.ts', '--exclude', 'src/excluded.ts'],
  )

  assert.equal(result.code, 0)
  assert.equal(result.stderr, '')
  assert.match(result.stdout, /Findings: `1`/u)
  assert.match(result.stdout, /src\/included\.ts/u)
  assert.doesNotMatch(result.stdout, /src\/excluded\.ts/u)
})

test('wrong cwd fails with a clear substrate error', async () => {
  const result = await runCli({
    args: ['types', '--cwd', fixturePath('types', 'explicit-any', 'src')],
  })

  assert.notEqual(result.code, 0)
  assert.match(
    result.stderr,
    /No supported eslint\.config\.ts or eslint\.config\.mts file/u,
  )
})

test('missing config fails with a clear substrate error', async () => {
  const result = await analyze('types', ['substrate', 'missing-config'])

  assert.notEqual(result.code, 0)
  assert.match(
    result.stderr,
    /No supported eslint\.config\.ts or eslint\.config\.mts file/u,
  )
})

test('unsupported config shape fails with a clear substrate error', async () => {
  const result = await analyze('types', ['substrate', 'unsupported-shape'])

  assert.notEqual(result.code, 0)
  assert.match(
    result.stderr,
    /does not export a supported productive-eslint composer pipeline/u,
  )
})

test('unknown analyzer topic fails clearly', async () => {
  const result = await analyze('unknown', ['types', 'explicit-any'])

  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /Unknown analyzer topic "unknown"/u)
})

test('unknown option fails clearly', async () => {
  const result = await analyze('types', ['types', 'explicit-any'], ['--wat'])

  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /Unknown option "--wat"/u)
})

test('missing option value fails clearly', async () => {
  const result = await runCli({
    args: ['types', '--cwd'],
  })

  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /Missing value for --cwd/u)
})

test('invalid top value fails clearly', async () => {
  const result = await analyze(
    'types',
    ['types', 'explicit-any'],
    ['--top', '0'],
  )

  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /--top must be a positive integer/u)
})

test('unmarked composer-like config fails with a clear substrate error', async () => {
  const result = await analyze('types', ['substrate', 'missing-marker'])

  assert.notEqual(result.code, 0)
  assert.match(
    result.stderr,
    /does not export a supported productive-eslint composer pipeline/u,
  )
})
