'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../packages/shared/src/api';

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
        .all-brands-page { max-width: 1240px; }
        .all-brands-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 34px;
        }
        .all-brands-heading h1 {
          margin: 8px 0 12px;
          color: #202124;
          font-family: 'Montserrat';
          font-size: clamp(34px, 5vw, 58px);
          line-height: .98;
          letter-spacing: -.06em;
        }
        .all-brands-heading p {
          max-width: 570px;
          margin: 0;
          color: #777;
          font-size: 13px;
          line-height: 1.7;
        }
        .all-brands-count {
          flex: 0 0 auto;
          padding: 11px 15px;
          border: 1px solid var(--red);
          color: var(--red);
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }
        .all-brands-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .all-brand-card {
          display: grid;
          min-height: 190px;
          padding: 22px 18px 18px;
          border: 1px solid #ededed;
          border-top: 3px solid var(--red);
          background: #fff;
          color: #202124;
          text-decoration: none;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .all-brand-card:hover {
          transform: translateY(-4px);
          border-color: var(--red);
          box-shadow: 0 14px 28px rgba(229, 35, 47, .12);
        }
        .all-brand-logo {
          display: grid;
          width: 100%;
          height: 105px;
          place-items: center;
          padding: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .all-brand-logo img {
          width: 100%;
          height: 76px;
          object-fit: contain;
        }
        .all-brand-initials {
          display: grid;
          width: 68px;
          height: 68px;
          place-items: center;
          border: 1px solid #f2b9bd;
          border-radius: 50%;
          color: var(--red);
          font-family: 'Montserrat';
          font-size: 22px;
          font-weight: 800;
        }
        .all-brand-copy {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 15px;
        }
        .all-brand-copy strong {
          font-family: 'Montserrat';
          font-size: 15px;
          letter-spacing: .02em;
          text-transform: uppercase;
        }
        .all-brand-copy span {
          color: var(--red);
          font-size: 20px;
          line-height: 1;
        }
        @media (max-width: 760px) {
          .all-brands-heading { align-items: start; flex-direction: column; }
          .all-brands-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .all-brand-card { min-height: 164px; padding: 14px 11px 12px; }
          .all-brand-logo { height: 90px; }
          .all-brand-logo img { height: 60px; }
          .all-brand-copy { padding-top: 11px; }
          .all-brand-copy strong { font-size: 11px; }
        }
      `}</style>

      <Link className="back-link" href="/">
        ← Home
      </Link>
      <header className="all-brands-heading">
        <div>
          <span className="eyebrow">Live database directory</span>
          <h1>All car brands</h1>
          <p>
            Browse every active automotive brand in the Al Waha Parts database and open its
            compatible vehicle models.
          </p>
        </div>
        {!loading && !error && <span className="all-brands-count">{brands.length} brands</span>}
      </header>

      {loading && <div className="empty-state">Loading all brands from the database…</div>}
      {error && <div className="data-alert">{error}</div>}
      {!loading && !error && brands.length === 0 && (
        <div className="empty-state">No active brands are available yet.</div>
      )}
      {!loading && !error && brands.length > 0 && (
        <section className="all-brands-grid" aria-label="All car brands">
          {brands.map((brand) => (
            <Link
              className="all-brand-card"
              href={brand.slug ? `/car-brands/${brand.slug}` : '/vehicles'}
              key={brand.id}
            >
              <div className="all-brand-logo">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={`${brand.manufacturer_name} logo`} loading="lazy" />
                ) : (
                  <span className="all-brand-initials" aria-hidden="true">
                    {brand.manufacturer_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="all-brand-copy">
                <strong>{brand.manufacturer_name}</strong>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
