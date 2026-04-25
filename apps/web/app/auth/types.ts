export type AuthTab = "login" | "register" | "forgot";

export type RegisterStep = 1 | 2 | 3;

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  score: number;
  strength: PasswordStrength;
  label: string;
  color: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone?: string;
  country: string;
  city?: string;
  acceptTerms: boolean;
  newsletter: boolean;
}

export interface ForgotFormData {
  email: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  country?: string | null;
  city?: string | null;
  is_verified: boolean;
  avatar?: string | null;
}

export type SocialProvider = "google" | "facebook";
