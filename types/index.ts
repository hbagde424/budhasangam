// types/index.ts
import type { User, Profile, Photo, Interest, Connection, ChatMessage, Subscription } from "@prisma/client";

// ─── Extended types with relations ───────────────────────────

export type UserWithProfile = User & {
  profile: Profile | null;
  photos: Photo[];
  subscription: Subscription | null;
};

export type ProfileWithUser = Profile & {
  user: User & {
    photos: Photo[];
    subscription: Subscription | null;
    _count?: {
      interestsSent: number;
      interestsReceived: number;
      connections1: number;
      connections2: number;
    };
  };
};

export type InterestWithUsers = Interest & {
  fromUser: UserWithProfile;
  toUser: UserWithProfile;
};

export type ConnectionWithUsers = Connection & {
  user1: UserWithProfile;
  user2: UserWithProfile;
  messages: ChatMessage[];
  _count?: { messages: number };
};

export type ChatMessageWithSender = ChatMessage & {
  sender: UserWithProfile;
};

// ─── API Response types ───────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Search & Filter types ────────────────────────────────────

export interface ProfileSearchFilters {
  gender?: "MALE" | "FEMALE" | "OTHER";
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
  location?: string;
  vipassanaCourse?: string;
  photoVerified?: boolean;
  sortBy?: "compatibility" | "newest" | "age_asc" | "age_desc";
  page?: number;
  limit?: number;
}

// ─── Form types ───────────────────────────────────────────────

export interface BiodataFormData {
  // Personal
  fullName: string;
  gender: string;
  dob: string;
  birthTime?: string;
  birthPlace?: string;
  heightCm?: number;
  weightKg?: number;
  bloodGroup?: string;
  maritalStatus: string;
  haveChildren: boolean;
  childrenCount?: number;

  // Religious
  buddhistTradition: string;
  subTradition?: string;
  dhammaName?: string;
  refugeTaken: boolean;
  refugeYear?: number;
  meditationPractice?: string;
  meditationLevel?: string;
  dailyPractice: boolean;
  vipassanaCourse: string;
  alcoholConsumption: string;
  smokingConsumption: string;
  templeAffiliation?: string;

  // Education
  education?: string;
  educationDetails?: object;
  occupation?: string;
  company?: string;
  annualIncome?: string;
  employmentType?: string;
  workLocation?: string;
  willingToRelocate: boolean;

  // Family
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  brothersCount: number;
  brothersMarried: number;
  sistersCount: number;
  sistersMarried: number;
  familyType: string;
  familyValues: string;
  familyLocation?: string;
  familyIncome?: string;

  // Lifestyle
  diet: string;
  hobbies: string[];
  languages?: object;
  aboutMe?: string;
  partnerExpectation?: string;
  exerciseHabit?: string;

  // Preferences
  partnerPreferences: PartnerPreferences;
}

export interface PartnerPreferences {
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  maritalStatus?: string[];
  childrenAcceptable?: boolean;
  tradition?: string;
  diet?: string;
  drinking?: string;
  smoking?: string;
  minEducation?: string;
  occupation?: string;
  minIncome?: string;
  locationPreference?: string;
  livingPreference?: string;
  workingSpousePreference?: string;
  horoscopeRequired?: boolean;
}

// ─── Notification types ───────────────────────────────────────

export type NotificationType =
  | "interest_received"
  | "interest_accepted"
  | "interest_declined"
  | "new_message"
  | "profile_view"
  | "match_suggestion"
  | "subscription_expiry";

export interface NotificationData {
  type: NotificationType;
  userId?: string;
  name?: string;
  photo?: string;
  message?: string;
  connectionId?: string;
  interestId?: string;
}

// ─── Next Auth Session extension ─────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      isVerified: boolean;
      premiumUntil: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
    premiumUntil: string | null;
  }
}
