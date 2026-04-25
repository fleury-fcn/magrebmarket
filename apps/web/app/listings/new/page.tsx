'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nunito_Sans } from "next/font/google";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useLanguage } from "../../i18n/LanguageProvider";
import { apiFetch, postJson } from "../../../lib/api";
import {
  getPostAdContent,
  type CategoryContent,
  type PostAdContent,
  type Step,
} from "./content";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

type UploadedAsset = {
  path: string;
  url: string;
  relative_url: string;
  size: number;
  content_type: string;
  filename: string;
};

type Photo = {
  id: string;
  url: string;
  file: File;
  upload?: UploadedAsset;
  uploading?: boolean;
  uploadError?: string | null;
};

type PromotionType = "standard" | "urgent" | "premium";

type CountryOption = {
  code: string;
  label: string;
  regions: string[];
};

type CitiesResponse = {
  country: string;
  cities: string[];
};

type CreatedListing = {
  id?: number;
  slug?: string;
  title?: string;
  status?: string;
  promotion_type?: PromotionType;
};

type ListingPayload = {
  title: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  sub_category: string;
  country: string;
  region: string;
  city: string;
  zip_code: string;
  condition: string;
  negotiable: boolean;
  contact_email: string;
  contact_phone: string;
  whatsapp: string;
  promotion_type: PromotionType;
  tags: string[];
  attributes: Record<string, unknown>;
  images: Array<{ image_url: string; is_primary: boolean; order: number }>;
  cover_image: string;
};

interface FormData {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  condition: string;
  price: string;
  currency: string;
  negotiable: boolean;
  promotionType: PromotionType;
  country: string;
  region: string;
  city: string;
  zipCode: string;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  photos: Photo[];
}

const DEFAULT_CURRENCY = "MAD";
const DEFAULT_PHONE_PREFIX = "+212";
const COUNTRY_CURRENCY: Record<string, string> = {
  MR: "MRU",
  MA: "MAD",
  DZ: "DZD",
  TN: "TND",
  LY: "LYD",
};
const COUNTRY_PHONE_PREFIX: Record<string, string> = {
  MR: "+222",
  MA: "+212",
  DZ: "+213",
  TN: "+216",
  LY: "+218",
};
const CURRENCY_OPTIONS = ["MAD", "MRU", "DZD", "TND", "LYD", "EUR", "USD"];
const MAX_PHOTOS = 20;

const styles = {
  orange: "#E85C0D",
  orangeLight: "#FFF4EE",
  orangeDark: "#C44B09",
  blue: "#1A5276",
  blueLight: "#EBF5FB",
  gray50: "#F7F7F7",
  gray100: "#EEEEEE",
  gray200: "#DDDDDD",
  gray300: "#CCCCCC",
  gray400: "#999999",
  gray600: "#666666",
  gray900: "#1A1A1A",
  white: "#FFFFFF",
  green: "#1E8449",
  greenLight: "#EAFAF1",

  red: "#C0392B",
  redLight: "#FDEDEC",
} as const;

const initialData: FormData = {
  categoryId: "",
  subcategoryId: "",
  title: "",
  description: "",
  condition: "",
  price: "",
  currency: DEFAULT_CURRENCY,
  negotiable: false,
  promotionType: "standard",
  country: "",
  region: "",
  city: "",
  zipCode: "",
  contactEmail: "",
  phone: "",
  whatsapp: "",
  photos: [],
};

const uploadListingImage = async (file: File): Promise<UploadedAsset> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<UploadedAsset>('uploads/cover-image/', {
    method: 'POST',
    body: formData,
  });
};

const sanitizePhone = (value: string): string => value.replaceAll(/\D+/g, "");

const formatPhoneNumber = (value: string, country: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return trimmed.replaceAll(/\s+/g, "");
  }
  const digits = sanitizePhone(trimmed);
  if (!digits) return "";
  const prefix = COUNTRY_PHONE_PREFIX[country] ?? DEFAULT_PHONE_PREFIX;
  const normalizedPrefix = prefix.startsWith("+") ? prefix : `+${prefix}`;
  const withoutLeadingZero = digits.replace(/^0+/, "");
  return `${normalizedPrefix}${withoutLeadingZero}`;
};

const formatTemplate = (template: string, params: Record<string, string>): string =>
  template.replaceAll(/\{(\w+)\}/g, (_match, key) => params[key] ?? "");

const authWallCopy = {
  fr: {
    title: "Connectez-vous pour publier",
    description: "Créez ou connectez-vous à votre compte pour déposer une annonce et suivre vos discussions.",
    cta: "Se connecter",
  },
  en: {
    title: "Sign in to post",
    description: "Log in to your account to create a listing and keep track of buyer messages.",
    cta: "Sign in",
  },
  ar: {
    title: "سجّل الدخول لنشر إعلان",
    description: "قم بتسجيل الدخول لحفظ إعلانك ومتابعة المحادثات مع المشترين.",
    cta: "تسجيل الدخول",
  },
} as const;

interface NavbarProps {
  content: PostAdContent["navbar"];
  onCancel: () => void;
}

