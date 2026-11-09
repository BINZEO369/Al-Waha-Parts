'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../packages/shared/src/api';
import { PartCard, type PartCardData } from '../../../components/PartCard';
import { PageLoader } from '../../../components/PageLoader';
import { ProductDetailView } from '../../../components/ProductDetailView';

type Category = {
  id: string;
  category_name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
};

export type CategoryDetail = { category: Category; parts: PartCardData[] };

export default function CategoryDetailPage({ slug, initialDetail }: { slug: string; initialDetail: CategoryDetail | null }) {
  const [detail, setDetail] = useState<CategoryDetail | null>(initialDetail);
  const [showProduct, setShowProduct] = useState(false);
  const [loading, setLoading] = useState(initialDetail === null);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (initialDetail) {
      setDetail(initialDetail);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    setDetail(null);
    setShowProduct(false);
    if (!apiUrl) {
      setError('Catalog API is not configured.');
      setLoading(false);
      return () => {
        active = false;
      };
    }
    void apiFetch<CategoryDetail>(
      apiUrl,
      `/api/v1/categories/slug/${encodeURIComponent(slug)}`,
    )
      .then((category) => {
        if (active) setDetail(category);
      })
      .catch(async (categoryError: unknown) => {
        try {
          await apiFetch<unknown>(
            apiUrl,
            `/api/v1/parts/slug/${encodeURIComponent(slug)}`,
          );
          if (active) setShowProduct(true);
        } catch {
          if (active)
            setError(
              categoryError instanceof Error
                ? categoryError.message
                : 'Unable to load category details.',
            );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiUrl, slug, initialDetail]);

  if (loading) return <PageLoader label="Loading category details" />;
  if (showProduct) return <ProductDetailView slug={slug} />;
  if (error || !detail) return <main className="page-shell"><div className="data-alert">{error || 'Category not found.'}</div><Link className="button" href="/category">Back to categories</Link></main>;

  const { category, parts } = detail;
  return (
    <main className="page-shell category-detail-page">
      <style jsx>{`
        .category-detail-page :global(.category-detail-hero) { border-top: 3px solid var(--red); }
        .category-detail-page :global(.button) { display: inline-flex; align-items: center; justify-content: center; }
        .category-detail-page :global(a:focus-visible) { outline: 2px solid var(--red); outline-offset: 3px; }
      `}</style>
      <Link className="back-link" href="/category">← All categories</Link>
      <section className="category-detail-hero">
        <div className="category-detail-media">
          {category.image_url ? <img src={category.image_url} alt={category.category_name} /> : <div className="category-detail-placeholder">AWP</div>}
        </div>
        <div className="category-detail-copy">
          <span className="section-kicker">Al Waha Parts catalog</span>
          <h1>{category.category_name}</h1>
          <p>{category.description || 'Browse verified parts and find the right fit for your vehicle.'}</p>
          <div className="category-detail-stats">
            <div><small>Category</small><strong>#{String(category.sort_order ?? '').padStart(2, '0')}</strong></div>
            <div><small>Products</small><strong>{parts.length} available</strong></div>
            <div><small>Catalog</small><strong>Live inventory</strong></div>
          </div>
          <Link className="button" href={`/category?category=${encodeURIComponent(category.id)}`}>Browse all products</Link>
        </div>
      </section>
      <section className="category-products-section">
        <div className="section-heading"><div><span className="section-kicker">Live catalog matches</span><h2>Products in {category.category_name}</h2></div><span className="vehicle-products-count">{parts.length} products</span></div>
        {parts.length ? <div className="catalog-grid">{parts.map((part) => <PartCard key={part.id} part={part} />)}</div> : <div className="empty-state"><strong>No products are published in this category yet.</strong><span>New inventory will appear here automatically when added to the catalog.</span></div>}
      </section>
    </main>
  );
}
