## Project overview
`productive-eslint` — opinionated ESLint flat config preset (npm package).
Inspired by eslint-config-hardcore. Targets ESLint 10+, TypeScript 5.9+, Node 22+.

## Tech stack
- Language: TypeScript (strict, `exactOptionalPropertyTypes`)
- Package manager: pnpm
- Bundler: tsdown
- Module system: ESM (`"type": "module"`)
- Entry point: `src/index.config.ts` → `dist/index.config.js`

## Project structure
- `src/index.config.ts` — main factory `createConfig(options)`, composes all rule configs
- `src/*.config.ts` — per-plugin rule configs (javascript, typescript, unicorn, vue, etc.)
- `src/utils/strictness.ts` — `StrictnessPreset` enum (easy/medium/hard) and `mergePresetConfigs`
- `src/utils/globs.ts` — file glob constants
- `src/plugins/productive.plugin.ts` — custom ESLint plugin with custom rules
- `scripts/` — utility scripts (dump/compare ESLint rules), run via `jiti`
- `FIXES.md` — shipped with the package; describes how to manually fix every non-autofixable rule

## Key patterns
- Each rule config file exports a `TStrictnessPresetMap` — an object with `easy`, `medium`, `hard` keys
- `mergePresetConfigs(map, strictness)` merges rules up to the selected level
- Vue and RxJS support is auto-detected (via `local-pkg`) or explicitly enabled via options
- The config uses `FlatConfigComposer` from `eslint-flat-config-utils` for composability

## Scripts
- `pnpm lint` — typecheck (`tsc`) + lint with autofix (`eslint --fix`)
- `pnpm build` — build with tsdown (output to `dist/`)
- `pnpm release` — build + publish
- `pnpm inspect` — open ESLint config inspector
- `pnpm rules:dump` / `pnpm rules:compare` — utility scripts for rule management

## Linting
When fixing ESLint errors that `eslint --fix` cannot resolve,
look up the rule in FIXES.md.
