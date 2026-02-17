# Copilot Instructions for get-next-version-action

## Project purpose
- This repository is a JavaScript GitHub Action that computes the next semantic version from conventional commits using the Angular preset.
- Action metadata and runtime contract are in `action.yml` (Node 24 runtime, outputs: `version`, `major`, `minor`, `patch`, `current-version-number`).

## Core architecture and flow
- Entry point is `src/index.ts`; keep orchestration there and keep version rules in `src/utils.ts`.
- `src/index.ts` flow:
  1. Build Octokit from `repo-token`.
  2. Query releases via GraphQL (`repository.releases(first: 100, orderBy: NAME DESC)`).
  3. Derive latest overall + latest production release using `getLatestRelease(...)`.
  4. Get recommended bump via `new Bumper(process.cwd()).loadPreset('angular').bump()`.
  5. Compute final version via `getNewVersion(...)` and set action outputs.
- `src/utils.ts` is the domain logic boundary. Keep all prerelease/prod edge-case handling there.

## Versioning conventions specific to this repo
- Prerelease identifier is always `rc` (e.g. `1.2.3-rc.1`), including normalization from legacy `-1` form.
- First release behavior is intentional:
  - no tags + prerelease => `1.0.0-rc.1`
  - no tags + non-prerelease => `1.0.0`
- If latest tag is a major prerelease (e.g. `2.0.0-rc.1`) and `prerelease=true`, only bump prerelease number even if conventional bump is minor/patch.
- For production releases, compute from latest production tag, not latest prerelease tag.

## Tests and validation workflow
- Main tests are table-driven Vitest cases in `src/utils.test.ts`; extend the `cases` arrays for new versioning rules.
- Run targeted checks before proposing changes:
  - `pnpm test` (coverage enabled by default)
  - `pnpm check` (TypeScript build check)
  - `pnpm lint`

## Build and packaging workflow (important)
- Distribution entrypoint is `dist/index.js` built by Rollup (`rollup.config.ts`) from `src/index.ts` as ESM.
- Do not remove the `support/setup-dist.sh` + template copy behavior in `package.json` `build` script:
  - it pre-installs `conventional-changelog-angular` into `dist/`
  - then copies `conventional-changelog-angular/src/templates/**` into `dist/templates`
- This packaging quirk exists because bundling the angular preset/templates directly has been unreliable.

## Practical editing guidance
- Keep logging and outputs in `src/index.ts` aligned with current diagnostic style (`core.info` around computed values).
- Preserve `GraphQLResponse` shape in `src/utils.ts` unless the GraphQL query changes too.
- Prefer minimal, behavior-focused changes and add/adjust explicit regression cases in `src/utils.test.ts` for every edge case fix.
