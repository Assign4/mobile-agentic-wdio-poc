# Contributing

## Pull request merge requirements

A pull request may be merged into `main` only when all of the following are true:

1. **At least one approving review** from the maintainer (you). To require your approval specifically on GitHub, add a [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) file and turn on **Require review from Code Owners** in branch protection.
2. **All review comments are resolved** (no open conversations on the PR).
3. **CI passes** — the workflow runs `npm run ci:verify` (format, lint, typecheck, unit tests). The required status check name in GitHub is typically **`CI / verify`**.

## Enforcing this on GitHub

In the repository: **Settings → Branches → Branch protection rule** for `main`:

- Enable **Require a pull request before merging**.
- **Required approvals:** 1 (or use Code Owners if only you should count).
- Enable **Require conversation resolution before merging**.
- Under **Status checks that are required**, add **`CI / verify`** (or select it from the list after the workflow has run at least once on a PR).

These settings complement this document; they are not stored in the git tree.
