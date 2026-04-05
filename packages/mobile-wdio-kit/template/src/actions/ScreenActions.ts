/**
 * Low-level gestures and waits in one place. Inject into page objects (or the Cucumber World)
 * so hundreds of screens share one implementation and stay easy to mock in unit tests.
 */
export class ScreenActions {
  async click(selector: string): Promise<void> {
    await $(selector).click();
  }

  async setValue(selector: string, value: string): Promise<void> {
    await $(selector).setValue(value);
  }

  async waitForDisplayed(selector: string, timeout = 20_000): Promise<void> {
    await $(selector).waitForDisplayed({ timeout });
  }

  async waitForExist(selector: string, timeout = 15_000): Promise<void> {
    await $(selector).waitForExist({ timeout });
  }

  /**
   * Demo-app pattern: avoid `isKeyboardShown()` on Android (slow / flaky via dumpsys).
   */
  async dismissKeyboard(anchorSelector: string): Promise<void> {
    if (driver.isAndroid) {
      await $(anchorSelector).click();
    } else if (await driver.isKeyboardShown()) {
      await $(anchorSelector).click();
    }
  }

  async scrollIntoViewAndClick(targetSelector: string, scrollRootSelector: string): Promise<void> {
    const scrollableElement = await $(scrollRootSelector);
    await $(targetSelector).scrollIntoView({ scrollableElement });
    await $(targetSelector).click();
  }
}

export const screenActions = new ScreenActions();
