const { isPrerelease, getLatestRelease, getNewVersion } = require('./utils.js');
const { describe, test, expect } = await import('vitest');

describe('isPrerelease', () => {
  const cases = [
    ['1.0.0', false],
    ['1.0.0-0', true],
  ];

  test.each(cases)('when tag is %s', (tag, expectation) => {
    expect(isPrerelease(tag)).toBe(expectation);
  });
});

describe('getNewVersion', () => {
  // 0: last tag
  // 1: conventional recommended bump type
  // 2: prerelease
  // 3: expected release type
  const cases = [
    ['1.0.0', 'patch', false, '1.0.1'],
    ['1.0.0', 'patch', true, '1.0.1-0'],
    ['1.0.1-0', 'patch', true, '1.0.1-1'],
    ['1.0.0-0', 'patch', true, '1.0.0-1'],
    ['1.0.1-0', 'minor', true, '1.1.0-0'],
    ['1.0.1', 'minor', false, '1.1.0'],
    ['1.0.1', 'major', false, '2.0.0'],
    ['1.0.1', 'major', true, '2.0.0-0'],
    ['1.0.1-0', 'major', true, '2.0.0-0'],
    [null, 'minor', false, '1.0.0'],
    [null, 'major', false, '1.0.0'],
    [null, 'major', true, '1.0.0-0'],
    ['2.0.0-0', 'minor', true, '2.0.0-1'],
  ];

  test.each(cases)('%s with %s and prerelease: %j should be %s', (lastTag, bumpType, prerelease, expectation) => {
    expect(getNewVersion(lastTag, bumpType, prerelease)).toBe(expectation);
  });
});

describe('getLatestRelease', () => {
  const cases = [
    [[], null],
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
    [['v1.0.0-0', 'v2.0.0-1'], 'v2.0.0-1'],
  ];

  test.each(cases)('%s should return %j', (releases, expectation) => {
    const edges = releases.map((release) => ({ node: { tag: { name: release } } }));

    expect(getLatestRelease(edges)).toBe(expectation);
  });
});
