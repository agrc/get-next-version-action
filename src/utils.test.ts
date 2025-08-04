import { describe, expect, test } from 'vitest';
import { getLatestRelease, getNewVersion, isPrerelease, type GraphQLResponse } from './utils.js';

describe('isPrerelease', () => {
  const cases: [string, boolean][] = [
    ['1.0.0', false],
    ['1.0.0-1', true],
  ];

  test.each(cases)('when tag is %s', (tag: string, expectation: boolean) => {
    expect(isPrerelease(tag)).toBe(expectation);
  });
});

describe('getNewVersion', () => {
  // 0: last tag
  // 1: conventional recommended bump type
  // 2: prerelease
  // 3: last prod tag
  // 4: expected release type
  const cases: [string | null, string, boolean, string | null, string][] = [
    ['1.0.0', 'patch', false, '1.0.0', '1.0.1'],
    ['1.0.0', 'patch', true, '1.0.0', '1.0.1-rc.1'],
    ['1.0.1-rc.1', 'patch', true, '1.0.1', '1.0.1-rc.2'],
    ['1.0.1-1', 'patch', true, '1.0.1', '1.0.1-rc.2'],
    ['1.0.1-rc.1', 'minor', true, '1.0.1', '1.1.0-rc.1'],
    ['1.1.0-rc.1', 'minor', true, '1.0.1', '1.1.0-rc.2'],
    ['1.0.1', 'minor', false, '1.0.1', '1.1.0'],
    ['1.0.1', 'major', false, '1.0.1', '2.0.0'],
    ['1.0.1', 'major', true, '1.0.1', '2.0.0-rc.1'],
    ['1.0.1-rc.1', 'major', true, '1.0.1', '2.0.0-rc.1'],
    [null, 'minor', false, null, '1.0.0'],
    [null, 'major', false, null, '1.0.0'],
    [null, 'major', true, null, '1.0.0-rc.1'],
    ['2.0.0-rc.1', 'patch', true, '1.0.0', '2.0.0-rc.2'],
    ['2.0.0-rc.1', 'minor', true, '2.0.0', '2.0.0-rc.2'],
    ['1.3.0-rc.17', 'minor', true, '1.2.6', '1.3.0-rc.18'],
    ['1.3.0-17', 'minor', true, '1.2.6', '1.3.0-rc.18'],
    ['1.3.0-rc.7', 'major', true, '1.2.6', '2.0.0-rc.1'],
    ['0.1.0-rc.0', 'minor', true, null, '0.1.0-rc.1'],
    ['2.0.0-rc.5', 'minor', false, '1.3.4', '1.4.0'],
    [null, 'patch', false, null, '1.0.0'],
    ['1.0.0-rc.3', 'patch', false, null, '1.0.0'],
  ];

  test.each(cases)('%s, %s, %j, %s => %s', (lastTag, bumpType, prerelease, lastProdTag, expectation) => {
    expect(getNewVersion(lastTag, bumpType, prerelease, lastProdTag)).toBe(expectation);
  });
});

describe('getLatestRelease', () => {
  const cases: [string[], string | null][] = [
    [[], null],
    [['invalid', 'v1.2.1'], 'v1.2.1'],
    [
      [
        'v2.1.0',
        'v2.0.0',
        'v1.1.9',
        'v1.1.8',
        'v1.1.7',
        'v1.1.6',
        'v1.1.5',
        'v1.1.4',
        'v1.1.3',
        'v1.1.2',
        'v1.1.1',
        'v1.1.0',
        'v1.0.0',
      ],
      'v2.1.0',
    ],
    [['v1.0.0', 'v2.0.0'], 'v2.0.0'],
    [['v10.0.0', 'v2.0.0'], 'v10.0.0'],
    [['v1.0.0-rc.0', 'v2.0.0-rc.1'], 'v2.0.0-rc.1'],
  ];

  test.each(cases)('%s should return %j', (releases, expectation) => {
    const edges = releases.map((release) => ({ node: { tag: { name: release } } }));

    expect(getLatestRelease(edges as GraphQLResponse['repository']['releases']['edges'])).toBe(expectation);
  });

  test('should skip null tags', () => {
    const edges = [
      { node: { tag: { name: 'v1.0.0' } } },
      { node: { tag: null } },
      { node: { tag: { name: 'v2.0.0' } } },
    ];

    expect(getLatestRelease(edges as GraphQLResponse['repository']['releases']['edges'])).toBe('v2.0.0');
  });

  test('can handle all null tags', () => {
    const edges = [
      { node: { id: '1', isPrerelease: false, tag: null } },
      { node: { id: '2', isPrerelease: false, tag: null } },
    ];

    expect(getLatestRelease(edges as GraphQLResponse['repository']['releases']['edges'])).toBe(null);
  });
});
