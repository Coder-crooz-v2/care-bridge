import { getChatbotPrompt } from "@/utils/prompts/chatbot";
import { groq } from "@ai-sdk/groq";

import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  const {
    messages,
    model,
    useWebSearch=false,
  }: {
    messages: UIMessage[];
    model: string;
    useWebSearch: boolean;
  } = await req.json();

  console.log(model, useWebSearch);

  const result = useWebSearch
    ? streamText({
        model: groq(model),
        messages: convertToModelMessages(messages.slice(-5)),
        system:
          getChatbotPrompt() +
          "\nYou can call browser_search to fetch live web results.",
        tools: {
          browser_search: groq.tools.browserSearch({}),
        },
        toolChoice: "auto",
      })
    : streamText({
        model: groq(model),
        messages: convertToModelMessages(messages.slice(-5)),
        system: getChatbotPrompt(),
      });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
