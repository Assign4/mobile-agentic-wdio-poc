import { resolve } from "node:path";

const optional = (vars: NodeJS.ProcessEnv, name: string, fallback = ""): string =>
  vars[name] ?? fallback;

const required = (vars: NodeJS.ProcessEnv, name: string): string => {
  const value = vars[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const toNumber = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export type MobileEnv = ReturnType<typeof buildEnv>;

/** Build env from a process-like map (testable; no dotenv). */
export function buildEnv(vars: NodeJS.ProcessEnv = process.env, cwd: string = process.cwd()) {
  return {
    appiumHost: optional(vars, "APPIUM_HOST", "127.0.0.1"),
    appiumPort: toNumber(optional(vars, "APPIUM_PORT", "4723"), 4723),
    artifactsDir: optional(vars, "ARTIFACTS_DIR", "./artifacts"),
    mobileUsername: optional(vars, "MOBILE_USERNAME", "test@webdriver.io"),
    mobilePassword: optional(vars, "MOBILE_PASSWORD", "Test1234!"),

    buildName: optional(vars, "BUILD_NAME", "wdio-mobile"),
    cloudUsername: optional(vars, "CLOUD_USERNAME"),
    cloudAccessKey: optional(vars, "CLOUD_ACCESS_KEY"),
    cloudHostname: optional(vars, "CLOUD_HOSTNAME", "mobile-hub.lambdatest.com"),
    cloudPath: optional(vars, "CLOUD_PATH", "/wd/hub"),

    android: {
      deviceName: optional(vars, "ANDROID_DEVICE_NAME", "Android Emulator"),
      udid: optional(vars, "ANDROID_UDID"),
      appPath: (() => {
        const p = optional(vars, "ANDROID_APP_PATH");
        return p ? resolve(cwd, p) : resolve(cwd, "apps/android.wdio.native.app.v2.0.0.apk");
      })(),
      cloudDevice: optional(vars, "ANDROID_CLOUD_DEVICE", "Galaxy S24"),
      cloudPlatformVersion: optional(vars, "ANDROID_CLOUD_PLATFORM_VERSION", "14"),
      cloudApp: optional(vars, "ANDROID_CLOUD_APP"),
    },

    ios: {
      deviceName: optional(vars, "IOS_DEVICE_NAME", "iPhone 15"),
      udid: optional(vars, "IOS_UDID"),
      platformVersion: optional(vars, "IOS_PLATFORM_VERSION"),
      appPath: (() => {
        const p = optional(vars, "IOS_APP_PATH", "./apps/ios-demo.app");
        return resolve(cwd, p);
      })(),
      bundleId: optional(vars, "IOS_BUNDLE_ID", "org.wdiodemoapp"),
      cloudDevice: optional(vars, "IOS_CLOUD_DEVICE", "iPhone 15"),
      cloudPlatformVersion: optional(vars, "IOS_CLOUD_PLATFORM_VERSION", "17"),
      cloudApp: optional(vars, "IOS_CLOUD_APP"),
    },
  };
}

export function requireCloudCredentialsFrom(vars: NodeJS.ProcessEnv) {
  return {
    user: required(vars, "CLOUD_USERNAME"),
    key: required(vars, "CLOUD_ACCESS_KEY"),
  };
}
