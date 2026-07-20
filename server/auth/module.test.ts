import { describe, expect, it } from "vitest";
import { publicUser } from "@/server/auth/module";

describe("publicUser", () => {
  it("projects only learner-safe identity fields", () => {
    const result = publicUser({
      id: 7,
      email: "learner@example.com",
      displayName: "Learner",
      role: "learner",
      roleId: 1,
      passwordHash: "must-not-leak",
    } as Parameters<typeof publicUser>[0] & { passwordHash: string });

    expect(result).not.toHaveProperty("passwordHash");
    expect(result).toMatchObject({ id: 7, email: "learner@example.com", displayName: "Learner", role: "learner" });
  });
});
