# better-console-group [![Node](https://github.com/CatChen/better-console-group/actions/workflows/node.yml/badge.svg)](https://github.com/CatChen/better-console-group/actions/workflows/node.yml) [![Deno](https://github.com/CatChen/better-console-group/actions/workflows/deno.yml/badge.svg)](https://github.com/CatChen/better-console-group/actions/workflows/deno.yml) [![codecov](https://codecov.io/gh/CatChen/better-console-group/branch/main/graph/badge.svg)](https://codecov.io/gh/CatChen/better-console-group)

Use `console.group` without worrying about mismatched `console.groupEnd`. Group multiple entries of `console.log`/`console.warn`/`console.error` in an `async function` without interference from other entries created by others during `await`.

## `betterGroup`

The `betterGroup` function is a better version of the `console.group` and `console.groupEnd` pair. It wraps around your function so every `console` method call inside is part of the group.

```TypeScript
import { betterGroup } from 'better-console-group';
console.log('before the group');
const result = betterGroup('group name', () => {
  console.log('inside the group')
  return 42;
});
console.log('after the group');
console.log(result); // 42
```

### API

```TypeScript
function betterGroup<T>(label: string, callbackFn: () => T, thisArg?: unknown): T;
```

The `betterGroup` function takes 2 required arguments and 1 optional argument.

- `label`: This argument is the `string` label. It's the same one as you would pass into `console.group(label)`.
- `callbackFn`: This argument is a function. All the `console` method calls inside will be called between `console.group(label)` and `console.groupEnd()`.
- `thisArg`: This optional argument will be used as the `this` context inside the `callbackFn`.

The return value from the `callbackFn` will be the return value from the `betterGroup` call.
