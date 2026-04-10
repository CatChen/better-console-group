import { asyncGroup as asyncGroupDirect } from '../asyncGroup.js';
import { asyncGroup, betterGroup } from '../BetterConsoleGroup.js';
import { betterGroup as betterGroupDirect } from '../betterGroup.js';

it('re-exports betterGroup', () => {
  expect(betterGroup).toBe(betterGroupDirect);
});

it('re-exports asyncGroup', () => {
  expect(asyncGroup).toBe(asyncGroupDirect);
});
