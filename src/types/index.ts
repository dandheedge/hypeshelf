import type { RecommendationFormData } from "@/lib/schemas";

export type { RecommendationFormData };

export interface Recommendation {
  _id: string;
  _creationTime: number;
  title: string;
  genre:
    | "horror"
    | "action"
    | "comedy"
    | "thriller"
    | "sci-fi"
    | "drama"
    | "romance"
    | "documentary";
  link?: string;
  blurb: string;
  isStaffPick: boolean;
  userName: string;
  userImageUrl?: string;
  // Server-provided auth context
  currentUserRole?: UserRole;
  isOwner?: boolean;
}

export type UserRole = "admin" | "user";
