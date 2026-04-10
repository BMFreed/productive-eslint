# An ESLint config for practical code analysis
This package provides an AI-friendly ESLint flat config for repository-wide mechanical checks.
It is heavily inspired by Evgeny Orekhov's [eslint-config-hardcore](https://github.com/EvgenyOrekhov/eslint-config-hardcore).

The default preset is intentionally limited to rules that are safe as permanent lint noise: autofixable rules plus trivial
non-autofixable checks that do not require architecture, API, or product decisions.

`productive-eslint` targets modern TypeScript-only ESM codebases. Project configs must use `eslint.config.ts` or `eslint.config.mts`.

Documentation:

- [Configuration Model](./docs/configuration.md)
- [CLI Diagnostics](./docs/cli-diagnostics.md)
- [Analyzer Runtime](./docs/analyzer-runtime.md)

---

### 📦 Installation
```bash
pnpm add -D productive-eslint eslint typescript prettier prettier-plugin-jsdoc
# or
npm i -D productive-eslint eslint typescript prettier prettier-plugin-jsdoc
```

---

### 🚀 Usage
1. Make sure you have the following dependencies installed:
   - ESLint 10+
   - TypeScript 5.9+ (required)
   - Prettier 3.6+

2. Create `eslint.config.ts` or `eslint.config.mts` in project root:
   ````typescript
   import { createConfig } from 'productive-eslint'

   export default createConfig()
   ````

3. Add scripts to package.json:
   ````json
   "scripts": {
   "lint": "eslint .",
   "lint:fix": "eslint . --fix"
   }
   ````

---

### Options

`createConfig` accepts an options object:

| Option | Type | Default | Description |
|---|---|---|---|
| `preset` | `Preset.AUTO_FIXABLE \| Preset.RECOMMENDED` | `Preset.RECOMMENDED` | Rule preset |
| `ignores` | `string[]` | `[]` | Additional glob patterns to ignore |
| `vue` | `boolean` | auto-detect | Enable Vue/Nuxt rules |
| `rxjs` | `boolean` | auto-detect | Enable RxJS rules |

By default, `vue` and `rxjs` are auto-detected based on installed packages.

### Presets

```ts
import { createConfig, Preset } from 'productive-eslint'
```

`Preset.AUTO_FIXABLE` enables only rules with reliable ESLint autofix support.

```ts
export default createConfig({
  preset: Preset.AUTO_FIXABLE,
})
```

`Preset.RECOMMENDED` is the default permanent baseline. It includes `AUTO_FIXABLE` plus mechanical non-autofixable rules.

```ts
export default createConfig({
  preset: Preset.RECOMMENDED,
})
```

---

### Monorepo setup

When the ESLint config lives at the **workspace root**, auto-detection may not find packages installed only in sub-packages. In this case, enable framework configs explicitly:

```ts
import { createConfig } from 'productive-eslint'

export default createConfig({
  rxjs: true,
  vue: true,
})
```

---

### On-Demand Code Review Diagnostics

Repository-wide ESLint is kept mechanical on purpose. Nuanced checks such as type-safety debt, architecture boundaries,
async correctness, migration tails, framework lifecycle risk, and complexity should be handled by focused diagnostics
instead of being enabled as permanent lint noise.

These diagnostics are intended for explicit review/audit requests, not as an always-on agent tool loop during ordinary
coding tasks.

Available CLI diagnostics:

```bash
productive-eslint analyze types
productive-eslint analyze architecture
productive-eslint analyze complexity
productive-eslint analyze async
productive-eslint analyze suppressions
productive-eslint analyze dead-code
productive-eslint analyze imports
productive-eslint analyze api
productive-eslint analyze vue
productive-eslint analyze rxjs
productive-eslint analyze migrations
productive-eslint analyze risk
```

Run one diagnostic at a time from an explicit project root:

```bash
productive-eslint analyze types --cwd /path/to/project
productive-eslint analyze complexity --cwd . --top 20
productive-eslint analyze suppressions --cwd . --include "src/**/*.ts" --exclude "**/*.test.ts"
```

Recommended first audit pass:

```bash
productive-eslint analyze risk --cwd .
productive-eslint analyze types --cwd .
productive-eslint analyze suppressions --cwd .
productive-eslint analyze async --cwd .
productive-eslint analyze architecture --cwd .
productive-eslint analyze complexity --cwd . --top 20
```

Use framework-specific diagnostics only when the target project enables the
matching preset support:

```bash
productive-eslint analyze vue --cwd .
productive-eslint analyze rxjs --cwd .
productive-eslint analyze migrations --cwd .
```

The CLI requires the target project to export a marked `productive-eslint`
composer from `eslint.config.ts` or `eslint.config.mts`.

---

📄 License: MIT © Bogdan Binitskiy
💻 Contributor: [Roman Nikitin](https://github.com/Stelsovich1)
