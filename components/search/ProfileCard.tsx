"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icons";
import { CompatibilityRing } from "@/components/ui/visuals";

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
  const isVerified = profile.user?.isVerified;

  return (
    <div className="profile-card card-hover anim-fade-up group">
      <div className="relative h-[240px] overflow-hidden bg-ivory-dark">
        {photo ? (
          <Image 
            src={photo} 
            alt={name} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
            👤
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-mahogany/85 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {isVerified && <span className="verified-badge"><Icon name="check" size={10} />Verified</span>}
          {isPremium && <span className="premium-badge"><Icon name="crown" size={10} color="#C4671A" />Premium</span>}
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="serif text-xl font-bold text-white leading-tight">
            {name}{age ? `, ${age}` : ""}
          </h3>
          <div className="flex items-center gap-1.5 text-white/80 text-xs mt-1">
            <Icon name="map" size={11} color="rgba(255,255,255,0.7)" />
            {city}
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <CompatibilityRing pct={compatibility} size={52} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[profile.buddhistTradition, profile.education, profile.diet, 
            profile.meditationPractice !== "NONE" ? profile.meditationPractice : null]
            .filter(Boolean)
            .slice(0, 3)
            .map((tag) => (
              <span key={tag} className="tag bg-saffron/5 text-saffron-dark border border-saffron/20 text-[10px]">
                {tag}
              </span>
            ))}
        </div>
        {profile.aboutMe && (
          <p className="text-[12.5px] text-textMid leading-relaxed mb-4 line-clamp-2">
            {profile.aboutMe}
          </p>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          <Link 
            href={`/profile/view?id=${profile.userId}`}
            className="btn-outline-saffron !px-1 !py-2 text-[10px] flex items-center justify-center gap-1"
          >
            <Icon name="eye" size={12} />View
          </Link>
          <button 
            onClick={onInterest}
            className="btn-saffron !px-1 !py-2 text-[10px] flex items-center justify-center gap-1"
          >
            <Icon name="heart" size={12} />Interest
          </button>
          <Link 
            href={`/chat?userId=${profile.userId}`}
            className="border-1.5 border-jade text-jade bg-transparent rounded-xl px-1 py-2 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all hover:bg-jade hover:text-white"
          >
            <Icon name="message" size={12} />Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
