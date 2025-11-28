"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { VitalSigns } from "../types";
import { useAuthStore } from "@/store/useAuth";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const useSocketConnection = () => {
  const [vitalData, setVitalData] = useState<VitalSigns[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  function getUserId(): string {
    if (typeof window === "undefined") return "server-side";

    let userId = user?.id;
    if (!userId) {
      // Generate a unique ID for this session
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return user?.id || userId;
  }

  useEffect(() => {
    // Get or create userId for this session
    const userId = getUserId();

    // Initialize Socket.IO connection with userId
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      query: {
        userId, // Send userId to server for deterministic seeding
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    socket.on("vital-signs", (data: VitalSigns) => {
      console.log("Received vital signs:", data);
      setVitalData((prevData) => {
        const newData = [...prevData, data];
        // Keep data within the maximum time range (1 hour)
        const now = Date.now();
        const filtered = newData.filter((d) => {
          const timestamp = new Date(d.timestamp).getTime();
          return now - timestamp <= 60 * 60 * 1000; // 1 hour
        });
        return filtered;
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { vitalData, isConnected };
};
