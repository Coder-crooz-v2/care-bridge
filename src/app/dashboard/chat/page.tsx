"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ShareButton from "./components/ToggleButton";
import ChatComponent from "./components/ChatComponent";

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get("id");
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId);

  // Update currentChatId when URL changes
  useEffect(() => {
    setCurrentChatId(chatId);
  }, [chatId]);

  const handleChatCreated = (newChatId: string) => {
    // Update URL with new chat ID
    router.push(`/dashboard/chat?id=${newChatId}`);
    setCurrentChatId(newChatId);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Share Button - only show if there's a chat to share */}
      {currentChatId && <ShareButton chatId={currentChatId} />}

      <div className="flex-1 flex">
        <ChatComponent
          chatId={chatId || undefined}
          onChatCreated={handleChatCreated}
        />
      </div>
    </div>
  );
}
