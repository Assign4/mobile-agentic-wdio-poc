#!/usr/bin/env node
/**
 * Downloads the WebdriverIO native demo iOS Simulator .app (zip) into apps/ios-demo.app.
 * The upstream archive contains wdiodemoapp.app; we install it as ios-demo.app for MCP/demo paths.
 * Override URL: DEMO_IOS_ZIP_URL=https://.../file.zip
 * Force re-download: DEMO_IOS_FORCE=1
 * Attribution: see THIRD_PARTY.md.
 */
import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const defaultUrl =
  "https://github.com/webdriverio/native-demo-app/releases/download/v2.2.0/ios.simulator.wdio.native.app.v2.2.0.zip";
const url = process.env.DEMO_IOS_ZIP_URL ?? defaultUrl;
const destApp = join(rootDir, "apps", "ios-demo.app");

if (process.platform === "win32") {
  console.error(
    "Demo iOS .app is for Simulator builds; run this script on macOS (or extract the zip manually).",
  );
  process.exit(1);
}

if (existsSync(destApp) && process.env.DEMO_IOS_FORCE !== "1") {
  console.log(`Demo iOS app already present: ${destApp}`);
  process.exit(0);
}

const stamp = randomBytes(8).toString("hex");
const workDir = join(tmpdir(), `wdio-ios-demo-${stamp}`);
const zipPath = join(workDir, "ios-demo.zip");
mkdirSync(workDir, { recursive: true });

console.log(`Downloading demo iOS Simulator app…\n  ${url}`);

const res = await fetch(url, {
  redirect: "follow",
  headers: {
    "User-Agent": "mobile-wdio-kit-setup",
    Accept: "application/zip,application/octet-stream,*/*",
  },
});

if (!res.ok || !res.body) {
  console.error(`Download failed: HTTP ${res.status} ${res.statusText}`);
  rmSync(workDir, { recursive: true, force: true });
  process.exit(1);
}

const out = createWriteStream(zipPath);
await pipeline(Readable.fromWeb(res.body), out);

try {
  execFileSync("unzip", ["-o", "-q", zipPath, "-d", workDir], { stdio: "inherit" });
} catch {
  console.error("unzip failed. On macOS unzip is built in; on Linux install the `unzip` package.");
  rmSync(workDir, { recursive: true, force: true });
  process.exit(1);
}

const apps = readdirSync(workDir).filter((name) => name.endsWith(".app"));
if (apps.length !== 1) {
  console.error(`Expected exactly one .app in the zip root; found: ${apps.join(", ") || "(none)"}`);
  rmSync(workDir, { recursive: true, force: true });
  process.exit(1);
}

const extracted = join(workDir, apps[0]);
mkdirSync(join(rootDir, "apps"), { recursive: true });
if (existsSync(destApp)) {
  rmSync(destApp, { recursive: true, force: true });
}

try {
  renameSync(extracted, destApp);
} catch {
  execFileSync("mv", [extracted, destApp], { stdio: "inherit" });
}

rmSync(workDir, { recursive: true, force: true });
console.log(`Wrote ${destApp}`);
