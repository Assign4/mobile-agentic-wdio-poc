type PlatformLocators = Record<"android" | "ios", Record<string, string>>;

export const loginLocators: PlatformLocators = {
  android: {
    screenTitle: "~Login-screen",
    loginContainerButton: "~button-login-container",
    usernameField: "~input-email",
    passwordField: "~input-password",
    signInButton: "~button-LOGIN",
  },
  ios: {
    screenTitle: "~Login-screen",
    loginContainerButton: "~button-login-container",
    usernameField: "~input-email",
    passwordField: "~input-password",
    signInButton: "~button-LOGIN",
  },
};
