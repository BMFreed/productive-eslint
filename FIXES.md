# productive-eslint: Fix Guide

> Rules with autofix are omitted — run `eslint --fix` first.

## JavaScript

### default-case
Add a `default` case to every `switch` statement. Treat the `default` case as an unreachable scenario and throw an error (e.g., `default: throw new Error('Unknown case: ...')`).

### grouped-accessor-pairs
Place getter and setter for the same property next to each other. Getter should come first.

### id-length
Rename the identifier to be at least 2 characters long. The only allowed single-character name is `t` (for i18n). Common renames: `e` → `err`/`event`, `i` → `index`, `x`/`y` → descriptive names like `row`/`col`, `_` → `_unused`.

### no-empty-static-block
Remove empty `static {}` blocks from classes or add meaningful content.

### no-inner-declarations
Move function/variable declarations out of nested blocks to the module or function scope.

### no-object-constructor
Replace `new Object()` with an object literal `{}`.

### no-shadow
Rename the inner variable so it does not shadow the variable from an outer scope. Use a more specific name that reflects the inner variable's purpose — for example, if both scopes have `result`, rename the inner one to `mappedResult` or a domain-specific name.

### no-unused-private-class-members
Remove unused private class members (`#field`, `#method()`) or reference them.

### no-useless-concat
Merge adjacent string literals into a single string instead of concatenating.
```js
// Bad
const a = 'a' + 'b'
// Good
const a = 'ab'
```

### consistent-this
Prefer refactoring to use an arrow function instead, which avoids the need to capture `this` at all. If capturing `this` is truly necessary, name the variable `that` — no other name is allowed.

### for-direction
Fix the loop counter update so the loop can terminate. Ensure `i++` for `i < n` and `i--` for `i > n`.

### new-cap
Capitalize constructor function names (start with uppercase). The config sets `capIsNew: false`, so the rule primarily fires when a lowercase function is used with `new`. Rename the constructor to start with an uppercase letter, or if the function is not a constructor, remove the `new` keyword.

### no-bitwise
Replace bitwise operators with their intended equivalents. Common fixes: `a | b` → `a || b`, `a & b` → `a && b`, `~~x` or `x | 0` → `Math.trunc(x)`, `x << 1` → `x * 2`, `x >> 1` → `Math.floor(x / 2)`. If bitwise operations are genuinely needed (flags, binary protocols), add an `eslint-disable-next-line` comment with justification.

### no-constant-binary-expression
Rewrite the binary expression that always evaluates to the same result. Common causes: `a ?? 'default'` where `a` is never nullish, `obj && {}` which always evaluates to `{}`, or `x || true` which is always `true`. Identify which operand makes the expression constant and either remove the redundant check or fix the logic.

### no-constant-condition
Replace the constant value in `if`/`while`/ternary with a real boolean expression.

### no-constructor-return
Remove the `return` statement from the constructor. Constructors must not return values.

### no-invalid-this
Move the `this` reference inside a class method, object method, or constructor. If `this` appears in a standalone function, convert it to a class method or pass the needed context as a parameter. If the function is a callback, convert it to an arrow function (which inherits `this` from the enclosing scope).

### no-param-reassign
Do not reassign function parameters. Create a new variable instead. Property mutations are allowed for: `accumulator`, `ctx`, `context`, `req`, `request`, `res`, `response`, `$scope`, `staticContext`, `ref`, `model`, and names ending with `Ref`/`Model`.

### no-promise-executor-return
Do not return a value from a Promise executor. If the executor uses an arrow function with an implicit return (e.g., `=> resolve(1)`), wrap the body in braces. If the executor explicitly uses `return someValue`, remove the `return` keyword or replace with `resolve(someValue)`.
```js
// Bad
new Promise((resolve) => resolve(1))
// Good
new Promise((resolve) => { resolve(1) })
```

### no-return-assign
Do not use assignment inside a `return` statement. Assign to a variable first, then return it.

### no-script-url
Do not use `javascript:` URLs. Use event handlers instead.

### no-sequences
Do not use the comma operator to chain expressions. Split each comma-separated expression into its own statement. In `return` statements like `return (x++, x)`, extract the side effect to a line before the return: `x++; return x;`.

### complexity
Reduce cyclomatic complexity to 12 or below. Each `if`, `else if`, `case`, `for`, `while`, `do`, `&&`, `||`, `??`, and ternary `?` adds 1 to complexity. To reduce: extract groups of related conditions into helper functions, replace `if/else if` chains with lookup objects/maps, use early returns to eliminate `else` branches.

### max-depth
Reduce block nesting depth to 2 or below. Each nested `if`, `for`, `while`, `switch`, or `try` adds one level. To reduce: invert conditions and use early `return`/`continue` (guard clauses), extract deeply nested logic into separate functions, merge consecutive `if` conditions with `&&`.
```js
// Bad (depth 3)
if (a) {
  if (b) {
    if (c) { /* ... */ }
  }
}
// Good
if (!a || !b) return
if (c) { /* ... */ }
```

### require-atomic-updates
Do not read a variable before `await`/`yield` and then assign to it after — another async operation may have changed its value. Fix by re-reading the variable after the `await`, using a local temporary variable, or restructuring so the read and write happen without an intervening `await`.

## TypeScript (@typescript-eslint)

### @typescript-eslint/class-literal-property-style
Always declare literal properties as `readonly` fields, not getters. If a getter simply returns a literal value, replace it with a `readonly` field assignment.

### @typescript-eslint/default-param-last
Move parameters with default values to the end of the parameter list.

### @typescript-eslint/explicit-function-return-type
Add an explicit return type to functions. Expressions passed as arguments are exempted (`allowExpressions: true`).
```ts
// Bad
const fn = () => 1
// Good
const fn = (): number => 1
```

### @typescript-eslint/naming-convention
Rename the identifier to match the required convention. Read the ESLint error message to identify which selector was violated:
- `class`, `enum` — `StrictPascalCase` (e.g., `MyClass`, `MyEnum`)
- `enumMember` — `UPPER_CASE` (e.g., `MY_VALUE`)
- `interface` — `StrictPascalCase` with mandatory `I` prefix (e.g., `IMyInterface`)
- `typeAlias` — `StrictPascalCase` with mandatory `T` prefix (e.g., `TMyType`)
- `typeParameter` — `StrictPascalCase` (e.g., `TKey`, `TValue`)
- `variable` (const) — `strictCamelCase` for most values, `UPPER_CASE` for module-level constants
- `parameter` (unused) — prefix with `_`, use `camelCase` (e.g., `_unusedParam`)
- `objectLiteralProperty`, `import` — exempt, no rename needed

