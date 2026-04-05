import type { ScreenActions } from "../actions/ScreenActions.ts";
import { loginLocators } from "../locators/login.locators.ts";
import { BasePage } from "./Base.page.ts";

const selFor = (
  platform: "android" | "ios",
  name: keyof (typeof loginLocators)["android"],
): string => loginLocators[platform][name];

export class LoginPage extends BasePage {
  constructor(actions?: ScreenActions) {
    super(actions);
  }

  private sel(name: keyof (typeof loginLocators)["android"]): string {
    return selFor(this.platform(), name);
  }

  async waitForDisplay(): Promise<void> {
    await this.a.waitForDisplayed(this.sel("screenTitle"));
  }

  async openLoginForm(): Promise<void> {
    await this.waitForDisplay();
    await this.a.click(this.sel("loginContainerButton"));
  }

  async login(username: string, password: string): Promise<void> {
    await this.waitForDisplay();
    const titleSel = this.sel("screenTitle");
    await this.a.setValue(this.sel("usernameField"), username);
    await this.a.setValue(this.sel("passwordField"), password);
    await this.a.dismissKeyboard(titleSel);
    await this.a.scrollIntoViewAndClick(this.sel("signInButton"), titleSel);
  }
}

export const loginPage = new LoginPage();
