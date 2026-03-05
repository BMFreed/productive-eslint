# A ESLint config for practical code analysis
This is a config preset aimed at providing a fast and efficient way to distribute our team's desired ESLint configuration.
It is heavily inspired by Evgeny Orekhov's [eslint-config-hardcore](https://github.com/EvgenyOrekhov/eslint-config-hardcore)
and is fully powered Anthony Fu's [@antfu/eslint-config](https://github.com/antfu/eslint-config) because of its extremely
convenient tooling.

This config is extremely opinionated, so if certain sets of rules don't suit you - you are free to extend and override any
given rules, but we would suggest creating your own superset of [@antfu/eslint-config](https://github.com/antfu/eslint-config)
as a more efficient alternative if you plan on making severe modifications to the rulesets.

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
   - ESLint 9.26+
   - TypeScript 5.8+ (required)
   - Prettier 3.5+

2. Create eslint.config.ts in project root:
   ````
   import productiveEslint from 'productive-eslint'
   
   export default productiveEslint()
     .override('antfu/typescript/rules', {
       languageOptions: { parserOptions: { projectService: true } },
     })
   ````

3. Add scripts to package.json:
   ````
   "scripts": {
   "lint": "eslint .",
   "lint:fix": "eslint . --fix"
   }
   ````

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