# Get Next Version Action

[![codecov](https://codecov.io/gh/agrc/get-next-version-action/branch/main/graph/badge.svg?token=ImA9Wme6pQ)](https://codecov.io/gh/agrc/get-next-version-action)
[![Push Events](https://github.com/agrc/get-next-version-action/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/get-next-version-action/actions/workflows/push.yml)
[![Pull Request Events](https://github.com/agrc/get-next-version-action/actions/workflows/pull_request.yml/badge.svg)](https://github.com/agrc/get-next-version-action/actions/workflows/pull_request.yml)

A GitHub Action for getting the proposed next version of a project for release based on the [Angular preset for conventional commits](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format).

## Usage

```yaml
uses: ugrc/get-next-version-action@v1
with:
  prerelease: true
  repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Package for distribution

This action is built and distributed via the included GitHub action workflows.

## Development

The [act project](https://github.com/nektos/act) can be helpful for testing locally with a command something like this: `act -j test-functional -s GITHUB_TOKEN="$(gh auth token)"`.

## Attribution

This project was developed with the assistance of [GitHub Copilot](https://github.com/features/copilot).
