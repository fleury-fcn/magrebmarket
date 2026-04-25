'use client';

import { useRouter } from "next/navigation";
import AuthPage from "../components/AuthPage";

interface RegisterPageProps {
  readonly searchParams?: { readonly next?: string };
}

const sanitizeNextPath = (value?: string): string => {
  if (!value || typeof value !== "string") return "/";
  return value.startsWith("/") ? value : "/";
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const router = useRouter();
  const nextPath = sanitizeNextPath(searchParams?.next);
  return (
    <AuthPage
      defaultTab="register"
      onAuthSuccess={() => router.push(nextPath)}
    />
  );
}