After renaming, update all references to the renamed identifier across the codebase.

### @typescript-eslint/no-base-to-string
Do not coerce objects to string if they don't have a meaningful `toString()`. Add a `toString()` method or serialize explicitly.

### @typescript-eslint/no-dynamic-delete
Replace `delete obj[key]` with `Map`/`Set` or use object rest destructuring to remove properties.

### @typescript-eslint/no-empty-object-type
Do not use `{}` as a type. Use `Record<string, unknown>`, `object`, or `unknown` instead. Empty interfaces are allowed (`allowInterfaces: 'always'`).

### @typescript-eslint/no-floating-promises
Handle every Promise: (1) add `await` before it — preferred fix inside `async` functions; (2) add `return` to propagate it to the caller; (3) append `.catch((error) => { /* handle */ })` for explicit error handling; (4) prefix with `void` only if the promise is intentionally fire-and-forget (e.g., logging, analytics). Do not use `void` as a blanket silencer.

### @typescript-eslint/no-loop-func
Do not define functions inside loops that reference outer mutable variables. Extract the function outside the loop.

### @typescript-eslint/no-magic-numbers
Extract the numeric literal into a named `const` with a descriptive name (e.g., `const MAX_RETRY_COUNT = 3`). Place it at module scope or the top of the enclosing block. Exempt (no extraction needed): `0`, `1`, `100`, `-1`, class field initializers, default parameter values, and enum values. The extracted variable must use `const` (`enforceConst: true`).

### @typescript-eslint/no-redundant-type-constituents
Remove type constituents that are already covered by another constituent in the union/intersection.

### @typescript-eslint/no-unnecessary-condition
The condition is always truthy or always falsy based on the TypeScript type. If the type is too narrow (e.g., `string` but the value can be `null` at runtime), widen the type to include the nullish case. If the condition is genuinely unnecessary (the type proves it), remove the `if` block and keep only the reachable branch's body.

### @typescript-eslint/no-unnecessary-type-conversion
Remove unnecessary type conversions (e.g., `String(alreadyAString)`). The value is already the correct type.

### @typescript-eslint/no-unsafe-argument
The argument is typed as `any`. Trace the value to its source and add a proper type annotation there. If the value comes from an untyped library, add a type assertion (e.g., `value as TExpectedType`) at the call site. If from `JSON.parse()`, validate the shape or assert the type.

### @typescript-eslint/no-unsafe-assignment
The right-hand side is typed as `any`. Trace the `any` to its origin — often an untyped function return, `JSON.parse()`, or a library without type definitions. Add a type annotation or assertion at the source. Adding a type annotation only on the receiving variable (e.g., `const x: string = anyValue`) will NOT fix this — the source must be typed.

### @typescript-eslint/no-unsafe-call
The value being called is typed as `any`. Add a type annotation to the variable or parameter that holds the function, specifying its call signature (e.g., `const handler: (event: Event) => void`). If the function comes from a third-party library, install its `@types/*` package.

### @typescript-eslint/no-unsafe-enum-comparison
Compare enum values only to other members of the same enum, not to raw literals.

### @typescript-eslint/no-unsafe-member-access
A property is being accessed on a value typed as `any`. Add a type annotation or interface to the parent object. If from `JSON.parse()` or an API response, define an interface for the shape and assert at the parse/fetch point. Type the parent object, not the accessed property.

### @typescript-eslint/no-unsafe-return
The function returns a value typed as `any`. Add an explicit return type to the function, then trace the `any` inside the body and type it at its source. Simply adding a return type without fixing the internal `any` will produce a type error instead of silencing this rule.

### @typescript-eslint/no-unsafe-unary-minus
Do not apply unary minus to `any`-typed values. Type the value as `number` first.

### @typescript-eslint/no-useless-constructor
Remove constructors that only call `super()` with the same arguments. They are unnecessary.

### @typescript-eslint/only-throw-error
Only throw `Error` objects (or subclasses). Do not throw strings or other non-Error values.

### @typescript-eslint/related-getter-setter-pairs
If a property has a getter, add a setter and vice versa. They should have compatible types.

### @typescript-eslint/require-array-sort-compare
Pass a compare function to `.sort()`. Without it, elements are sorted as strings.
```ts
// Bad
numbers.sort()
// Good
numbers.sort((a, b) => a - b)
```

### @typescript-eslint/require-await
This function is `async` but has no `await`. If it performs no async work, remove `async`. If the function must return a `Promise` to satisfy an interface, return `Promise.resolve(value)` explicitly. If the function should be awaiting a call but `await` is missing, add the missing `await`.

### @typescript-eslint/return-await
Use `return await` in `try`/`catch` blocks so exceptions are caught. Outside try/catch, return the promise directly.

### @typescript-eslint/switch-exhaustiveness-check
Add a `case` for every member of the union/enum, or add a `default` case.

### @typescript-eslint/unbound-method
Bind the method before passing it as a callback, or use an arrow function wrapper.
```ts
// Bad
const fn = obj.method
// Good
const fn = obj.method.bind(obj)
// or
const fn = (...args) => obj.method(...args)
```

### @typescript-eslint/unified-signatures
Merge overload signatures that differ only in one parameter into a single signature using a union type.

### @typescript-eslint/class-methods-use-this
This method does not reference `this`. Preferred fix: make it `static` and update all call sites from `instance.method()` to `ClassName.method()`. If the method is part of an interface contract, keep it as an instance method. Do not add a meaningless `this` reference just to satisfy the rule.

### @typescript-eslint/init-declarations
Initialize variables at declaration. Do not use `let x;` without an initial value.

### @typescript-eslint/max-params
Reduce function parameters to 3 or fewer. Group related parameters into a single options object. Define an interface for it with the `I` prefix per naming convention (e.g., `ICreateUserOptions`). Keep the 1–2 most essential parameters positional and move the rest into the options object.

### @typescript-eslint/no-extraneous-class
This class contains only static members. Convert each static method to a standalone exported function and each static property to an exported `const`. Remove the class and update all call sites from `ClassName.method()` to direct function imports.

