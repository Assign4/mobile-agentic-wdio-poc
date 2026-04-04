import { describe, expect, it } from "vitest";
import { safeFilePart } from "./safeFilePart.ts";

describe("safeFilePart", () => {
  it("keeps alphanumerics underscore and hyphen", () => {
    expect(safeFilePart("login-flow_ok")).toBe("login-flow_ok");
  });

  it("replaces other characters with single hyphen runs", () => {
    expect(safeFilePart("a  b::c")).toBe("a-b-c");
    expect(safeFilePart("foo---bar")).toBe("foo-bar");
  });

  it("handles empty string", () => {
    expect(safeFilePart("")).toBe("");
  });
});