const Navbar = ({ content, onCancel }: NavbarProps) => (
  <header
    style={{
      background: styles.white,
      borderBottom: `2px solid ${styles.orange}`,
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Link
        href="/"
        aria-label={content.brand}
        style={{
          fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif",
          fontWeight: 900,
          fontSize: 22,
          color: styles.orange,
          letterSpacing: -0.5,
        }}
      >
        {content.brand}
      </Link>
    </div>
    <button
      type="button"
      onClick={onCancel}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: styles.gray600,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span>✕</span> {content.cancel}
    </button>
  </header>
);

interface StepIndicatorProps {
  steps: PostAdContent["steps"];
  current: Step;
}

const StepIndicator = ({ steps, current }: StepIndicatorProps) => (
  <div
    style={{
      background: styles.white,
      borderBottom: `1px solid ${styles.gray200}`,
      padding: "0 24px",
    }}
  >
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
      }}
    >
      {steps.map((step, index) => {
        const done = current > step.num;
        const active = current === step.num;
        const isLast = index === steps.length - 1;
        let circleColor = styles.gray200;
        if (done) {
          circleColor = styles.green;
        } else if (active) {
          circleColor = styles.orange;
        }
        const circleTextColor = done || active ? styles.white : styles.gray600;
        return (
          <div
            key={step.num}
            style={{
              display: "flex",
              alignItems: "center",
              flex: isLast ? "none" : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 0",
                opacity: !done && !active ? 0.45 : 1,
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: circleColor,
                  color: circleTextColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                {done ? "✓" : step.num}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? styles.gray900 : styles.gray600,
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: done ? styles.green : styles.gray200,
                  margin: "0 12px",
                  borderRadius: 2,
                  transition: "background 0.2s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

interface Step1CategoryProps {
  data: FormData;
  categories: CategoryContent[];
  copy: PostAdContent['step1'];
  onChange: (_updates: Partial<FormData>) => void;
}

const Step1Category = ({ data, categories, copy, onChange }: Step1CategoryProps) => {
  const selectedCat = categories.find(category => category.id === data.categoryId);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: styles.gray900, marginBottom: 6 }}>{copy.title}</h2>
      <p style={{ color: styles.gray600, fontSize: 14, marginBottom: 24 }}>{copy.description}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {categories.map(category => {
          const selected = data.categoryId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange({ categoryId: category.id, subcategoryId: "" })}
              style={{
                border: `2px solid ${selected ? styles.orange : styles.gray200}`,
                borderRadius: 8,
                padding: "14px 10px",
                background: selected ? styles.orangeLight : styles.white,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s",
                outline: "none",
              }}
            >
              <span style={{ fontSize: 26 }} aria-hidden>
                {category.icon}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: selected ? 700 : 500,
                  color: selected ? styles.orange : styles.gray900,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCat && (
        <div
          style={{
            border: `1px solid ${styles.gray200}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: styles.gray50,
              padding: "10px 16px",
              borderBottom: `1px solid ${styles.gray200}`,
              fontSize: 13,
              fontWeight: 700,
              color: styles.gray900,
            }}
          >
            {formatTemplate(copy.subcategoryTitle, { category: selectedCat.label })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {selectedCat.subcategories.map((subcategory, index) => {
              const selected = data.subcategoryId === subcategory.id;
              return (
                <button
                  key={subcategory.id}
                  type="button"
                  onClick={() => onChange({ subcategoryId: subcategory.id })}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    background: selected ? styles.orangeLight : styles.white,
                    border: "none",
                    borderTop: index >= 2 ? `1px solid ${styles.gray100}` : "none",
                    borderRight: index % 2 === 0 ? `1px solid ${styles.gray100}` : "none",
                    cursor: "pointer",
                    fontSize: 14,
                    color: selected ? styles.orange : styles.gray900,
                    fontWeight: selected ? 700 : 400,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.1s",
                  }}
                >
                  {selected && <span style={{ color: styles.orange, fontSize: 16 }}>✓</span>}
                  {subcategory.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface Step2PhotosProps {
  data: FormData;
  copy: PostAdContent['step2'];
  onChange: (_updates: Partial<FormData>) => void;
  onRetryUpload: (_photoId: string) => void;
}

const Step2Photos = ({ data, copy, onChange, onRetryUpload }: Step2PhotosProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newPhotos: Photo[] = [];
      Array.from(files).forEach(file => {
        if (!file.type.startsWith("image/")) return;
        if (data.photos.length + newPhotos.length >= MAX_PHOTOS) return;
        const url = URL.createObjectURL(file);
        newPhotos.push({ id: `${Date.now()}-${Math.random()}`, url, file });
      });
      if (newPhotos.length > 0) {
        onChange({ photos: [...data.photos, ...newPhotos] });
      }
    },
    [data.photos, onChange]
  );

  const removePhoto = (id: string) => {
    const photo = data.photos.find(item => item.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.url);
    }
    onChange({ photos: data.photos.filter(item => item.id !== id) });
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= data.photos.length) return;
    const photos = [...data.photos];
    const [moved] = photos.splice(from, 1);
    photos.splice(to, 0, moved);
    onChange({ photos });
  };

  const photoLabel = data.photos.length === 1 ? copy.counterSingular : copy.counterPlural;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: styles.gray900, marginBottom: 6 }}>{copy.title}</h2>
      <p style={{ color: styles.gray600, fontSize: 14, marginBottom: 20 }}>{copy.description}</p>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={event => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={event => {
          event.preventDefault();
          setDragOver(false);
          handleFiles(event.dataTransfer.files);
        }}
        style={{
          border: `2px dashed ${dragOver ? styles.orange : styles.gray300}`,
          borderRadius: 10,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? styles.orangeLight : styles.gray50,
          transition: "all 0.15s",
          marginBottom: 20,
          width: "100%",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden>
          📷
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: styles.gray900, marginBottom: 6 }}>{copy.dropTitle}</div>
        <div style={{ fontSize: 13, color: styles.gray600, marginBottom: 16 }}>{copy.dropSubtitle}</div>
        <span
          style={{
            background: styles.orange,
            color: styles.white,
            borderRadius: 6,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 700,
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto",
          }}
        >
          {copy.dropButton}
        </span>
        <div style={{ fontSize: 11, color: styles.gray400, marginTop: 10 }}>{copy.dropNote}</div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={event => handleFiles(event.target.files)}
        />
      </button>

      {data.photos.length > 0 && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
            }}
          >
            {data.photos.map((photo, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={photo.id}
                  style={{
                    position: "relative",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: `2px solid ${isCover ? styles.orange : styles.gray200}`,
                    background: styles.white,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {photo.uploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        color: styles.white,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Téléversement...
                    </div>
                  )}
                  {photo.uploadError && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        color: styles.white,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 12,
                        textAlign: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 12, lineHeight: 1.4 }}>{photo.uploadError}</span>
                      <button
                        type="button"
                        onClick={() => onRetryUpload(photo.id)}
                        style={{
                          border: "none",
                          borderRadius: 999,
                          padding: "6px 14px",
                          background: styles.orange,
                          color: styles.white,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                  {isCover && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.65)",
                        color: styles.white,
                        fontSize: 12,
                        padding: "6px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{copy.primaryBadge}</span>
                      <span>{photoLabel}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      background: "rgba(0,0,0,0.65)",
                      color: styles.white,
                      border: "none",
                      borderRadius: "999px",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      aria-label={copy.reorderLabel}
                      onClick={() => movePhoto(index, index - 1)}
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        background: "rgba(0,0,0,0.55)",
                        color: styles.white,
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      {copy.reorderLabel}
                    </button>
                  )}
                </div>
              );
            })}
            {data.photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  borderRadius: 8,
                  border: `2px dashed ${styles.gray200}`,
                  aspectRatio: "4 / 3",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: styles.gray50,
                  color: styles.gray600,
                  fontSize: 13,
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 26 }}>＋</span>
                <span>{copy.addTileLabel}</span>
              </button>
            )}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: styles.gray600 }}>
            {`${data.photos.length} / ${MAX_PHOTOS} ${photoLabel}`}
          </div>
        </div>
      )}
    </div>
  );
};

interface Step3DescriptionProps {
  data: FormData;
  copy: PostAdContent['step3'];
  conditions: PostAdContent['conditions'];
  onChange: (_updates: Partial<FormData>) => void;
}

const Step3Description = ({ data, copy, conditions, onChange }: Step3DescriptionProps) => {
  const titleLen = data.title.length;
  const descLen = data.description.length;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: styles.gray900, marginBottom: 6 }}>{copy.title}</h2>
      <p style={{ color: styles.gray600, fontSize: 14, marginBottom: 24 }}>{copy.description}</p>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 700,
            color: styles.gray900,
            marginBottom: 6,
          }}
        >
          {copy.titleLabel} <span style={{ color: styles.red }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={data.title}
            onChange={event => onChange({ title: event.target.value })}
            maxLength={100}
            placeholder={copy.titlePlaceholder}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: `1px solid ${titleLen === 0 ? styles.gray200 : styles.gray400}`,
              borderRadius: 6,
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "border 0.15s",
            }}
            onFocus={event => (event.target.style.borderColor = styles.orange)}
            onBlur={event => (event.target.style.borderColor = styles.gray400)}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 12,
            color: titleLen < 5 && titleLen > 0 ? styles.red : styles.gray400,
          }}
        >
          <span>{titleLen < 5 && titleLen > 0 ? copy.titleTooShort : ""}</span>
          <span>{titleLen}/100</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 700,
            color: styles.gray900,
            marginBottom: 10,
          }}
        >
          {copy.conditionLabel} <span style={{ color: styles.red }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {conditions.map(condition => {
            const selected = data.condition === condition.id;
            return (
              <button
                key={condition.id}
                type="button"
                onClick={() => onChange({ condition: condition.id })}
                style={{
                  padding: "8px 16px",
                  border: `2px solid ${selected ? styles.orange : styles.gray200}`,
                  borderRadius: 20,
                  background: selected ? styles.orangeLight : styles.white,
                  color: selected ? styles.orange : styles.gray900,
                  fontWeight: selected ? 700 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {condition.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 700,
            color: styles.gray900,
            marginBottom: 6,
          }}
        >
          {copy.descriptionLabel} <span style={{ color: styles.red }}>*</span>
        </label>
        <textarea
          value={data.description}
          onChange={event => onChange({ description: event.target.value })}
          maxLength={4000}
          rows={7}
          placeholder={copy.descriptionPlaceholder}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: `1px solid ${styles.gray200}`,
            borderRadius: 6,
            fontSize: 14,
            resize: "vertical",
            fontFamily: "inherit",
            lineHeight: 1.6,
            outline: "none",
            boxSizing: "border-box",
            transition: "border 0.15s",
          }}
          onFocus={event => (event.target.style.borderColor = styles.orange)}
          onBlur={event => (event.target.style.borderColor = styles.gray200)}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 12,
            color: descLen > 0 && descLen < 30 ? styles.red : styles.gray400,
          }}
        >
          <span>
            {descLen > 0 && descLen < 30 ? copy.descriptionTooShort : copy.descriptionHelper}
          </span>
          <span>{descLen}/4000</span>
        </div>
      </div>

      <div
        style={{
          background: styles.blueLight,
          border: `1px solid #AED6F1`,
          borderRadius: 8,
          padding: "14px 16px",
          fontSize: 13,
          color: styles.blue,
        }}
      >
        <strong>{copy.tipsTitle}</strong>
        <ul style={{ margin: "8px 0 0 0", paddingLeft: 18, lineHeight: 1.8 }}>
          {copy.tips.map(tip => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

interface Step4PriceLocationProps {
  data: FormData;
  copy: PostAdContent["step4"];
  summary: PostAdContent["summary"];
  countries: CountryOption[];
  regionOptions: string[];
  cityOptions: string[];
  citiesLoading: boolean;
  currencyOptions: string[];
  phonePrefix: string;
  metadataError: string | null;
  onChange: (_updates: Partial<FormData>) => void;
  onSelectCountry: (_code: string) => void;
  onSelectRegion: (_value: string) => void;
  onSelectCity: (_value: string) => void;
  onSelectPromotion: (_tier: PromotionType) => void;
  priceLocale: string;
}

const Step4PriceLocation = ({
  data,
  copy,
  summary,
  onChange,
  countries,
  regionOptions,
  cityOptions,
  citiesLoading,
  currencyOptions,
  phonePrefix,
  metadataError,
  onSelectCountry,
  onSelectRegion,
  onSelectCity,
  onSelectPromotion,
  priceLocale,
}: Step4PriceLocationProps) => {
  const priceValue = data.price ? Number(data.price) : null;
  const currentCountry = countries.find(country => country.code === data.country) ?? null;
  const locationParts = [data.city, data.region, currentCountry?.label ?? data.country].filter(Boolean);
  const promotionDetails = copy.promotionOptions.find(option => option.id === data.promotionType);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: styles.gray900, marginBottom: 6 }}>{copy.title}</h2>
      <p style={{ color: styles.gray600, fontSize: 14, marginBottom: 24 }}>{copy.description}</p>

      <div
        style={{
          border: `1px solid ${styles.gray200}`,
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: styles.gray900, marginBottom: 16 }}>{copy.priceSection}</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              min="0"
              value={data.price}
              placeholder={copy.pricePlaceholder}
              onChange={event => onChange({ price: event.target.value })}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `1px solid ${styles.gray200}`,
                borderRadius: 6,
                fontSize: 18,
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={event => (event.target.style.borderColor = styles.orange)}
              onBlur={event => (event.target.style.borderColor = styles.gray200)}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: styles.gray600,
                marginBottom: 4,
              }}
            >
              {copy.currencyLabel}
            </label>
            <select
              value={data.currency}
              onChange={event => onChange({ currency: event.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${styles.gray200}`,
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
            }}
            >
              {currencyOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <button
            type="button"
            onClick={() => onChange({ negotiable: !data.negotiable })}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: data.negotiable ? styles.orange : styles.gray200,
              position: "relative",
              cursor: "pointer",
              border: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: data.negotiable ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: styles.white,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
          <span style={{ fontSize: 14, color: styles.gray900 }}>{copy.negotiableLabel}</span>
        </label>

        {(!data.price || data.price === "0") && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: styles.greenLight,
              border: `1px solid #A9DFBF`,
              borderRadius: 6,
              fontSize: 13,
              color: styles.green,
              fontWeight: 600,
            }}
          >
            {copy.freeTag}
          </div>
        )}
      </div>

      <div
        style={{
          border: `1px solid ${styles.gray200}`,
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: styles.gray900, marginBottom: 16 }}>{copy.locationSection}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: styles.gray600, marginBottom: 5 }}>
              {copy.countryLabel} <span style={{ color: styles.red }}>*</span>
            </label>
            <select
              value={data.country}
              onChange={event => onSelectCountry(event.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                border: `1px solid ${styles.gray200}`,
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
              }}
            >
              <option value="">{copy.countryPlaceholder}</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: styles.gray600, marginBottom: 5 }}>
              {copy.regionLabel} <span style={{ color: styles.red }}>*</span>
            </label>
            <select
              value={data.region}
              onChange={event => onSelectRegion(event.target.value)}
              disabled={!data.country}
              style={{
                width: "100%",
                padding: "11px 14px",
                border: `1px solid ${styles.gray200}`,
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
              }}
            >
              <option value="">{copy.regionPlaceholder}</option>
              {regionOptions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: styles.gray600, marginBottom: 5 }}>
              {copy.cityLabel} <span style={{ color: styles.red }}>*</span>
            </label>
            {cityOptions.length > 0 ? (
              <select
                value={data.city}
                onChange={event => onSelectCity(event.target.value)}
                disabled={!data.country || citiesLoading}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: `1px solid ${styles.gray200}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                <option value="">{copy.cityPlaceholder}</option>
                {cityOptions.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={data.city}
                onChange={event => onChange({ city: event.target.value })}
                disabled={!data.country}
                placeholder={copy.cityPlaceholder}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: `1px solid ${styles.gray200}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            )}
            {citiesLoading && (
              <div style={{ fontSize: 12, color: styles.gray600, marginTop: 4 }}>Chargement des villes…</div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: styles.gray600, marginBottom: 5 }}>
              {copy.zipLabel} <span style={{ color: styles.red }}>*</span>
            </label>
            <input
              type="text"
              value={data.zipCode}
              onChange={event => onChange({ zipCode: event.target.value })}
              placeholder={copy.zipPlaceholder}
              maxLength={16}
              style={{
                width: "100%",
                padding: "11px 14px",
                border: `1px solid ${styles.gray200}`,
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
        {metadataError && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: styles.redLight, borderRadius: 6, color: styles.red, fontSize: 12 }}>
            {metadataError}
          </div>
        )}
      </div>

      <div
        style={{
          border: `1px solid ${styles.gray200}`,
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: styles.gray900, marginBottom: 12 }}>{copy.contactSection}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: styles.gray600, marginBottom: 5 }}>
              {copy.emailLabel} <span style={{ color: styles.red }}>*</span>
            </label>
            <input
              type="email"
              value={data.contactEmail}
              onChange={event => onChange({ contactEmail: event.target.value })}
              placeholder={copy.emailPlaceholder}
              style={{
                width: "100%",
                padding: "11px 14px",
                border: `1px solid ${styles.gray200}`,
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: styles.gray600, marginBottom: 5 }}>{copy.phoneSection}</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: styles.gray600,
                  fontWeight: 600,
                }}
              >
                {phonePrefix}
              </span>
              <input
                type="tel"
                value={data.phone}
                onChange={event => onChange({ phone: event.target.value })}
                placeholder={copy.phonePlaceholder}
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 70px",
                  border: `1px solid ${styles.gray200}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: styles.gray500, marginTop: 4 }}>{copy.phoneDescription}</p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: styles.gray600, marginBottom: 5 }}>{copy.whatsappLabel}</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: styles.gray600,
                  fontWeight: 600,
                }}
              >
                {phonePrefix}
              </span>
              <input
                type="tel"
                value={data.whatsapp}
                onChange={event => onChange({ whatsapp: event.target.value })}
                placeholder={copy.whatsappPlaceholder}
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 70px",
                  border: `1px solid ${styles.gray200}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${styles.gray200}`,
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: styles.gray900, marginBottom: 12 }}>{copy.promotionSection}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {copy.promotionOptions.map(option => {
            const active = option.id === data.promotionType;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectPromotion(option.id)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 10,
                  border: `2px solid ${active ? styles.orange : styles.gray200}`,
                  background: active ? styles.orangeLight : styles.white,
                  cursor: "pointer",
                  transition: "border 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <strong style={{ color: active ? styles.orange : styles.gray900 }}>{option.title}</strong>
                  <span style={{ fontSize: 12, fontWeight: 700, color: active ? styles.orange : styles.gray600 }}>{option.badge}</span>
                </div>
                <p style={{ fontSize: 13, color: styles.gray600, lineHeight: 1.4 }}>{option.description}</p>
              </button>
            );
          })}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: styles.gray500 }}>{copy.promotionDisclaimer}</p>
      </div>

      {data.title && (
        <div
          style={{
            border: `2px solid ${styles.orange}`,
            borderRadius: 10,
            padding: 16,
            background: styles.orangeLight,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: styles.orange, marginBottom: 10 }}>{summary.title}</div>
          <div style={{ display: "flex", gap: 12 }}>
            {data.photos[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photos[0].url}
                alt=""
                style={{ width: 72, height: 54, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
              />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: styles.gray900 }}>{data.title}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: styles.orange, marginTop: 4 }}>
                {priceValue !== null && !Number.isNaN(priceValue)
                  ? `${priceValue.toLocaleString(priceLocale)} ${data.currency || copy.currencySuffix}`
                  : summary.freeLabel}
                {data.negotiable && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: styles.gray600, marginLeft: 6 }}>
                    {summary.negotiableLabel}
                  </span>
                )}
              </div>
              {locationParts.length > 0 && (
                <div style={{ fontSize: 12, color: styles.gray600, marginTop: 4 }}>
                  {summary.locationPrefix} {locationParts.join(" · ")} {data.zipCode && `(${data.zipCode})`}
                </div>
              )}
              {data.contactEmail && (
                <div style={{ fontSize: 12, color: styles.gray600, marginTop: 4 }}>✉️ {data.contactEmail}</div>
              )}
              {promotionDetails && (
                <div style={{ fontSize: 12, color: styles.gray600, marginTop: 4 }}>⭐ {promotionDetails.title}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SuccessScreenProps {
  data: FormData;
  listing: CreatedListing | null;
  copy: PostAdContent["success"];
  onPrimary: () => void;
  onSecondary: () => void;
}

const SuccessScreen = ({ data, listing, copy, onPrimary, onSecondary }: SuccessScreenProps) => {
  const displayedTitle = listing?.title || data.title || "";
  const statusLabel = listing?.status ?? "pending";
  const promoLabel = (listing?.promotion_type ?? data.promotionType).toUpperCase();
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: styles.greenLight,
          border: `2px solid ${styles.green}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          margin: "0 auto 20px",
        }}
      >
        ✓
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: styles.gray900, marginBottom: 10 }}>{copy.title}</h2>
      <p style={{ fontSize: 15, color: styles.gray600, marginBottom: 16 }}>
        {formatTemplate(copy.description, { title: displayedTitle })}
      </p>
      {listing && (
        <p style={{ fontSize: 13, color: styles.gray500, marginBottom: 28 }}>
          Statut actuel : <strong>{statusLabel}</strong> · Option {promoLabel}
        </p>
      )}
      <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={onPrimary}
          style={{
            background: styles.orange,
            color: styles.white,
            border: "none",
            borderRadius: 6,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copy.primaryCta}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          style={{
            background: styles.white,
            color: styles.orange,
            border: `2px solid ${styles.orange}`,
            borderRadius: 6,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copy.secondaryCta}
        </button>
      </div>
    </div>
  );
};

