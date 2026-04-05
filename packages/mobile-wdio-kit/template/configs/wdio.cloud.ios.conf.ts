import type { Capabilities, Options } from "@wdio/types";
import { env, requireCloudCredentials } from "../src/env.ts";
import { sharedMobileConfig } from "./wdio.shared.ts";

const { user, key } = requireCloudCredentials();

export const config: Options.Testrunner & Capabilities.WithRequestedTestrunnerCapabilities = {
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
      platformName: "iOS",
      "appium:automationName": "XCUITest",
      "appium:deviceName": env.ios.cloudDevice,
      "appium:platformVersion": env.ios.cloudPlatformVersion,
      "appium:app": env.ios.cloudApp,
      "lt:options": {
        build: `${env.buildName} — iOS`,
        name: "Mobile login",
        isRealMobile: true,
      },
    },
  ],
};
