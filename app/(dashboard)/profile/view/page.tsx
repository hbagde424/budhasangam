// app/(dashboard)/profile/view/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { CompatibilityBadge } from "@/components/search/CompatibilityBadge";

const TABS = ["About", "Lifestyle", "Family", "Preferences"];

export default function ProfileViewPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("About");
  const [interestSent, setInterestSent] = useState(false);

  const isOwn = !profileId || profileId === session?.user?.id;

  useEffect(() => {
    const url = profileId ? `/api/profile?userId=${profileId}` : "/api/profile";
    fetch(url).then(r => r.json()).then(d => { if (d.success) setUser(d.data); }).finally(() => setLoading(false));
  }, [profileId]);

  const sendInterest = async () => {
    if (!profileId) return;
    const res = await fetch("/api/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: profileId }) });
    const data = await res.json();
    if (data.success) setInterestSent(true);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <div className="text-center py-20 text-muted-foreground">Profile not found</div>;

  const profile = user.profile;
  const photo = user.photos?.[0]?.url ?? profile?.profilePicUrl;
  const age = profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : null;

  return (
    <div>
      <Link href="/search" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-mahogany mb-5 transition-colors">
        ← Back to Search
      </Link>

      <div className="grid grid-cols-[320px_1fr] gap-6">
        {/* Left */}
        <div className="space-y-4">
          {/* Main photo */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-96 bg-ivory-dark">
              {photo ? <Image src={photo} alt={profile?.fullName ?? ""} fill className="object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-mahogany/90 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <CompatibilityBadge score={82} size="lg" />
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {user.isVerified && <span className="verified-badge">✓ Verified</span>}
              {user.subscription?.plan !== "FREE" && <span className="premium-badge">👑 Premium</span>}
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <h1 className="font-serif text-3xl font-bold text-white">{profile?.fullName}{age ? `, ${age}` : ""}</h1>
              <p className="text-white/75 text-sm mt-1">📍 {profile?.workLocation ?? ""}</p>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2">
            {(user.photos ?? []).slice(0, 3).map((p: any, i: number) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden relative bg-ivory-dark">
                <Image src={p.url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="card-base p-5 space-y-3">
            {isOwn ? (
              <Link href="/profile/edit" className="btn-saffron w-full py-3 text-sm flex items-center justify-center gap-2">
                ✏️ Edit Profile
              </Link>
            ) : (
              <>
                <button onClick={sendInterest} disabled={interestSent}
                  className="btn-saffron w-full py-3 text-sm flex items-center justify-center gap-2">
                  {interestSent ? "💛 Interest Sent ✓" : "💛 Send Interest"}
                </button>
                <Link href={`/chat?userId=${profileId}`}
                  className="btn-outline-saffron w-full py-3 text-sm flex items-center justify-center gap-2">
                  💬 Send Message
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 rounded-xl border border-ivory-dark text-xs font-semibold text-muted-foreground hover:border-lotus-gold hover:text-lotus-gold transition-all">
                    ⭐ Shortlist
                  </button>
                  <button className="py-2 rounded-xl border border-ivory-dark text-xs font-semibold text-muted-foreground hover:border-red-300 hover:text-red-400 transition-all">
                    🚩 Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right */}
        <div>
          {/* Tabs */}
          <div className="flex gap-0 bg-white border border-ivory-dark rounded-2xl overflow-hidden w-fit mb-5">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-bold border-r border-ivory-dark last:border-0 transition-all
                  ${tab === t ? "bg-saffron/8 text-saffron" : "text-muted-foreground hover:text-mahogany"}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === "About" && (
            <div className="space-y-4">
              <div className="card-base p-5">
                <h3 className="section-title text-lg mb-4">Quick Overview</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[["🕉","Tradition",profile?.buddhistTradition],["📚","Education",profile?.education],["💼","Occupation",profile?.occupation],
                    ["💰","Income",profile?.annualIncome],["🥗","Diet",profile?.diet],["🧘","Meditation",profile?.meditationPractice],
                    ["👨‍👩‍👧","Family",profile?.familyType],["📍","Location",profile?.workLocation],["💍","Marital",profile?.maritalStatus]
                  ].map(([emoji,label,value]) => value ? (
                    <div key={label as string} className="bg-ivory rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">{emoji}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold mb-1">{label}</div>
                      <div className="text-xs font-bold text-mahogany">{value}</div>
                    </div>
                  ) : null)}
                </div>
              </div>
              {profile?.aboutMe && (
                <div className="card-base p-5">
                  <h3 className="section-title text-lg mb-3">About {profile.fullName?.split(" ")[0]}</h3>
                  <p className="text-sm text-mahogany-mid leading-relaxed">{profile.aboutMe}</p>
                </div>
              )}
            </div>
          )}

          {tab === "Lifestyle" && (
            <div className="card-base p-5">
              <h3 className="section-title text-lg mb-4">Lifestyle & Habits</h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[["🥗","Diet",profile?.diet],["🚫","Drinking",profile?.alcoholConsumption],
                  ["🚭","Smoking",profile?.smokingConsumption],["🏃","Exercise",profile?.exerciseHabit ?? "Not specified"]
                ].map(([icon,label,value]) => (
                  <div key={label as string} className="flex gap-3 p-3 bg-ivory rounded-xl">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">{label}</p>
                      <p className="text-sm font-bold text-mahogany">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {profile?.hobbies?.length > 0 && (
                <>
                  <p className="text-xs font-bold text-mahogany-mid uppercase tracking-wide mb-3">Hobbies</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.hobbies.map((h: string) => (
                      <span key={h} className="tag bg-saffron/8 text-saffron-dark border border-saffron/15 text-xs">{h}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "Family" && (
            <div className="card-base p-5">
              <h3 className="section-title text-lg mb-4">Family Background</h3>
              <div className="grid grid-cols-2 gap-3">
                {[["Father",profile?.fatherName,profile?.fatherOccupation],
                  ["Mother",profile?.motherName,profile?.motherOccupation],
                ].map(([role,name,occ]) => name ? (
                  <div key={role as string} className="bg-ivory rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold mb-1">{role}</p>
                    <p className="text-sm font-bold text-mahogany">{name}</p>
                    {occ && <p className="text-xs text-muted-foreground">{occ}</p>}
                  </div>
                ) : null)}
                {[["Family Type",profile?.familyType],["Family Values",profile?.familyValues],
                  ["Brothers",String(profile?.brothersCount ?? 0)],["Sisters",String(profile?.sistersCount ?? 0)],
                ].map(([label,value]) => (
                  <div key={label as string} className="bg-ivory rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold mb-1">{label}</p>
                    <p className="text-sm font-bold text-mahogany">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Preferences" && (
            <div className="card-base p-5">
              <h3 className="section-title text-lg mb-4">Partner Preferences</h3>
              {profile?.partnerPreferences ? (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(profile.partnerPreferences as Record<string,any>).map(([key,val]) => (
                    <div key={key} className="bg-ivory rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold mb-1">
                        {key.replace(/([A-Z])/g,' $1').trim()}
                      </p>
                      <p className="text-sm font-bold text-mahogany">{String(val)}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No preferences set yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
