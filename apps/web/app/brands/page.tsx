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

export default function AllBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  return (
    <main className="brands-shell">
      <style jsx>{`
        .brands-shell {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 96px;
          isolation: isolate;
        }
        .brands-shell::before,
        .brands-shell::after {
          content: '';
          position: absolute;
          z-index: -1;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
        }
        .brands-shell::before {
          width: 560px;
          height: 560px;
          top: -220px;
          right: -180px;
          background: radial-gradient(circle, rgba(229, 35, 47, 0.26), transparent 70%);
        }
        .brands-shell::after {
          width: 620px;
          height: 620px;
          bottom: -260px;
          left: -220px;
          background: radial-gradient(circle, rgba(255, 168, 130, 0.22), transparent 70%);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(229, 35, 47, 0.16);
          color: #b91724;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .back-link:hover {
          background: rgba(229, 35, 47, 0.08);
          border-color: rgba(229, 35, 47, 0.4);
          transform: translateX(-2px);
        }

        .brands-head {
          margin-top: 32px;
          margin-bottom: 40px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          flex-wrap: wrap;
        }
        .brands-head h1 {
          margin: 0;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(36px, 5vw, 64px);
          line-height: 1;
          letter-spacing: -0.05em;
          color: #1a1a1a;
          font-weight: 800;
        }
        .brands-head h1 span {
          background: linear-gradient(120deg, #e5232f 0%, #ff7a3d 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brands-head-meta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.62);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.06);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #666;
        }
        .brands-head-meta strong {
          color: #e5232f;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0;
        }

        .brands-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .brand-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 28px 22px 22px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(22px) saturate(140%);
          -webkit-backdrop-filter: blur(22px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.9) inset,
            0 10px 30px -12px rgba(229, 35, 47, 0.15),
            0 4px 12px -6px rgba(0, 0, 0, 0.06);
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          transition:
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }
        .brand-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(229, 35, 47, 0.07), transparent 60%);
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .brand-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(229, 35, 47, 0.35);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.9) inset,
            0 24px 48px -16px rgba(229, 35, 47, 0.32),
            0 8px 20px -8px rgba(0, 0, 0, 0.08);
        }
        .brand-card:hover::before {
          opacity: 1;
        }

        .brand-logo {
          display: grid;
          place-items: center;
          height: 120px;
          padding: 6px;
          margin-bottom: 16px;
        }
        .brand-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition:
            transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            filter 0.4s ease;
          filter: grayscale(0.15);
        }
        .brand-card:hover .brand-logo img {
          transform: scale(1.06);
          filter: grayscale(0);
        }
        .brand-initials {
          display: grid;
          place-items: center;
          width: 72px;
          height: 72px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(229, 35, 47, 0.1), rgba(255, 122, 61, 0.14));
          border: 1px solid rgba(229, 35, 47, 0.18);
          color: #e5232f;
          font-family: 'Montserrat', sans-serif;
          font-size: 24px;
          font-weight: 800;
        }

        .brand-name {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .brand-name strong {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .brand-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          padding: 5px 10px 5px 12px;
          border-radius: 999px;
          background: rgba(229, 35, 47, 0.08);
          border: 1px solid rgba(229, 35, 47, 0.16);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #e5232f;
          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            transform 0.3s ease;
        }
        .brand-cta svg {
          transition: transform 0.3s ease;
        }
        .brand-card:hover .brand-cta {
          background: rgba(229, 35, 47, 0.14);
          border-color: rgba(229, 35, 47, 0.35);
          transform: translateX(1px);
        }
        .brand-card:hover .brand-cta svg {
          transform: translate(2px, -2px);
        }

        @media (max-width: 960px) {
          .brands-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
        }
        @media (max-width: 720px) {
          .brands-shell {
            padding: 20px 16px 72px;
          }
          .brands-head {
            margin-bottom: 26px;
            gap: 16px;
          }
          .brands-head-meta {
            font-size: 10px;
            padding: 8px 14px;
          }
          .brands-head-meta strong {
            font-size: 13px;
          }
          .brands-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .brand-card {
            padding: 18px 14px 14px;
            border-radius: 18px;
          }
          .brand-logo {
            height: 84px;
            margin-bottom: 10px;
          }
          .brand-initials {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            font-size: 18px;
          }
          .brand-name {
            padding-top: 12px;
            gap: 6px;
          }
          .brand-name strong {
            font-size: 11px;
          }
          .brand-cta {
            padding: 4px 8px;
            font-size: 9px;
          }
        }
        @media (max-width: 420px) {
          .brand-name {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .brand-cta {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <Link className="back-link" href="/">
        <span aria-hidden="true">←</span> Back to home
      </Link>

      <header className="brands-head">
        <h1>
          All <span>Car Brands</span>
        </h1>
        {!loading && !error && brands.length > 0 && (
          <div className="brands-head-meta">
            <strong>{brands.length}</strong>
            <span>brands · tap to explore</span>
          </div>
        )}
      </header>

      {loading && <PageLoader label="Loading all brands" />}
      {error && <div className="data-alert">{error}</div>}
      {!loading && !error && brands.length === 0 && (
        <div className="empty-state">No brands are available yet.</div>
      )}
      {!loading && !error && brands.length > 0 && (
        <section className="brands-grid" aria-label="All car brands">
          {brands.map((brand) => (
            <Link
              className="brand-card"
              href={brand.slug ? `/brands/${brand.slug}` : '/brands'}
              key={brand.id}
              aria-label={`${brand.manufacturer_name} — view available models`}
            >
              <div className="brand-logo">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={`${brand.manufacturer_name} logo`}
                    loading="lazy"
                  />
                ) : (
                  <span className="brand-initials" aria-hidden="true">
                    {brand.manufacturer_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="brand-name">
                <strong>{brand.manufacturer_name}</strong>
                <span className="brand-cta">
                  <span>Models</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 9L9 1M9 1H3M9 1V7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
