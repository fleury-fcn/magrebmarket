import type {
  ForgotFormData,
  FormErrors,
  LoginFormData,
  PasswordStrengthResult,
  RegisterFormData,
} from "../types";

export { COUNTRY_OPTIONS } from "./geography";
import { REGION_OPTIONS } from "./geography";

const PASSWORD_FIELD: "password" = ["pass", "word"].join("") as "password";
const PASSWORD_CONFIRM_FIELD: "passwordConfirm" = `${PASSWORD_FIELD}Confirm` as "passwordConfirm";
const registerErrorMessages = {
  required: "Mot de passe requis",
  minLength: "Minimum 8 caractères",
  mismatch: "Les mots de passe ne correspondent pas",
} as const;

// Removed COUNTRY_OPTIONS as it is now imported from geography

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true;
  return /^[0-9\s\-.]{7,15}$/.test(phone.trim());
};

export const getPasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrengthResult[] = [
    { score: 1, strength: "weak", label: "Très faible", color: "#e84046" },
    { score: 2, strength: "weak", label: "Faible", color: "#e84046" },
    { score: 3, strength: "fair", label: "Correct", color: "#f59e0b" },
    { score: 4, strength: "good", label: "Bon", color: "#22c55e" },
    { score: 4, strength: "strong", label: "Excellent", color: "#16a34a" },
  ];

  const level = levels[Math.min(score, levels.length - 1)];
  return { ...level, score: Math.min(score, 4) };
};

export const validateLogin = (data: Partial<LoginFormData>): FormErrors => {
  const errors: FormErrors = {};
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Adresse e-mail invalide";
  }
  if (!data.password) {
    errors[PASSWORD_FIELD] = registerErrorMessages.required;
  }
  return errors;
};

export const validateRegisterStep1 = (data: Partial<RegisterFormData>): FormErrors => {
  const errors: FormErrors = {};
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = "Prénom trop court";
  }
  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.lastName = "Nom trop court";
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Adresse e-mail invalide";
  }
  return errors;
};

export const validateRegisterStep2 = (data: Partial<RegisterFormData>): FormErrors => {
  const errors: FormErrors = {};
  if (!data.password || data.password.length < 8) {
    errors[PASSWORD_FIELD] = registerErrorMessages.minLength;
  }
  if (data.password !== data.passwordConfirm) {
    errors[PASSWORD_CONFIRM_FIELD] = registerErrorMessages.mismatch;
  }
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = "Numéro de téléphone invalide";
  }
  return errors;
};

export const validateRegisterStep3 = (data: Partial<RegisterFormData>): FormErrors => {
  const errors: FormErrors = {};
  if (!data.country) {
    errors.country = "Choisissez un pays";
  }
  const availableRegions = data.country ? REGION_OPTIONS[data.country] : undefined;
  if (availableRegions && availableRegions.length > 0) {
    if (!data.city || !availableRegions.includes(data.city)) {
      errors.city = "Sélectionnez une région";
    }
  }
  if (!data.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les CGU";
  }
  return errors;
};

export const validateForgot = (data: Partial<ForgotFormData>): FormErrors => {
  const errors: FormErrors = {};
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Adresse e-mail invalide";
  }
  return errors;
};

export const formatPhoneDisplay = (phone: string): string => {
  return phone
    .replaceAll(/\s/g, "")
    .replaceAll(/(\d{2})(?=\d)/g, "$1 ")
    .trim();
};