### @typescript-eslint/no-invalid-void-type
Do not use `void` as a type except as a return type. Use `undefined` instead.

### @typescript-eslint/no-misused-promises
An async function is passed where a void-returning callback is expected (e.g., event handlers, `forEach`). Wrap it in a non-async wrapper: `(event) => { void handleClick(event) }`. For error handling: `(event) => { handleClick(event).catch(handleError) }`. Do not make the callback itself `async` if the caller doesn't expect a Promise return.

### @typescript-eslint/no-misused-spread
Do not spread a value into an incompatible context (e.g., spreading a string into an array of numbers).

### @typescript-eslint/no-mixed-enums
Do not mix string and number members in the same enum. Use one type consistently.

### @typescript-eslint/parameter-properties
Do not use TypeScript parameter properties (e.g., `constructor(private name: string)`). Instead, declare the field explicitly in the class body (`private name: string`) and assign it in the constructor (`this.name = name`).

### @typescript-eslint/prefer-enum-initializers
Explicitly initialize all enum members to avoid fragile implicit numbering.

### @typescript-eslint/prefer-promise-reject-errors
Reject promises only with `Error` objects. Do not reject with strings or `undefined`.

### @typescript-eslint/restrict-template-expressions
A value embedded in a template literal is not a `string`, `number`, `boolean`, or `bigint`. For objects, access a specific string property (e.g., `${error.message}` instead of `${error}`). For `undefined`/`null`, use nullish coalescing: `${value ?? 'default'}`. For arrays, use `${arr.join(', ')}`. As a last resort, call `String(value)`.

### @typescript-eslint/no-non-null-assertion
Remove the `!` operator. Preferred alternatives: (1) use optional chaining `obj?.prop` instead of `obj!.prop`; (2) use nullish coalescing `value ?? defaultValue` instead of `value!`; (3) add an explicit type guard (e.g., `if (value === null) throw new Error(...)`) — preferred over `!` because it fails loudly at runtime; (4) for `.find()` returning `T | undefined`, add an `if` check for the `undefined` case. Do not replace `!` with `as T` — that is equally unsafe.

### @typescript-eslint/no-explicit-any
Replace `any` with a proper type: (1) if the shape is known, use that type or define an interface; (2) if the value could be anything, use `unknown` and add type guards before using it; (3) if the function should work with multiple types, use a generic (`<T>`); (4) for catch clause variables, use `unknown` and narrow with `instanceof Error`; (5) for event handlers, use the specific event type (e.g., `React.ChangeEvent<HTMLInputElement>`).

## Unicorn

### unicorn/no-empty-file
If the file is a placeholder (e.g., an `index.ts` barrel file), add the necessary exports. If the file is truly unused, delete it and remove all imports referencing it.

### unicorn/no-unused-properties
Determine whether the unused property is needed downstream. If it is, add the missing reference. If not, remove the property definition. Check for typos in property names — a misspelled property is the most common cause.

### unicorn/no-useless-switch-case
Remove switch cases that have no unique logic and just fall through to the default.

### unicorn/prefer-blob-reading-methods
Use `blob.text()` or `blob.arrayBuffer()` instead of `FileReader`.

### unicorn/prefer-code-point
Use `String.prototype.codePointAt()` and `String.fromCodePoint()` instead of `charCodeAt()`/`fromCharCode()`.

### unicorn/prefer-default-parameters
Use default parameter syntax instead of manually checking for `undefined`.
```js
// Bad
function fn(x) { x = x || 'default' }
// Good
function fn(x = 'default') {}
```

### unicorn/prefer-dom-node-text-content
Use `node.textContent` instead of `node.innerText`.

### unicorn/prefer-event-target
Replace `EventEmitter` with the native `EventTarget` API: use `new EventTarget()`, `dispatchEvent(new CustomEvent('name', { detail }))`, and `addEventListener('name', handler)` instead of `emit()`/`on()`. This only applies to browser code — if the code runs in Node.js only, suppress with an inline disable comment.

### unicorn/prefer-logical-operator-over-ternary
Use `||` or `??` instead of a ternary that checks the same condition.
```js
// Bad
const x = a ? a : b
// Good
const x = a || b
```

### unicorn/prefer-structured-clone
Use `structuredClone(obj)` instead of `JSON.parse(JSON.stringify(obj))`.

### unicorn/prefer-top-level-await
Replace async IIFEs (`(async () => { ... })()`) with top-level `await`. Move the awaited statements directly to module scope. This requires the file to be an ES module — if it uses `require()`/`module.exports`, first convert to ESM.

### unicorn/require-post-message-target-origin
Always pass a `targetOrigin` as the second argument to `postMessage()`. Use the specific origin of the target window (e.g., `'https://example.com'`). Use `'*'` only if the message contains no sensitive data.

### unicorn/consistent-destructuring
If you destructured some properties from an object, use the destructured variables everywhere — do not access those same properties via dot notation on the original object. Either add the missing property to the destructuring pattern, or remove it from destructuring and use dot notation throughout.

### unicorn/no-abusive-eslint-disable
Do not use bare `eslint-disable` without specifying rule names. Always specify which rules to disable.

### unicorn/no-accessor-recursion
Do not reference `this.propName` inside the getter or setter for `propName` — this causes infinite recursion. Use a private backing field (e.g., `this.#propName`) to store the underlying value, and read/write the backing field inside the accessor.

### unicorn/no-array-callback-reference
Do not pass function references directly to array methods. Use an inline arrow function to avoid unexpected arguments.
```js
// Bad
items.map(parseInt)
// Good
items.map((item) => parseInt(item, 10))
```

### unicorn/no-magic-array-flat-depth
Extract the `.flat()` depth argument into a named constant when it is greater than 1.

### unicorn/no-negation-in-equality-check
Move the negation outside the equality check.
```js
// Bad
if (!a === b) {}
// Good
if (a !== b) {}
```

### unicorn/no-unreadable-array-destructuring
Avoid destructuring with many skipped elements. Access by index instead.
```js
// Bad
const [,,, d] = arr
// Good
const d = arr[3]
```

### unicorn/no-array-method-this-argument
Do not pass a `thisArg` to array methods. Use an arrow function or `.bind()` instead.

