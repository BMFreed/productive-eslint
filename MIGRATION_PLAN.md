# Migration Plan: AI-First Presets

This plan describes the next major version of `productive-eslint`.

The release is intentionally breaking. There is no compatibility layer for the old `easy`, `medium`, and `hard` strictness model.

## Goal

Move from a strictness ladder to an AI-first usage model:

- repository-wide ESLint should enforce only mechanical rules;
- nuanced rules should become explicit analysis tools for agents;
- agents should use lint output as structured diagnostic input, not as a giant always-on error list.

The main behavior change is replacing the current preset model:

```ts
productiveEslint({
  strictness: StrictnessPreset.HARD,
})
```

with a smaller preset model:

```ts
productiveEslint({
  preset: Preset.RECOMMENDED,
})
```

## New Presets

### `AUTO_FIXABLE`

Only rules with reliable ESLint autofix support.

This preset exists for the most conservative mechanical cleanup flow:

```bash
eslint . --fix
```

Expected properties:

- every enabled rule is safe to run in bulk;
- fixes are delegated to ESLint;
- no rule should require an AI agent or human to choose a design direction;
- this preset should be honest, including data-format configs.

### `RECOMMENDED`

The default permanent repository baseline.

`RECOMMENDED` includes:

1. every rule from `AUTO_FIXABLE`;
2. extra non-autofixable mechanical rules from `PERMANENT_RULES.md`;
3. data-format rules that match the same permanent-baseline philosophy.

Expected properties:

- safe as the default project ESLint config;
- may include rules without autofix;
- violations should still be trivial and local to fix;
- no broad type-safety migration, architecture rule, API convention, or product decision should be included.

## Removed Presets

Remove:

- `StrictnessPreset.EASY`
- `StrictnessPreset.MEDIUM`
- `StrictnessPreset.HARD`

Remove the public `strictness` option entirely.

The new public option should be:

```ts
export interface IOptions {
  ignores?: string[]
  preset?: Preset
  rxjs?: boolean
  vue?: boolean
}
```

The default should be:

```ts
preset: Preset.RECOMMENDED
```

## Proposed Public API

```ts
import productiveEslint, { Preset } from 'productive-eslint'

export default productiveEslint({
  preset: Preset.RECOMMENDED,
})
```

String values can also be supported if useful:

```ts
export default productiveEslint({
  preset: 'recommended',
})
```

Supported values:

- `autoFixable`
- `recommended`

## Internal Config Model

Replace `TStrictnessPresetMap` with a smaller preset map:

```ts
export enum Preset {
  AUTO_FIXABLE = 'autoFixable',
  RECOMMENDED = 'recommended',
}

export type TPresetMap = Record<Preset, TFlatConfigItem>
```

Each plugin config should use the following structure:

```ts
const autoFixableRules: TFlatConfigItem['rules'] = {}
const recommendedRules: TFlatConfigItem['rules'] = {}

export const javascriptConfig: TPresetMap = {
  [Preset.AUTO_FIXABLE]: {
    ...shared,
    rules: autoFixableRules,
  },
  [Preset.RECOMMENDED]: {
    rules: recommendedRules,
  },
}
```

`RECOMMENDED` should not duplicate `AUTO_FIXABLE` rules inside each file. The merge helper should compose presets in order:

```ts
AUTO_FIXABLE -> RECOMMENDED
```

## Merge Helper

Replace `mergePresetConfigs(map, strictness)` with a preset-aware merge helper:

```ts
mergePresetConfigs(map, preset)
```

Preset order:

```ts
const PRESET_ORDER = [Preset.AUTO_FIXABLE, Preset.RECOMMENDED]
```

For `Preset.AUTO_FIXABLE`, merge only `AUTO_FIXABLE`.

For `Preset.RECOMMENDED`, merge `AUTO_FIXABLE` and `RECOMMENDED`.

## Data Format Configs

JSONC, YAML, and TOML configs are currently always active and not mapped through strictness.

For the major release, make them part of the same preset model.

Required change:

- split data-format rules into `AUTO_FIXABLE` and `RECOMMENDED`;
- keep formatting/autofix rules in `AUTO_FIXABLE`;
- keep syntax/validity rules in `RECOMMENDED`;
- reconsider `toml/keys-order` and `toml/tables-order` before adding them to `RECOMMENDED`.

This matters because `AUTO_FIXABLE` must mean only autofixable rules.

## Rule Migration

Use `PERMANENT_RULES.md` as the source of truth for rules that should move from old `easy`, `medium`, or `hard` buckets into the new `RECOMMENDED` preset.

General mapping:

