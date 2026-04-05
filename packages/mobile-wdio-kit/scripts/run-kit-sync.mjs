#!/usr/bin/env node
/**
 * Runs the repo-root sync script when developing inside the monorepo clone.
 * Not available from the published npm tarball (by design).
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..", "..");
const syncScript = resolve(repoRoot, "scripts", "sync-template-to-kit.mjs");

if (!existsSync(syncScript)) {
  console.error(
    "kit:sync only works in a git clone of the mobile-agentic-wdio-poc monorepo.\n" +
      "From the repository root run: npm run kit:sync",
  );
  process.exit(1);
}

const r = spawnSync(process.execPath, [syncScript], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env,
});
process.exit(r.status ?? 1);
