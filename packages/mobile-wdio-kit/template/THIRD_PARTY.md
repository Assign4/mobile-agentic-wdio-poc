# Third-party software, trademarks, and demo assets

This document is for **attribution and transparency**. It is **not legal advice**. If you ship a product or publish a package, have your own counsel review licenses and trademark use.

## Trademarks

- **WebdriverIO**, **Appium**, and related marks belong to their respective owners (e.g. OpenJS Foundation / project communities).
- **Android** is a trademark of Google LLC.
- **Apple**, **iOS**, **Xcode**, and **Simulator** are trademarks of Apple Inc.
- **Cursor** is a trademark of Anysphere, Inc.
- **LambdaTest** is a trademark of LambdaTest Inc.

This project is **not affiliated with, endorsed by, or sponsored by** those organizations unless explicitly stated. Use their marks only in ways that comply with their brand guidelines.

## Demo Android application (APK)

The optional setup script downloads the **WebdriverIO native demo app** binary from the upstream project (default URL is defined in `scripts/download-demo-android.mjs`). That app and its branding are subject to **their** license and terms—not this repo’s `LICENSE` file.

- Source / releases: [webdriverio/native-demo-app](https://github.com/webdriverio/native-demo-app)

Verify the license in that repository before redistributing the APK or using it in commercial contexts.

## Demo iOS Simulator application (.app)

The optional **`npm run setup:demo-ios`** script downloads a **zip** from the same upstream project (default URL in `scripts/download-demo-ios.mjs`), extracts the Simulator `.app`, and installs it as `apps/ios-demo.app` for local runs and MCP. That binary is subject to **their** license and terms.

- Source / releases: [webdriverio/native-demo-app](https://github.com/webdriverio/native-demo-app)

## npm dependencies

Runtime and development dependencies (WebdriverIO, Appium, drivers, Vitest, `patch-package`, etc.) are each licensed under **their own** terms (MIT, Apache-2.0, and others). After `npm install`, see each package’s `LICENSE` or `package.json` `license` field, or run:

```bash
npx license-checker --summary
```

(Install `license-checker` globally or use another SBOM tool you prefer.)

## Patch applied to `@wdio/mcp`

This repo includes a **`patch-package`** patch under `patches/` that modifies `@wdio/mcp` in `node_modules` after install. The **original `@wdio/mcp` code** remains under its upstream license; the patch is a derivative change applied on your machine at install time. Keep the patch file and this notice if you redistribute a project that relies on it.

## `mobile-wdio-kit` npm package

The `packages/mobile-wdio-kit` package **bundles a template** copied from this repository (configs, scripts, tests, etc.) and **vendored doctor scripts**. Publishing that tarball does not transfer ownership of third-party code; attribution and upstream licenses still apply as above.
