"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/useAuth";
import { ChatService } from "@/lib/chat-service";
import { Chat } from "@/types/chat";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ChatHistoryProps {
  activeChatId?: string;
}

export function ChatHistory({ activeChatId }: ChatHistoryProps) {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  // Refresh chats when active chat changes (new chat created)
  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [activeChatId]);

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

  const handleNewChat = () => {
    router.push("/dashboard/chat");
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/dashboard/chat?id=${chatId}`);
  };

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      const success = await ChatService.deleteChat(chatId);
      if (success) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        toast.success("Chat deleted successfully");

        // If the deleted chat is currently active, redirect to new chat
        if (chatId === activeChatId) {
          router.push("/dashboard/chat");
        }
      } else {
        toast.error("Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <MessageSquare className="mr-2 h-4 w-4" />
        Chat History
      </SidebarGroupLabel>
      <SidebarGroupAction title="New Chat">
        <Button
          size="sm"
          onClick={handleNewChat}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <SidebarMenuItem key={i}>
                  <div className="h-8 bg-secondary/50 rounded animate-pulse" />
                </SidebarMenuItem>
              ))}
            </>
          ) : chats.length === 0 ? (
            <SidebarMenuItem>
              <div className="text-center text-muted-foreground p-4">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No chats yet</p>
                <p className="text-xs opacity-70">Start a new conversation</p>
              </div>
            </SidebarMenuItem>
          ) : (
            <>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    onClick={() => handleChatSelect(chat.id)}
                    isActive={chat.id === activeChatId}
                    className="group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-3 w-3 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {chat.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(chat.updated_at)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
