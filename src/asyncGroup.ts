type ConsoleMethod =
  | 'log'
  | 'warn'
  | 'error'
  | 'debug'
  | 'info'
  | 'table'
  | 'trace'
  | 'assert'
  | 'time'
  | 'timeEnd'
  | 'dir';
type ConsoleMethodWithParams =
  | [ConsoleMethod, ...unknown[]]
  | ['group', string]
  | ['groupEnd'];
type AsyncConsoleGroupBuffer = Array<ConsoleMethodWithParams>;

/**
 * A private class. Each of its instance represents a grouping of console messages.
 * You will receive an instance of this class when you call asyncGroup.
 * You can use this instance to log messages inside the group.
 * You can also use it to create nested groups.
 * @private
 * @class AsyncConsoleGroup
 * @param buffer The buffer that stores the console messages.
 */
class AsyncConsoleGroup {
  #buffer: AsyncConsoleGroupBuffer;
  #ended: boolean = false;

  constructor(buffer: AsyncConsoleGroupBuffer) {
    this.#buffer = buffer;
  }

  #push(method: ConsoleMethod, ...params: unknown[]): void {
    if (!this.#ended) {
      this.#buffer.push([method, ...params]);
    }
  }

  /**
   * Creates a new group nested inside the current group.
   * @param label Label for the group. The same as you would pass to console.group.
   * @param callbackFn All the console method calls inside this function will be put in the group.
   * @param thisArg Optional. The value of `this` inside the callback function.
   * @template T The type of the value returned from the callback function.
   * @returns Anything returned from the callback function.
   */
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
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  log(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push('log', message, ...optionalParams);
  }

  /**
   * Equivalent of console.warn when used inside a group.
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  warn(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push('warn', message, ...optionalParams);
  }

  /**
   * Equivalent of console.error when used inside a group.
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  error(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push('error', message, ...optionalParams);
  }

  /**
   * Equivalent of console.debug when used inside a group.
   */
  debug(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push('debug', message, ...optionalParams);
  }

  /**
   * Equivalent of console.info when used inside a group.
   */
  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push('info', message, ...optionalParams);
  }

  /**
   * Equivalent of console.table when used inside a group.
   */
  table(tabularData: unknown, properties?: string[]): void {
    this.#push('table', tabularData, properties);
  }

  /**
   * Equivalent of console.trace when used inside a group.
   */
  trace(...data: unknown[]): void {
    this.#push('trace', ...data);
  }

  /**
   * Equivalent of console.assert when used inside a group.
   */
  assert(condition?: boolean, ...data: unknown[]): void {
    this.#push('assert', condition, ...data);
  }

  /**
   * Equivalent of console.time when used inside a group.
   */
  time(label?: string): void {
    this.#push('time', label);
  }

  /**
   * Equivalent of console.timeEnd when used inside a group.
   */
  timeEnd(label?: string): void {
    this.#push('timeEnd', label);
  }

  /**
   * Equivalent of console.dir when used inside a group.
   */
  dir(item?: unknown, options?: object): void {
    this.#push('dir', item, options);
  }

  /**
   * You should not call this method directly. It is called automatically when the async callback finishes.
   * @private
   * @returns The buffer that stores the console messages.
   */
  end(): AsyncConsoleGroupBuffer {
    this.#ended = true;
    return this.#buffer;
  }
}

/**
 * The async version of betterGroup, which is a better version of console.group and console.groupEnd pair.
 * It allows you to use async/await inside the group and still have the console output correctly grouped together.
 * @param label Label for the group. The same as you would pass to console.group.
 * @param callbackFn All the console method calls inside this function will be put in the group.
 * @param thisArg Optional. The value of `this` inside the callback function.
 * @template T The type of the value returned from the callback function.
 * @returns Anything returned from the callback function.
 */
export async function asyncGroup<T>(
  label: string,
  callbackFn: (group: AsyncConsoleGroup) => Promise<T>,
  thisArg?: unknown,
): Promise<T> {
  const group = new AsyncConsoleGroup([]);
  try {
    const result: T = await callbackFn.call(thisArg ?? globalThis, group); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    return result;
  } finally {
    const buffer = group.end();

    console.group(label);
    while (buffer.length > 0) {
      const [method, ...params] = buffer.shift()!; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
      if (method === 'group') {
        console.group(...params);
      } else if (method === 'groupEnd') {
        console.groupEnd();
      } else {
        switch (method) {
          case 'log':
          case 'warn':
          case 'error':
          case 'debug':
          case 'info':
          case 'table':
          case 'trace':
          case 'assert':
          case 'time':
          case 'timeEnd':
          case 'dir':
            (console[method] as (...args: unknown[]) => void)(...params);
            break;
        }
      }
    }
    console.groupEnd();
  }
}

export type { AsyncConsoleGroup };
