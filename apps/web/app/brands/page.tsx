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
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .brand-count {
          color: #666;
          font-size: 14px;
          font-weight: 600;
          background: #fff;
          padding: 6px 16px;
          border-radius: 50px;
          border: 1px solid #eaeaea;
        }

        /* গ্রিড লেআউট */
        .all-brands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        /* কার্ড ডিজাইন */
        .all-brand-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #eaeaea;
          padding: 28px 24px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }

        /* হোভার ইফেক্ট (Liquid feel) */
        .all-brand-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border-color: #d0d0d0;
        }

        /* লোগো কন্টেইনার */
        .all-brand-logo {
          display: flex;
          width: 100%;
          height: 110px;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .all-brand-logo img {
          max-width: 85%;
          max-height: 75px;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        /* হোভার করলে লোগো হালকা বড় হবে */
        .all-brand-card:hover .all-brand-logo img {
          transform: scale(1.08);
        }

        .all-brand-initials {
          display: grid;
          width: 70px;
          height: 70px;
          place-items: center;
          background: #f1f3f5;
          border-radius: 50%;
          color: #333;
          font-family: 'Montserrat', sans-serif;
          font-size: 22px;
          font-weight: 800;
        }

        /* টেক্সট এবং প্রিমিয়াম বাটন কন্টেইনার */
        .brand-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 20px;
        }

        .brand-text-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          padding-right: 15px;
        }

        .brand-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.02em;
        }

        /* সাব-টেক্সট যা ইউজারকে ক্লিক করতে উৎসাহিত করবে */
        .brand-subtext {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #888;
          transition: color 0.3s ease;
        }

        .all-brand-card:hover .brand-subtext {
          color: #111;
        }

        /* নতুন প্রিমিয়াম মিনিমাল বাটন (সার্কুলার অ্যারো) */
        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #f4f5f7;
          border: none;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          flex-shrink: 0;
        }

        .view-btn svg {
          width: 18px;
          height: 18px;
          stroke: #111;
          stroke-width: 2.5;
          transition: all 0.3s ease;
        }

        /* কার্ডে হোভার করলে বাটন কালো হয়ে যাবে */
        .all-brand-card:hover .view-btn {
          background-color: #111;
        }

        .all-brand-card:hover .view-btn svg {
          stroke: #fff;
          transform: translateX(2px);
        }

        /* মোবাইল রেসপন্সিভ */
        @media (max-width: 600px) {
          .all-brands-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .all-brand-card {
            padding: 16px;
            border-radius: 16px;
          }
          .all-brand-logo {
            height: 80px;
            margin-bottom: 16px;
          }
          .brand-name {
            font-size: 14px;
          }
          .brand-subtext {
            display: none; /* মোবাইলে সাব-টেক্সট লুকিয়ে থাকবে */
          }
          .view-btn {
            width: 34px;
            height: 34px;
          }
          .view-btn svg {
            width: 16px;
            height: 16px;
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
              
              <div className="brand-info">
                <div className="brand-text-wrapper">
                  <span className="brand-name">{brand.manufacturer_name}</span>
                  <span className="brand-subtext">Explore Models</span>
                </div>
                
                {/* প্রিমিয়াম সার্কুলার অ্যারো বাটন */}
                <div className="view-btn">
                  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
