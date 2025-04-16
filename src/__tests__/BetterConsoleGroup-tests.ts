import { BetterConsoleGroup } from '../BetterConsoleGroup';

it('is a class', () => {
  const group = new BetterConsoleGroup();
  expect(group).not.toBeUndefined();
  expect(group).not.toBeNull();
  expect(group).toBeInstanceOf(BetterConsoleGroup);
});
