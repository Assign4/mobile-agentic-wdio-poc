import type { Capabilities, Options } from "@wdio/types";
import { env } from "../src/env.ts";
import { sharedCucumberMobileConfig } from "./wdio.shared.cucumber.ts";

export const config: Options.Testrunner & Capabilities.WithRequestedTestrunnerCapabilities = {
  ...sharedCucumberMobileConfig,
  hostname: env.appiumHost,
  port: env.appiumPort,
  path: "/",
  services: ["appium"],
  capabilities: [
    {
      platformName: "iOS",
      "appium:automationName": "XCUITest",
      "appium:deviceName": env.ios.deviceName,
      ...(env.ios.udid ? { "appium:udid": env.ios.udid } : {}),
      ...(env.ios.platformVersion ? { "appium:platformVersion": env.ios.platformVersion } : {}),
      "appium:app": env.ios.appPath,
      "appium:bundleId": env.ios.bundleId,
      "appium:autoAcceptAlerts": false,
      "appium:noReset": false,
    },
  ],
};
