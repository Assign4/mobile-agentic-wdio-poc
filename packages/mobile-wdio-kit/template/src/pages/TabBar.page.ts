import type { ScreenActions } from "../actions/ScreenActions.ts";
import { tabBarLocators } from "../locators/tabBar.locators.ts";
import { BasePage } from "./Base.page.ts";

export class TabBarPage extends BasePage {
  constructor(actions?: ScreenActions) {
    super(actions);
  }

  private sel(name: keyof (typeof tabBarLocators)["android"]): string {
    return tabBarLocators[this.platform()][name];
  }

  async waitForDisplay(): Promise<void> {
    await this.a.waitForDisplayed(this.sel("homeTab"));
  }

  async openLogin(): Promise<void> {
    await this.waitForDisplay();
    await this.a.click(this.sel("loginTab"));
  }
}

export const tabBarPage = new TabBarPage();
