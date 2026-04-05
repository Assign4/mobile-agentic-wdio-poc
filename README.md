# Mobile WDIO (minimal)

WebdriverIO **Mocha** specs for native **Android / iOS**, plus official **`@wdio/mcp`** so Cursor can drive the app from chat. No Cucumber and no custom MCP server—configs, page objects, locators, env, Vitest unit tests, and a small **`patch-package`** patch on `@wdio/mcp` so `start_session` can complete demo login in one step.

**Open source:** [LICENSE](./LICENSE) (ISC). **Trademarks, demo APK, npm deps, patches:** read [THIRD_PARTY.md](./THIRD_PARTY.md) before you publish or redistribute. **Publishing the CLI:** [RELEASING.md](./RELEASING.md). **Pull requests:** [CONTRIBUTING.md](./CONTRIBUTING.md).

## Layout

```text
configs/           wdio.local.*.conf.ts, wdio.cloud.*.conf.ts, wdio.shared.ts
src/env.ts         dotenv-backed settings
src/specs/         *.spec.ts (Mocha)
src/pages/         small screen helpers
src/locators/      Android / iOS selectors
scripts/           android-env.sh, ensure-appium.mjs, mcp-with-appium.sh (Cursor MCP entry), ping-appium.mjs, run-mcp-android-smoke.sh
patches/           patch-package diff for @wdio/mcp (demo auto-login after start_session)
.cursor/rules/     wdio-mcp-mobile.mdc (agent: session + demo auto-login, Android/iOS app paths)
.cursor/mcp.json → `sh scripts/mcp-with-appium.sh` (do **not** use `npm run mcp:server` as the MCP command: npm prints to stdout and breaks JSON-RPC on stdio)
```

## Setup

1. Copy `.env.example` → `.env`.
2. Put apps under `apps/` or set `ANDROID_APP_PATH` / `IOS_APP_PATH`.
3. Install drivers: `npm run appium:driver:android` (and iOS if needed).

## Scaffold & environment check (`mobile-wdio-kit`)

The **`mobile-wdio-kit`** package (`packages/mobile-wdio-kit`) copies an embedded **template** of this repo, then runs **`npm install`**, **`patch-package`**, copies **`.env.example` → `.env`**, and downloads the **WebdriverIO demo Android APK** (APKs are not shipped inside the npm tarball).

**Where projects are created:** `create <path>` resolves the directory with Node’s `path.resolve()` from your **shell’s current working directory**—not from the global npm install location. So `mobile-wdio-kit create ~/Desktop/foo` creates on the Desktop regardless of whether you ran the command from `~/Projects` or elsewhere (and `~/...` works even inside quotes thanks to CLI tilde expansion).

```bash
npx mobile-wdio-kit@latest create ./my-mobile-tests
cd my-mobile-tests
npm run doctor
```

```bash
npm install -g mobile-wdio-kit   # after publish
mobile-wdio-kit create ./my-mobile-tests
```

From a **git clone** of this repo (path must include `mobile-agentic-wdio-poc`):

```bash
cd mobile-agentic-wdio-poc
npm install -g ./packages/mobile-wdio-kit
```

**Doctor** checks Node, Android SDK / `adb`, demo APK, `.env`, Appium drivers, Xcode/simctl (macOS), and Appium `/status`. Here: `npm run doctor` or `npm run setup:demo-android` (APK only). Generated apps use a **vendored** doctor so `npm install` does not require this package on the registry.

Maintainers: `npm run kit:sync`, then publish—see [RELEASING.md](./RELEASING.md) and [packages/mobile-wdio-kit/README.md](./packages/mobile-wdio-kit/README.md).

## CLI tests

```bash
npm run test:android    # ensures emulator if none online, then WDIO + Appium service
npm run test:ios        # local Appium; you provide simulator/device
npm run test:cloud:android
npm run test:cloud:ios
```

Demo credentials: `test@webdriver.io` / `Test1234!` (override with `MOBILE_USERNAME` / `MOBILE_PASSWORD`).

## Cursor / MCP (prompt-driven testing)

With the default `.cursor/mcp.json`, **Cursor starts the MCP server via `scripts/mcp-with-appium.sh`**. That script starts **Appium in the background** if nothing is listening on `APPIUM_HOST` / `APPIUM_PORT` (logs under `artifacts/appium-mcp.log`), then runs `wdio-mcp`. If no device is online, it **starts an AVD in the background** but does not wait for a cold boot (Cursor’s MCP client times out if the launcher blocks for minutes). Prefer `adb devices` showing `device` before you enable the MCP server, or wait for the emulator to finish booting before calling `start_session`.

