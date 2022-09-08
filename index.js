const core = require('@actions/core');
const github = require('@actions/github');
const conventionalRecommendedBump = require('conventional-recommended-bump');
const { getNewVersion } = require('./utils.js');

async function run() {
  try {
    core.startGroup('Finding last tag...');

    // get the last tag
    const octokit = github.getOctokit(core.getInput('repoToken'));

    const repo = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    };
    core.info('querying tags for ', repo);

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

    core.debug('graphql response', data);

    let lastTag;
    const edges = data.repository.releases.edges;

    if (edges?.length > 0) {
      // will have v5.1.2-0 syntax
      lastTag = edges[0].node.tag.name;
    }

    core.info('last tag', lastTag);
    core.endGroup();

    core.startGroup('Finding recommended version...');
    // get release type recommendation based on conventional commits
    const { releaseType: conventionalReleaseType } = await conventionalRecommendedBump({
      preset: 'angular',
    });
    core.endGroup();

    const prerelease = core.getBooleanInput('prerelease');

    core.setOutput('version', getNewVersion(lastTag, conventionalReleaseType, prerelease));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
