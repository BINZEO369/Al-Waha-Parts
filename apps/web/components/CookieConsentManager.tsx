'use client';

import { useEffect, useState } from 'react';
import styles from './CookieConsent.module.css';
import { readCookiePreferences, saveCookiePreferences } from '../lib/cookie-consent';

export function CookieConsentManager() {
  const [visible, setVisible] = useState(false);
  const [hasChoice, setHasChoice] = useState(false);

  useEffect(() => {
    const stored = readCookiePreferences();
    setHasChoice(Boolean(stored));
    setVisible(!stored);
  }, []);

  function choose(allowAnalytics: boolean) {
    saveCookiePreferences({
      preferences: false,
      analytics: allowAnalytics,
      marketing: false,
    });
    setHasChoice(true);
    setVisible(false);
  }

  return (
    <>
      {visible && (
        <div className={styles.noticePosition}>
          <section className={styles.notice} aria-labelledby="cookie-notice-title">
            <div className={styles.noticeCopy}>
              <span className={styles.eyebrow}>Your privacy choices</span>
              <h2 id="cookie-notice-title">Help us improve Al Waha Parts</h2>
              <p>
                Allow analytics to save your request IP, visited page paths, visit duration,
                browser/device category and model when available, screen size, and approximate
                country or city. We do not save precise location, form entries, or page query strings.
              </p>
              <p className={styles.note}>
                Reject to keep analytics off. Essential storefront features continue either way.
              </p>
            </div>
            <div className={styles.noticeActions}>
              <button className={styles.secondaryButton} type="button" onClick={() => choose(false)}>
                Reject
              </button>
              <button className={styles.primaryButton} type="button" onClick={() => choose(true)}>
                Allow
              </button>
            </div>
          </section>
        </div>
      )}
      {!visible && hasChoice && (
        <button
          className={styles.reopenButton}
          type="button"
          onClick={() => setVisible(true)}
          aria-label="Change analytics consent"
        >
          Privacy choices
        </button>
      )}
    </>
  );
}
