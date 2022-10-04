# Get Next Version Action

[![Tests](https://github.com/agrc/get-next-version-action/actions/workflows/tests.yml/badge.svg)](https://github.com/agrc/get-next-version-action/actions/workflows/tests.yml)
[![Push Events](https://github.com/agrc/get-next-version-action/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/get-next-version-action/actions/workflows/push.yml)
[![Pull Request Events](https://github.com/agrc/get-next-version-action/actions/workflows/pull-request.yml/badge.svg)](https://github.com/agrc/get-next-version-action/actions/workflows/pull-request.yml)

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
