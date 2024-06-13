import semver from 'semver';

export function isPrerelease(version) {
  return version.includes('-');
}

function isPreMajor(version) {
  return semver.minor(version) === 0 && semver.patch(version) === 0 && semver.prerelease(version);
}

export function getNewVersion(lastTag, conventionalReleaseType, prerelease, lastProdTag) {
  if (!lastTag) {
    return prerelease ? '1.0.0-0' : '1.0.0';
  }

  if (isPreMajor(lastTag) && prerelease) {
    return semver.inc(lastTag, 'prerelease', prerelease);
  }

  const releaseType = getReleaseType(lastTag, conventionalReleaseType, prerelease, lastProdTag);

  return semver.inc(lastTag, releaseType, prerelease);
}

function getReleaseType(lastTag, conventionalReleaseType, prerelease, lastProdTag) {
  if (prerelease) {
    const prodBump = semver.inc(lastProdTag, conventionalReleaseType);
    if (semver.gte(lastTag.split('-')[0], prodBump) || (isPrerelease(lastTag) && conventionalReleaseType === 'patch')) {
      return 'prerelease';
    } else {
      return `pre${conventionalReleaseType}`;
    }
  } else {
    return conventionalReleaseType;
  }
}

export function getLatestRelease(releasesQueryResponse) {
  if (releasesQueryResponse.length === 0) {
    return null;
  }

  const releases = releasesQueryResponse.map((release) => release.node.tag.name);

  releases.sort((x, y) => (semver.gt(x, y) ? -1 : 1));

  return releases[0];
}
