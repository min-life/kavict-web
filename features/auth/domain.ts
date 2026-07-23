export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  preferredName?: string;
  occupationGroup?: string;
  monthlyIncome?: string;
  highestExpenses?: string[];
  financialGoal?: string;
  onboarded?: boolean;
  avatarKey?: string | null;
  informationForKavi?: string;
  kaviTone?: KaviTone;
  responseStyle?: ResponseStyle;
}

export type KaviTone = "vui vẻ" | "nghiêm túc" | "ấm áp" | "giận dữ";
export type ResponseStyle = "concise" | "detailed";

export interface ProfilePreferencesInput {
  avatarKey: string | null;
  informationForKavi: string;
  kaviTone: KaviTone;
  responseStyle: ResponseStyle;
}

export interface OnboardingInput {
  preferredName: string;
  occupationGroup: string;
  monthlyIncome: string;
  highestExpenses: string[];
  financialGoal: string;
}
