// components/dashboard/InterestCard.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/visuals";

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

  const statusConfig: Record<string, { color: string, bg: string, label: string }> = {
    PENDING: { color: "#E8821A", bg: "rgba(232,130,26,0.1)", label: "Pending" },
    ACCEPTED: { color: "#2D6A4F", bg: "rgba(45,106,79,0.1)", label: "Connected" },
    DECLINED: { color: "#9A7B6F", bg: "rgba(154,123,111,0.1)", label: "Declined" },
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-3 border-b border-ivory-dark/50 last:border-0 group">
        <Avatar name={name} src={photo} size={42} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-mahogany truncate group-hover:text-saffron transition-colors">
            {name}{age ? `, ${age}` : ""}
          </p>
          <p className="text-[10px] font-bold text-textLight uppercase tracking-wider">{city}</p>
        </div>
        {responded || interest.status !== "PENDING" ? (
          <div 
            className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md"
            style={{ 
              color: statusConfig[responded || interest.status]?.color,
              backgroundColor: statusConfig[responded || interest.status]?.bg
            }}
          >
            {statusConfig[responded || interest.status]?.label}
          </div>
        ) : (
          <div className="flex gap-1.5">
            <button 
              onClick={() => respond("ACCEPTED")} 
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-jade/10 text-jade flex items-center justify-center hover:bg-jade hover:text-white transition-all shadow-sm"
              title="Accept"
            >
              <Icon name="check" size={14} />
            </button>
            <button 
              onClick={() => respond("DECLINED")} 
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              title="Decline"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-base p-6 hover:border-saffron/30 hover:shadow-md transition-all group">
      <div className="flex gap-5">
        <Link href={`/profile/view?id=${from?.id}`} className="flex-shrink-0">
          <div className="relative">
            <Avatar name={name} src={photo} size={64} />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
              <div className="bg-saffron/10 text-saffron p-1 rounded-full">
                <Icon name="heart" size={10} />
              </div>
            </div>
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <Link href={`/profile/view?id=${from?.id}`}>
              <h3 className="font-serif text-xl font-black text-mahogany hover:text-saffron transition-colors leading-none">
                {name}{age ? `, ${age}` : ""}
              </h3>
            </Link>
            <span className="text-[10px] font-bold text-textLight whitespace-nowrap bg-ivory px-2 py-1 rounded-md">
              {new Date(interest.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p className="text-[11px] font-bold text-jade-mid uppercase tracking-widest mb-3">
            {city}{tradition ? ` • ${tradition}` : ""}
          </p>
          
          {interest.message && (
            <div className="relative mb-4">
              <div className="absolute top-0 left-0 text-saffron/20 -mt-2 -ml-1">
                <Icon name="message" size={16} />
              </div>
              <blockquote className="text-[13px] text-textMid italic pl-5 leading-relaxed">
                "{interest.message}"
              </blockquote>
            </div>
          )}

          {responded || interest.status !== "PENDING" ? (
            <div 
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl"
              style={{ 
                color: statusConfig[responded || interest.status]?.color,
                backgroundColor: statusConfig[responded || interest.status]?.bg
              }}
            >
              <Icon name={responded === "ACCEPTED" || interest.status === "ACCEPTED" ? "check" : "x"} size={12} />
              {statusConfig[responded || interest.status]?.label}
            </div>
          ) : (
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => respond("ACCEPTED")} 
                disabled={loading}
                className="btn-saffron !py-2.5 !px-6 text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-md shadow-saffron/20"
              >
                <Icon name="check" size={14} /> Accept Soul
              </button>
              <button 
                onClick={() => respond("DECLINED")} 
                disabled={loading}
                className="py-2.5 px-6 rounded-xl border-1.5 border-ivory-dark text-[11px] font-black uppercase tracking-widest text-textLight hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
