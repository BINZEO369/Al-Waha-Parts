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

        /* টেক্সট এবং প্রিমিয়াম বাটন */
        .brand-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
          gap: 10px;
        }

        .brand-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #222;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        /* নতুন প্রিমিয়াম বাটন ডিজাইন */
        .view-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #555;
          background-color: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 50px; /* পিল শেইপ */
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .view-btn svg {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }

        /* কার্ডে হোভার করলে বাটন কালো হয়ে যাবে */
        .all-brand-card:hover .view-btn {
          background-color: #111;
          color: #fff;
          border-color: #111;
        }

        .all-brand-card:hover .view-btn svg {
          transform: translateX(3px);
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
          .view-btn {
            padding: 6px 10px;
          }
          .view-btn span {
            display: none; /* মোবাইলে লেখা লুকিয়ে শুধু অ্যারো দেখাবে */
          }
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
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
                {/* প্রিমিয়াম ভিউ বাটন */}
                <div className="view-btn">
                  <span>Models</span>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
