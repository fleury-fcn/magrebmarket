'use client';

import React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { postJson } from "../../../lib/api";
import type {
  AuthUser,
  ForgotFormData,
  LoginFormData,
  RegisterFormData,
  SocialProvider,
} from "../types";

const STORAGE_KEY = "maghreb_auth_user";

const toRegisterPayload = (data: RegisterFormData) => ({
  email: data.email.trim(),
  password: data.password,
  first_name: data.firstName.trim(),
  last_name: data.lastName.trim(),
  phone_number: data.phone?.replaceAll(/\s+/g, "") || undefined,
  country: data.country,
  city: data.city?.trim() || undefined,
});

const parseError = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return "Une erreur est survenue";
};

const persistUser = (user: AuthUser | null) => {
  if (globalThis.window === undefined) return;
  if (!user) {
    globalThis.window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  globalThis.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<AuthUser>;
  register: (data: RegisterFormData) => Promise<AuthUser>;
  sendResetEmail: (data: ForgotFormData) => Promise<void>;
  socialLogin: (provider: SocialProvider) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    try {
      const cached = globalThis.window.localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (err) {
      console.warn("Unable to parse cached auth user", err);
    }
  }, []);

  const rememberUser = useCallback((profile: AuthUser | null, persistChoice = true) => {
    setUser(profile);
    if (!persistChoice) {
      persistUser(null);
      return;
    }
    persistUser(profile);
  }, []);

  const login = useCallback(async (data: LoginFormData): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const profile = await postJson<AuthUser>("auth/login/", {
        email: data.email.trim(),
        password: data.password,
      });
      rememberUser(profile, data.rememberMe);
      return profile;
    } catch (err) {
      const message = parseError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [rememberUser]);

  const register = useCallback(async (data: RegisterFormData): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const profile = await postJson<AuthUser>("auth/register/", toRegisterPayload(data));
      rememberUser(profile);
      return profile;
    } catch (err) {
      const message = parseError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [rememberUser]);

  const sendResetEmail = useCallback(async (data: ForgotFormData): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await postJson("auth/password/reset/", { email: data.email.trim() });
    } catch (err) {
      const message = parseError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const socialLogin = useCallback(async (provider: SocialProvider): Promise<AuthUser> => {
    const message = `Connexion ${provider} non disponible pour le moment`;
    setError(message);
    throw new Error(message);
  }, []);

  const logout = useCallback(async () => {
    try {
      await postJson("auth/logout/", {});
    } catch (err) {
      console.warn("Logout call failed", err);
    } finally {
      rememberUser(null);
    }
  }, [rememberUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, error, login, register, sendResetEmail, socialLogin, logout }),
    [user, loading, error, login, register, sendResetEmail, socialLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
