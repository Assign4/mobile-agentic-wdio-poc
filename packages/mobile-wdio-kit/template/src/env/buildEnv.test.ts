import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildEnv,
  requireCloudCredentialsFrom,
} from "./buildEnv.ts";

const cwd = "/project/root";

describe("buildEnv", () => {
  it("uses defaults when vars are empty", () => {
    const e = buildEnv({}, cwd);
    expect(e.appiumHost).toBe("127.0.0.1");
    expect(e.appiumPort).toBe(4723);
    expect(e.artifactsDir).toBe("./artifacts");
    expect(e.mobileUsername).toBe("test@webdriver.io");
    expect(e.mobilePassword).toBe("Test1234!");
    expect(e.buildName).toBe("wdio-mobile");
    expect(e.cloudHostname).toBe("mobile-hub.lambdatest.com");
    expect(e.cloudPath).toBe("/wd/hub");
    expect(e.android.deviceName).toBe("Android Emulator");
    expect(e.android.udid).toBe("");
    expect(e.android.appPath).toBe(
      resolve(cwd, "apps/android.wdio.native.app.v2.0.0.apk"),
    );
    expect(e.android.cloudDevice).toBe("Galaxy S24");
    expect(e.android.cloudPlatformVersion).toBe("14");
    expect(e.android.cloudApp).toBe("");
    expect(e.ios.deviceName).toBe("iPhone 15");
    expect(e.ios.appPath).toBe(resolve(cwd, "apps/ios-demo.app"));
    expect(e.ios.bundleId).toBe("com.example.demo");
    expect(e.ios.cloudDevice).toBe("iPhone 15");
    expect(e.ios.cloudPlatformVersion).toBe("17");
    expect(e.ios.cloudApp).toBe("");
    expect(e.cloudUsername).toBe("");
    expect(e.cloudAccessKey).toBe("");
  });

  it("reads explicit vars and resolves app paths", () => {
    const e = buildEnv(
      {
        APPIUM_HOST: "10.0.0.2",
        APPIUM_PORT: "9000",
        ARTIFACTS_DIR: "./out",
        MOBILE_USERNAME: "u@x.com",
        MOBILE_PASSWORD: "secret",
        BUILD_NAME: "ci-1",
        CLOUD_USERNAME: "cu",
        CLOUD_ACCESS_KEY: "ck",
        CLOUD_HOSTNAME: "hub.example.com",
        CLOUD_PATH: "/hub",
        ANDROID_DEVICE_NAME: "Pixel",
        ANDROID_UDID: "emulator-5554",
        ANDROID_APP_PATH: "./custom/app.apk",
        ANDROID_CLOUD_DEVICE: "Nexus",
        ANDROID_CLOUD_PLATFORM_VERSION: "15",
        ANDROID_CLOUD_APP: "lt://android-app",
        IOS_DEVICE_NAME: "iPhone 16",
        IOS_APP_PATH: "./build/My.app",
        IOS_BUNDLE_ID: "com.app.id",
        IOS_CLOUD_DEVICE: "iPhone 14",
        IOS_CLOUD_PLATFORM_VERSION: "16",
        IOS_CLOUD_APP: "lt://ios-app",
      },
      cwd,
    );
    expect(e.appiumHost).toBe("10.0.0.2");
    expect(e.appiumPort).toBe(9000);
    expect(e.artifactsDir).toBe("./out");
    expect(e.mobileUsername).toBe("u@x.com");
    expect(e.mobilePassword).toBe("secret");
    expect(e.buildName).toBe("ci-1");
    expect(e.cloudUsername).toBe("cu");
    expect(e.cloudAccessKey).toBe("ck");
    expect(e.cloudHostname).toBe("hub.example.com");
    expect(e.cloudPath).toBe("/hub");
    expect(e.android.deviceName).toBe("Pixel");
    expect(e.android.udid).toBe("emulator-5554");
    expect(e.android.appPath).toBe(resolve(cwd, "custom/app.apk"));
    expect(e.android.cloudDevice).toBe("Nexus");
    expect(e.android.cloudPlatformVersion).toBe("15");
    expect(e.android.cloudApp).toBe("lt://android-app");
    expect(e.ios.deviceName).toBe("iPhone 16");
    expect(e.ios.appPath).toBe(resolve(cwd, "build/My.app"));
    expect(e.ios.bundleId).toBe("com.app.id");
    expect(e.ios.cloudDevice).toBe("iPhone 14");
    expect(e.ios.cloudPlatformVersion).toBe("16");
    expect(e.ios.cloudApp).toBe("lt://ios-app");
  });

  it("falls back APPIUM_PORT when not a finite number", () => {
    expect(buildEnv({ APPIUM_PORT: "nope" }, cwd).appiumPort).toBe(4723);
    expect(buildEnv({ APPIUM_PORT: "Infinity" }, cwd).appiumPort).toBe(4723);
    expect(buildEnv({ APPIUM_PORT: "12.5" }, cwd).appiumPort).toBe(12.5);
  });

  it("uses default Android APK when ANDROID_APP_PATH is empty string", () => {
    const e = buildEnv({ ANDROID_APP_PATH: "" }, cwd);
    expect(e.android.appPath).toBe(
      resolve(cwd, "apps/android.wdio.native.app.v2.0.0.apk"),
    );
  });
});

describe("requireCloudCredentialsFrom", () => {
  it("returns user and key when set", () => {
    expect(
      requireCloudCredentialsFrom({
        CLOUD_USERNAME: "user",
        CLOUD_ACCESS_KEY: "key",
      }),
    ).toEqual({ user: "user", key: "key" });
  });

  it("throws when CLOUD_USERNAME is missing", () => {
    expect(() =>
      requireCloudCredentialsFrom({ CLOUD_ACCESS_KEY: "k" }),
    ).toThrowError("Missing required environment variable: CLOUD_USERNAME");
  });

  it("throws when CLOUD_ACCESS_KEY is missing", () => {
    expect(() =>
      requireCloudCredentialsFrom({ CLOUD_USERNAME: "u" }),
    ).toThrowError("Missing required environment variable: CLOUD_ACCESS_KEY");
  });
});
