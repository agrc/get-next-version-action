const semver = require('semver');

function isPrerelease(version) {
  return version.includes('-');
}

function getNewVersion(lastTag, conventionalReleaseType, prerelease) {
  const releaseType = getReleaseType(lastTag, conventionalReleaseType, prerelease);

  return semver.inc(lastTag, releaseType, prerelease);
}

function getReleaseType(currentRelease, conventionalReleaseType, prerelease) {
  if (prerelease) {
    if (isPrerelease(currentRelease) && conventionalReleaseType === 'patch') {
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
}
