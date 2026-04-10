## Project overview
`productive-eslint` — opinionated ESLint flat config preset (npm package).
Inspired by eslint-config-hardcore. Targets ESLint 10+, TypeScript 5.9+, Node 24+.

## Tech stack
- Language: TypeScript (strict, `exactOptionalPropertyTypes`)
- Package manager: pnpm
- Bundler: tsdown
- Module system: ESM (`"type": "module"`)
- Entry point: `src/index.config.ts` → `dist/index.config.js`
- Supported consumer setup: TypeScript-only ESM codebases with `eslint.config.ts` or `eslint.config.mts`

## Project structure
- `src/index.config.ts` — main factory `createConfig(options)`, composes all rule configs
- `src/*.config.ts` — per-plugin rule configs (javascript, typescript, unicorn, vue, etc.)
- `src/utils/presets.ts` — `Preset` enum (`autoFixable`/`recommended`) and `mergePresetConfigs`
- `src/utils/globs.ts` — file glob constants
- `src/plugins/productive.plugin.ts` — custom ESLint plugin with custom rules
- `scripts/` — utility scripts (dump/compare ESLint rules), run via `jiti`

## Key patterns
- Each rule config file exports a `TPresetMap` — an object with `autoFixable` and `recommended` keys
- `mergePresetConfigs(map, preset)` merges `autoFixable` and, when requested, `recommended`
- Vue and RxJS support is auto-detected (via `local-pkg`) or explicitly enabled via options
- The config uses `FlatConfigComposer` from `eslint-flat-config-utils` for composability

## Scripts
- `pnpm lint` — typecheck (`tsc`) + lint with autofix (`eslint --fix`)
- `pnpm build` — build with tsdown (output to `dist/`)
- `pnpm release` — build + publish
- `pnpm inspect` — open ESLint config inspector
- `pnpm rules:dump` / `pnpm rules:compare` — utility scripts for rule management

## Linting
Repository-wide lint rules are intended to stay mechanical. Nuanced checks should move to focused on-demand diagnostics.