**Do not** set the MCP command to `npm run mcp:server`: npm echoes script lines to stdout, which corrupts the MCP protocol and produces errors like `Unexpected token '>'` / `is not valid JSON`.

To run Appium yourself (e.g. debugging), use `npm run appium:start` or `npx appium --address 127.0.0.1 --port 4723` as before.

### 1. Emulator or device (when not using Cursor MCP)

```bash
adb devices   # should list one device/emulator as "device"
```

The MCP launcher runs the same check and can boot an AVD if none is online (see `scripts/android-env.sh`).

### 2. Confirm Appium is ready (optional)

```bash
npm run mcp:ping-appium
```

You should see `Appium ready at http://127.0.0.1:4723/status`.

### 3. Cursor

1. Open **this repo** as the workspace root (so `.cursor/mcp.json` `cwd` resolves correctly; if you use a multi-root workspace, set `cwd` in `.cursor/mcp.json` to the full path of this project).
2. **Cursor Settings → MCP**: ensure **wdio-mcp** is enabled (toggle on). Reload the window after changing MCP config so the new launcher runs.
3. Start an **Agent** chat with MCP allowed. The workspace rule **`.cursor/rules/wdio-mcp-mobile.mdc`** explains behavior. For this repo’s **WebdriverIO demo** Android APK / iOS `.app`, a **patched** `wdio-mcp` runs the login flow **inside** `start_session` (credentials from `.env`: `MOBILE_USERNAME` / `MOBILE_PASSWORD`; the launcher script sources `.env`). One prompt like “start session” is enough to be **logged in and past the success dialog**, ready to explore. To **skip** that behavior, set `WDIO_MCP_DEMO_AUTO_LOGIN=0` under `env` in `.cursor/mcp.json` and reload.

**Short example prompts**

```text
Start an Android session (use .env for app path, device, Appium).
```

```text
Launch the demo app on the emulator — I want to explore after login.
```

```text
Start an iOS session with the .app under apps/ (resolve IOS_APP_PATH from .env), then close_session when done.
```

**Explicit prompt (Android demo app)**

Use this when you want every capability spelled out. Replace `<ABSOLUTE_PATH_TO_REPO>` with the real path (e.g. from `pwd` in the project root). Match `deviceName` to `adb devices` (often `emulator-5554`).

```text
Use wdio-mcp tools only. Call start_session for Android with:
- appPath: <ABSOLUTE_PATH_TO_REPO>/apps/android.wdio.native.app.v2.0.0.apk
- deviceName: emulator-5554
- automationName: UiAutomator2
- autoGrantPermissions: true
- appiumConfig: host 127.0.0.1, port 4723, path /

Demo login runs inside start_session; use get_elements to explore. close_session when done.
```

**Explicit prompt (iOS simulator, `.app` bundle)**

Point `appPath` at the **directory** ending in `.app` (from `IOS_APP_PATH`, resolved to an absolute path). Set `platform: ios`, `automationName: XCUITest`, and `deviceName` to your simulator (e.g. from `IOS_DEVICE_NAME` in `.env`).

```text
Use wdio-mcp only. start_session: platform ios, automationName XCUITest, appPath <ABSOLUTE_PATH_TO_REPO>/apps/ios-demo.app, deviceName iPhone 15, appiumConfig host 127.0.0.1 port 4723 path /. Demo login runs inside start_session; close_session when done.
```

### 4. Test the MCP stack without Cursor

This starts Appium, runs the official MCP client over stdio, drives the same login flow, then stops Appium:

```bash
npm run test:mcp:android
```

### Manual server (debugging)

```bash
npm run mcp:server:with-appium   # same as Cursor: emulator + Appium + MCP
npm run mcp:server               # MCP only; Appium must already be running
```

Use these if you need to run the MCP server outside Cursor’s managed process.

## Validate (no device)

```bash
npm run validate
```

**Lint, format, and CI parity (no emulator):**

```bash
npm run ci:verify        # Prettier check + ESLint + TypeScript + Vitest (matches GitHub Actions + husky pre-push)
npm run lint             # ESLint only
npm run format           # Prettier --write
```

On **commit**, **lint-staged** runs ESLint + Prettier on staged files. On **push**, **husky** runs `npm run ci:verify`. **GitHub Actions** runs the same `ci:verify` job on pushes and pull requests to `main` / `master`.

## Failure artifacts

On a failed spec, WDIO saves `artifacts/screenshots/<test-title>.png` (see `configs/wdio.shared.ts`).