### unicorn/no-await-in-promise-methods
Do not `await` individual promises inside `Promise.all()`, `Promise.race()`, etc. — the `await` forces sequential execution, defeating the purpose. Remove the `await` from each element.
```js
// Bad
await Promise.all([await fetchA(), await fetchB()])
// Good
await Promise.all([fetchA(), fetchB()])
```

### unicorn/no-document-cookie
Do not use `document.cookie` directly. Use the Cookie Store API or a cookie utility library.

### unicorn/no-invalid-remove-event-listener
The function reference passed to `removeEventListener()` must be the exact same reference passed to `addEventListener()`. Store the handler in a variable at the point where `addEventListener()` is called, then pass that same variable to `removeEventListener()`.
```js
// Bad
el.addEventListener('click', () => handle())
el.removeEventListener('click', () => handle())  // Different reference!
// Good
const handler = () => handle()
el.addEventListener('click', handler)
el.removeEventListener('click', handler)
```

### unicorn/no-object-as-default-parameter
Do not use object literals as default parameter values — passing `{ a: 2 }` would lose the default for other properties. Use destructured parameters with individual defaults instead.
```js
// Bad
function fn(opts = { a: 1, b: 2 }) {}
// Good
function fn({ a = 1, b = 2 } = {}) {}
```

## SonarJS

### sonarjs/no-fallthrough
Add a `break`, `return`, or `throw` at the end of each `case` block. If multiple cases share the same logic, stack the `case` labels on consecutive lines with no code between them instead of using fall-through.

### sonarjs/prefer-immediate-return
When a variable is declared, assigned, and then immediately returned on the next line, remove the variable and return the value directly. Replace `const result = expr; return result;` with `return expr;`. Keep the variable only if its name provides important documentation of the expression's purpose.

### sonarjs/no-redundant-boolean
Remove redundant boolean literals. Replace `x === true` with `x`, `x === false` with `!x`, `x ? true : false` with `x`, `x ? false : true` with `!x`, `return condition ? true : false` with `return condition`.

### sonarjs/no-redundant-jump
Remove unnecessary `return`, `continue`, or `break` at the end of a block.

### sonarjs/non-existent-operator
Fix the typo: `=!` should be `!=`, `=+` should be `+=`, `=-` should be `-=`.

### sonarjs/public-static-readonly
Mark public static fields as `readonly` if they are never reassigned.

### sonarjs/bool-param-default
Provide a default value for boolean parameters.

### sonarjs/comma-or-logical-or-case
Each `case` in a `switch` should have its own `case` label. Do not use comma-separated values.

### sonarjs/future-reserved-words
Do not use future reserved words (`implements`, `interface`, `package`, etc.) as identifiers.

### sonarjs/index-of-compare-to-positive-number
Compare `indexOf()` result to `-1`, not to `> 0` (which misses index 0).

### sonarjs/link-with-target-blank
Add `rel="noopener noreferrer"` to links with `target="_blank"`.

### sonarjs/no-array-delete
Do not use `delete` on array elements. Use `.splice()` instead.

### sonarjs/no-duplicate-in-composite
Remove duplicate types in union or intersection types.

### sonarjs/no-for-in-iterable
Do not use `for...in` on arrays or iterables. Use `for...of` instead.

### sonarjs/no-function-declaration-in-block
Move function declarations out of `if`/`else`/`for`/`while` blocks.

### sonarjs/no-global-this
Avoid using `globalThis`. Import or declare dependencies explicitly.

### sonarjs/no-globals-shadowing
Do not shadow global variables (`undefined`, `NaN`, `Infinity`, etc.) with local declarations.

### sonarjs/no-identical-conditions
Remove or change duplicate conditions in `if`/`else if` chains.

### sonarjs/no-identical-expressions
Do not use the same expression on both sides of a binary operator (e.g., `a === a`, `x - x`). Determine which side is a mistake by looking at surrounding context and variable names, then fix the incorrect side. If both sides are genuinely the same and this is a no-op, remove the entire expression.

### sonarjs/no-identical-functions
Extract the shared logic into a single function and have the duplicates call it. Place the shared function in the nearest common scope. Name it after what it does, not where it came from.

### sonarjs/no-ignored-return
Use the return value of pure methods (`.map()`, `.filter()`, `.slice()`, `.trim()`, `.replace()`, etc.) — assign the result to a variable or return it. If you intended a side-effect loop, use `.forEach()` or a `for` loop instead. If you intended to mutate, use the mutating alternative (e.g., `.splice()` instead of `.slice()`).

### sonarjs/no-in-misuse
Use `Array.prototype.includes()` or `indexOf()` instead of `in` for arrays. `in` checks keys, not values.

### sonarjs/no-incorrect-string-concat
When `+` is used with a mix of strings and numbers, ensure the operation is intentional. If you intend string concatenation, convert the numeric operand with `String(num)` or use a template literal. If you intend numeric addition, ensure both operands are numbers via `Number(str)` or `parseInt()`.

### sonarjs/no-internal-api-use
Do not import from internal/private paths of libraries.

### sonarjs/no-misleading-array-reverse
`.reverse()` and `.sort()` mutate the array in-place and return the same reference. If mutation is acceptable, call the method without assigning (`arr.sort()`). If you need a new array without mutating the original, spread-copy first: `[...arr].sort()` or `[...arr].reverse()`.

### sonarjs/no-nested-template-literals
Extract nested template literals into variables.

### sonarjs/no-redundant-assignments
Remove assignments where the value is immediately overwritten.

### sonarjs/no-redundant-optional
Replace `?.` with `.` when the value is guaranteed to be non-nullish (the value comes from a non-optional property, was already null-checked, or the TypeScript type excludes `null`/`undefined`).

### sonarjs/no-selector-parameter
Do not pass CSS selectors as parameters. Pass the element directly instead.

### sonarjs/no-small-switch
Replace `switch` statements with fewer than 3 cases with `if`/`else`.

### sonarjs/no-try-promise
Synchronous `try/catch` cannot catch asynchronous rejections. Fix by making the enclosing function `async` and `await`ing the promise inside the `try` block, or remove `try/catch` and chain `.catch()` on the promise instead.

### sonarjs/no-undefined-assignment
Do not assign `undefined` explicitly. Use `let x;` or `delete obj.prop` instead.

### sonarjs/no-unthrown-error
Created `Error` objects must be thrown. Add `throw` before `new Error(...)`.

