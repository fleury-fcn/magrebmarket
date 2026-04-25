'use client';

import React, { useState } from "react";
import type { LoginFormData, SocialProvider } from "../types";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../hooks/useAuth";
import { validateLogin } from "../utils/validation";
import { Alert, Button, Divider, InputField, PasswordInput, ShieldIcon } from "./ui";

const SOCIAL_BUTTONS: Array<{ provider: SocialProvider; label: string; color?: string }> = [
  { provider: "google", label: "Continuer avec Google" },
  { provider: "facebook", label: "Continuer avec Facebook", color: "#1877F2" },
];

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onForgotPassword, onRegister }) => {
  const { login, socialLogin } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<SocialProvider | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { values, errors, handleChange, validateForm } = useForm<LoginFormData>({
    initialValues: { email: "", password: "", rememberMe: false },
    validate: validateLogin,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm(values)) return;

    setLoginLoading(true);
    setErrorMsg(null);
    try {
      await login(values);
      setSuccessMsg("Connexion réussie, redirection en cours...");
      setTimeout(() => onSuccess?.(), 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSocial = async (provider: SocialProvider) => {
    setSocialLoadingProvider(provider);
    setErrorMsg(null);
    try {
      await socialLogin(provider);
      setSuccessMsg(`Connecté via ${provider}`);
      setTimeout(() => onSuccess?.(), 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setSocialLoadingProvider(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {successMsg && <Alert type="success" message={successMsg} />}
      {errorMsg && <Alert type="error" message={errorMsg} />}

      {SOCIAL_BUTTONS.map(btn => (
        <button
          key={btn.provider}
          type="button"
          onClick={() => handleSocial(btn.provider)}
          disabled={!!socialLoadingProvider || loginLoading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "11px 14px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            border: "1.5px solid #e0e0e0",
            background: btn.color ?? "#fff",
            color: btn.color ? "#fff" : "#1a1a1a",
            fontFamily: "inherit",
            marginBottom: 10,
          }}
        >
          {socialLoadingProvider === btn.provider ? "Connexion..." : btn.label}
        </button>
      ))}

      <Divider label="ou" />

      <InputField
        id="login-email"
        label="Adresse e-mail"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="exemple@email.fr"
        disabled={loginLoading}
        autoComplete="email"
      />

      <PasswordInput
        id="login-password"
        label="Mot de passe"
        name="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="••••••••"
        disabled={loginLoading}
        autoComplete="current-password"
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13 }}>
          <input
            type="checkbox"
            name="rememberMe"
            checked={values.rememberMe}
            onChange={handleChange}
            style={{ width: 15, height: 15, accentColor: "#ff6e14" }}
          />
          <span style={{ color: "#555" }}>Se souvenir de moi</span>
        </label>
        <button type="button" onClick={onForgotPassword} style={linkBtnStyle}>
          Mot de passe oublié ?
        </button>
      </div>

      {(() => {
        let label = "Se connecter";
        if (loginLoading) label = "Connexion...";
        else if (successMsg) label = "\u2713 Connect\u00e9 !";
        return (
          <Button type="submit" loading={loginLoading} disabled={loginLoading || !!successMsg}>
            {label}
          </Button>
        );
      })()}

      <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 16 }}>
        Pas encore de compte ?{" "}
        <button type="button" onClick={onRegister} style={linkBtnStyle}>
          S&apos;inscrire gratuitement
        </button>
      </p>

      <div style={securityStyle}>
        <ShieldIcon /> Connexion sécurisée SSL — vos données sont protégées
      </div>
    </form>
  );
};

const linkBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#ff6e14",
  fontWeight: 700,
  fontSize: 12,
  fontFamily: "inherit",
  padding: 0,
};

const securityStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  marginTop: 16,
  fontSize: 11,
  color: "#999",
};
