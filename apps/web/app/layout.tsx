import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { bodyFont, headingFont } from "./fonts";
import { AuthProvider } from "./auth/hooks/useAuth";
import { LanguageProvider } from "./i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "Maghreb Market — Annonces locales",
  description: "Le hub d'annonces premium pour la Mauritanie, le Maroc, l'Algérie, la Tunisie et la Libye."
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="fr" className={`${headingFont.variable} ${bodyFont.variable}`}>
    <body>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </body>
  </html>
);

export default RootLayout;