### sonarjs/no-unused-collection
A collection (array, Set, Map) is populated but never read. If it is needed, add the missing code that reads from it (return it, pass to another function, iterate). If it is dead code, remove the declaration and all its `.push()`/`.add()`/`.set()` calls. Check if it was meant to be returned from the function.

### sonarjs/no-unused-function-argument
Prefix unused parameters with `_` (e.g., `_event`). Do not remove the parameter if a later positional parameter IS used — you must keep all preceding parameters. Only remove outright if it is the last parameter and no callers pass a value for it. For callbacks with a fixed signature (event handlers, middleware), always prefix with `_` rather than removing.

### sonarjs/no-use-of-empty-return-value
Do not use the return value of functions that return `void`.

### sonarjs/no-useless-intersection
The intersection results in `never` due to incompatible constituents (e.g., `string & number`). If one type is correct, keep it and remove the `&` and the other type. If the intersection was meant to be a union, change `&` to `|`. If on object types with conflicting properties, fix the conflicting property to be compatible.

### sonarjs/object-alt-content
Add alternative text to `<object>` elements for accessibility.

### sonarjs/post-message
Specify an explicit target origin in `postMessage()` instead of `*`.

### sonarjs/prefer-promise-shorthand
Use `Promise.resolve()` / `Promise.reject()` instead of `new Promise((resolve) => resolve(...))`.

### sonarjs/reduce-initial-value
Always provide an initial value to `.reduce()`.

### sonarjs/strings-comparison
Use `localeCompare()` for locale-aware string comparison instead of `<` / `>`.

### sonarjs/table-header
Add `<th>` elements to `<table>` for accessibility.

### sonarjs/table-header-reference
Use the `headers` attribute on `<td>` to reference `<th>` `id`s in complex tables.

### sonarjs/expression-complexity
Reduce expression complexity to at most 2 logical/ternary operators per expression. Each `&&`, `||`, `??`, and `? :` counts as 1. Extract sub-expressions into descriptive `const` variables (e.g., `const isEligible = age >= 18 && hasConsent`), then combine the named variables in the final expression.

### sonarjs/no-all-duplicated-branches
Every branch of this `if`/`else` (or ternary/switch) has the same body, making the condition pointless. Remove the conditional entirely and keep the body as unconditional code. If the branches should differ, fix the return values — this is likely a copy-paste bug.

### sonarjs/no-async-constructor
Constructors cannot be `async`. Move async logic into a static `async` factory method (e.g., `static async create(): Promise<ClassName>`) that creates the instance, performs async work, and returns it. Update all `new ClassName()` call sites to `await ClassName.create()`.

### sonarjs/no-invariant-returns
Every code path returns the same value, making branching pointless. If the function genuinely always returns the same value, remove the branching and return directly. If branches should return different values, fix the incorrect return statements — this is likely a copy-paste bug.

### sonarjs/no-nested-switch
Do not nest `switch` statements. Extract the inner switch into a separate function.

### sonarjs/too-many-break-or-continue-in-loop
This loop has too many `break`/`continue` statements. Refactor by: extracting the loop body into a function and using early `return` instead of `continue`; replacing the loop with array methods (`.filter()`, `.find()`, `.some()`, `.every()`) where applicable; or consolidating conditions into a single guard clause at the top of the loop.

## Promise

### promise/always-return
Always return a value inside every `.then()` callback. If no meaningful value is needed, add `return undefined` as the last statement. Preferred: refactor the `.then()` chain to `async`/`await`.

### promise/catch-or-return
Every promise chain must either be returned to the calling function (so the caller handles rejection) or terminate with `.catch()`. If the promise is a standalone statement, append `.catch((error) => { /* handle */ })`. With `async`/`await`, wrap in `try`/`catch` instead.

### promise/no-multiple-resolved
Do not call `resolve()`/`reject()` more than once. Add early `return` after each `resolve()`/`reject()` call to prevent subsequent calls. If conditional branches each call `resolve()`/`reject()`, ensure they are mutually exclusive (use `if`/`else`, not sequential `if` blocks).

### promise/no-return-in-finally
Do not return values in `.finally()`. It silently swallows errors.

### promise/no-return-wrap
Inside `.then()`, replace `return Promise.resolve(value)` with `return value`. Inside `.catch()`, replace `return Promise.reject(error)` with `throw error`. The `.then()`/`.catch()` callbacks already wrap return values in promises automatically.

### promise/param-names
Name Promise executor parameters `resolve` and `reject`.

### promise/valid-params
Pass the correct number of arguments to Promise methods (`.then()`, `.catch()`, `.finally()`).

### promise/prefer-await-to-then
Refactor `.then()` chains to `async`/`await`. Make the enclosing function `async`, replace each `.then(callback)` with an `await` expression assigned to a variable, and replace `.catch(callback)` with a `try`/`catch` block.

### promise/no-nesting
Do not nest `.then()` inside another `.then()`. Flatten the chain by returning the inner promise from the outer `.then()` and adding a new `.then()` at the top level. Preferred: refactor the entire chain to `async`/`await`, which eliminates nesting naturally.

### promise/no-promise-in-callback
Do not create promises inside callback-style functions (e.g., Node.js `(err, result) => {}` callbacks). Wrap the callback-based API in a promise using `new Promise()` or `util.promisify()`, then use `async`/`await` to compose with other async operations.

## Import

### import/extensions
Remove `.js`, `.jsx`, `.ts`, `.tsx` extensions from import paths (e.g., `import Foo from './Foo.ts'` → `import Foo from './Foo'`). Keep extensions for non-code files (`.json`, `.css`, `.svg`) — this rule only applies to JS/TS source files.

### import/no-commonjs
Replace `require('...')` with `import ... from '...'`, `module.exports = ...` with `export default ...`, and `exports.foo = ...` with `export const foo = ...`. For dynamic/conditional require, use `await import('...')` instead.

### import/no-mutable-exports
Change exported `let`/`var` to `const`. If the value genuinely mutates, do not export it directly — export a getter function instead (e.g., `export function getFoo() { return foo; }`).

### import/no-named-default
Use the default import syntax instead of `import { default as Name }`.

### import/no-self-import
A module must not import itself. Remove the self-referencing `import` and call the local binding directly instead.

### import/export
Do not have multiple `export default` or duplicate named exports. If there are two default exports, keep one and convert the other to a named export. If the same name is exported twice, rename one of them. Check re-exports (`export ... from`) that may conflict with local exports.

