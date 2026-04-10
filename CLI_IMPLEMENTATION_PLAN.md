# CLI Implementation Plan

This document describes the implementation plan for the future `productive-eslint` CLI.

The CLI is a separate track from preset migration. Its job is not to replace permanent ESLint config, but to provide focused diagnostics that AI agents can call explicitly.

## Goal

Build a CLI that lets agents run one targeted analysis at a time:

```bash
productive-eslint analyze types
productive-eslint analyze architecture
productive-eslint analyze complexity
productive-eslint analyze async
productive-eslint analyze suppressions
```

The CLI should:

- run analyzers independently;
- output Markdown only;
- produce ranked, agent-friendly reports instead of raw lint dumps;
- treat focused ESLint output as the canonical source of findings;
- add metrics, ranking, grouping, and enrichment on top of that source;
- leave prioritization and repair strategy to the agent.

## Scope Boundaries

The CLI is not:

- a replacement for `eslint .`;
- a second permanent preset system;
- a generic raw JSON API in the first version;
- a "run all diagnostics every time" tool by default.

The CLI is:

- an explicit diagnostics layer;
- a thin command surface over analyzers;
- a reporting system for hotspots, risk, and migration planning.

## Execution Model

The CLI should run analyzers against the target project's real ESLint setup.

Core rule:

> The execution substrate is the project's own `eslint.config.*`, loaded from the
> selected `--cwd`, with analyzer-specific diagnostic rules layered on top.

This means:

- the CLI should reuse the project's actual parser, resolver, alias, ignore, and
  type-aware lint setup where possible;
- analyzer packages from `productive-eslint` should act as focused diagnostic
  overlays, not as a replacement ESLint universe;
- the first version should target one project root per invocation, not try to
  magically analyze an entire multi-config monorepo in one pass.
- if `--cwd` does not contain a supported `eslint.config.*`, the CLI should fail
  fast with a clear error.

This approach is especially important for:

- TypeScript project layouts;
- Vue SFC parsing;
- monorepo-local aliases and resolver settings;
- project-specific ignores and generated-code exclusions.

## Supported Project Config Shape

The first CLI version should support only projects whose `eslint.config.*`
exports a `productive-eslint` composer pipeline.

Supported shapes:

- `export default createConfig()`
- `export default createConfig({...})`
- `export default createConfig(...).append(...)`
- `export default createConfig(...).override(...)`
- equivalent chains that still preserve the original composer object

Unsupported in the first version:

- configs that do not use `productive-eslint`;
- configs that fully materialize the composer into a plain array before export;
- configs that replace the composer pipeline with unrelated custom factories.

This boundary is intentional. The CLI is a diagnostic layer for projects built
on `productive-eslint`, not a generic analyzer for arbitrary ESLint setups.

## Productive Config Detection

Detection should be based on an explicit runtime marker, not on source-text
inspection of the config file.

Recommended approach:

- expose `createConfig` as a named export;
- attach a stable `productive-eslint` marker, preferably a private `Symbol`, to the returned
  `FlatConfigComposer`;
- have the CLI load the project config and verify that the exported composer
  carries that marker.

Marker semantics for chainable configs:

- the marker must live on the composer instance itself;
- supported chain methods such as `.append(...)` and `.override(...)` are
  expected to return the same composer instance, so the marker survives the
  chain naturally;
- the CLI should validate the final exported value, not intermediate source
  text;
- if a config resolves the composer into a plain array before export, the marker
  is lost and the shape is unsupported in the first version.

Do not rely on:

- import names in source text;
- heuristics based on config item names;
- guessing from enabled rule ids.

## Source Of Truth Principle

The CLI must not create a second independent lint universe.

Core rule:

> ESLint output is the canonical source of findings whenever an existing rule or
> config already expresses the diagnostic truth.

The CLI should add:

- aggregation;
- ranking;
- hotspot scoring;
- severity normalization;
- confidence notes;
- public-vs-internal classification;
- Markdown rendering;
- analyzer-specific metrics layered on top of ESLint findings.

The CLI should not reimplement an existing rule family from scratch unless there is no adequate ESLint surface for the diagnostic.

When additional logic is needed, prefer this order:

1. reuse the target project's ESLint config as the execution substrate;
2. reuse existing `productive-eslint` config and rules;
3. add focused analyzer-specific ESLint rule sets if needed;
4. add custom metrics on top of ESLint findings;
5. avoid standalone AST-only truth unless there is no rule-based alternative.

