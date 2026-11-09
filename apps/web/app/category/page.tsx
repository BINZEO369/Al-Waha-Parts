import Link from 'next/link';
import type { Metadata } from 'next';
import { canonicalUrl, fetchPublicData } from '../../lib/public-seo';

export const dynamic = 'force-dynamic';

type Category = {
  id: string;
  category_name: string;
  slug?: string | null;
  description?: string | null;
  image_url?: string | null;
};

export const metadata: Metadata = {
  title: 'Car Parts Catalog in Al Jubail',
  description: 'Browse the Al Waha Parts catalog by automotive category and find parts for your vehicle in Al Jubail, Saudi Arabia.',
  alternates: { canonical: '/category' },
  openGraph: {
    title: 'Car Parts Catalog in Al Jubail | Al Waha Parts',
    description: 'Browse automotive categories and find car parts for your vehicle in Al Jubail, Saudi Arabia.',
    url: canonicalUrl('/category'),
  },
};

export default async function CategoryPage() {
  const categories = await fetchPublicData<Category[]>('/api/v1/categories').catch(() => undefined);
  const items = Array.isArray(categories) ? categories : [];

  return (
    <main className="page-shell category-directory-page">
      <section className="category-start-section category-directory-section" aria-labelledby="category-directory-title">
        <div className="category-start-heading">
          <h1 id="category-directory-title">Car parts by category</h1>
          <span className="category-count">{items.length} categories</span>
        </div>
        {items.length > 0 ? (
          <div className="category-start-grid">
            {items.map((category) => (
              <Link className="category-start-card" href={category.slug ? `/category/${encodeURIComponent(category.slug)}` : '/category'} key={category.id}>
                <div className="category-start-image">
                  {category.image_url ? <img src={category.image_url} alt="" loading="lazy" /> : <span aria-hidden="true">⌁</span>}
                </div>
                <strong>{category.category_name.trim()}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">Browse the catalog by category. Live categories will appear here when the catalog service is available.</div>
        )}
      </section>
    </main>
  );
}
