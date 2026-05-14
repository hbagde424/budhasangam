// app/api/connections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/connections
export async function GET() {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const connections = await db.connection.findMany({
      where: {
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
        isActive: true,
      },
      include: {
        user1: {
          include: {
            profile: true,
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
        user2: {
          include: {
            profile: true,
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          where: { isDeleted: false },
        },
        _count: {
          select: {
            messages: {
              where: { senderId: { not: session.user.id }, isRead: false },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: connections });
  } catch (err) {
    console.error("[GET_CONNECTIONS]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/connections - unmatch
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId } = await req.json();

    const connection = await db.connection.findFirst({
      where: {
        id: connectionId,
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
      },
    });

    if (!connection) {
      return NextResponse.json({ success: false, error: "Connection not found" }, { status: 404 });
    }

    await db.connection.update({
      where: { id: connectionId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Connection removed" });
  } catch (err) {
    console.error("[DELETE_CONNECTION]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
