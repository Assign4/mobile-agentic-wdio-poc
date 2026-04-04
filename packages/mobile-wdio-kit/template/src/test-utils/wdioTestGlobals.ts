import { vi, type Mock } from "vitest";

export type ElementChain = {
  waitForDisplayed: Mock;
  waitForExist: Mock;
  click: Mock;
  setValue: Mock;
  getText: Mock;
  scrollIntoView: Mock;
};

/** Minimal WDIO-style globals for unit-testing page objects. */
export function setupWdioTestContext(options: {
  isIOS?: boolean;
  isAndroid?: boolean;
  keyboardShown?: boolean;
}): { $: Mock; chainFor: (selector: string) => ElementChain } {
  const { isIOS = false, isAndroid = true, keyboardShown = false } = options;
  const chains = new Map<string, ElementChain>();

  const makeChain = (): ElementChain => ({
    waitForDisplayed: vi.fn().mockResolvedValue(undefined),
    waitForExist: vi.fn().mockResolvedValue(undefined),
    click: vi.fn().mockResolvedValue(undefined),
    setValue: vi.fn().mockResolvedValue(undefined),
    getText: vi.fn(),
    scrollIntoView: vi.fn().mockResolvedValue(undefined),
  });

  const $ = vi.fn((selector: string) => {
    if (!chains.has(selector)) chains.set(selector, makeChain());
    return chains.get(selector)!;
  });

  vi.stubGlobal("driver", {
    isIOS,
    isAndroid,
    isKeyboardShown: vi.fn().mockResolvedValue(keyboardShown),
  });
  vi.stubGlobal("$", $);

  return {
    $,
    chainFor: (selector: string) => {
      const c = chains.get(selector);
      if (!c) throw new Error(`No element chain for selector: ${selector}`);
      return c;
    },
  };
}

/**
 * Matches WebdriverIO-style usage in page objects:
 * - expect("a\\nb").toContain("x")
 * - expect($(loc)).toHaveText(expect.stringContaining("x"))
 */
export function stubExpectWebdriverStyle(): {
  toHaveText: Mock;
} {
  const toHaveText = vi.fn().mockResolvedValue(undefined);
  const expectFn = Object.assign(
    (actual: unknown) => {
      if (typeof actual === "string") {
        return {
          toContain: (sub: string) => {
            if (!actual.includes(sub)) {
              throw new Error(
                `Expected string to contain ${JSON.stringify(sub)}`,
              );
            }
          },
        };
      }
      return { toHaveText };
    },
    {
      stringContaining: (s: string) => s,
    },
  );
  vi.stubGlobal("expect", expectFn);
  return { toHaveText };
}
