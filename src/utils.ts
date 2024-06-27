import semver from 'semver';

export function isPrerelease(version: string): boolean {
  return version.includes('-');
}

function isMajorPrerelease(version: string): boolean {
  return !!(semver.minor(version) === 0 && semver.patch(version) === 0 && semver.prerelease(version));
}

export function getNewVersion(
  lastTag: string | null,
  conventionalReleaseType: string,
  prerelease: boolean,
  lastProdTag: string | null,
): string | null {
  if (!lastTag) {
    return prerelease ? '1.0.0-0' : '1.0.0';
  }

  /* If the last tag was a major prerelease, we shouldn't
  bump anything but the prerelease number. For example, if the
  last tag was 2.0.0-0 and this is a minor bump, we should
  return 2.0.0-1, not 2.1.0-0
  */
  if (isMajorPrerelease(lastTag) && prerelease) {
    return semver.inc(lastTag, 'prerelease', prerelease);
  }

  const releaseType = getReleaseType(lastTag, conventionalReleaseType, prerelease, lastProdTag);

  return semver.inc(lastTag, releaseType, prerelease);
}

function getReleaseType(
  lastTag: string,
  conventionalReleaseType: string,
  prerelease: boolean,
  lastProdTag: string | null,
): semver.ReleaseType {
  if (prerelease) {
    if (!lastProdTag) {
      return 'prerelease';
    }
    const prodBump = semver.inc(lastProdTag ?? '', conventionalReleaseType as semver.ReleaseType);
    if (
      semver.gte(lastTag.split('-')[0], prodBump || '') ||
      (isPrerelease(lastTag) && conventionalReleaseType === 'patch')
    ) {
      return 'prerelease';
    } else {
      return `pre${conventionalReleaseType as 'major' | 'minor' | 'patch'}`;
    }
  } else {
    return conventionalReleaseType as semver.ReleaseType;
  }
}

export function getLatestRelease(releasesQueryResponse: any[]): string | null {
  if (releasesQueryResponse.length === 0) {
    return null;
  }

  const releases = releasesQueryResponse.map((release) => release.node.tag.name);

  releases.sort((x, y) => (semver.gt(x, y) ? -1 : 1));

  return releases[0];
}
