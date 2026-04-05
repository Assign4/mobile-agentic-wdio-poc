import type { ScreenActions } from "../actions/ScreenActions.ts";
import { LoginPage } from "../pages/Login.page.ts";
import { NativeAlertPage } from "../pages/NativeAlert.page.ts";
import { TabBarPage } from "../pages/TabBar.page.ts";

/**
 * Lazy page getters: with 100+ screens, only construct pages used in a scenario.
 * Add a new getter when you add a page class — avoid importing every page at module load.
 */
export class PageRegistry {
  constructor(private readonly actions: ScreenActions) {}

  private _tabBar?: TabBarPage;
  private _login?: LoginPage;
  private _nativeAlert?: NativeAlertPage;

  get tabBar(): TabBarPage {
    return (this._tabBar ??= new TabBarPage(this.actions));
  }

  get login(): LoginPage {
    return (this._login ??= new LoginPage(this.actions));
  }

  get nativeAlert(): NativeAlertPage {
    return (this._nativeAlert ??= new NativeAlertPage(this.actions));
  }
}
