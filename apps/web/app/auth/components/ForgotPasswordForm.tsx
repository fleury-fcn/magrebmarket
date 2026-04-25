'use client';

import React, { useState } from "react";
import type { ForgotFormData } from "../types";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../hooks/useAuth";
import { validateForgot } from "../utils/validation";
import { Alert, BackIcon, Button, InputField } from "./ui";

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const { sendResetEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { values, errors, handleChange, validateForm } = useForm<ForgotFormData>({
    initialValues: { email: "" },
    validate: validateForgot,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm(values)) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await sendResetEmail(values);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <button type="button" onClick={onBack} style={backBtnStyle}>
        <BackIcon /> Retour à la connexion
      </button>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Mot de passe oublié ?</h2>
      <p style={{ fontSize: 13, color: "#717171", marginBottom: 18 }}>
        Saisissez votre e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      {success && <Alert type="success" message="Email envoyé ! Vérifiez votre boîte de réception." />}
      {errorMsg && <Alert type="error" message={errorMsg} />}

      {!success && (
        <>
          <InputField
            id="forgot-email"
            label="Adresse e-mail"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="exemple@email.fr"
            disabled={loading}
          />
          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </>
      )}

      {success && (
        <Button type="button" variant="secondary" onClick={onBack}>
          Retour à la connexion
        </Button>
      )}
    </form>
  );
};

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  color: "#ff6e14",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: 0,
  marginBottom: 16,
};
