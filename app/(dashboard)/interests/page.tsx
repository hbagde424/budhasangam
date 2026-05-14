// app/(dashboard)/interests/page.tsx
"use client";
import { useState, useEffect } from "react";
import { InterestCard } from "@/components/dashboard/InterestCard";

export default function InterestsPage() {
  const [tab, setTab] = useState<"received"|"sent">("received");
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/interests?type=${tab}`)
      .then(r => r.json())
      .then(d => setInterests(d.success ? d.data : []))
      .finally(() => setLoading(false));
  }, [tab]);

  const tabs: [typeof tab, string, string][] = [
    ["received", "Received", "💛"],
    ["sent", "Sent", "📤"],
  ];

  return (
    <div>
      <h1 className="section-title text-3xl mb-6">Interests</h1>
      <div className="flex gap-1 bg-white border border-ivory-dark rounded-2xl p-1.5 w-fit mb-6">
        {tabs.map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === id ? "bg-saffron/10 text-saffron" : "text-muted-foreground hover:text-mahogany"}`}>
            {icon} {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({length:3}).map((_,i) => <div key={i} className="h-28 rounded-2xl bg-ivory-dark animate-pulse" />)}
        </div>
      ) : interests.length === 0 ? (
        <div className="card-base p-12 text-center">
          <div className="text-4xl mb-3">{tab === "received" ? "💛" : "📤"}</div>
          <p className="font-serif text-xl text-mahogany mb-2">No {tab} interests</p>
          <p className="text-sm text-muted-foreground">
            {tab === "received" ? "When someone sends you an interest, it will appear here." : "Browse profiles and send interests to connect."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map(interest => (
            <InterestCard key={interest.id} interest={interest}
              onRespond={(id, action) => setInterests(p => p.map(i => i.id === id ? {...i, status: action} : i))} />
          ))}
        </div>
      )}
    </div>
  );
}
