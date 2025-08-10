"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ShareButton from "./components/ToggleButton";
import ChatComponent from "./components/ChatComponent";

function ChatInterfaceContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    const id = searchParams.get("id");
    setChatId(id);
    setCurrentChatId(id);
  }, [searchParams]);

  // Update currentChatId when URL changes
  useEffect(() => {
    if (mounted) {
      const id = searchParams.get("id");
      setCurrentChatId(id);
    }
  }, [searchParams, mounted]);

  const handleChatCreated = (newChatId: string) => {
    // Update URL with new chat ID
    router.push(`/dashboard/chat?id=${newChatId}`);
    setCurrentChatId(newChatId);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

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

export default function ChatInterface() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full w-full">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      }
    >
      <ChatInterfaceContent />
    </Suspense>
  );
}
