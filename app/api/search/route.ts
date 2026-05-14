// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSearchQuery, calculateCompatibility } from "@/lib/matching-algorithm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const skip = (page - 1) * limit;

    const filters = {
      gender: searchParams.get("gender") ?? undefined,
      minAge: searchParams.get("minAge") ? parseInt(searchParams.get("minAge")!) : undefined,
      maxAge: searchParams.get("maxAge") ? parseInt(searchParams.get("maxAge")!) : undefined,
      minHeight: searchParams.get("minHeight") ? parseInt(searchParams.get("minHeight")!) : undefined,
      maxHeight: searchParams.get("maxHeight") ? parseInt(searchParams.get("maxHeight")!) : undefined,
      tradition: searchParams.get("tradition") ?? undefined,
      diet: searchParams.get("diet") ?? undefined,
      meditation: searchParams.get("meditation") ?? undefined,
      maritalStatus: searchParams.get("maritalStatus") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      vipassanaCourse: searchParams.get("vipassanaCourse") ?? undefined,
      photoVerified: searchParams.get("photoVerified") === "true" ? true : undefined,
    };

    const where = buildSearchQuery(filters);

    // Exclude current user and blocked users
    const blocks = await db.block.findMany({
      where: {
        OR: [{ blockerId: session.user.id }, { blockedId: session.user.id }],
      },
      select: { blockerId: true, blockedId: true },
    });
    const blockedIds = blocks.map((b) =>
      b.blockerId === session.user.id ? b.blockedId : b.blockerId
    );

    where.userId = { not: session.user.id };
    if (blockedIds.length > 0) {
      where.userId = { not: session.user.id, notIn: blockedIds };
    }

    const [profiles, total] = await Promise.all([
      db.profile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            include: {
              photos: { where: { isProfile: true }, take: 1 },
              subscription: { select: { plan: true } },
            },
          },
        },
        orderBy: [{ profileComplete: "desc" }, { updatedAt: "desc" }],
      }),
      db.profile.count({ where }),
    ]);

    // Get seeker's profile for compatibility
    const seekerProfile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    // Record profile views (non-blocking)
    if (seekerProfile) {
      const viewPromises = profiles.map((p) =>
        db.profileView.upsert({
          where: { viewerId_profileId: { viewerId: session.user.id, profileId: p.userId } } as any,
          create: { viewerId: session.user.id, profileId: p.userId },
          update: { createdAt: new Date() },
        }).catch(() => {})
      );
      Promise.all(viewPromises).catch(() => {});
    }

    // Attach compatibility scores
    const enriched = profiles.map((p) => {
      let compatibility = 75;
      if (seekerProfile) {
        const result = calculateCompatibility(seekerProfile as any, p as any);
        compatibility = result.score;
      }
      return { ...p, compatibility };
    });

    // Sort by compatibility if requested
    const sortBy = searchParams.get("sortBy") ?? "compatibility";
    if (sortBy === "compatibility") {
      enriched.sort((a, b) => b.compatibility - a.compatibility);
    }

    return NextResponse.json({
      success: true,
      data: {
        items: enriched,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    });
  } catch (err) {
    console.error("[SEARCH]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
