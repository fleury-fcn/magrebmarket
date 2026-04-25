'use client';

import React, { forwardRef, useState, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({ label, error, hint, id, ...props }, ref) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      style={{
        ...styles.input,
        ...(error ? styles.inputError : {}),
      }}
      {...props}
    />
    {hint && !error && <p style={styles.hint}>{hint}</p>}
    {error && (
      <p style={styles.errorMsg}>
        <ErrorIcon />
        {error}
      </p>
    )}
  </div>
));
InputField.displayName = "InputField";

interface PasswordInputProps extends InputFieldProps {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ label, error, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.passwordWrap}>
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          style={{
            ...styles.input,
            paddingRight: 44,
            ...(error ? styles.inputError : {}),
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={styles.eyeBtn}
          aria-label={visible ? "Masquer" : "Afficher"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p style={styles.errorMsg}>
          <ErrorIcon /> {error}
        </p>
      )}
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, error, options, id, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
    )}
    <select id={id} style={styles.input} {...props}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p style={styles.errorMsg}>
        <ErrorIcon /> {error}
      </p>
    )}
  </div>
);

interface CheckboxProps {
  label: React.ReactNode;
  error?: string;
  checked: boolean;
  onChange: (_checked: boolean) => void;
  name?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, error, checked, onChange, name }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={styles.checkWrap}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        style={{ width: 16, height: 16, accentColor: "#ff6e14", flexShrink: 0, marginTop: 1, cursor: "pointer" }}
      />
      <span style={{ fontSize: 12, color: "#555", lineHeight: 1.4 }}>{label}</span>
    </label>
    {error && (
      <p style={{ ...styles.errorMsg, marginTop: 4 }}>
        <ErrorIcon /> {error}
      </p>
    )}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "social";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  fullWidth = true,
  children,
  disabled,
  style,
  ...props
}) => {
  let base: React.CSSProperties;
  if (variant === "primary") {
    base = styles.btnPrimary;
  } else if (variant === "secondary") {
    base = styles.btnSecondary;
  } else {
    base = styles.btnSocial;
  }

  return (
    <button
      disabled={disabled || loading}
      style={{
        ...base,
        ...(fullWidth ? { width: "100%" } : {}),
        ...(disabled || loading ? styles.btnDisabled : {}),
        ...style,
      }}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

interface AlertProps {
  type: "success" | "error" | "info";
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const palette = {
    success: { bg: "#e8f5e9", border: "#a5d6a7", text: "#2e7d32" },
    error: { bg: "#fdeaea", border: "#f5a8a8", text: "#b91c1c" },
    info: { bg: "#e3f2fd", border: "#90caf9", text: "#1565c0" },
  } as const;
  const c = palette[type];
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        color: c.text,
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
      }}
    >
      {type === "success" && <CheckIcon />}
      {type === "error" && <ErrorIcon color={c.text} />}
      {message}
    </div>
  );
};

export const Divider: React.FC<{ label?: string }> = ({ label = "ou" }) => (
  <div style={styles.divider}>
    <div style={styles.dividerLine} />
    <span style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap", padding: "0 8px" }}>{label}</span>
    <div style={styles.dividerLine} />
  </div>
);

interface StepBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export const StepBar: React.FC<StepBarProps> = ({ currentStep, totalSteps, labels }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
    {Array.from({ length: totalSteps }, (_, idx) => {
      const step = idx + 1;
      const done = step < currentStep;
      const active = step === currentStep;
      const borderColor = done ? "#22c55e" : active ? "#ff6e14" : "#e0e0e0";
      const textColor = done ? "#fff" : active ? "#ff6e14" : "#999";
      return (
        <React.Fragment key={step}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `2px solid ${borderColor}`,
                background: done ? "#22c55e" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: textColor,
                transition: "all 0.2s",
              }}
            >
              {done ? "✓" : step}
            </div>
            {labels?.[idx] && (
              <span style={{ fontSize: 10, color: active ? "#ff6e14" : "#999", fontWeight: active ? 700 : 400 }}>
                {labels[idx]}
              </span>
            )}
          </div>
          {step < totalSteps && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: done ? "#22c55e" : "#e0e0e0",
                margin: labels ? "0 6px 16px" : "0 6px",
                transition: "background 0.3s",
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

interface PasswordStrengthBarProps {
  score: number;
  label: string;
  color: string;
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ score, label, color }) => (
  <div style={{ marginTop: 6 }}>
    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
      {Array.from({ length: 4 }, (_, idx) => (
        <div
          key={idx}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: idx < score ? color : "#e0e0e0",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
    <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
  </div>
);

export const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const ErrorIcon = ({ color = "#e84046" }: { color?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Spinner = () => (
  <span
    style={{
      display: "inline-block",
      width: 15,
      height: 15,
      border: "2px solid rgba(255,255,255,0.35)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "lbc-spin 0.7s linear infinite",
      marginRight: 7,
      verticalAlign: "middle",
    }}
  />
);

export const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const styles = {
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#333",
    marginBottom: 5,
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "11px 13px",
    border: "1.5px solid #d0d0d0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    background: "#fff",
    color: "#1a1a1a",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  inputError: {
    borderColor: "#e84046",
    boxShadow: "0 0 0 3px rgba(232,64,70,0.1)",
  } as React.CSSProperties,
  errorMsg: {
    fontSize: 12,
    color: "#e84046",
    marginTop: 5,
    display: "flex",
    alignItems: "center",
    gap: 5,
  } as React.CSSProperties,
  hint: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  } as React.CSSProperties,
  passwordWrap: {
    position: "relative",
  } as React.CSSProperties,
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
    padding: 4,
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  checkWrap: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    cursor: "pointer",
  } as React.CSSProperties,
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "18px 0",
  } as React.CSSProperties,
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#e0e0e0",
  } as React.CSSProperties,
  btnPrimary: {
    padding: "13px 20px",
    background: "#ff6e14",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
    letterSpacing: 0.2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxSizing: "border-box",
  } as React.CSSProperties,
  btnSecondary: {
    padding: "13px 20px",
    background: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxSizing: "border-box",
  } as React.CSSProperties,
  btnSocial: {
    padding: "11px 14px",
    background: "#fff",
    color: "#1a1a1a",
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxSizing: "border-box",
    width: "100%",
    marginBottom: 10,
  } as React.CSSProperties,
  btnDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  } as React.CSSProperties,
} as const;
