// app/(dashboard)/profile/edit/page.tsx
import type { Metadata } from "next";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BiodataForm } from "@/components/forms/BiodataForm";

export const metadata: Metadata = { title: "Edit Profile" };

export default async function ProfileEditPage() {
  const session = await getAuth();
  if (!session?.user?.id) return null;

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: { user: { include: { photos: true } } },
  });

  return <BiodataForm initialData={profile ?? {}} />;
}
