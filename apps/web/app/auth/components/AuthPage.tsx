'use client';

import React, { useState } from "react";
import type { AuthTab } from "../types";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .lbc-auth-root {
    font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f4f4f4;
    min-height: 100vh;
    color: #1a1a1a;
  }
  .lbc-auth-root input:focus,
  .lbc-auth-root select:focus {
    border-color: #ff6e14 !important;
    box-shadow: 0 0 0 3px rgba(255, 110, 20, 0.12) !important;
    outline: none;
  }
  @keyframes lbc-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes lbc-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .lbc-fade-in { animation: lbc-fade-in 0.2s ease-out; }
`;

interface AuthPageProps {
  defaultTab?: AuthTab;
  onAuthSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ defaultTab = "login", onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);

  const handleSuccess = () => {
    onAuthSuccess?.();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="lbc-auth-root">
        <div style={styles.topbar}>
          <div style={styles.topbarInner}>
            <a style={styles.topbarLink} href="/help">Aide</a>
            <a style={styles.topbarLink} href="/security">Sécurité</a>
            <a style={styles.topbarLink} href="/">maghreb-market.com</a>
          </div>
        </div>

        <nav style={styles.nav}>
          <a href="/" style={styles.logo}>MM</a>
          <span style={styles.navTitle}>
            {activeTab === "login" && "Connexion"}
            {activeTab === "register" && "Créer un compte"}
            {activeTab === "forgot" && "Mot de passe oublié"}
          </span>
        </nav>

        <main style={styles.main}>
          {activeTab !== "forgot" && (
            <div style={styles.tabs}>
              <TabButton active={activeTab === "login"} onClick={() => setActiveTab("login")}>
                Se connecter
              </TabButton>
              <TabButton active={activeTab === "register"} onClick={() => setActiveTab("register")}>
                Créer un compte
              </TabButton>
            </div>
          )}

          <div
            style={{
              ...styles.card,
              borderRadius: activeTab === "forgot" ? 10 : "0 0 10px 10px",
              borderTop: activeTab === "forgot" ? "1px solid #e0e0e0" : "none",
            }}
          >
            <div className="lbc-fade-in" key={activeTab}>
              {activeTab === "login" && (
                <LoginForm
                  onSuccess={handleSuccess}
                  onForgotPassword={() => setActiveTab("forgot")}
                  onRegister={() => setActiveTab("register")}
                />
              )}
              {activeTab === "register" && (
                <RegisterForm
                  onSuccess={handleSuccess}
                  onLogin={() => setActiveTab("login")}
                />
              )}
              {activeTab === "forgot" && (
                <ForgotPasswordForm onBack={() => setActiveTab("login")} />
              )}
            </div>
          </div>

          <div style={styles.trustBadges}>
            {[
              { icon: "🔒", label: "Connexion sécurisée SSL" },
              { icon: "🛡️", label: "Données protégées RGPD" },
              { icon: "✅", label: "+35 000 annonces actives" },
            ].map(badge => (
              <div key={badge.label} style={styles.trustBadge}>
                <span style={{ fontSize: 18 }}>{badge.icon}</span>
                <span style={{ fontSize: 11, color: "#777" }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </main>

        <footer style={styles.footer}>
          <div style={styles.footerLinks}>
            {[
              { label: "CGU", href: "/legal/terms" },
              { label: "Confidentialité", href: "/legal/privacy" },
              { label: "Cookies", href: "/legal/cookies" },
              { label: "Aide", href: "/help" },
              { label: "Sécurité", href: "/security" },
              { label: "Mentions légales", href: "/legal" },
            ].map(link => (
              <a key={link.label} href={link.href} style={styles.footerLink}>
                {link.label}
              </a>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#b1b1b1", marginTop: 8 }}>
            © {new Date().getFullYear()} Maghreb Market. Tous droits réservés.
          </p>
        </footer>
      </div>
    </>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      flex: 1,
      padding: "14px 10px",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      color: active ? "#ff6e14" : "#717171",
      background: active ? "#fff" : "#f7f7f7",
      border: "none",
      borderBottom: `3px solid ${active ? "#ff6e14" : "transparent"}`,
      transition: "all 0.15s",
      fontFamily: "inherit",
    }}
  >
    {children}
  </button>
);

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    background: "#1c2b5e",
    padding: "6px 0",
  },
  topbarInner: {
    maxWidth: 520,
    margin: "0 auto",
    padding: "0 16px",
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    fontSize: 12,
  },
  topbarLink: {
    color: "#c5c9e6",
    textDecoration: "none",
  },
  nav: {
    background: "#fff",
    borderBottom: "1px solid #e3e3e3",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    background: "#ff6e14",
    color: "#fff",
    fontWeight: 900,
    fontSize: 22,
    padding: "6px 12px",
    borderRadius: 8,
    textDecoration: "none",
    letterSpacing: -0.5,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 700,
  },
  main: {
    maxWidth: 460,
    margin: "36px auto",
    padding: "0 16px 40px",
  },
  tabs: {
    display: "flex",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "10px 10px 0 0",
    overflow: "hidden",
  },
  card: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    padding: 26,
  },
  trustBadges: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 18,
  },
  trustBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: "6px 10px",
  },
  footer: {
    textAlign: "center",
    padding: "24px 16px",
    borderTop: "1px solid #e0e0e0",
    background: "#fff",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  footerLink: {
    fontSize: 12,
    color: "#717171",
    textDecoration: "none",
  },
};

export default AuthPage;
