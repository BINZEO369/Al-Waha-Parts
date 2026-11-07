'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../packages/shared/src/api';
import { PageLoader } from '../../components/PageLoader';

type Brand = {
  id: string;
  manufacturer_name: string;
  slug?: string | null;
  logo_url?: string | null;
};

const GUIDE_COOKIE = 'all_brands_guide_seen';
const GUIDE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/* ---- tiny cookie helpers ---- */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` +
    `path=/; max-age=${maxAgeSeconds}; ` +
    `SameSite=Lax` +
    (window.location.protocol === 'https:' ? '; Secure' : '');
}

export default function AllBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError('Brand API is not configured.');
      setLoading(false);
      return;
    }

    apiFetch<Brand[]>(apiUrl, '/api/v1/car-brands')
      .then((items) => setBrands(Array.isArray(items) ? items : []))
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load brands.'),
      )
      .finally(() => setLoading(false));
  }, [apiUrl]);

  /* Show guide on first visit (cookie-based) */
  useEffect(() => {
    if (getCookie(GUIDE_COOKIE)) return;
    const t = setTimeout(() => setShowGuide(true), 700);
    return () => clearTimeout(t);
  }, []);

  /* Auto-dismiss after 7 seconds */
  useEffect(() => {
    if (!showGuide) return;
    const t = setTimeout(() => {
      setShowGuide(false);
      setCookie(GUIDE_COOKIE, '1', GUIDE_COOKIE_MAX_AGE);
    }, 7000);
    return () => clearTimeout(t);
  }, [showGuide]);

  const dismissGuide = () => {
    setShowGuide(false);
    setCookie(GUIDE_COOKIE, '1', GUIDE_COOKIE_MAX_AGE);
  };

  return (
    <main className="page-shell all-brands-page">
      <style jsx>{`
        .all-brands-page {
          max-width: 1240px;
          padding: 60px 20px;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        /* Header */
        .header-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .header-section h1 {
          margin: 0;
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .brand-count {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        /* Grid */
        .all-brands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }

        /* Card */
        .all-brand-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #eaeaea;
          padding: 24px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .all-brand-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
          border-color: #d0d0d0;
        }

        /* Logo container */
        .all-brand-logo {
          display: flex;
          width: 100%;
          height: 110px;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .all-brand-logo img {
          box-sizing: border-box;
          max-width: 90%;
          max-height: 80px;
          object-fit: contain;
          padding: 6px;
          border: 1px solid #ff0000;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }

        .all-brand-card:hover .all-brand-logo img {
          transform: scale(1.08);
        }

        .all-brand-initials {
          display: grid;
          width: 64px;
          height: 64px;
          place-items: center;
          background: #f1f3f5;
          border-radius: 50%;
          color: #333;
          font-family: 'Montserrat', sans-serif;
          font-size: 20px;
          font-weight: 700;
        }

        /* Brand name */
        .brand-info {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: auto;
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
          text-align: center;
        }

        .brand-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #222;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* ===== Premium guide toast ===== */
        .guide-toast {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px 14px 14px;
          background: linear-gradient(135deg, #141414 0%, #242424 100%);
          color: #fff;
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.06) inset;
          max-width: 400px;
          animation: guideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes guideIn {
          from {
            opacity: 0;
            transform: translate(-50%, 26px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        /* Click icon */
        .guide-icon {
          position: relative;
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 43, 43, 0.12);
          border: 1px solid rgba(255, 43, 43, 0.35);
          flex-shrink: 0;
          color: #ff4d4d;
        }

        /* Ripple rings around icon */
        .guide-icon::before,
        .guide-icon::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          border: 1px solid rgba(255, 77, 77, 0.55);
          animation: guideRipple 2s ease-out infinite;
          pointer-events: none;
        }

        .guide-icon::after {
          animation-delay: 1s;
        }

        @keyframes guideRipple {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.55);
            opacity: 0;
          }
        }

        .guide-icon svg {
          width: 22px;
          height: 22px;
          animation: cursorTap 1.6s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes cursorTap {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(0.9) rotate(-4deg);
          }
        }

        .guide-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
          line-height: 1.35;
          min-width: 0;
        }

        .guide-text strong {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #fff;
        }

        .guide-text span {
          font-size: 12.5px;
          color: #c9c9c9;
        }

        .guide-close {
          background: transparent;
          border: none;
          color: #7d7d7d;
          font-size: 20px;
          line-height: 1;
          padding: 4px 6px;
          cursor: pointer;
          transition: color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }

        .guide-close:hover {
          color: #fff;
          transform: scale(1.1);
        }

        /* Responsive */
        @media (max-width: 600px) {
          .all-brands-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .all-brand-card {
            padding: 16px;
            border-radius: 12px;
          }
          .all-brand-logo {
            height: 80px;
            margin-bottom: 12px;
          }
          .brand-name {
            font-size: 13px;
          }
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .guide-toast {
            left: 16px;
            right: 16px;
            bottom: 16px;
            transform: none;
            max-width: none;
            animation: guideInMobile 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          @keyframes guideInMobile {
            from {
              opacity: 0;
              transform: translateY(26px) scale(0.94);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        }
      `}</style>

      <header className="header-section">
        <h1>Explore Our Premium Brands</h1>
        {!loading && !error && (
          <span className="brand-count">{brands.length} Brands Available</span>
        )}
      </header>

      {loading && <PageLoader label="Loading brands..." />}

      {error && (
        <p style={{ color: '#888', padding: '20px', textAlign: 'center' }}>{error}</p>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'center', color: '#666' }}>
          No brands are available yet.
        </div>
      )}

      {!loading && !error && brands.length > 0 && (
        <section className="all-brands-grid" aria-label="All car brands">
          {brands.map((brand) => (
            <Link
              className="all-brand-card"
              href={brand.slug ? `/brands/${brand.slug}` : '/brands'}
              key={brand.id}
            >
              <div className="all-brand-logo">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={`${brand.manufacturer_name} logo`}
                    loading="lazy"
                  />
                ) : (
                  <span className="all-brand-initials" aria-hidden="true">
                    {brand.manufacturer_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="brand-info">
                <span className="brand-name">{brand.manufacturer_name}</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* ===== First-visit guide toast ===== */}
      {showGuide && (
        <div className="guide-toast" role="status" aria-live="polite">
          <div className="guide-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 4.1 12 6" />
              <path d="m5.1 8-2.9-.8" />
              <path d="m6 12-1.9 2" />
              <path d="M7.2 2.2 8 5.1" />
              <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
            </svg>
          </div>
          <div className="guide-text">
            <strong>Quick Tip</strong>
            <span>Click any brand logo to explore all of its models.</span>
          </div>
          <button
            type="button"
            className="guide-close"
            onClick={dismissGuide}
            aria-label="Dismiss guide"
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
