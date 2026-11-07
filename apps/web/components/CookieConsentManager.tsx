'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CookieConsent.module.css';
import {
  readCookiePreferences,
  saveCookiePreferences,
  type CookiePreferences,
  type OptionalCookiePreferences,
} from '../lib/cookie-consent';

const defaultPreferences: OptionalCookiePreferences = {
  preferences: false,
  analytics: false,
  marketing: false,
};

type View = 'loading' | 'notice' | 'settings' | 'closed';
type Category = keyof OptionalCookiePreferences;

const categories: { key: Category; title: string; description: string }[] = [
  {
    key: 'preferences',
    title: 'Preferences cookies',
    description: 'Store optional interface choices when preference services are configured.',
  },
  {
    key: 'analytics',
    title: 'Analytics cookies',
    description: 'Help measure site usage when an analytics service is configured.',
  },
  {
    key: 'marketing',
    title: 'Marketing cookies',
    description:
      'Support campaign measurement or tailored advertising when those tools are configured.',
  },
];

function optionalChoices(value: CookiePreferences | null): OptionalCookiePreferences {
  return value
    ? {
        preferences: value.preferences,
        analytics: value.analytics,
        marketing: value.marketing,
      }
    : defaultPreferences;
}

export function CookieConsentManager() {
  const [view, setView] = useState<View>('loading');
  const [draft, setDraft] = useState<OptionalCookiePreferences>(defaultPreferences);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reopenButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = readCookiePreferences();
    setDraft(optionalChoices(stored));
    setView(stored ? 'closed' : 'notice');
  }, []);

  useEffect(() => {
    if (view !== 'settings') return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const containDialogFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setView('closed');
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);
      if (!first || !last) return;
      const activeIsInside = dialogRef.current?.contains(document.activeElement) ?? false;
      if (!activeIsInside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', containDialogFocus);
    return () => {
      window.removeEventListener('keydown', containDialogFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
      else reopenButtonRef.current?.focus();
    };
  }, [view]);

  function save(preferences: OptionalCookiePreferences) {
    saveCookiePreferences(preferences);
    setDraft(preferences);
    setView('closed');
  }

  function openSettings() {
    setDraft(optionalChoices(readCookiePreferences()));
    setView('settings');
  }

  function toggleCategory(category: Category) {
    setDraft((current) => ({ ...current, [category]: !current[category] }));
  }

  return (
    <>
      {view === 'notice' && (
        <div className={styles.noticePosition}>
          <section className={styles.notice} aria-labelledby="cookie-notice-title">
            <div className={styles.noticeCopy}>
              <span className={styles.eyebrow}>Your privacy choices</span>
              <h2 id="cookie-notice-title">Cookies on Al Waha Parts</h2>
              <p>
                Your cart and language preference stay in local browser storage. We save your cookie
                choice on this device. Optional analytics and marketing cookies are off by default.
              </p>
              <p className={styles.note}>No analytics or advertising tools are currently active.</p>
            </div>
            <div className={styles.noticeActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setView('closed')}
              >
                Not now
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => save(defaultPreferences)}
              >
                Necessary only
              </button>
              <button className={styles.textButton} type="button" onClick={openSettings}>
                Customise
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => save({ preferences: true, analytics: true, marketing: true })}
              >
                Accept all
              </button>
            </div>
          </section>
        </div>
      )}

      {view === 'settings' && (
        <div
          className={styles.backdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setView('closed');
          }}
        >
          <section
            className={styles.dialog}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            aria-describedby="cookie-settings-description"
          >
            <div className={styles.dialogHeader}>
              <div>
                <span className={styles.eyebrow}>Control your choices</span>
                <h2 id="cookie-settings-title">Cookie preferences</h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => setView('closed')}
                aria-label="Close cookie settings"
                ref={closeButtonRef}
              >
                ×
              </button>
            </div>
            <p id="cookie-settings-description" className={styles.dialogIntro}>
              Choose which optional cookie categories you allow. Your choice is saved on this device
              for up to 180 days. Optional tools will only use their category when configured.
            </p>
            <div className={styles.categoryList}>
              <div className={styles.categoryRow}>
                <div>
                  <strong>Necessary cookies</strong>
                  <p>Always on. Used only to remember this cookie choice.</p>
                </div>
                <span className={styles.alwaysOn}>Always on</span>
              </div>
              {categories.map((category) => (
                <label className={styles.categoryRow} key={category.key}>
                  <span className={styles.categoryCopy}>
                    <strong>{category.title}</strong>
                    <span>{category.description}</span>
                  </span>
                  <input
                    className={styles.toggle}
                    type="checkbox"
                    checked={draft[category.key]}
                    onChange={() => toggleCategory(category.key)}
                    aria-label={category.title}
                  />
                </label>
              ))}
            </div>
            <div className={styles.dialogActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => save(defaultPreferences)}
              >
                Necessary only
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => save(draft)}>
                Save preferences
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => save({ preferences: true, analytics: true, marketing: true })}
              >
                Accept all
              </button>
            </div>
          </section>
        </div>
      )}

      {(view === 'closed' || view === 'settings') && (
        <button
          className={styles.reopenButton}
          type="button"
          onClick={openSettings}
          ref={reopenButtonRef}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3.5 5.4 6v5.2c0 4.5 2.8 7.6 6.6 9.3 3.8-1.7 6.6-4.8 6.6-9.3V6L12 3.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="m9 12 2 2 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Cookie settings
        </button>
      )}
    </>
  );
}
