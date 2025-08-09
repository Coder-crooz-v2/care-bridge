import { createClient } from "@/utils/supabase/client";
import { Chat, ChatMessage, ChatWithMessages } from "@/types/chat";

export class ChatService {
  private static supabase = createClient();

  // Create a new chat
  static async createChat(userId: string, title: string): Promise<Chat | null> {
    try {
      const { data, error } = await this.supabase
        .from("chats")
        .insert({
          user_id: userId,
          title,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating chat:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  }

  // Get all chats for a user
  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const { data, error } = await this.supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching user chats:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching user chats:", error);
      return [];
    }
  }

  // Get a specific chat with its messages
  static async getChatWithMessages(
    chatId: string
  ): Promise<ChatWithMessages | null> {
    console.log("ChatService: Getting chat with messages for ID:", chatId);

    try {
      // Get chat details
      const { data: chat, error: chatError } = await this.supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      console.log("ChatService: Chat data:", chat, "Chat error:", chatError);

      if (chatError) {
        console.error("Error fetching chat:", chatError);
        return null;
      }

      // Get chat messages
      const { data: messages, error: messagesError } = await this.supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      console.log(
        "ChatService: Messages data:",
        messages,
        "Messages error:",
        messagesError
      );

      if (messagesError) {
        console.error("Error fetching chat messages:", messagesError);
        return null;
      }

      const result = {
        ...chat,
        messages: messages || [],
      };

      console.log("ChatService: Returning chat with messages:", result);

      return result;
    } catch (error) {
      console.error("Error fetching chat with messages:", error);
      return null;
    }
  }

  // Add a message to a chat
  static async addMessage(
    chatId: string,
    content: string,
    sender: "user" | "ai",
    suggestedFollowUps?: string[]
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await this.supabase
        .from("chat_messages")
        .insert({
          chat_id: chatId,
          content,
          sender,
          suggested_follow_ups: suggestedFollowUps || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding message:", error);
        return null;
      }

      // Update the chat's updated_at timestamp
      await this.supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);

      return data;
    } catch (error) {
      console.error("Error adding message:", error);
      return null;
    }
  }

  // Update chat title
  static async updateChatTitle(
    chatId: string,
    title: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("chats")
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chatId);

      if (error) {
        console.error("Error updating chat title:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating chat title:", error);
      return false;
    }
  }

  // Delete a chat and all its messages
  static async deleteChat(chatId: string): Promise<boolean> {
    try {
      // Delete messages first (due to foreign key constraint)
      const { error: messagesError } = await this.supabase
        .from("chat_messages")
        .delete()
        .eq("chat_id", chatId);

      if (messagesError) {
        console.error("Error deleting chat messages:", messagesError);
        return false;
      }

      // Delete the chat
      const { error: chatError } = await this.supabase
        .from("chats")
        .delete()
        .eq("id", chatId);

      if (chatError) {
        console.error("Error deleting chat:", chatError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting chat:", error);
      return false;
    }
  }

  // Generate a title from the first user message
  static generateChatTitle(firstMessage: string): string {
    // Take first 50 characters and add ellipsis if longer
    const maxLength = 50;
    if (firstMessage.length <= maxLength) {
      return firstMessage;
    }
    return firstMessage.substring(0, maxLength).trim() + "...";
  }
}
