'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCookieConsentEventName, hasCookieConsent } from '../lib/cookie-consent';

const SESSION_KEY = 'alwaha-analytics-session-v1';
let memorySessionId: string | null = null;

function createSessionUuid(): string {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

type AnalyticsPayload = {
  session_id: string;
  event_name: 'page_view' | 'page_exit';
  page_path: string;
  page_title: string;
  referrer: string | null;
  duration_ms: number | null;
  consent_granted: true;
  consent_version: 2;
  client_data: {
    language: string | null;
    timezone: string | null;
    screen_width: number | null;
    screen_height: number | null;
    viewport_width: number | null;
    viewport_height: number | null;
  };
};

function getSessionId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = window.crypto?.randomUUID?.() ?? createSessionUuid();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    memorySessionId ??= window.crypto?.randomUUID?.() ?? createSessionUuid();
    return memorySessionId;
  }
}

function cleanReferrer(): string | null {
  try {
    if (!document.referrer) return null;
    const url = new URL(document.referrer);
    return `${url.origin}${url.pathname}`.slice(0, 400);
  } catch {
    return null;
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const update = () => {
      const permitted = hasCookieConsent('analytics');
      setAllowed(permitted);
      if (!permitted) {
        try {
          window.sessionStorage.removeItem(SESSION_KEY);
        } catch {
          // Session storage can be disabled by the browser.
        }
        memorySessionId = null;
      }
    };
    update();
    const eventName = getCookieConsentEventName();
    window.addEventListener(eventName, update);
    return () => window.removeEventListener(eventName, update);
  }, []);

  useEffect(() => {
    if (!allowed || !pathname) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    const sessionId = getSessionId();
    if (!sessionId) return;

    const clientData: AnalyticsPayload['client_data'] = {
      language: navigator.language?.slice(0, 32) ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 64) ?? null,
      screen_width: Number.isFinite(screen.width) ? screen.width : null,
      screen_height: Number.isFinite(screen.height) ? screen.height : null,
      viewport_width: Number.isFinite(window.innerWidth) ? window.innerWidth : null,
      viewport_height: Number.isFinite(window.innerHeight) ? window.innerHeight : null,
    };
    const startedAt = Date.now();
    let exitSent = false;

    const send = (eventName: AnalyticsPayload['event_name'], duration: number | null) => {
      if (!hasCookieConsent('analytics')) return;
      const payload: AnalyticsPayload = {
        session_id: sessionId,
        event_name: eventName,
        page_path: pathname.split(/[?#]/, 1)[0]?.slice(0, 300) || '/',
        page_title: document.title.slice(0, 180),
        referrer: cleanReferrer(),
        duration_ms: duration,
        consent_granted: true,
        consent_version: 2,
        client_data: clientData,
      };
      void fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: eventName === 'page_exit',
        cache: 'no-store',
      }).catch(() => undefined);
    };

    const sendExit = () => {
      if (exitSent) return;
      exitSent = true;
      send('page_exit', Math.min(Date.now() - startedAt, 24 * 60 * 60 * 1000));
    };

    send('page_view', null);
    window.addEventListener('pagehide', sendExit);
    return () => {
      window.removeEventListener('pagehide', sendExit);
      sendExit();
    };
  }, [allowed, pathname]);

  return null;
}
