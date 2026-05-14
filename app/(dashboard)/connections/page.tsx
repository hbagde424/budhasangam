// app/(dashboard)/connections/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    fetch("/api/connections")
      .then(r => r.json())
      .then(d => setConnections(d.success ? d.data : []))
      .finally(() => setLoading(false));
    // Get session
    fetch("/api/auth/session").then(r=>r.json()).then(d => setCurrentUserId(d?.user?.id ?? ""));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title text-3xl">My Connections</h1>
          <p className="text-muted-foreground text-sm mt-1">{connections.length} active connections</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i) => <div key={i} className="h-36 rounded-2xl bg-ivory-dark animate-pulse" />)}
        </div>
      ) : connections.length === 0 ? (
        <div className="card-base p-16 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <p className="font-serif text-2xl text-mahogany mb-3">No connections yet</p>
          <p className="text-muted-foreground mb-6">Accept interests from profiles you like to start connecting</p>
          <Link href="/search" className="btn-saffron inline-block px-8 py-3 text-sm">Browse Profiles</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {connections.map(conn => {
            const other = conn.user1Id === currentUserId ? conn.user2 : conn.user1;
            const profile = other?.profile;
            const photo = other?.photos?.[0]?.url;
            const age = profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : null;
            return (
              <div key={conn.id} className="card-hover p-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-ivory-dark relative mb-3">
                  {photo ? <Image src={photo} alt={profile?.fullName ?? ""} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                </div>
                <p className="font-serif font-bold text-mahogany">{profile?.fullName ?? "Connection"}</p>
                {age && <p className="text-xs text-muted-foreground">{age} · {profile?.workLocation ?? ""}</p>}
                <span className="tag bg-saffron/8 text-saffron-dark border border-saffron/15 text-[10px] mt-2">
                  {profile?.buddhistTradition ?? "Buddhist"}
                </span>
                <div className="flex gap-2 mt-3 w-full">
                  <Link href={`/chat?connectionId=${conn.id}`} className="flex-1 btn-saffron text-xs py-2 text-center">💬 Chat</Link>
                  <Link href={`/profile/view?id=${other?.id}`} className="flex-1 btn-outline-saffron text-xs py-2 text-center">View</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
