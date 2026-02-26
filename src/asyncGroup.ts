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

type ConsoleMethodParams = {
  [Method in ConsoleMethod]: Parameters<Console[Method]>;
};

type ConsoleMethodCall = {
  [Method in ConsoleMethod]: [Method, ...ConsoleMethodParams[Method]];
}[ConsoleMethod];

type ConsoleMethodWithParams =
  | ConsoleMethodCall
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

  #push<Method extends ConsoleMethod>(
    method: Method,
    ...params: ConsoleMethodParams[Method]
  ): void {
    if (!this.#ended) {
      this.#buffer.push([method, ...params] as unknown as ConsoleMethodCall);
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
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  debug(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push('debug', message, ...optionalParams);
  }

  /**
   * Equivalent of console.info when used inside a group.
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push('info', message, ...optionalParams);
  }

  /**
   * Equivalent of console.table when used inside a group.
   * @param tabularData The data to display as a table.
   * @param properties Optional list of property names to include in the table.
   */
  table(tabularData?: unknown, properties?: string[]): void {
    this.#push('table', tabularData, properties);
  }

  /**
   * Equivalent of console.trace when used inside a group.
   * @param data Optional values to include with the stack trace output.
   */
  trace(...data: unknown[]): void {
    this.#push('trace', ...data);
  }

  /**
   * Equivalent of console.assert when used inside a group.
   * @param condition Condition to assert.
   * @param message Optional message to log when the assertion fails.
   * @param optionalParams Optional parameters to log when the assertion fails.
   */
  assert(
    condition?: boolean,
    message?: string,
    ...optionalParams: unknown[]
  ): void {
    this.#push('assert', condition, message, ...optionalParams);
  }

  /**
   * Equivalent of console.time when used inside a group.
   * @param label Optional timer label.
   */
  time(label?: string): void {
    this.#push('time', label);
  }

  /**
   * Equivalent of console.timeEnd when used inside a group.
   * @param label Optional timer label.
   */
  timeEnd(label?: string): void {
    this.#push('timeEnd', label);
  }

  /**
   * Equivalent of console.dir when used inside a group.
   * @param item The value to inspect.
   * @param options Optional inspection options.
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
      const [...methodAndParams] = buffer.shift()!; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
      switch (methodAndParams[0]) {
        case 'group': {
          const [, nestedLabel] = methodAndParams;
          console.group(nestedLabel);
          break;
        }
        case 'groupEnd':
          console.groupEnd();
          break;
        case 'log': {
          const [, ...params] = methodAndParams;
          console.log(...params);
          break;
        }
        case 'warn': {
          const [, ...params] = methodAndParams;
          console.warn(...params);
          break;
        }
        case 'error': {
          const [, ...params] = methodAndParams;
          console.error(...params);
          break;
        }
        case 'debug': {
          const [, ...params] = methodAndParams;
          console.debug(...params);
          break;
        }
        case 'info': {
          const [, ...params] = methodAndParams;
          console.info(...params);
          break;
        }
        case 'table': {
          const [, ...params] = methodAndParams;
          console.table(...params);
          break;
        }
        case 'trace': {
          const [, ...params] = methodAndParams;
          console.trace(...params);
          break;
        }
        case 'assert': {
          const [, ...params] = methodAndParams;
          console.assert(...params);
          break;
        }
        case 'time': {
          const [, ...params] = methodAndParams;
          console.time(...params);
          break;
        }
        case 'timeEnd': {
          const [, ...params] = methodAndParams;
          console.timeEnd(...params);
          break;
        }
        case 'dir': {
          const [, ...params] = methodAndParams;
          console.dir(...params);
          break;
        }
      }
    }
    console.groupEnd();
  }
}

export type { AsyncConsoleGroup };
