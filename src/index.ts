import core from '@actions/core';
import github from '@actions/github';
import { Bumper } from 'conventional-recommended-bump';
import semver from 'semver';
import { getLatestRelease, getNewVersion } from './utils.js';

export type GraphQLResponse = {
  repository: { releases: { edges: { node: { id: string; isPrerelease: boolean; tag: { name: string } | null } }[] } };
};

async function run() {
  try {
    core.info('Finding last tag...');

    // get the last tag
    const octokit = github.getOctokit(core.getInput('repo-token'));

    const repo = process.env.ACT
      ? {
          // for testing locally with act
          owner: 'agrc',
          repo: 'get-next-version-action',
        }
      : { owner: github.context.payload.repository?.owner.login, repo: github.context.payload.repository?.name };
    core.info(`querying tags for ${JSON.stringify(repo)}`);

    const data: GraphQLResponse = await octokit.graphql(
      `
      query lastTags($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          releases(first: 100, orderBy: {field: NAME, direction: DESC}) {
            edges {
              node {
                id
                isPrerelease
                tag {
                  name
                }
              }
            }
          }
        }
      }
      `,
      repo,
    );

    core.debug(`graphql response: ${JSON.stringify(data, null, 2)}`);

    const latestRelease = getLatestRelease(data.repository.releases.edges);
    const latestProdRelease = getLatestRelease(
      data.repository.releases.edges.filter((release) => !release.node.isPrerelease),
    );
    const currentVersion = latestRelease?.slice(1);

    core.setOutput('current-version-number', currentVersion);

    // pass an object rather than a string to make sure that it gets included in the build
    const bumper = new Bumper(process.cwd()).loadPreset('angular');
    const recommendation = await bumper.bump();

    const prerelease = core.getBooleanInput('prerelease');

    // these are helpful in diagnosing issues and adding new test cases
    core.info(`latest tag: ${latestRelease ?? 'first release'}`);
    core.info(`conventional release type ${recommendation.releaseType}`);
    core.info(`prerelease: ${prerelease}`);
    core.info(`latest prod release: ${latestProdRelease}`);

    core.info(`current-version-number (output): ${currentVersion}`);

    const newVersion = getNewVersion(
      latestRelease,
      recommendation.releaseType as string,
      prerelease,
      latestProdRelease as string,
    );

    core.info(`version (output): ${newVersion}`);

    core.setOutput('version', newVersion);
    if (newVersion) {
      core.setOutput('major', semver.major(newVersion));
      core.setOutput('minor', semver.minor(newVersion));
      core.setOutput('patch', semver.patch(newVersion));
    }
  } catch (error: unknown) {
    core.setFailed((error as Error).message);
  }
}

run();
