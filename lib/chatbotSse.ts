import { buildApiUrl } from "@/lib/api";

export type TutorMode = "hint" | "compare" | "analyze";
export type AiMessageTone = "default" | "error";

type StreamOptions = {
  onToken?: (text: string) => void;
  signal?: AbortSignal;
};

export async function streamTutor(
  body: Record<string, unknown> & { mode: TutorMode },
  options: { onToken?: (text: string) => void; signal?: AbortSignal } = {},
) {
  const response = await fetch(buildApiUrl("/chatbot/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(body),
    credentials: "same-origin",
    signal: options.signal,
  });
  if (!response.ok || !response.body) throw new Error((await response.text()).trim() || `HTTP ${response.status}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const dataLine = frame.split("\n").find((line) => line.startsWith("data: "));
      if (!dataLine) continue;
      const payload = JSON.parse(dataLine.slice(6)) as { type: string; token?: string; message?: string };
      if (payload.type === "error") throw new Error(payload.message ?? "AI Tutor failed");
      if (payload.type === "token" && payload.token) {
        accumulated += payload.token;
        options.onToken?.(accumulated);
      }
    }
  }
  return accumulated;
}

export function humanizeChatbotError(raw: string) {
  return raw.trim() || "เรียกผู้ช่วยไม่สำเร็จ";
}

export async function fetchProblemHint(body: {
  problemSlug: string;
  message: string;
}): Promise<
  | { ok: true; text: string }
  | { ok: false; error: string; tone: AiMessageTone }
> {
  try {
    const text = await streamTutor({ mode: "hint", ...body });
    return text
      ? { ok: true, text }
      : { ok: false, error: "ไม่มีข้อความตอบจากเซิร์ฟเวอร์", tone: "error" };
  } catch (error) {
    return {
      ok: false,
      error: humanizeChatbotError(
        error instanceof Error ? error.message : "AI Tutor failed",
      ),
      tone: "error",
    };
  }
}

export async function streamProblemCodeCompare(
  body: {
    problemSlug: string;
    oldCode: string;
    newCode: string;
    message?: string;
  },
  options: Required<Pick<StreamOptions, "onToken">> &
    Pick<StreamOptions, "signal">,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await streamTutor({ mode: "compare", ...body }, options);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "AI Tutor failed",
    };
  }
}

export async function streamPostSubmitAnalysis(
  body: { problemSlug: string; code: string },
  options: Required<Pick<StreamOptions, "onToken">> &
    Pick<StreamOptions, "signal">,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await streamTutor({ mode: "analyze", ...body }, options);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "AI Tutor failed",
    };
  }
}

export function streamTextToCallback(
  full: string,
  onUpdate: (slice: string) => void,
  options?: {
    charsPerStep?: number;
    ms?: number;
    onComplete?: () => void;
  },
): () => void {
  let index = 0;
  let cancelled = false;
  const step = () => {
    if (cancelled) return;
    index = Math.min(full.length, index + (options?.charsPerStep ?? 2));
    onUpdate(full.slice(0, index));
    if (index < full.length) {
      window.setTimeout(step, options?.ms ?? 20);
    } else {
      options?.onComplete?.();
    }
  };
  step();
  return () => {
    cancelled = true;
  };
}