const localeForLanguage = (language: string): string => {
  if (language === "fr") return "fr-FR";
  if (language === "ar") return "ar-MA";
  return "en-US";
};

export default function PostAdPage() {
  const router = useRouter();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const content = useMemo(() => getPostAdContent(language), [language]);
  const { navbar, steps, step1, step2, step3, step4, summary, success, buttons, errors, validations, categories, conditions } = content;
  const wallCopy = authWallCopy[language] ?? authWallCopy.en;
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<CreatedListing | null>(null);
  const isAuthenticated = Boolean(user);
  const priceLocale = useMemo(() => localeForLanguage(language), [language]);
  const selectedCountry = useMemo(() => countries.find(country => country.code === data.country) ?? null, [countries, data.country]);
  const regionOptions = selectedCountry?.regions ?? [];
  const phonePrefix = useMemo(() => COUNTRY_PHONE_PREFIX[data.country] ?? DEFAULT_PHONE_PREFIX, [data.country]);

  const update = useCallback((updates: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setFormErrors([]);
    setSubmitError(null);
  }, []);

  const startPhotoUpload = useCallback(async (photo: Photo) => {
    setData(prev => ({
      ...prev,
      photos: prev.photos.map(item =>
        item.id === photo.id
          ? { ...item, uploading: true, uploadError: null }
          : item
      ),
    }));
    try {
      const uploaded = await uploadListingImage(photo.file);
      setData(prev => ({
        ...prev,
        photos: prev.photos.map(item =>
          item.id === photo.id
            ? { ...item, uploading: false, upload: uploaded, uploadError: null }
            : item
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec du téléversement.';
      setData(prev => ({
        ...prev,
        photos: prev.photos.map(item =>
          item.id === photo.id
            ? { ...item, uploading: false, uploadError: message }
            : item
        ),
      }));
    }
  }, [setData]);

  const retryPhotoUpload = useCallback(
    (photoId: string) => {
      const photo = data.photos.find(item => item.id === photoId);
      if (photo) {
        startPhotoUpload(photo);
      }
    },
    [data.photos, startPhotoUpload]
  );

  useEffect(() => {
    let cancelled = false;
    apiFetch<CountryOption[]>("meta/regions/")
      .then(response => {
        if (cancelled) return;
        setCountries(response);
        setMetadataError(null);
      })
      .catch(err => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Impossible de charger les régions.";
        setMetadataError(message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!data.country) {
      setCities([]);
      return;
    }
    let cancelled = false;
    setCitiesLoading(true);
    apiFetch<CitiesResponse>(`meta/cities/?country=${data.country}`)
      .then(response => {
        if (cancelled) return;
        setCities(response.cities ?? []);
      })
      .catch(err => {
        console.warn("Unable to fetch cities", err);
        if (cancelled) return;
        setCities([]);
        setMetadataError(prev => prev ?? "Impossible de charger les villes.");
      })
      .finally(() => {
        if (cancelled) return;
        setCitiesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data.country]);

  useEffect(() => {
    if (!user) return;
    setData(prev => {
      const updates: Partial<FormData> = {};
      if (!prev.contactEmail && user.email) updates.contactEmail = user.email;
      if (!prev.country && user.country) updates.country = user.country;
      if (!prev.city && user.city) updates.city = user.city;
      return Object.keys(updates).length ? { ...prev, ...updates } : prev;
    });
  }, [user]);

  useEffect(() => {
    if (!data.country) return;
    const nextCurrency = COUNTRY_CURRENCY[data.country] ?? DEFAULT_CURRENCY;
    setData(prev => (prev.currency === nextCurrency ? prev : { ...prev, currency: nextCurrency }));
  }, [data.country]);

  useEffect(() => {
    data.photos.forEach(photo => {
      if (!photo.upload && !photo.uploading && !photo.uploadError) {
        void startPhotoUpload(photo);
      }
    });
  }, [data.photos, startPhotoUpload]);

  const buildPayload = useCallback(async (): Promise<ListingPayload> => {
    const images = data.photos.map((photo, index) => ({
      image_url: photo.upload?.url ?? photo.url,
      is_primary: index === 0,
      order: index,
    }));
    const coverReference =
      data.photos[0]?.upload?.path ??
      data.photos[0]?.upload?.relative_url ??
      data.photos[0]?.upload?.url ??
      '';
    return {
      title: data.title.trim(),
      description: data.description.trim(),
      price: data.price ? data.price.replace(",", ".") : "0",
      currency: data.currency,
      category: data.categoryId,
      sub_category: data.subcategoryId,
      country: data.country,
      region: data.region,
      city: data.city,
      zip_code: data.zipCode.trim(),
      condition: data.condition,
      negotiable: data.negotiable,
      contact_email: data.contactEmail.trim(),
      contact_phone: formatPhoneNumber(data.phone, data.country),
      whatsapp: formatPhoneNumber(data.whatsapp, data.country),
      promotion_type: data.promotionType,
      tags: [],
      attributes: {},
      images,
      cover_image: coverReference,
    };
  }, [data]);

  const tryPublish = useCallback(async (slug: string): Promise<string> => {
    try {
      const published = await postJson<Record<string, unknown>>(`listings/${slug}/publish/`, {});
      return typeof published.status === "string" ? published.status : "published";
    } catch {
      return "pending";
    }
  }, []);

  const submitListing = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setFormErrors([]);
    const pendingUploads = data.photos.filter(photo => photo.uploading || (!photo.upload && !photo.uploadError));
    const failedUploads = data.photos.filter(photo => photo.uploadError);
    if (pendingUploads.length > 0) {
      setFormErrors(['Patientez pendant le téléversement de vos photos avant de publier.']);
      setSubmitting(false);
      return;
    }
    if (failedUploads.length > 0) {
      const failedName = failedUploads[0].file.name;
      setFormErrors([`Le téléversement de "${failedName}" a échoué. Réessayez.`]);
      setSubmitting(false);
      return;
    }
    try {
      const payload = await buildPayload();
      const response = await postJson<Record<string, unknown>>("listings/", payload);
      const normalized: CreatedListing = {
        id: typeof response.id === "number" ? response.id : undefined,
        slug: typeof response.slug === "string" ? response.slug : undefined,
        title: typeof response.title === "string" ? response.title : data.title,
        status: typeof response.status === "string" ? response.status : "pending",
        promotion_type:
          typeof response.promotion_type === "string"
            ? (response.promotion_type as PromotionType)
            : data.promotionType,
      };
      if (normalized.slug && normalized.status === "pending") {
        normalized.status = await tryPublish(normalized.slug);
      }
      setCreatedListing(normalized);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de publier l'annonce.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }, [buildPayload, data.photos, data.promotionType, data.title, submitting, tryPublish]);

  const {
    categoryRequired,
    subcategoryRequired,
    photoRequired,
    titleMin,
    conditionRequired,
    descriptionMin,
    countryRequired,
    regionRequired,
    cityRequired,
    zipRequired,
    emailRequired,
  } = validations;

  const validateStepOne = useCallback((): string[] => {
    const issues: string[] = [];
    if (!data.categoryId) issues.push(categoryRequired);
    if (!data.subcategoryId) issues.push(subcategoryRequired);
    return issues;
  }, [categoryRequired, data.categoryId, data.subcategoryId, subcategoryRequired]);

  const validateStepTwo = useCallback((): string[] => {
    if (data.photos.length === 0) {
      return [photoRequired];
    }
    return [];
  }, [data.photos.length, photoRequired]);

  const validateStepThree = useCallback((): string[] => {
    const issues: string[] = [];
    if (data.title.length < 5) issues.push(titleMin);
    if (!data.condition) issues.push(conditionRequired);
    if (data.description.length < 30) issues.push(descriptionMin);
    return issues;
  }, [conditionRequired, data.condition, data.description.length, data.title.length, descriptionMin, titleMin]);

  const validateStepFour = useCallback((): string[] => {
    const issues: string[] = [];
    if (!data.country) issues.push(countryRequired);
    if (!data.region) issues.push(regionRequired);
    if (!data.city) issues.push(cityRequired);
    if (!data.zipCode || data.zipCode.length < 4) issues.push(zipRequired);
    if (!data.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      issues.push(emailRequired);
    }
    return issues;
  }, [cityRequired, countryRequired, data.city, data.contactEmail, data.country, data.region, data.zipCode, emailRequired, regionRequired, zipRequired]);

  const validate = useCallback((): string[] => {
    switch (step) {
      case 1:
        return validateStepOne();
      case 2:
        return validateStepTwo();
      case 3:
        return validateStepThree();
      case 4:
        return validateStepFour();
      default:
        return [];
    }
  }, [step, validateStepFour, validateStepOne, validateStepThree, validateStepTwo]);

  const goNext = () => {
    if (submitting) return;
    const issues = validate();
    if (issues.length > 0) {
      setFormErrors(issues);
      return;
    }
    setFormErrors([]);
    if (step < 4) {
      setStep(prev => (prev + 1) as Step);
      return;
    }
    submitListing();
  };

  const goPrev = () => {
    if (step > 1) {
      setStep(prev => (prev - 1) as Step);
      setFormErrors([]);
    }
  };

  const handleSelectCountry = useCallback(
    (code: string) => {
      setData(prev => {
        if (!code) {
          return { ...prev, country: "", region: "", city: "", currency: DEFAULT_CURRENCY };
        }
        return { ...prev, country: code, region: "", city: "" };
      });
      if (!code) {
        setCities([]);
      }
    },
    []
  );

  const handleSelectRegion = useCallback((value: string) => {
    setData(prev => ({ ...prev, region: value, city: "" }));
  }, []);

  const handleSelectCity = useCallback((value: string) => {
    setData(prev => ({ ...prev, city: value }));
  }, []);

  const handleSelectPromotion = useCallback((tier: PromotionType) => {
    setData(prev => ({ ...prev, promotionType: tier }));
  }, []);

  const skipPhotos = () => {
    setStep(3);
    setFormErrors([]);
    setSubmitError(null);
  };

  const handleCancel = () => {
    router.push("/");
  };

  const handleSuccessPrimary = () => {
    if (createdListing?.slug) {
      router.push(`/listings/${createdListing.slug}`);
      return;
    }
    router.push("/search");
  };

  const handleSuccessSecondary = () => {
    setData(initialData);
    setStep(1);
    setSubmitted(false);
    setFormErrors([]);
    setCreatedListing(null);
    setSubmitError(null);
    setCities([]);
  };

  const directionArrow = language === "ar" ? " ←" : " →";
  const primaryButtonLabel =
    step === 4 ? (submitting ? buttons.publishing : buttons.publish) : `${buttons.next}${directionArrow}`;

  return (
    <div
      className={`${nunito.className} ${isRTL ? "rtl" : ""}`}
      style={{
        minHeight: "100vh",
        background: styles.gray50,
        color: styles.gray900,
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      <Navbar content={navbar} onCancel={handleCancel} />
      {isAuthenticated && !submitted && <StepIndicator steps={steps} current={step} />}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 80px" }}>
        {(() => {
          if (!isAuthenticated) {
            return (
              <div
                style={{
                  background: styles.white,
                  borderRadius: 12,
                  border: `1px solid ${styles.gray200}`,
                  padding: 32,
                  textAlign: "center",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 800, color: styles.gray900, marginBottom: 12 }}>{wallCopy.title}</h2>
                <p style={{ fontSize: 15, color: styles.gray600, marginBottom: 24 }}>{wallCopy.description}</p>
                <Link
                  href="/auth/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 28px",
                    borderRadius: 999,
                    background: styles.orange,
                    color: styles.white,
                    fontWeight: 700,
                    textDecoration: "none",
                    fontSize: 15,
                  }}
                >
                  {wallCopy.cta}
                </Link>
              </div>
            );
          }
          if (submitted) {
            return (
              <SuccessScreen
                data={data}
                listing={createdListing}
                copy={success}
                onPrimary={handleSuccessPrimary}
                onSecondary={handleSuccessSecondary}
              />
            );
          }
          return (
          <div
            style={{
              background: styles.white,
              borderRadius: 10,
              border: `1px solid ${styles.gray200}`,
              padding: 28,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            {step === 1 && <Step1Category data={data} categories={categories} copy={step1} onChange={update} />}
            {step === 2 && <Step2Photos data={data} copy={step2} onChange={update} onRetryUpload={retryPhotoUpload} />}
            {step === 3 && (
              <Step3Description data={data} copy={step3} conditions={conditions} onChange={update} />
            )}
            {step === 4 && (
              <Step4PriceLocation
                data={data}
                copy={step4}
                summary={summary}
                onChange={update}
                countries={countries}
                regionOptions={regionOptions}
                cityOptions={cities}
                citiesLoading={citiesLoading}
                currencyOptions={CURRENCY_OPTIONS}
                phonePrefix={phonePrefix}
                metadataError={metadataError}
                onSelectCountry={handleSelectCountry}
                onSelectRegion={handleSelectRegion}
                onSelectCity={handleSelectCity}
                onSelectPromotion={handleSelectPromotion}
                priceLocale={priceLocale}
              />
            )}

            {formErrors.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  padding: "12px 16px",
                  background: styles.redLight,
                  border: `1px solid #F1948A`,
                  borderRadius: 6,
                  fontSize: 13,
                  color: styles.red,
                }}
              >
                <strong>{errors.heading}</strong>
                <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                  {formErrors.map(issue => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {submitError && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: styles.orangeLight,
                  border: `1px solid ${styles.orange}`,
                  borderRadius: 6,
                  color: styles.orange,
                  fontSize: 13,
                }}
              >
                {submitError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 28,
                paddingTop: 20,
                borderTop: `1px solid ${styles.gray100}`,
              }}
            >
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    style={{
                      background: "none",
                      border: `1px solid ${styles.gray200}`,
                      borderRadius: 6,
                      padding: "11px 20px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: styles.gray900,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {buttons.back}
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {step === 2 && data.photos.length === 0 && (
                  <button
                    type="button"
                    onClick={skipPhotos}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: styles.gray600,
                      textDecoration: "underline",
                      padding: "0 4px",
                    }}
                  >
                    {buttons.skip}
                  </button>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={step === 4 && submitting}
                  style={{
                    background: styles.orange,
                    color: styles.white,
                    border: "none",
                    borderRadius: 6,
                    padding: "12px 28px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: step === 4 && submitting ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: `0 2px 8px rgba(232, 92, 13, 0.35)`,
                    opacity: step === 4 && submitting ? 0.7 : 1,
                  }}
                  onMouseEnter={event => {
                    if (step === 4 && submitting) return;
                    event.currentTarget.style.background = styles.orangeDark;
                  }}
                  onMouseLeave={event => {
                    if (step === 4 && submitting) return;
                    event.currentTarget.style.background = styles.orange;
                  }}
                >
                  {primaryButtonLabel}
                </button>
              </div>
            </div>
          </div>
          );
        })()}
      </main>
    </div>
  );
}
