import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pickle, PickleStep } from "@cucumber/messages";
import type { Frameworks, Options } from "@wdio/types";
import { env } from "../src/env.ts";
import { safeFilePart } from "../src/lib/safeFilePart.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const featureGlob = join(root, "src/features/**/*.feature");

/**
 * Cucumber runner defaults. For faster CI at scale: raise `maxInstances` when you shard features
 * across capabilities, and keep step/page imports lazy (see `PageRegistry`).
 */
export const sharedCucumberMobileConfig: Partial<Options.Testrunner> = {
  runner: "local",
  specs: [featureGlob],
  maxInstances: 1,
  logLevel: "info",
  waitforTimeout: 15_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 1,
  framework: "cucumber",
  cucumberOpts: {
    timeout: 90_000,
    import: [join(root, "src/support/world.ts"), join(root, "src/steps/login.steps.ts")],
  },
  reporters: ["spec"],
  before: () => {
    mkdirSync(join(env.artifactsDir, "screenshots"), { recursive: true });
  },
  afterStep: async (_step: PickleStep, scenario: Pickle, result: Frameworks.PickleResult) => {
    if (result.passed) return;
    const name = safeFilePart(scenario.name || "failed-step");
    const path = join(env.artifactsDir, "screenshots", `${name}.png`);
    try {
      await browser.saveScreenshot(path);
    } catch {
      // Session may already be dead.
    }
  },
};
