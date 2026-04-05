#!/usr/bin/env node
/**
 * Ensures `mobile-wdio-kit create` never waits on stdin (CI / automation safe).
 * Runs the real CLI with stdio[0] = ignore and skips npm + demo downloads for speed.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const kitRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(kitRoot, "bin", "cli.mjs");
const targetDir = mkdtempSync(join(tmpdir(), "mwk-nc-"));

function kebabName(raw) {
  return (
    String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "") || "mobile-wdio-project"
  );
}

const expectedName = kebabName(basename(targetDir));

const r = spawnSync(
  process.execPath,
  [cli, "create", targetDir, "--no-install", "--no-demo-apk", "--no-demo-ios"],
  {
    cwd: kitRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, CI: "1", npm_config_yes: "true" },
  },
);

const combinedOut = `${r.stdout?.toString() ?? ""}${r.stderr?.toString() ?? ""}`;
let exitCode = 0;

try {
  if (r.status !== 0) {
    console.error("[verify-create-noninteractive] CLI exited non-zero.\n", combinedOut);
    exitCode = 1;
  } else {
    const pkgPath = join(targetDir, "package.json");
    if (!existsSync(pkgPath)) {
      console.error("[verify-create-noninteractive] package.json missing at", pkgPath);
      exitCode = 1;
    } else {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (pkg.name !== expectedName) {
        console.error(
          `[verify-create-noninteractive] package.json name mismatch: got "${pkg.name}", want "${expectedName}"`,
        );
        exitCode = 1;
      } else {
        console.log(
          "verify-create-noninteractive: OK (stdin ignored, no prompts; template copied, --no-install)",
        );
      }
    }
  }
} finally {
  rmSync(targetDir, { recursive: true, force: true });
}

process.exit(exitCode);
