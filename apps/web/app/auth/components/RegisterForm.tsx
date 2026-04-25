'use client';

import React, { useEffect, useMemo, useState } from "react";
import type { FormErrors, RegisterFormData, RegisterStep } from "../types";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../hooks/useAuth";
import {
  getPasswordStrength,
  validateRegisterStep1,
  validateRegisterStep2,
  validateRegisterStep3,
} from "../utils/validation";
import { COUNTRY_OPTIONS, REGION_OPTIONS } from "../utils/geography";
import {
  Alert,
  Button,
  Checkbox,
  InputField,
  PasswordInput,
  PasswordStrengthBar,
  SelectField,
  StepBar,
} from "./ui";

const STEP_LABELS = ["Identité", "Sécurité", "Validation"];

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLogin }) => {
  const { register } = useAuth();
  const [step, setStep] = useState<RegisterStep>(1);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { values, errors, handleChange, setFieldValue, setFieldError } = useForm<RegisterFormData>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      phone: "",
      country: "MA",
      city: "",
      acceptTerms: false,
      newsletter: false,
    },
  });

  const passwordStrength = useMemo(() => {
    if (!values.password) return null;
    return getPasswordStrength(values.password);
  }, [values.password]);

  const regionOptions = useMemo(() => REGION_OPTIONS[values.country] ?? [], [values.country]);

  useEffect(() => {
    if (!values.city) return;
    if (!regionOptions.includes(values.city)) {
      setFieldValue("city", "");
    }
  }, [regionOptions, setFieldValue, values.city]);

  const applyErrors = (validationErrors: FormErrors): boolean => {
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        if (message) {
          setFieldError(field, message);
        }
      });
    }
    return !hasErrors;
  };

  const validateStep = (targetStep: RegisterStep): boolean => {
    if (targetStep === 1) {
      return applyErrors(validateRegisterStep1(values));
    }
    if (targetStep === 2) {
      return applyErrors(validateRegisterStep2(values));
    }
    return applyErrors(validateRegisterStep3(values));
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep(prev => (prev + 1) as RegisterStep);
  };

  const goBack = () => {
    setErrorMsg(null);
    setStep(prev => (prev - 1) as RegisterStep);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await register(values);
      setSuccessMsg(`Bienvenue ${values.firstName} !`);
      setTimeout(() => onSuccess?.(), 1600);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <StepBar currentStep={step} totalSteps={3} labels={STEP_LABELS} />

      {successMsg && <Alert type="success" message={successMsg} />}
      {errorMsg && <Alert type="error" message={errorMsg} />}

      {!successMsg && (
        <>
          {step === 1 && (
            <div className="lbc-fade-in">
              <InputField
                id="reg-first-name"
                label="Prénom *"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="Ex: Yasmine"
                autoComplete="given-name"
              />
              <InputField
                id="reg-last-name"
                label="Nom *"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Ex: El Amrani"
                autoComplete="family-name"
              />
              <InputField
                id="reg-email"
                label="Adresse e-mail *"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="exemple@email.fr"
                autoComplete="email"
              />
            </div>
          )}
          {step === 2 && (
            <div className="lbc-fade-in">
              <div style={{ marginBottom: 16 }}>
                <PasswordInput
                  id="reg-password"
                  label="Mot de passe *"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                />
                {passwordStrength && (
                  <PasswordStrengthBar
                    score={passwordStrength.score}
                    label={passwordStrength.label}
                    color={passwordStrength.color}
                  />
                )}
              </div>
              <PasswordInput
                id="reg-password-confirm"
                label="Confirmer le mot de passe *"
                name="passwordConfirm"
                value={values.passwordConfirm}
                onChange={handleChange}
                error={errors.passwordConfirm}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <InputField
                id="reg-phone"
                label="Téléphone (optionnel)"
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="06 12 34 56 78"
                autoComplete="tel"
              />
            </div>
          )}
          {step === 3 && (
            <div className="lbc-fade-in">
              <SelectField
                id="reg-country"
                label="Pays *"
                name="country"
                value={values.country}
                onChange={handleChange}
                options={COUNTRY_OPTIONS}
                error={errors.country}
              />
              {regionOptions.length > 0 ? (
                <SelectField
                  id="reg-city"
                  label="Région *"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Sélectionnez une région" },
                    ...regionOptions.map(name => ({ value: name, label: name })),
                  ]}
                  error={errors.city}
                />
              ) : (
                <InputField
                  id="reg-city"
                  label="Ville / Région"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  placeholder="Casablanca, Tunis, Alger..."
                  error={errors.city}
                />
              )}

              <div style={summaryBoxStyle}>
                <strong style={{ display: "block", marginBottom: 6, color: "#333" }}>
                  Récapitulatif
                </strong>
                <p style={summaryLineStyle}>
                  Profil : <span style={summaryValueStyle}>{values.firstName} {values.lastName}</span>
                </p>
                <p style={summaryLineStyle}>
                  Email : <span style={summaryValueStyle}>{values.email}</span>
                </p>
                <p style={summaryLineStyle}>
                  Localisation : <span style={summaryValueStyle}>{values.city || "Non renseignée"}</span>
                </p>
              </div>

              <Checkbox
                name="acceptTerms"
                checked={values.acceptTerms}
                onChange={checked => setFieldValue("acceptTerms", checked)}
                error={errors.acceptTerms}
                label={
                  <span>
                    J&apos;accepte les <a href="/legal/terms" style={linkStyle}>Conditions Générales d&apos;Utilisation</a>{" "}
                    et la <a href="/legal/privacy" style={linkStyle}>Politique de confidentialité</a>.
                  </span>
                }
              />

              <Checkbox
                name="newsletter"
                checked={values.newsletter}
                onChange={checked => setFieldValue("newsletter", checked)}
                label="Je souhaite recevoir les offres et bons plans par e-mail."
              />

              <div style={infoBannerStyle}>
                <span role="img" aria-label="Sécurité" style={{ fontSize: 18 }}>
                  🔒
                </span>
                <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8" }}>
                  Vos données sont chiffrées et stockées en Europe conformément au RGPD.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={goBack} style={{ flex: 1 }}>
                ← Retour
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" onClick={goNext} style={{ flex: step > 1 ? 2 : 1 }}>
                Continuer →
              </Button>
            ) : (
              <Button type="submit" loading={loading} disabled={loading} style={{ flex: 2 }}>
                {loading ? "Création..." : "Créer mon compte"}
              </Button>
            )}
          </div>
        </>
      )}

      {successMsg && (
        <Button type="button" onClick={onSuccess} style={{ marginTop: 12 }}>
          Accéder à mon espace
        </Button>
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 16 }}>
        Déjà inscrit ?{" "}
        <button type="button" onClick={onLogin} style={linkStyle}>
          Se connecter
        </button>
      </p>
    </form>
  );
};

const linkStyle: React.CSSProperties = {
  color: "#ff6e14",
  textDecoration: "none",
  fontWeight: 700,
  cursor: "pointer",
  background: "none",
  border: "none",
  padding: 0,
  fontFamily: "inherit",
  fontSize: 12,
};

const summaryBoxStyle: React.CSSProperties = {
  background: "#f8f8f8",
  border: "1px solid #e0e0e0",
  borderRadius: 10,
  padding: 14,
  margin: "12px 0 18px",
  fontSize: 13,
  color: "#555",
  lineHeight: 1.6,
};

const summaryLineStyle: React.CSSProperties = {
  margin: "4px 0",
  display: "flex",
  justifyContent: "space-between",
  fontSize: 12,
};

const summaryValueStyle: React.CSSProperties = {
  color: "#ff6e14",
  fontWeight: 700,
};

const infoBannerStyle: React.CSSProperties = {
  marginTop: 12,
  border: "1px solid #bfdbfe",
  background: "#ecf4ff",
  borderRadius: 10,
  padding: "10px 14px",
  display: "flex",
  alignItems: "center",
  gap: 10,
};
