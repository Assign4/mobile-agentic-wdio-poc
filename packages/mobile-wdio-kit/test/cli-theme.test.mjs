import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { cliColorEnabled, createCliTheme, useColor } from "../lib/cli-theme.mjs";

describe("cli-theme", () => {
  let prevNoColor;
  let prevForceColor;

  beforeEach(() => {
    prevNoColor = process.env.NO_COLOR;
    prevForceColor = process.env.FORCE_COLOR;
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
  });

  afterEach(() => {
    if (prevNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = prevNoColor;

    if (prevForceColor === undefined) delete process.env.FORCE_COLOR;
    else process.env.FORCE_COLOR = prevForceColor;
  });

  it("useColor false for non-TTY", () => {
    assert.equal(useColor({ isTTY: false }), false);
  });

  it("createCliTheme with force:false and non-TTY returns plain strings", () => {
    const t = createCliTheme({ force: false, stream: { isTTY: false } });
    assert.equal(t.ok("x"), "x");
    assert.equal(t.fail("e"), "e");
  });

  it("force:false disables colors even when stream is TTY", () => {
    const t = createCliTheme({ force: false, stream: { isTTY: true } });
    assert.equal(t.ok("x"), "x");
  });

  it("createCliTheme force:true decorates when NO_COLOR unset", () => {
    const prevNo = process.env.NO_COLOR;
    delete process.env.NO_COLOR;
    try {
      const t = createCliTheme({ force: true, stream: { isTTY: false } });
      assert.notEqual(t.ok("pass"), "pass");
      assert.notEqual(t.brand("mwk"), "mwk");
    } finally {
      if (prevNo === undefined) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = prevNo;
    }
  });

  it("cliColorEnabled respects force and NO_COLOR", () => {
    const prev = process.env.NO_COLOR;
    delete process.env.NO_COLOR;
    try {
      assert.equal(cliColorEnabled({ force: true }, { isTTY: false }), true);
      process.env.NO_COLOR = "1";
      assert.equal(cliColorEnabled({ force: true }, { isTTY: false }), false);
    } finally {
      if (prev === undefined) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = prev;
    }
  });
});