### import/no-cycle
Remove circular `import` dependencies. To fix: (1) extract the shared types/logic into a new module that both files can import without a loop; (2) move one import to a dynamic `import()` at the point of use if the dependency is only needed at runtime; (3) if the cycle is caused by type imports only, switch to `import type` which is erased at runtime and does not cause circular dependency issues.

## Vue

### vue/block-lang
`<script>` blocks must use `lang="ts"`.

### vue/comment-directive
Ensure `eslint-disable` comments in `<template>` specify rule names.

### vue/component-api-style
Use `<script setup>` instead of Options API or non-setup Composition API.

### vue/custom-event-name-casing
Use `camelCase` for custom event names in `$emit()`.

### vue/define-props-declaration
Use type-based props declaration (`defineProps<{ ... }>()`) instead of runtime declaration.

### vue/define-props-destructuring
Destructure props from `defineProps()` for cleaner template references.

### vue/enforce-style-attribute
`<style>` blocks must use `module` attribute. Scoped styles via `<style module>`.

### vue/jsx-uses-vars
Variables used in JSX are marked as used. This rule prevents false `no-unused-vars` errors.

### vue/no-arrow-functions-in-watch
Do not use arrow functions in `watch`. Use a regular function to access component `this`.

### vue/no-deprecated-delete-set
Do not use `$delete` or `$set` — they are removed in Vue 3. To delete a property, use `delete obj.key`. To set a reactive property, assign directly (`obj.key = value`) — Vue 3 reactivity tracks this natively.

### vue/no-deprecated-dollar-listeners-api
Do not use `$listeners`. It is removed in Vue 3. Use `v-bind="$attrs"` instead.

### vue/no-deprecated-events-api
Do not use `$on`, `$off`, `$once`. Use an external event bus or composables.

### vue/no-deprecated-filter
Do not use Vue filters (`{{ value | filter }}`). Use computed properties or methods.

### vue/no-deprecated-functional-template
Do not use `<template functional>`. Use `<script setup>` for stateless components.

### vue/no-deprecated-html-element-is
Do not use `is` attribute on HTML elements. Use `<component :is="...">` instead.

### vue/no-deprecated-inline-template
Do not use the `inline-template` attribute. Use slots instead.

### vue/no-deprecated-model-definition
Use `defineModel()` or `modelValue` prop instead of deprecated `model` option.

### vue/no-deprecated-props-default-this
Do not use `this` in props `default` functions — `this` is `undefined` in Vue 3. Use a plain value or a factory function that derives the default without `this`. If you need another prop's value, use a computed property instead.

### vue/no-deprecated-router-link-tag-prop
Do not use the `tag` prop on `<router-link>`. Use the `v-slot` API.

### vue/no-deprecated-v-is
Do not use `v-is` directive. Use `:is` with `<component>` instead.

### vue/no-deprecated-v-on-native-modifier
Do not use `.native` modifier on `v-on`. In Vue 3, all events are native by default.

### vue/no-deprecated-vue-config-keycodes
Do not use `Vue.config.keyCodes`. Use key aliases directly (e.g., `@keyup.enter`).

### vue/no-dupe-v-else-if
Remove duplicate conditions in `v-if`/`v-else-if` chains.

### vue/no-duplicate-attributes
Do not use duplicate attributes on the same element.

### vue/no-duplicate-attr-inheritance
When using `inheritAttrs: false`, do not duplicate attributes that come from `$attrs`.

### vue/no-empty-pattern
Do not use empty destructuring patterns (e.g., `{}` or `[]`) in templates. Either destructure specific properties (e.g., `{ name }`) or remove the destructuring and use the whole object.

### vue/no-export-in-script-setup
Do not use `export` in `<script setup>`. Use `defineExpose()` for public API.

### vue/no-expose-after-await
Do not call `defineExpose()` after an `await`. Move it before any async operation.

### vue/no-irregular-whitespace
Remove irregular whitespace characters from templates.

### vue/no-lifecycle-after-await
Do not register lifecycle hooks after `await`. Move hook registration before any async operation.

### vue/no-lone-template
Do not use `<template>` without directives (`v-if`, `v-for`, `v-slot`). It serves no purpose.

### vue/no-loss-of-precision
Do not use number literals that lose precision. Use `BigInt` (e.g., `9007199254740993n`) for very large integers, or use a string representation if exact precision is needed.

### vue/no-multiple-objects-in-class
Do not pass multiple object expressions to `:class`. Merge them into one object.

### vue/no-multiple-slot-args
Slot functions must accept only a single argument (the slot props object).

### vue/no-mutating-props
Do not mutate props directly. Emit an event to let the parent component update the value.

### vue/no-parsing-error
Fix template parsing errors (unclosed tags, invalid attributes, etc.).

### vue/no-ref-object-reactivity-loss
Do not destructure or spread ref objects — this loses reactivity. Use `.value` or `toRefs()`.

### vue/no-reserved-component-names
Do not use HTML element names (e.g., `button`, `div`) or Vue built-in names (e.g., `Transition`, `KeepAlive`) as component names. Rename to something domain-specific (e.g., `AppButton`, `BaseCard`).

### vue/no-reserved-keys
Do not use reserved Vue instance property names (`$data`, `$props`, etc.) as component data keys.

### vue/no-reserved-props
Do not use reserved prop names (`key`, `ref`, `is`, `slot`).

### vue/no-restricted-block
Do not use restricted SFC blocks as configured by the project. Check the ESLint config for which blocks are restricted and remove or replace them accordingly.

### vue/no-restricted-syntax
Do not use `DebuggerStatement`, `LabeledStatement`, `WithStatement`. Do not use `reactive()` — use `ref()` instead for code consistency.

### vue/no-restricted-v-bind
Do not bind `v-` prefixed attributes with `v-bind`.

### vue/no-root-v-if
Do not use `v-if` on the root element of a template. It causes the component to be destroyed and recreated.

### vue/no-side-effects-in-computed-properties
Do not mutate state or trigger side effects inside computed properties. Use `watch` or `watchEffect`.

### vue/no-template-key
Do not put `key` on `<template>`. Place it on the child element.

### vue/no-template-shadow
Do not shadow variables from outer scopes in `v-for` or `v-slot`.

