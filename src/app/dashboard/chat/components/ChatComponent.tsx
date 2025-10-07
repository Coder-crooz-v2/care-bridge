"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Fragment, use, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";
import { DefaultChatTransport, FileUIPart, UIMessage } from "ai";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuth";
import { useChatList } from "@/store/useChatList";
import { Action, Actions } from "@/components/ai-elements/actions";
import { CopyIcon, GlobeIcon } from "lucide-react";
import WelcomeCard from "./WelcomeCard";
import { models } from "@/constants/models";
import { da } from "date-fns/locale";

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
  const [model, setModel] = useState(models[0].id);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [items, setItems] = useState<(FileUIPart & { id: string })[]>([]);
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

  const processFiles = async (messages: PromptInputMessage) => {
    if (messages.files) {
      return await Promise.all(
        Array.from(messages.files).map(
          (file) =>
            new Promise<{
              type: "file";
              filename: string;
              mediaType: string;
              url: string;
            }>(async (resolve, reject) => {
              const res = await fetch(file.url);
              const blob = await res.blob();
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  type: "file",
                  filename: file.filename || "upload.dat",
                  mediaType: file.type,
                  url: reader.result as string, // Data URL
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        )
      );
    }
    return [];
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasFiles = Boolean(message.files?.length);
    const payload = await processFiles(message);
    console.log(message.files);
    if (!(hasText || hasFiles)) {
      return;
    }

    console.log(model);

    sendMessage(
      {
        role: "user",
        parts: [
          {
            type: "text",
            text: message.text || "Sent with attachments",
          },
          ...payload,
        ],
      },
      {
        body: {
          model,
          useWebSearch,
        },
      }
    );

    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      { text: suggestion, files: undefined },
      {
        body: { model },
      }
    );
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
          .flat();

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
              sendMessage(
                { text: `I am feeling ${mood} today` },
                { body: { model } }
              )
            }
            onQuestionSelect={(question: string) =>
              sendMessage({ text: question }, { body: { model } })
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
        {status === "ready" && (
          <Suggestions>
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
          maxFiles={2}
          maxFileSize={10 * 1024 * 512} // 5MB
          onError={(error) => {
            toast.error("File upload error", {
              description: (
                error as {
                  code: string;
                  message: string;
                }
              ).message,
            });
          }}
          items={items}
          setItems={setItems}
          model={model}
          setModel={setModel}
        >
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger
                  disabled={
                    items.length > 0 &&
                    model !== "meta-llama/llama-4-scout-17b-16e-instruct"
                  }
                />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                onClick={() => {
                  setUseWebSearch(!useWebSearch);
                  setModel(models[0].id);
                }}
                variant={useWebSearch ? "default" : "ghost"}
                disabled={items.length > 0}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models
                    .filter((model) =>
                      useWebSearch ? model.webSearch === useWebSearch : true
                    )
                    .filter((model) =>
                      items.length === 0 ? true : model.files
                    )
                    .map((model) => (
                      <PromptInputModelSelectItem
                        key={model.id}
                        value={model.id}
                      >
                        {model.name}
                      </PromptInputModelSelectItem>
                    ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
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
