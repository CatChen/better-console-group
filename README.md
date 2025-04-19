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

## `asyncGroup`

The `asyncGroup` function is the async version of the `betterGroup` function. When multiple `asyncGroup` are running in parallel, the groups they create won't overlap with each other. Each group will only flush its messages when its async function has finished running.

```TypeScript
import { asyncGroup } from 'better-console-group';
const downloadPromises = [];
for (let imageURL in imageURLs) {
  const downloadPromise = asyncGroup(`${imageURL}`, async (group) => {
    group.log('Start downloading image...');
    try {
      await fetch(imageURL);
      group.log('Finish downloading image.');
    } catch {
      group.error('Fail to download image!')
    }
  });
  downloadPromises.push(downloadPromise);
}
await Promise.allSettled(downloadPromises);
```

In the example from above, image downloading can happen in parallel. However, each group that represents a single download will not overlap with each other. If one download fails, we can clearly see which image URL it's associated with.

### API

#### `asyncGroup`

```TypeScript
async function asyncGroup<T>(label: string, callbackFn: (group: AsyncConsoleGroup) => T, thisArg?: unknown): Promise<T>;
```

`asyncGroup` is almost identical to `betterGroup`, exact it passes a `group` argument when calling `callbackFn`. We need to call `console` methods on the `group` instead of straight from the `console`.

#### `AsyncConsoleGroup`

An instance of `AsyncConsoleGroup` is passed into the `callbackFn` when `asyncGroup` is called.

#### `group.log`

```TypeScript
group.log(message: any, ...optionalParams: Array<any>): void
```

Similar to `console.log`, but for logging a message inside an `asyncGroup` callback.

#### `group.warn`

```TypeScript
group.warn(message: any, ...optionalParams: Array<any>): void
```

Similar to `console.warn`, but for logging a warning inside an `asyncGroup` callback.

#### `group.error`

```TypeScript
group.error(message: any, ...optionalParams: Array<any>): void
```

Similar to `console.error`, but for logging an error inside an `asyncGroup` callback.

### `group.asyncGroup`

```TypeScript
async group.asyncGroup<T>(
    label: string,
    callbackFn: (group: AsyncConsoleGroup) => Promise<T>,
    thisArg?: unknown,
  ): Promise<T>
```

The `group.asyncGroup` signature is identical to the top level `asyncGroup` function. It creates a nested group inside an existing group. Below is an example of how this may be used.

```TypeScript
import { asyncGroup } from 'better-console-group';
const processingPromises = [];
for (let imageURL in imageURLs) {
  const processingPromise = asyncGroup(`${imageURL}`, async (group) => {
    group.log('Start processing image...');

    const image = await group.asyncGroup('Download image', async (nestedGroup) => {
      nestGroup.log('Start downloading image...');
      try {
        return await downloadImage(imageURL);
        nestedGroup.log('Finish downloading image.');
      } catch {
        nestedGroup.error('Fail to download image!')
      }
    });

    if (image) {
      await group.asyncGroup('Resize image', async (nestedGroup) => {
        nestGroup.log('Start resizing image...');
        try {
          await resizeImage(image);
          nestedGroup.log('Finish resizing image.');
        } catch {
          nestedGroup.error('Fail to resize image!')
        }
      });
    }

    group.log('Finish processing image.');=
  });
  processingPromises.push(processingPromise);
}
await Promise.allSettled(processingPromises);
```

In this example, each image URL has its own group. Within each group, there's one nested group for logs related to the downloading of the image. There's another nested group for logs related to the resizing of the image.
