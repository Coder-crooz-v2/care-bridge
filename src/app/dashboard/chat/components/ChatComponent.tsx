"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Fragment, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";
import { DefaultChatTransport, UIMessage } from "ai";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuth";
import { useChatList } from "@/store/useChatList";
import { Action, Actions } from "@/components/ai-elements/actions";
import { CopyIcon } from "lucide-react";
import WelcomeCard from "./WelcomeCard";

interface FetchedMessage {
  id: number;
  query?: string;
  response?: string;
}

const ChatComponent = () => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [title, setTitle] = useState("New Chat");
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { chats, setChats } = useChatList();
  const router = useRouter();
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chats/chat-response",
    }),
    messages: initialMessages,
  });

  useEffect(() => {
    const chatId = searchParams.get("id");
    if (chatId) {
      setCurrentChatId(chatId);
      fetchMessages(chatId);
    } else {
      setMessages([]);
      setCurrentChatId(null);
      setSuggestions([]);
    }
  }, [searchParams, setMessages]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    console.log(JSON.stringify(message));
    if (!hasText) {
      return;
    }

    sendMessage({
      text: message.text || "No input prompt provided",
      files: undefined,
    });
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion, files: undefined });
    setSuggestions([]);
  };

  const createNewChat = async (user_id: string, title: string) => {
    try {
      const response = await axios.post("/api/chats", {
        user_id,
        title,
      });
      setCurrentChatId(response.data.id);
      router.push(`/dashboard/chat?id=${response.data.id}`);
      return response.data.id;
    } catch (error) {
      toast.error("Failed to create new chat", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const addMessage = async (query: string, response: string) => {
    if (!user) return;
    try {
      let chat_id = currentChatId;
      if (!chat_id) {
        setTitle(query);
        chat_id = await createNewChat(user.id, query);
        setChats([
          {
            id: chat_id as string,
            user_id: user.id,
            title: query,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...chats,
        ]);
      }
      const res = await axios.post("/api/chats/messages", {
        chat_id: chat_id,
        query,
        response,
      });
    } catch (error) {
      toast.error("Failed to add message", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const fetchMessages = async (chat_id: string) => {
    if (!user || !chat_id) return;
    setIsLoadingMessages(true);
    try {
      const res = await axios.get("/api/chats/messages", {
        params: { chat_id: chat_id },
      });
      const fetchedMessages = res.data;

      if (fetchedMessages && fetchedMessages.length > 0) {
        const transformedMessages: UIMessage[] = fetchedMessages
          .map((msg: FetchedMessage) => {
            const messages: UIMessage[] = [];

            if (msg.query) {
              messages.push({
                id: `${msg.id}-user`,
                role: "user",
                parts: [{ type: "text", text: msg.query }],
              });
            }

            if (msg.response) {
              messages.push({
                id: `${msg.id}-assistant`,
                role: "assistant",
                parts: [{ type: "text", text: msg.response }],
              });
            }

            return messages;
          })
          .flat()
          .sort((a: UIMessage, b: UIMessage) => {
            const aId: number = parseInt(a.id.split("-")[0]);
            const bId: number = parseInt(b.id.split("-")[0]);
            return aId - bId;
          });

        setMessages(transformedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (status === "ready") {
      if (messages.length > 0 && messages.at(-1)?.role === "assistant") {
        const lastMessage = messages.at(-1);
        if (lastMessage) {
          const responseText = lastMessage.parts;
          responseText.forEach((part) => {
            if (part.type === "text") {
              const text = part.text;
              const extractedSuggestions = text.includes("Suggested Follow-ups")
                ? text
                    .split("\n")
                    .slice(-3)
                    .map((s) => s.replace(/^- /, "").trim())
                : [];
              setSuggestions(extractedSuggestions);
            }
          });
        }
      }
      if (messages.length > 1) {
        const lastUserMessage = messages
          .slice()
          .reverse()
          .find((msg) => msg.role === "user");
        const lastAssistantMessage = messages
          .slice()
          .reverse()
          .find((msg) => msg.role === "assistant");
        if (lastUserMessage && lastAssistantMessage) {
          const userText = lastUserMessage.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("");
          const assistantText = lastAssistantMessage.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("");
          addMessage(userText, assistantText);
        }
      }
    }
  }, [status]);

  return (
    <div className="max-w-4xl mt-7 mx-auto p-6 relative size-full h-[96vh]">
      <div className="flex flex-col h-full">
        {!currentChatId && messages.length === 0 ? (
          <WelcomeCard
            onMoodSelect={(mood) =>
              sendMessage({ text: `I am feeling ${mood} today` })
            }
            onQuestionSelect={(question: string) =>
              sendMessage({ text: question })
            }
          />
        ) : (
          <Conversation className="h-full">
            <ConversationContent>
              {isLoadingMessages && (
                <div className="flex justify-center items-center p-4">
                  <Loader />
                  <span className="ml-2">Loading chat history...</span>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id}>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>
                                {
                                  part.text.split(
                                    "**Suggested Follow-ups:**"
                                  )[0]
                                }
                              </Response>
                            </MessageContent>
                          </Message>
                          {message.role === "assistant" && (
                            <Actions>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      );
                    }
                  })}
                </div>
              ))}
              {status === "submitted" && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            {status === "ready" ? (
              <Suggestions>
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    onClick={handleSuggestionClick}
                    suggestion={suggestion}
                  />
                ))}
              </Suggestions>
            ) : (
              <PromptInputTools></PromptInputTools>
            )}
            <PromptInputSubmit
              className="ml-2"
              disabled={!input && !status}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatComponent;
