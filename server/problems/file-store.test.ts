import { describe, expect, it } from "vitest";
import { checksum } from "@/server/problems/file-store";

describe("Problem revision checksum", () => {
  it("is deterministic and content-sensitive", () => {
    expect(checksum("problem markdown")).toBe(checksum("problem markdown"));
    expect(checksum("problem markdown")).not.toBe(checksum("changed markdown"));
  });
});
