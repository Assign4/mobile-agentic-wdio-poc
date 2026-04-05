import { setWorldConstructor, World, type IWorldOptions } from "@cucumber/cucumber";
import { screenActions } from "../actions/ScreenActions.ts";
import { PageRegistry } from "./PageRegistry.ts";

export class MobileWorld extends World {
  /** Shared low-level API (tap, type, waits). Same instance as injected into pages. */
  readonly actions = screenActions;

  /** Scenario-scoped pages; each getter instantiates at most once per scenario. */
  readonly pages = new PageRegistry(this.actions);

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(MobileWorld);
