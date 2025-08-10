import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { AxiosError } from "axios";
import { getChatbotPrompt } from "@/prompts/chatbot";

export async function POST(request: Request) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { userInput, context } = await request.json();

    // Build messages array with context if available
    const messages = [
      {
        role: "system",
        content: getChatbotPrompt(),
      },
    ];

    // Add context if provided (for memory illusion)
    if (context && context.trim()) {
      messages.push({
        role: "system",
        content: `Previous conversation context:\n${context}\n\nPlease use this context to provide more relevant and personalized responses.`,
      });
    }

    // Add current user input
    messages.push({
      role: "user",
      content: userInput,
    });

    const chatCompletion = await groq.chat.completions.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    });

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              // Send each chunk as Server-Sent Events format
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
          }
          // Send end signal
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error with Groq API:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof AxiosError ? error.message : error,
      },
      { status: 500 }
    );
  }
}

// Remove the main() call - not needed for API routes
