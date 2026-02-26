import { type AsyncConsoleGroup, asyncGroup } from '../asyncGroup';

const TEST_LABEL = 'Test Group';
const TEST_NESTED_LABEL = 'Nested Group';
const TEST_CALLBACK_LOG = 'Inside test callback';
const TEST_CALLBACK_RETURN = 'Test result';
const TEST_CALLBACK = jest.fn(async function (group: AsyncConsoleGroup) {
  await Promise.resolve();
  group.log(TEST_CALLBACK_LOG);
  group.warn(TEST_CALLBACK_LOG);
  group.error(TEST_CALLBACK_LOG);
  group.debug(TEST_CALLBACK_LOG);
  group.info(TEST_CALLBACK_LOG);
  return TEST_CALLBACK_RETURN;
});
const TEST_ERROR_MESSAGE = 'Test error';
const TEST_ERROR_CALLBACK = jest.fn(async function (group: AsyncConsoleGroup) {
  await Promise.resolve();
  group.log(TEST_CALLBACK_LOG);
  group.warn(TEST_CALLBACK_LOG);
  group.error(TEST_CALLBACK_LOG);
  group.debug(TEST_CALLBACK_LOG);
  group.info(TEST_CALLBACK_LOG);
  throw new Error(TEST_ERROR_MESSAGE);
});

const TEST_NESTED_CALLBACK = jest.fn(async function (group: AsyncConsoleGroup) {
  await group.asyncGroup(
    TEST_NESTED_LABEL,
    async (nestedGroup: AsyncConsoleGroup) => {
      await Promise.resolve();
      nestedGroup.log(TEST_CALLBACK_LOG);
      nestedGroup.warn(TEST_CALLBACK_LOG);
      nestedGroup.error(TEST_CALLBACK_LOG);
      nestedGroup.debug(TEST_CALLBACK_LOG);
      nestedGroup.info(TEST_CALLBACK_LOG);
    },
  );
  return TEST_CALLBACK_RETURN;
});
const TEST_CONTEXT = {};

const TEST_TABLE_DATA = [{ key: 'value' }];
const TEST_TRACE_LABEL = 'trace label';
const TEST_ASSERT_MESSAGE = 'assertion failed';
const TEST_TIMER_LABEL = 'timer';
const TEST_DIR_VALUE = { nested: { value: 1 } };
const TEST_EXTENDED_METHODS_CALLBACK = jest.fn(async function (
  group: AsyncConsoleGroup,
) {
  await Promise.resolve();
  group.table(TEST_TABLE_DATA, ['key']);
  group.trace(TEST_TRACE_LABEL);
  group.assert(false, TEST_ASSERT_MESSAGE);
  group.time(TEST_TIMER_LABEL);
  group.timeEnd(TEST_TIMER_LABEL);
  group.dir(TEST_DIR_VALUE);
});

const consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
const consoleTraceSpy = jest.spyOn(console, 'trace').mockImplementation();
const consoleAssertSpy = jest.spyOn(console, 'assert').mockImplementation();
const consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
const consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation();
const consoleDirSpy = jest.spyOn(console, 'dir').mockImplementation();
beforeEach(() => {
  jest.clearAllMocks();
});

it('is a function', () => {
  expect(asyncGroup).toBeInstanceOf(Function);
});

