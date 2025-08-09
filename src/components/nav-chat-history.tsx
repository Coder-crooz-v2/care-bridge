"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuth";
import { ChatService } from "@/lib/chat-service";
import { Chat } from "@/types/chat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NavChatHistoryProps {
  activeChatId?: string;
}

export function NavChatHistory({ activeChatId }: NavChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

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

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ChatService.deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      toast.success("Chat deleted successfully");

      // If the deleted chat was active, redirect to new chat
      if (chatId === activeChatId) {
        router.push("/dashboard/chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
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

  if (!user) return null;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Chat History">
                <MessageSquare />
                <span>Chat History</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {/* New Chat Button */}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={handleNewChat}>
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                {/* Chat History */}
                {loading ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <SidebarMenuSubItem key={i}>
                        <div className="h-8 bg-secondary/50 rounded animate-pulse mx-2" />
                      </SidebarMenuSubItem>
                    ))}
                  </>
                ) : chats.length === 0 ? (
                  <SidebarMenuSubItem>
                    <div className="text-center text-muted-foreground p-2 text-xs">
                      No chats yet
                    </div>
                  </SidebarMenuSubItem>
                ) : (
                  <>
                    {chats.slice(0, 10).map((chat) => (
                      <SidebarMenuSubItem key={chat.id}>
                        <SidebarMenuSubButton
                          onClick={() => handleChatSelect(chat.id)}
                          isActive={chat.id === activeChatId}
                          className="group relative"
                        >
                          <div className="flex-1 min-w-0">
                            <abbr
                              title={chat.title}
                              className="block no-underline"
                            >
                              <div className="truncate text-sm">
                                {chat.title}
                              </div>
                            </abbr>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 ml-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
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
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
