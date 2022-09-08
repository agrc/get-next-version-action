const { isPrerelease, getNewVersion } = require('./utils.js');

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
  ];

  test.each(cases)('%s with %s and prerelease: %j should be %s', (lastTag, bumpType, prerelease, expectation) => {
    expect(getNewVersion(lastTag, bumpType, prerelease)).toBe(expectation);
  });
});
