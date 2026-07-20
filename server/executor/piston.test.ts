import { afterEach, describe, expect, it, vi } from "vitest";
import { executeCode } from "@/server/executor/piston";

describe("executeCode", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends revision time and memory limits to Piston", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      run: { stdout: "3\n", stderr: "", output: "3\n", code: 0, signal: null },
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await executeCode({ language: "javascript", sourceCode: "console.log(3)", timeLimitMs: 750, memoryLimitKb: 65_536 });

    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({ run_timeout: 750, run_memory_limit: 67_108_864 });
  });
});