### vue/no-template-target-blank
Add `rel="noopener noreferrer"` to template links with `target="_blank"`.

### vue/no-textarea-mustache
Do not use mustache interpolation in `<textarea>`. Use `v-model` instead.

### vue/no-unused-components
Remove imported/registered components that are not used in the template.

### vue/no-unused-refs
Remove template refs that are never used in `<script>`.

### vue/no-unused-vars
Remove unused `v-for`/`v-slot` variables or prefix them with `_`.

### vue/no-use-v-else-with-v-for
Do not use `v-else`/`v-else-if` on an element that also has `v-for`.

### vue/no-use-v-if-with-v-for
Do not use `v-if` and `v-for` on the same element. Use a wrapper `<template v-for>` with `v-if` on the child.

### vue/no-useless-template-attributes
Remove attributes on `<template>` that have no effect (only directives work on `<template>`).

### vue/no-v-for-template-key-on-child
In Vue 3, place `key` on the `<template v-for>`, not on the child element.

### vue/no-watch-after-await
Do not register `watch` after `await`. Move the `watch` call before any async operation.

### vue/no-async-in-computed-properties
Do not use `async`/`await`, promises, or timers in computed properties.

### vue/no-child-content
Do not use `v-html`/`v-text` on elements with child content — the children will be overwritten.

### vue/no-console
Remove `console.log`/`console.warn`/`console.error` from Vue templates.

### vue/no-constant-condition
Remove constant conditions in template `v-if`/`v-show`/`v-else-if` directives.

### vue/no-sparse-arrays
Do not use sparse arrays (e.g., `[1, , 3]`) in templates. Use explicit `undefined` values instead (e.g., `[1, undefined, 3]`), or remove the empty slots.

### vue/no-static-inline-styles
Do not use inline `style` attributes. Use CSS classes or `:class`/`:style` bindings.

### vue/no-v-html
Do not use `v-html`. It is an XSS risk. Use template interpolation or `v-text` instead.

### vue/no-v-text
Do not use `v-text`. Use mustache interpolation `{{ }}` instead.

### vue/no-v-text-v-html-on-component
Do not use `v-text` or `v-html` on components — they overwrite slot content. Pass the content via the default slot instead (e.g., `<MyComp>content here</MyComp>`).

### vue/prefer-true-attribute-shorthand
Use shorthand for boolean attributes: write `disabled` instead of `:disabled="true"`.

### vue/prefer-use-template-ref
Use `useTemplateRef()` instead of `ref` attribute for template refs.

### vue/prop-name-casing
Use `camelCase` for prop names in `<script>`.

### vue/require-component-is
Dynamic `<component>` must have a `:is` binding.

### vue/require-explicit-emits
Declare all emitted events in `defineEmits()`.

### vue/require-macro-variable-name
Use the conventional variable name matching the macro: `const props = defineProps()`, `const emit = defineEmits()`, `const slots = defineSlots()`. Rename any non-standard variable names to these conventions.

### vue/require-render-return
Render functions must return a value.

### vue/require-toggle-inside-transition
`<transition>` content must use `v-if`, `v-show`, or dynamic components to toggle.

### vue/require-typed-ref
Pass a type argument to `ref()` when the initial value is `null` or `undefined`.
```ts
// Bad
const el = ref(null)
// Good
const el = ref<HTMLDivElement | null>(null)
```

### vue/require-v-for-key
Always provide a `:key` on elements using `v-for`.

### vue/slot-name-casing
Use `camelCase` for slot names.

### vue/use-v-on-exact
When an element has multiple `v-on` handlers for the same event with different modifiers (e.g., `@keyup.enter` and `@keyup`), add `.exact` to the more specific handler (e.g., `@keyup.enter.exact`) so it only fires when exactly that modifier is pressed.

### vue/valid-attribute-name
Use valid HTML attribute names (no spaces, quotes, equals in names).

### vue/valid-define-emits
`defineEmits()` must be at the top level of `<script setup>`, called only once, with either a runtime array (`defineEmits(['eventName'])`) or a type-only declaration (`defineEmits<{ (e: 'eventName'): void }>()`). Do not pass both runtime and type arguments.

### vue/valid-define-options
`defineOptions()` must be at the top level of `<script setup>`, called only once, with a single object literal. It must not contain `props`, `emits`, `expose`, or `slots` — those have their own macros.

### vue/valid-define-props
`defineProps()` must be at the top level of `<script setup>`, called only once, with either a runtime object/array or a type-only declaration (`defineProps<{ ... }>()`). Do not pass both runtime and type arguments.

### vue/valid-template-root
The `<template>` block must not be empty and must contain valid content. In Vue 3 multiple root elements are allowed, but the template must have at least one root node. If the template is empty, add content or remove the component.

### vue/valid-v-bind
Use valid `v-bind` directive syntax.

### vue/valid-v-cloak
Use valid `v-cloak` directive syntax.

### vue/valid-v-else
Use valid `v-else` directive. It must follow `v-if` or `v-else-if` and have no expression.

### vue/valid-v-else-if
Use valid `v-else-if` directive. It must follow `v-if` or another `v-else-if`.

### vue/valid-v-for
Use valid `v-for` syntax (e.g., `item of items`).

### vue/valid-v-html
Use valid `v-html` directive syntax with an expression.

### vue/valid-v-if
Use valid `v-if` directive syntax with an expression.

### vue/valid-v-is
Use valid `v-is` directive syntax.

### vue/valid-v-memo
Use valid `v-memo` directive with an array expression.

### vue/valid-v-model
Use valid `v-model` directive. It must be on input elements or components, with a valid expression.

### vue/valid-v-on
Use valid `v-on` directive syntax.

### vue/valid-v-once
Use valid `v-once` directive. It must have no expression or argument.

### vue/valid-v-pre
Use valid `v-pre` directive. It must have no expression or argument.

### vue/valid-v-show
Use valid `v-show` directive syntax with an expression.

### vue/valid-v-slot
Use valid `v-slot` directive syntax. It must be on `<template>` or a component.

### vue/valid-v-text
Use valid `v-text` directive syntax with an expression.

### vue/html-button-has-type
Add an explicit `type` attribute to `<button>` (`button`, `submit`, or `reset`).

## RxJS

### rxjs/no-compat
Do not import from `rxjs/Rx` or `rxjs-compat`. Use direct imports from `rxjs` and `rxjs/operators`.

