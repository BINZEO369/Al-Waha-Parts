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

const GUIDE_KEY = 'all-brands-guide-seen';

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

  /* প্রথম ভিজিটে গাইডলাইন দেখানো */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(GUIDE_KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setShowGuide(true), 700);
    return () => clearTimeout(t);
  }, []);

  /* গাইডলাইন ৭ সেকেন্ড পরে নিজে থেকে বন্ধ হবে */
  useEffect(() => {
    if (!showGuide) return;
    const t = setTimeout(() => {
      setShowGuide(false);
      try {
        localStorage.setItem(GUIDE_KEY, '1');
      } catch {}
    }, 7000);
    return () => clearTimeout(t);
  }, [showGuide]);

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      localStorage.setItem(GUIDE_KEY, '1');
    } catch {}
  };

  return (
    <main className="page-shell all-brands-page">
      <style jsx>{`
        .all-brands-page {
          max-width: 1240px;
          padding: 60px 20px;
          background-color: #f8f9fa; /* হালকা মেটে ব্যাকগ্রাউন্ড */
          min-height: 100vh;
        }
        
        /* হেডার স্টাইল */
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

        /* গ্রিড লেআউট */
        .all-brands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }

        /* কার্ড ডিজাইন */
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

        /* হোভার ইফেক্ট (Liquid feel) */
        .all-brand-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
          border-color: #d0d0d0;
        }

        /* লোগো কন্টেইনার */
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
          border: 1px solid #ff0000; /* চিকন লাল বর্ডার (বক্স) */
          border-radius: 8px;
          transition: transform 0.3s ease;
        }

        /* হোভার করলে লোগো হালকা বড় হবে */
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

        /* ব্র্যান্ডের নাম — মাঝখানে, নিচে */
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

        /* ===== প্রিমিয়াম গাইড টোস্ট ===== */
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
          max-width: 380px;
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

        .guide-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ff2b2b;
          flex-shrink: 0;
          color: #fff;
          animation: guidePulse 1.8s ease-in-out infinite;
        }

        @keyframes guidePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 43, 43, 0.5);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(255, 43, 43, 0);
          }
        }

        .guide-icon svg {
          width: 20px;
          height: 20px;
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

        /* মোবাইল রেসপন্সিভ */
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
      
      {/* এরর চিন্হ সরিয়ে সাধারণ টেক্সট করা হয়েছে */}
      {error && <p style={{ color: '#888', padding: '20px', textAlign: 'center' }}>{error}</p>}
      
      {!loading && !error && brands.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'center', color: '#666' }}>No brands are available yet.</div>
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

      {/* ===== প্রথম ভিজিটের প্রিমিয়াম গাইড টোস্ট ===== */}
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
              <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" />
              <path d="M11 12V4.5a1.5 1.5 0 0 1 3 0V12" />
              <path d="M14 12V6.5a1.5 1.5 0 0 1 3 0V13" />
              <path d="M17 13v-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-4.24-1.76L4 16.24a1.5 1.5 0 0 1 2.12-2.12L8 16" />
            </svg>
          </div>
          <div className="guide-text">
            <strong>Quick Tip</strong>
            <span>কোনো ব্র্যান্ডের লোগোতে ক্লিক করুন, তাদের সব মডেল ওপেন হবে।</span>
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
