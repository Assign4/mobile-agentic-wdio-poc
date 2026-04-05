import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nativeAlertLocators } from "../locators/nativeAlert.locators.ts";
import { setupWdioTestContext, stubExpectWebdriverStyle } from "../test-utils/wdioTestGlobals.ts";
import { NativeAlertPage } from "./NativeAlert.page.ts";

describe("NativeAlertPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("waitForDisplay on iOS waits for alert element", async () => {
    setupWdioTestContext({ isAndroid: false, isIOS: true });
    const page = new NativeAlertPage();
    await page.waitForDisplay();
    const alertSel = nativeAlertLocators.ios.alert;
    expect(globalThis.$(alertSel).waitForExist).toHaveBeenCalledWith({
      timeout: 11_000,
    });
  });

  it("waitForDisplay on Android waits for alert title", async () => {
    setupWdioTestContext({ isAndroid: true, isIOS: false });
    const page = new NativeAlertPage();
    await page.waitForDisplay();
    const titleSel = nativeAlertLocators.android.alertTitle;
    expect(globalThis.$(titleSel).waitForExist).toHaveBeenCalledWith({
      timeout: 11_000,
    });
  });

  describe("expectSuccessMessage", () => {
    let toHaveText: ReturnType<typeof stubExpectWebdriverStyle>["toHaveText"];

    beforeEach(() => {
      ({ toHaveText } = stubExpectWebdriverStyle());
    });

    it("on iOS uses expect().toHaveText(stringContaining)", async () => {
      setupWdioTestContext({ isAndroid: false, isIOS: true });
      const page = new NativeAlertPage();
      await page.expectSuccessMessage();
      expect(toHaveText).toHaveBeenCalled();
    });

    it("on Android asserts title and message contain Success", async () => {
      setupWdioTestContext({
        isAndroid: true,
        isIOS: false,
      });
      const titleSel = nativeAlertLocators.android.alertTitle;
      const msgSel = nativeAlertLocators.android.alertMessage;
      globalThis.$(titleSel);
      globalThis.$(msgSel);
      vi.mocked(globalThis.$(titleSel).getText).mockResolvedValue("Done");
      vi.mocked(globalThis.$(msgSel).getText).mockResolvedValue("Success — logged in");
      const page = new NativeAlertPage();
      await expect(page.expectSuccessMessage()).resolves.toBeUndefined();
    });

    it("on Android throws when Success is absent", async () => {
      setupWdioTestContext({
        isAndroid: true,
        isIOS: false,
      });
      const titleSel = nativeAlertLocators.android.alertTitle;
      const msgSel = nativeAlertLocators.android.alertMessage;
      globalThis.$(titleSel);
      globalThis.$(msgSel);
      vi.mocked(globalThis.$(titleSel).getText).mockResolvedValue("Nope");
      vi.mocked(globalThis.$(msgSel).getText).mockResolvedValue("Try again");
      const page = new NativeAlertPage();
      await expect(page.expectSuccessMessage()).rejects.toThrow(/Expected string to contain/);
    });
  });

  it("confirm clicks OK for current platform", async () => {
    setupWdioTestContext({ isAndroid: true, isIOS: false });
    const page = new NativeAlertPage();
    await page.confirm();
    expect(globalThis.$(nativeAlertLocators.android.okButton).click).toHaveBeenCalled();
  });
});
