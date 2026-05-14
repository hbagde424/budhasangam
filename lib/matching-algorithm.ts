// lib/matching-algorithm.ts
// BuddhaSangam Compatibility Scoring Engine

import type { Profile } from "@prisma/client";

export interface CompatibilityResult {
  score: number; // 0-100
  breakdown: CompatibilityBreakdown;
  label: "Excellent" | "Good" | "Fair" | "Low";
}

export interface CompatibilityBreakdown {
  tradition: number;    // max 20
  meditation: number;   // max 15
  diet: number;         // max 10
  lifestyle: number;    // max 10
  age: number;          // max 5
  location: number;     // max 5
  education: number;    // max 10
  family: number;       // max 10
  workPreference: number; // max 5
  location2: number;    // max 10
}

export function calculateCompatibility(
  seeker: Profile,
  candidate: Profile
): CompatibilityResult {
  const breakdown: CompatibilityBreakdown = {
    tradition: scoreTradition(seeker, candidate),
    meditation: scoreMeditation(seeker, candidate),
    diet: scoreDiet(seeker, candidate),
    lifestyle: scoreLifestyle(seeker, candidate),
    age: scoreAge(seeker, candidate),
    location: scoreLocation(seeker, candidate),
    education: scoreEducation(seeker, candidate),
    family: scoreFamily(seeker, candidate),
    workPreference: scoreWorkPreference(seeker, candidate),
    location2: scoreLocationPreference(seeker, candidate),
  };

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const score = Math.round(total);

  return {
    score,
    breakdown,
    label:
      score >= 85 ? "Excellent"
      : score >= 70 ? "Good"
      : score >= 50 ? "Fair"
      : "Low",
  };
}

function scoreTradition(a: Profile, b: Profile): number {
  // Max 20 points
  if (a.buddhistTradition === b.buddhistTradition) return 20;

  // Both Buddhist but different traditions - partial score
  const buddhistTraditions = ["THERAVADA", "MAHAYANA", "VAJRAYANA", "NAVAYANA", "OTHER"];
  if (
    buddhistTraditions.includes(a.buddhistTradition) &&
    buddhistTraditions.includes(b.buddhistTradition)
  ) {
    return 12;
  }
  return 5;
}

function scoreMeditation(a: Profile, b: Profile): number {
  // Max 15 points
  if (!a.meditationPractice || !b.meditationPractice) return 5;
  if (a.meditationPractice === b.meditationPractice) return 15;

  // Both practice something
  if (a.meditationPractice !== "NONE" && b.meditationPractice !== "NONE") return 10;

  return 3;
}

function scoreDiet(a: Profile, b: Profile): number {
  // Max 10 points
  if (a.diet === b.diet) return 10;

  // Both vegetarian/vegan - compatible
  const vegTypes = ["VEGETARIAN", "VEGAN", "EGGETARIAN"];
  if (vegTypes.includes(a.diet) && vegTypes.includes(b.diet)) return 7;

  // One non-veg - depends on preference
  const prefs = (a.partnerPreferences as any) || {};
  if (prefs.dietPreference === "NO_PREFERENCE") return 8;

  return 4;
}

function scoreLifestyle(a: Profile, b: Profile): number {
  // Max 10 points
  let score = 0;

  // Drinking compatibility
  if (a.alcoholConsumption === b.alcoholConsumption) score += 5;
  else if (a.alcoholConsumption === "NEVER" && b.alcoholConsumption !== "REGULARLY") score += 3;
  else if (a.alcoholConsumption !== "REGULARLY" && b.alcoholConsumption !== "REGULARLY") score += 2;

  // Smoking compatibility
  if (a.smokingConsumption === b.smokingConsumption) score += 5;
  else if (a.smokingConsumption === "NEVER" && b.smokingConsumption !== "REGULARLY") score += 3;
  else if (a.smokingConsumption !== "REGULARLY" && b.smokingConsumption !== "REGULARLY") score += 2;

  return Math.min(score, 10);
}

function scoreAge(a: Profile, b: Profile): number {
  // Max 5 points
  const ageA = new Date().getFullYear() - new Date(a.dob).getFullYear();
  const ageB = new Date().getFullYear() - new Date(b.dob).getFullYear();
  const diff = Math.abs(ageA - ageB);

  if (diff <= 2) return 5;
  if (diff <= 5) return 4;
  if (diff <= 8) return 2;
  return 0;
}

