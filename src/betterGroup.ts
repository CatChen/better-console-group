/**
 * A better version of console.group and console.groupEnd pair.
 * @param label Label for the group. The same as you would pass to console.group.
 * @param callbackFn All the console method calls inside this function will be put in the group.
 * @param thisArg Optional. The value of `this` inside the callback function.
 * @template T The type of the value returned from the callback function.
 * @returns Anything returned from the callback function.
 */
export function betterGroup<T>(
  label: string,
  callbackFn: () => T,
  thisArg?: unknown,
): T {
  console.group(label);
  try {
    const result: T = callbackFn.call(thisArg ?? globalThis); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    return result;
  } finally {
    console.groupEnd();
  }
}
