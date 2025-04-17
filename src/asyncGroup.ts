type ConsoleMethod = 'log' | 'warn' | 'error' | 'debug' | 'info';
type ConsoleMethodWithParams =
  | [ConsoleMethod, unknown, ...unknown[]]
  | ['group', string]
  | ['groupEnd'];
type AsyncConsoleGroupBuffer = Array<ConsoleMethodWithParams>;

class AsyncConsoleGroup {
  #buffer: AsyncConsoleGroupBuffer;
  #ended: boolean = false;

  constructor(buffer: AsyncConsoleGroupBuffer) {
    this.#buffer = buffer;
  }

  async asyncGroup<T>(
    label: string,
    callbackFn: (group: AsyncConsoleGroup) => Promise<T>,
    thisArg?: unknown,
  ): Promise<T> {
    const group = new AsyncConsoleGroup([]);
    const result: T = await callbackFn.call(thisArg ?? globalThis, group); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    const buffer = group.end();

    this.#buffer.push(['group', label]);
    this.#buffer.push(...buffer);
    this.#buffer.push(['groupEnd']);

    return result;
  }

  /**
   * Equivalent of console.log when used inside a group.
   */
  log(message?: unknown, ...optionalParams: unknown[]): void {
    if (!this.#ended) {
      this.#buffer.push(['log', message, ...optionalParams]);
    }
  }

  /**
   * Equivalent of console.warn when used inside a group.
   */
  warn(message?: unknown, ...optionalParams: unknown[]): void {
    if (!this.#ended) {
      this.#buffer.push(['warn', message, ...optionalParams]);
    }
  }

  /**
   * Equivalent of console.error when used inside a group.
   */
  error(message?: unknown, ...optionalParams: unknown[]): void {
    if (!this.#ended) {
      this.#buffer.push(['error', message, ...optionalParams]);
    }
  }

  /**
   * Alias for group.log.
   */
  debug(message?: unknown, ...optionalParams: unknown[]): void {
    this.log(message, ...optionalParams);
  }

  /**
   * Alias for group.log.
   */
  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.log(message, ...optionalParams);
  }

  /**
   * Equivalent of console.endGroup when used inside a group.
   * It flushes the buffer and ends the group.
   */
  end(): AsyncConsoleGroupBuffer {
    this.#ended = true;
    return this.#buffer;
  }
}

export async function asyncGroup<T>(
  label: string,
  callbackFn: (group: AsyncConsoleGroup) => Promise<T>,
  thisArg?: unknown,
): Promise<T> {
  const group = new AsyncConsoleGroup([]);
  const result: T = await callbackFn.call(thisArg ?? globalThis, group); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const buffer = group.end();

  console.group(label);
  while (buffer.length > 0) {
    const [method, message, ...optionalParams] = buffer.shift()!; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
    if (method === 'group') {
      console.group(message);
    } else if (method === 'groupEnd') {
      console.groupEnd();
    } else {
      console[method](message, ...optionalParams);
    }
  }
  console.groupEnd();

  return result;
}

export type { AsyncConsoleGroup };
