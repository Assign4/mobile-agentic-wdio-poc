import type { ScreenActions } from "../actions/ScreenActions.ts";
import { nativeAlertLocators } from "../locators/nativeAlert.locators.ts";
import { BasePage } from "./Base.page.ts";

export class NativeAlertPage extends BasePage {
  constructor(actions?: ScreenActions) {
    super(actions);
  }

  private sel(name: keyof (typeof nativeAlertLocators)["android"]): string {
    return nativeAlertLocators[this.platform()][name];
  }

  async waitForDisplay(): Promise<void> {
    if (driver.isIOS) {
      await this.a.waitForExist(this.sel("alert"), 11_000);
      return;
    }

    await this.a.waitForExist(this.sel("alertTitle"), 11_000);
  }

  async expectSuccessMessage(): Promise<void> {
    if (driver.isIOS) {
      await expect($(this.sel("alert"))).toHaveText(expect.stringContaining("Success"));
      return;
    }

    const title = await $(this.sel("alertTitle")).getText();
    const message = await $(this.sel("alertMessage")).getText();
    expect(`${title}\n${message}`).toContain("Success");
  }

  async confirm(): Promise<void> {
    await this.a.click(this.sel("okButton"));
  }
}

export const nativeAlertPage = new NativeAlertPage();
