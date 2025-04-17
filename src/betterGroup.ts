export function betterGroup<T>(
  label: string,
  callbackFn: () => T,
  thisArg?: unknown,
): T {
  console.group(label);
  const result: T = callbackFn.call(thisArg ?? globalThis); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  console.groupEnd();
  return result;
}
