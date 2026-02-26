type ConsoleMethodCall<Args extends unknown[] = unknown[]> = [
  method: (...args: Args) => void,
  ...params: Args,
];

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

  #push<Args extends unknown[]>(
    method: (...args: Args) => void,
    ...params: Args
  ): void {
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
    this.#push(
      (...params) => {
        console.log(...params);
      },
      message,
      ...optionalParams,
    );
  }

  /**
   * Equivalent of console.warn when used inside a group.
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  warn(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push(
      (...params) => {
        console.warn(...params);
      },
      message,
      ...optionalParams,
    );
  }

  /**
   * Equivalent of console.error when used inside a group.
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  error(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push(
      (...params) => {
        console.error(...params);
      },
      message,
      ...optionalParams,
    );
  }

  /**
   * Equivalent of console.debug when used inside a group.
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  debug(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push(
      (...params) => {
        console.debug(...params);
      },
      message,
      ...optionalParams,
    );
  }

  /**
   * Equivalent of console.info when used inside a group.
   * @param message The message to log.
   * @param optionalParams Optional parameters to log.
   */
  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.#push(
      (...params) => {
        console.info(...params);
      },
      message,
      ...optionalParams,
    );
  }

  /**
   * Equivalent of console.table when used inside a group.
   * @param tabularData The data to display as a table.
   * @param properties Optional list of property names to include in the table.
   */
  table(tabularData?: unknown, properties?: string[]): void {
    this.#push(
      (...params) => {
        console.table(...params);
      },
      tabularData,
      properties,
    );
  }

  /**
   * Equivalent of console.trace when used inside a group.
   * @param data Optional values to include with the stack trace output.
   */
  trace(...data: unknown[]): void {
    this.#push(
      (...params) => {
        console.trace(...params);
      },
      ...data,
    );
  }

  /**
   * Equivalent of console.assert when used inside a group.
   * @param condition Condition to assert.
   * @param data Optional values to log when the assertion fails.
   */
  assert(condition?: boolean, ...data: unknown[]): void {
    this.#push(
      (...params) => {
        console.assert(...params);
      },
      condition,
      ...data,
    );
  }

  /**
   * Equivalent of console.time when used inside a group.
   * @param label Optional timer label.
   */
  time(label?: string): void {
    this.#push((timerLabel?: string) => {
      console.time(timerLabel);
    }, label);
  }

  /**
   * Equivalent of console.timeEnd when used inside a group.
   * @param label Optional timer label.
   */
  timeEnd(label?: string): void {
    this.#push((timerLabel?: string) => {
      console.timeEnd(timerLabel);
    }, label);
  }

  /**
   * Equivalent of console.dir when used inside a group.
   * @param item The value to inspect.
   * @param options Optional inspection options.
   */
  dir(item?: unknown, options?: object): void {
    this.#push(
      (dirItem?: unknown, dirOptions?: object) => {
        console.dir(dirItem, dirOptions);
      },
      item,
      options,
    );
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
      const entry = buffer.shift()!; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
      if (entry[0] === 'group') {
        const [, groupLabel] = entry;
        console.group(groupLabel);
      } else if (entry[0] === 'groupEnd') {
        console.groupEnd();
      } else {
        const [method, ...params] = entry;
        method(...params);
      }
    }
    console.groupEnd();
  }
}

export type { AsyncConsoleGroup };
