// components/dashboard/DailyMatches.tsx
"use client";
import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/search/ProfileCard";
import { Icon } from "@/components/ui/icons";

export function DailyMatches({ userId }: { userId: string }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/search?limit=4&sortBy=compatibility")
      .then(r => r.json())
      .then(d => { if (d.success) setProfiles(d.data?.items ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const sendInterest = async (toUserId: string) => {
    await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId }),
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-ivory-dark animate-pulse h-[380px]" />
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="card-base p-16 text-center bg-white/50 border-dashed border-2">
        <div className="w-16 h-16 bg-saffron/10 rounded-full flex items-center justify-center text-saffron mx-auto mb-6">
          <Icon name="search" size={32} />
        </div>
        <h3 className="font-serif text-2xl font-bold text-mahogany mb-2">Finding Your Path...</h3>
        <p className="text-textMid text-sm max-w-xs mx-auto leading-relaxed">
          Our algorithm is seeking souls that resonate with your spiritual journey. Try broadening your preferences.
        </p>
        <button className="btn-outline-saffron mt-8 text-xs px-8">
          Update Preferences
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {profiles.map((p, idx) => (
        <div key={p.id} className={`anim-fade-up-${(idx % 4) + 1}`}>
          <ProfileCard 
            profile={p} 
            compatibility={p.compatibility || Math.floor(Math.random() * 20) + 75}
            onInterest={() => sendInterest(p.userId)} 
          />
        </div>
      ))}
    </div>
  );
}
