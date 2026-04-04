import type { Capabilities, Options } from "@wdio/types";
import { env, requireCloudCredentials } from "../src/env.ts";
import { sharedMobileConfig } from "./wdio.shared.ts";

const { user, key } = requireCloudCredentials();

export const config: Options.Testrunner &
  Capabilities.WithRequestedTestrunnerCapabilities = {
  ...sharedMobileConfig,
  user,
  key,
  protocol: "https",
  hostname: env.cloudHostname,
  port: 443,
  path: env.cloudPath,
  services: [],
  capabilities: [
    {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": env.android.cloudDevice,
      "appium:platformVersion": env.android.cloudPlatformVersion,
      "appium:app": env.android.cloudApp,
      "lt:options": {
        build: `${env.buildName} — Android`,
        name: "Mobile login",
        isRealMobile: true,
      },
    },
  ],
};
