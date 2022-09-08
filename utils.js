const semver = require('semver');

function isPrerelease(version) {
  return version.includes('-');
}

function getNewVersion(lastTag, conventionalReleaseType, prerelease) {
  if (lastTag === null) {
    return prerelease ? '1.0.0-0' : '1.0.0';
  }

  const releaseType = getReleaseType(lastTag, conventionalReleaseType, prerelease);

  return semver.inc(lastTag, releaseType, prerelease);
}

function getReleaseType(lastTag, conventionalReleaseType, prerelease) {
  if (prerelease) {
    if (isPrerelease(lastTag) && conventionalReleaseType === 'patch') {
      return 'prerelease';
    } else {
      return `pre${conventionalReleaseType}`;
    }
  } else {
    return conventionalReleaseType;
  }
}

module.exports = {
  isPrerelease,
  getNewVersion,
};