Analyzer overlays should have final authority over analyzer-scoped diagnostics.

That means:

- the project config provides execution environment and baseline lint behavior;
- analyzer overlays may re-enable analyzer-specific rules even if the project
  config disabled them for normal day-to-day linting;
- project-level `off` switches for analyzer rules are not respected in the first
  CLI version;
- if we later want repository-specific analyzer opt-outs, that should be a
  separate explicit API rather than implicit inheritance from project lint
  settings.

## Priorities

`P0` and `P1` are implementation priorities, not public stability levels.

### P0

- `analyze types`
- `analyze architecture`
- `analyze complexity`
- `analyze async`
- `analyze suppressions`

### P1

- `analyze dead-code`
- `analyze imports`
- `analyze api`
- `analyze vue`
- `analyze rxjs`
- `analyze migrations`
- `analyze risk`

## Recommended Delivery Order

Even inside `P0`, the order matters.

### Phase 1

CLI foundation only:

- command entrypoint;
- argument parsing;
- file targeting;
- project ESLint config discovery/loading;
- focused ESLint runtime built on top of project config;
- Markdown report rendering;
- common analyzer interface;
- shared severity/confidence model;
- packaging/build integration.

### Phase 2

First analyzer: `analyze types`

This gives the most value immediately and best expresses the new AI-first philosophy.

### Phase 3

Add:

- `analyze architecture`
- `analyze complexity`

These two complement `types` well and cover system-level risk.

### Phase 4

Add:

- `analyze async`
- `analyze suppressions`

These are still `P0`, but can ride on the CLI/reporting infrastructure from earlier phases.

### Phase 5

Move on to `P1`.

## Public Command Shape

Initial command family:

```bash
productive-eslint analyze <topic>
```

Examples:

```bash
productive-eslint analyze types
productive-eslint analyze complexity
productive-eslint analyze architecture
```

## Initial CLI Options

Keep the surface small in the first version.

Recommended options:

```bash
productive-eslint analyze types --include "src/**/*.ts"
productive-eslint analyze types --exclude "**/*.test.ts"
productive-eslint analyze types --top 20
productive-eslint analyze types --cwd .
```

### Option Set

- `--cwd <path>` - project root override
- `--include <glob>` - repeatable include filter
- `--exclude <glob>` - repeatable exclude filter
- `--top <number>` - maximum hotspots to print

### File Targeting Semantics

File targeting should be deterministic and conservative.

Recommended rule:

1. start from the target project's own ESLint file universe and ignore behavior;
2. apply `--include` as an additional narrowing filter;
3. apply `--exclude` last, with final precedence.

This means:

- project ignores still apply in the first version;
- `--include` does not resurrect files ignored by the project config;
- `--exclude` wins over `--include` when patterns overlap.
- `--top` limits rendered hotspots only and must not reduce the underlying
  analyzer scan or finding collection.

If we later need "analyze ignored files on purpose", that should be a separate
explicit flag rather than surprising `--include` behavior.

Defer for later:

- `--fail-on`
- `--format`
- `--json`
- `--watch`
- `--fix`

## Output Contract

Public output is Markdown only.

The report should be readable by both humans and agents without extra transformation.

Each report should contain:

- title;
- short summary;
- severity overview;
- confidence notes where useful;
- hotspot list;
- concise reasons;
- suggested investigation order;
- explicit next step guidance.

### Suggested Markdown Skeleton

```md
# Types Analysis

## Summary

- Files scanned: `128`
- Findings: `91`
- High severity hotspots: `7`

## Highest Risk

### `src/api/client.ts`

- Score: `18`
- Confidence: `high`
- Why:
  - Public API returns `any`
  - Unsafe member access leaks into exported helpers
  - Two `@ts-ignore` suppressions hide assignability errors

## Suggested Order

1. `src/api/client.ts`
2. `src/shared/lib/fetch.ts`
3. `src/features/billing/model.ts`

## Next Step

Start with exported API surfaces that leak `any` across module boundaries.
```

## Internal Architecture

Even though public output is Markdown only, the implementation should use structured internal result objects.

That keeps analyzers deterministic and makes Markdown rendering consistent.

### Core Layers

#### 1. CLI Entrypoint

Responsibilities:

- parse argv;
- resolve command and options;
- dispatch to the selected analyzer;
- print Markdown to stdout;
- use exit code `1` only for execution failure.

