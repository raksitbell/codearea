import { describe, expect, it } from "vitest";
import { publicUser } from "@/server/auth/module";

describe("publicUser", () => {
  it("projects only learner-safe identity fields", () => {
    const result = publicUser({
      id: 7,
      authUserId: "52d9f3e1-1f44-4e0c-9fbb-d2db9bd25bf8",
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
      authUserId: "52d9f3e1-1f44-4e0c-9fbb-d2db9bd25bf8",
      email: "learner@example.com",
      emailVerified: true,
      email_verified: true,
      displayName: "Learner",
      role: "learner",
    });
  });
});
