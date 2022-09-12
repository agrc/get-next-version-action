const core = require('@actions/core');
const github = require('@actions/github');
const conventionalRecommendedBump = require('conventional-recommended-bump');
require('conventional-changelog-angular'); // this is so that ncc includes it in the build
const { getNewVersion } = require('./utils.js');

async function run() {
  const pify = (await import('pify')).default;
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
          releases(last: 1) {
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

    core.debug(`graphql response ${data}`);

    let lastTag;
    const edges = data.repository.releases.edges;

    if (edges?.length > 0) {
      // will have v5.1.2-0 syntax
      lastTag = edges[0].node.tag.name;
    }

    core.info(`last tag ${lastTag ?? 'first release'}`);
    core.endGroup();

    // get release type recommendation based on conventional commits
    const { releaseType: conventionalReleaseType } = await pify(conventionalRecommendedBump)({
      preset: 'angular',
    });
    core.info(`conventional release type ${conventionalReleaseType}`);

    const prerelease = core.getBooleanInput('prerelease');
    const newVersion = getNewVersion(lastTag, conventionalReleaseType, prerelease);

    core.info(`prerelease: ${prerelease}`);
    core.info(`next version: ${newVersion}`);

    core.setOutput('version', newVersion);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
