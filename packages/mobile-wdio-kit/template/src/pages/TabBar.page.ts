import { tabBarLocators } from "../locators/tabBar.locators.ts";

const platform = (): "android" | "ios" => (driver.isIOS ? "ios" : "android");

const sel = (name: keyof (typeof tabBarLocators)["android"]): string =>
  tabBarLocators[platform()][name];

export class TabBarPage {
  async waitForDisplay(): Promise<void> {
    await $(sel("homeTab")).waitForDisplayed({ timeout: 20_000 });
  }

  async openLogin(): Promise<void> {
    await this.waitForDisplay();
    await $(sel("loginTab")).click();
  }
}

export const tabBarPage = new TabBarPage();
