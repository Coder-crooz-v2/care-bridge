"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  chatId?: string;
}

export default function ShareButton({ chatId }: ShareButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    if (!chatId) {
      toast.error("No chat to share");
      return;
    }

    try {
      // Generate share URL
      const shareUrl = `${window.location.origin}/dashboard/chat?id=${chatId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      setIsShared(true);
      toast.success("Chat link copied to clipboard!");

      // Reset after 2 seconds
      setTimeout(() => {
        setIsShared(false);
      }, 2000);
    } catch (error) {
      console.error("Error sharing chat:", error);
      toast.error("Failed to copy chat link");
    }
  };

  return (
    <div className="absolute bg-primary right-12 top-10 z-20 rounded-full flex items-center justify-center">
      <div
        className="hover:cursor-pointer flex rounded-full items-center overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleShare}
      >
        {isShared ? (
          <Check className="h-4 w-4 text-primary-foreground m-2" />
        ) : (
          <Share2 className="h-4 w-4 text-primary-foreground m-2" />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: 1,
                x: 0,
                width: isShared ? "70px" : "90px",
              }}
              exit={{
                opacity: 0,
                width: 0,
                transition: { duration: 0.3 },
              }}
              transition={{ duration: 0.3 }}
              className="rounded-full py-1"
            >
              <span className="text-primary-foreground whitespace-nowrap">
                {isShared ? "Copied!" : "Share Chat"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
