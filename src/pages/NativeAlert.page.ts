import { nativeAlertLocators } from "../locators/nativeAlert.locators.ts";

const platform = (): "android" | "ios" => (driver.isIOS ? "ios" : "android");

export class NativeAlertPage {
  async waitForDisplay(): Promise<void> {
    if (driver.isIOS) {
      await $(nativeAlertLocators[platform()].alert).waitForExist({ timeout: 11_000 });
      return;
    }

    await $(nativeAlertLocators[platform()].alertTitle).waitForExist({
      timeout: 11_000,
    });
  }

  async expectSuccessMessage(): Promise<void> {
    if (driver.isIOS) {
      await expect($(nativeAlertLocators[platform()].alert)).toHaveText(
        expect.stringContaining("Success"),
      );
      return;
    }

    const title = await $(nativeAlertLocators[platform()].alertTitle).getText();
    const message = await $(nativeAlertLocators[platform()].alertMessage).getText();
    expect(`${title}\n${message}`).toContain("Success");
  }

  async confirm(): Promise<void> {
    await $(nativeAlertLocators[platform()].okButton).click();
  }
}

export const nativeAlertPage = new NativeAlertPage();
