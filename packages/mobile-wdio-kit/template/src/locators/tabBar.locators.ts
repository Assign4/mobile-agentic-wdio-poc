type PlatformLocators = Record<"android" | "ios", Record<string, string>>;

export const tabBarLocators: PlatformLocators = {
  android: {
    homeTab: "~Home",
    loginTab: "~Login",
  },
  ios: {
    homeTab: "~Home",
    loginTab: "~Login",
  },
};
