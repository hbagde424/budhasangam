// app/api/interests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendInterestEmail, sendConnectionAcceptedEmail } from "@/lib/email";
import { emitToUser } from "@/lib/socket";

// GET /api/interests - list interests
export async function GET(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "received"; // received | sent
    const status = searchParams.get("status") ?? undefined;

    const where: any =
      type === "received"
        ? { toUserId: session.user.id }
        : { fromUserId: session.user.id };

    if (status) where.status = status;

    const interests = await db.interest.findMany({
      where,
      include: {
        fromUser: {
          include: {
            profile: true,
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
        toUser: {
          include: {
            profile: true,
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: interests });
  } catch (err) {
    console.error("[GET_INTERESTS]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/interests - send interest
export async function POST(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { toUserId, message } = await req.json();

    if (!toUserId) {
      return NextResponse.json({ success: false, error: "Target user required" }, { status: 400 });
    }

    if (toUserId === session.user.id) {
      return NextResponse.json({ success: false, error: "Cannot send interest to yourself" }, { status: 400 });
    }

    // Check daily limit for free users
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });
    if (subscription?.plan === "FREE") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sentToday = await db.interest.count({
        where: { fromUserId: session.user.id, createdAt: { gte: today } },
      });
      if (sentToday >= 5) {
        return NextResponse.json(
          { success: false, error: "Daily interest limit reached. Upgrade to Premium for unlimited interests." },
          { status: 429 }
        );
      }
    }

    // Check if already sent
    const existing = await db.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: session.user.id, toUserId } },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Interest already sent to this profile" },
        { status: 409 }
      );
    }

    const interest = await db.interest.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        message: message?.slice(0, 255),
        status: "PENDING",
      },
      include: {
        fromUser: { include: { profile: true } },
        toUser: { select: { email: true, profile: true } },
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: toUserId,
        type: "interest_received",
        title: "New Interest Received!",
        body: `${interest.fromUser.profile?.fullName ?? "Someone"} has sent you an interest.`,
        data: { interestId: interest.id, fromUserId: session.user.id },
      },
    });

    // Real-time emit
    emitToUser(toUserId, "new_interest", { interest });

    // Email notification (non-blocking)
    if (interest.toUser.email && interest.toUser.profile) {
      sendInterestEmail(
        interest.toUser.email,
        interest.toUser.profile.fullName,
        interest.fromUser.profile?.fullName ?? "Someone",
        interest.fromUser.profile?.workLocation ?? "",
        message
      ).catch(console.error);
    }

    return NextResponse.json({ success: true, data: interest }, { status: 201 });
  } catch (err) {
    console.error("[SEND_INTEREST]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/interests - respond to interest
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { interestId, action } = await req.json(); // action: ACCEPTED | DECLINED | BLOCKED

    const interest = await db.interest.findUnique({
      where: { id: interestId },
      include: {
        fromUser: { include: { profile: true } },
        toUser: { include: { profile: true } },
      },
    });

    if (!interest || interest.toUserId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Interest not found" }, { status: 404 });
    }

    if (interest.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Interest already responded to" }, { status: 409 });
    }

    await db.$transaction(async (tx) => {
      // Update interest status
      await tx.interest.update({
        where: { id: interestId },
        data: {
          status: action,
          respondedAt: new Date(),
        },
      });

      // If accepted, create connection
      if (action === "ACCEPTED") {
        const [u1, u2] = [interest.fromUserId, interest.toUserId].sort();
        await tx.connection.upsert({
          where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
          create: { user1Id: u1, user2Id: u2 },
          update: { isActive: true },
        });
      }

      // Notify sender
      await tx.notification.create({
        data: {
          userId: interest.fromUserId,
          type: action === "ACCEPTED" ? "interest_accepted" : "interest_declined",
          title: action === "ACCEPTED" ? "Interest Accepted! 🎉" : "Interest Update",
          body: action === "ACCEPTED"
            ? `${interest.toUser.profile?.fullName} accepted your interest. Start chatting now!`
            : `${interest.toUser.profile?.fullName} has declined your interest.`,
          data: { interestId },
        },
      });
    });

    if (action === "ACCEPTED") {
      emitToUser(interest.fromUserId, "interest_accepted", {
        interestId,
        acceptorName: interest.toUser.profile?.fullName,
      });

      // Email (non-blocking)
      if (interest.fromUser.email) {
        sendConnectionAcceptedEmail(
          interest.fromUser.email,
          interest.fromUser.profile?.fullName ?? "Friend",
          interest.toUser.profile?.fullName ?? "Someone"
        ).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, message: `Interest ${action.toLowerCase()}` });
  } catch (err) {
    console.error("[RESPOND_INTEREST]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
