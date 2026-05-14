// components/dashboard/DailyMatches.tsx
"use client";
import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/search/ProfileCard";

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
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-ivory-dark animate-pulse h-72" />
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <div className="text-4xl mb-3">☸</div>
        <p className="font-serif text-xl text-mahogany mb-2">No matches yet</p>
        <p className="text-sm text-muted-foreground">Complete your profile to get personalized matches</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {profiles.map(p => (
        <ProfileCard key={p.id} profile={p} compatibility={p.compatibility}
          onInterest={() => sendInterest(p.userId)} />
      ))}
    </div>
  );
}
