import { afterEach, describe, expect, it, vi } from "vitest";
import { tabBarLocators } from "../locators/tabBar.locators.ts";
import { setupWdioTestContext } from "../test-utils/wdioTestGlobals.ts";
import { TabBarPage } from "./TabBar.page.ts";

const T = tabBarLocators.android;

describe("TabBarPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("waitForDisplay waits on home tab", async () => {
    setupWdioTestContext({ isAndroid: true, isIOS: false });
    const page = new TabBarPage();
    await page.waitForDisplay();
    expect(globalThis.$(T.homeTab).waitForDisplayed).toHaveBeenCalledWith({
      timeout: 20_000,
    });
  });

  it("openLogin taps login tab after home is visible", async () => {
    setupWdioTestContext({ isAndroid: true, isIOS: false });
    const page = new TabBarPage();
    await page.openLogin();
    expect(globalThis.$(T.loginTab).click).toHaveBeenCalled();
  });

  it("uses iOS locators when driver.isIOS is true", async () => {
    setupWdioTestContext({ isAndroid: false, isIOS: true });
    const page = new TabBarPage();
    await page.openLogin();
    expect(globalThis.$(T.loginTab).click).toHaveBeenCalled();
  });
});
