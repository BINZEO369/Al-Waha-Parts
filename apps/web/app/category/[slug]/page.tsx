import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import CategoryClientView, { type CategoryDetail } from './ClientView';
import type { Product } from '../../../components/ProductDetailView';
import { canonicalUrl, cleanMetaText, fetchPublicData } from '../../../lib/public-seo';

type PageProps = { params: Promise<{ slug: string }> };

function categoryPath(slug: string) {
  return `/api/v1/categories/slug/${encodeURIComponent(slug)}`;
}

function productPath(slug: string) {
  return `/api/v1/parts/slug/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await fetchPublicData<CategoryDetail>(categoryPath(slug));
  const categoryName = detail?.category?.category_name || slug.replace(/-/g, ' ');
  const description = cleanMetaText(detail?.category?.description) ||
    `Browse ${categoryName} car parts in the Al Waha Parts catalog for Al Jubail, Saudi Arabia.`;
  const canonical = canonicalUrl(`/category/${encodeURIComponent(detail?.category?.slug || slug)}`);

  return {
    title: `${categoryName} Car Parts`,
    description,
    alternates: { canonical },
    ...(detail === null ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: `${categoryName} Car Parts | Al Waha Parts`, description, url: canonical },
    twitter: { card: 'summary', title: `${categoryName} Car Parts | Al Waha Parts`, description },
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await fetchPublicData<CategoryDetail>(categoryPath(slug));
  if (detail === null) {
    const legacyProduct = await fetchPublicData<Product>(productPath(slug));
    if (legacyProduct) {
      const canonicalSlug = legacyProduct.slug || legacyProduct.id || slug;
      redirect(`/products/${encodeURIComponent(canonicalSlug)}`);
    }
    if (legacyProduct === null) notFound();
  }

  return <CategoryClientView key={slug} slug={slug} initialDetail={detail ?? null} />;
}
