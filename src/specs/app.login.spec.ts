import { env } from "../env.ts";
import { loginPage } from "../pages/Login.page.ts";
import { nativeAlertPage } from "../pages/NativeAlert.page.ts";
import { tabBarPage } from "../pages/TabBar.page.ts";

describe("WebdriverIO demo app (native)", () => {
  it("shows the tab bar after launch", async () => {
    await tabBarPage.waitForDisplay();
  });

  it("logs in and dismisses the success alert", async () => {
    await tabBarPage.waitForDisplay();
    await tabBarPage.openLogin();
    await loginPage.openLoginForm();
    await loginPage.login(env.mobileUsername, env.mobilePassword);
    await nativeAlertPage.waitForDisplay();
    await nativeAlertPage.expectSuccessMessage();
    await nativeAlertPage.confirm();
  });
});
