# Implementation Plan: Release Automation and Quality Control

This plan outlines the architecture, configuration, and workflows to convert the Norix repository into a production-grade open-source project.

## 1. Recommendations for Release Automation

We recommend using **Changesets** as the release automation framework for Norix.

### Why Changesets?

- **Maintainer Control**: It avoids accidental releases. Instead of publishing on every commit to `main` (like `semantic-release`), Changesets pools changes and opens a rolling "Version Packages" pull request. Merging this PR triggers the release.
- **Human-Readable Changelogs**: Contributors can write clear, human-focused explanations of their changes rather than relying solely on raw git commit messages.
- **Industry Standard**: It is the default release tool for modern TypeScript projects in the JS ecosystem (e.g., `pnpm`, `tsup`, `Vite`, `Turbo`, `Chakra UI`).

---

## 2. Proposed Changes

We will introduce the following files and configurations:

### CI/CD Workflows

#### [NEW] [dependabot.yml](file:///c:/Me/packages/norix/.github/dependabot.yml)

- Configures weekly dependency updates for npm packages and GitHub Actions.

#### [NEW] [codeql.yml](file:///c:/Me/packages/norix/.github/workflows/codeql.yml)

- Runs automated CodeQL static analysis scans to detect security vulnerabilities (e.g., path traversal, code injection).

#### [MODIFY] [ci.yml](file:///c:/Me/packages/norix/.github/workflows/ci.yml)

- Updates the CI pipeline to run:
  1. `npm run typecheck`
  2. `npm run lint` (using new ESLint setup)
  3. `npm run build`
  4. `npm run test` (with Vitest test execution)

#### [MODIFY] [release.yml](file:///c:/Me/packages/norix/.github/workflows/release.yml)

- Migrates from the manual tag-push trigger to a fully automated workflow powered by Changesets.
- When run on `main`, it handles:
  1. Creating/updating the rolling "Version Packages" release PR.
  2. Building the project, updating version numbers, creating Git tags, and generating `CHANGELOG.md`.
  3. Publishing to npm (via OIDC / Trusted Publishing) and creating a GitHub Release with compiled tarball assets.

---

### Configurations & Project Setup

#### [NEW] [config.json](file:///c:/Me/packages/norix/.changeset/config.json)

- Configures Changesets behavior: access control, base branch (`main`), changelog formatter (`@changesets/cli/changelog`), and commit linking.

#### [NEW] [eslint.config.js](file:///c:/Me/packages/norix/eslint.config.js)

- Sets up a modern ESLint flat configuration using `@eslint/js` and `typescript-eslint` to enforce code quality before builds.

#### [MODIFY] [package.json](file:///c:/Me/packages/norix/package.json)

- Adds devDependencies: `@changesets/cli`, `eslint`, and `typescript-eslint`.
- Adds scripts:
  - `"lint"`: Runs ESLint.
  - `"changeset"`: Helper to declare changes.
  - `"version"`: Runs changeset versioning.
  - `"release"`: Build and publish packages via Changesets.

---

### Documentation

#### [MODIFY] [README.md](file:///c:/Me/packages/norix/README.md)

- Inserts modern badges at the top of the README:
  - Build Status (GitHub Actions)
  - CodeQL Scanning Status
  - npm version
  - npm downloads
  - Test Coverage (using a Vitest badge or mock representation)
- Adds the **Project Status** section.

#### [NEW] [RELEASE_MIGRATION.md](file:///c:/Me/packages/norix/RELEASE_MIGRATION.md)

- A step-by-step guide for maintainers on migrating from the current manual flow to the new Changesets workflow. Includes branch protection settings and npm token configuration.

---

## 3. Verification Plan

### Automated Verification

- Run `npm run ci` locally to ensure typechecking, linting, building, and tests pass.
- Validate the YAML syntax of all workflow files using local parsing checks.

### Manual Review

- Confirm the OIDC Trusted Publisher settings in the npm account for `norix-cli`.
