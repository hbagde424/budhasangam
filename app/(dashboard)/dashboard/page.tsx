// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DailyMatches } from "@/components/dashboard/DailyMatches";
import { InterestCard } from "@/components/dashboard/InterestCard";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard | BuddhaSangam" };

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
    { label: "Profile Views", value: String(user?._count?.profileViews ?? 0), icon: "eye", color: "#E8821A", bg: "rgba(232,130,26,0.08)" },
    { label: "New Interests", value: String(user?._count?.interestsReceived ?? 0), icon: "heart", color: "#B76E79", bg: "rgba(183,110,121,0.08)" },
    { label: "Connections", value: String(totalConnections), icon: "users", color: "#2D6A4F", bg: "rgba(45,106,79,0.08)" },
    { label: "Completion", value: `${profileComplete}%`, icon: "lotus", color: "#D4AF37", bg: "rgba(212,175,55,0.08)" },
  ];

  return (
    <div className="space-y-8 mandala-bg min-h-full">
      {/* Welcome Section */}
      <div className="anim-fade-up">
        <h1 className="font-serif text-3xl font-bold text-mahogany">
          Namaste, <span className="shimmer-text">{user?.profile?.fullName?.split(" ")[0] || "Sangha"}</span>
        </h1>
        <p className="text-textMid text-sm mt-1">May your path to a life partner be filled with mindfulness and peace.</p>
      </div>

      {/* Profile incomplete banner */}
      {profileComplete < 80 && (
        <div className="anim-fade-up-2 bg-gradient-to-r from-saffron to-saffron-dark p-0.5 rounded-2xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-[14px] p-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron anim-float">
              <Icon name="lotus" size={32} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-mahogany text-base">Enhance Your Visibility</p>
              <p className="text-textMid text-xs mt-0.5">Complete your profile to unlock 3× more meaningful connections.</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-2 bg-ivory-dark rounded-full overflow-hidden">
                  <div className="h-full bg-saffron transition-all duration-1000" style={{ width: `${profileComplete}%` }} />
                </div>
                <span className="text-xs font-bold text-saffron">{profileComplete}%</span>
              </div>
            </div>
            <Link href="/profile/edit" className="btn-saffron text-xs py-2.5 px-6 shadow-md shadow-saffron/20">
              Complete Profile
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 anim-fade-up-2">
        {stats.map((s, idx) => (
          <div key={s.label} className="card-base p-6 hover:border-saffron/30 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: s.bg, color: s.color }}>
                <Icon name={s.icon} size={24} />
              </div>
              <div className="text-xs font-bold text-jade flex items-center gap-1">
                <Icon name="arrow" size={10} style={{ transform: "rotate(-45deg)" }} />
                +12%
              </div>
            </div>
            <div className="font-serif text-3xl font-bold text-mahogany">{s.value}</div>
            <div className="text-xs text-textLight mt-1 font-semibold uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* Daily matches */}
        <div className="anim-fade-up-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Auspicious Matches</h2>
              <p className="text-textLight text-xs mt-0.5">Handpicked for your spiritual and personal compatibility</p>
            </div>
            <Link href="/search" className="btn-outline-saffron text-xs py-2 px-5 flex items-center gap-2">
              Explore More <Icon name="arrow" size={12} />
            </Link>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-1 rounded-3xl border border-ivory-dark">
            <DailyMatches userId={session.user.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 anim-fade-up-4">
          {/* Incoming Interests */}
          <div className="card-base p-6 border-saffron/10 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-[0.03] text-saffron">
              <Icon name="lotus" size={160} />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-mahogany">Soul Interests</h3>
                <p className="text-textLight text-[11px] font-medium uppercase tracking-wider">Pending Invitations</p>
              </div>
              {recentInterests.length > 0 && (
                <div className="bg-saffron text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                  {recentInterests.length}
                </div>
              )}
            </div>
            
            {recentInterests.length === 0 ? (
              <div className="text-center py-10 bg-ivory/30 rounded-2xl border border-dashed border-ivory-dark">
                <div className="text-saffron/20 mb-3 flex justify-center">
                  <Icon name="heart" size={40} />
                </div>
                <p className="text-sm text-textMid font-medium">No new interests yet</p>
                <p className="text-xs text-textLight mt-1">Be the first to reach out!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInterests.map((interest) => (
                  <InterestCard key={interest.id} interest={interest as any} compact />
                ))}
                <Link href="/interests" className="btn-outline-saffron w-full text-xs py-3 mt-4 flex items-center justify-center gap-2">
                  View All Invitations <Icon name="arrow" size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Premium CTA */}
          <div className="bg-gradient-to-br from-mahogany to-mahogany-mid rounded-2xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 transition-transform group-hover:scale-125 duration-700">
              <Icon name="crown" size={80} color="#D4AF37" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-lotusGold text-mahogany text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Premium</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={10} color="#D4AF37" />)}
                </div>
              </div>
              <h4 className="font-serif text-xl font-bold mb-2">BuddhaSangam Gold</h4>
              <p className="text-white/70 text-xs leading-relaxed mb-5">
                Unlock direct contact, premium badges, and see who viewed your profile.
              </p>
              <button className="w-full bg-lotusGold hover:bg-lotusGold-light text-mahogany font-bold py-3 rounded-xl text-xs transition-colors shadow-lg shadow-black/20">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Daily Wisdom */}
          <div className="bg-jade/5 border border-jade/10 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-jade/10 flex items-center justify-center text-jade flex-shrink-0">
                <Icon name="info" size={20} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-jade mb-2">Daily Wisdom</h4>
                <p className="text-[13px] text-mahogany-mid leading-relaxed italic font-medium noto">
                  "Compassion is the root of a successful union. In every interaction, seek understanding before judgement."
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-jade-mid uppercase tracking-widest">Master Shantideva</span>
                  <button className="text-jade text-[10px] font-bold underline underline-offset-4">Reflect</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