Suggested file:

- `src/cli/index.ts`

#### 2. Command Router

Responsibilities:

- map `analyze <topic>` to analyzer implementation;
- validate supported topics;
- normalize common options.

Suggested files:

- `src/cli/commands/analyze.ts`
- `src/cli/topics.ts`

#### 2.5. Project Config Loader

Responsibilities:

- find `eslint.config.*` in the selected `--cwd`;
- import the project's default export;
- validate that the export is a supported `productive-eslint` composer shape;
- fail with clear, stable errors when the config is missing or unsupported.

Suggested file:

- `src/cli/runtime/load-project-config.ts`

#### 3. Shared Analyzer Runtime

Responsibilities:

- resolve file lists from cwd/include/exclude;
- load the target project's ESLint config from `--cwd`;
- build focused ESLint runs for each analyzer on top of that config;
- reuse the project's existing parser, resolver, ignore, and plugin surface where possible;
- apply analyzer-specific rule overlays from `productive-eslint`;
- verify that the loaded config is a supported `productive-eslint` composer;
- run analyzer against files;
- collect canonical ESLint findings;
- attach analyzer-specific enrichment and metrics;
- rank hotspots;
- return a structured report object.

Suggested files:

- `src/cli/runtime/file-targeting.ts`
- `src/cli/runtime/eslint-runtime.ts`
- `src/cli/runtime/project-context.ts`
- `src/cli/runtime/report-types.ts`
- `src/cli/runtime/ranking.ts`

#### 4. Markdown Renderer

Responsibilities:

- turn internal report objects into stable Markdown;
- keep output consistent across analyzers;
- support severity sections and hotspot sections.

Suggested files:

- `src/cli/render/markdown.ts`
- `src/cli/render/sections.ts`

#### 5. Analyzer Modules

One module per topic.

Suggested files:

- `src/cli/analyzers/types.ts`
- `src/cli/analyzers/architecture.ts`
- `src/cli/analyzers/complexity.ts`
- `src/cli/analyzers/async.ts`
- `src/cli/analyzers/suppressions.ts`

## Shared Internal Types

Suggested internal model:

```ts
export interface IAnalyzerContext {
  cwd: string
  include: string[]
  exclude: string[]
  top: number
}

export interface IAnalyzerFinding {
  analyzer: string
  kind: string
  category: string
  file: string
  line?: number
  column?: number
  hotspotKey?: string
  title: string
  severity: 'low' | 'medium' | 'high'
  confidence?: 'low' | 'medium' | 'high'
  score?: number
  ruleIds?: string[]
  reasons: string[]
  signals?: string[]
  metadata?: Record<string, unknown>
}

export interface IAnalyzerFileSummary {
  file: string
  findingCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  topHotspotKey?: string
}

export interface IAnalyzerReport {
  analyzer: string
  title: string
  summary: string[]
  countsBySeverity: Record<'low' | 'medium' | 'high', number>
  findings: IAnalyzerFinding[]
  fileSummaries?: IAnalyzerFileSummary[]
  suggestedOrder?: string[]
  nextStep?: string
}
```

This model is still compact, but it avoids encoding too much structure into `title` and `reasons`.

## Data Sources By Analyzer

Different analyzers will need different sources of truth.

### `analyze types`

Primary sources:

- focused ESLint runs against the target project's real ESLint config;
- analyzer-specific TypeScript/Vue diagnostic overlays from `productive-eslint`.

Secondary enrichment sources:

- TypeScript compiler API;
- type checker;
- symbol/export metadata.

Why:

- the finding truth should come from ESLint rules such as explicit `any`,
  unsafe flows, weak suppressions, and related diagnostics;
- TypeScript APIs should enrich, classify, and prioritize findings, not replace
  the rule layer;
- exported/public classification needs symbol information on top of findings.

Important requirement:

- inherit the project's existing Vue-aware parser setup, resolver settings, and
  type-aware lint behavior from its own ESLint config;
- do not build a parallel parser/bootstrap layer for `.vue`, project references,
  or monorepo tsconfig layouts if the project config already handles them;
- if the target project has multiple ESLint roots, the CLI should require an
  explicit `--cwd` pointing at the project to analyze.
- analyzer-specific TypeScript diagnostics should still be enabled by the
  overlay even when the project config keeps them off during normal lint runs.

### `analyze architecture`

