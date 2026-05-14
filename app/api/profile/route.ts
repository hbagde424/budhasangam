// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/profile - get current user's profile
export async function GET() {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        photos: { orderBy: { order: "asc" } },
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error("[GET_PROFILE]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/profile - update profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { section, data } = body;

    // Get existing profile
    const existingProfile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // Update profile section
    const updated = await db.profile.update({
      where: { userId: session.user.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Recalculate profile completion
    const completionScore = calculateProfileCompletion(updated);
    await db.profile.update({
      where: { id: updated.id },
      data: { profileComplete: completionScore },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[UPDATE_PROFILE]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/profile - delete account
export async function DELETE() {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await db.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("[DELETE_ACCOUNT]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function calculateProfileCompletion(profile: any): number {
  const fields = [
    "fullName", "gender", "dob", "heightCm", "maritalStatus",
    "buddhistTradition", "meditationPractice", "diet",
    "education", "occupation", "workLocation",
    "fatherName", "motherName", "familyType", "familyLocation",
    "aboutMe", "partnerPreferences",
  ];

  const filled = fields.filter((f) => profile[f] !== null && profile[f] !== undefined && profile[f] !== "").length;
  return Math.round((filled / fields.length) * 100);
}
