#!/usr/bin/env node
/**
 * Downloads the WebdriverIO native demo Android APK into apps/ (for a lean npm template).
 * Override URL: DEMO_APK_URL=https://.../file.apk
 * Attribution / license for the binary: see THIRD_PARTY.md in this repository.
 */
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultUrl =
  "https://github.com/webdriverio/native-demo-app/releases/download/v2.0.0/android.wdio.native.app.v2.0.0.apk";
const url = process.env.DEMO_APK_URL ?? defaultUrl;
const dest = join(
  root,
  "apps",
  "android.wdio.native.app.v2.0.0.apk",
);

if (existsSync(dest) && process.env.DEMO_APK_FORCE !== "1") {
  console.log(`Demo APK already present: ${dest}`);
  process.exit(0);
}

mkdirSync(dirname(dest), { recursive: true });

console.log(`Downloading demo APK…\n  ${url}`);

const res = await fetch(url, {
  redirect: "follow",
  headers: {
    "User-Agent": "mobile-wdio-kit-setup",
    Accept: "application/octet-stream,*/*",
  },
});

if (!res.ok || !res.body) {
  console.error(`Download failed: HTTP ${res.status} ${res.statusText}`);
  process.exit(1);
}

const out = createWriteStream(dest);
await pipeline(Readable.fromWeb(res.body), out);
console.log(`Wrote ${dest}`);
