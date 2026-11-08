export type CookiePreferences = {
  version: 2;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export type OptionalCookiePreferences = Pick<
  CookiePreferences,
  'preferences' | 'analytics' | 'marketing'
>;
export type CookieCategory = keyof Pick<
  CookiePreferences,
  'necessary' | 'preferences' | 'analytics' | 'marketing'
>;

const COOKIE_NAME = 'alwaha_cookie_consent';
const STORAGE_KEY = 'alwaha-cookie-consent-v2';
const LEGACY_STORAGE_KEY = 'alwaha-cookie-consent-v1';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
const CONSENT_EVENT = 'alwaha:cookie-preferences-updated';

function isCookiePreferences(value: unknown): value is CookiePreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CookiePreferences>;
  return (
    candidate.version === 2 &&
    candidate.necessary === true &&
    typeof candidate.preferences === 'boolean' &&
    typeof candidate.analytics === 'boolean' &&
    typeof candidate.marketing === 'boolean' &&
    typeof candidate.updatedAt === 'string'
  );
}

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (entry) {
    try {
      const parsed: unknown = JSON.parse(decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)));
      if (isCookiePreferences(parsed)) return parsed;
    } catch {
      // Try the same-device fallback when the cookie is malformed or unavailable.
    }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }
    const parsed: unknown = JSON.parse(stored);
    if (!isCookiePreferences(parsed)) return null;
    const savedAt = new Date(parsed.updatedAt).getTime();
    if (!Number.isFinite(savedAt) || Date.now() - savedAt >= MAX_AGE_SECONDS * 1000) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCookiePreferences(preferences: OptionalCookiePreferences): CookiePreferences {
  const value: CookiePreferences = {
    version: 2,
    necessary: true,
    preferences: preferences.preferences,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    updatedAt: new Date().toISOString(),
  };
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  try {
    const cookieSaved = document.cookie
      .split(';')
      .some((part) => part.trim().startsWith(`${COOKIE_NAME}=`));
    if (cookieSaved) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Consent remains available in the cookie when localStorage is disabled.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return value;
}

export function hasCookieConsent(category: CookieCategory): boolean {
  if (category === 'necessary') return true;
  const preferences = readCookiePreferences();
  if (!preferences) return false;
  return preferences[category];
}

export function getCookieConsentEventName() {
  return CONSENT_EVENT;
}
