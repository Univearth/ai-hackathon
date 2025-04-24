import { streamText } from "ai";
import { createOllama } from "ollama-ai-provider";

const ollama = createOllama({
  baseURL: "https://ollama.yashikota.com",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: ollama("gemma3:27b"),
    messages,
  });

  return new Response(result.toDataStreamResponse().body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
