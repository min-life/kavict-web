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
}

export interface OnboardingInput {
  preferredName: string;
  occupationGroup: string;
  monthlyIncome: string;
  highestExpenses: string[];
  financialGoal: string;
}