Primary sources:

- focused ESLint runs against the target project's ESLint config with the
  `boundaries` diagnostic overlay enabled;
- one shared architecture model consumed by both ESLint config and CLI.

Secondary enrichment sources:

- import graph summaries;
- direction aggregation;
- hotspot grouping.

Why:

- the CLI must preserve exactly the same project understanding as current
  `boundaries`;
- the analyzer should summarize dependency direction and hotspots instead of just listing violations.

Important requirement:

- extract the architecture model into a shared module before building the CLI
  analyzer;
- do not let the CLI define a second copy of FSD rules;
- do not assume the project's chosen preset already carries `boundaries`
  settings or plugin setup, because the current permanent baseline keeps those
  rules out of `RECOMMENDED`;
- the architecture overlay must inject the shared `boundaries` setup and rules
  explicitly, while still running inside the target project's real ESLint
  environment.

### `analyze complexity`

Primary sources:

- focused ESLint runs against the target project's ESLint config with
  complexity-related rules enabled;
- existing structural rule output wherever available.

Secondary enrichment sources:

- AST-derived metrics;
- function-level scoring;
- branch/mutation/async/side-effect heuristics.

Why:

- this analyzer needs custom scoring, but the scoring should layer on top of
  ESLint findings;
- if existing rules are not enough, prefer analyzer-specific ESLint rules over a
  fully separate AST-only truth engine.

### `analyze async`

Primary sources:

- focused ESLint runs against the target project's ESLint config with Promise-,
  TypeScript-, and related async overlays enabled.

Secondary enrichment sources:

- Promise/async flow heuristics;
- branch and control-flow classification.

### `analyze suppressions`

Primary sources:

- focused ESLint runs against the target project's ESLint config with
  directive-related rules and unused-disable machinery enabled.

Secondary enrichment sources:

- TypeScript suppression comment scanning;
- density metrics by file.

Important requirement:

- `unused enables/disables` must come from ESLint semantics, not text parsing;
- raw comment scanning is only for signals ESLint does not already define.

## First Analyzer: `analyze types`

This should be the first concrete implementation after the foundation.

### Why Start Here

- highest value for AI agents;
- strongest motivation for the whole new model;
- easier to demonstrate with real hotspot reports;
- useful even before the rest of the analyzers exist.

### P0 Output Goals

The full analyzer should eventually detect and classify:

- explicit `any`;
- implicit `any`;
- exported `any`;
- unsafe casts in exported APIs;
- `@ts-ignore`;
- weak `@ts-expect-error`;
- `no-unsafe-*` style flows where practical.

### First Vertical Slice

The first implementation should be narrower on purpose.

#### P0.1