describe('async group', () => {
  it('calls console.group with the correct label', async () => {
    expect(consoleGroupSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, async () => {});
    expect(consoleGroupSpy).toHaveBeenCalledWith(TEST_LABEL);
  });

  it('calls console.groupEnd', async () => {
    expect(consoleGroupEndSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, async () => {});
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('calls the callback function', async () => {
    expect(TEST_CALLBACK).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_CALLBACK);
    expect(TEST_CALLBACK).toHaveBeenCalled();
  });

  it('calls the callback function with the correct context', async () => {
    const callback = async function () {
      await Promise.resolve();
      expect(this).toBe(TEST_CONTEXT);
    };
    await asyncGroup(TEST_LABEL, callback, TEST_CONTEXT);
  });

  it('returns the result of the callback function', async () => {
    const result = await asyncGroup(TEST_LABEL, TEST_CALLBACK);
    expect(result).toBe(TEST_CALLBACK_RETURN);
  });

  it('returns undefined if the callback function does not return anything', async () => {
    const result = await asyncGroup(TEST_LABEL, async () => {});
    expect(result).toBeUndefined();
  });

  it('calls console.log with the correct message', async () => {
    expect(consoleLogSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_CALLBACK);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(TEST_CALLBACK_LOG);
  });

  it('calls console.warn with the correct message', async () => {
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_CALLBACK);
    expect(consoleWarnSpy).toHaveBeenCalledWith(TEST_CALLBACK_LOG);
  });

  it('calls console.error with the correct message', async () => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_CALLBACK);
    expect(consoleErrorSpy).toHaveBeenCalledWith(TEST_CALLBACK_LOG);
  });

  it('calls console.debug with the correct message', async () => {
    expect(consoleDebugSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_CALLBACK);
    expect(consoleDebugSpy).toHaveBeenCalledWith(TEST_CALLBACK_LOG);
  });

  it('calls console.info with the correct message', async () => {
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_CALLBACK);
    expect(consoleInfoSpy).toHaveBeenCalledWith(TEST_CALLBACK_LOG);
  });

  it('calls extended console methods with the correct values', async () => {
    expect(TEST_EXTENDED_METHODS_CALLBACK).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_EXTENDED_METHODS_CALLBACK);

    expect(TEST_EXTENDED_METHODS_CALLBACK).toHaveBeenCalled();
    expect(consoleTableSpy).toHaveBeenCalledWith(TEST_TABLE_DATA, ['key']);
    expect(consoleTraceSpy).toHaveBeenCalledWith(TEST_TRACE_LABEL);
    expect(consoleAssertSpy).toHaveBeenCalledWith(false, TEST_ASSERT_MESSAGE);
    expect(consoleTimeSpy).toHaveBeenCalledWith(TEST_TIMER_LABEL);
    expect(consoleTimeEndSpy).toHaveBeenCalledWith(TEST_TIMER_LABEL);
    expect(consoleDirSpy).toHaveBeenCalledWith(TEST_DIR_VALUE, undefined);
  });

  it('calls console methods in the correct order', async () => {
    await asyncGroup(TEST_LABEL, async (group: AsyncConsoleGroup) => {
      await Promise.resolve();
      group.log(TEST_CALLBACK_LOG);
      group.warn(TEST_CALLBACK_LOG);
      group.error(TEST_CALLBACK_LOG);
      group.debug(TEST_CALLBACK_LOG);
      group.info(TEST_CALLBACK_LOG);
      expect(consoleGroupSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleGroupEndSpy).not.toHaveBeenCalled();
    });
    expect(consoleGroupSpy).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('calls console.groupEnd when the callback function throws an error', async () => {
    expect(consoleGroupEndSpy).not.toHaveBeenCalled();
    try {
      await asyncGroup(TEST_LABEL, TEST_ERROR_CALLBACK);
    } catch {
      /* Empty */
    }
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('throws the error from the callback function', async () => {
    await expect(asyncGroup(TEST_LABEL, TEST_ERROR_CALLBACK)).rejects.toThrow(
      TEST_ERROR_MESSAGE,
    );
  });
});

describe('nested async group', () => {
  it('calls console.group with the correct nested label', async () => {
    expect(consoleGroupSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_NESTED_CALLBACK);
    expect(consoleGroupSpy).toHaveBeenCalledTimes(2);
    expect(consoleGroupSpy).toHaveBeenCalledWith(TEST_NESTED_LABEL);
  });

  it('calls console.groupEnd for the nested group', async () => {
    expect(consoleGroupEndSpy).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_NESTED_CALLBACK);
    expect(consoleGroupEndSpy).toHaveBeenCalledTimes(2);
  });

  it('calls the nested callback function', async () => {
    expect(TEST_NESTED_CALLBACK).not.toHaveBeenCalled();
    await asyncGroup(TEST_LABEL, TEST_NESTED_CALLBACK);
    expect(TEST_NESTED_CALLBACK).toHaveBeenCalled();
  });

  it('calls the nested callback function with the correct context', async () => {
    await asyncGroup(TEST_LABEL, async function (group: AsyncConsoleGroup) {
      await group.asyncGroup(
        TEST_NESTED_LABEL,
        async function () {
          await Promise.resolve();
          expect(this).toBe(TEST_CONTEXT);
        },
        TEST_CONTEXT,
      );
    });
  });
});
