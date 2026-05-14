// components/search/ProfileCard.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { CompatibilityBadge } from "./CompatibilityBadge";

interface ProfileCardProps {
  profile: any;
  compatibility?: number;
  onInterest?: () => void;
}

export function ProfileCard({ profile, compatibility = 75, onInterest }: ProfileCardProps) {
  const photo = profile.user?.photos?.[0]?.url ?? profile.profilePicUrl;
  const name = profile.fullName ?? "Profile";
  const city = profile.workLocation ?? "";
  const age = profile.dob
    ? new Date().getFullYear() - new Date(profile.dob).getFullYear()
    : null;
  const isPremium = profile.user?.subscription?.plan !== "FREE";

  return (
    <div className="profile-card group">
      {/* Photo */}
      <div className="relative h-60 overflow-hidden bg-ivory-dark">
        {photo ? (
          <Image src={photo} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
            👤
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-mahogany/85 via-transparent to-transparent" />

        {/* Badges top */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {profile.user?.isVerified && <span className="verified-badge text-[10px]">✓ Verified</span>}
          {isPremium && <span className="premium-badge text-[10px]">👑 Premium</span>}
        </div>

        {/* Compatibility */}
        <div className="absolute top-3 left-3">
          <CompatibilityBadge score={compatibility} size="sm" />
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-serif text-lg font-bold text-white leading-tight">
            {name}{age ? `, ${age}` : ""}
          </h3>
          {city && <p className="text-white/75 text-xs mt-0.5">📍 {city}</p>}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[profile.buddhistTradition, profile.education, profile.diet,
            profile.meditationPractice !== "NONE" ? profile.meditationPractice : null]
            .filter(Boolean)
            .slice(0, 3)
            .map((tag) => (
              <span key={tag} className="tag bg-saffron/8 text-saffron-dark border border-saffron/15 text-[10px]">
                {tag}
              </span>
            ))}
        </div>

        {profile.aboutMe && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{profile.aboutMe}</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Link href={`/profile/view?id=${profile.userId}`}
            className="py-2 rounded-lg border border-ivory-dark text-xs font-semibold text-mahogany-mid text-center hover:border-saffron hover:text-saffron transition-all">
            View
          </Link>
          <button onClick={onInterest}
            className="py-2 rounded-lg bg-gradient-to-br from-saffron to-saffron-dark text-white text-xs font-semibold hover:shadow-lg hover:shadow-saffron/30 transition-all">
            💛 Interest
          </button>
          <Link href={`/chat?userId=${profile.userId}`}
            className="py-2 rounded-lg border border-jade text-jade text-xs font-semibold text-center hover:bg-jade hover:text-white transition-all">
            Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
