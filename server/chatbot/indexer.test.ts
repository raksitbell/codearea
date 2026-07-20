import { describe, expect, it } from "vitest";
import { learnerSafeIndexText } from "@/server/chatbot/indexer";

describe("learnerSafeIndexText", () => {
  it("includes approved frontmatter and excludes unknown staff fields", () => {
    const projected = learnerSafeIndexText(`---
title: Two Sum
tags: [arrays]
objectives: [Use a map]
hints: [Track complements]
publicExamples:
  - input: 1 2
    output: 3
canonicalSolution: secret
staffNotes: hidden
---
# Statement
Add the values.`);

    expect(projected).toContain("Learning objectives");
    expect(projected).toContain("Track complements");
    expect(projected).toContain('"input":"1 2"');
    expect(projected).not.toContain("secret");
    expect(projected).not.toContain("hidden");
  });
});