- old `autoFixableRules` -> new `AUTO_FIXABLE`;
- selected mechanical non-autofixable rules -> new `RECOMMENDED`;
- rules listed under "Keep Out Of The Permanent Baseline" -> remove from repository-wide presets.

Rules removed from presets are not necessarily discarded. They should be considered candidates for agent tools.

## Agent Tools

Rules that require judgment should move out of the permanent ESLint config and into explicit agent-invoked commands/functions.

Examples:

- analyze explicit and implicit `any`;
- analyze `no-unsafe-*` type holes;
- analyze floating promises;
- analyze architecture boundaries;
- analyze complexity and deeply nested control flow;
- analyze Vue public API conventions;
- analyze RxJS subscription and error-handling risks.

The intended agent workflow:

1. Agent calls a focused diagnostic tool.
2. Tool returns structured output.
3. Agent summarizes hotspots and risk.
4. Agent proposes or performs a scoped migration.

The agent should not receive all nuanced rules as always-on lint noise.

## CLI Direction

Add a CLI in a later step. The preset migration should not depend on the CLI existing first.

CLI commands should be organized around diagnostic topics, not around raw ESLint rule names.

`P0` and `P1` are implementation priorities, not package versions or public API stability levels.

Each analyzer must be independently runnable. Agents should be able to call one focused diagnostic command without running the full analysis suite.

`analyze risk` is the exception: it is an aggregate dashboard that can compose several analyzers.

The public CLI output should be Markdown only. Markdown is the best default format for AI agents because it can carry ranked findings, context, explanation, and suggested next steps without forcing the agent to reconstruct meaning from raw JSON.

The implementation can still use structured internal result objects before rendering Markdown. Do not expose JSON in the initial CLI unless a concrete automation use case appears later.

### P0 Commands

These commands are the must-have set for the first useful AI-agent CLI:

```bash
productive-eslint analyze types
productive-eslint analyze architecture
productive-eslint analyze complexity
productive-eslint analyze async
productive-eslint analyze suppressions
```

#### `analyze types`

Type-safety vulnerability analysis.

Should include:

- explicit `any`;
- implicit `any`;
- `no-unsafe-*` flows;
- weak or unsafe type assertions;
- non-null assertions;
- `@ts-ignore`;
- weak `@ts-expect-error`;
- public API type holes;
- type holes in exported functions, classes, interfaces, and Vue component contracts.

The command should classify findings instead of only counting them:

- public API vs internal implementation;
- production code vs tests;
- generated or ignored files;
- explicit `any` vs implicit type holes;
- local fix vs migration-sized work.

#### `analyze architecture`

FSD and architecture dependency analysis.

Should include the current `boundaries` rule family:

- invalid layer imports;
- invalid slice-to-slice imports;
- imports through private files instead of public entry points;
- cross-layer direction violations;
- architecture hotspots by source and target layer.

The report should group violations by dependency direction, for example:

- `shared -> features`;
- `entities -> features`;
- `features -> other feature`;
- `pages -> other page`;
- private API imports.

#### `analyze complexity`

Cognitive and structural complexity analysis.

For agent workflows, complexity should primarily mean "risk of accidental semantic change", not "hard for a human to read".

Should include:

- cognitive complexity;
- cyclomatic complexity;
- max nesting depth;
- large functions;
- large switch statements;
- nested ternaries;
- deeply nested `if` chains;
- too many loop exits;
- duplicated branches where relevant.

Human readability signals can be softened for agents:

- nested `if` statements;
- `else` usage;
- nested ternaries;
- long functions;
- indentation depth.

These are still useful signals, but they should not automatically become high-severity findings.

Semantic change risk should carry more weight:

- mutations inside branches;
- shared mutable variables across branches;
- async calls inside branches;
- side effects in multiple branches;
- `try`/`catch` inside branching logic;
- mixed return shapes;
- fallthrough-prone switch logic;
- complex boolean expressions that guard mutations or side effects.

Suggested scoring direction:

- nesting by itself is low severity until it gets extreme;
- nested precondition checks without mutation are usually low risk;
- nesting plus mutation, async, or side effects should raise severity;
- functions with lower nesting but many state transitions may be riskier than deeply nested pure functions.

The weighted score should be computed by the CLI, not by the agent from prose instructions.

The CLI should collect mechanical AST facts and return the score, raw metrics, signals, and reasons. The agent should use that output to decide whether to refactor, where to start, and how risky the change is.

Initial scoring can be heuristic:

```txt
score =
  nestingAfter2 * 1
  + mutationInsideBranches * 2
  + asyncInsideBranches * 2
  + tryCatchInsideBranches * 2
  + mixedReturnShapes * 2
  + sharedMutableStateAcrossBranches * 3
  + sideEffectBranchesAfter1 * 3
  + longFunction * 1
  + complexBooleanGuards * 1
```

