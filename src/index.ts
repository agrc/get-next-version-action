import core from '@actions/core';
import github from '@actions/github';
import { Bumper, type BumperRecommendation } from 'conventional-recommended-bump';
import semver from 'semver';
import { getLatestRelease, getNewVersion, type GraphQLResponse } from './utils.js';

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

    const bumper = new Bumper(process.cwd()).loadPreset('angular');
    const recommendation = (await bumper.bump()) as BumperRecommendation;

    const prerelease = core.getBooleanInput('prerelease');

    // these are helpful in diagnosing issues and adding new test cases
    core.info(`latest tag: ${latestRelease ?? 'first release'}`);
    if (recommendation.releaseType) {
      core.info(`conventional release type ${recommendation.releaseType}`);
    } else {
      core.info('no conventional release type');
    }
    core.info(`prerelease: ${prerelease}`);
    core.info(`latest prod release: ${latestProdRelease}`);

    core.info(`current-version-number (output): ${currentVersion}`);

    const newVersion = getNewVersion(
      latestRelease,
      recommendation.releaseType,
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
