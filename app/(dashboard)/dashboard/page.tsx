// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DailyMatches } from "@/components/dashboard/DailyMatches";
import { InterestCard } from "@/components/dashboard/InterestCard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getAuth();
  if (!session?.user?.id) return null;

  const [user, recentInterests] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        photos: { where: { isProfile: true }, take: 1 },
        subscription: true,
        _count: {
          select: {
            interestsReceived: { where: { status: "PENDING" } },
            connections1: true,
            connections2: true,
            profileViews: true,
          },
        },
      },
    }),
    db.interest.findMany({
      where: { toUserId: session.user.id, status: "PENDING" },
      include: {
        fromUser: {
          include: {
            profile: true,
            photos: { where: { isProfile: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const profileComplete = user?.profile?.profileComplete ?? 0;
  const totalConnections = (user?._count?.connections1 ?? 0) + (user?._count?.connections2 ?? 0);

  const stats = [
    { label: "Profile Views", value: String(user?._count?.profileViews ?? 0), icon: "👁", color: "#E8821A" },
    { label: "New Interests", value: String(user?._count?.interestsReceived ?? 0), icon: "💛", color: "#B76E79" },
    { label: "Connections", value: String(totalConnections), icon: "🤝", color: "#2D6A4F" },
    { label: "Profile Complete", value: `${profileComplete}%`, icon: "✨", color: "#D4AF37" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile incomplete banner */}
      {profileComplete < 80 && (
        <div className="bg-gradient-to-r from-saffron/10 to-lotus-gold/10 border border-saffron/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl">☸</div>
          <div className="flex-1">
            <p className="font-semibold text-mahogany text-sm">Complete your profile for 3× more connections</p>
            <div className="progress-bar mt-2 w-full max-w-xs">
              <div className="progress-fill" style={{ width: `${profileComplete}%` }} />
            </div>
          </div>
          <a href="/profile/edit" className="btn-saffron text-xs py-2 px-4 whitespace-nowrap">Complete Profile</a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card-base p-5 hover:border-saffron/30 transition-all">
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="font-serif text-3xl font-bold text-mahogany">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Daily matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Today's Matches</h2>
            <a href="/search" className="btn-outline-saffron text-xs py-2 px-4">View All →</a>
          </div>
          <DailyMatches userId={session.user.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Incoming Interests */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-mahogany">New Interests</h3>
              {recentInterests.length > 0 && (
                <span className="bg-saffron text-white text-xs font-bold px-2 py-1 rounded-full">
                  {recentInterests.length}
                </span>
              )}
            </div>
            {recentInterests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No new interests yet</p>
            ) : (
              <div className="space-y-3">
                {recentInterests.map((interest) => (
                  <InterestCard key={interest.id} interest={interest as any} compact />
                ))}
                <a href="/interests" className="btn-outline-saffron w-full text-xs py-2 block text-center mt-2">
                  View All Interests
                </a>
              </div>
            )}
          </div>

          {/* Dhamma Icebreaker */}
          <div className="bg-jade/6 border border-jade/20 rounded-2xl p-5">
            <div className="flex gap-3">
              <span className="text-2xl mt-0.5">☸</span>
              <div>
                <h4 className="font-serif text-base font-bold text-jade mb-2">Dhamma Icebreaker</h4>
                <p className="text-sm text-mahogany-mid leading-relaxed italic">
                  "What does 'Metta' (loving-kindness) mean to you in a marriage?"
                </p>
                <a href="/chat" className="btn-saffron text-xs py-2 px-4 mt-3 inline-flex items-center gap-2">
                  💬 Send to a Connection
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
