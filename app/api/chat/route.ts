// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/chat - list connections/conversations
export async function GET(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    // Get single conversation messages
    if (connectionId) {
      const page = parseInt(searchParams.get("page") ?? "1");
      const limit = 50;
      const skip = (page - 1) * limit;

      // Verify user is part of this connection
      const connection = await db.connection.findFirst({
        where: {
          id: connectionId,
          OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
        },
      });

      if (!connection) {
        return NextResponse.json({ success: false, error: "Connection not found" }, { status: 404 });
      }

      const messages = await db.chatMessage.findMany({
        where: { connectionId, isDeleted: false },
        include: {
          sender: {
            include: {
              profile: { select: { fullName: true } },
              photos: { where: { isProfile: true }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      // Mark messages as read
      await db.chatMessage.updateMany({
        where: {
          connectionId,
          senderId: { not: session.user.id },
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        data: { messages: messages.reverse(), connection },
      });
    }

    // Get all conversations
    const connections = await db.connection.findMany({
      where: {
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
        isActive: true,
      },
      include: {
        user1: {
          include: {
            profile: { select: { fullName: true, workLocation: true } },
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
        user2: {
          include: {
            profile: { select: { fullName: true, workLocation: true } },
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: session.user.id },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: connections });
  } catch (err) {
    console.error("[GET_CHAT]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/chat - send message (REST fallback, main via socket)
export async function POST(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId, content, messageType = "text", mediaUrl } = await req.json();

    // Verify connection
    const connection = await db.connection.findFirst({
      where: {
        id: connectionId,
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
        isActive: true,
      },
    });

    if (!connection) {
      return NextResponse.json({ success: false, error: "Connection not found" }, { status: 404 });
    }

    // Check daily message limit for free users
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });
    if (subscription?.plan === "FREE") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sentToday = await db.chatMessage.count({
        where: { senderId: session.user.id, createdAt: { gte: today } },
      });
      if (sentToday >= 10) {
        return NextResponse.json(
          { success: false, error: "Daily message limit reached. Upgrade to Premium." },
          { status: 429 }
        );
      }
    }

    const message = await db.chatMessage.create({
      data: {
        connectionId,
        senderId: session.user.id,
        content,
        messageType,
        mediaUrl,
      },
      include: {
        sender: {
          include: {
            profile: { select: { fullName: true } },
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
      },
    });

    // Notify receiver
    const receiverId = connection.user1Id === session.user.id ? connection.user2Id : connection.user1Id;
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "new_message",
        title: "New Message",
        body: `${message.sender.profile?.fullName ?? "Someone"} sent you a message`,
        data: { connectionId, senderId: session.user.id },
      },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (err) {
    console.error("[SEND_MESSAGE]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/chat - delete message
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await req.json();

    const message = await db.chatMessage.findUnique({ where: { id: messageId } });
    if (!message || message.senderId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    // Allow delete within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      return NextResponse.json({ success: false, error: "Message can only be deleted within 5 minutes" }, { status: 403 });
    }

    await db.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_MESSAGE]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
