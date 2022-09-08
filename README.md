# Get Next Version

[![units-test](https://github.com/agrc/get-next-version/actions/workflows/test.yml/badge.svg)](https://github.com/agrc/get-next-version/actions/workflows/test.yml)

A GitHub Action for getting the proposed next version of a project for release based on [conventional commits](https://www.conventionalcommits.org).

## Usage

```yaml
uses: ugrc/get-next-version@v1
with:
  prerelease: true
  repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos. Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
