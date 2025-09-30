import { getChatbotPrompt } from "@/prompts/chatbot";
import { groq } from "@ai-sdk/groq";

import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: UIMessage[];
  } = await req.json();

  const result = streamText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    messages: convertToModelMessages(messages.slice(-5)),
    system: getChatbotPrompt(),
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
