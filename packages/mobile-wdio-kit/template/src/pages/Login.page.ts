import { loginLocators } from "../locators/login.locators.ts";

const platform = (): "android" | "ios" => (driver.isIOS ? "ios" : "android");

const sel = (name: keyof (typeof loginLocators)["android"]): string =>
  loginLocators[platform()][name];

export class LoginPage {
  async waitForDisplay(): Promise<void> {
    await $(sel("screenTitle")).waitForDisplayed({ timeout: 20_000 });
  }

  async openLoginForm(): Promise<void> {
    await this.waitForDisplay();
    await $(sel("loginContainerButton")).click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.waitForDisplay();
    await $(sel("usernameField")).setValue(username);
    await $(sel("passwordField")).setValue(password);

    // Android: avoid isKeyboardShown() — it shells out to `dumpsys input_method` (huge, slow, fails if adb/device flakes).
    if (driver.isAndroid) {
      await $(sel("screenTitle")).click();
    } else if (await driver.isKeyboardShown()) {
      await $(sel("screenTitle")).click();
    }

    await $(sel("signInButton")).scrollIntoView({
      scrollableElement: await $(sel("screenTitle")),
    });
    await $(sel("signInButton")).click();
  }
}

export const loginPage = new LoginPage();
