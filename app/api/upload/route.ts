// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadProfilePhoto, uploadGalleryPhoto, deletePhoto } from "@/lib/storage/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const isProfile = formData.get("isProfile") === "true";
    const type = formData.get("type") as string ?? "gallery";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Only JPEG, PNG and WebP images are allowed" }, { status: 400 });
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size must be under 5MB" }, { status: 400 });
    }

    // Check photo limit (Premium: 10, Free: 3)
    const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
    const photoLimit = subscription?.plan !== "FREE" ? 10 : 3;
    const currentCount = await db.photo.count({ where: { userId: session.user.id } });

    if (currentCount >= photoLimit) {
      return NextResponse.json(
        { success: false, error: `Photo limit reached (${photoLimit}). ${subscription?.plan === "FREE" ? "Upgrade to Premium for up to 10 photos." : ""}` },
        { status: 429 }
      );
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadFn = isProfile ? uploadProfilePhoto : uploadGalleryPhoto;
    const result = await uploadFn(buffer, session.user.id);

    // If this is a profile photo, unset current profile photo
    if (isProfile) {
      await db.photo.updateMany({
        where: { userId: session.user.id, isProfile: true },
        data: { isProfile: false },
      });
    }

    // Get next order
    const lastPhoto = await db.photo.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
    });

    // Save to DB
    const photo = await db.photo.create({
      data: {
        userId: session.user.id,
        url: result.url,
        publicId: result.publicId,
        isProfile,
        order: (lastPhoto?.order ?? 0) + 1,
      },
    });

    // Update profile picture URL
    if (isProfile) {
      await db.profile.update({
        where: { userId: session.user.id },
        data: { profilePicUrl: result.url },
      });
    }

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (err) {
    console.error("[UPLOAD_PHOTO]", err);
    return NextResponse.json({ success: false, error: "Upload failed. Please try again." }, { status: 500 });
  }
}

// DELETE /api/upload - delete a photo
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { photoId } = await req.json();

    const photo = await db.photo.findUnique({ where: { id: photoId } });
    if (!photo || photo.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Photo not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    if (photo.publicId) {
      await deletePhoto(photo.publicId).catch(console.error);
    }

    await db.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_PHOTO]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
