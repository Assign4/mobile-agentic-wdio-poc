import { afterEach, describe, expect, it, vi } from "vitest";
import { loginLocators } from "../locators/login.locators.ts";
import { setupWdioTestContext } from "../test-utils/wdioTestGlobals.ts";
import { LoginPage } from "./Login.page.ts";

const L = loginLocators.android;

describe("LoginPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("waitForDisplay waits on screen title", async () => {
    setupWdioTestContext({ isAndroid: true, isIOS: false });
    const page = new LoginPage();
    await page.waitForDisplay();
    const title = globalThis.$(L.screenTitle);
    expect(title.waitForDisplayed).toHaveBeenCalledWith({ timeout: 20_000 });
  });

  it("openLoginForm waits then taps login container", async () => {
    setupWdioTestContext({ isAndroid: true, isIOS: false });
    const page = new LoginPage();
    await page.openLoginForm();
    expect(globalThis.$(L.loginContainerButton).click).toHaveBeenCalled();
  });

  it("login on Android sets credentials, dismisses keyboard via title tap, scrolls and taps sign in", async () => {
    const { chainFor } = setupWdioTestContext({
      isAndroid: true,
      isIOS: false,
    });
    const page = new LoginPage();
    await page.login("user@x.com", "pw");

    expect(chainFor(L.usernameField).setValue).toHaveBeenCalledWith("user@x.com");
    expect(chainFor(L.passwordField).setValue).toHaveBeenCalledWith("pw");
    expect(chainFor(L.screenTitle).click).toHaveBeenCalled();
    expect(chainFor(L.signInButton).scrollIntoView).toHaveBeenCalledWith({
      scrollableElement: chainFor(L.screenTitle),
    });
    expect(chainFor(L.signInButton).click).toHaveBeenCalled();
  });

  it("login on iOS without keyboard skips title tap for keyboard dismissal", async () => {
    const { chainFor } = setupWdioTestContext({
      isAndroid: false,
      isIOS: true,
      keyboardShown: false,
    });
    const page = new LoginPage();
    await page.login("a@b.co", "x");

    expect(chainFor(L.usernameField).setValue).toHaveBeenCalled();
    expect(chainFor(L.screenTitle).click).not.toHaveBeenCalled();
    expect(chainFor(L.signInButton).click).toHaveBeenCalled();
  });

  it("login on iOS with keyboard taps title to dismiss", async () => {
    const { chainFor } = setupWdioTestContext({
      isAndroid: false,
      isIOS: true,
      keyboardShown: true,
    });
    const page = new LoginPage();
    await page.login("a@b.co", "x");

    expect(globalThis.driver.isKeyboardShown).toHaveBeenCalled();
    expect(chainFor(L.screenTitle).click).toHaveBeenCalled();
  });
});
