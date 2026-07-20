import { currentUser } from "@/server/auth/request";
import { tutorEvents, type TutorEvent } from "@/server/chatbot/module";
import { jsonError } from "@/server/http";

function event(value: TutorEvent) { return `event: ${value.type}\ndata: ${JSON.stringify(value)}\n\n`; }

export async function POST(request: Request) {
  try {
    await currentUser();
    const events = await tutorEvents(await request.json());
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const item of events) controller.enqueue(encoder.encode(event(item)));
        } catch (error) {
          controller.enqueue(encoder.encode(event({ type: "error", message: error instanceof Error ? error.message : "AI Tutor failed" })));
        } finally { controller.close(); }
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
  } catch (error) { return jsonError(error); }
}
