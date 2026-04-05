# Releasing `mobile-wdio-kit` on npm

## Before the first publish

1. Confirm **`repository`**, **`homepage`**, **`bugs`**, and **`author`** in `packages/mobile-wdio-kit/package.json` match your public GitHub repo (update if you publish under a fork or org).
2. Confirm **`LICENSE`** at the repo root matches `license` in both `package.json` files (currently ISC).
3. Read **`THIRD_PARTY.md`** and ensure you are comfortable redistributing the template and documenting the demo APK source.

## Version bump

In `packages/mobile-wdio-kit/package.json`, bump `version` (semver).

## Refresh the template

From the **repository root**:

```bash
npm run kit:sync
```

Or from **`packages/mobile-wdio-kit`** (same script):

```bash
npm run kit:sync
```

Commit the updated `packages/mobile-wdio-kit/template/` if you version-control it.

## Publish

```bash
cd packages/mobile-wdio-kit
npm publish --access public
```

`prepack` runs `scripts/verify-template.mjs` and fails if `template/` is missing—run `kit:sync` first.

## Smoke test (local tarball)

```bash
cd packages/mobile-wdio-kit
npm pack
npm install -g ./mobile-wdio-kit-*.tgz
mobile-wdio-kit create /tmp/mwk-smoke --force
```

Then `cd /tmp/mwk-smoke && npm run doctor`.
