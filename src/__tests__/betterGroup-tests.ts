import { betterGroup } from '../betterGroup';

const TEST_LABEL = 'Test Group';
const TEST_CALLBACK_LOG = 'Inside test callback';
const TEST_CALLBACK_RETURN = 'Test result';
const TEST_CALLBACK = jest.fn(function () {
  console.log(TEST_CALLBACK_LOG);
  return TEST_CALLBACK_RETURN;
});
const TEST_CONTEXT = {};

const consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
beforeEach(() => {
  jest.clearAllMocks();
});

it('is a function', () => {
  expect(betterGroup).toBeInstanceOf(Function);
});

it('calls console.group with the correct label', () => {
  expect(consoleGroupSpy).not.toHaveBeenCalled();
  betterGroup(TEST_LABEL, () => {});
  expect(consoleGroupSpy).toHaveBeenCalledWith(TEST_LABEL);
});

it('calls console.groupEnd', () => {
  expect(consoleGroupEndSpy).not.toHaveBeenCalled();
  betterGroup(TEST_LABEL, () => {});
  expect(consoleGroupEndSpy).toHaveBeenCalled();
});

it('calls the callback function', () => {
  expect(TEST_CALLBACK).not.toHaveBeenCalled();
  betterGroup(TEST_LABEL, TEST_CALLBACK);
  expect(TEST_CALLBACK).toHaveBeenCalled();
});

it('calls the callback function with the correct context', () => {
  const callback = function () {
    expect(this).toBe(TEST_CONTEXT);
  };
  betterGroup(TEST_LABEL, callback, TEST_CONTEXT);
});

it('returns the result of the callback function', () => {
  const result = betterGroup(TEST_LABEL, TEST_CALLBACK);
  expect(result).toBe(TEST_CALLBACK_RETURN);
});

it('returns undefined if the callback function does not return anything', () => {
  const result = betterGroup(TEST_LABEL, () => {});
  expect(result).toBeUndefined();
});

it('calls console.log with the correct message', () => {
  expect(consoleLogSpy).not.toHaveBeenCalled();
  betterGroup(TEST_LABEL, TEST_CALLBACK);
  expect(consoleLogSpy).toHaveBeenCalledWith(TEST_CALLBACK_LOG);
});
