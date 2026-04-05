# mobile-wdio-kit

CLI to **scaffold** a WebdriverIO + Appium mobile test project (Android/iOS, optional Cursor MCP wiring, Vitest, `patch-package`) and run **`doctor`** for an environment preflight.

- **License:** [LICENSE](./LICENSE) (ISC).
- **Third-party & trademarks:** each scaffolded project includes `THIRD_PARTY.md` (vendored from the monorepo root when maintainers run `npm run kit:sync`). Read it before redistributing the demo APK or publishing derivative work.

> Before `npm publish`, confirm `package.json` `repository` / `bugs` / `homepage` match your public repo. See [RELEASING.md](../../RELEASING.md).

## Install

```bash
npm install -g mobile-wdio-kit
```

Or use **npx** (no global install):

```bash
npx mobile-wdio-kit@latest create ./my-mobile-tests
```

## `create <directory>`

Copies the embedded template, sets `package.json` `name` from the folder (or `--name`), copies `.env.example` → `.env`, runs **`npm install`** (runs **`patch-package`**), then downloads the **WebdriverIO demo Android APK** unless `--no-demo-apk`.

**Path rules:** the directory is resolved with `path.resolve()` from your **current working directory** (where you run the command), not from the global npm package path. Relative paths (`./foo`), absolute paths (`/tmp/foo`), and `~/foo` (tilde expanded by your shell or by the CLI) are supported.

| Option          | Meaning                          |
| --------------- | -------------------------------- |
| `--force`       | Overwrite a non-empty directory. |
| `--no-install`  | Skip `npm install`.              |
| `--no-demo-apk` | Skip demo APK download.          |
| `--name <name>` | Override `package.json` `name`.  |

## `doctor`

Checks Node (≥ 18), npm, Android SDK / `adb`, `JAVA_HOME`, demo APK, `.env`, local Appium + drivers, Xcode/simctl (macOS), and Appium `/status`. Exit code **1** only if a **required** check fails (Node version). Warnings are **!** and still exit **0**.

| Option               | Meaning                                  |
| -------------------- | ---------------------------------------- |
| `--cwd <path>`       | Project root (default: `process.cwd()`). |
| `--json`             | JSON on stdout.                          |
| `--appium-url <url>` | Override `/status` URL.                  |

In generated projects, **`npm run doctor`** uses a **vendored** script (no registry dependency on this package).

## Maintainers (monorepo)

```bash
npm run kit:sync    # repo root: refresh template/
cd packages/mobile-wdio-kit && npm publish --access public
```

`prepack` fails if `template/` is missing—run `kit:sync` first.
