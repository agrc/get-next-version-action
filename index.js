import core from '@actions/core';
import github from '@actions/github';
import angularPreset from 'conventional-changelog-angular';
import { Bumper } from 'conventional-recommended-bump';
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
          owner: github.context.payload.repository.owner.login,
          repo: github.context.payload.repository.name,
        };
    core.info(`querying tags for ${JSON.stringify(repo)}`);

    const data = await octokit.graphql(
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
    const preset = await angularPreset();
    const bumper = new Bumper(process.cwd()).loadPreset({
      ...preset,
      name: 'angular',
    });
    const recommendation = await bumper.bump();
    core.info(`conventional release type ${recommendation.releaseType}`);

    const prerelease = core.getBooleanInput('prerelease');
    const newVersion = getNewVersion(latestRelease, recommendation.releaseType, prerelease, latestProdRelease);

    core.info(`prerelease: ${prerelease}`);
    core.info(`next version: ${newVersion}`);

    core.setOutput('version', newVersion);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
