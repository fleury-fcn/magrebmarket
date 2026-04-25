const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/";
const CSRF_COOKIE_NAME = "csrftoken";
const CSRF_HEADER_NAME = "X-CSRFToken";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let cachedCsrfToken: string | null = null;
let pendingCsrfFetch: Promise<void> | null = null;

const isBrowser = typeof document !== "undefined";

const normalizeHeaders = (input?: any): Record<string, string> => {
  if (!input) return {};
  if (input instanceof Headers) {
    const fromHeaders: Record<string, string> = {};
    input.forEach((value, key) => {
      fromHeaders[key] = value;
    });
    return fromHeaders;
  }
  if (Array.isArray(input)) {
    return input.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }
  return { ...input };
};

const readCookie = (name: string): string | null => {
  if (!isBrowser) return null;
  const regex = new RegExp(`(?:^|; )${name}=([^;]*)`);
  const match = regex.exec(document.cookie);
  return match ? decodeURIComponent(match[1]) : null;
};

const refreshCsrfFromCookie = (): string | null => {
  cachedCsrfToken = readCookie(CSRF_COOKIE_NAME);
  return cachedCsrfToken;
};

const fetchCsrfToken = async (): Promise<void> => {
  if (!isBrowser) return;
  if (pendingCsrfFetch) {
    await pendingCsrfFetch;
    return;
  }
  pendingCsrfFetch = fetch(new URL("auth/csrf/", API_BASE), {
    credentials: "include",
  })
    .then(() => {
      refreshCsrfFromCookie();
    })
    .catch(() => {
      cachedCsrfToken = null;
    })
    .finally(() => {
      pendingCsrfFetch = null;
    });
  await pendingCsrfFetch;
};

const ensureCsrfToken = async (): Promise<string | null> => {
  if (!isBrowser) return null;
  if (refreshCsrfFromCookie()) return cachedCsrfToken;
  await fetchCsrfToken();
  return cachedCsrfToken;
};

const normalizeToText = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (Array.isArray(value)) {
    const joined = value.map(entry => String(entry).trim()).filter(Boolean).join(" ").trim();
    return joined || null;
  }
  return null;
};

const extractErrorMessage = (body: unknown): string | null => {
  if (!body) return null;
  const direct = normalizeToText(body);
  if (direct) return direct;

  if (typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    const preferredKeys = ["detail", "non_field_errors", ...Object.keys(record)];
    for (const key of preferredKeys) {
      if (!(key in record)) continue;
      const text = normalizeToText(record[key]);
      if (text) return text;
    }
  }

  return null;
};

const parseErrorBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (err) {
      console.warn("Unable to parse JSON error response", err);
      return null;
    }
  }
  return await response.text();
};

const buildError = (response: Response, body: unknown): Error => {
  const message = extractErrorMessage(body);
  let fallback = "";
  if (typeof body === "string") {
    fallback = body;
  } else if (body) {
    fallback = JSON.stringify(body);
  }
  return new Error(message || fallback || `Requête échouée (${response.status})`);
};

export async function apiFetch<T>(path: string, options: any = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...normalizeHeaders(options.headers),
  };

  const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (isFormDataBody) {
    delete headers["Content-Type"];
  }

  if (!SAFE_METHODS.has(method)) {
    const token = await ensureCsrfToken();
    if (token) {
      headers[CSRF_HEADER_NAME] = token;
    }
  }

  const response = await fetch(new URL(path, API_BASE), {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw buildError(response, errorBody);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
