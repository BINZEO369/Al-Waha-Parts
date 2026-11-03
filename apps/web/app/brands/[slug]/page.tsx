'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { apiFetch } from '../../../../../packages/shared/src/api';
import { PartCard, type PartCardData } from '../../../components/PartCard';

type Brand = { name: string; slug: string; product_count: number };
type BrandDetail = { brand: Brand; parts: PartCardData[] };

export default function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [detail, setDetail] = useState<BrandDetail | null>(null);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    if (!apiUrl) { setError('Catalog API is not configured.'); return; }
    apiFetch<BrandDetail>(apiUrl, `/api/v1/brands/${encodeURIComponent(slug)}`)
      .then(setDetail)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Brand not found.'));
  }, [apiUrl, slug]);
  if (error) return <main className="page-shell"><div className="data-alert">{error}</div><Link className="button" href="/">Back to home</Link></main>;
  if (!detail) return <main className="page-shell"><div className="empty-state">Loading brand products…</div></main>;
  return (
    <main className="page-shell brand-detail-page">
      <Link className="back-link" href="/">← Home</Link>
      <section className="brand-detail-hero">
        <div className="brand-detail-logo" aria-hidden="true">{detail.brand.name.slice(0, 2).toUpperCase()}</div>
        <div><span className="section-kicker">Brand catalog</span><h1>{detail.brand.name}</h1><p>Browse available {detail.brand.name} products from the live Al Waha Parts inventory.</p><strong>{detail.parts.length} products available</strong></div>
      </section>
      <section className="brand-products-section"><div className="section-heading"><div><span className="section-kicker">Live inventory</span><h2>{detail.brand.name} products</h2></div></div><div className="catalog-grid">{detail.parts.map((part) => <PartCard key={part.id} part={part} />)}</div></section>
    </main>
  );
}
