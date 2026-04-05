# mobile-wdio-kit

CLI to **scaffold** a WebdriverIO + Appium mobile test project (Android/iOS, optional Cursor MCP wiring, Vitest, `patch-package`) and run **`doctor`** for an environment preflight.

- **License:** [LICENSE](./LICENSE) (ISC).
- **Changelog / release notes:** [CHANGELOG.md](./CHANGELOG.md).
- **Third-party & trademarks:** each scaffolded project includes `THIRD_PARTY.md` (vendored from the monorepo root when maintainers run `npm run kit:sync`). Read it before redistributing the demo APK / iOS app or publishing derivative work.

> Before `npm publish`, confirm `package.json` `repository` / `bugs` / `homepage` match your public repo. See [RELEASING.md](../../RELEASING.md).

## Install

```bash
npm install -g mobile-wdio-kit
```

Or use **npx** (no global install):

```bash
npx mobile-wdio-kit@latest create ./my-mobile-tests
```

## CLI output (colors & progress)

When stderr is a **TTY** and **CI** is not set to `1` / `true`:

- **Help** and **create** use **syntax-colored** headings and status lines (`picocolors`).
- **Create** shows an **ora** spinner while copying the template; for **long steps** (`npm install`, demo APK / iOS downloads) the spinner **hands off to full subprocess output** (stdio inherited) so you see real npm / download logs, then a short **success line** on stderr.
- **`doctor`** (human mode, not `--json`) prints a **colorized** checklist (✓ / ! / ✗ and cyan fix hints).

Disable styling when needed:

| Variable      | Effect                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NO_COLOR`    | No ANSI colors (CLI and doctor both respect this where used).                                                             |
| `CI=1`        | Spinners are skipped; plain progress lines only.                                                                          |
| `FORCE_COLOR` | Picocolors may still enable colors in some environments (see [picocolors](https://github.com/alexeyraspopov/picocolors)). |

`--json` for **doctor** stays machine-readable (no color codes on the JSON).

## Preflight before `create`

Before copying files, **create** verifies:

1. **Node.js ≥ 18**
2. **`npm` on PATH** (needed for `npm install` in the new project)
3. **Template present** (`template/package.json` next to the published kit)

If something fails, the CLI exits with a short message that includes **what to run** (for example, from a git checkout: `npm run kit:sync` if the template is missing).

## `create <directory>`

Copies the embedded template, sets `package.json` `name` from the folder (or `--name`), copies `.env.example` → `.env`, runs **`npm install`** (runs **`patch-package`**), then downloads the **WebdriverIO demo Android APK** unless `--no-demo-apk`. On **macOS**, it also downloads the **demo iOS Simulator `.app`** unless `--no-demo-ios`.

**Path rules:** the directory is resolved with `path.resolve()` from your **current working directory** (where you run the command), not from the global npm package path. Relative paths (`./foo`), absolute paths (`/tmp/foo`), and `~/foo` (tilde expanded by your shell or by the CLI) are supported.

| Option          | Meaning                            |
| --------------- | ---------------------------------- |
| `--force`       | Overwrite a non-empty directory.   |
| `--no-install`  | Skip `npm install`.                |
| `--no-demo-apk` | Skip demo APK download.            |
| `--no-demo-ios` | Skip demo iOS `.app` (macOS only). |
| `--name <name>` | Override `package.json` `name`.    |

## `doctor`

Checks Node (≥ 18), npm, Android SDK / `adb`, `JAVA_HOME`, demo APK, demo iOS `.app` (macOS), `.env`, local Appium + drivers, Xcode/simctl (macOS), and Appium `/status`. Exit code **1** only if a **required** check fails (Node version). Warnings are **!** and still exit **0**.

| Option               | Meaning                                  |
| -------------------- | ---------------------------------------- |
| `--cwd <path>`       | Project root (default: `process.cwd()`). |
| `--json`             | JSON on stdout.                          |
| `--appium-url <url>` | Override `/status` URL.                  |

In generated projects, **`npm run doctor`** uses **vendored** scripts under `scripts/` (**`mobile-wdio-doctor-core.mjs`**, **`doctor-format.mjs`**, **`doctor-cli.mjs`**) so there is no registry dependency on this package for checks. Vendored doctor uses **`picocolors`** from the scaffolded project’s `devDependencies` (copied from the monorepo template).

## Runtime dependencies (npm package)

The published **`mobile-wdio-kit`** package declares **`ora`** and **`picocolors`** as **dependencies** (CLI UX). They are not required in generated projects for **`mobile-wdio-kit create`** itself beyond what the template already lists for **doctor**.

## Maintainers (monorepo)

```bash
npm run kit:sync    # repo root: refresh template/ + vendor doctor + doctor-format into template/scripts/
```

Inside **`packages/mobile-wdio-kit`**:

```bash
npm run test:unit   # node --test test/*.test.mjs (CLI theme, preflight, doctor format, spinners)
```

Publish:

```bash
cd packages/mobile-wdio-kit && npm publish --access public
```

**`prepack`** runs, in order:

1. **`verify-template.mjs`** — template exists
2. **`node --test test/*.test.mjs`** — kit unit tests
3. **`verify-create-noninteractive.mjs`** — non-interactive create smoke (`--no-install`)

So **`prepack` fails** if `template/` is missing, tests fail, or create verify fails—run **`npm run kit:sync`** from the repo root first when developing the template.

**Repo root CI** also runs **`npm run test:kit:lib`** (same unit tests) and **`npm run test:kit:create`** as part of **`npm run ci:verify`**.
