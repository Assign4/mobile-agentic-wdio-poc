import type { ScreenActions } from "../actions/ScreenActions.ts";
import { screenActions } from "../actions/ScreenActions.ts";

/**
 * Prefer **composition** (`ScreenActions`) over fat inheritance. Subclasses take an optional
 * `ScreenActions` instance so the Cucumber World can inject the same object everywhere.
 */
export abstract class BasePage {
  constructor(protected readonly a: ScreenActions = screenActions) {}

  protected platform(): "android" | "ios" {
    return driver.isIOS ? "ios" : "android";
  }
}
