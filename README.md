# A ESLint config for practical code analysis
This is a config preset aimed at providing a fast and efficient way to distribute our team's desired ESLint configuration.
It is heavily inspired by Evgeny Orekhov's [eslint-config-hardcore](https://github.com/EvgenyOrekhov/eslint-config-hardcore).

This config is extremely opinionated, so if certain sets of rules don't suit you - you are free to extend and override any
given rules.

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
   ````
   import productiveEslint from 'productive-eslint'

   export default productiveEslint()
   ````

3. Add scripts to package.json:
   ````
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
| `strictness` | `'easy' \| 'medium' \| 'hard'` | `'hard'` | Rule strictness preset |
| `ignores` | `string[]` | `[]` | Additional glob patterns to ignore |
| `vue` | `boolean` | auto-detect | Enable Vue/Nuxt rules |
| `rxjs` | `boolean` | auto-detect | Enable RxJS rules |

By default, `vue` and `rxjs` are auto-detected based on installed packages.

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
This package ships a `FIXES.md` file describing how to fix every rule that `eslint --fix` cannot resolve automatically.

Add the following instruction to your `CLAUDE.md`, `.cursorrules`, or similar AI agent config:

```
When fixing ESLint errors that `eslint --fix` cannot resolve,
look up the rule in node_modules/productive-eslint/FIXES.md.
```

---

📄 License: MIT © Bogdan Binitskiy
💻 Contributor: [Roman Nikitin](https://github.com/Stelsovich1)