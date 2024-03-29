const semver = require('semver');

function isPrerelease(version) {
  return version.includes('-');
}

function isPreMajor(version) {
  return semver.minor(version) === 0 && semver.patch(version) === 0 && semver.prerelease(version);
}

function getNewVersion(lastTag, conventionalReleaseType, prerelease) {
  if (!lastTag) {
    return prerelease ? '1.0.0-0' : '1.0.0';
  }

  if (isPreMajor(lastTag) && prerelease) {
    return semver.inc(lastTag, 'prerelease', prerelease);
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

function getLatestRelease(releasesQueryResponse) {
  if (releasesQueryResponse.length === 0) {
    return null;
  }

  const releases = releasesQueryResponse.map((release) => release.node.tag.name);

  releases.sort((x, y) => (semver.gt(x, y) ? -1 : 1));

  return releases[0];
}

module.exports = {
  isPrerelease,
  getNewVersion,
  getLatestRelease,
};
