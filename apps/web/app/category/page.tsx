'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../packages/shared/src/api';
import { PageLoader } from '../../components/PageLoader';

type Category = {
  id: string;
  category_name: string;
  slug?: string | null;
  image_url?: string | null;
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError('Catalog API is not configured.');
      setLoading(false);
      return;
    }
    apiFetch<Category[]>(apiUrl, '/api/v1/categories')
      .then((items) => setCategories(Array.isArray(items) ? items : []))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load categories.'))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  return (
    <main className="page-shell category-directory-page">
      <section className="category-start-section category-directory-section" aria-labelledby="category-directory-title">
        <div className="category-start-heading">
          <h1 id="category-directory-title">Start from a category</h1>
          <span className="category-count">{categories.length} categories</span>
        </div>
        {loading && <PageLoader label="Loading categories" />}
        {error && <div className="data-alert">{error}</div>}
        {!loading && !error && categories.length === 0 && <div className="empty-state">No categories are available yet.</div>}
        {!loading && !error && categories.length > 0 && (
          <div className="category-start-grid">
            {categories.map((category) => (
              <Link className="category-start-card" href={category.slug ? `/category/${category.slug}` : '/category'} key={category.id}>
                <div className="category-start-image">
                  {category.image_url ? <img src={category.image_url} alt="" /> : <span aria-hidden="true">⌁</span>}
                </div>
                <strong>{category.category_name.trim()}</strong>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
