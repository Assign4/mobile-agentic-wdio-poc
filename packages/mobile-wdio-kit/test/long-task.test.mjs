import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { shouldShowSpinner, startSpinner } from "../lib/long-task.mjs";

describe("long-task", () => {
  let prevCi;
  let prevForceColor;

  beforeEach(() => {
    prevCi = process.env.CI;
    prevForceColor = process.env.FORCE_COLOR;
    delete process.env.FORCE_COLOR;
  });

  afterEach(() => {
    if (prevCi === undefined) delete process.env.CI;
    else process.env.CI = prevCi;

    if (prevForceColor === undefined) delete process.env.FORCE_COLOR;
    else process.env.FORCE_COLOR = prevForceColor;
  });

  it("CI=1 disables spinner eligibility", () => {
    process.env.CI = "1";
    assert.equal(shouldShowSpinner({ isTTY: true }), false);
    assert.equal(startSpinner("x", { isTTY: true }), null);
  });

  it("non-TTY disables spinner", () => {
    delete process.env.CI;
    assert.equal(shouldShowSpinner({ isTTY: false }), false);
  });

  it("TTY without CI allows spinner factory to run", () => {
    delete process.env.CI;
    const stream = {
      isTTY: true,
      write() {},
      cursorTo() {},
      clearLine() {},
    };
    const spin = startSpinner("working…", stream);
    assert.ok(spin !== null);
    if (spin) spin.stop();
  });
});
