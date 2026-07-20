import { describe, expect, it } from "vitest";
import { dayDifference, localDay } from "@/server/progress/module";

describe("Bangkok streak days", () => {
  it("changes day at Bangkok midnight", () => {
    expect(localDay(new Date("2026-07-19T16:59:59Z"))).toBe("2026-07-19");
    expect(localDay(new Date("2026-07-19T17:00:00Z"))).toBe("2026-07-20");
  });

  it("detects consecutive calendar days", () => {
    expect(dayDifference("2026-07-19", "2026-07-20")).toBe(1);
    expect(dayDifference("2026-07-19", "2026-07-22")).toBe(3);
  });
});
