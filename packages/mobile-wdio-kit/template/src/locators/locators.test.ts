import { describe, expect, it } from "vitest";
import { loginLocators } from "./login.locators.ts";
import { nativeAlertLocators } from "./nativeAlert.locators.ts";
import { tabBarLocators } from "./tabBar.locators.ts";

describe("loginLocators", () => {
  it("has matching keys for android and ios", () => {
    expect(Object.keys(loginLocators.android).sort()).toEqual(
      Object.keys(loginLocators.ios).sort(),
    );
    expect(loginLocators.android.screenTitle).toContain("Login");
    expect(loginLocators.android.signInButton).toBeTruthy();
  });
});

describe("tabBarLocators", () => {
  it("has home and login tabs for both platforms", () => {
    expect(tabBarLocators.android.homeTab).toBe("~Home");
    expect(tabBarLocators.android.loginTab).toBe("~Login");
    expect(tabBarLocators.ios).toEqual(tabBarLocators.android);
  });
});

describe("nativeAlertLocators", () => {
  it("defines android title, message, and OK", () => {
    expect(nativeAlertLocators.android.alertTitle).toContain("alert_title");
    expect(nativeAlertLocators.android.alertMessage).toContain("message");
    expect(nativeAlertLocators.android.okButton).toContain("OK");
  });

  it("defines ios alert predicate and OK accessibility id", () => {
    expect(nativeAlertLocators.ios.alert).toContain("XCUIElementTypeAlert");
    expect(nativeAlertLocators.ios.okButton).toBe("~OK");
  });
});
