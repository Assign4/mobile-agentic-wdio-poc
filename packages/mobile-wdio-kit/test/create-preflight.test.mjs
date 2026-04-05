import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateCreatePreflight,
  formatPreflightFailure,
  parseNodeMajor,
  MIN_NODE_CREATE,
} from "../lib/create-preflight.mjs";

describe("create-preflight", () => {
  it("parseNodeMajor parses v22 and bare major", () => {
    assert.equal(parseNodeMajor("v22.1.0"), 22);
    assert.equal(parseNodeMajor("20.0.0"), 20);
    assert.equal(parseNodeMajor(""), 0);
  });

  it("ok when all gates pass", () => {
    const r = evaluateCreatePreflight({
      nodeVersion: `v${MIN_NODE_CREATE}.0.0`,
      npmOnPath: true,
      templatePkgExists: true,
    });
    assert.equal(r.ok, true);
    assert.equal(r.blocking.length, 0);
  });

  it("blocks on old node", () => {
    const r = evaluateCreatePreflight({
      nodeVersion: "v16.0.0",
      npmOnPath: true,
      templatePkgExists: true,
    });
    assert.equal(r.ok, false);
    assert.ok(r.blocking.some((b) => b.code === "node_version"));
  });

  it("blocks when npm missing", () => {
    const r = evaluateCreatePreflight({
      nodeVersion: `v${MIN_NODE_CREATE}.0.0`,
      npmOnPath: false,
      templatePkgExists: true,
    });
    assert.equal(r.ok, false);
    assert.ok(r.blocking.some((b) => b.code === "npm_missing"));
  });

  it("blocks when template missing", () => {
    const r = evaluateCreatePreflight({
      nodeVersion: `v${MIN_NODE_CREATE}.0.0`,
      npmOnPath: true,
      templatePkgExists: false,
    });
    assert.equal(r.ok, false);
    assert.ok(r.blocking.some((b) => b.code === "template_missing"));
  });

  it("formatPreflightFailure includes fix hints", () => {
    const pre = evaluateCreatePreflight({
      nodeVersion: "v10.0.0",
      npmOnPath: false,
      templatePkgExists: false,
    });
    const id = (s) => s;
    const text = formatPreflightFailure(pre, { fail: id, fix: id, dim: id });
    assert.match(text, /Cannot create project/);
    assert.match(text, /kit:sync/);
    assert.match(text, /npm/);
  });
});
