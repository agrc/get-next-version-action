const core = require('@actions/core');
const github = require('@actions/github');
const conventionalRecommendedBump = require('conventional-recommended-bump');
const angularPreset = require('conventional-changelog-angular');
const { getNewVersion, getLatestRelease } = require('./utils.js');

async function run() {
  try {
    core.startGroup('Finding last tag...');

    // get the last tag
    const octokit = github.getOctokit(core.getInput('repo-token'));

    const repo = {
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
                tag {
                  name
                }
              }
            }
          }
        }
      }
      `,
      repo
    );

    core.debug(`graphql response: ${JSON.stringify(data, null, 2)}`);

    const latestRelease = getLatestRelease(data.repository.releases.edges);

    core.info(`latest release ${latestRelease ?? 'first release'}`);
    core.endGroup();

    // get release type recommendation based on conventional commits
    const { releaseType: conventionalReleaseType } = await conventionalRecommendedBump({
      // pass an object rather than a string to make sure that it gets included in the build
      config: angularPreset,
    });
    core.info(`conventional release type ${conventionalReleaseType}`);

    const prerelease = core.getBooleanInput('prerelease');
    const newVersion = getNewVersion(latestRelease, conventionalReleaseType, prerelease);

    core.info(`prerelease: ${prerelease}`);
    core.info(`next version: ${newVersion}`);

    core.setOutput('version', newVersion);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
