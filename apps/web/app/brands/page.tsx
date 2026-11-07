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
          padding: 60px 20px;
          background-color: #f8f9fa;
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
          background: #fff;
          padding: 6px 14px;
          border-radius: 50px;
          border: 1px solid #eaeaea;
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
          align-items: center; /* সব কিছু মাঝখানে আনার জন্য */
          text-align: center;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #eaeaea;
          padding: 32px 24px 24px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          position: relative;
          overflow: hidden;
        }

        /* লিকুইড হোভার ইফেক্ট */
        .all-brand-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border-color: #d0d0d0;
        }

        /* লোগো কন্টেইনার */
        .all-brand-logo {
          display: flex;
          width: 100%;
          height: 100px;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .all-brand-logo img {
          max-width: 85%;
          max-height: 75px;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* স্প্রিং অ্যানিমেশন */
        }

        /* হোভার করলে লোগো হালকা বড় হবে */
        .all-brand-card:hover .all-brand-logo img {
          transform: scale(1.1);
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

        /* ব্র্যান্ডের নাম */
        .brand-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #111;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        /* নতুন আল্ট্রা-প্রিমিয়াম বাটন */
        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #333;
          background-color: #f8f9fa;
          border: 1px solid #eaeaea;
          border-radius: 50px;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          margin-top: auto;
        }

        .view-btn svg {
          width: 16px;
          height: 16px;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* কার্ডে হোভার করলে বাটন কালো হয়ে যাবে */
        .all-brand-card:hover .view-btn {
          background-color: #111;
          color: #ffffff;
          border-color: #111;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .all-brand-card:hover .view-btn svg {
          transform: translateX(4px);
        }

        /* মোবাইল রেসপন্সিভ */
        @media (max-width: 600px) {
          .all-brands-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .all-brand-card {
            padding: 20px 12px 12px;
            border-radius: 16px;
          }
          .all-brand-logo {
            height: 70px;
            margin-bottom: 16px;
          }
          .brand-name {
            font-size: 12px;
            margin-bottom: 12px;
          }
          .view-btn {
            padding: 10px 12px;
            font-size: 11px;
          }
          .view-btn span {
            display: none; /* মোবাইলে লেখা লুকিয়ে শুধু অ্যারো দেখাবে */
          }
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
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
              
              <span className="brand-name">{brand.manufacturer_name}</span>
              
              <div className="view-btn">
                <span>Explore Models</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
