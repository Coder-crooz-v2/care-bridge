import { Chat } from "@/types/chat";
import { create } from "zustand";

interface ChatListState {
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
}

export const useChatList = create<ChatListState>((set) => ({
  chats: [],
  setChats: (chats) => set({ chats }),
}));
