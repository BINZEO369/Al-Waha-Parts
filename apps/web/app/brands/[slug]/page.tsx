import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BrandClientView, { type BrandDetail } from './ClientView';
import { canonicalUrl, cleanMetaText, fetchPublicData } from '../../../lib/public-seo';

type PageProps = { params: Promise<{ slug: string }> };

function brandPath(slug: string) {
  return `/api/v1/car-brands/slug/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await fetchPublicData<BrandDetail>(brandPath(slug));
  const brandName = detail?.brand?.manufacturer_name || slug.replace(/-/g, ' ');
  const canonical = canonicalUrl(`/brands/${encodeURIComponent(detail?.brand?.slug || slug)}`);
  const description = `Browse ${brandName} vehicle models listed in the Al Waha Parts catalog for Al Jubail, Saudi Arabia.`;

  return {
    title: `${brandName} Models`,
    description: cleanMetaText(description),
    alternates: { canonical },
    ...(detail === null ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: `${brandName} Models | Al Waha Parts`, description, url: canonical },
    twitter: { card: 'summary', title: `${brandName} Models | Al Waha Parts`, description },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await fetchPublicData<BrandDetail>(brandPath(slug));
  if (detail === null) notFound();
  return <BrandClientView key={slug} slug={slug} initialDetail={detail ?? null} />;
}