function scoreLocation(a: Profile, b: Profile): number {
  // Max 5 points
  if (!a.workLocation || !b.workLocation) return 2;
  const locA = a.workLocation.toLowerCase();
  const locB = b.workLocation.toLowerCase();

  if (locA === locB) return 5;
  // Same state (simplified check)
  if (locA.split(",").pop()?.trim() === locB.split(",").pop()?.trim()) return 3;
  return 1;
}

function scoreEducation(a: Profile, b: Profile): number {
  // Max 10 points
  const eduRank: Record<string, number> = {
    "10TH": 1, "12TH": 2, "DIPLOMA": 3,
    "GRADUATE": 4, "POSTGRADUATE": 5, "DOCTORATE": 6,
  };

  const rankA = eduRank[a.education?.toUpperCase() ?? ""] ?? 0;
  const rankB = eduRank[b.education?.toUpperCase() ?? ""] ?? 0;
  const diff = Math.abs(rankA - rankB);

  if (diff === 0) return 10;
  if (diff === 1) return 8;
  if (diff === 2) return 5;
  return 2;
}

function scoreFamily(a: Profile, b: Profile): number {
  // Max 10 points
  let score = 0;
  if (a.familyType === b.familyType) score += 5;
  else score += 2;

  if (a.familyValues === b.familyValues) score += 5;
  else score += 2;

  return Math.min(score, 10);
}

function scoreWorkPreference(a: Profile, b: Profile): number {
  // Max 5 points
  const prefs = (a.partnerPreferences as any) || {};
  if (!prefs.workingSpousePreference) return 3;

  if (prefs.workingSpousePreference === "PREFERRED" && b.employmentType !== "NOT_WORKING") return 5;
  if (prefs.workingSpousePreference === "NOT_PREFERRED" && b.employmentType === "NOT_WORKING") return 5;
  if (prefs.workingSpousePreference === "NO_PREFERENCE") return 5;

  return 2;
}

function scoreLocationPreference(a: Profile, b: Profile): number {
  // Max 10 points
  const prefs = (a.partnerPreferences as any) || {};
  if (!prefs.locationPreference) return 5;

  const locA = a.workLocation?.toLowerCase() ?? "";
  const locB = b.workLocation?.toLowerCase() ?? "";

  if (prefs.locationPreference === "SAME_CITY" && locA === locB) return 10;
  if (prefs.locationPreference === "SAME_CITY" && locA !== locB) return 2;
  if (prefs.locationPreference === "SAME_STATE") {
    const stateA = locA.split(",").pop()?.trim() ?? "";
    const stateB = locB.split(",").pop()?.trim() ?? "";
    return stateA === stateB ? 10 : 4;
  }
  if (prefs.locationPreference === "ANYWHERE") return 10;

  return 5;
}

// ─── Filter / Search ─────────────────────────────────────────────────────────

export interface SearchFilters {
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  tradition?: string;
  diet?: string;
  meditation?: string;
  maritalStatus?: string;
  hasChildren?: boolean;
  familyType?: string;
  employmentType?: string;
  minIncome?: string;
  location?: string;
  vipassanaCourse?: string;
  photoVerified?: boolean;
  gender?: string;
}

export function buildSearchQuery(filters: SearchFilters) {
  const where: any = { isVisible: true, isPaused: false };

  if (filters.tradition) where.buddhistTradition = filters.tradition;
  if (filters.diet) where.diet = filters.diet;
  if (filters.meditation) where.meditationPractice = filters.meditation;
  if (filters.maritalStatus) where.maritalStatus = filters.maritalStatus;
  if (typeof filters.hasChildren === "boolean") where.haveChildren = filters.hasChildren;
  if (filters.familyType) where.familyType = filters.familyType;
  if (filters.vipassanaCourse) where.vipassanaCourse = filters.vipassanaCourse;
  if (filters.gender) where.gender = filters.gender;
  if (filters.location) {
    where.workLocation = { contains: filters.location, mode: "insensitive" };
  }

  // Age filter via dob
  if (filters.minAge || filters.maxAge) {
    const now = new Date();
    where.dob = {};
    if (filters.maxAge) {
      const minDob = new Date(now.getFullYear() - filters.maxAge, now.getMonth(), now.getDate());
      where.dob.gte = minDob;
    }
    if (filters.minAge) {
      const maxDob = new Date(now.getFullYear() - filters.minAge, now.getMonth(), now.getDate());
      where.dob.lte = maxDob;
    }
  }

  // Height filter
  if (filters.minHeight) where.heightCm = { ...(where.heightCm ?? {}), gte: filters.minHeight };
  if (filters.maxHeight) where.heightCm = { ...(where.heightCm ?? {}), lte: filters.maxHeight };

  return where;
}
