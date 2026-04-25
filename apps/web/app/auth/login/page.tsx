'use client';

import { useRouter } from "next/navigation";
import AuthPage from "../components/AuthPage";

interface LoginPageProps {
  readonly searchParams?: { readonly next?: string };
}

const sanitizeNextPath = (value?: string): string => {
  if (!value || typeof value !== "string") return "/";
  return value.startsWith("/") ? value : "/";
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const router = useRouter();
  const nextPath = sanitizeNextPath(searchParams?.next);
  return (
    <AuthPage
      defaultTab="login"
      onAuthSuccess={() => router.push(nextPath)}
    />
  );
}
