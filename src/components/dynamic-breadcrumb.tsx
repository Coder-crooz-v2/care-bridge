"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MessageSquare, Plus } from "lucide-react";
import { useAuthStore } from "@/store/useAuth";
import { ChatService } from "@/lib/chat-service";
import { Chat } from "@/types/chat";
import { toast } from "sonner";

export function DynamicBreadcrumb() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get("id");

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find((c) => c.id === chatId);
      setCurrentChat(chat || null);
    } else {
      setCurrentChat(null);
    }
  }, [chatId, chats]);

  const loadChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userChats = await ChatService.getUserChats(user.id);
      setChats(userChats);
    } catch (error) {
      console.error("Error loading chats:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (selectedChatId: string) => {
    router.push(`/dashboard/chat?id=${selectedChatId}`);
  };

  const handleNewChat = () => {
    router.push("/dashboard/chat");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    const diffDays = Math.floor(diffInHours / 24) + 1;

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
              <BreadcrumbLink className="flex items-center gap-1 font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">Chat History</span>
                <span className="sm:hidden">Chats</span>
              </BreadcrumbLink>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-72 sm:w-80 max-h-80 sm:max-h-96 overflow-y-auto"
            >
              {/* New Chat Option */}
              <DropdownMenuItem
                onClick={handleNewChat}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </DropdownMenuItem>

              {/* Separator */}
              {chats.length > 0 && <div className="border-t my-1" />}

              {/* Chat History */}
              {loading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <DropdownMenuItem key={i} disabled>
                      <div className="h-4 bg-secondary/50 rounded animate-pulse w-full" />
                    </DropdownMenuItem>
                  ))}
                </>
              ) : chats.length === 0 ? (
                <DropdownMenuItem disabled>
                  <div className="text-center text-muted-foreground text-sm w-full">
                    No chats yet
                  </div>
                </DropdownMenuItem>
              ) : (
                <>
                  {chats.slice(0, 8).map((chat) => (
                    <DropdownMenuItem
                      key={chat.id}
                      onClick={() => handleChatSelect(chat.id)}
                      className={`flex flex-col items-start gap-1 p-2 sm:p-3 mb-1 ${
                        chat.id === chatId ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <MessageSquare className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium truncate flex-1 text-sm">
                          {chat.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-5">
                        {formatDate(chat.updated_at)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {chats.length > 8 && (
                    <DropdownMenuItem disabled>
                      <div className="text-center text-muted-foreground text-xs w-full">
                        +{chats.length - 8} more chats...
                      </div>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        {currentChat && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[120px] sm:max-w-[200px] md:max-w-full truncate text-sm sm:text-base">
                {currentChat.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
