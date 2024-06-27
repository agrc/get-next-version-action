import core from '@actions/core';
import github from '@actions/github';
import { Bumper } from 'conventional-recommended-bump';
import semver from 'semver';
import { getLatestRelease, getNewVersion } from './utils.js';

async function run() {
  try {
    core.startGroup('Finding last tag...');

    // get the last tag
    const octokit = github.getOctokit(core.getInput('repo-token'));

    const repo = process.env.ACT
      ? {
          // for testing locally with act
          owner: 'agrc',
          repo: 'get-next-version-action',
        }
      : {
          owner: github.context.payload.repository?.owner.login,
          repo: github.context.payload.repository?.name,
        };
    core.info(`querying tags for ${JSON.stringify(repo)}`);

    type GraphQLResponse = {
      repository: {
        releases: {
          edges: {
            node: {
              id: string;
              isPrerelease: boolean;
              tag: {
                name: string;
              };
            };
          }[];
        };
      };
    };

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

    core.info(`latest release ${latestRelease ?? 'first release'}`);
    core.endGroup();

    // pass an object rather than a string to make sure that it gets included in the build
    const bumper = new Bumper(process.cwd()).loadPreset('angular');
    const recommendation = await bumper.bump();
    core.info(`conventional release type ${recommendation.releaseType}`);

    const prerelease = core.getBooleanInput('prerelease');
    const newVersion = latestRelease
      ? getNewVersion(latestRelease, recommendation.releaseType as string, prerelease, latestProdRelease as string)
      : '1.0.0';

    core.info(`prerelease: ${prerelease}`);
    core.info(`next version: ${newVersion}`);

    core.setOutput('version', newVersion);
    if (newVersion) {
      core.setOutput('major', semver.major(newVersion));
      core.setOutput('minor', semver.minor(newVersion));
      core.setOutput('patch', semver.patch(newVersion));
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
