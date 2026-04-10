# An ESLint config for practical code analysis
This package provides an AI-first ESLint flat config for repository-wide mechanical checks.
It is heavily inspired by Evgeny Orekhov's [eslint-config-hardcore](https://github.com/EvgenyOrekhov/eslint-config-hardcore).

The default preset is intentionally limited to rules that are safe as permanent lint noise: autofixable rules plus trivial
non-autofixable checks that do not require architecture, API, or product decisions.

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

2. Create eslint.config.ts in project root:
   ````typescript
   import productiveEslint from 'productive-eslint'

   export default productiveEslint()
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

`productiveEslint` accepts an options object:

| Option | Type | Default | Description |
|---|---|---|---|
| `preset` | `Preset.AUTO_FIXABLE \| Preset.RECOMMENDED` | `Preset.RECOMMENDED` | Rule preset |
| `ignores` | `string[]` | `[]` | Additional glob patterns to ignore |
| `vue` | `boolean` | auto-detect | Enable Vue/Nuxt rules |
| `rxjs` | `boolean` | auto-detect | Enable RxJS rules |

By default, `vue` and `rxjs` are auto-detected based on installed packages.

### Presets

```ts
import productiveEslint, { Preset } from 'productive-eslint'
```

`Preset.AUTO_FIXABLE` enables only rules with reliable ESLint autofix support.

```ts
export default productiveEslint({
  preset: Preset.AUTO_FIXABLE,
})
```

`Preset.RECOMMENDED` is the default permanent baseline. It includes `AUTO_FIXABLE` plus mechanical non-autofixable rules.

```ts
export default productiveEslint({
  preset: Preset.RECOMMENDED,
})
```

---

### Monorepo setup

When the ESLint config lives at the **workspace root**, auto-detection may not find packages installed only in sub-packages. In this case, enable framework configs explicitly:

```ts
import productiveEslint from 'productive-eslint'

export default productiveEslint({
  rxjs: true,
  vue: true,
})
```

---

### AI Agent Integration

Repository-wide ESLint is kept mechanical on purpose. Nuanced checks such as type-safety debt, architecture boundaries,
async risk, and complexity should be handled by focused agent diagnostics instead of being enabled as permanent lint noise.

CLI diagnostics are planned separately.

---

📄 License: MIT © Bogdan Binitskiy
💻 Contributor: [Roman Nikitin](https://github.com/Stelsovich1)