The command should expose why a score happened instead of asking the agent to trust a number:

```md
## High Risk

### `resolveInvoiceState`

- File: `src/billing/resolveInvoice.ts:42`
- Score: `14`
- Confidence: `medium`
- Raw metrics: max depth `3`, cyclomatic complexity `9`, lines `112`
- Signals: async in branch, mutation in branch, shared mutable state across branches, side effects in 4 branches
- Reasons:
  - Branches mutate shared variable `state`
  - Async calls are nested inside conditional logic
  - Four branches perform side effects
```

Confidence should describe how reliable the analyzer is about a finding:

- exact AST metrics such as `maxDepth` should usually be high confidence;
- assignments to outer-scope variables should usually be high confidence;
- inferred side effects from function calls should usually be medium confidence;
- overall refactor risk should be treated as an advisory summary, not a fact.

Example interpretation:

```txt
max-depth: 4
async: no
mutation: no
side effects: no
risk: low
```

```txt
max-depth: 3
async: yes
mutation: yes
side effects: yes
risk: high
```

For AI agents, this command should be advisory rather than punitive. Thresholds can be softer than human CI thresholds, because the goal is to find risky edit hotspots rather than fail every imperfect function.

#### `analyze async`

Async and Promise reliability analysis.

Should include:

- floating promises;
- ignored promises;
- misused promises;
- missing rejection handling;
- `promise/always-return`;
- `promise/catch-or-return`;
- `promise/no-return-in-finally`;
- `promise/no-multiple-resolved`;
- `no-async-promise-executor`;
- async constructors;
- confusing Promise chains.

The command should help the agent distinguish intentional fire-and-forget from missing error handling.

#### `analyze suppressions`

Suppression and technical-debt marker analysis.

Should include:

- bare `eslint-disable`;
- duplicate disables;
- unused disables/enables;
- broad disables;
- `@ts-ignore`;
- `@ts-expect-error` without useful descriptions;
- TODO/FIXME debt if later supported;
- optionally age or owner data if git metadata is added later.

The command should identify places where the codebase has explicitly opted out of safety checks.

### P1 Commands

These commands should come after the first CLI foundation is stable:

```bash
productive-eslint analyze dead-code
productive-eslint analyze imports
productive-eslint analyze api
productive-eslint analyze vue
productive-eslint analyze rxjs
productive-eslint analyze migrations
productive-eslint analyze risk
```

#### `analyze dead-code`

Unused and unreachable code analysis.

Should include:

- unused imports;
- unused variables;
- unused private class members;
- unused Vue components;
- unused Vue refs;
- unused Vue template variables;
- unreachable code;
- empty files;
- useless constructors;
- useless catches;
- redundant branches where the fix is deletion.

The command should separate safe deletions from findings that need export graph or public API checks.

#### `analyze imports`

Import hygiene and dependency-shape analysis.

Should include:

- duplicate imports;
- useless path segments;
- import cycles;
- package-internal imports;
- relative package imports;
- CommonJS usage;
- namespace imports;
- mutable exports;
- mixed type/value import style;
- configured barrel import violations.

This is separate from `analyze architecture`: imports are local dependency hygiene, while architecture is project-level dependency policy.

#### `analyze api`

Public contract analysis.

Should include:

- explicit return types for exported functions;
- exported `any`;
- public mutable exports;
- naming convention issues in public types;
- inconsistent default/named export policy;
- Vue props/events/slots public API consistency;
- public JSDoc requirements where enabled.

#### `analyze vue`

Vue-specific semantic analysis.

Should include:

- component API style;
- props destructuring migration;
- emits completeness;
- slot naming;
- `v-if` + `v-for`;
- prop mutation;
- side effects in computed;
- watcher mistakes;
- deprecated Vue APIs;
- unsafe `v-html`;
- missing stable `key`.

#### `analyze rxjs`

RxJS flow analysis.

Should include:

- ignored subscriptions;
- ignored observables;
- nested subscriptions;
- unsafe `switchMap`;
- exposed subjects;
- unsafe subject access;
- unsafe catch patterns;
- `takeUntil` issues;
- deprecated `toPromise`;
- replay buffer risks.

#### `analyze migrations`

Deprecated API and migration-tail analysis.

Should include:

- Vue deprecated APIs;
- Node deprecated APIs;
- RxJS deprecated APIs;
- old DOM APIs;
- deprecated package imports;
- framework migration leftovers.

#### `analyze risk`

Repository-level diagnostic dashboard.

This command should aggregate other analyses and produce a concise risk map:

- type safety risk;
- architecture risk;
- complexity risk;
- async risk;
- dead-code risk;
- suppression risk.

