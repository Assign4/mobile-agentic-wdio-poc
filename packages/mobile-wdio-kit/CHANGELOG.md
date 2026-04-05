# Changelog

All notable changes to **mobile-wdio-kit** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-04-06

### Changed

- Republished the latest CLI, template, iOS scaffolding, and documentation updates under a new patch version because `0.2.0` was already on npm.

## [0.2.0] - 2026-04-05

### Added

- **Colored CLI** for `create`, `doctor`, and `--help` using [picocolors](https://github.com/alexeyraspopov/picocolors) (headings, status lines, errors).
- **Progress spinners** ([ora](https://github.com/sindresorhus/ora)) for fast steps (e.g. template copy); for **long-running** work (`npm install`, demo APK / iOS downloads) spinners stop first so **full subprocess output** is visible, then a short success line on stderr.
- **Create preflight** before copying files: Node.js ≥ 18, `npm` on PATH, and embedded template present—failures include **actionable fix text** (e.g. run `npm run kit:sync` when developing from git).
- **Colorized human `doctor` output** via `lib/doctor-format.mjs`; `--json` unchanged (no ANSI in JSON).
- **Vendored `doctor-format.mjs`** in generated projects under `scripts/` (synced from the monorepo with `npm run kit:sync`).
- **Runtime dependencies** on the published package: `ora`, `picocolors`.
- **Unit tests** (`node --test`) under `test/` for CLI theme, preflight, doctor formatting, and spinner/CI behavior.
- **`prepack`** now runs **unit tests** after template verification and before non-interactive create verification.
- **Documentation** updates in the kit README, root README, `CONTRIBUTING.md`, `RELEASING.md`, and `THIRD_PARTY.md`.

### Changed

- **Environment behavior:** `NO_COLOR` disables colors where applied; `CI=1` (or `CI=true`) skips spinners for cleaner CI logs.

### Notes for consumers

- Scaffolded projects still run **`npm run doctor`** from vendored scripts; ensure **`picocolors`** remains available in the template (monorepo `devDependencies` are copied on `kit:sync`).
- Monorepo **CI** runs `npm run test:kit:lib` and `npm run test:kit:create` as part of `npm run ci:verify`.

## [0.1.0] - earlier

Initial published release: template-based `create`, `doctor`, demo Android APK / iOS app download flow, and vendored doctor runner in generated projects.

[0.2.1]: https://www.npmjs.com/package/mobile-wdio-kit/v/0.2.1
[0.2.0]: https://www.npmjs.com/package/mobile-wdio-kit/v/0.2.0
[0.1.0]: https://www.npmjs.com/package/mobile-wdio-kit/v/0.1.0
