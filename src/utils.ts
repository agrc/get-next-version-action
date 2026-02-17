import semver from 'semver';

export type GraphQLResponse = {
  repository: { releases: { edges: { node: { id: string; isPrerelease: boolean; tag: { name: string } | null } }[] } };
};

export function isPrerelease(version: string): boolean {
  return version.includes('-');
}

function isMajorPrerelease(version: string): boolean {
  return !!(semver.minor(version) === 0 && semver.patch(version) === 0 && semver.prerelease(version));
}

const identifier = 'rc';

function normalizeReleaseType(conventionalReleaseType: string | null | undefined): 'major' | 'minor' | 'patch' | null {
  if (
    conventionalReleaseType === 'major' ||
    conventionalReleaseType === 'minor' ||
    conventionalReleaseType === 'patch'
  ) {
    return conventionalReleaseType;
  }

  return null;
}

export function getNewVersion(
  lastTag: string | null,
  conventionalReleaseType: string | null | undefined,
  prerelease: boolean,
  lastProdTag: string | null,
): string | null {
  if (!lastTag) {
    return prerelease ? '1.0.0-rc.1' : '1.0.0';
  }

  if (!prerelease && !lastProdTag) {
    return '1.0.0';
  }

  lastTag = lastTag.replace(/-(\d+)$/, '-rc.$1');

  /* If the last tag was a major prerelease, we shouldn't
  bump anything but the prerelease number. For example, if the
  last tag was 2.0.0-rc.1 and this is a minor bump, we should
  return 2.0.0-rc.2, not 2.1.0-rc.1
  */
  if (isMajorPrerelease(lastTag) && prerelease) {
    return semver.inc(lastTag, 'prerelease', {}, identifier, '1');
  }

  const releaseType = getReleaseType(lastTag, conventionalReleaseType, prerelease, lastProdTag);
  const baseVersion = prerelease ? lastTag : lastProdTag;

  return semver.inc(baseVersion!, releaseType, {}, identifier, '1');
}

function getReleaseType(
  lastTag: string,
  conventionalReleaseType: string | null | undefined,
  prerelease: boolean,
  lastProdTag: string | null,
): semver.ReleaseType {
  const releaseType = normalizeReleaseType(conventionalReleaseType);

  if (prerelease) {
    if (!lastProdTag || !releaseType) {
      return 'prerelease';
    }

    const prodBump = semver.inc(lastProdTag, releaseType);

    if (!prodBump) {
      return 'prerelease';
    }

    if (semver.gte(lastTag.split('-')[0] || lastTag, prodBump) || (isPrerelease(lastTag) && releaseType === 'patch')) {
      return 'prerelease';
    } else {
      return `pre${releaseType}`;
    }
  } else {
    return releaseType ?? 'patch';
  }
}

export function getLatestRelease(
  releasesQueryResponse: GraphQLResponse['repository']['releases']['edges'],
): string | null {
  const releases = releasesQueryResponse
    .filter((release) => release.node.tag && semver.valid(release.node.tag.name))
    .map((release) => release.node.tag!.name);

  if (releases.length === 0) {
    return null;
  }

  releases.sort((x, y) => (semver.gt(x, y) ? -1 : 1));

  return releases[0]!;
}
