"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import copy from "copy-to-clipboard";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuth";
import { ChatService } from "@/lib/chat-service";
import WelcomeCard from "./WelcomeCard";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestedFollowUps?: string[];
};

interface ChatComponentProps {
  chatId?: string;
  onChatCreated?: (chatId: string) => void;
}

export default function ChatComponent({
  chatId,
  onChatCreated,
}: ChatComponentProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    chatId || null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages on mount or when chatId changes
  useEffect(() => {
    setCurrentChatId(chatId || null);
  }, [chatId]);

  useEffect(() => {
    if (currentChatId && user) {
      loadChatMessages();
    } else {
      // New chat or no chatId - show welcome card
      setMessages([]);
      setShowWelcomeCard(true);
    }
  }, [currentChatId, user]);

  // Load messages from Supabase
  const loadChatMessages = async () => {
    if (!currentChatId || !user) return;

    console.log("Loading chat messages for:", currentChatId, "user:", user.id);

    try {
      const chatWithMessages = await ChatService.getChatWithMessages(
        currentChatId
      );
      console.log("Loaded chat with messages:", chatWithMessages);

      if (chatWithMessages) {
        const formattedMessages: Message[] = chatWithMessages.messages.map(
          (msg) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.created_at),
            suggestedFollowUps: msg.suggested_follow_ups || [],
          })
        );
        console.log("Formatted messages:", formattedMessages);
        setMessages(formattedMessages);
        setShowWelcomeCard(formattedMessages.length === 0);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
      toast.error("Failed to load chat messages");
    }
  };

  useEffect(() => {
    // Only auto-scroll when a new message is added
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Check scroll position to determine if we need the scroll button
  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollableArea = document.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (!scrollableArea) return;

      const isAtBottom =
        Math.abs(
          scrollableArea.scrollHeight -
            scrollableArea.scrollTop -
            scrollableArea.clientHeight
        ) < 50;
      setShowScrollButton(!isAtBottom);
    };

    const scrollableArea = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollableArea) {
      scrollableArea.addEventListener("scroll", checkScrollPosition);
      // Run check initially
      checkScrollPosition();
      return () =>
        scrollableArea.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to copy text to clipboard with visual feedback
  const copyToClipboard = (text: string, messageId: string) => {
    copy(text);
    setCopiedMessageId(messageId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const handleSendMessage = async (input: string) => {
    if (input.trim() === "" || !user) return;

    console.log("Sending message:", input, "current chat ID:", currentChatId);

    let activeChatId = currentChatId;

    // Create new chat if this is the first message
    if (!activeChatId) {
      console.log("Creating new chat...");
      const title = ChatService.generateChatTitle(input);
      const newChat = await ChatService.createChat(user.id, title);

      console.log("New chat created:", newChat);

      if (!newChat) {
        toast.error("Failed to create new chat");
        return;
      }

      activeChatId = newChat.id;
      setCurrentChatId(activeChatId);

      // Notify parent component about new chat creation
      if (onChatCreated) {
        console.log("Notifying parent about new chat:", activeChatId);
        onChatCreated(activeChatId);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    console.log("Adding user message to UI:", userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    if (showWelcomeCard) {
      setShowWelcomeCard(false);
    }

    // Save user message to Supabase
    try {
      console.log("Saving user message to DB...");
      await ChatService.addMessage(activeChatId, input, "user");
      console.log("User message saved successfully");
    } catch (error) {
      console.error("Error saving user message:", error);
      // Continue with local message even if save fails
    }

    // Create initial AI message with empty content for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const initialAiMessage: Message = {
      id: aiMessageId,
      content: "",
      sender: "ai",
      timestamp: new Date(),
      suggestedFollowUps: [],
    };

    console.log("Adding initial AI message to UI:", initialAiMessage);
    setMessages((prev) => [...prev, initialAiMessage]);
    setStreamingMessageId(aiMessageId);

    const aiResponse = await getAIResponse(input, aiMessageId, activeChatId);

    setIsTyping(false);
    setStreamingMessageId(null);
  };

  // Handle form submission with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const getAIResponse = async (
    userInput: string,
    messageId: string,
    chatId: string
  ) => {
    try {
      // Get context from last two messages for memory illusion
      const context = messages
        .slice(-4) // Get last 4 messages (2 user + 2 AI)
        .map((msg) => `${msg.sender}: ${msg.content}`)
        .join("\n");

      const response = await fetch("/api/chat-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          context: context || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              // Streaming is complete, now extract and separate suggested follow-ups
              const { cleanContent, suggestedFollowUps } =
                extractFollowUpsFromContent(fullContent);

              // Update message with clean content (without follow-ups) and follow-ups separately
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, content: cleanContent, suggestedFollowUps }
                    : msg
                )
              );

              // Save AI response to Supabase
              ChatService.addMessage(
                chatId,
                cleanContent,
                "ai",
                suggestedFollowUps
              )
                .then(() => {
                  console.log("AI response saved successfully");
                })
                .catch((error) => {
                  console.error("Error saving AI message:", error);
                });

              return {
                content: cleanContent,
                suggestedFollowUps,
              };
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;

                // For streaming display, show full content with follow-ups during typing
                // but we'll clean it up at the end
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }

      return {
        content: fullContent,
        suggestedFollowUps: [],
      };
    } catch (error) {
      const errorMessage =
        "Sorry, I couldn't process your request at the moment. Please try again later.";
      console.log("Error getting AI response:", error);
      // Update the message with error content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: errorMessage } : msg
        )
      );

      // Save error message to Supabase
      try {
        await ChatService.addMessage(chatId, errorMessage, "ai");
      } catch (saveError) {
        console.error("Error saving error message:", saveError);
      }

      if (error instanceof AxiosError) {
        toast.error(`Error: ${error.message}`);
      } else if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      return {
        content: errorMessage,
        suggestedFollowUps: [],
      };
    }
  };

  const extractFollowUpsFromContent = (content: string) => {
    // Extract suggested follow-ups from the response content
    let suggestedFollowUps: string[] = [];
    let cleanContent = content;

    // Look for suggested follow-ups pattern in the markdown format
    const followUpPattern =
      /\*\*Suggested Follow-ups:\*\*\s*\n((?:- .+\n?)+)/gi;
    const match = followUpPattern.exec(content);

    if (match) {
      // Extract follow-ups
      const followUpText = match[1];
      suggestedFollowUps = followUpText
        .split("\n")
        .map((line) => line.replace(/^- /, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 3); // Limit to 3 follow-ups

      // Remove follow-ups section and everything after the separator line
      cleanContent = content.replace(/---\s*\n[\s\S]*$/, "").trim();
    }

    return { cleanContent, suggestedFollowUps };
  };

  // Custom components for markdown rendering with themed heading colors
  const MarkdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1
        className="text-2xl font-bold mt-6 mb-4 text-secondary-foreground"
        {...props}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        className="text-xl font-bold mt-5 mb-3 text-secondary-foreground"
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => {
      const content = props.children?.toString().toLowerCase() || "";
      let colorClass = "text-primary";

      if (content.includes("possible cause")) colorClass = "text-primary";
      else if (content.includes("likely triggers")) colorClass = "text-warning";
      else if (content.includes("what you can do")) colorClass = "text-success";
      else if (content.includes("prevention"))
        colorClass = "text-medical-prevention";
      else if (
        content.includes("see a doctor") ||
        content.includes("seek medical")
      )
        colorClass = "text-destructive";

      return (
        <h3
          className={`text-lg font-semibold mt-4 mb-2 ${colorClass}`}
          {...props}
        />
      );
    },
    h4: ({ node, ...props }: any) => (
      <h4
        className="text-base font-semibold mt-3 mb-2 text-muted-foreground"
        {...props}
      />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="my-3 space-y-1 list-disc pl-6" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="my-3 space-y-1 list-decimal pl-6" {...props} />
    ),
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    p: ({ node, ...props }: any) => (
      <p className="mb-3 leading-relaxed" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-muted-foreground" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-foreground" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-secondary/20 rounded-r-md"
        {...props}
      />
    ),
  };

  return (
    <div className="flex flex-col h-full max-h-screen w-full relative">
      {/* Messages container with fixed height */}
      <div className="flex-1 overflow-hidden mt-16">
        <ScrollArea className="h-full w-full px-2 sm:px-4">
          <div className="max-w-4xl mx-auto w-full pt-2 sm:pt-4 space-y-4 sm:space-y-6 pb-4">
            {/* Welcome card */}
            {showWelcomeCard && messages.length === 0 && (
              <WelcomeCard
                onMoodSelect={(mood) => {
                  setShowWelcomeCard(false);
                  handleSendMessage(`I'm feeling ${mood} today`);
                }}
                onQuestionSelect={(question) => {
                  setShowWelcomeCard(false);
                  handleSendMessage(question);
                }}
              />
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  duration: 0.5,
                  bounce: 0.3,
                }}
                className="mb-4 sm:mb-8"
              >
                {message.sender === "user" ? (
                  <div className="mb-2 flex justify-end">
                    <div className="border-border border bg-blue-50 mt-4 sm:mt-10 text-primary px-3 sm:px-6 py-2 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[75%]">
                      <p className="font-medium text-base sm:text-xl leading-relaxed text-primary drop-shadow-sm">
                        {message.content}
                      </p>
                      <p className="text-xs text-right mt-2 opacity-80">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative backdrop-blur-sm rounded-lg mb-4 flex flex-col gap-2 sm:gap-4">
                    {/* AI response content */}
                    <div className="text-card-foreground mr-2 sm:mr-4 p-3 sm:p-4 rounded-lg">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {
                            message.content.split(
                              "**Suggested Follow-ups:**"
                            )[0]
                          }
                        </ReactMarkdown>

                        {/* Bouncing dots loader - show only when this message is being streamed */}
                        {streamingMessageId === message.id && (
                          <div className="inline-flex items-center ml-2">
                            <div className="flex space-x-1">
                              <motion.div
                                className="h-2 w-2 bg-primary rounded-full"
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                              <motion.div
                                className="h-2 w-2 bg-primary rounded-full"
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: 0.1,
                                }}
                              />
                              <motion.div
                                className="h-2 w-2 bg-primary rounded-full"
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: 0.2,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timestamp and copy button */}
                      <div className="w-full flex items-center justify-between mt-4 pt-2 border-t border-border/30">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <AnimatePresence>
                            {copiedMessageId === message.id ? (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-success/10 text-success px-2 py-1 rounded-md text-xs font-medium flex items-center border border-success/20"
                              >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">
                                  Copied!
                                </span>
                                <span className="sm:hidden">✓</span>
                              </motion.div>
                            ) : (
                              <motion.button
                                className="cursor-pointer px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
                                whileHover={{ scale: 1.1, opacity: 1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  copyToClipboard(message.content, message.id)
                                }
                                title="Copy response"
                                initial={{ opacity: 0.7 }}
                              >
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Suggested follow-ups */}
                    {message.suggestedFollowUps &&
                      message.suggestedFollowUps.length > 0 && (
                        <div className="w-full flex gap-1 sm:gap-2 flex-wrap ml-2 sm:ml-4">
                          {message.suggestedFollowUps.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              onClick={() => handleSendMessage(suggestion)}
                              variant="outline"
                              size="sm"
                              className="bg-secondary border border-border rounded-full hover:bg-accent hover:cursor-pointer text-secondary-foreground hover:scale-[102%] transition-all duration-200 text-xs px-2 sm:px-3 py-1 text-left"
                            >
                              <span className="line-clamp-2">{suggestion}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Input area with enhanced design */}
      <div className="p-3 sm:p-6 sm:pt-2 flex-shrink-0 bg-transparent">
        <div className="max-w-4xl mx-auto bg-transparent">
          <motion.div
            className="relative flex gap-2 sm:gap-3 items-center border-2 border-border rounded-lg p-2 px-3 sm:px-4 bg-card shadow-md"
            initial={false}
            whileHover={{
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
              borderColor: "rgba(59, 130, 246, 0.8)",
              transition: { duration: 0.3 },
            }}
            animate={{
              boxShadow: isTyping
                ? [
                    "0 0 0 rgba(37, 99, 235, 0)",
                    "0 0 15px rgba(37, 99, 235, 0.3)",
                    "0 0 0 rgba(37, 99, 235, 0)",
                  ]
                : "0 2px 8px rgba(37, 99, 235, 0.1)",
            }}
            transition={{
              boxShadow: {
                duration: isTyping ? 1.5 : 0.2,
                repeat: isTyping ? Infinity : 0,
              },
            }}
          >
            {/* Pulsing dot animation when AI is typing */}
            {isTyping && (
              <motion.div
                className="absolute -top-8 sm:-top-10 left-0 flex items-center gap-1 bg-secondary px-2 sm:px-3 py-1 rounded-t-lg shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <motion.div
                  className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
                <span className="text-xs text-primary font-medium ml-1 hidden sm:inline">
                  AI is analyzing your question...
                </span>
                <span className="text-xs text-primary font-medium ml-1 sm:hidden">
                  Analyzing...
                </span>
              </motion.div>
            )}

            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (showWelcomeCard && e.target.value.trim() !== "") {
                  setShowWelcomeCard(false);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your health question here..."
              className="border-0 shadow-none focus-visible:ring-0 pr-3 py-3 sm:py-4 text-sm sm:text-base"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleSendMessage(inputValue)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-lg h-9 sm:h-11 px-3 sm:px-5 shadow-md font-medium flex items-center gap-1"
              >
                <span className="hidden sm:inline">Ask</span>
                <Send className="h-4 w-4 sm:ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating down arrow button */}
      <AnimatePresence mode="wait" initial={false}>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.1 } }}
            onClick={() => {
              scrollToBottom();
            }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full p-2 shadow-lg z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-6 sm:h-6"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
