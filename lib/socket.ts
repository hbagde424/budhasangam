// lib/socket.ts
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { db } from "./db";

let io: SocketIOServer;

export function initSocketIO(server: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join personal room on auth
    socket.on("authenticate", (userId: string) => {
      socket.join(`user:${userId}`);
      socket.data.userId = userId;
      console.log(`[Socket] User ${userId} joined room`);
    });

    // Join connection (chat) room
    socket.on("join_chat", (connectionId: string) => {
      socket.join(`chat:${connectionId}`);
    });

    // Leave chat room
    socket.on("leave_chat", (connectionId: string) => {
      socket.leave(`chat:${connectionId}`);
    });

    // Send message
    socket.on("send_message", async (data: {
      connectionId: string;
      receiverId: string;
      content: string;
      messageType?: string;
      mediaUrl?: string;
      tempId?: string;
    }) => {
      try {
        const senderId = socket.data.userId;
        if (!senderId) return;

        const message = await db.chatMessage.create({
          data: {
            connectionId: data.connectionId,
            senderId,
            content: data.content,
            messageType: data.messageType ?? "text",
            mediaUrl: data.mediaUrl,
          },
          include: { sender: { include: { profile: true } } },
        });

        // Emit to both users in the chat room
        io.to(`chat:${data.connectionId}`).emit("new_message", {
          ...message,
          tempId: data.tempId,
        });

        // Notify receiver if not in the chat room
        io.to(`user:${data.receiverId}`).emit("message_notification", {
          connectionId: data.connectionId,
          message,
        });
      } catch (err) {
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing_start", ({ connectionId, userId }: { connectionId: string; userId: string }) => {
      socket.to(`chat:${connectionId}`).emit("user_typing", { userId, connectionId });
    });

    socket.on("typing_stop", ({ connectionId, userId }: { connectionId: string; userId: string }) => {
      socket.to(`chat:${connectionId}`).emit("user_stopped_typing", { userId, connectionId });
    });

    // Mark messages as read
    socket.on("mark_read", async ({ connectionId, senderId }: { connectionId: string; senderId: string }) => {
      try {
        await db.chatMessage.updateMany({
          where: { connectionId, senderId, isRead: false },
          data: { isRead: true, readAt: new Date() },
        });
        io.to(`user:${senderId}`).emit("messages_read", { connectionId });
      } catch {}
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

// Emit to specific user
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