It should be useful as the first command an agent runs when entering an unfamiliar repository.

### Markdown Output Contract

CLI output should be Markdown by default and, for the initial CLI, Markdown should be the only public format.

The CLI should aggregate diagnostics instead of only proxying raw ESLint output.

Every analyzer report should include:

- title and short summary;
- severity counts;
- confidence notes;
- top hotspots;
- issue count by rule or signal;
- suggested first targets;
- distinction between trivial fixes and semantic work;
- explicit "what to do next" guidance for an agent.

Useful Markdown sections:

- `Summary`;
- `Severity`;
- `Hotspots`;
- `Signals`;
- `Suggested Order`;
- `Mechanical Fixes`;
- `Requires Judgment`;
- `Recommended Next Step`.

The implementation should keep an internal structured result model so reports remain consistent and can be rendered to another format later if there is a real need.

CLI commands should not behave like always-on lint by default. Exit code `1` should mean command failure, not "issues were found".

Later, add explicit failing modes:

```bash
productive-eslint analyze types --fail-on high
productive-eslint analyze complexity --fail-on critical
```

## Documentation Changes

Update `README.md`:

- replace `strictness` option with `preset`;
- document `AUTO_FIXABLE`;
- document `RECOMMENDED`;
- describe `RECOMMENDED` as the default permanent mechanical baseline;
- remove references to `easy`, `medium`, and `hard`;
- update AI agent integration section to point toward agent tools.

Remove `FIXES.md`. The new model should provide more informative permanent presets and focused agent diagnostics instead of a single manual-fix document.

## Package Exports

Current export:

```json
{
  ".": {
    "import": "./dist/index.config.js",
    "types": "./dist/index.config.d.ts"
  }
}
```

Potential future exports:

```json
{
  ".": {
    "import": "./dist/index.config.js",
    "types": "./dist/index.config.d.ts"
  },
  "./agent-tools": {
    "import": "./dist/agent-tools/index.js",
    "types": "./dist/agent-tools/index.d.ts"
  }
}
```

Do not add `agent-tools` until the first real diagnostic tool exists.

## Implementation Steps

1. Rename `StrictnessPreset` to `Preset`.
2. Replace enum members with `AUTO_FIXABLE` and `RECOMMENDED`.
3. Replace `strictness` option with `preset`.
4. Replace `TStrictnessPresetMap` with `TPresetMap`.
5. Update `mergePresetConfigs` to merge `AUTO_FIXABLE -> RECOMMENDED`.
6. Move selected rules from `PERMANENT_RULES.md` into `RECOMMENDED` buckets.
7. Remove old `easy`, `medium`, and `hard` buckets from all config files.
8. Convert JSONC, YAML, and TOML configs to the same preset model.
9. Update `src/index.config.ts` to use `preset`.
10. Update exports from `src/index.config.ts`.
11. Update `README.md`.
12. Run typecheck/build.
13. Dump effective rules for `AUTO_FIXABLE` and `RECOMMENDED`.
14. Compare the rule dump against `PERMANENT_RULES.md`.

## Breaking Changes Checklist

- `strictness` option is removed.
- `StrictnessPreset` export is removed or renamed to `Preset`.
- `easy`, `medium`, and `hard` values are removed.
- default behavior becomes `preset: Preset.RECOMMENDED`.
- some rules previously enabled by `hard` are no longer part of the default config.
- some rules previously enabled by `easy` are no longer part of the default config.
- JSONC/YAML/TOML behavior may change for `AUTO_FIXABLE` once they are mapped into presets.

## Validation

Before release:

```bash
pnpm typecheck
pnpm build
pnpm lint
pnpm rules:dump
```

Also manually inspect generated configs for representative files:

- `src/index.ts`
- `src/index.vue`
- `package.json`
- `eslint.config.ts`
- `README.md`

The main validation question:

> Does `AUTO_FIXABLE` contain only rules that can be fixed by ESLint, and does `RECOMMENDED` contain only rules that are safe as permanent repository-level noise?

## Release Notes Draft

`productive-eslint` now uses AI-first presets.

`strictness` has been removed. Use `preset` instead:

```ts
import productiveEslint, { Preset } from 'productive-eslint'

export default productiveEslint({
  preset: Preset.RECOMMENDED,
})
```

Available presets:

- `Preset.AUTO_FIXABLE` - only autofixable rules;
- `Preset.RECOMMENDED` - default permanent baseline, including autofixable and trivial non-autofixable rules.

Nuanced checks such as `any` usage, unsafe TypeScript flows, architecture boundaries, and complexity are being moved out of always-on presets and toward explicit agent analysis tools.
