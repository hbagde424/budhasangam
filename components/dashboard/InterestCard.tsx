// components/dashboard/InterestCard.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface InterestCardProps {
  interest: any;
  compact?: boolean;
  onRespond?: (id: string, action: "ACCEPTED" | "DECLINED") => void;
}

export function InterestCard({ interest, compact = false, onRespond }: InterestCardProps) {
  const [loading, setLoading] = useState(false);
  const [responded, setResponded] = useState<string | null>(null);

  const from = interest.fromUser;
  const profile = from?.profile;
  const photo = from?.photos?.[0]?.url;
  const name = profile?.fullName ?? "Unknown";
  const city = profile?.workLocation ?? "";
  const tradition = profile?.buddhistTradition ?? "";
  const age = profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : null;

  const respond = async (action: "ACCEPTED" | "DECLINED") => {
    setLoading(true);
    try {
      const res = await fetch("/api/interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interestId: interest.id, action }),
      });
      const data = await res.json();
      if (data.success) {
        setResponded(action);
        onRespond?.(interest.id, action);
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: "#E8821A", ACCEPTED: "#2D6A4F", DECLINED: "#9A7B6F", BLOCKED: "#B76E79",
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2 border-b border-ivory-dark last:border-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-ivory-dark flex-shrink-0 relative">
          {photo ? <Image src={photo} alt={name} fill className="object-cover" /> : <span className="flex items-center justify-center h-full text-lg">👤</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-mahogany truncate">{name}{age ? `, ${age}` : ""}</p>
          <p className="text-xs text-muted-foreground">{city}</p>
        </div>
        {responded ? (
          <span className="text-xs font-bold" style={{ color: statusColor[responded] }}>
            {responded === "ACCEPTED" ? "Connected ✓" : "Declined"}
          </span>
        ) : interest.status === "PENDING" ? (
          <div className="flex gap-1.5">
            <button onClick={() => respond("ACCEPTED")} disabled={loading}
              className="w-7 h-7 rounded-full bg-jade/10 flex items-center justify-center hover:bg-jade hover:text-white transition-all text-jade text-xs font-bold">
              ✓
            </button>
            <button onClick={() => respond("DECLINED")} disabled={loading}
              className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-red-400 text-xs font-bold">
              ✕
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold" style={{ color: statusColor[interest.status] }}>
            {interest.status === "ACCEPTED" ? "Connected ✓" : interest.status}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="card-base p-5 hover:border-saffron/30 transition-all">
      <div className="flex gap-4">
        <Link href={`/profile/view?id=${from?.id}`} className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-ivory-dark relative">
            {photo ? <Image src={photo} alt={name} fill className="object-cover" /> : <span className="flex items-center justify-center h-full text-2xl">👤</span>}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link href={`/profile/view?id=${from?.id}`}>
              <h3 className="font-serif text-xl font-bold text-mahogany hover:text-saffron transition-colors">
                {name}{age ? `, ${age}` : ""}
              </h3>
            </Link>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {new Date(interest.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{city}{tradition ? ` · ${tradition}` : ""}</p>
          {interest.message && (
            <blockquote className="text-sm text-mahogany-mid italic bg-ivory px-3 py-2 rounded-lg border-l-2 border-saffron mb-3">
              "{interest.message}"
            </blockquote>
          )}
          {responded ? (
            <span className="inline-block text-sm font-bold px-3 py-1.5 rounded-full"
              style={{ color: statusColor[responded], background: `${statusColor[responded]}15` }}>
              {responded === "ACCEPTED" ? "Connected ✓" : "Declined"}
            </span>
          ) : interest.status === "PENDING" ? (
            <div className="flex gap-2">
              <button onClick={() => respond("ACCEPTED")} disabled={loading}
                className="btn-saffron text-xs py-2 px-4 flex items-center gap-1.5">
                ✓ Accept
              </button>
              <button onClick={() => respond("DECLINED")} disabled={loading}
                className="py-2 px-4 rounded-lg border border-ivory-dark text-xs font-semibold text-muted-foreground hover:border-red-300 hover:text-red-500 transition-all">
                Decline
              </button>
            </div>
          ) : (
            <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ color: statusColor[interest.status], background: `${statusColor[interest.status]}15` }}>
              {interest.status === "ACCEPTED" ? "Connected ✓" : interest.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
