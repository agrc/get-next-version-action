# Get Next Version Action

[![units-test](https://github.com/agrc/get-next-version-action/actions/workflows/test.yml/badge.svg)](https://github.com/agrc/get-next-version-action/actions/workflows/test.yml)

A GitHub Action for getting the proposed next version of a project for release based on [conventional commits](https://www.conventionalcommits.org).

## Usage

```yaml
uses: ugrc/get-next-version-action@v1
with:
  prerelease: true
  repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Package for distribution

This action is built and distributed via the included GitHub action workflows.