Start with canonical ESLint findings from:

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/ban-ts-comment`

This is enough to validate:

- project config loading;
- analyzer overlay application;
- focused ESLint execution;
- Markdown report rendering;
- hotspot grouping and ranking.

#### P0.2

Then add:

- exported/public classification;
- richer hotspot scoring;
- implicit `any`;
- Vue component contract classification;
- broader `no-unsafe-*` coverage where useful.

### P0 Prioritization Rules

The report should prioritize:

1. exported/public API type holes;
2. shared library utilities;
3. core domain modules;
4. internal implementation details;
5. tests last.

### Suggested Internal Pipeline

1. Resolve target files.
2. Load the target project's ESLint config from `--cwd`.
3. Build the analyzer overlay on top of that config.
4. Run ESLint and collect canonical findings.
5. Build TypeScript enrichment context where needed.
6. Attach public/export classification and other typed metadata.
7. Group by file.
8. Score hotspots.
9. Render Markdown.

### Initial Overlay Contract

For `analyze types`, the first overlay should stay simple:

- enable or strengthen a small analyzer-specific ruleset;
- preserve the project's parser, resolver, plugin, and ignore environment;
- avoid broad config surgery in the first iteration.

This keeps the first implementation close to "project config + focused
diagnostic overlay" instead of turning it into a second config system.

## Architecture Analyzer

This should reuse the current FSD assumptions already embedded in the package.

### P0 Output Goals

- summarize invalid import directions;
- show top offending files;
- show top violated dependency directions;
- distinguish private-entry violations from layer violations.

### Required Shared Extraction

Before the analyzer is implemented, extract the current architecture source of
truth from [src/boundaries.config.ts](/home/bogdan/Work/productive-eslint/src/boundaries.config.ts)
into a shared module, for example:

- `src/architecture/model.ts`
- `src/architecture/boundaries-shared.ts`

That shared module should own:

- `boundaries/elements`;
- `boundaries/include`;
- `import/resolver` settings needed for architecture checks;
- analyzer-facing helpers for turning captures into direction labels.

Then:

- the permanent ESLint config should reuse that shared module;
- `analyze architecture` should build its overlay from the same shared module.

### Canonical Rule Surface

The first analyzer should stay close to the existing `boundaries` truth.

Recommended P0 overlay:

- `boundaries/element-types`
- `boundaries/entry-point`

These rules are enough to support:

- invalid cross-layer imports;
- invalid slice-to-slice imports;
- private API imports instead of public entry points.

If later we add more architecture-specific rules, they should extend this
overlay rather than replace it with a separate graph checker.

### First Vertical Slice

As with `types`, the first implementation should be narrow on purpose.

#### P0.1

Start with:

- shared architecture model extraction;
- architecture overlay that injects shared `boundaries` setup;
- canonical findings from `boundaries/element-types` and
  `boundaries/entry-point`;
- Markdown report with file hotspots and direction summaries.

This is enough to validate:

- shared source of truth reuse;
- overlay behavior under `Preset.RECOMMENDED`;
- aggregation of `boundaries` messages into agent-friendly summaries.

#### P0.2

Then add:

- richer direction grouping by source and target layer;
- stronger hotspot ranking for repeated offenders;
- capture-aware summaries such as `features -> features(other slice)`;
- optional private-entry concentration metrics.

### Overlay Contract

For `analyze architecture`, the overlay should:

- inject the shared `boundaries` plugin/settings/setup even if the project's
  chosen preset does not keep them enabled permanently;
- preserve the target project's parser, resolver environment, aliases, and
  ignore behavior;
- enable architecture diagnostics without depending on the day-to-day preset;
- keep rule truth canonical by reading ESLint output, not by replacing it with a
  standalone import-graph engine.

### Aggregation Model

The analyzer should transform canonical rule findings into three output layers:

1. raw findings by file and line;
2. grouped dependency directions;
3. ranked hotspots.

Recommended initial categories:

- `layer-direction`
- `slice-direction`
- `private-entry`

Recommended direction labels:

- `shared -> features`
- `entities -> features`
- `features -> features`
- `pages -> pages`
- `private entry imports`

### Suggested Internal Pipeline

1. Load the target project's config from `--cwd`.
2. Apply the shared architecture overlay on top of it.
3. Run focused ESLint using the canonical `boundaries` rule surface.
4. Parse rule messages together with shared capture metadata.
5. Normalize each finding into:
   - source file
   - source layer
   - target layer
   - violation category
   - rule id
6. Group findings by:
   - file
   - direction
   - private-entry vs layer-direction
7. Rank hotspots.
8. Render Markdown.

### Important Design Choice

Do not output raw `boundaries` messages only.

Instead, aggregate into shapes agents can act on:

- `shared -> features`: `3`
- `features -> other feature`: `11`
- `private entry imports`: `27`

### Markdown Goals

The first report should make the agent's first move obvious.

Recommended sections:

- `Summary`
- `Top Directions`
- `Highest Risk Files`
- `Next Step`

The `Top Directions` section should answer:

- which direction is violated most often;
- whether the main issue is private-entry imports or cross-layer dependency flow;
- which file should be inspected first.

## Complexity Analyzer

This analyzer must follow the semantic-risk model already accepted in the migration plan.

### Core Rule

Complexity for agents means:

> risk of accidental semantic change

not:

> hard for humans to read

### P0 Output Goals

- function hotspots with weighted scores;
- reasons and signals, not score alone;
- lower weight for pure nesting;
- higher weight for mutation, shared state, async, and side effects.

### Initial Scoring Inputs

- nesting depth after threshold;
- mutation inside branches;
- shared mutable state across branches;
- async inside branches;
- multiple side-effecting branches;
- mixed return shapes;
- function size;
- boolean guard complexity.

The CLI computes this score. Agents do not compute it from prose.

The score should be layered on top of ESLint findings and enriched metrics, not
treated as an independent source of diagnostic truth.

## Async Analyzer

### P0 Output Goals

- floating promises;
- likely missing await/catch;
- Promise chains with confusing control flow;
- async constructors or invalid async setup shapes;
- Promise patterns that hide failures.

### Important Behavior

The report should try to separate:

- likely bug;
- suspicious but possibly intentional fire-and-forget;
- stylistic issue with lower urgency.

These distinctions should be made after collecting ESLint-based findings, not by
replacing them with a standalone async detector.

## Suppressions Analyzer

### P0 Output Goals

- bare `eslint-disable`;
- duplicate disables;
- unused enables/disables;
- `@ts-ignore`;
- weak `@ts-expect-error`;
- high-density suppression files.

### Why It Matters

Suppressions are places where the codebase already admits risk or uncertainty. That is exactly the kind of signal an agent should inspect early.

## P1 Analyzer Rule-Reuse Requirements

The same source-of-truth rule applies to later analyzers.

### `analyze dead-code`

- reuse existing unused/dead-code-related ESLint findings where available;
- add safe-delete ranking and export-graph checks on top;
- do not build a second unused-code detector from scratch.

### `analyze imports`

- reuse the existing import rule surface and resolver behavior;
- add graph summaries, grouping, and hotspot ranking on top;
- do not build a separate import-policy engine.

### `analyze api`

- reuse the existing API-relevant rule surface where applicable;
- add exported/public classification and prioritization on top.

### `analyze vue`

- reuse the current Vue rule/config surface;
- add grouping by component/public API hotspot;
- do not create a second Vue diagnostics model independent of the package rules.

### `analyze rxjs`

- reuse the current RxJS rule surface;
- add flow grouping and risk ranking on top;
- do not create a separate reactive-lint universe.

### `analyze migrations`

- reuse deprecated-API rule surfaces first;
- add migration summaries and prioritization on top;
- avoid fragile standalone string-pattern catalogs as the main source of truth.

## Aggregated Analyzer: `analyze risk`

This is `P1` on purpose.

It should not exist until the individual analyzers are stable enough to compose.

### Behavior

- run several analyzers;
- merge their summaries;
- produce a top-level repository risk map.

### Important Rule

`analyze risk` must not be the implementation foundation for the other analyzers.

It depends on them. They do not depend on it.

## Packaging Plan

The CLI needs a published executable.

Recommended addition to `package.json` later:

```json
{
  "bin": {
    "productive-eslint": "./dist/cli.js"
  }
}
```

The implementation should be bundled along with the package build, but only after the first real CLI command exists.

## Build Plan

Suggested sequence:

1. Add CLI source entry.
2. Export `createConfig` as a named API and add a runtime marker to the returned composer.
3. Add `bin` entry to `package.json`.
4. Add tsdown entry for CLI build output.
5. Implement foundation only.
6. Implement project ESLint config loading, supported-shape validation, and analyzer overlay runtime.
7. Add `analyze types`.
8. Verify local invocation from built output.
9. Add remaining `P0` analyzers.

## Validation

Validation should happen at two levels.

### Substrate Validation

Each analyzer should be validated on:

- a small fixture with known findings;
- a mixed real-world sample from this repo or a local test repo;
- a "clean" case with no findings.

The CLI substrate should also be validated on failure modes:

- missing `eslint.config.*` in `--cwd`;
- unsupported exported config shape;
- missing or broken `productive-eslint` marker;
- multi-root repo invocation with the wrong `--cwd`;
- built binary invocation from packaged output.

### Report Validation

The report should be checked for:

- stable ordering;
- useful hotspot ranking;
- concise Markdown;
- absence of raw noisy dumps;
- consistent severity language.

## Error Contract

The first CLI version should return clear, stable error messages for:

- missing `eslint.config.*` in `--cwd`;
- unsupported exported config shape;
- config not based on `productive-eslint`;
- unknown analyzer topic.

These errors are part of the developer experience and should be treated as
intentional contract, not incidental exceptions.

## Success Criteria

The CLI is successful when an agent can do this:

1. call one analyzer;
2. get a concise Markdown report;
3. identify the first useful file to inspect;
4. distinguish trivial cleanup from risky semantic work;
5. decide what to fix now and what to postpone.

## First Concrete Milestone

If we want the narrowest, highest-value starting point:

1. add CLI foundation;
2. implement `productive-eslint analyze types` with the P0.1 ruleset;
3. validate built binary invocation and failure modes;
4. expand to P0.2 only after the vertical slice is stable.
3. make Markdown output stable;
4. use that as the template for all later analyzers.
