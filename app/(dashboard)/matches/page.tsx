// app/(dashboard)/matches/page.tsx
import type { Metadata } from "next";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateCompatibility } from "@/lib/matching-algorithm";
import { ProfileCard } from "@/components/search/ProfileCard";

export const metadata: Metadata = { title: "Daily Matches" };

export default async function MatchesPage() {
  const session = await getAuth();
  if (!session?.user?.id) return null;

  const seekerProfile = await db.profile.findUnique({ where: { userId: session.user.id } });

  const profiles = await db.profile.findMany({
    where: { isVisible: true, isPaused: false, userId: { not: session.user.id } },
    include: { user: { include: { photos: { where: { isProfile: true }, take: 1 }, subscription: { select: { plan: true } } } } },
    orderBy: { profileComplete: "desc" },
    take: 20,
  });

  const enriched = profiles.map(p => ({
    ...p,
    compatibility: seekerProfile ? calculateCompatibility(seekerProfile as any, p as any).score : 75,
  })).sort((a, b) => b.compatibility - a.compatibility);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title text-3xl">Your Daily Matches</h1>
          <p className="text-muted-foreground text-sm mt-1">{enriched.length} profiles matched to your preferences · Updated daily</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {enriched.map(p => (
          <ProfileCard key={p.id} profile={p} compatibility={p.compatibility} />
        ))}
      </div>
    </div>
  );
}
