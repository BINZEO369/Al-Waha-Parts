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
    <main className="page-shell all-brands-page">
      <style jsx>{`
        .all-brands-page {
          max-width: 1240px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .all-brands-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 40px;
        }
        .all-brands-heading h1 {
          margin: 0;
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .all-brands-count {
          padding: 8px 16px;
          background: #f8f9fa;
          border: 1px solid #eee;
          border-radius: 30px;
          color: #555;
          font-size: 13px;
          font-weight: 600;
        }
        .all-brands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }
        
        /* Premium Liquid Card Design */
        .all-brand-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px 32px;
          background: #ffffff;
          border: 1px solid #f0f0f0;
          border-radius: 20px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          overflow: hidden;
        }

        .all-brand-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
          border-color: transparent;
        }

        .all-brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100px;
          margin-bottom: 20px;
        }

        .all-brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(100%) opacity(0.7);
          transition: all 0.3s ease;
        }

        /* Hover state brings logo back to full color */
        .all-brand-card:hover .all-brand-logo img {
          filter: grayscale(0%) opacity(1);
          transform: scale(1.05);
        }

        .all-brand-initials {
          display: grid;
          width: 80px;
          height: 80px;
          place-items: center;
          background: #f5f5f5;
          border-radius: 50%;
          color: #333;
          font-family: 'Montserrat', sans-serif;
          font-size: 24px;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .all-brand-card:hover .all-brand-initials {
          background: #000;
          color: #fff;
        }

        .all-brand-copy {
          text-align: center;
          width: 100%;
        }

        .all-brand-copy strong {
          display: block;
          margin-bottom: 8px;
          color: #111;
          font-family: 'Montserrat', sans-serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        /* Clear indication that clicking opens models */
        .view-models {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #888;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .view-models span {
          transition: transform 0.3s ease;
        }

        .all-brand-card:hover .view-models {
          color: #e5232f; /* Your theme red color */
        }

        .all-brand-card:hover .view-models span {
          transform: translateX(4px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .all-brands-heading {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
          }
          .all-brands-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
          .all-brand-card {
            padding: 24px 16px;
            border-radius: 16px;
          }
          .all-brand-logo {
            height: 70px;
            margin-bottom: 16px;
          }
          .all-brand-copy strong {
            font-size: 13px;
          }
          .view-models {
            font-size: 11px;
          }
        }
      `}</style>

      <header className="all-brands-heading">
        <h1>Explore Our Premium Brands</h1>
        {!loading && !error && <span className="all-brands-count">{brands.length} Brands</span>}
      </header>

      {loading && <PageLoader label="Loading brands..." />}
      
      {error && <div className="data-alert">{error}</div>}
      
      {!loading && !error && brands.length === 0 && (
        <div className="empty-state">No active brands are available yet.</div>
      )}
      
      {!loading && !error && brands.length > 0 && (
        <section className="all-brands-grid" aria-label="All car brands">
          {brands.map((brand) => (
            <Link
              className="all-brand-card"
              href={brand.slug ? `/brands/${brand.slug}` : '/brands'}
              key={brand.id}
              title={`View ${brand.manufacturer_name} models`}
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
              <div className="all-brand-copy">
                <strong>{brand.manufacturer_name}</strong>
                <div className="view-models">
                  View Models <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
