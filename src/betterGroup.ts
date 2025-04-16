export function betterGroup<T>(
  label: string,
  callbackFn: () => T,
  thisArg?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): T {
  console.group(label);
  const result: T = callbackFn.call(thisArg ?? global); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  console.groupEnd();
  return result;
}
