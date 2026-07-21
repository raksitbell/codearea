import { describe, expect, it } from "vitest";
import { publicUser } from "@/server/auth/module";

describe("publicUser", () => {
  it("projects only learner-safe identity fields", () => {
    const result = publicUser({
      id: 7,
      email: "learner@example.com",
      emailVerifiedAt: new Date("2026-07-21T00:00:00.000Z"),
      displayName: "Learner",
      role: "learner",
      roleId: 1,
      passwordHash: "must-not-leak",
    } as Parameters<typeof publicUser>[0] & { passwordHash: string });

    expect(result).not.toHaveProperty("passwordHash");
    expect(result).toMatchObject({
      id: 7,
      email: "learner@example.com",
      emailVerified: true,
      email_verified: true,
      displayName: "Learner",
      role: "learner",
    });
  });
});
