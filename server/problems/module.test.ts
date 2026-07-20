import { describe, expect, it } from "vitest";
import { buildLearnerMarkdown, normalizeProblemDraft } from "@/server/problems/module";

describe("learner-safe Problem markdown", () => {
  it("includes public examples but excludes solutions, staff notes, and hidden tests", () => {
    const draft = normalizeProblemDraft({
      code: "two-sum",
      title: "Two Sum",
      description: "Find the pair.",
      solution: "SECRET_SOLUTION",
      staffNotes: "SECRET_STAFF_NOTE",
      test_cases: [
        { input_data: "1 2", output_data: "3", is_simple: true },
        { input_data: "SECRET_HIDDEN_INPUT", output_data: "SECRET_HIDDEN_OUTPUT", is_simple: false },
      ],
    });
    const markdown = buildLearnerMarkdown(draft);
    expect(markdown).toContain("Find the pair.");
    expect(markdown).toContain("1 2");
    expect(markdown).not.toContain("SECRET_SOLUTION");
    expect(markdown).not.toContain("SECRET_STAFF_NOTE");
    expect(markdown).not.toContain("SECRET_HIDDEN_INPUT");
  });
});
