import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Options } from "@wdio/types";
import { env } from "../src/env.ts";
import { safeFilePart } from "../src/lib/safeFilePart.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const specGlob = join(root, "src/specs/**/*.spec.ts");

/** Shared WDIO options for all mobile configs (Mocha + plain specs). */
export const sharedMobileConfig: Partial<Options.Testrunner> = {
  runner: "local",
  specs: [specGlob],
  maxInstances: 1,
  logLevel: "info",
  waitforTimeout: 15_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 1,
  framework: "mocha",
  mochaOpts: { timeout: 90_000 },
  reporters: ["spec"],
  before: () => {
    mkdirSync(join(env.artifactsDir, "screenshots"), { recursive: true });
  },
  afterTest: async (test, _ctx, { passed }) => {
    if (passed) return;
    const name = safeFilePart(test.title || "failed");
    const path = join(env.artifactsDir, "screenshots", `${name}.png`);
    try {
      await browser.saveScreenshot(path);
    } catch {
      // Session or UiAutomator2 may already be dead (e.g. adb device offline).
    }
  },
};
