"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

let socket: Socket | null = null;

export function useSocket() {
  const { data: session } = useSession();
  const initialized = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || initialized.current) return;
    initialized.current = true;

    socket = io(process.env.NEXT_PUBLIC_APP_URL ?? "", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket?.emit("authenticate", session.user.id);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
    });

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, [session?.user?.id]);

  return socket;
}

export function getSocket() {
  return socket;
}
