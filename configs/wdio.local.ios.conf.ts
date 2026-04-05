import type { Capabilities, Options } from "@wdio/types";
import { env } from "../src/env.ts";
import { sharedMobileConfig } from "./wdio.shared.ts";

export const config: Options.Testrunner & Capabilities.WithRequestedTestrunnerCapabilities = {
  ...sharedMobileConfig,
  hostname: env.appiumHost,
  port: env.appiumPort,
  path: "/",
  services: ["appium"],
  capabilities: [
    {
      platformName: "iOS",
      "appium:automationName": "XCUITest",
      "appium:deviceName": env.ios.deviceName,
      "appium:app": env.ios.appPath,
      "appium:bundleId": env.ios.bundleId,
      "appium:autoAcceptAlerts": true,
      "appium:noReset": false,
    },
  ],
};
