export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  content: string;
  sender: "user" | "ai";
  suggested_follow_ups?: string[];
  created_at: string;
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}
