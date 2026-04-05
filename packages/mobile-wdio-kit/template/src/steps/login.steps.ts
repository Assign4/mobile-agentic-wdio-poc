import { Given, Then, When } from "@cucumber/cucumber";
import { env } from "../env.ts";
import type { MobileWorld } from "../support/world.ts";

Given("the demo app tab bar is visible", async function (this: MobileWorld) {
  await this.pages.tabBar.waitForDisplay();
});

When("I open the Login tab", async function (this: MobileWorld) {
  await this.pages.tabBar.openLogin();
});

When("I open the login form", async function (this: MobileWorld) {
  await this.pages.login.openLoginForm();
});

When("I log in with configured demo credentials", async function (this: MobileWorld) {
  await this.pages.login.login(env.mobileUsername, env.mobilePassword);
});

Then("I should see the success message on the native alert", async function (this: MobileWorld) {
  await this.pages.nativeAlert.waitForDisplay();
  await this.pages.nativeAlert.expectSuccessMessage();
});

When("I confirm the native alert", async function (this: MobileWorld) {
  await this.pages.nativeAlert.confirm();
});
