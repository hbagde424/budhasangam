// app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getAuth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// GET /api/admin - dashboard stats
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "stats";

  try {
    if (type === "stats") {
      const [
        totalUsers, activeUsers, maleUsers, femaleUsers,
        premiumUsers, totalMatches, pendingReports, newToday,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { isActive: true, isBlocked: false } }),
        db.profile.count({ where: { gender: "MALE" } }),
        db.profile.count({ where: { gender: "FEMALE" } }),
        db.subscription.count({ where: { plan: { not: "FREE" }, endDate: { gt: new Date() } } }),
        db.connection.count(),
        db.report.count({ where: { status: "PENDING" } }),
        db.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      ]);

      // Tradition breakdown
      const traditions = await db.profile.groupBy({
        by: ["buddhistTradition"],
        _count: { buddhistTradition: true },
      });

      // Last 7 days registrations
      const last7Days = await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          return db.user.count({
            where: { createdAt: { gte: date, lt: nextDate } },
          });
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          totalUsers, activeUsers, maleUsers, femaleUsers,
          premiumUsers, totalMatches, pendingReports, newToday,
          traditions, last7Days,
        },
      });
    }

    if (type === "users") {
      const page = parseInt(searchParams.get("page") ?? "1");
      const limit = 20;
      const search = searchParams.get("search") ?? "";
      const filter = searchParams.get("filter") ?? "all";

      const where: any = {};
      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { profile: { fullName: { contains: search, mode: "insensitive" } } },
        ];
      }
      if (filter === "premium") where.subscription = { plan: { not: "FREE" } };
      if (filter === "blocked") where.isBlocked = true;
      if (filter === "flagged") where.reports = { some: { status: "PENDING" } };

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          include: {
            profile: { select: { fullName: true, buddhistTradition: true, workLocation: true } },
            photos: { where: { isProfile: true }, take: 1 },
            subscription: { select: { plan: true, endDate: true } },
            _count: { select: { interestsSent: true, interestsReceived: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.user.count({ where }),
      ]);

      return NextResponse.json({ success: true, data: { users, total, page, limit } });
    }

    if (type === "reports") {
      const reports = await db.report.findMany({
        where: { status: "PENDING" },
        include: {
          reporter: { include: { profile: { select: { fullName: true } } } },
          reported: { include: { profile: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ success: true, data: reports });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("[ADMIN_GET]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/admin - admin actions
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action, userId, reportId, reason } = await req.json();

    switch (action) {
      case "block_user":
        await db.user.update({ where: { id: userId }, data: { isBlocked: true, isActive: false } });
        return NextResponse.json({ success: true, message: "User blocked" });

      case "unblock_user":
        await db.user.update({ where: { id: userId }, data: { isBlocked: false, isActive: true } });
        return NextResponse.json({ success: true, message: "User unblocked" });

      case "verify_user":
        await db.user.update({ where: { id: userId }, data: { isVerified: true } });
        return NextResponse.json({ success: true, message: "User verified" });

      case "delete_user":
        await db.user.delete({ where: { id: userId } });
        return NextResponse.json({ success: true, message: "User deleted" });

      case "resolve_report":
        await db.report.update({
          where: { id: reportId },
          data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: session.user.id, adminNote: reason },
        });
        return NextResponse.json({ success: true, message: "Report resolved" });

      case "dismiss_report":
        await db.report.update({
          where: { id: reportId },
          data: { status: "DISMISSED", resolvedAt: new Date(), resolvedBy: session.user.id },
        });
        return NextResponse.json({ success: true, message: "Report dismissed" });

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("[ADMIN_ACTION]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