### rxjs/no-create
Do not use `Observable.create()`. Use `new Observable()` or creation operators (`of`, `from`, etc.).

### rxjs/no-ignored-error
Do not call `.subscribe()` without an error handler. Either pass an observer object with an `error` callback (e.g., `.subscribe({ next: val => …, error: err => … })`) or pipe through `catchError` before subscribing.

### rxjs/no-ignored-observable
Do not ignore returned Observables. Either `.subscribe()` to the returned Observable, or assign it to a variable for later use. If the result is intentionally unused, pipe through `tap()` for side effects or remove the call entirely.

### rxjs/no-ignored-replay-buffer
Provide a `bufferSize` argument to `ReplaySubject`. The default is `Infinity`.

### rxjs/no-ignored-subscribe
Do not call `.subscribe()` without providing at least a next handler.

### rxjs/no-ignored-subscription
Assign the return value of `.subscribe()` to a variable (e.g., `const sub = obs$.subscribe(…)`) and call `sub.unsubscribe()` during cleanup (e.g., in `ngOnDestroy` or a teardown function). Alternatively, use `takeUntil(destroy$)` before `.subscribe()` to manage the lifecycle declaratively.

### rxjs/no-index
Do not import from `rxjs/index`. Import directly from `rxjs`.

### rxjs/no-topromise
Do not use `.toPromise()`. Use `firstValueFrom()` or `lastValueFrom()`.

### rxjs/no-unbound-methods
Bind methods before passing them as observer callbacks, or use arrow functions.

### rxjs/finnish
Observable variables and parameters must use the `$` suffix (`data$`, `click$`).

### rxjs/no-async-subscribe
Do not pass `async` functions to `.subscribe()`. Errors inside async subscribe are silently lost.

### rxjs/no-cyclic-action
Do not create actions that re-emit themselves, creating infinite loops in effects.

### rxjs/no-exposed-subjects
Do not expose `Subject` directly. Expose as `Observable` using `.asObservable()`.

### rxjs/no-ignored-notifier
Use the `notifications` parameter passed to `repeatWhen`/`retryWhen` to control retry/repeat timing (e.g., `retryWhen(errors => errors.pipe(delay(1000)))`). If you don't need conditional logic, use `retry({ delay: 1000 })` or `repeat({ delay: 1000 })` instead.

### rxjs/no-ignored-takewhile-value
Use the value parameter in `takeWhile` callbacks. If unused, use `take` instead.

### rxjs/no-redundant-notify
Do not call `next()` immediately before `complete()` or `error()` when the `next` value is unused downstream. Remove the redundant `next()` call and keep only `complete()` (or `error()`). If the value from `next()` is needed by subscribers, that is fine — the rule flags cases where `next()` has no effect because the stream terminates immediately after.

### rxjs/no-subclass
Do not subclass RxJS classes (Observable, Subject, etc.). Instead of `class MyObs extends Observable`, create a plain class that holds an Observable as a property or exposes one via a factory function that pipes creation operators and custom operators together.

### rxjs/no-subject-unsubscribe
Do not call `.unsubscribe()` on subjects. Unsubscribe from the subscription instead.

### rxjs/no-subject-value
Do not access `.value` on `BehaviorSubject`. Subscribe or use `getValue()` explicitly if necessary.

### rxjs/no-unsafe-catch
Place `catchError` inside `switchMap`/`mergeMap`/etc., not outside — an error outside kills the outer stream.

### rxjs/no-unsafe-first
Use `take(1)` inside `switchMap`/`mergeMap`/etc. instead of `first()` — `first()` errors on empty streams.

### rxjs/no-unsafe-subject-next
Do not call `.next()` on a subject inside an operator that may not reach it (e.g., after `takeUntil`).

### rxjs/no-unsafe-takeuntil
Place `takeUntil` as the last operator before `subscribe` to avoid subscription leaks.

### rxjs/suffix-subjects
Subject variables must use the `Subject` suffix (e.g., `clickSubject`, `dataSubject`).

### rxjs/throw-error
Only throw `Error` objects in `throwError()`. Do not throw strings or plain objects.

### rxjs/no-connectable
Do not use connectable observables. Use `share`, `shareReplay`, or `publish` operators.

### rxjs/no-nested-subscribe
Do not nest `.subscribe()` calls. Use `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap`.

### rxjs/no-sharereplay
Use `shareReplay` with `{ refCount: true }` to avoid memory leaks.

### rxjs/no-subscribe-handlers
Use the observer object form `{ next, error, complete }` instead of positional arguments in `.subscribe()`.

### rxjs/no-unsafe-switchmap
Do not use `switchMap` with actions that should not be cancelled (e.g., writes/deletes). Use `concatMap` or `mergeMap`.

## JSDoc

### jsdoc/no-bad-blocks
Use `/** ... */` for JSDoc comments, not `/* ... */`.

### jsdoc/require-jsdoc
Add JSDoc comments to public APIs: type aliases, interfaces, enums, class declarations, method definitions, arrow functions at module level, object expressions, and property definitions. Analyze what each part of the code does from the perspective of public use and create a concise but comprehensive JSDoc description based on this analysis.

## Boundaries (FSD)

### boundaries/element-types
Follow Feature Sliced Design import rules:
- **shared** must not import from `entities`, `features`, `widgets`, `pages`, `app`
- **entities** must not import from `features`, `widgets`, `pages`, `app` or other entities
- **features** must not import from `widgets`, `pages`, `app` or other features
- **widgets** must not import from `pages`, `app` or other widgets
- **pages** must not import from `app` or other pages

Move the imported code to a shared layer or pass it as a dependency.

### boundaries/entry-point
Import only from public API entry points. Non-shared layers (`entities`, `features`, `widgets`, `pages`, `app`) must be imported through `index.ts` or `index.vue`. Shared layer allows any entry point. If the required index.ts file doesn't exist - you must create it in it's respective segment (the root of an entity/feature/etc)

## Productive

### productive/no-abusive-nested-if
Reduce `if` nesting to 2 levels or below. Use early returns, guard clauses, or extract nested conditions into separate functions.

### productive/no-else
Remove `else`/`else if` blocks. Use early returns or omit the else entirely.
```ts
// Bad
if (condition) {
  return a
} else {
  return b
}
// Good
if (condition) {
  return a
}
return b
```
