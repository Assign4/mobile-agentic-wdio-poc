import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDoctorText, neutralDoctorTheme } from "../lib/doctor-format.mjs";

describe("doctor-format", () => {
  it("formats checks with neutral theme (stable text)", () => {
    const checks = [
      { level: "ok", title: "Node.js v20", detail: "Required: >= 18" },
      {
        level: "warn",
        title: "adb on PATH",
        detail: "not found",
        fix: "Add platform-tools to PATH",
      },
      {
        level: "fail",
        title: "Hard fail",
        fix: "Do something",
      },
    ];
    const failed = checks.filter((c) => c.level === "fail");
    const warns = checks.filter((c) => c.level === "warn");
    const text = formatDoctorText(checks, failed, warns, neutralDoctorTheme());
    assert.match(text, /mobile-wdio-kit — doctor/);
    assert.match(text, /✓ Node\.js v20/);
    assert.match(text, /! adb on PATH/);
    assert.match(text, /✗ Hard fail/);
    assert.match(text, /→ Add platform-tools to PATH/);
    assert.match(text, /required check\(s\) failed/);
  });

  it("all-pass summary", () => {
    const checks = [{ level: "ok", title: "Only ok" }];
    const text = formatDoctorText(checks, [], [], neutralDoctorTheme());
    assert.match(text, /all checks passed/);
  });

  it("warn-only summary", () => {
    const checks = [{ level: "warn", title: "W", fix: "f" }];
    const warns = checks;
    const text = formatDoctorText(checks, [], warns, neutralDoctorTheme());
    assert.match(text, /OK \(with 1 warning/);
  });
});
