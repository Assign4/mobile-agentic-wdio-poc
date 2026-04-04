import type { Capabilities, Options } from "@wdio/types";
import { env } from "../src/env.ts";
import { sharedMobileConfig } from "./wdio.shared.ts";

export const config: Options.Testrunner &
  Capabilities.WithRequestedTestrunnerCapabilities = {
  ...sharedMobileConfig,
  hostname: env.appiumHost,
  port: env.appiumPort,
  path: "/",
  services: ["appium"],
  capabilities: [
    {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": env.android.deviceName,
      ...(env.android.udid ? { "appium:udid": env.android.udid } : {}),
      "appium:app": env.android.appPath,
      "appium:autoGrantPermissions": true,
      "appium:noReset": false,
    },
  ],
};
